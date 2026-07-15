require('dotenv').config();
const { getAuth } = require('firebase-admin/auth');
const { initializeApp, cert } = require('firebase-admin/app');
const axios = require('axios');

const serviceAccount = require('./src/config/firebase-service-account.json');

const app = initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);

const FIREBASE_WEB_API_KEY = 'AIzaSyAp_wJBeZ5Ea-gYVOjAj5VYfygjBy4y0MY';

async function generateToken() {
  // Ek dummy test user ka UID (kuch bhi unique naam de sakti ho)
  const testUid = 'test-user-siddiqua-123';

  // Step A: Custom token banao
  const customToken = await auth.createCustomToken(testUid);

  // Step B: Custom token ko real ID token mein convert karo (Firebase REST API se)
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_WEB_API_KEY}`,
    { token: customToken, returnSecureToken: true }
  );

  console.log('\n✅ YE APNA TEST ID TOKEN HAI (Postman mein use karo):\n');
  console.log(response.data.idToken);
}

generateToken().catch((err) => console.error('Error:', err.response?.data || err.message));
