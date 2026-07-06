// dynamicTraps.js — Hoyos rojos DINÁMICOS (trampas con comportamiento especial).
//
//   · MÓVILES  → niveles 4, 8, 12, …, 48  (levelNum % 4 === 0, ≥ 4).
//       TODOS los hoyos rojos del nivel se desplazan, cada uno con su PROPIO patrón
//       (horizontal / vertical / circular / diagonal) y su propio DESFASE, de forma suave y
//       predecible (sin azar). Nunca se solapan entre sí (amplitudes acotadas por distancia
//       + pasada final de resolución de solapamientos). Conservan su radio (siempre activos).
//   · PULSANTES → niveles 13, 17, 21, …, 49  (levelNum % 4 === 1, ≥ 13).
//       TODOS los hoyos cambian de tamaño, ALTERNANDO comportamiento: unos CRECEN↔normal (más
//       peligrosos cuando son grandes) y otros ENCOGEN↔normal hasta casi desaparecer (inactivos
//       cuando son menores que la bola). Animación senoidal suave; al menos uno crece y uno encoge.
//
// Las dos mecánicas NUNCA coinciden: 'move' vive en la clase ≡0 (mod 4) y 'pulse' en ≡1.
//
// Todo es PURO y determinista. `tools/dynamic-traps-smoke.mjs` muestrea el ciclo completo y
// garantiza, con el MISMO BFS que el validador, que ningún nivel se vuelve imposible y que los
// hoyos no se solapan ni pisan meta/portales/monedas/estrella/spawn.

import { PHYS } from '../utils/constants.js';
import { isInsideFootprint } from '../physics/footprint.js';

const BALL_R = PHYS.BALL_RADIUS;                 // 0.5
// Por debajo de este radio el hoyo NO puede tragarse la bola (queda inactivo como trampa).
export const TRAP_ACTIVE_MIN_R = BALL_R + 0.05;  // ~0.55
const SAFE_GAP = BALL_R + 0.2;   // margen cómodo a meta/portal/spawn (~0.7)
// Coleccionables (monedas/estrella): solo "no solaparlos" con holgura fina. El centro del
// coleccionable queda muy lejos de la zona de captura del hoyo (r·0.66), así que recogerlo es
// justo aunque un hoyo pase cerca; esto permite que TODOS los hoyos puedan moverse.
const ITEM_GAP = 0.12;
const PAIR_GAP = 0.35;            // separación mínima ENTRE hoyos dinámicos (no se tocan)
const TWO_PI = Math.PI * 2;
const MOVE_PATTERNS = ['h', 'v', 'circle', 'diagonal'];

/** Mecánica dinámica del nivel: 'move' | 'pulse' | null. Mutuamente excluyentes (mod 4). */
export function dynamicKind(levelNum) {
  if (levelNum >= 4 && levelNum % 4 === 0) return 'move';
  if (levelNum >= 13 && levelNum % 4 === 1) return 'pulse';
  return null;
}

/** Obstáculos a respetar SIEMPRE (centro, radio efectivo y margen propio). */
function obstacles(level, collectibles) {
  const out = [];
  if (level.goal) out.push({ x: level.goal.x, z: level.goal.z, r: level.goal.r, gap: SAFE_GAP });
  if (level.start) out.push({ x: level.start.x, z: level.start.z, r: BALL_R, gap: SAFE_GAP });
  for (const p of level.portals || []) out.push({ x: p.x, z: p.z, r: p.r || 1, gap: SAFE_GAP });
  if (collectibles && collectibles.star) out.push({ x: collectibles.star.x, z: collectibles.star.z, r: 0.6, gap: ITEM_GAP });
  for (const c of (collectibles && collectibles.coins) || []) out.push({ x: c.x, z: c.z, r: 0.5, gap: ITEM_GAP });
  return out;
}

/** ¿Un hoyo de radio r en (x,z) está dentro de la huella y separado de los obstáculos? */
function spotClear(level, obs, x, z, r) {
  if (!isInsideFootprint(level.footprint, x, z)) return false;
  for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
    if (!isInsideFootprint(level.footprint, x + dx, z + dz)) return false;
  }
  for (const o of obs) if (Math.hypot(o.x - x, o.z - z) < r + o.r + o.gap) return false;
  return true;
}

/** Muestrea posiciones de un patrón de movimiento (extremos + intermedios). */
function pathSamples(pattern, cx, cz, amp) {
  if (pattern === 'circle') {
    const pts = [];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TWO_PI; pts.push([cx + amp * Math.cos(a), cz + amp * Math.sin(a)]); }
    return pts;
  }
  const dirs = { h: [1, 0], v: [0, 1], diagonal: [0.7071, 0.7071] };
  const [ax, az] = dirs[pattern] || dirs.h;
  return [
    [cx - amp * ax, cz - amp * az], [cx, cz], [cx + amp * ax, cz + amp * az],
    [cx - amp * 0.5 * ax, cz - amp * 0.5 * az], [cx + amp * 0.5 * ax, cz + amp * 0.5 * az],
  ];
}

