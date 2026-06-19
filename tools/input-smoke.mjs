// input-smoke.mjs — Verifica el pipeline de control → inclinación SIN navegador,
// con un DOM mínimo simulado. Comprueba que el joystick y el D-pad realmente
// modifican el tilt (la causa del bug móvil) y que se resetean al soltar.
//
// Uso:  node tools/input-smoke.mjs

// Stub de window (InputController registra listeners de teclado en window).
globalThis.window = { addEventListener() {}, removeEventListener() {} };

const { InputController } = await import('../src/core/InputController.js');
const { PHYS } = await import('../src/utils/constants.js');

class FakeEl {
  constructor(opts = {}) {
    this.handlers = {};
    this.classes = new Set();
    this.style = {};
    this.dataset = opts.dataset || {};
    this.clientWidth = opts.clientWidth || 120;
    this._rect = opts.rect || { left: 0, top: 0, width: 120, height: 120 };
    this._children = opts.children || [];
    this.classList = {
      add: (c) => this.classes.add(c),
      remove: (c) => this.classes.delete(c),
      contains: (c) => this.classes.has(c),
    };
  }
  addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); }
  removeEventListener(t, fn) { const a = this.handlers[t]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } }
  getBoundingClientRect() { return this._rect; }
  setPointerCapture() {}
  querySelectorAll(sel) {
    if (sel === '.pressed') return this._children.filter((c) => c.classList.contains('pressed'));
    return this._children;
  }
  dispatch(t, e) { (this.handlers[t] || []).forEach((fn) => fn(e)); }
}

const ev = (o) => ({ preventDefault() {}, ...o });
const step = (ic, n = 40) => { for (let i = 0; i < n; i++) ic.update(1 / 60); };

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

// Joystick centrado en (160,160), radio de recorrido R = 120*0.36 = 43.2
const canvas = new FakeEl();
const joy = new FakeEl({ clientWidth: 120, rect: { left: 100, top: 100, width: 120, height: 120 } });
const knob = new FakeEl();
const bUp = new FakeEl({ dataset: { dir: 'up' } });
const bDown = new FakeEl({ dataset: { dir: 'down' } });
const bLeft = new FakeEl({ dataset: { dir: 'left' } });
const bRight = new FakeEl({ dataset: { dir: 'right' } });
const dpad = new FakeEl({ children: [bUp, bDown, bLeft, bRight] });

const ic = new InputController(canvas, joy, knob, dpad);
ic.enable();

console.log('\n[Joystick]');
// Empujar a la DERECHA (clientX > centro) → la bola va a +x → tiltZ negativo
joy.dispatch('pointerdown', ev({ pointerId: 1, clientX: 203, clientY: 160, pointerType: 'touch' }));
step(ic);
ok(ic.tiltZ < -0.1 && Math.abs(ic.tiltX) < 0.05, `derecha → tiltZ negativo (tiltZ=${ic.tiltZ.toFixed(2)})`);
ok(knob.style.transform && knob.style.transform.includes('translate'), 'el knob se mueve (transform aplicado)');
joy.dispatch('pointerup', ev({ pointerId: 1 }));
step(ic);
ok(Math.abs(ic.tiltZ) < 0.02, `al soltar vuelve al centro (tiltZ=${ic.tiltZ.toFixed(3)})`);

// Empujar ABAJO (clientY > centro) → +z (hacia la cámara) → tiltX positivo
joy.dispatch('pointerdown', ev({ pointerId: 1, clientX: 160, clientY: 203, pointerType: 'touch' }));
step(ic);
ok(ic.tiltX > 0.1 && Math.abs(ic.tiltZ) < 0.05, `abajo → tiltX positivo (tiltX=${ic.tiltX.toFixed(2)})`);
joy.dispatch('pointerup', ev({ pointerId: 1 }));
step(ic);

