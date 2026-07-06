// authService.js — Capa de autenticación con interfaz estable, independiente del
// backend. Soporta Firebase Auth (correo/contraseña) cuando está configurado y, si no,
// degrada a MODO DEMO (invitado/local) sin romper nada.
//
// SEGURIDAD:
//   · NUNCA se registra (console) ni se persiste la contraseña ni ningún token.
//   · Errores GENÉRICOS hacia el usuario (se devuelve un `code` que la UI traduce).
//   · La contraseña solo viaja a Firebase Auth (HTTPS) y se descarta; no se guarda local.
//
// Todas las funciones son async y devuelven objetos {ok, ...}. Si Firebase no está
// configurado, las de correo devuelven {ok:false, code:'auth/not-configured'} y el
// llamador (Game) usa el flujo demo local.

import { getFirebase, isConfigured } from './firebaseClient.js';

export const AUTH_RESULT = { OK: 'ok' };

// --- Validación básica de inputs (sin exponer detalles técnicos) -------------

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(pass) {
  return typeof pass === 'string' && pass.length >= 6; // Firebase exige mínimo 6
}

// --- Estado / modo ------------------------------------------------------------

/** 'cloud' si Firebase está disponible; 'demo' en caso contrario. */
export async function getAuthMode() {
  return (await isConfigured()) ? 'cloud' : 'demo';
}

/** Usuario actual en forma SEGURA (sin tokens) o null. */
export async function getCurrentUser() {
  const fb = await getFirebase();
  if (!fb || !fb.auth.currentUser) return null;
  return _safeUser(fb.auth.currentUser);
}

/**
 * Observa cambios de sesión. cb recibe el usuario seguro (o null).
 * Devuelve una función para desuscribirse. En modo demo, llama cb(null) una vez.
 */
export function onAuthChange(cb) {
  let unsub = () => {};
  (async () => {
    const fb = await getFirebase();
    if (!fb) { try { cb(null); } catch (_) {} return; }
    unsub = fb.sdk.auth.onAuthStateChanged(fb.auth, (u) => {
      try { cb(u ? _safeUser(u) : null); } catch (_) {}
    });
  })();
  return () => unsub();
}

// --- Registro / login con correo y contraseña --------------------------------

/** Crea una cuenta (correo/contraseña) y fija el nombre visible. */
export async function signUpEmail({ email, password, displayName }) {
  if (!isValidEmail(email)) return _fail('auth/invalid-email');
  if (!isValidPassword(password)) return _fail('auth/weak-password');
  const fb = await getFirebase();
  if (!fb) return _fail('auth/not-configured');
  try {
    const cred = await fb.sdk.auth.createUserWithEmailAndPassword(fb.auth, email.trim(), password);
    if (displayName) {
      try { await fb.sdk.auth.updateProfile(cred.user, { displayName: String(displayName).slice(0, 24) }); } catch (_) {}
    }
    return { ok: true, uid: cred.user.uid, user: _safeUser(cred.user) };
  } catch (e) { return _fail(_code(e)); }
}

/** Inicia sesión con correo/contraseña. */
export async function signInEmail({ email, password }) {
  if (!isValidEmail(email)) return _fail('auth/invalid-email');
  if (!isValidPassword(password)) return _fail('auth/invalid-credential');
  const fb = await getFirebase();
  if (!fb) return _fail('auth/not-configured');
  try {
    const cred = await fb.sdk.auth.signInWithEmailAndPassword(fb.auth, email.trim(), password);
    return { ok: true, uid: cred.user.uid, user: _safeUser(cred.user) };
  } catch (e) { return _fail(_code(e)); }
}

/** Cierra la sesión en la nube (el progreso local no se borra). */
export async function signOutUser() {
  const fb = await getFirebase();
  if (!fb) return { ok: true, mode: 'demo' };
  try { await fb.sdk.auth.signOut(fb.auth); return { ok: true }; }
  catch (e) { return _fail(_code(e)); }
}

/** Envía un correo de recuperación de contraseña. */
export async function resetPassword(email) {
  if (!isValidEmail(email)) return _fail('auth/invalid-email');
  const fb = await getFirebase();
  if (!fb) return _fail('auth/not-configured');
  try { await fb.sdk.auth.sendPasswordResetEmail(fb.auth, email.trim()); return { ok: true }; }
  catch (e) { return _fail(_code(e)); }
}

