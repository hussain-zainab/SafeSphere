const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');

const serviceAccount = require('../../firebase-service-account.json');
const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(firebaseApp);
const messaging = getMessaging(firebaseApp);

module.exports = { auth, messaging };