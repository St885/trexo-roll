// firebaseConfig.example.js — PLANTILLA de configuración de Firebase (referencia).
//
// Cómo usar:
//   1) Copia este archivo a  src/config/firebaseConfig.js
//   2) Sustituye los "REEMPLAZAR" por los valores reales de tu app web de Firebase
//      (Consola Firebase → ⚙️ Configuración del proyecto → Tus apps → SDK config).
//   3) Guarda. El juego detectará la configuración y activará el modo nube.
//
// SEGURIDAD/PRIVACIDAD:
//   · La config web de Firebase NO es un secreto: se entrega al cliente y la seguridad
//     real la imponen las REGLAS de Firestore + la lista de dominios autorizados de Auth.
//     Aun así, si prefieres no versionarla, mira docs/firebase-setup.md (.gitignore).
//   · NUNCA pongas aquí contraseñas de usuario, claves de servicio (Admin SDK) ni tokens.
//
// El juego ya trae un  src/config/firebaseConfig.js  con placeholders → funciona en
// "modo demo" (invitado/local) hasta que rellenes valores reales. No hace falta tocar
// este archivo de ejemplo.

export const firebaseConfig = {
  apiKey: 'REEMPLAZAR',
  authDomain: 'REEMPLAZAR',
  projectId: 'REEMPLAZAR',
  storageBucket: 'REEMPLAZAR',
  messagingSenderId: 'REEMPLAZAR',
  appId: 'REEMPLAZAR',
  measurementId: 'REEMPLAZAR',
};

// Rutas del SDK modular de Firebase (ESM v10.12.2).
// Por defecto: VENDORIZADO local (mismo origen) → la CSP solo necesita abrir connect-src a
// los dominios de Google (Auth/Firestore); script-src sigue 'self'. Recomendado para
// GitHub Pages. Coloca los archivos reales en libs/firebase/ (ver su README.md).
// Alternativa (Opción A): CDN de gstatic (requiere ampliar script-src). Ver docs/csp-firebase.md.
export const sdkUrls = {
  app: './libs/firebase/firebase-app.js',
  auth: './libs/firebase/firebase-auth.js',
  firestore: './libs/firebase/firebase-firestore.js',
  analytics: './libs/firebase/firebase-analytics.js',
};