/**
 * Google Sign-In (Firebase Auth). En WEB usa POPUP; si el popup no está soportado (típico en
 * WebView de Capacitor) o se bloquea, cae a REDIRECT (el resultado se recoge en initAuth /
 * onAuthChange tras recargar). NUNCA persiste tokens: los gestiona el SDK de Firebase.
 */
export async function signInWithGoogle() {
  const fb = await getFirebase();
  if (!fb) return _fail('auth/not-configured');
  try {
    const provider = new fb.sdk.auth.GoogleAuthProvider();
    let cred;
    try {
      cred = await fb.sdk.auth.signInWithPopup(fb.auth, provider);
    } catch (e) {
      const code = _code(e);
      const popupUnsupported = code === 'auth/popup-blocked'
        || code === 'auth/operation-not-supported-in-this-environment'
        || code === 'auth/cancelled-popup-request'
        || code === 'auth/popup-closed-by-user';
      if (popupUnsupported && typeof fb.sdk.auth.signInWithRedirect === 'function') {
        await fb.sdk.auth.signInWithRedirect(fb.auth, provider); // navega fuera; vuelve tras el redirect
        return { ok: false, code: 'auth/redirecting' };
      }
      throw e;
    }
    return { ok: true, uid: cred.user.uid, user: _safeUser(cred.user) };
  } catch (e) { return _fail(_code(e)); }
}

/** Compat: enruta 'google' a signInWithGoogle; el resto sigue sin habilitar. */
export async function signInWithProvider(provider) {
  if (provider === 'google') return signInWithGoogle();
  return _fail('auth/provider-not-enabled');
}

/** Modo invitado: no usa Firebase; la sesión local la gestiona session.js (en Game). */
export async function startGuest() {
  return { ok: true, mode: 'guest' };
}

// --- API pública estable (FASE 4) --------------------------------------------

/**
 * Inicializa la capa de auth. Si Firebase está configurado, completa un posible login por
 * REDIRECT pendiente (Google en WebView). Seguro en demo (no lanza). @returns {{ok, mode}}
 */
export async function initAuth() {
  const fb = await getFirebase();
  if (!fb) return { ok: true, mode: 'demo' };
  try { if (typeof fb.sdk.auth.getRedirectResult === 'function') await fb.sdk.auth.getRedirectResult(fb.auth); } catch (_) { /* sin redirect pendiente */ }
  return { ok: true, mode: 'cloud' };
}

/** ¿La sesión actual es invitado/local? (no hay usuario de Firebase). */
export async function isGuest() {
  return (await getCurrentUser()) === null;
}

/** Alias semántico de startGuest(). */
export async function continueAsGuest() { return startGuest(); }

/** Perfil PÚBLICO mínimo del jugador (sin tokens): uid/displayName/email/photoURL/provider, o null. */
export async function getPublicPlayerProfile() {
  return getCurrentUser(); // ya es la proyección segura (_safeUser)
}

// --- Aliases con los nombres de la FASE 4 (mantienen la API existente de Game) -----
export const registerWithEmail = (email, password, displayName) => signUpEmail({ email, password, displayName });
export const loginWithEmail = (email, password) => signInEmail({ email, password });
export const logout = () => signOutUser();
export const onAuthStateChanged = (cb) => onAuthChange(cb);

// --- Internos -----------------------------------------------------------------

/** Proyección SEGURA del usuario (sin tokens ni datos sensibles de más). */
function _safeUser(u) {
  return {
    uid: u.uid,
    displayName: u.displayName || '',
    email: u.email || '',
    photoURL: u.photoURL || '',
    emailVerified: !!u.emailVerified,
    provider: (u.providerData && u.providerData[0] && u.providerData[0].providerId) || 'password',
  };
}

function _fail(code) { return { ok: false, code: code || 'auth/error' }; }

/** Extrae el código de error de Firebase SIN exponer mensajes técnicos ni datos. */
function _code(e) {
  const c = e && typeof e.code === 'string' ? e.code : 'auth/error';
  return c;
}
