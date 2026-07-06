// firebaseConfig.js — Config ACTIVA de Firebase. Por defecto trae PLACEHOLDERS
// ("REPLACE_WITH_...") → el juego corre en MODO DEMO (invitado/local) y NO toca la red.
//
// Para activar la nube (Auth real): rellena estos valores con los de tu app WEB de Firebase
// (ver docs/firebase-setup.md) Y vendoriza el SDK (`npm run fetch:firebase`). Mientras haya
// "REPLACE_WITH_", hasRealConfig() = false y todo sigue funcionando en local sin errores.
//
// SEGURIDAD: la config WEB de Firebase NO es secreta (se sirve al cliente; la seguridad la dan
// las REGLAS de Firestore + la restricción de la API key por dominio/app en Google Cloud). La
// apiKey NO es una contraseña. NUNCA pongas aquí contraseñas, claves del Admin SDK ni tokens.
// Si prefieres no versionar valores reales, docs/firebase-setup.md explica cómo ignorarla en git.

export const firebaseConfig = {
  // ✅ Config REAL del app WEB "TREXoRoll Web" (2026-07-04). NO es secreta (se sirve al cliente);
  //    la seguridad la dan los dominios autorizados de Auth + las reglas de Firestore.
  apiKey: 'AIzaSyDZRezVscc_bFmnmbZzsippseqU8Me-nXs',
  appId: '1:1022273256922:web:04ecba3412f17c71e854e3',
  // ✅ Derivados del proyecto (google-services.json / trexoroll). No son secretos.
  authDomain: 'trexoroll.firebaseapp.com',
  projectId: 'trexoroll',
  storageBucket: 'trexoroll.firebasestorage.app',
  messagingSenderId: '1022273256922',
  // measurementId es SOLO para Analytics (GA4). Opcional; Analytics está DESACTIVADO
  // (ENABLE_ANALYTICS = false). Rellénalo (del app Web) solo si activas Analytics.
  measurementId: 'REPLACE_WITH_WEB_MEASUREMENT_ID',
};

// Rutas del SDK (ESM v10.12.2). Por defecto, VENDORIZADO local (mismo origen → respeta la CSP
// estricta con script-src 'self', recomendado para GitHub Pages). Coloca los archivos reales en
// libs/firebase/ (`npm run fetch:firebase`; ver libs/firebase/README.md).
export const sdkUrls = {
  app: './libs/firebase/firebase-app.js',
  auth: './libs/firebase/firebase-auth.js',
  firestore: './libs/firebase/firebase-firestore.js',
  analytics: './libs/firebase/firebase-analytics.js',
};

// --- Interruptores de funciones (esta versión) -------------------------------
// Autenticación real (Google + email/password): SÍ, en cuanto la config sea real.
// Sincronización de progreso en la nube (Firestore): PREPARADA pero DESACTIVADA por defecto en
// esta versión (el progreso local no se toca). Ponlo a true cuando tengas Firestore + reglas.
export const ENABLE_CLOUD_SYNC = false;
// Analytics (GA4): DESACTIVADO en esta versión (no se recopila analítica). Actívalo aparte.
export const ENABLE_ANALYTICS = false;

/** true si la config tiene valores reales (no placeholders). */
export function hasRealConfig() {
  const c = firebaseConfig;
  const real = (v) => typeof v === 'string' && v && !v.startsWith('REPLACE_WITH_') && v !== 'REEMPLAZAR';
  return real(c.apiKey) && real(c.projectId) && real(c.appId);
}
