// storage.js — Persistencia local: high score, niveles desbloqueados, estrellas y
// mejores tiempos por nivel. Tolerante a fallos (fallback en memoria).

import { STORAGE_KEY } from './constants.js';

// NOTA sobre "estrellas": hay DOS conceptos distintos y separados.
//   · stars{}      → valoración por nivel (1–3 ★), puntuación/progreso (ya existía).
//   · starTokens   → estrellas ESPECIALES acumulables, moneda de la Tienda de Canje.
// Inventario de potenciadores: extraLives, trapBlocks, fallShields.
const DEFAULT = {
  highScore: 0, unlocked: 1, stars: {}, bestTimes: {}, selectedBall: 'blanca', lastLevel: 1,
  starTokens: 0, extraLives: 0, trapBlocks: 0, fallShields: 0,
  livesBank: 0, // reserva de vidas (compradas/ganadas por vídeo) para continuar partidas
  sfxOn: true, musicOn: true, // ajustes de audio (separados)
  // — Evolución v0.20: cofre jurásico, skins y recompensa diaria —
  chestsOpened: 0,                 // cofres jurásicos ya abiertos (cada 15 ⭐ de nivel da uno)
  ownedSkins: ['classic'],         // skins de bola desbloqueadas (la clásica viene de serie)
  activeSkin: 'classic',           // skin equipada actualmente
  daily: { lastClaimDate: '', streak: 0 }, // recompensa diaria (fecha YYYY-MM-DD + racha)
};
let memoryFallback = clone(DEFAULT);

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function nonNeg(v) { return Math.max(0, Number(v) || 0); }

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT);
    const data = JSON.parse(raw);
    return {
      highScore: Number(data.highScore) || 0,
      unlocked: Math.max(1, Number(data.unlocked) || 1),
      stars: data.stars && typeof data.stars === 'object' ? data.stars : {},
      bestTimes: data.bestTimes && typeof data.bestTimes === 'object' ? data.bestTimes : {},
      selectedBall: typeof data.selectedBall === 'string' ? data.selectedBall : 'blanca',
      lastLevel: Math.max(1, Number(data.lastLevel) || 1),
      starTokens: nonNeg(data.starTokens),
      extraLives: nonNeg(data.extraLives),
      trapBlocks: nonNeg(data.trapBlocks),
      fallShields: nonNeg(data.fallShields),
      livesBank: nonNeg(data.livesBank),
      sfxOn: data.sfxOn !== false,   // por defecto ON
      musicOn: data.musicOn !== false,
      chestsOpened: nonNeg(data.chestsOpened),
      ownedSkins: sanitizeSkins(data.ownedSkins),
      activeSkin: typeof data.activeSkin === 'string' ? data.activeSkin : 'classic',
      daily: sanitizeDaily(data.daily),
    };
  } catch (_) {
    return clone(memoryFallback);
  }
}

/** Normaliza la lista de skins poseídas (siempre incluye 'classic', sin duplicados). */
function sanitizeSkins(arr) {
  const out = new Set(['classic']);
  if (Array.isArray(arr)) for (const s of arr) if (typeof s === 'string') out.add(s);
  return [...out];
}

/** Normaliza el bloque de recompensa diaria. */
function sanitizeDaily(d) {
  if (!d || typeof d !== 'object') return { lastClaimDate: '', streak: 0 };
  return {
    lastClaimDate: typeof d.lastClaimDate === 'string' ? d.lastClaimDate : '',
    streak: nonNeg(d.streak),
  };
}

// Claves válidas de potenciadores (para validar entradas).
export const POWERUPS = ['extraLives', 'trapBlocks', 'fallShields'];

export function save(state) {
  memoryFallback = { ...memoryFallback, ...state };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryFallback));
  } catch (_) {
    /* sin persistencia: seguimos con la copia en memoria */
  }
}

export function getHighScore() {
  return load().highScore;
}

/** Devuelve true si se batió el récord. */
export function setHighScore(score) {
  const cur = load();
  if (score > cur.highScore) {
    save({ ...cur, highScore: score });
    return true;
  }
  return false;
}

export function getUnlocked() {
  return load().unlocked;
}

export function unlockLevel(levelNumber) {
  const cur = load();
  if (levelNumber > cur.unlocked) save({ ...cur, unlocked: levelNumber });
}

export function getStars(levelId) {
  return Number(load().stars[levelId]) || 0;
}

