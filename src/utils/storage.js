// storage.js — Persistencia local: high score, niveles desbloqueados, estrellas y
// mejores tiempos por nivel. Tolerante a fallos (fallback en memoria).

import { STORAGE_KEY } from './constants.js';

const DEFAULT = { highScore: 0, unlocked: 1, stars: {}, bestTimes: {}, selectedBall: 'blanca', lastLevel: 1 };
let memoryFallback = clone(DEFAULT);

function clone(o) { return JSON.parse(JSON.stringify(o)); }

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
    };
  } catch (_) {
    return clone(memoryFallback);
  }
}

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
