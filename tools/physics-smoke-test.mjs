// physics-smoke-test.mjs — Smoke test del núcleo jugable SIN navegador.
// BallPhysics/footprint/levels/constants no dependen de Three.js, así que se
// pueden simular en Node. Verifica:
//   1) La dirección de la gravedad según la inclinación (signos correctos).
//   2) Detección de caída fuera del tablero, trampa y meta.
//   3) Que un piloto automático sencillo pueda completar niveles (jugabilidad).
//
// Uso:  node tools/physics-smoke-test.mjs   (o: npm test)

import { BallPhysics } from '../src/physics/BallPhysics.js';
import { LEVELS } from '../src/levels/levels.js';
import { PHYS } from '../src/utils/constants.js';

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '  ✅' : '  ❌'} ${msg}`);
  if (!cond) failures++;
};

// --- 1) Direcciones de la gravedad -----------------------------------------
console.log('\n[1] Dirección de la inclinación → movimiento');
{
  const flatLevel = {
    footprint: [{ type: 'rect', x: 0, z: 0, w: 100, d: 100 }],
    walls: [], goal: { x: 999, z: 999, r: 1 }, traps: [], start: { x: 0, z: 0 },
  };

  // tiltX (α) > 0 debe empujar hacia +z
  let p = new BallPhysics(); p.loadLevel(flatLevel);
  for (let i = 0; i < 30; i++) p.update(1 / 60, 0.2, 0);
  ok(p.z > 0.05 && Math.abs(p.x) < 0.02, `tiltX>0 mueve hacia +z (z=${p.z.toFixed(2)}, x=${p.x.toFixed(2)})`);

  // tiltZ (β) > 0 debe empujar hacia -x
  p = new BallPhysics(); p.loadLevel(flatLevel);
  for (let i = 0; i < 30; i++) p.update(1 / 60, 0, 0.2);
  ok(p.x < -0.05 && Math.abs(p.z) < 0.02, `tiltZ>0 mueve hacia -x (x=${p.x.toFixed(2)}, z=${p.z.toFixed(2)})`);

  // Sin inclinación, la bola no debe moverse
  p = new BallPhysics(); p.loadLevel(flatLevel);
  for (let i = 0; i < 30; i++) p.update(1 / 60, 0, 0);
  ok(Math.abs(p.x) < 1e-6 && Math.abs(p.z) < 1e-6, 'sin inclinación la bola queda quieta');
}

// --- 2) Detección de caída y trampa ----------------------------------------
console.log('\n[2] Detección de eventos');
{
  // Caída: tablero pequeño, inclinar fuerte hasta salir.
  const small = {
    footprint: [{ type: 'rect', x: 0, z: 0, w: 6, d: 6 }],
    walls: [], goal: { x: 50, z: 50, r: 1 }, traps: [], start: { x: 0, z: 0 },
  };
  let p = new BallPhysics(); p.loadLevel(small);
  let ev = null;
  for (let i = 0; i < 600 && !ev; i++) ev = p.update(1 / 60, 0, -PHYS.MAX_TILT); // hacia +x
  ok(ev === 'fall', `caída fuera del tablero detectada (evento=${ev})`);

  // Trampa: trampa justo en el camino +x.
  const trapLvl = {
    footprint: [{ type: 'rect', x: 0, z: 0, w: 40, d: 8 }],
    walls: [], goal: { x: 50, z: 50, r: 1 },
    traps: [{ x: 6, z: 0, r: 1.0 }], start: { x: 0, z: 0 },
  };
  p = new BallPhysics(); p.loadLevel(trapLvl);
  ev = null;
  for (let i = 0; i < 600 && !ev; i++) ev = p.update(1 / 60, 0, -PHYS.MAX_TILT);
  ok(ev === 'trap', `trampa detectada (evento=${ev})`);

  // Meta: meta en el camino +x.
  const goalLvl = {
    footprint: [{ type: 'rect', x: 0, z: 0, w: 40, d: 8 }],
    walls: [], goal: { x: 6, z: 0, r: 1.1 }, traps: [], start: { x: 0, z: 0 },
  };
  p = new BallPhysics(); p.loadLevel(goalLvl);
  ev = null;
  for (let i = 0; i < 600 && !ev; i++) ev = p.update(1 / 60, 0, -PHYS.MAX_TILT);
  ok(ev === 'goal', `meta detectada (evento=${ev})`);
}

// --- 3) Piloto automático por nivel ----------------------------------------
console.log('\n[3] Jugabilidad: piloto automático intenta cada nivel');
{
  const results = [];
  for (const level of LEVELS) {
    const p = new BallPhysics();
    p.loadLevel(level);
    let ev = null;
    const maxSteps = 90 * 60; // 90 s
    for (let i = 0; i < maxSteps && !ev; i++) {
      // Dirección deseada hacia la meta.
      let dx = level.goal.x - p.x;
      let dz = level.goal.z - p.z;
      const d = Math.hypot(dx, dz) || 1;
      dx /= d; dz /= d;
      // Inclinación que produce aceleración en esa dirección (ver derivación):
      //   a_x ∝ -tiltZ  →  tiltZ = -dx ;   a_z ∝ tiltX  →  tiltX = dz
      let tiltX = dz * PHYS.MAX_TILT;
      let tiltZ = -dx * PHYS.MAX_TILT;
      // Freno cerca de la meta para no pasarse.
      if (d < 3) { tiltX *= 0.4; tiltZ *= 0.4; }
      ev = p.update(1 / 60, tiltX, tiltZ);
    }
    results.push({ id: level.id, name: level.name, outcome: ev || 'timeout', x: p.x, z: p.z });
  }

  for (const r of results) {
    console.log(`  Nivel ${r.id} (${r.name}): ${r.outcome}  [pos final x=${r.x.toFixed(1)}, z=${r.z.toFixed(1)}]`);
  }
  const wins = results.filter((r) => r.outcome === 'goal').length;
  // El piloto es ingenuo (no esquiva trampas ni muros): basta con que demuestre
  // que la física es "ganable" en los niveles abiertos sin trampas en línea recta.
  ok(wins >= 1, `el piloto automático completa al menos 1 nivel (completó ${wins}/${results.length})`);
  ok(!results.some((r) => r.outcome === 'timeout' && Math.abs(r.x) < 0.2 && Math.abs(r.z) < 0.2),
    'la bola siempre reacciona a la inclinación (ningún nivel se queda inmóvil)');
}

// --- 4) Portales: teletransporte correcto (no mata/gana, salida controlada) --
console.log('\n[4] Portales (teletransporte)');
{
  const lvl = {
    footprint: [{ type: 'rect', x: 0, z: 0, w: 44, d: 8 }],
    walls: [], goal: { x: 999, z: 999, r: 1 }, traps: [],
    portals: [{ x: -10, z: 0, r: 1.0 }, { x: 10, z: 0, r: 1.0 }],
    start: { x: -16, z: 0 },
  };
  const p = new BallPhysics();
  p.loadLevel(lvl);
  let teleports = 0, badEvent = null, jumped = false, exitSpeed = 0;
  for (let i = 0; i < 600; i++) {
    const before = p.x;
    const ev = p.update(1 / 60, 0, -PHYS.MAX_TILT); // empuja +x hacia el portal A
    const fx = p.consumePortalFx();
    if (fx) { teleports++; if (before < -5 && p.x > 5) jumped = true; exitSpeed = p.speed; }
    if (ev === 'goal' || ev === 'trap') badEvent = ev;
    if (ev === 'goal' || ev === 'trap' || ev === 'fall') break;
  }
  ok(teleports >= 1, `la bola entra en un portal y se teletransporta (teleports=${teleports})`);
  ok(jumped, 'reaparece por el portal hermano (salto de −10 a +10)');
  ok(badEvent === null, `el portal NO cuenta como meta ni trampa (evento indebido=${badEvent})`);
  ok(exitSpeed <= PHYS.MAX_SPEED + 0.01, `velocidad de salida controlada (${exitSpeed.toFixed(1)} ≤ ${PHYS.MAX_SPEED})`);
  ok(teleports <= 2, `sin ping-pong infinito gracias al cooldown (teleports=${teleports})`);
}

console.log(`\n${failures === 0 ? '✅ TODO OK' : '❌ ' + failures + ' fallo(s)'}\n`);
process.exit(failures === 0 ? 0 : 1);
