// systems-smoke.mjs — Verifica la lógica PURA de los sistemas nuevos (sin navegador):
//   · levelEvents: jefes (10/20/30/40/50), clima por nivel, contrarreloj (11/22/33/44).
//   · daily: racha consecutiva, reinicio por hueco, no-reclamar-dos-veces, ciclo de 7.
//   · chest: tirada válida, premio de skin solo si quedan skins bloqueadas.
//   · skins: catálogo coherente (8 skins, clásica por defecto) y reglas de desbloqueo.
//
// Uso:  node tools/systems-smoke.mjs

import {
  bossFor, isBossLevel, weatherFor, windPushFor, timeAttackFor, isTimeAttackLevel,
} from '../src/levels/levelEvents.js';
import { evaluateDaily, rewardForStreak, DAILY_REWARDS } from '../src/systems/daily.js';
import { rollChest, CHEST_TABLE } from '../src/systems/chest.js';
import { SKINS, getSkin, applySkin, skinsUnlockedByStars, chestSkinPool } from '../src/data/skins.js';
import { BALLS, getAbility } from '../src/data/balls.js';

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

console.log('\n[Jefes cada 10 niveles]');
for (const n of [10, 20, 30, 40, 50]) ok(isBossLevel(n) && !!bossFor(n), `nivel ${n} es jefe`);
for (const n of [1, 5, 11, 19, 25, 35, 49]) ok(!isBossLevel(n), `nivel ${n} NO es jefe`);
ok(bossFor(40).windPush > 0, 'la Tormenta (40) aplica empuje de viento');
ok(bossFor(20).shake > 0, 'el T-Rex (20) aplica temblores');

console.log('\n[Clima por nivel]');
ok(weatherFor(6) === 'rain', 'nivel 6 = lluvia');
ok(weatherFor(9) === 'fog', 'nivel 9 = niebla');
ok(weatherFor(14) === 'wind', 'nivel 14 = viento');
ok(weatherFor(30) === 'ash', 'nivel 30 (jefe volcán) = ceniza');
ok(weatherFor(40) === 'storm', 'nivel 40 (jefe) = tormenta');
ok(weatherFor(1) === null, 'nivel 1 sin clima');
ok(windPushFor(14) > 0, 'viento del 14 empuja (leve)');
ok(windPushFor(6) === 0, 'la lluvia (6) no empuja');

console.log('\n[Contrarreloj cada 11 niveles]');
for (const n of [11, 22, 33, 44]) ok(isTimeAttackLevel(n) && timeAttackFor(n) > 0, `nivel ${n} es contrarreloj con límite`);
for (const n of [1, 10, 12, 21, 30]) ok(!isTimeAttackLevel(n), `nivel ${n} NO es contrarreloj`);
ok(timeAttackFor(11) < timeAttackFor(44), 'el límite crece con la dificultad');

console.log('\n[Recompensa diaria]');
{
  // Primer reclamo: racha 1.
  const e0 = evaluateDaily({ lastClaimDate: '', streak: 0 }, '2026-06-23');
  ok(e0.canClaim && e0.nextStreak === 1, 'primer día: reclamable, racha 1');
  // Mismo día: no reclamable.
  const e1 = evaluateDaily({ lastClaimDate: '2026-06-23', streak: 1 }, '2026-06-23');
  ok(!e1.canClaim && e1.alreadyToday, 'mismo día: no reclamable');
  // Día consecutivo: racha sube.
  const e2 = evaluateDaily({ lastClaimDate: '2026-06-23', streak: 3 }, '2026-06-24');
  ok(e2.canClaim && e2.nextStreak === 4, 'día siguiente: racha 3→4');
  // Hueco de 2 días: racha se reinicia.
  const e3 = evaluateDaily({ lastClaimDate: '2026-06-20', streak: 5 }, '2026-06-23');
  ok(e3.canClaim && e3.nextStreak === 1, 'hueco: racha vuelve a 1');
  // Ciclo de 7: día 8 = recompensa del día 1.
  ok(rewardForStreak(8).type === rewardForStreak(1).type, 'el ciclo de 7 se repite');
  ok(DAILY_REWARDS.length === 7, 'tabla diaria de 7 días');
  for (const r of DAILY_REWARDS) ok(r.amount > 0 && !!r.type, `recompensa día ${r.day} válida`);
}

console.log('\n[Cofre jurásico]');
{
  const types = new Set(CHEST_TABLE.map((e) => e.type));
  // RNG determinista para reproducibilidad.
  let seed = 0.123;
  const rng = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let skinGiven = false, validAll = true;
  for (let i = 0; i < 300; i++) {
    const r = rollChest(rng, ['meteorito']);
    if (!r || !r.icon) validAll = false;
    if (r.type === 'skin') { skinGiven = true; if (r.skinId !== 'meteorito') validAll = false; }
    else if (!(r.amount > 0)) validAll = false;
  }
  ok(validAll, 'todas las tiradas devuelven recompensa válida');
  ok(skinGiven, 'puede salir una skin cuando hay bloqueadas');
  // Sin skins bloqueadas: NUNCA premio de skin.
  let noSkin = true;
  for (let i = 0; i < 200; i++) { if (rollChest(rng, []).type === 'skin') noSkin = false; }
  ok(noSkin, 'sin skins bloqueadas, no da premio de skin');
}

console.log('\n[Skins]');
ok(SKINS.length === 8, `hay 8 skins (${SKINS.length})`);
ok(getSkin('classic').unlock.type === 'default', 'la clásica viene de serie');
ok(applySkin(BALLS[0], 'volcanica').body === '#3a160e', 'applySkin sobreescribe el color del cuerpo');
ok(applySkin(BALLS[0], 'classic').body === BALLS[0].body, 'la skin clásica conserva el color del dino');
ok(skinsUnlockedByStars(100).length >= 4, '100★ desbloquean varias skins por estrellas');
ok(skinsUnlockedByStars(0).length === 0, '0★ no desbloquean skins por estrellas');
ok(chestSkinPool().includes('meteorito'), 'el meteorito es skin solo-cofre');

console.log('\n[Habilidades de bola]');
ok(BALLS.every((b) => !!b.ability), 'las 5 bolas tienen habilidad');
ok(getAbility('blanca').mods.guard === 1, 'la blanca tiene Resistencia Rex (guard 1)');
ok(getAbility('rosada').mods.coinMagnet > 0, 'la rosa atrae monedas');
ok(getAbility('azul').mods.accelScale < 1, 'la azul rueda más lenta/controlada');

console.log(`\n${fails === 0 ? '✅ Sistemas nuevos OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
