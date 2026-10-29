/**
 * Bubbles & Brew — Google Workspace backend
 *
 * Public customer writes go through doPost(). Operational data is stored in
 * Google Sheets and supporting folders are created in Google Drive.
 *
 * SECURITY MODEL
 * - Public endpoint: create booking + read public service catalogue + health.
 * - Customer PII is NOT exposed through a public bookings GET endpoint.
 * - Staff should use the Google Sheet as the authoritative operations view.
 * - A future authenticated staff web app can safely sit on top of the same sheet.
 */

const APP = {
  name: 'Bubbles & Brew',
  timezone: 'Africa/Kampala',
  rootFolder: 'Bubbles & Brew',
  spreadsheet: 'Bubbles & Brew Operations',
  services: [
    ['basic-wash', 'Basic Wash', 15000, true, 10],
    ['full-wash', 'Full Wash', 25000, true, 20],
    ['premium-care', 'Premium Care', 45000, true, 30]
  ],
  headers: {
    Bookings: ['Booking Number','Created At','Date','Time','Customer Name','Phone','Vehicle','Registration','Vehicle Type','Service','Service ID','Amount UGX','Status','Payment Status','Notes','Updated At'],
    Customers: ['Customer ID','Created At','Full Name','Phone','Email','Last Booking'],
    Vehicles: ['Vehicle ID','Customer ID','Registration','Vehicle','Vehicle Type','Created At'],
    Services: ['Service ID','Service Name','Price UGX','Active','Sort Order'],
    Payments: ['Booking Number','Created At','Amount UGX','Method','Status','Reference','Notes'],
    AuditLog: ['Timestamp','Action','Booking Number','Actor','Details']
  }
};

function doGet(e) {
  const action = String(e?.parameter?.action || 'health').toLowerCase();

  if (action === 'services') return json_(publicServices_());
  if (action === 'health') return json_(health_());

  // Deliberately no public bookings endpoint. Booking rows contain customer PII.
  return json_({ success: false, error: 'Unsupported public action.' });
}

function doPost(e) {
  try {
    const payload = parsePost_(e);
    const action = String(payload.action || 'createBooking').toLowerCase();

    if (action === 'createbooking') return json_(createBooking_(payload));
    if (action === 'createwalkin') return json_(createBooking_(payload, 'checked_in'));
    if (action === 'updatestatus') return json_(updateStatus_(payload));

    return json_({ success: false, error: 'Unsupported action.' });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ success: false, error: err.message || 'Request failed.' });
  }
}

/** Run this ONCE from the Apps Script editor before deployment. */
function setupBubblesAndBrew() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty('SPREADSHEET_ID');
  let ss;

  if (spreadsheetId) {
    try { ss = SpreadsheetApp.openById(spreadsheetId); } catch (_) { spreadsheetId = ''; }
  }

  if (!spreadsheetId) {
    ss = SpreadsheetApp.create(APP.spreadsheet);
    spreadsheetId = ss.getId();
    props.setProperty('SPREADSHEET_ID', spreadsheetId);
  }

  const root = getOrCreateFolder_(APP.rootFolder);
  ['Bookings','Customers','Reports','Exports','Marketing'].forEach(name => getOrCreateFolder_(name, root));
  props.setProperty('ROOT_FOLDER_ID', root.getId());
  props.setProperty('SPREADSHEET_URL', ss.getUrl());

  Object.keys(APP.headers).forEach(name => ensureSheet_(ss, name, APP.headers[name]));
  seedServices_(ss);

  const bookings = ss.getSheetByName('Bookings');
  if (bookings) {
    bookings.setFrozenRows(1);
    bookings.getRange(1, 1, 1, APP.headers.Bookings.length).setFontWeight('bold');
    bookings.autoResizeColumns(1, APP.headers.Bookings.length);
  }

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl: ss.getUrl(),
    rootFolderId: root.getId(),
    rootFolderUrl: root.getUrl()
  };
}

function health_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  if (!id) return { success: true, ready: false, message: 'Run setupBubblesAndBrew() once in the Apps Script editor.' };
  try {
    const ss = SpreadsheetApp.openById(id);
    return { success: true, ready: true, name: ss.getName(), spreadsheetUrl: ss.getUrl() };
  } catch (err) {
    return { success: false, ready: false, error: 'Operations spreadsheet is not accessible.' };
  }
}

function publicServices_() {
  return {
    success: true,
    services: APP.services.filter(row => row[3]).map(row => ({
      id: row[0], name: row[1], price_ugx: row[2], sortOrder: row[4]
    }))
  };
}

