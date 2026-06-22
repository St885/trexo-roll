// session.js — Sesión de acceso LOCAL y SIMULADA (MVP). Sin backend, sin red, sin
// APIs externas, SIN contraseñas ni emails: solo guarda lo mínimo para recordar cómo
// entró el jugador y su nombre visible. La estructura queda preparada para una futura
// integración real (Google/Apple/Samsung) sin cambiar el resto del juego.
//
// Privacidad: nunca se almacena ni transmite ninguna credencial. El "login"/"registro"
// son demostraciones locales; la contraseña que se teclee no se guarda en ningún sitio.

const SESSION_KEY = 'trexoroll.session.v1';

// Modos válidos de acceso (placeholder seguro para proveedores externos).
export const AUTH_MODES = ['guest', 'local-demo', 'google-placeholder', 'apple-placeholder', 'samsung-placeholder'];

/** Recorta y limpia un nombre visible (sin HTML, longitud acotada). */
export function sanitizeName(name, fallback = 'Invitado') {
  if (typeof name !== 'string') return fallback;
  const clean = name.replace(/[<>]/g, '').trim().slice(0, 24);
  return clean || fallback;
}

/** Devuelve la sesión guardada (saneada) o null si no hay. */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return null;
    return {
      authMode: AUTH_MODES.includes(d.authMode) ? d.authMode : 'guest',
      playerName: sanitizeName(d.playerName),
      acceptedTerms: d.acceptedTerms === true,
      language: d.language === 'en' ? 'en' : 'es',
    };
  } catch (_) {
    return null;
  }
}

/** ¿Hay una sesión válida (con términos aceptados)? */
export function hasSession() {
  const s = getSession();
  return !!(s && s.acceptedTerms);
}

/** Guarda la sesión (solo campos permitidos; nunca credenciales). */
export function setSession(s) {
  try {
    const data = {
      authMode: AUTH_MODES.includes(s.authMode) ? s.authMode : 'guest',
      playerName: sanitizeName(s.playerName),
      acceptedTerms: !!s.acceptedTerms,
      language: s.language === 'en' ? 'en' : 'es',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    return data;
  } catch (_) {
    return null;
  }
}

/** Cierra la sesión (vuelve a la pantalla de acceso). No toca el progreso del juego. */
export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (_) { /* sin persistencia */ }
}
