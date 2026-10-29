# Bubbles & Brew — Google Workspace Backend

This replaces Firebase for the Bubbles & Brew MVP.

## Stack

- GitHub Pages — customer website
- Google Apps Script — backend API
- Google Sheets — operational database
- Google Drive — reports/exports/assets

## One-time setup

1. Open `script.google.com` while signed into the Google account that should own Bubbles & Brew operations.
2. Create a **New project** named `Bubbles & Brew Backend`.
3. Create/replace the default server file with the contents of `apps-script/Code.gs`.
4. Open **Project Settings** and set the time zone to **Africa/Kampala**.
5. Run `setupBubblesAndBrew()` once from the Apps Script editor and approve the Google permissions.
6. Confirm that it creates **Bubbles & Brew Operations** in Google Sheets and a **Bubbles & Brew** folder in Drive.
7. Deploy → New deployment → Web app.
8. Execute as **Me** / the deploying account and allow **Anyone** / anonymous access for the public booking endpoint.
9. Copy the `/exec` web-app URL.
10. Put that URL into `js/config.js` as `googleAppsScriptUrl`.

Google's official Apps Script documentation confirms that web apps use `doGet(e)`/`doPost(e)` and are deployed from the Deploy menu. See: https://developers.google.com/apps-script/guides/web

## API

### Public GET

- `?action=health` — backend health
- `?action=services` — public service catalogue

### Public POST

Send JSON as `text/plain;charset=utf-8` to avoid a browser preflight request:

```json
{
  "action": "createBooking",
  "name": "Brian Odoch Emmanuel",
  "phone": "0772121669",
  "vehicle": "Toyota Noah",
  "registration": "UAX 1234X",
  "vehicleType": "van",
  "serviceId": "basic-wash",
  "date": "2026-10-30",
  "time": "08:00",
  "notes": ""
}
```

The backend returns a booking number such as `BB-20261030-001` and writes the booking to the Google Sheet.

## Security decision

There is intentionally **no public `getBookings` endpoint**. The booking sheet contains customer names and phone numbers. Staff should use the private Google Sheet as the authoritative operations view. A future authenticated staff dashboard can be added without changing the customer booking API.

## Important

Do not paste Google service-account keys, OAuth client secrets, or other private credentials into GitHub. The Apps Script project itself owns access to the Sheet and Drive files.