/** Mayor amplitud (≤ cap) con la que TODO el recorrido queda despejado, o 0 si no hay. */
function safeAmplitude(level, obs, pattern, cx, cz, baseR, cap) {
  for (let amp = cap; amp >= 0.4; amp -= 0.1) {
    if (pathSamples(pattern, cx, cz, amp).every(([x, z]) => spotClear(level, obs, x, z, baseR))) return Math.round(amp * 100) / 100;
  }
  return 0;
}

/** Mayor radio máximo (≤ maxTarget) con el que un hoyo que crece sigue despejado, o 0. */
function safeMaxR(level, obs, cx, cz, baseR, maxTarget) {
  for (let r = maxTarget; r >= baseR + 0.12; r -= 0.08) {
    if (spotClear(level, obs, cx, cz, r)) return Math.round(r * 100) / 100;
  }
  return 0;
}

function dist(a, b) { return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)); }

/** Tope de amplitud de la trampa i para que su disco barrido no alcance al de ninguna otra. */
function pairAmpCap(traps, i) {
  let cap = Infinity;
  for (let j = 0; j < traps.length; j++) {
    if (j === i) continue;
    const d = dist(traps[i], traps[j]);
    cap = Math.min(cap, (d - traps[i].r - traps[j].r - PAIR_GAP) / 2);
  }
  return Math.max(0, cap);
}

/** Construye las specs de hoyos dinámicos del nivel (TODOS los hoyos) o [] si no aplica. */
export function buildDynamicSpecs(level, levelNum, collectibles) {
  const kind = dynamicKind(levelNum);
  const traps = level.traps || [];
  if (!kind || traps.length === 0) return [];
  const obs = obstacles(level, collectibles);

  if (kind === 'move') {
    const occ = (levelNum - 4) / 4;
    const speed = Math.min(0.5 + occ * 0.05, 0.95);     // lento en N4, sube gradual (cap)
    const ampTarget = Math.min(1.5 + occ * 0.16, 2.8);
    const specs = [];
    traps.forEach((t, i) => {
      const cap = Math.min(ampTarget, pairAmpCap(traps, i));
      if (cap < 0.4) return; // sin sitio para moverse sin chocar → estática (justificado)
      // Patrón preferido por índice (variedad/desfase); si no rinde, el de mayor amplitud segura.
      const want = MOVE_PATTERNS[i % MOVE_PATTERNS.length];
      let best = { amp: safeAmplitude(level, obs, want, t.x, t.z, t.r, cap), pattern: want };
      if (best.amp < 0.5) {
        for (const pat of MOVE_PATTERNS) {
          const a = safeAmplitude(level, obs, pat, t.x, t.z, t.r, cap);
          if (a > best.amp) best = { amp: a, pattern: pat };
        }
      }
      if (best.amp >= 0.4) {
        specs.push({ index: i, mode: 'move', pattern: best.pattern, cx: t.x, cz: t.z, baseR: t.r,
          amp: best.amp, speed, phase: (i * 1.7) % TWO_PI });
      }
    });
    return resolveOverlaps(specs);
  }

  // kind === 'pulse': TODOS los hoyos cambian de tamaño, alternando crecer/encoger.
  const occ = (levelNum - 13) / 4;
  const speed = Math.min(0.55 + occ * 0.05, 1.0);       // lento/claro en N13, sube gradual
  const minR = 0.12;
  const growTarget = (r) => Math.min(r * 1.7, r + 1.0); // crecimiento NOTORIO (acotado luego)
  const specs = [];
  traps.forEach((t, i) => {
    const wantGrow = i % 2 === 0; // alterna por índice
    if (wantGrow) {
      // crecer: acotar el radio máximo contra obstáculos Y contra las OTRAS trampas (su base).
      const obsT = obs.concat(traps.filter((_, j) => j !== i).map((o) => ({ x: o.x, z: o.z, r: o.r, gap: PAIR_GAP })));
      const maxR = safeMaxR(level, obsT, t.x, t.z, t.r, growTarget(t.r));
      if (maxR >= t.r + 0.15) { specs.push({ index: i, mode: 'grow', cx: t.x, cz: t.z, baseR: t.r, maxR, minR, speed, phase: (i * 1.3) % TWO_PI }); return; }
    }
    // encoger (siempre seguro: solo se hace más pequeño).
    specs.push({ index: i, mode: 'shrink', cx: t.x, cz: t.z, baseR: t.r, maxR: t.r, minR, speed, phase: (i * 1.3) % TWO_PI });
  });
  ensureBothBehaviours(specs, level, obs, traps, minR, speed);
  return resolveOverlaps(specs);
}

