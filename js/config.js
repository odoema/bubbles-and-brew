// Public frontend configuration only.
// Never put a Firebase Admin / service-account private key in this file.
window.BB_CONFIG = {
  firebase: {
    apiKey: 'AIzaSyD5rgtYhQo0XsliyVV6xcbzxgsN8LCiGR8',
    authDomain: 'bubbles-and-brew.firebaseapp.com',
    projectId: 'bubbles-and-brew',
    storageBucket: 'bubbles-and-brew.firebasestorage.app',
    messagingSenderId: '927083687727',
    appId: '1:927083687727:web:fb6e06a69678fd6f64bbda',
    measurementId: 'G-EY2R7E739B'
  },
  // Production HTTPS endpoint for the public booking function.
  // The function itself uses Firebase Admin privileges server-side.
  functionsBaseUrl: 'https://us-central1-bubbles-and-brew.cloudfunctions.net'
};
