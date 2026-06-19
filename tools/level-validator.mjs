// level-validator.mjs — Garantiza que NINGÚN nivel sea imposible o esté mal montado.
//
// Para cada nivel comprueba:
//   1) start y goal dentro de la huella;
//   2) start NO dentro de un muro ni de una trampa;
//   3) goal NO solapado por un muro;
//   4) EXISTE un camino transitable start → borde de la meta esquivando muros y
//      trampas (BFS sobre rejilla; cada celda libre debe dejar pasar la bola).
//
// Uso:  node tools/level-validator.mjs   (se ejecuta también en `npm test`)

import { LEVELS } from '../src/levels/levels.js';
import { isInsideFootprint, footprintBounds } from '../src/physics/footprint.js';
import { PHYS } from '../src/utils/constants.js';

const STEP = 0.4;                       // resolución de la rejilla
const WALL_PAD = PHYS.BALL_RADIUS * 0.6; // margen de la bola contra muros
const TRAP_PAD = PHYS.BALL_RADIUS * 0.2; // margen para no rozar trampas

function insideAnyWall(walls, x, z, pad) {
  for (const w of walls) {
    if (x >= w.x - w.w / 2 - pad && x <= w.x + w.w / 2 + pad &&
        z >= w.z - w.d / 2 - pad && z <= w.z + w.d / 2 + pad) return true;
  }
  return false;
}

function insideAnyTrap(traps, x, z, extra) {
  for (const t of traps) {
    if (Math.hypot(t.x - x, t.z - z) < t.r * PHYS.CAPTURE_FACTOR + extra) return true;
  }
  return false;
}

function isFree(level, x, z) {
  return isInsideFootprint(level.footprint, x, z) &&
    !insideAnyWall(level.walls || [], x, z, WALL_PAD) &&
    !insideAnyTrap(level.traps || [], x, z, TRAP_PAD);
}

/** BFS sobre rejilla: ¿hay camino libre de start hasta el borde de la meta? */
function reachable(level) {
  const b = footprintBounds(level.footprint);
  const key = (i, j) => i + ',' + j;
  const toCell = (x, z) => [Math.round((x - b.minX) / STEP), Math.round((z - b.minZ) / STEP)];
  const toWorld = (i, j) => [b.minX + i * STEP, b.minZ + j * STEP];

  const [si, sj] = toCell(level.start.x, level.start.z);
  if (!isFree(level, level.start.x, level.start.z)) return { ok: false, reason: 'start no es transitable' };

  const visited = new Set();
  const queue = [[si, sj]];
  visited.add(key(si, sj));
  const ni = Math.ceil(b.width / STEP) + 2;
  const nj = Math.ceil(b.depth / STEP) + 2;

  while (queue.length) {
    const [i, j] = queue.shift();
    const [wx, wz] = toWorld(i, j);
    if (Math.hypot(level.goal.x - wx, level.goal.z - wz) < level.goal.r) {
      return { ok: true };
    }
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const i2 = i + di, j2 = j + dj;
      if (i2 < -1 || j2 < -1 || i2 > ni || j2 > nj) continue;
      const k = key(i2, j2);
      if (visited.has(k)) continue;
      const [x2, z2] = toWorld(i2, j2);
      if (!isFree(level, x2, z2)) continue;
      visited.add(k);
      queue.push([i2, j2]);
    }
  }
  return { ok: false, reason: 'la meta no es alcanzable evitando muros/trampas' };
}

let failures = 0;
console.log(`\nValidando ${LEVELS.length} niveles...\n`);
for (const lvl of LEVELS) {
  const issues = [];
  if (!isInsideFootprint(lvl.footprint, lvl.start.x, lvl.start.z)) issues.push('start fuera de la huella');
  if (!isInsideFootprint(lvl.footprint, lvl.goal.x, lvl.goal.z)) issues.push('goal fuera de la huella');
  if (insideAnyWall(lvl.walls || [], lvl.start.x, lvl.start.z, 0)) issues.push('start dentro de un muro');
  if (insideAnyTrap(lvl.traps || [], lvl.start.x, lvl.start.z, PHYS.BALL_RADIUS)) issues.push('start dentro de una trampa');
  if (insideAnyWall(lvl.walls || [], lvl.goal.x, lvl.goal.z, 0)) issues.push('goal solapado por un muro');
  for (const t of lvl.traps || []) {
    if (Math.hypot(t.x - lvl.goal.x, t.z - lvl.goal.z) < t.r + lvl.goal.r) issues.push('trampa demasiado pegada a la meta');
  }
  const r = reachable(lvl);
  if (!r.ok) issues.push(r.reason);

  const status = issues.length === 0 ? '✅' : '❌';
  console.log(`${status} Nivel ${lvl.id} (${lvl.name}) — trampas:${(lvl.traps || []).length} muros:${(lvl.walls || []).length}`);
  for (const i of issues) console.log(`     ↳ ${i}`);
  if (issues.length) failures++;
}

console.log(`\n${failures === 0 ? '✅ Los ' + LEVELS.length + ' niveles son válidos y superables' : '❌ ' + failures + ' nivel(es) con problemas'}\n`);
process.exit(failures === 0 ? 0 : 1);
