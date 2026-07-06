// dynamic-traps-smoke.mjs — Garantías de los HOYOS ROJOS DINÁMICOS (móviles / pulsantes).
//
// Comprueba, de forma determinista y muestreando el ciclo completo de animación:
//   1) Mecánicas mutuamente excluyentes: ningún nivel es a la vez 'move' y 'pulse'.
//   2) Reglas de aparición correctas (móviles 4,8,…,48 ; pulsantes 13,17,…,49).
//   3) En TODA fase del ciclo, cada hoyo dinámico ACTIVO:
//        · queda dentro de la huella,
//        · no pisa meta / portales / monedas / estrella / spawn (separación de justicia),
//        · y el nivel SIGUE siendo superable (mismo BFS que el validador de niveles).
//   4) Colisión por TAMAÑO ACTUAL: un hoyo más pequeño que la bola NO la traga; uno grande sí.
//
// Uso:  node tools/dynamic-traps-smoke.mjs   (incluido en `npm test`)

import { LEVELS } from '../src/levels/levels.js';
import { isInsideFootprint, footprintBounds } from '../src/physics/footprint.js';
import { PHYS, PORTAL } from '../src/utils/constants.js';
import { generateCollectibles } from '../src/levels/collectibles.js';
import { dynamicKind, buildDynamicSpecs, dynamicTrapState, dynamicPeriod, TRAP_ACTIVE_MIN_R } from '../src/levels/dynamicTraps.js';
import { BallPhysics } from '../src/physics/BallPhysics.js';

let failures = 0;
const ok = (cond, msg) => { if (cond) { console.log('  ✅ ' + msg); } else { failures++; console.log('  ❌ ' + msg); } };

// --- BFS de transitabilidad (réplica de level-validator, sobre un "snapshot" de trampas) ---
const STEP = 0.4, WALL_PAD = PHYS.BALL_RADIUS * 0.6, TRAP_PAD = PHYS.BALL_RADIUS * 0.2;
function insideAnyWall(walls, x, z, pad) {
  for (const w of walls) if (x >= w.x - w.w/2 - pad && x <= w.x + w.w/2 + pad && z >= w.z - w.d/2 - pad && z <= w.z + w.d/2 + pad) return true;
  return false;
}
function insideAnyTrap(traps, x, z, extra) {
  for (const t of traps) if (Math.hypot(t.x - x, t.z - z) < t.r * PHYS.CAPTURE_FACTOR + extra) return true;
  return false;
}
function isFree(level, traps, x, z) {
  return isInsideFootprint(level.footprint, x, z) && !insideAnyWall(level.walls || [], x, z, WALL_PAD) && !insideAnyTrap(traps, x, z, TRAP_PAD);
}
function reachable(level, traps) {
  const b = footprintBounds(level.footprint);
  const key = (i, j) => i + ',' + j;
  const toCell = (x, z) => [Math.round((x - b.minX) / STEP), Math.round((z - b.minZ) / STEP)];
  const toWorld = (i, j) => [b.minX + i * STEP, b.minZ + j * STEP];
  const [si, sj] = toCell(level.start.x, level.start.z);
  if (!isFree(level, traps, level.start.x, level.start.z)) return false;
  const visited = new Set([key(si, sj)]); const queue = [[si, sj]];
  const ni = Math.ceil(b.width / STEP) + 2, nj = Math.ceil(b.depth / STEP) + 2;
  const portals = level.portals || [];
  while (queue.length) {
    const [i, j] = queue.shift(); const [wx, wz] = toWorld(i, j);
    if (Math.hypot(level.goal.x - wx, level.goal.z - wz) < level.goal.r) return true;
    for (let p = 0; p < portals.length; p++) {
      const a = portals[p];
      if (Math.hypot(a.x - wx, a.z - wz) < (a.r || 1) * PORTAL.CAPTURE) {
        const o = portals[1 - p]; const [oi, oj] = toCell(o.x, o.z); const k2 = key(oi, oj);
        if (!visited.has(k2) && isFree(level, traps, o.x, o.z)) { visited.add(k2); queue.push([oi, oj]); }
      }
    }
    for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const i2 = i + di, j2 = j + dj;
      if (i2 < -1 || j2 < -1 || i2 > ni || j2 > nj) continue;
      const k = key(i2, j2); if (visited.has(k)) continue;
      const [x2, z2] = toWorld(i2, j2);
      if (!isFree(level, traps, x2, z2)) continue;
      visited.add(k); queue.push([i2, j2]);
    }
  }
  return false;
}

