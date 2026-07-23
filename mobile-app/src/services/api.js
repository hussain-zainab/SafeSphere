// src/services/api.js
//
// This is the ONE file that knows how to talk to Siddiqua's backend.
// Every screen imports functions from here instead of writing fetch()
// calls directly - so if the backend URL changes, you only update it once.

const BASE_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

// Generic helper so every function below doesn't repeat error handling
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

// ---- Risk prediction (Home + Map + Risk Prediction screens) ----
export function getRiskPrediction(latitude, longitude) {
  return request('/risk/predict', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  });
}

// ---- Safe places (Safe Places screen) ----
export function getSafePlaces(latitude, longitude) {
  return request(`/safe-places?lat=${latitude}&lng=${longitude}`);
}

// ---- Safe route (Safe Route screen) ----
export function getSafeRoute(origin, destination) {
  return request('/route/safe', {
    method: 'POST',
    body: JSON.stringify({ origin, destination }),
  });
}

// ---- SOS (SOS screen - the most important one) ----
export function triggerSOS(latitude, longitude) {
  return request('/sos/trigger', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  });
}

// ---- Community reports (Report + History screens) ----
export function submitReport(reportData) {
  return request('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
}

export function getReports() {
  return request('/reports');
}

// ---- User profile & contacts (Profile + Settings screens) ----
export function getProfile() {
  return request('/user/profile');
}

export function updateContacts(contacts) {
  return request('/user/contacts', {
    method: 'PUT',
    body: JSON.stringify({ contacts }),
  });
}