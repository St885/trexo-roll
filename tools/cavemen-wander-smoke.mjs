// cavemen-wander-smoke.mjs — Valida los NIVELES NUEVOS (51–70) y los CAVERNÍCOLAS NÓMADAS
// (extraCavemen) usando la lógica PURA de spawn seguro (systems/wanderers.js), sin escena.
//
// Cubre los 12 puntos de QA pedidos: recuento y consecutividad de niveles, start/goal válidos,
// 2 nómadas por mapa nuevo, spawn nunca en hoyos/meta ni pegado al inicio ni fuera del tablero,
// fallback seguro, "reiniciar no duplica" (recuento estable), y niveles previos intactos.
//
// Uso:  node tools/cavemen-wander-smoke.mjs

import { LEVELS } from '../src/levels/levels.js';
import { isInsideFootprint, footprintBounds } from '../src/physics/footprint.js';
import {
  pickSpawnPosition, isPositionSafeForCaveman, getFallbackPosition,
  goalMinFor, WANDER,
} from '../src/systems/wanderers.js';

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

// RNG determinista (mulberry32): tests reproducibles sin Math.random.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NEW_FROM = 51, NEW_TO = 70, EXPECTED_TOTAL = 70;
const newLevels = LEVELS.filter((l) => l.id >= NEW_FROM && l.id <= NEW_TO);

console.log('\n[1–2 · Recuento y consecutividad de niveles]');
ok(LEVELS.length === EXPECTED_TOTAL, `hay ${EXPECTED_TOTAL} niveles en total (antes 50, +20)`);
ok(newLevels.length === 20, '20 niveles nuevos (51–70)');
let consecutive = true;
for (let i = 0; i < newLevels.length; i++) if (newLevels[i].id !== NEW_FROM + i) consecutive = false;
ok(consecutive, 'IDs 51..70 consecutivos y ordenados');

console.log('\n[3–5 · start/goal válidos y 2 nómadas por nivel]');
let startsOk = true, goalsOk = true, extraOk = true;
for (const l of newLevels) {
  if (!isInsideFootprint(l.footprint, l.start.x, l.start.z)) { startsOk = false; console.log(`     ↳ start fuera en nivel ${l.id}`); }
  if (!isInsideFootprint(l.footprint, l.goal.x, l.goal.z)) { goalsOk = false; console.log(`     ↳ goal fuera en nivel ${l.id}`); }
  if (l.extraCavemen !== 2) { extraOk = false; console.log(`     ↳ extraCavemen!=2 en nivel ${l.id}`); }
}
ok(startsOk, 'cada nivel nuevo tiene bola inicial dentro de la huella');
ok(goalsOk, 'cada nivel nuevo tiene meta dentro de la huella');
ok(extraOk, 'cada nivel nuevo declara exactamente 2 cavernícolas extra');

console.log('\n[6–10 · Spawn seguro: hoyos, meta, inicio, bordes, fallback]');
const SEEDS = 24; // muchas semillas → cubre la varianza del azar
let noHole = true, noGoal = true, farStart = true, inBoard = true, alwaysSpawns = true, noOverlap = true;
for (const l of newLevels) {
  const cfg = { footprint: l.footprint, bounds: footprintBounds(l.footprint), traps: l.traps || [], portals: l.portals || [], goal: l.goal, start: l.start };
  const gm = goalMinFor(l.goal.r);
  for (let s = 0; s < SEEDS; s++) {
    const rng = mulberry32(1000 + s * 7 + l.id);
    const placed = [];
    for (let k = 0; k < l.extraCavemen; k++) {
      const pos = pickSpawnPosition(cfg, rng, placed);
      if (!pos) { alwaysSpawns = false; continue; }
      // Es SEGURO según todas las reglas (redundante pero explícito):
      if (!isPositionSafeForCaveman(pos.x, pos.z, cfg, placed)) { noHole = false; }
      // No sobre ningún hoyo rojo:
      for (const t of cfg.traps) if (Math.hypot(pos.x - t.x, pos.z - t.z) < (t.r || 1) + WANDER.R) { noHole = false; }
      for (const p of cfg.portals) if (Math.hypot(pos.x - p.x, pos.z - p.z) < (p.r || 1) + WANDER.R) { noHole = false; }
      // No sobre la meta verde:
      if (Math.hypot(pos.x - l.goal.x, pos.z - l.goal.z) < gm) noGoal = false;
      // No demasiado cerca de la bola inicial:
      if (Math.hypot(pos.x - l.start.x, pos.z - l.start.z) < WANDER.START_MIN) farStart = false;
      // Dentro del tablero (huella):
      if (!isInsideFootprint(l.footprint, pos.x, pos.z)) inBoard = false;
      // No encimado a otro nómada ya colocado:
      for (const o of placed) if (Math.hypot(pos.x - o.x, pos.z - o.z) < WANDER.OTHER_MIN) noOverlap = false;
      placed.push(pos);
    }
  }
  // Fallback determinista: debe existir SIEMPRE una posición segura (tablero jugable).
  if (!getFallbackPosition(cfg)) alwaysSpawns = false;
}
ok(noHole, 'los nómadas NUNCA aparecen sobre un hoyo (trampa/portal)');
ok(noGoal, 'los nómadas NUNCA aparecen sobre/junto a la meta verde');
ok(farStart, `los nómadas aparecen lejos de la bola inicial (≥ ${WANDER.START_MIN})`);
ok(inBoard, 'los nómadas NUNCA aparecen fuera del tablero');
ok(noOverlap, 'los dos nómadas no se enciman entre sí');
ok(alwaysSpawns, 'el sistema de spawn SIEMPRE encuentra sitio (aleatorio + fallback seguro)');

console.log('\n[11 · Reiniciar no duplica: recuento estable]');
// Modela el reinicio: cada carga parte de una lista VACÍA y produce exactamente `count` nómadas.
let stableCount = true;
for (const l of newLevels.slice(0, 6)) {
  const cfg = { footprint: l.footprint, bounds: footprintBounds(l.footprint), traps: l.traps || [], portals: l.portals || [], goal: l.goal, start: l.start };
  for (let reload = 0; reload < 5; reload++) {
    const rng = mulberry32(50 + reload * 13 + l.id);
    const placed = [];
    for (let k = 0; k < l.extraCavemen; k++) { const p = pickSpawnPosition(cfg, rng, placed); if (p) placed.push(p); }
    if (placed.length !== l.extraCavemen) stableCount = false;
  }
}
ok(stableCount, 'cada (re)carga produce exactamente 2 nómadas (no se acumulan)');

console.log('\n[12 · Niveles existentes intactos]');
const oldLevels = LEVELS.filter((l) => l.id <= 50);
ok(oldLevels.length === 50, 'siguen existiendo los 50 niveles originales');
ok(oldLevels.every((l) => !l.extraCavemen), 'ningún nivel original tiene cavernícolas extra (solo 51–70)');

console.log(`\n${fails === 0 ? '✅ Niveles nuevos + cavernícolas nómadas OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
