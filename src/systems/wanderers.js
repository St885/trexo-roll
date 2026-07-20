// wanderers.js — Lógica PURA (sin THREE, sin DOM) de los CAVERNÍCOLAS NÓMADAS ambientales
// que pueblan los mundos 11–12 (niveles con `extraCavemen`). Son caminantes de patrulla
// aleatoria (wander) que dan vida al mapa SIN interactuar con la bola: nunca la empujan ni
// la dañan (obstáculo puramente visual/ambiental). El cavernícola con lanza (peligroso) sigue
// siendo el de los niveles múltiplos de 5; esto es un sistema aparte.
//
// Al ser puro y determinista bajo un `rng` inyectable, es 100% testeable en Node
// (tools/cavemen-wander-smoke.mjs) sin escena ni navegador.

import { isInsideFootprint } from '../physics/footprint.js';

// Parámetros del nómada (radio del cuerpo, márgenes de seguridad). Ajustados para móvil.
export const WANDER = {
  R: 0.5,            // radio del cuerpo del cavernícola
  HOLE_MARGIN: 0.6,  // holgura extra a CUALQUIER hoyo (cubre también la oscilación de trampas dinámicas)
  START_MIN: 3.0,    // distancia mínima a la bola inicial (no aparecer encima ni acosar al arrancar)
  OTHER_MIN: 1.4,    // separación mínima entre dos nómadas (no se enciman)
  EDGE_PAD: 0.8,     // margen a los bordes del tablero (no caen)
  WANDER_MIN: 2.0,   // radio mínimo del próximo destino local
  WANDER_MAX: 5.0,   // radio máximo del próximo destino local
};

/** Separación mínima al hoyo verde (meta): no lo tapa ni bloquea su entrada. */
export function goalMinFor(goalR) {
  return Math.max(2.4, (goalR || 1) + WANDER.R + 1.1);
}

/**
 * ¿Es (x,z) una posición SEGURA para un nómada?
 * cfg: { footprint, bounds:{minX,maxX,minZ,maxZ}, traps:[{x,z,r}], portals:[{x,z,r}],
 *        goal:{x,z,r}, start:{x,z} }
 * others: [{x,z}] otros nómadas ya colocados (para no encimarse).
 * Valida: bordes, huella (con holgura del cuerpo), meta, bola inicial, TODOS los hoyos y otros.
 */
export function isPositionSafeForCaveman(x, z, cfg, others = []) {
  if (!cfg) return false;
  const b = cfg.bounds;
  if (b && (x < b.minX + WANDER.EDGE_PAD || x > b.maxX - WANDER.EDGE_PAD ||
            z < b.minZ + WANDER.EDGE_PAD || z > b.maxZ - WANDER.EDGE_PAD)) return false;
  if (cfg.footprint) {
    if (!isInsideFootprint(cfg.footprint, x, z)) return false;
    // El cuerpo ocupa espacio: sus 4 lados también deben estar dentro (no al borde del vacío).
    for (const [ox, oz] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) {
      if (!isInsideFootprint(cfg.footprint, x + ox, z + oz)) return false;
    }
  }
  const g = cfg.goal;
  if (g && Math.hypot(x - g.x, z - g.z) < goalMinFor(g.r)) return false;       // no sobre/junto a la meta
  const s = cfg.start;
  if (s && Math.hypot(x - s.x, z - s.z) < WANDER.START_MIN) return false;      // lejos de la bola inicial
  for (const t of cfg.traps || []) {                                          // ningún hoyo rojo
    if (Math.hypot(x - t.x, z - t.z) < (t.r || 1) + WANDER.R + WANDER.HOLE_MARGIN) return false;
  }
  for (const p of cfg.portals || []) {                                        // ni portales (también son hoyos)
    if (Math.hypot(x - p.x, z - p.z) < (p.r || 1) + WANDER.R + WANDER.HOLE_MARGIN) return false;
  }
  for (const o of others) {                                                   // sin encimarse a otro nómada
    if (o && Math.hypot(x - o.x, z - o.z) < WANDER.OTHER_MIN) return false;
  }
  return true;
}

/**
 * Devuelve una posición ALEATORIA y segura dentro del tablero, o null si tras `tries` intentos
 * no encuentra ninguna. `rng` es inyectable (()=>[0,1)) para tests deterministas.
 */
export function getSafeRandomPosition(cfg, rng = Math.random, others = [], tries = 40) {
  const b = cfg && cfg.bounds;
  if (!b) return null;
  for (let i = 0; i < tries; i++) {
    const x = b.minX + 1 + rng() * (b.maxX - b.minX - 2);
    const z = b.minZ + 1 + rng() * (b.maxZ - b.minZ - 2);
    if (isPositionSafeForCaveman(x, z, cfg, others)) return { x, z };
  }
  return null;
}

/**
 * Fallback DETERMINISTA (sin azar): escanea la banda alrededor de la meta a varios radios y
 * ángulos y devuelve el primer punto seguro, o null si el tablero no admite ninguno (teórico
 * en tableros válidos). Garantiza que NUNCA se devuelve un punto sobre un hoyo.
 */
export function getFallbackPosition(cfg, others = []) {
  const g = (cfg && cfg.goal) || { x: 0, z: 0, r: 1 };
  const gm = goalMinFor(g.r);
  for (const extra of [0.6, 1.4, 2.2, 3.0]) {
    for (let a = 0; a < 24; a++) {
      const ang = (a / 24) * Math.PI * 2;
      const x = g.x + Math.cos(ang) * (gm + extra), z = g.z + Math.sin(ang) * (gm + extra);
      if (isPositionSafeForCaveman(x, z, cfg, others)) return { x, z };
    }
  }
  return null;
}

/** Combina aleatorio + fallback: SIEMPRE intenta devolver una posición segura (o null extremo). */
export function pickSpawnPosition(cfg, rng = Math.random, others = []) {
  return getSafeRandomPosition(cfg, rng, others) || getFallbackPosition(cfg, others);
}

/**
 * ¿El segmento (x0,z0)→(x1,z1) está despejado? Muestrea el camino: ningún punto intermedio
 * puede caer en un hoyo/zona prohibida (evita que un nómada CRUCE un hoyo en línea recta).
 */
export function pathClearForCaveman(x0, z0, x1, z1, cfg, others = [], steps = 6) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    if (!isPositionSafeForCaveman(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, cfg, others)) return false;
  }
  return true;
}

/**
 * Elige un DESTINO local válido y con camino despejado para el wander. Devuelve {x,z} o null.
 * Prioriza destinos CERCANOS (patrulla local, predecible); si no encuentra, cae a cualquier
 * punto seguro del tablero.
 */
export function pickWanderTarget(from, cfg, rng = Math.random, others = []) {
  for (let tries = 0; tries < 18; tries++) {
    const ang = rng() * Math.PI * 2;
    const rad = WANDER.WANDER_MIN + rng() * (WANDER.WANDER_MAX - WANDER.WANDER_MIN);
    const x = from.x + Math.cos(ang) * rad, z = from.z + Math.sin(ang) * rad;
    if (isPositionSafeForCaveman(x, z, cfg, others) && pathClearForCaveman(from.x, from.z, x, z, cfg, others)) {
      return { x, z };
    }
  }
  const any = getSafeRandomPosition(cfg, rng, others);
  if (any && pathClearForCaveman(from.x, from.z, any.x, any.z, cfg, others)) return any;
  return null;
}