console.log('\n[D-pad]');
bRight.dispatch('pointerdown', ev({ pointerId: 2 }));
ok(ic.keys.right === true && bRight.classList.contains('pressed'), 'botón derecha marca tecla + estado pressed');
step(ic);
ok(ic.tiltZ < -0.1, `D-pad derecha → tiltZ negativo (tiltZ=${ic.tiltZ.toFixed(2)})`);
bRight.dispatch('pointerup', ev({ pointerId: 2 }));
step(ic);
ok(ic.keys.right === false && Math.abs(ic.tiltZ) < 0.02, 'al soltar el D-pad vuelve al centro');

bUp.dispatch('pointerdown', ev({ pointerId: 3 }));
step(ic);
ok(ic.tiltX < -0.1, `D-pad arriba → tiltX negativo (tiltX=${ic.tiltX.toFixed(2)})`);
bUp.dispatch('pointerup', ev({ pointerId: 3 }));

console.log('\n[Diagonales: dos direcciones a la vez]');
bUp.dispatch('pointerdown', ev({ pointerId: 10 }));    // arriba (tiltX -)
bRight.dispatch('pointerdown', ev({ pointerId: 11 }));  // derecha (tiltZ -)
step(ic);
ok(ic.tiltX < -0.1 && ic.tiltZ < -0.1, `arriba + derecha → diagonal (tiltX=${ic.tiltX.toFixed(2)}, tiltZ=${ic.tiltZ.toFixed(2)})`);
bUp.dispatch('pointerup', ev({ pointerId: 10 }));
ok(ic.keys.right === true && ic.keys.up === false, 'soltar una dirección NO suelta la otra (botones independientes)');
bRight.dispatch('pointerup', ev({ pointerId: 11 }));

console.log('\n[Prioridad joystick > D-pad]');
bLeft.dispatch('pointerdown', ev({ pointerId: 4 }));            // D-pad izquierda (tiltZ +)
joy.dispatch('pointerdown', ev({ pointerId: 5, clientX: 203, clientY: 160, pointerType: 'touch' })); // joystick derecha
step(ic);
ok(ic.tiltZ < -0.1, 'con joystick activo, manda el joystick (no el D-pad)');
joy.dispatch('pointerup', ev({ pointerId: 5 }));
bLeft.dispatch('pointerup', ev({ pointerId: 4 }));

console.log('\n[Prioridad D-pad > arrastre del lienzo]');
// El arrastre intenta inclinar a la derecha; el D-pad (arriba) debe mandar.
canvas.dispatch('pointerdown', ev({ pointerId: 6, clientX: 200, clientY: 200, pointerType: 'mouse' }));
canvas.dispatch('pointermove', ev({ pointerId: 6, clientX: 300, clientY: 200 }));
bUp.dispatch('pointerdown', ev({ pointerId: 7 }));
step(ic);
ok(ic.tiltX < -0.1, `con el D-pad pulsado, manda el D-pad sobre el arrastre (tiltX=${ic.tiltX.toFixed(2)})`);
bUp.dispatch('pointerup', ev({ pointerId: 7 }));
canvas.dispatch('pointerup', ev({ pointerId: 6 }));

console.log('\n[Reset: sin teclas pegadas]');
bUp.dispatch('pointerdown', ev({ pointerId: 12 }));
ic.reset();
step(ic);
ok(!ic.keys.up && !ic.keys.down && !ic.keys.left && !ic.keys.right, 'reset() suelta todas las direcciones');
ok(Math.abs(ic.tiltX) < 0.02 && Math.abs(ic.tiltZ) < 0.02, 'reset() devuelve la inclinación a cero');

console.log('\n[Helpers de dirección]');
ic.pressDirection('left');
step(ic);
ok(ic.tiltZ > 0.1, `pressDirection('left') inclina (tiltZ=${ic.tiltZ.toFixed(2)})`);
ic.releaseDirection('left');
step(ic);
ok(Math.abs(ic.tiltZ) < 0.02, "releaseDirection('left') vuelve a cero");

console.log(`\n${fails === 0 ? '✅ Pipeline de control móvil OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
