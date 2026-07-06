// viewport-smoke.mjs — Verifica el REFLUJO CENTRAL de viewport de Game (rotación/resize):
//   _handleViewportChange() → recalcula lienzo (scene.resize) + cámara + clases de layout del
//   <body> (is-landscape/is-portrait/is-landscape-mobile) + controles (input.refresh);
//   _scheduleViewportSync() → re-aplica varias veces (rotación con layout tardío en Android).
// No instancia WebGL: usa Object.create(Game.prototype) con mocks. También confirma que el
// D-pad queda oculto por defecto (DEBUG_SHOW_DPAD === false).
//
// Uso:  node --import ./tools/register-three.mjs tools/viewport-smoke.mjs

// --- Stubs de entorno (antes de importar Game) -----------------------------
const bodyClasses = new Set();
globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.innerWidth = 800; globalThis.innerHeight = 400;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.requestAnimationFrame = (fn) => { fn(); return 0; };
globalThis.localStorage = (() => { const m = new Map(); return {
  getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
function makeEl() {
  return { style: {}, dataset: {}, appendChild() {}, addEventListener() {}, setAttribute() {},
    getContext() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 64, height: 64 }; }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } };
}
globalThis.document = {
  getElementById() { return makeEl(); }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
  querySelector() { return null; }, querySelectorAll() { return []; },
  body: { classList: {
    _s: bodyClasses,
    add(...c) { c.forEach((x) => this._s.add(x)); }, remove(...c) { c.forEach((x) => this._s.delete(x)); },
    toggle(c, f) { const on = f === undefined ? !this._s.has(c) : f; on ? this._s.add(c) : this._s.delete(c); return on; },
    contains(c) { return this._s.has(c); },
  } },
};

const { Game } = await import('../src/core/Game.js');
const { DEBUG_SHOW_DPAD } = await import('../src/utils/constants.js');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

// --- Game parcial con escena/input espía ------------------------------------
const g = Object.create(Game.prototype);
g.isTouch = true;
let resized = 0, refreshed = 0;
g.scene = { resize() { resized++; }, setViewportFit() {} };
g.input = { refresh() { refreshed++; } };

console.log('\n[Reflujo de viewport — horizontal]');
globalThis.innerWidth = 800; globalThis.innerHeight = 400;
g._handleViewportChange();
ok(resized === 1, '_handleViewportChange() llama scene.resize() (recalcula renderer + cámara)');
ok(refreshed === 1, '_handleViewportChange() llama input.refresh() (controles)');
ok(bodyClasses.has('is-landscape') && !bodyClasses.has('is-portrait'), 'horizontal → body.is-landscape (no is-portrait)');
ok(bodyClasses.has('is-landscape-mobile'), 'móvil horizontal → body.is-landscape-mobile (modo de juego principal)');

console.log('\n[Reflujo de viewport — vertical]');
globalThis.innerWidth = 400; globalThis.innerHeight = 800;
g._handleViewportChange();
ok(bodyClasses.has('is-portrait') && !bodyClasses.has('is-landscape'), 'vertical → body.is-portrait (no is-landscape)');
ok(resized === 2, 'cada cambio de orientación recalcula de nuevo (scene.resize)');
ok(!bodyClasses.has('is-landscape-mobile'), 'vertical → sin is-landscape-mobile');

console.log('\n[_scheduleViewportSync re-aplica varias veces]');
resized = 0;
globalThis.setTimeout = (fn) => { fn(); return 0; };
g._scheduleViewportSync([0, 10, 20]);
ok(resized >= 3, `_scheduleViewportSync re-aplica el reflujo varias veces (resized=${resized})`);

console.log('\n[D-pad oculto por defecto]');
ok(DEBUG_SHOW_DPAD === false, 'DEBUG_SHOW_DPAD === false (flechas ocultas en móvil por defecto)');

console.log(`\n${fails === 0 ? '✅ Reflujo de viewport OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
