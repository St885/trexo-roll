// canvas-smoke.mjs — Ejerce el código de dibujo Canvas 2D y construcción 3D sin
// navegador, con un contexto 2D simulado. Detecta errores de runtime en las
// texturas procedurales (caras de dino, fondos de bioma) y el dino de celebración.
//
// Uso:  node --import ./tools/register-three.mjs tools/canvas-smoke.mjs

// --- Stubs mínimos de DOM/Canvas -------------------------------------------
const grad = { addColorStop() {} };
function mockCtx() {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => grad;
      if (prop === 'canvas') return { width: 64, height: 64 };
      return () => {};
    },
    set() { return true; },
  });
}
globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, className: '', style: {}, getContext: () => mockCtx() }),
  createElementNS: () => ({ style: {}, getContext: () => mockCtx() }),
};

let failures = 0;
const run = async (label, fn) => {
  try { await fn(); console.log('  ✅ ' + label); }
  catch (e) { failures++; console.log('  ❌ ' + label + ' → ' + e.message); }
};

const tex = await import('../src/scene/textures.js');
const { BALLS } = await import('../src/data/balls.js');
const cel = await import('../src/scene/CelebrationDino.js');

console.log('\n[Texturas procedurales]');
for (const b of BALLS) {
  await run('makeBallTexture(' + b.id + ')', () => tex.makeBallTexture(b));
  await run('makeBallThumbnail(' + b.id + ')', () => tex.makeBallThumbnail(b, 96));
}
await run('makeBoardTexture', () => tex.makeBoardTexture());
await run('makeContactShadowTexture', () => tex.makeContactShadowTexture());
await run('makeSkyTexture', () => tex.makeSkyTexture());

console.log('\n[Fondos de bioma]');
for (const theme of Object.keys(tex.THEMES)) {
  await run('makeThemeSky(' + theme + ')', () => tex.makeThemeSky(theme));
}

console.log('\n[Dino de celebración + confeti]');
for (const b of BALLS) {
  await run('buildDino(' + b.id + ')', () => cel.buildDino(b));
}
await run('buildConfetti', () => cel.buildConfetti('#2ecc71'));

console.log(`\n${failures === 0 ? '✅ Código de dibujo/3D sin errores de runtime' : '❌ ' + failures + ' fallo(s)'}\n`);
process.exit(failures === 0 ? 0 : 1);