function createBooking_(p, forcedStatus) {
  validateBooking_(p);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = getSpreadsheet_();
    const bookings = ss.getSheetByName('Bookings');
    const customers = ss.getSheetByName('Customers');
    const vehicles = ss.getSheetByName('Vehicles');
    const service = serviceById_(p.serviceId, p.service);
    if (!service) throw new Error('Selected service is not available.');

    const date = String(p.date);
    const time = String(p.time);
    const registration = String(p.registration || '').trim().toUpperCase();

    const rows = bookings.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowDate = formatDateCell_(row[2]);
      const rowTime = formatTimeCell_(row[3]);
      const rowReg = String(row[7] || '').trim().toUpperCase();
      const rowStatus = String(row[12] || '').toLowerCase();
      if (rowDate === date && rowTime === time && rowReg === registration && !['cancelled','no_show','completed'].includes(rowStatus)) {
        throw new Error('This vehicle already has a booking at that time.');
      }
    }

    const bookingNumber = nextBookingNumber_(bookings, date);
    const createdAt = new Date();
    const status = forcedStatus || 'requested';
    const amount = Number(service.price);

    bookings.appendRow([
      bookingNumber, createdAt, date, time, String(p.name).trim(), cleanPhone_(p.phone),
      String(p.vehicle).trim(), registration, String(p.vehicleType || 'other'),
      service.name, service.id, amount, status, 'unpaid', String(p.notes || ''), createdAt
    ]);

    const customerId = 'CUS-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    customers.appendRow([customerId, createdAt, String(p.name).trim(), cleanPhone_(p.phone), String(p.email || ''), bookingNumber]);

    const vehicleId = 'VEH-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    vehicles.appendRow([vehicleId, customerId, registration, String(p.vehicle).trim(), String(p.vehicleType || 'other'), createdAt]);

    ss.getSheetByName('AuditLog').appendRow([
      createdAt, status === 'requested' ? 'CREATE_BOOKING' : 'CREATE_WALKIN', bookingNumber,
      'Public booking form', JSON.stringify({ service: service.name, date, time })
    ]);

    return {
      success: true,
      bookingNumber,
      status,
      quotedAmountUgx: amount,
      spreadsheetUrl: ss.getUrl()
    };
  } finally {
    lock.releaseLock();
  }
}

function updateStatus_(p) {
  if (!p.bookingNumber || !p.status) throw new Error('bookingNumber and status are required.');
  const allowed = ['requested','confirmed','checked_in','washing','ready','completed','cancelled','no_show'];
  if (!allowed.includes(String(p.status))) throw new Error('Invalid booking status.');

  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Bookings');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.bookingNumber)) {
      const row = i + 1;
      sheet.getRange(row, 13).setValue(String(p.status));
      sheet.getRange(row, 16).setValue(new Date());
      ss.getSheetByName('AuditLog').appendRow([new Date(), 'UPDATE_STATUS', p.bookingNumber, 'Dashboard', String(p.status)]);
      return { success: true, bookingNumber: p.bookingNumber, status: p.status };
    }
  }
  throw new Error('Booking not found.');
}

function validateBooking_(p) {
  ['name','phone','vehicle','registration','date','time'].forEach(key => {
    if (!String(p[key] || '').trim()) throw new Error('Missing booking field: ' + key);
  });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date))) throw new Error('Invalid booking date.');
  if (!/^\d{2}:\d{2}$/.test(String(p.time))) throw new Error('Invalid booking time.');
  const today = Utilities.formatDate(new Date(), APP.timezone, 'yyyy-MM-dd');
  if (String(p.date) < today) throw new Error('Booking date cannot be in the past.');
}

function parsePost_(e) {
  if (e?.postData?.contents) {
    const raw = String(e.postData.contents);
    try { return JSON.parse(raw); } catch (_) {}
  }
  return e?.parameter || {};
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Backend is not configured. Run setupBubblesAndBrew() first.');
  return SpreadsheetApp.openById(id);
}

function serviceById_(id, name) {
  const key = String(id || '').toLowerCase();
  const label = String(name || '').toLowerCase();
  const row = APP.services.find(s => s[0].toLowerCase() === key || s[1].toLowerCase() === label);
  return row ? { id: row[0], name: row[1], price: row[2] } : null;
}

function nextBookingNumber_(sheet, date) {
  const prefix = 'BB-' + String(date).replace(/-/g, '') + '-';
  const values = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  let max = 0;
  values.forEach(row => {
    const value = String(row[0] || '');
    if (value.indexOf(prefix) === 0) {
      const n = Number(value.slice(prefix.length));
      if (Number.isFinite(n)) max = Math.max(max, n);
    }
  });
  return prefix + String(max + 1).padStart(3, '0');
}

function cleanPhone_(phone) { return String(phone || '').replace(/[^0-9+]/g, ''); }
function formatDateCell_(value) { return value instanceof Date ? Utilities.formatDate(value, APP.timezone, 'yyyy-MM-dd') : String(value || '').slice(0, 10); }
function formatTimeCell_(value) { return value instanceof Date ? Utilities.formatDate(value, APP.timezone, 'HH:mm') : String(value || '').slice(0, 5); }

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function seedServices_(ss) {
  const sheet = ss.getSheetByName('Services');
  if (!sheet) return;
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, APP.services.length, APP.services[0].length).setValues(APP.services);
}

function getOrCreateFolder_(name, parent) {
  const iterator = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if (iterator.hasNext()) return iterator.next();
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}
