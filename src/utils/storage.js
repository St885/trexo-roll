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
    };
  } catch (_) {
    return clone(memoryFallback);
  }
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

// --- Reiniciar progreso (conserva audio y bola elegida) ----------------------

/** Borra progreso/inventario/récords. Mantiene ajustes de audio y bola elegida. */
export function resetProgress() {
  const c = load();
  const keep = { sfxOn: c.sfxOn, musicOn: c.musicOn, selectedBall: c.selectedBall };
  save({ ...DEFAULT, ...keep });
}
