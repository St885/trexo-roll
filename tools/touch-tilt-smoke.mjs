// touch-tilt-smoke.mjs — Verifica el control TÁCTIL por arrastre (TouchTiltController) SIN
// navegador, con un DOM mínimo simulado: arrastre → inclinación, mapeo de direcciones, zona
// muerta, retorno al centro al soltar, multitouch (ignora pointers extra) y que no lance
// ReferenceError. Es la mecánica de control PRINCIPAL en móvil (v0.25.3).
//
// Uso:  node tools/touch-tilt-smoke.mjs

globalThis.window = { addEventListener() {}, removeEventListener() {} };

const { TouchTiltController } = await import('../src/input/TouchTiltController.js');
const { PHYS } = await import('../src/utils/constants.js');

class FakeEl {
  constructor() { this.handlers = {}; }
  addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); }
  removeEventListener(t, fn) { const a = this.handlers[t]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } }
  setPointerCapture() {}
  dispatch(t, e) { (this.handlers[t] || []).forEach((fn) => fn(e)); }
}
const ev = (o) => ({ preventDefault() {}, ...o });
const step = (c, n = 60) => { for (let i = 0; i < n; i++) c.update(1 / 60); };

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

const el = new FakeEl();
const c = new TouchTiltController(el);
c.enable();

console.log('\n[Arrastre → inclinación]');
// Arrastrar a la DERECHA (dx>0) → la bola va a +x → tiltZ negativo
el.dispatch('pointerdown', ev({ pointerId: 1, clientX: 100, clientY: 100 }));
el.dispatch('pointermove', ev({ pointerId: 1, clientX: 200, clientY: 100 }));
step(c);
ok(c.tiltZ < -0.1 && Math.abs(c.tiltX) < 0.05, `derecha → tiltZ negativo (tiltZ=${c.tiltZ.toFixed(2)})`);
ok(Math.abs(c.tiltZ) <= PHYS.MAX_TILT + 1e-6, `no supera MAX_TILT (|tiltZ|=${Math.abs(c.tiltZ).toFixed(2)} ≤ ${PHYS.MAX_TILT})`);
ok(c.isEngaged() === true, 'isEngaged() true mientras se arrastra');

console.log('\n[Soltar → retorno al centro]');
el.dispatch('pointerup', ev({ pointerId: 1 }));
step(c, 120);
ok(Math.abs(c.tiltZ) < 0.02 && Math.abs(c.tiltX) < 0.02, `al soltar vuelve al centro (tiltZ=${c.tiltZ.toFixed(3)})`);
ok(c.isEngaged() === false, 'isEngaged() false tras asentarse en el centro');

console.log('\n[Mapeo vertical]');
// Arrastrar ABAJO (dy>0) → +z (hacia cámara) → tiltX positivo
el.dispatch('pointerdown', ev({ pointerId: 2, clientX: 100, clientY: 100 }));
el.dispatch('pointermove', ev({ pointerId: 2, clientX: 100, clientY: 230 }));
step(c);
ok(c.tiltX > 0.1 && Math.abs(c.tiltZ) < 0.05, `abajo → tiltX positivo (tiltX=${c.tiltX.toFixed(2)})`);

console.log('\n[Multitouch: solo el primer pointer manda]');
const beforeX = c.tiltX;
el.dispatch('pointerdown', ev({ pointerId: 99, clientX: 300, clientY: 100 })); // segundo dedo: ignorado
el.dispatch('pointermove', ev({ pointerId: 99, clientX: 100, clientY: 100 })); // su movimiento no cuenta
step(c);
ok(Math.abs(c.tiltX - beforeX) < 0.06 && Math.abs(c.tiltZ) < 0.06, 'ignora el segundo pointer (multitouch seguro)');
el.dispatch('pointerup', ev({ pointerId: 2 }));
el.dispatch('pointerup', ev({ pointerId: 99 }));
step(c, 120);

console.log('\n[Zona muerta]');
el.dispatch('pointerdown', ev({ pointerId: 3, clientX: 100, clientY: 100 }));
el.dispatch('pointermove', ev({ pointerId: 3, clientX: 101, clientY: 101 })); // ~1.4px < deadzone
step(c);
ok(Math.abs(c.tiltX) < 0.02 && Math.abs(c.tiltZ) < 0.02, 'microarrastre dentro de la zona muerta no inclina');
el.dispatch('pointerup', ev({ pointerId: 3 }));
step(c, 60);

console.log('\n[onFirstDrag: se dispara una sola vez]');
let fired = 0;
const c2 = new TouchTiltController(new FakeEl(), { onFirstDrag: () => fired++ });
c2._pointerDown(ev({ pointerId: 1, clientX: 0, clientY: 0 }));
c2._pointerUp(ev({ pointerId: 1 }));
c2._pointerDown(ev({ pointerId: 2, clientX: 0, clientY: 0 }));
ok(fired === 1, `onFirstDrag se dispara exactamente una vez (fired=${fired})`);

console.log('\n[reset()]');
c._pointerDown(ev({ pointerId: 5, clientX: 0, clientY: 0 }));
c._pointerMove(ev({ pointerId: 5, clientX: 90, clientY: 0 }));
step(c, 5);
c.reset();
ok(c.tiltX === 0 && c.tiltZ === 0 && c.dragging === false, 'reset() deja inclinación a cero y sin arrastre');

console.log(`\n${fails === 0 ? '✅ Control táctil por arrastre OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
