// analyticsService.js — Analítica de producto (Google Analytics for Firebase / GA4).
// No-op seguro si Firebase/Analytics no está disponible. NUNCA registra datos sensibles
// (contraseñas, tokens, correo): los parámetros se filtran antes de enviarse.
//
// PAÍS: NO se pide GPS ni ubicación. GA4 deriva el país de forma AGREGADA a partir de la
// IP en sus informes (Audiencia → Geografía → País). No guardamos país manualmente.

import { getFirebase } from './firebaseClient.js';

// Eventos mínimos definidos para el juego.
export const EVENTS = {
  LOGIN: 'login',
  SIGN_UP: 'sign_up',
  GUEST_START: 'guest_start',
  LEVEL_START: 'level_start',
  LEVEL_COMPLETE: 'level_complete',
  LEVEL_FAIL: 'level_fail',
  SKIN_SELECTED: 'skin_selected',
  CHEST_OPENED: 'chest_opened',
  DAILY_REWARD_CLAIMED: 'daily_reward_claimed',
  ROCKET_ACTIVATED: 'rocket_activated',
  CAVEMAN_HIT: 'caveman_hit',
  BOSS_LEVEL_STARTED: 'boss_level_started',
};

// Claves de parámetro PROHIBIDAS (nunca se envían aunque se pasen por error).
// En MINÚSCULAS: la comparación se hace con k.toLowerCase() (cubre idToken, apiKey, etc.).
const BLOCKED_PARAMS = ['password', 'pass', 'pwd', 'token', 'idtoken', 'accesstoken', 'refreshtoken', 'email', 'apikey', 'secret'];

/** Filtra parámetros: quita sensibles y acota tipos a primitivos cortos. (exportada para tests) */
export function sanitizeParams(params) {
  const out = {};
  if (!params || typeof params !== 'object') return out;
  for (const k of Object.keys(params)) {
    if (BLOCKED_PARAMS.includes(k.toLowerCase())) continue;
    const v = params[k];
    if (v == null) continue;
    if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 80);
  }
  return out;
}

/** Registra un evento de analítica (seguro). No lanza nunca; no-op sin Firebase. */
export async function logEvent(name, params) {
  if (typeof name !== 'string' || !name) return;
  const clean = sanitizeParams(params);
  try {
    const fb = await getFirebase();
    if (fb && fb.analytics && fb.sdk.analytics) {
      fb.sdk.analytics.logEvent(fb.analytics, name, clean);
    }
    // Sin Analytics: no-op silencioso (no romper el juego).
  } catch (_) { /* la analítica nunca debe afectar al gameplay */ }
}

// — Atajos legibles para los puntos del juego —
export const track = {
  login: (method = 'password') => logEvent(EVENTS.LOGIN, { method }),
  signUp: (method = 'password') => logEvent(EVENTS.SIGN_UP, { method }),
  guestStart: () => logEvent(EVENTS.GUEST_START, {}),
  levelStart: (level) => logEvent(EVENTS.LEVEL_START, { level }),
  levelComplete: (level, stars) => logEvent(EVENTS.LEVEL_COMPLETE, { level, stars }),
  levelFail: (level, reason) => logEvent(EVENTS.LEVEL_FAIL, { level, reason }),
  skinSelected: (skin) => logEvent(EVENTS.SKIN_SELECTED, { skin }),
  chestOpened: (reward) => logEvent(EVENTS.CHEST_OPENED, { reward }),
  dailyClaimed: (streak) => logEvent(EVENTS.DAILY_REWARD_CLAIMED, { streak }),
  rocketActivated: (kind) => logEvent(EVENTS.ROCKET_ACTIVATED, { kind }),
  cavemanHit: (level) => logEvent(EVENTS.CAVEMAN_HIT, { level }),
  bossStarted: (level, kind) => logEvent(EVENTS.BOSS_LEVEL_STARTED, { level, kind }),
};

/**
 * País DECLARADO opcional (futuro): si algún día quieres segmentar dentro del juego, el
 * usuario podría elegir su país manualmente. NO usa GPS ni permisos. Aquí solo se deja la
 * forma; por ahora no se persiste país en ningún sitio.
 */
export function setDeclaredCountry(/* iso2 */) {
  // Intencionadamente vacío: no recogemos país manualmente sin consentimiento explícito.
}
