// ui-runtime-check.mjs — Smoke de RUNTIME de las pantallas nuevas (skins, cofre, diario,
// chips de evento, indicadores de menú) con un DOM simulado. Ejecuta de verdad los
// cuerpos de los métodos de render para cazar ReferenceError/typos que el syntax-check
// no detecta. NO instancia SceneManager/WebGL: usa Object.create(Game.prototype) con los
// campos mínimos. Pensado como verificación de desarrollo.
//
// Uso:  node --import ./tools/register-three.mjs tools/ui-runtime-check.mjs

// --- DOM simulado ----------------------------------------------------------
const grad = { addColorStop() {} };
function mockCtx() {
  return new Proxy({}, { get(_t, p) {
    if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => grad;
    if (p === 'canvas') return { width: 64, height: 64 };
    return () => {};
  }, set() { return true; } });
}
function makeEl(tag = 'div') {
  const el = {
    tagName: tag, _text: '', _html: '', className: '', style: {}, dataset: {},
    width: 0, height: 0, children: [], offsetWidth: 1,
    classList: { _s: new Set(), add(...c){c.forEach(x=>this._s.add(x));}, remove(...c){c.forEach(x=>this._s.delete(x));},
      toggle(c,f){const has=this._s.has(c); const on=f===undefined?!has:f; on?this._s.add(c):this._s.delete(c); return on;},
      contains(c){return this._s.has(c);} },
    appendChild(c){ this.children.push(c); return c; },
    querySelector(){ return makeEl(); },
    querySelectorAll(){ return []; },
    addEventListener(){},
    remove(){},
    getContext(){ return mockCtx(); },
    setAttribute(){}, getBoundingClientRect(){ return { left:0, top:0, width:64, height:64 }; },
  };
  Object.defineProperty(el, 'textContent', { get(){return this._text;}, set(v){this._text=String(v);} });
  Object.defineProperty(el, 'innerHTML', { get(){return this._html;}, set(v){ this._html=String(v); this.children=[]; } });
  Object.defineProperty(el, 'firstChild', { get(){ return this.children[0] || null; } });
  return el;
}
const _els = new Map();
globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.matchMedia = () => ({ matches: false, addEventListener(){}, addListener(){} });
globalThis.localStorage = (() => { const m = new Map(); return {
  getItem:(k)=>m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)), removeItem:(k)=>m.delete(k) }; })();
globalThis.document = {
  getElementById(id){ if(!_els.has(id)) _els.set(id, makeEl()); return _els.get(id); },
  createElement(tag){ return makeEl(tag); },
  createElementNS(){ return makeEl(); },
  querySelector(){ return makeEl(); },
  querySelectorAll(){ return []; },
  body: { classList: makeEl().classList },
};

// --- Carga e instancia parcial de Game -------------------------------------
let failures = 0;
const run = (label, fn) => { try { fn(); console.log('  ✅ ' + label); } catch (e) { failures++; console.log('  ❌ ' + label + ' → ' + (e && e.stack ? e.stack.split('\n').slice(0,2).join(' | ') : e)); } };

const { Game } = await import('../src/core/Game.js');
const { setStars, addStarTokens, setDaily } = await import('../src/utils/storage.js');

// Da algo de progreso para ejercitar ramas (skins por estrellas, cofre disponible, tokens).
for (let i = 1; i <= 20; i++) setStars(i, 3); // 60 ★ → cofres + skins por estrellas
addStarTokens(20);

const g = Object.create(Game.prototype);
g.selectedBall = 'blanca';
g.ball = { setSkin() {} };
g.screens = { show() {}, isActive() { return false; } };
g.scene = {};
g.levelIndex = 0;