export function setStars(levelId, stars) {
  const cur = load();
  const best = Math.max(Number(cur.stars[levelId]) || 0, stars);
  save({ ...cur, stars: { ...cur.stars, [levelId]: best } });
}

export function getTotalStars() {
  const stars = load().stars;
  return Object.values(stars).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function getBestTime(levelId) {
  const t = load().bestTimes[levelId];
  return t == null ? null : Number(t);
}

export function setBestTime(levelId, seconds) {
  const cur = load();
  const prev = cur.bestTimes[levelId];
  if (prev == null || seconds < prev) {
    save({ ...cur, bestTimes: { ...cur.bestTimes, [levelId]: seconds } });
  }
}

export function getSelectedBall() {
  return load().selectedBall;
}

export function setSelectedBall(id) {
  save({ ...load(), selectedBall: id });
}

export function getLastLevel() {
  return load().lastLevel;
}

export function setLastLevel(levelNumber) {
  save({ ...load(), lastLevel: levelNumber });
}

// --- Estrellas-token (moneda de canje) e inventario de potenciadores ----------

export function getStarTokens() {
  return load().starTokens;
}

/** Suma (o resta, con n negativo) estrellas-token. No baja de 0. */
export function addStarTokens(n = 1) {
  const c = load();
  save({ ...c, starTokens: Math.max(0, c.starTokens + n) });
}

export function getInventory() {
  const c = load();
  return {
    starTokens: c.starTokens, extraLives: c.extraLives,
    trapBlocks: c.trapBlocks, fallShields: c.fallShields,
  };
}

/**
 * Compra un potenciador: descuenta `cost` estrellas-token y suma 1 al item.
 * @returns {boolean} true si había estrellas suficientes y se realizó la compra.
 */
export function buyPowerup(item, cost) {
  const c = load();
  if (!POWERUPS.includes(item) || c.starTokens < cost) return false;
  save({ ...c, starTokens: c.starTokens - cost, [item]: nonNeg(c[item]) + 1 });
  return true;
}

/** Consume 1 unidad del potenciador si hay stock. @returns {boolean} */
export function consumePowerup(item) {
  const c = load();
  if (!POWERUPS.includes(item) || nonNeg(c[item]) <= 0) return false;
  save({ ...c, [item]: c[item] - 1 });
  return true;
}

/** Otorga `n` unidades de un potenciador SIN coste (recompensas de cofre/diario). */
export function addPowerup(item, n = 1) {
  const c = load();
  if (!POWERUPS.includes(item)) return false;
  save({ ...c, [item]: nonNeg(c[item]) + Math.max(0, n) });
  return true;
}

// --- Banco de vidas (monetización: vídeo recompensado / packs de vidas) -------

export function getLivesBank() {
  return load().livesBank;
}

/** Añade vidas a la reserva (compra de pack o recompensa por vídeo). */
export function addLivesBank(n) {
  const c = load();
  save({ ...c, livesBank: Math.max(0, c.livesBank + n) });
}

/** Saca hasta `n` vidas de la reserva. @returns {number} vidas realmente sacadas. */
export function takeFromLivesBank(n) {
  const c = load();
  const take = Math.min(c.livesBank, Math.max(0, n));
  if (take > 0) save({ ...c, livesBank: c.livesBank - take });
  return take;
}

// --- Ajustes de audio --------------------------------------------------------

export function getSettings() {
  const c = load();
  return { sfxOn: c.sfxOn, musicOn: c.musicOn };
}

export function setSetting(key, value) {
  if (key !== 'sfxOn' && key !== 'musicOn') return;
  save({ ...load(), [key]: !!value });
}

// --- Cofre jurásico (se gana cada CHEST_STAR_COST ⭐ de nivel acumuladas) ------

export const CHEST_STAR_COST = 15; // estrellas de nivel por cada cofre disponible

/** Cofres GANADOS en total según las estrellas de nivel acumuladas (monótono). */
export function getChestsEarned() {
  return Math.floor(getTotalStars() / CHEST_STAR_COST);
}

/** Cofres listos para abrir (ganados − abiertos). */
export function getChestsAvailable() {
  return Math.max(0, getChestsEarned() - load().chestsOpened);
}

/** Marca un cofre como abierto (si había alguno disponible). @returns {boolean} */
export function openChest() {
  const c = load();
  if (getChestsAvailable() <= 0) return false;
  save({ ...c, chestsOpened: c.chestsOpened + 1 });
  return true;
}

/** Estrellas que faltan para el PRÓXIMO cofre (0 si ya hay uno listo). */
export function starsToNextChest() {
  if (getChestsAvailable() > 0) return 0;
  const total = getTotalStars();
  return CHEST_STAR_COST - (total % CHEST_STAR_COST);
}

// --- Skins de bola -----------------------------------------------------------

export function getOwnedSkins() {
  return load().ownedSkins.slice();
}

export function ownsSkin(id) {
  return load().ownedSkins.includes(id);
}

export function getActiveSkin() {
  return load().activeSkin;
}

/** Desbloquea una skin (sin coste aquí; el coste lo gestiona quien llama). */
export function unlockSkin(id) {
  const c = load();
  if (c.ownedSkins.includes(id)) return false;
  save({ ...c, ownedSkins: [...c.ownedSkins, id] });
  return true;
}

/** Equipa una skin SOLO si está desbloqueada. @returns {boolean} */
export function setActiveSkin(id) {
  const c = load();
  if (!c.ownedSkins.includes(id)) return false;
  save({ ...c, activeSkin: id });
  return true;
}

// --- Recompensa diaria -------------------------------------------------------

export function getDaily() {
  return { ...load().daily };
}

export function setDaily(dateStr, streak) {
  const c = load();
  save({ ...c, daily: { lastClaimDate: String(dateStr || ''), streak: nonNeg(streak) } });
}

// --- Sincronización nube ↔ local (Firebase) ----------------------------------

/** Devuelve una instantánea completa del guardado local (para subir a la nube). */
export function exportSave() {
  return load();
}

/**
 * Aplica una instantánea (p. ej. traída de la nube) al guardado local, SANEADA.
 * Solo toca campos de progreso/inventario; ignora claves desconocidas. No guarda
 * jamás credenciales (este store nunca las maneja).
 */
export function importSave(snap) {
  if (!snap || typeof snap !== 'object') return false;
  const cur = load();
  const next = { ...cur };
  if (snap.highScore != null) next.highScore = Math.max(0, Number(snap.highScore) || 0);
  if (snap.unlocked != null) next.unlocked = Math.max(1, Number(snap.unlocked) || 1);
  if (snap.stars && typeof snap.stars === 'object') next.stars = sanitizeStarMap(snap.stars);
  if (snap.bestTimes && typeof snap.bestTimes === 'object') next.bestTimes = snap.bestTimes;
  if (typeof snap.selectedBall === 'string') next.selectedBall = snap.selectedBall;
  if (snap.lastLevel != null) next.lastLevel = Math.max(1, Number(snap.lastLevel) || 1);
  for (const k of ['starTokens', 'extraLives', 'trapBlocks', 'fallShields', 'livesBank', 'chestsOpened']) {
    if (snap[k] != null) next[k] = nonNeg(snap[k]);
  }
  if (Array.isArray(snap.ownedSkins)) next.ownedSkins = sanitizeSkins(snap.ownedSkins);
  if (typeof snap.activeSkin === 'string') next.activeSkin = snap.activeSkin;
  if (snap.daily && typeof snap.daily === 'object') next.daily = sanitizeDaily(snap.daily);
  if (typeof snap.sfxOn === 'boolean') next.sfxOn = snap.sfxOn;
  if (typeof snap.musicOn === 'boolean') next.musicOn = snap.musicOn;
  save(next);
  return true;
}

/** Sanea un mapa nivel→estrellas (valores 0..3 enteros). */
function sanitizeStarMap(m) {
  const out = {};
  for (const k of Object.keys(m)) {
    const v = Math.max(0, Math.min(3, Math.round(Number(m[k]) || 0)));
    if (v > 0) out[k] = v;
  }
  return out;
}

// --- Reiniciar progreso (conserva audio, bola y skins elegidas) --------------

/** Borra progreso/inventario/récords. Mantiene ajustes de audio, bola y skins. */
export function resetProgress() {
  const c = load();
  const keep = {
    sfxOn: c.sfxOn, musicOn: c.musicOn, selectedBall: c.selectedBall,
    ownedSkins: c.ownedSkins, activeSkin: c.activeSkin, // las skins son colección, no progreso de niveles
  };
  save({ ...DEFAULT, ...keep });
}
