// rockets.js — Ítems "cohete" recogibles dentro del tablero (puramente visuales).
//   · 'color' → al pasar la bola, sale disparado y explota en fuegos artificiales.
//   · 'red'   → cohete con raya roja: al lanzarse aparece un pterodáctilo del evento,
//               el cohete lo alcanza (impacto cartoon) y el pterodáctilo cae y sale.
// No hacen daño, no cambian la física ni el flujo de victoria/derrota.
//
// Distribución (decisión de diseño): los niveles de cohete NO coinciden con los del
// cavernícola (múltiplos de 5), así nunca aparecen juntos y se mantienen sistemas
// separados. Colocación procedural DETERMINISTA y validada (fuera de hoyos/trampas/
// portales/monedas/estrella/inicio/meta, con margen de borde y alcanzable).

import { isInsideFootprint, footprintBounds } from '../physics/footprint.js';

export const COLOR_ROCKET_LEVELS = [3, 8, 13, 18, 23, 28, 33, 38, 43, 48];
export const RED_ROCKET_LEVELS = [7, 17, 27, 37, 47];

export const ROCKET_HIT_R = 0.55; // radio de activación por contacto con la bola

/** Tipo de cohete para un nivel (por id), o null si no lleva. */
export function rocketTypeForLevel(levelId) {
  if (COLOR_ROCKET_LEVELS.includes(levelId)) return 'color';
  if (RED_ROCKET_LEVELS.includes(levelId)) return 'red';
  return null;
}

/** ¿Es (x,z) un sitio válido para el cohete? (superficie jugable, lejos de peligros). */
function isValidRocketSpot(level, x, z, occupied) {
  if (!isInsideFootprint(level.footprint, x, z)) return false;
  // Margen de borde: alcanzable y sin quedar en el filo.
  for (const [ox, oz] of [[0.6, 0], [-0.6, 0], [0, 0.6], [0, -0.6]]) {
    if (!isInsideFootprint(level.footprint, x + ox, z + oz)) return false;
  }
  // No sobre el inicio (no se activa al arrancar) ni pegado a la meta (zona del cavernícola/hoyo).
  if (Math.hypot(x - level.start.x, z - level.start.z) < 2.4) return false;
  if (level.goal && Math.hypot(x - level.goal.x, z - level.goal.z) < (level.goal.r || 1) + 1.8) return false;
  // No sobre trampas ni portales (con holgura).
  for (const t of level.traps || []) { if (Math.hypot(x - t.x, z - t.z) < (t.r || 1) + 0.9) return false; }
  for (const p of level.portals || []) { if (Math.hypot(x - p.x, z - p.z) < (p.r || 1) + 0.9) return false; }
  // No dentro de muros (+ margen de la bola).
  for (const w of level.walls || []) {
    if (Math.abs(x - w.x) < w.w / 2 + 0.6 && Math.abs(z - w.z) < w.d / 2 + 0.6) return false;
  }
  // Separación de monedas/estrella ya colocadas.
  for (const o of occupied || []) { if (Math.hypot(x - o.x, z - o.z) < 1.7) return false; }
  return true;
}

/**
 * Coloca el cohete del nivel (si lo lleva) en un sitio válido. Determinista por nivel.
 * @returns {{x,z,type}|null}
 */
export function generateRocket(level, levelIndex, occupied) {
  const id = level.id || levelIndex + 1;
  const type = rocketTypeForLevel(id);
  if (!type) return null;
  const b = footprintBounds(level.footprint);
  const rng = mulberry32(((id * 7919) + 13) >>> 0);
  for (let tries = 0; tries < 800; tries++) {
    const x = b.minX + rng() * b.width;
    const z = b.minZ + rng() * b.depth;
    if (isValidRocketSpot(level, x, z, occupied)) return { x, z, type };
  }
  return null; // sin sitio válido: ese intento se queda sin cohete (no rompe nada)
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