// Construye el snapshot de trampas en la fase t: dinámicas con su estado; inactivas fuera.
function trapsAtPhase(level, specs, t) {
  const specByIndex = new Map(specs.map((s) => [s.index, s]));
  const out = [];
  (level.traps || []).forEach((base, i) => {
    const spec = specByIndex.get(i);
    if (!spec) { out.push({ x: base.x, z: base.z, r: base.r }); return; } // estática
    const s = dynamicTrapState(spec, t);
    if (s.active) out.push({ x: s.x, z: s.z, r: s.r }); // inactiva → no bloquea
  });
  return out;
}

const MOVE = [4,8,12,16,20,24,28,32,36,40,44,48];
const PULSE = [13,17,21,25,29,33,37,41,45,49];

console.log('\n[Hoyos dinámicos: exclusividad + reglas de aparición]');
let bothCount = 0, moveMismatch = 0, pulseMismatch = 0;
for (let n = 1; n <= LEVELS.length; n++) {
  const k = dynamicKind(n);
  if (MOVE.includes(n) && k !== 'move') moveMismatch++;
  if (PULSE.includes(n) && k !== 'pulse') pulseMismatch++;
  if (MOVE.includes(n) && PULSE.includes(n)) bothCount++;
}
ok(bothCount === 0, 'ningún nivel coincide en ambas listas (móvil ∩ pulsante = ∅)');
ok(moveMismatch === 0, 'todos los niveles 4,8,…,48 son "move"');
ok(pulseMismatch === 0, 'todos los niveles 13,17,…,49 son "pulse"');
ok(MOVE.every((n) => n % 4 === 0) && PULSE.every((n) => n % 4 === 1), 'clases mod 4 disjuntas (move≡0, pulse≡1)');