/** Garantiza ≥1 hoyo que crece y ≥1 que encoge (si hay ≥2 trampas). */
function ensureBothBehaviours(specs, level, obs, traps, minR, speed) {
  if (specs.length < 2) return;
  const hasGrow = specs.some((s) => s.mode === 'grow');
  const hasShrink = specs.some((s) => s.mode === 'shrink');
  if (!hasGrow) {
    // forzar que crezca el que tenga más holgura
    let best = null;
    for (const s of specs) {
      const obsT = obs.concat(traps.filter((_, j) => j !== s.index).map((o) => ({ x: o.x, z: o.z, r: o.r, gap: PAIR_GAP })));
      const maxR = safeMaxR(level, obsT, s.cx, s.cz, s.baseR, Math.min(s.baseR * 1.7, s.baseR + 1.0));
      if (maxR >= s.baseR + 0.15 && (!best || maxR > best.maxR)) best = { s, maxR };
    }
    if (best) { best.s.mode = 'grow'; best.s.maxR = best.maxR; }
  }
  if (!hasShrink) { const s = specs.find((x) => x.mode === 'grow') || specs[0]; s.mode = 'shrink'; s.maxR = s.baseR; }
}

/**
 * Pasada final de SEGURIDAD: si dos hoyos dinámicos se solapan en alguna fase, reduce el de
 * mayor tamaño (amplitud / radio máx) hasta que dejen de tocarse. Garantía determinista de
 * "nunca se chocan ni se superponen". Devuelve las specs que conservan animación apreciable.
 */
function resolveOverlaps(specs) {
  if (specs.length < 2) return specs;
  const SAMP = 48;
  const period = Math.max(...specs.map(dynamicPeriod), 1);
  for (let iter = 0; iter < 60; iter++) {
    let hit = null;
    for (let k = 0; k <= SAMP && !hit; k++) {
      const t = (period * k) / SAMP;
      const st = specs.map((s) => dynamicTrapState(s, t));
      for (let i = 0; i < st.length && !hit; i++) for (let j = i + 1; j < st.length; j++) {
        if (!st[i].active || !st[j].active) continue;
        if (Math.hypot(st[i].x - st[j].x, st[i].z - st[j].z) < st[i].r + st[j].r + PAIR_GAP) { hit = [specs[i], specs[j]]; break; }
      }
    }
    if (!hit) break;
    const size = (s) => (s.mode === 'move' ? s.amp : s.mode === 'grow' ? s.maxR : 0);
    const big = size(hit[0]) >= size(hit[1]) ? hit[0] : hit[1];
    if (big.mode === 'move') big.amp = Math.max(0, Math.round((big.amp - 0.12) * 100) / 100);
    else if (big.mode === 'grow') big.maxR = Math.max(big.baseR, Math.round((big.maxR - 0.12) * 100) / 100);
    else break; // solo encogen (no causan solape): nada que reducir
  }
  // Descarta specs sin animación apreciable (quedan como trampa estática normal).
  return specs.filter((s) => (s.mode === 'move' ? s.amp >= 0.3 : s.mode === 'grow' ? s.maxR > s.baseR + 0.1 : true));
}

/**
 * Estado de un hoyo dinámico en el tiempo t (s): { x, z, r, active }. PURO. Animación senoidal
 * suave (sin saltos). La colisión usa r/active actuales. El `phase` desincroniza los hoyos.
 */
export function dynamicTrapState(spec, t) {
  const ph = spec.speed * t + (spec.phase || 0);
  if (spec.mode === 'move') {
    if (spec.pattern === 'circle') return { x: spec.cx + spec.amp * Math.cos(ph), z: spec.cz + spec.amp * Math.sin(ph), r: spec.baseR, active: true };
    const s = Math.sin(ph) * spec.amp;
    if (spec.pattern === 'v') return { x: spec.cx, z: spec.cz + s, r: spec.baseR, active: true };
    if (spec.pattern === 'diagonal') return { x: spec.cx + s * 0.7071, z: spec.cz + s * 0.7071, r: spec.baseR, active: true };
    return { x: spec.cx + s, z: spec.cz, r: spec.baseR, active: true }; // horizontal
  }
  // pulse: u va 0→1→0 de forma suave.
  const u = 0.5 - 0.5 * Math.cos(ph);
  const r = spec.mode === 'grow' ? spec.baseR + (spec.maxR - spec.baseR) * u : spec.baseR - (spec.baseR - spec.minR) * u;
  return { x: spec.cx, z: spec.cz, r, active: r >= TRAP_ACTIVE_MIN_R };
}

/** Periodo (s) del ciclo de una spec (para muestrear el validador). */
export function dynamicPeriod(spec) { return TWO_PI / (spec.speed || 1); }
