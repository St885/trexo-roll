// firebaseConfig.js — Config ACTIVA de Firebase. Por defecto trae PLACEHALDERS
// ("REEMPLAZAR") → el juego corre en MODO DEMO (invitado/local) y NO intenta red.
//
// Para activar el modo nube: rellena estos valores con los de tu app web de Firebase
// (ver docs/firebase-setup.md). Mientras haya "REEMPLAZAR", isConfigured() = false y
// todo sigue funcionando en local sin errores.
//
// La config web de Firebase no es secreta (se sirve al cliente; la seguridad la dan las
// reglas de Firestore + Auth). Aun así, si prefieres no versionarla con valores reales,
// docs/firebase-setup.md explica cómo ignorarla en git. NUNCA pongas aquí contraseñas,
// claves del Admin SDK ni tokens.

export const firebaseConfig = {
  apiKey: 'REEMPLAZAR',
  authDomain: 'REEMPLAZAR',
  projectId: 'REEMPLAZAR',
  storageBucket: 'REEMPLAZAR',
  messagingSenderId: 'REEMPLAZAR',
  appId: 'REEMPLAZAR',
  measurementId: 'REEMPLAZAR',
};

// Rutas del SDK (ESM v10.12.2). Por defecto, VENDORIZADO local (mismo origen → respeta la
// CSP estricta con script-src 'self', recomendado para GitHub Pages). Coloca los archivos
// reales en libs/firebase/ (ver libs/firebase/README.md y docs/firebase-sdk-vendor.md).
export const sdkUrls = {
  app: './libs/firebase/firebase-app.js',
  auth: './libs/firebase/firebase-auth.js',
  firestore: './libs/firebase/firebase-firestore.js',
  analytics: './libs/firebase/firebase-analytics.js',
};

// Alternativa (Opción A) — SDK por CDN de gstatic. Requiere ampliar la CSP (script-src).
// Para usarla, comenta el bloque de arriba y descomenta este (ver docs/csp-firebase.md):
// export const sdkUrls = {
//   app: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
//   auth: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
//   firestore: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
//   analytics: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js',
// };

/** true si la config tiene valores reales (no placeholders). */
export function hasRealConfig() {
  const c = firebaseConfig;
  return !!(c && c.apiKey && c.apiKey !== 'REEMPLAZAR' && c.projectId && c.projectId !== 'REEMPLAZAR');
}