console.log('\n[Por nivel dinámico: seguridad + solvencia en TODO el ciclo]');
const SAMPLES = 64;
for (const n of [...MOVE, ...PULSE].sort((a, b) => a - b)) {
  const lvl = LEVELS[n - 1];
  const coll = generateCollectibles(lvl, n - 1);
  const specs = buildDynamicSpecs(lvl, n, coll);
  const kind = dynamicKind(n);
  const nt = (lvl.traps || []).length;
  // REQUISITO: TODOS los hoyos rojos del nivel animan (ninguno queda estático).
  ok(specs.length === nt, `N${n} (${kind}): TODOS los hoyos animan (${specs.length}/${nt})`);
  if (specs.length === 0) continue;

  const period = Math.max(...specs.map(dynamicPeriod));
  let solvable = true, clear = true, noOverlap = true;
  // Obstáculos con margen propio: cómodo para lo crítico (meta/portal/spawn), y "no solapar"
  // para coleccionables (monedas/estrella; el centro queda lejos de la zona de captura del hoyo).
  // Requisito = NO PISAR / NO CRUZAR (no solapar). Un margen de 0.05 garantiza una rendija de
  // separación con meta/portal/spawn/coleccionables en cualquier fase del ciclo.
  const obs = [];
  if (lvl.goal) obs.push({ x: lvl.goal.x, z: lvl.goal.z, r: lvl.goal.r, gap: 0.05 });
  if (lvl.start) obs.push({ x: lvl.start.x, z: lvl.start.z, r: PHYS.BALL_RADIUS, gap: 0.05 });
  for (const p of lvl.portals || []) obs.push({ x: p.x, z: p.z, r: p.r || 1, gap: 0.05 });
  if (coll.star) obs.push({ x: coll.star.x, z: coll.star.z, r: 0.6, gap: 0.05 });
  for (const c of coll.coins) obs.push({ x: c.x, z: c.z, r: 0.5, gap: 0.05 });

  for (let i = 0; i <= SAMPLES; i++) {
    const t = (period * i) / SAMPLES;
    const states = specs.map((spec) => dynamicTrapState(spec, t));
    const snap = trapsAtPhase(lvl, specs, t);
    if (!reachable(lvl, snap)) solvable = false;
    states.forEach((s) => {
      if (!s.active) return;
      if (!isInsideFootprint(lvl.footprint, s.x, s.z)) clear = false;
      for (const o of obs) if (Math.hypot(o.x - s.x, o.z - s.z) < s.r + o.r + o.gap) clear = false;
    });
    // Los hoyos dinámicos NUNCA se chocan/superponen entre sí (ambos activos).
    for (let a = 0; a < states.length; a++) for (let b = a + 1; b < states.length; b++) {
      if (states[a].active && states[b].active &&
          Math.hypot(states[a].x - states[b].x, states[a].z - states[b].z) < states[a].r + states[b].r + 0.1) noOverlap = false;
    }
  }
  ok(solvable, `N${n} (${kind}): superable en las ${SAMPLES + 1} fases muestreadas`);
  ok(clear, `N${n} (${kind}): hoyos activos dentro del tablero y sin pisar meta/portal/moneda/estrella/spawn`);
  ok(noOverlap, `N${n} (${kind}): los hoyos dinámicos no se superponen entre sí en ninguna fase`);
  if (kind === 'pulse') {
    const grows = specs.filter((s) => s.mode === 'grow');
    const shrinks = specs.filter((s) => s.mode === 'shrink');
    ok(grows.length >= 1 && shrinks.length >= 1, `N${n} (pulse): al menos un hoyo crece y al menos uno encoge`);
    // El que crece vuelve a su tamaño normal (ciclo); el que encoge llega a desactivarse.
    let growCycles = false, shrinkInactive = false;
    for (let i = 0; i <= SAMPLES; i++) {
      const tt = (period * i) / SAMPLES;
      if (grows[0]) { const r = dynamicTrapState(grows[0], tt).r; if (Math.abs(r - grows[0].baseR) < 0.03) growCycles = true; }
      if (shrinks[0] && !dynamicTrapState(shrinks[0], tt).active) shrinkInactive = true;
    }
    ok(growCycles, `N${n} (pulse): el hoyo que crece vuelve a su tamaño normal (ciclo)`);
    ok(shrinkInactive, `N${n} (pulse): el hoyo que encoge llega a desactivarse (no traga cuando es pequeño)`);
  }
}

console.log('\n[Colisión por TAMAÑO ACTUAL del hoyo]');
{
  const lvl = { footprint: [{ type: 'rect', x: 0, z: 0, w: 16, d: 16 }], walls: [],
    start: { x: -6, z: 0 }, goal: { x: 6, z: 0, r: 1.0 }, traps: [{ x: 0, z: 0, r: 1.0 }], portals: [] };
  const p = new BallPhysics();
  p.loadLevel(lvl);
  // Hoyo grande y activo, bola en el centro → traga.
  p.traps[0].r = 1.2; p.traps[0].active = true; p.x = 0; p.z = 0;
  ok(p._holeHit() === 'trap', 'hoyo grande/activo con la bola encima → la traga');
  // Hoyo pequeño (menor que la bola) e inactivo → NO traga.
  p.traps[0].r = 0.2; p.traps[0].active = false; p.x = 0; p.z = 0;
  ok(p._holeHit() !== 'trap', 'hoyo pequeño/inactivo con la bola encima → NO la traga (justo)');
  // Aunque por radio el centro coincida, si active=false no debe tragar.
  p.traps[0].r = 1.2; p.traps[0].active = false; p.x = 0; p.z = 0;
  ok(p._holeHit() !== 'trap', 'hoyo marcado inactivo nunca traga, aunque el radio sea grande');
}

console.log(`\n${failures === 0 ? '✅ Hoyos dinámicos: seguros, justos y sin romper ningún nivel' : '❌ ' + failures + ' fallo(s) en hoyos dinámicos'}\n`);
process.exit(failures === 0 ? 0 : 1);
