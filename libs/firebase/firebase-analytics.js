// firebase-analytics.js — PLACEHOLDER (no es el SDK real). Ver README.md y firebase-app.js.
// SDK objetivo: Firebase Web modular v10.12.2 (firebase-analytics.js). Sin claves ni tokens.
//
// Nota: Analytics (GA4) inyecta gtag.js desde googletagmanager.com → requiere una directiva
// CSP adicional (opt-in). Ver docs/csp-firebase.md. isSupported() devuelve false en el
// placeholder, así firebaseClient simplemente NO activa Analytics (Auth/Firestore siguen).

export const __PLACEHOLDER__ = true;

export async function isSupported() { return false; }

function notVendored() {
  throw new Error('[firebase-vendor] SDK no vendorizado. Coloca el firebase-analytics.js real en libs/firebase/ (ver README.md).');
}

export function getAnalytics() { notVendored(); }
export function logEvent() { /* no-op en placeholder: la analítica nunca debe romper nada */ }
