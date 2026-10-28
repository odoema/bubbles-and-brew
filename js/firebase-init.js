// Firebase initialization boundary.
// Uses the modular Firebase Web SDK via Google's CDN so the current static
// GitHub Pages architecture can adopt Firebase without introducing a build step.
// Firebase recommends the modular API for new web integrations.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const config = window.BB_FIREBASE_CONFIG || {};
const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
const configured = required.every(key => Boolean(config[key]));

if (configured) {
  const app = initializeApp(config);
  const db = getFirestore(app);
  window.BB_FIREBASE = { app, db, ready: true };
  window.dispatchEvent(new CustomEvent('bb:firebase-ready'));
} else {
  window.BB_FIREBASE = { ready: false, reason: 'web-app-not-registered' };
}
