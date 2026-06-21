// collectibles.js — Coloca monedas y la estrella-token DENTRO de cada nivel, de
// forma procedural pero DETERMINISTA (misma disposición cada vez que juegas el
// nivel → justo y testeable). Las posiciones se validan contra la huella, hoyos,
// trampas y paredes, así nunca quedan sobre un sitio inválido ni hacen el nivel
// imposible (los coleccionables no bloquean ni son obligatorios).

import { isInsideFootprint, footprintBounds } from '../physics/footprint.js';

export const PICKUP_RADIUS = 0.95; // distancia centro-bola ↔ centro-objeto para recoger
// Economía: una moneda = 1 PUNTO de puntuación. La estrella NO da puntos; suma 1 al
// recurso ACUMULABLE (estrella de canje) que se gasta en la Tienda de Canje.
export const COIN_POINTS = 1;

/** ¿Es (x,z) un sitio válido y "limpio" para un coleccionable? */
function isValidSpot(level, x, z, placed) {
  if (!isInsideFootprint(level.footprint, x, z)) return false;
  // Lejos del inicio (que no se recoja sin querer al arrancar).
  if (Math.hypot(x - level.start.x, z - level.start.z) < 2.2) return false;
  // No sobre la meta.
  if (level.goal && Math.hypot(x - level.goal.x, z - level.goal.z) < level.goal.r + 0.8) return false;
  // No sobre una trampa (cerca está bien = riesgo; encima no, sería caída segura).
  for (const t of level.traps || []) {
    if (Math.hypot(x - t.x, z - t.z) < t.r + 0.75) return false;
  }
  // No sobre un portal (la bola se teletransportaría antes de recogerlo).
  for (const p of level.portals || []) {
    if (Math.hypot(x - p.x, z - p.z) < (p.r || 1) + 0.75) return false;
  }
  // No dentro de paredes (+ margen de la bola).
  for (const w of level.walls || []) {
    if (Math.abs(x - w.x) < w.w / 2 + 0.6 && Math.abs(z - w.z) < w.d / 2 + 0.6) return false;
  }
  // Separación entre coleccionables.
  for (const p of placed) {
    if (Math.hypot(x - p.x, z - p.z) < 1.7) return false;
  }
  // Margen del borde para que no queden en el filo.
  if (!isInsideFootprint(level.footprint, x + 0.5, z) || !isInsideFootprint(level.footprint, x - 0.5, z)
    || !isInsideFootprint(level.footprint, x, z + 0.5) || !isInsideFootprint(level.footprint, x, z - 0.5)) {
    return false;
  }
  return true;
}

/** Punto candidato. En niveles avanzados, sesga hacia zonas de riesgo (trampas). */
function candidate(level, levelIndex, b, rng, riskBias) {
  const traps = level.traps || [];
  if (traps.length && rng() < riskBias) {
    const t = traps[(rng() * traps.length) | 0];
    const ang = rng() * Math.PI * 2;
    const rr = t.r + 0.9 + rng() * 0.8;
    return { x: t.x + Math.cos(ang) * rr, z: t.z + Math.sin(ang) * rr };
  }
  return { x: b.minX + rng() * b.width, z: b.minZ + rng() * b.depth };
}

/**
 * Genera los coleccionables de un nivel.
 * @returns {{coins: {x,z}[], star: {x,z}|null, pickupRadius:number}}
 */
export function generateCollectibles(level, levelIndex) {
  const b = footprintBounds(level.footprint);
  const rng = mulberry32(((level.id || levelIndex + 1) * 9173 + 7) >>> 0);
  const placed = [];

  // Dificultad: más monedas y más cerca del riesgo según avanza el juego.
  let coinCount, riskBias;
  if (levelIndex < 5) { coinCount = 3; riskBias = 0.0; }       // iniciales: fáciles
  else if (levelIndex < 15) { coinCount = 4; riskBias = 0.35; } // medios: rutas secundarias
  else { coinCount = 5; riskBias = 0.6; }                       // avanzados: zonas de riesgo

  const coins = [];
  for (let tries = 0; coins.length < coinCount && tries < 500; tries++) {
    const c = candidate(level, levelIndex, b, rng, riskBias);
    if (isValidSpot(level, c.x, c.z, placed)) { coins.push(c); placed.push(c); }
  }

  // Estrella-token cada 2 niveles (niveles pares: 2, 4, 6, …). En sitio algo arriesgado.
  let star = null;
  if ((levelIndex + 1) % 2 === 0) {
    for (let tries = 0; !star && tries < 400; tries++) {
      const c = candidate(level, levelIndex, b, rng, 0.6);
      if (isValidSpot(level, c.x, c.z, placed)) { star = c; placed.push(c); }
    }
  }

  return { coins, star, pickupRadius: PICKUP_RADIUS };
}

/** PRNG determinista (mulberry32). */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
