// analyticsService.js — Analítica de producto (Google Analytics for Firebase / GA4).
// No-op seguro si Firebase/Analytics no está disponible. NUNCA registra datos sensibles
// (contraseñas, tokens, correo): los parámetros se filtran antes de enviarse.
//
// PAÍS: NO se pide GPS ni ubicación. GA4 deriva el país de forma AGREGADA a partir de la
// IP en sus informes (Audiencia → Geografía → País). No guardamos país manualmente.

import { getFirebase } from './firebaseClient.js';

// Eventos del juego. Convención GA4: `login`/`sign_up` llevan `method` ('google'|'email') — así se
// distingue login_google vs login_email en los informes SIN duplicar nombres de evento. `game_open`,
// `session_start`/`session_end` y `first_open`/`user_engagement` (estos dos los emite GA4 solo) cubren
// activos/sesiones/tiempo/retención. NUNCA se envía PII (ver BLOCKED_PARAMS + sanitizeParams).
export const EVENTS = {
  // Autenticación
  LOGIN: 'login',                 // { method: 'google' | 'email' }
  SIGN_UP: 'sign_up',             // { method: 'email' }
  LOGOUT: 'logout',
  GUEST_START: 'guest_start',     // guest_play
  RETURN_PLAYER: 'return_player', // hay progreso local previo al abrir
  // Sesión / apertura
  GAME_OPEN: 'game_open',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',     // { play_time_seconds }
  // Gameplay
  GAME_START: 'game_start',       // empieza a jugar (primer nivel de la sesión)
  LEVEL_START: 'level_start',     // { level }
  LEVEL_COMPLETE: 'level_complete', // { level, stars, level_time_seconds, coins }
  LEVEL_FAIL: 'level_fail',       // { level, reason }
  LEVEL_RETRY: 'level_retry',     // { level }
  COINS_COLLECTED: 'coins_collected',   // { level, coins } (agregado por nivel, no por moneda)
  STARS_COLLECTED: 'stars_collected',   // { level, stars }
  SKIN_SELECTED: 'skin_selected',       // { skin }
  BALL_SELECTED: 'ball_selected',       // { ball }
  // Engagement / eventos del mundo
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

// — Atajos legibles para los puntos del juego (todos no-op si Analytics está OFF) —
export const track = {
  // Auth (GA4: method distingue google/email)
  login: (method = 'email') => logEvent(EVENTS.LOGIN, { method }),
  signUp: (method = 'email') => logEvent(EVENTS.SIGN_UP, { method }),
  logout: () => logEvent(EVENTS.LOGOUT, {}),
  guestStart: () => logEvent(EVENTS.GUEST_START, {}),
  returnPlayer: (lastLevel) => logEvent(EVENTS.RETURN_PLAYER, { last_level: lastLevel }),
  // Sesión
  gameOpen: () => logEvent(EVENTS.GAME_OPEN, {}),
  sessionStart: () => logEvent(EVENTS.SESSION_START, {}),
  sessionEnd: (playTimeSeconds) => logEvent(EVENTS.SESSION_END, { play_time_seconds: Math.max(0, Math.round(playTimeSeconds || 0)) }),
  // Gameplay
  gameStart: () => logEvent(EVENTS.GAME_START, {}),
  levelStart: (level) => logEvent(EVENTS.LEVEL_START, { level }),
  levelComplete: (level, stars, timeSeconds, coins) => logEvent(EVENTS.LEVEL_COMPLETE, { level, stars, level_time_seconds: timeSeconds != null ? Math.round(timeSeconds) : undefined, coins }),
  levelFail: (level, reason) => logEvent(EVENTS.LEVEL_FAIL, { level, reason }),
  levelRetry: (level) => logEvent(EVENTS.LEVEL_RETRY, { level }),
  coinsCollected: (level, coins) => logEvent(EVENTS.COINS_COLLECTED, { level, coins }),
  starsCollected: (level, stars) => logEvent(EVENTS.STARS_COLLECTED, { level, stars }),
  skinSelected: (skin) => logEvent(EVENTS.SKIN_SELECTED, { skin }),
  ballSelected: (ball) => logEvent(EVENTS.BALL_SELECTED, { ball }),
  // Engagement / mundo
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
