// keyboard-direction-check.mjs — Verifica la CADENA COMPLETA de control, la que de verdad
// importa para el jugador:
//
//     tecla → InputController → BallPhysics → proyección por la CÁMARA → dirección EN PANTALLA
//
// input-smoke solo comprueba los VALORES de tilt (p. ej. "→ produce tiltZ negativo"), lo cual
// es tautológico: confirma la convención del propio código. Si alguien intercambiara los ejes
// (tiltX ↔ tiltZ) o girara la cámara, esos tests seguirían en verde y el juego se controlaría
// torcido. Aquí afirmamos lo único observable: pulsar → mueve la bola a la DERECHA de la
// pantalla, ↑ hacia ARRIBA, etc. Se comprueba en VERTICAL y en HORIZONTAL, porque cada
// orientación usa una función de encuadre distinta (computeSphereFrame / computeAxisFrame).
//
// Uso:  node --import ./tools/register-three.mjs tools/keyboard-direction-check.mjs

import * as THREE from 'three';

// Stub de window que SÍ despacha (InputController escucha el teclado en window).
const handlers = {};
globalThis.window = {
  addEventListener(t, fn) { (handlers[t] = handlers[t] || []).push(fn); },
  removeEventListener(t, fn) { const a = handlers[t]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } },
};
globalThis.document = { addEventListener() {}, removeEventListener() {}, hidden: false };
const fireKey = (type, key) => (handlers[type] || []).forEach((fn) => fn({ key, code: key, preventDefault() {} }));

const { InputController } = await import('../src/core/InputController.js');
const { BallPhysics } = await import('../src/physics/BallPhysics.js');
const { computeSphereFrame, computeAxisFrame } = await import('../src/scene/SceneManager.js');

const V_FOV = 48; // igual que SceneManager

class FakeEl {
  constructor() { this.handlers = {}; this.style = {}; this.dataset = {}; this.clientWidth = 120; }
  addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); }
  removeEventListener() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 120, height: 120 }; }
  setPointerCapture() {}
  querySelectorAll() { return []; }
  querySelector() { return null; }
}

let failures = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) failures++; };

// Tablero de prueba: plano e infinito (sin meta ni trampas), para medir solo la dirección.
const FLAT = {
  footprint: [{ type: 'rect', x: 0, z: 0, w: 100, d: 100 }],
  walls: [], goal: { x: 999, z: 999, r: 1 }, traps: [], start: { x: 0, z: 0 },
};
const BOUNDS = { width: 20, depth: 12 };
const CENTER = { x: 0, y: 0, z: 0 };

/** Construye la cámara EXACTAMENTE como el juego para un aspecto dado. */
function buildCamera(aspect, fit) {
  const portrait = aspect < 1;
  const r = portrait
    ? computeSphereFrame(BOUNDS, CENTER, V_FOV, aspect, fit)
    : computeAxisFrame(BOUNDS, CENTER, V_FOV, aspect, fit);
  const cam = new THREE.PerspectiveCamera(V_FOV, aspect, 0.1, 260);
  cam.position.set(r.pos.x, r.pos.y, r.pos.z);
  cam.lookAt(r.target.x, r.target.y, r.target.z);
  cam.updateMatrixWorld(true);
  return cam;
}

/** Mantiene `key` pulsada, simula la física y devuelve el desplazamiento en NDC de pantalla. */
function screenDelta(ic, cam, key) {
  ic.reset();
  fireKey('keydown', key);
  for (let i = 0; i < 40; i++) ic.update(1 / 60);      // suavizado del tilt
  const { tiltX, tiltZ } = ic.getTiltInput();

  const p = new BallPhysics();
  p.loadLevel(FLAT);
  for (let i = 0; i < 40; i++) p.update(1 / 60, tiltX, tiltZ);
  fireKey('keyup', key);

  const a = new THREE.Vector3(0, 0, 0).project(cam);
  const b = new THREE.Vector3(p.x, 0, p.z).project(cam);
  return { sx: b.x - a.x, sy: b.y - a.y, tiltX, tiltZ };  // NDC: +x derecha, +y arriba
}

// Qué esperamos ver en PANTALLA al pulsar cada tecla (la bola SIGUE a la tecla).
const CASES = [
  { key: 'ArrowRight', eje: 'sx', signo: +1, dir: 'DERECHA' },
  { key: 'ArrowLeft', eje: 'sx', signo: -1, dir: 'IZQUIERDA' },
  { key: 'ArrowUp', eje: 'sy', signo: +1, dir: 'ARRIBA' },
  { key: 'ArrowDown', eje: 'sy', signo: -1, dir: 'ABAJO' },
];

const ORIENTACIONES = [
  { nombre: 'VERTICAL (móvil 9:20)', aspect: 1080 / 2400, fit: { smallPortrait: true } },
  { nombre: 'HORIZONTAL (móvil 20:9)', aspect: 2400 / 1080, fit: { landscapeMobile: true } },
  { nombre: 'HORIZONTAL (escritorio 16:9)', aspect: 16 / 9, fit: {} },
];

for (const o of ORIENTACIONES) {
  console.log(`\n[${o.nombre}]`);
  const cam = buildCamera(o.aspect, o.fit);
  const ic = new InputController(new FakeEl(), null, null, null, new FakeEl());
  ic.enable();

  for (const c of CASES) {
    const d = screenDelta(ic, cam, c.key);
    const v = d[c.eje];
    const otro = c.eje === 'sx' ? d.sy : d.sx;
    // Se mueve claramente en el eje esperado…
    const bien = Math.sign(v) === c.signo && Math.abs(v) > 0.01;
    // …y NO se desvía en el eje perpendicular (esto caza un swap/rotación de ejes).
    const recto = Math.abs(otro) < Math.abs(v) * 0.5;
    ok(bien && recto,
      `${c.key.padEnd(10)} → ${c.dir.padEnd(10)} ` +
      `(pantalla Δx=${d.sx.toFixed(3)}, Δy=${d.sy.toFixed(3)} · tilt X=${d.tiltX.toFixed(2)} Z=${d.tiltZ.toFixed(2)})`);
  }
  ic.disable();
}

console.log(failures
  ? `\n❌ Dirección del teclado INCORRECTA (${failures} fallo${failures > 1 ? 's' : ''})\n`
  : '\n✅ Dirección del teclado correcta en pantalla (vertical y horizontal)\n');
process.exit(failures ? 1 : 0);
