// firebaseClient.js — Carga PEREZOSA y segura del SDK de Firebase, compartida por los
// servicios (auth/profile/progress/analytics). Diseño clave:
//   · NO importa el SDK de Firebase de forma estática → el grafo de módulos carga en
//     Node/navegador sin Firebase instalado (tests verdes, web intacta).
//   · Solo intenta cargar el SDK (import dinámico) cuando hay config REAL.
//   · El SDK se carga VENDORIZADO desde ./libs/firebase/ (mismo origen → script-src 'self';
//     ver docs/firebase-sdk-vendor.md). sdkUrls puede apuntar al CDN como alternativa.
//   · Si algo falla (sin config, sin SDK vendorizado, CSP, sin red) → devuelve null y el
//     juego sigue en MODO DEMO (invitado/local) sin lanzar errores críticos. El aviso de
//     consola es SOLO en desarrollo y NO expone datos sensibles (ni config, ni claves).
//
// La config se importa de ../config/firebaseConfig.js (siempre existe, con placeholders).

import { firebaseConfig, sdkUrls, hasRealConfig } from '../config/firebaseConfig.js';

let _cache; // Promise<{app,auth,db,analytics,sdk}|null> — se resuelve una sola vez.

/** ¿Entorno de desarrollo? (localhost / 127.0.0.1 / file). En producción no se loguea. */
function _isDev() {
  try {
    const h = (typeof location !== 'undefined' && location.hostname) || '';
    return h === 'localhost' || h === '127.0.0.1' || h === '' || h === '0.0.0.0';
  } catch (_) { return false; }
}

/** Aviso controlado SOLO en desarrollo. Mensaje genérico: nunca incluye config ni claves. */
function _devWarn(msg) {
  if (_isDev() && typeof console !== 'undefined') console.warn('[TREXoRoll] ' + msg);
}

/**
 * Devuelve los handles de Firebase inicializados, o null si no está configurado /
 * no se pudo cargar. Cachea el resultado (idempotente).
 */
export function getFirebase() {
  if (_cache !== undefined) return _cache;
  _cache = _init();
  return _cache;
}

async function _init() {
  if (!hasRealConfig()) return null; // placeholders → modo demo, sin tocar la red ni el SDK
  // Sin entorno de navegador (p. ej. tests en Node) no intentamos cargar el SDK web.
  if (typeof window === 'undefined') return null;
  try {
    const appMod = await import(sdkUrls.app);
    const authMod = await import(sdkUrls.auth);
    const fsMod = await import(sdkUrls.firestore);
    if (appMod.__PLACEHOLDER__ || typeof appMod.initializeApp !== 'function') {
      // Archivos de libs/firebase/ aún son los placeholders → modo demo controlado.
      _devWarn('SDK de Firebase no vendorizado (ejecuta npm run fetch:firebase o ve libs/firebase/README.md); modo demo.');
      return null;
    }
    const app = appMod.initializeApp(firebaseConfig);
    const auth = authMod.getAuth(app);
    const db = fsMod.getFirestore(app);
    let analytics = null, analyticsMod = null;
    if (sdkUrls.analytics) {
      try {
        analyticsMod = await import(sdkUrls.analytics);
        if (await _analyticsSupported(analyticsMod)) analytics = analyticsMod.getAnalytics(app);
      } catch (_) { /* analytics es opcional (requiere su CSP); el resto sigue */ }
    }
    return { app, auth, db, analytics, sdk: { app: appMod, auth: authMod, firestore: fsMod, analytics: analyticsMod } };
  } catch (_) {
    // Causas típicas: SDK no vendorizado, CSP bloquea la red, sin conexión o config inválida.
    // Mensaje genérico (sin exponer config/claves), solo en desarrollo.
    _devWarn('Firebase no se pudo inicializar; se continúa en modo demo (local).');
    return null;
  }
}

async function _analyticsSupported(mod) {
  try { return typeof mod.isSupported === 'function' ? await mod.isSupported() : true; }
  catch (_) { return false; }
}

/** ¿Está Firebase configurado y disponible en este dispositivo/sesión? */
export async function isConfigured() {
  return (await getFirebase()) !== null;
}

/** Resetea la caché (solo para tests). */
export function _resetForTests() { _cache = undefined; }