console.log('\n[Render de pantallas nuevas]');
run('_updateMenuProgress()', () => g._updateMenuProgress());
run('_updateBallPreviews()', () => g._updateBallPreviews());
run('_renderSkins()', () => g._renderSkins());
run('_renderChest()', () => g._renderChest());
run('_renderDaily()', () => g._renderDaily());
run('_renderBallCards()', () => g._renderBallCards());
run('_renderLevelCards() [badges jefe/contrarreloj + progreso]', () => g._renderLevelCards());
run('_renderShop() [canje]', () => g._renderShop());
run('_renderReviveBox() [game over]', () => g._renderReviveBox());
run('_renderPrepMissions() [misiones prep]', () => g._renderPrepMissions({ par: 30 }, 3));
run('_renderWinMissions() [misiones victoria]', () => g._renderWinMissions(true, false, true, true));
run('_startTutorial(1) + _hideCoach()', () => { g.playing = true; g._startTutorial(1); g._hideCoach(); g.playing = false; });
run('_applyDynamicTraps() [pulse anima el radio por frame + sincroniza collider y malla]', () => {
  g.physics = { traps: [{ x: 0, z: 0, r: 1, active: true }] };
  let last = null;
  g.scene.setTrapTransform = (i, x, z, r, a) => { last = { i, x, z, r, a }; };
  g._dynSpecs = [{ index: 0, mode: 'shrink', cx: 0, cz: 0, baseR: 1, maxR: 1, minR: 0.12, speed: 1.0, phase: 0 }];
  g._dynT = 0;
  const rs = [];
  for (let f = 0; f < 200; f++) { g._applyDynamicTraps(0.05); rs.push(g.physics.traps[0].r); }
  if (Math.max(...rs) - Math.min(...rs) < 0.3) throw new Error('el radio no varía con el tiempo (no anima)');
  if (g.physics.traps[0].r !== last.r) throw new Error('collider y malla desincronizados');
  if (!rs.some((r) => r < 0.55)) throw new Error('el shrink no llega a desactivarse');
});
run('_applyDynamicTraps() [move desplaza la posición por frame]', () => {
  g.physics = { traps: [{ x: 0, z: 0, r: 1, active: true }] };
  g.scene.setTrapTransform = () => {};
  g._dynSpecs = [{ index: 0, mode: 'move', pattern: 'h', cx: 0, cz: 0, baseR: 1, amp: 1.5, speed: 1.0, phase: 0 }];
  g._dynT = 0;
  const xs = [];
  for (let f = 0; f < 120; f++) { g._applyDynamicTraps(0.05); xs.push(g.physics.traps[0].x); }
  if (Math.max(...xs) - Math.min(...xs) < 1.0) throw new Error('la posición no varía (no se mueve)');
});
run('_renderPrepEvents(10) [jefe]', () => g._renderPrepEvents(10));
run('_renderPrepEvents(11) [contrarreloj]', () => g._renderPrepEvents(11));
run('_renderPrepEvents(6) [clima]', () => g._renderPrepEvents(6));
run('_renderPrepEvents(1) [normal]', () => g._renderPrepEvents(1));
run('_dailyState()', () => g._dailyState());

console.log('\n[Interacción: equipar/comprar skin, abrir cofre, reclamar diario]');
run('_onSkinClick(classic) equipar', () => g._onSkinClick({ id: 'classic', unlock: { type: 'default' } }));
run('_onSkinClick(hielo) comprar con tokens', () => g._onSkinClick({ id: 'hielo', unlock: { type: 'tokens', cost: 5 } }));
run('_openChest() abre y entrega', () => g._openChest());
run('_claimDaily() reclama', () => { setDaily('', 0); g._claimDaily(); });
run('_chestRewardText(tokens)', () => g._chestRewardText({ type: 'tokens', amount: 3, icon: '⭐' }));
run('_chestRewardText(skin)', () => g._chestRewardText({ type: 'skin', skinId: 'meteorito', icon: '🎨' }));
run('_activePowers()', () => { g._guardCharges = 1; g._coinMagnet = 0.7; g._trapBlockedThisLevel = false; g._fallShieldActive = false; g._activePowers(); });

console.log(`\n${failures === 0 ? '✅ UI runtime OK (sin ReferenceError)' : '❌ ' + failures + ' fallo(s) de runtime'}\n`);
process.exit(failures === 0 ? 0 : 1);
