// collectibles-smoke.mjs — Verifica la colocación de coleccionables en TODOS los
// niveles: dentro de la huella, fuera de hoyos/trampas/inicio, determinista, y con
// estrella-token cada 2 niveles. Sin navegador.
//
// Uso:  node tools/collectibles-smoke.mjs

import { LEVELS } from '../src/levels/levels.js';
import { generateCollectibles } from '../src/levels/collectibles.js';
import { isInsideFootprint } from '../src/physics/footprint.js';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ❌ ' + msg); } };

let totalCoins = 0, totalStars = 0;
for (let idx = 0; idx < LEVELS.length; idx++) {
  const lvl = LEVELS[idx];
  const a = generateCollectibles(lvl, idx);
  const b = generateCollectibles(lvl, idx);

  ok(JSON.stringify(a) === JSON.stringify(b), `Nivel ${lvl.id}: colocación determinista`);
  ok(a.coins.length >= 3, `Nivel ${lvl.id}: ≥3 monedas (tiene ${a.coins.length})`);

  for (const c of a.coins) {
    ok(isInsideFootprint(lvl.footprint, c.x, c.z), `Nivel ${lvl.id}: moneda dentro de la huella`);
    ok(Math.hypot(c.x - lvl.start.x, c.z - lvl.start.z) >= 2.0, `Nivel ${lvl.id}: moneda lejos del inicio`);
    if (lvl.goal) ok(Math.hypot(c.x - lvl.goal.x, c.z - lvl.goal.z) >= lvl.goal.r, `Nivel ${lvl.id}: moneda no sobre la meta`);
    for (const t of lvl.traps || []) ok(Math.hypot(c.x - t.x, c.z - t.z) >= t.r, `Nivel ${lvl.id}: moneda no sobre una trampa`);
  }
  totalCoins += a.coins.length;

  if ((idx + 1) % 2 === 0) {
    ok(!!a.star, `Nivel ${lvl.id} (par): tiene estrella especial`);
    if (a.star) {
      ok(isInsideFootprint(lvl.footprint, a.star.x, a.star.z), `Nivel ${lvl.id}: estrella dentro de la huella`);
      totalStars++;
    }
  } else {
    ok(!a.star, `Nivel ${lvl.id} (impar): sin estrella especial`);
  }
}

console.log(`\n  Monedas totales colocadas: ${totalCoins}  ·  Estrellas especiales: ${totalStars}`);
console.log(`\n${fails === 0 ? '✅ Colocación de coleccionables OK' : '❌ ' + fails + ' fallo(s)'}`);
process.exit(fails === 0 ? 0 : 1);
