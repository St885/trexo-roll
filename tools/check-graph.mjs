// check-graph.mjs — Carga TODO el grafo de módulos (incluida la capa 3D) en Node para
// verificar que cada import/export resuelve y que Three.js carga en un motor JS.
//
// Uso:  node --import ./tools/register-three.mjs tools/check-graph.mjs
//
// Stubs mínimos de DOM/WebGL: importar los módulos NO debe tocar el DOM, pero algunos
// crean materiales de Three.js a nivel de módulo. Si algo requiere el DOM al importar,
// estos stubs evitan un falso negativo (no se renderiza nada real aquí).
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
if (typeof globalThis.self === 'undefined') globalThis.self = globalThis;
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElementNS: () => ({ style: {}, getContext: () => null }),
    createElement: () => ({ style: {}, getContext: () => null }),
    getElementById: () => null,
    readyState: 'complete',
    addEventListener: () => {},
  };
}

const modules = [
  '../src/utils/constants.js',
  '../src/utils/storage.js',
  '../src/physics/footprint.js',
  '../src/physics/BallPhysics.js',
  '../src/levels/levels.js',
  '../src/levels/collectibles.js',
  '../src/effects/sfx.js',
  '../src/effects/music.js',
  '../src/effects/tauntMonkey.js',
  '../src/ui/hud.js',
  '../src/scene/textures.js',
  '../src/scene/decor.js',
  '../src/scene/collectibleArt.js',
  '../src/scene/Ball.js',
  '../src/scene/BoardBuilder.js',
  '../src/scene/SceneManager.js',
  '../src/core/InputController.js',
  '../src/core/ScreenManager.js',
  '../src/core/Game.js',
  '../src/main.js',
];

let failed = 0;
for (const m of modules) {
  try {
    await import(new URL(m, import.meta.url).href);
    console.log('  ✅ ' + m);
  } catch (e) {
    failed++;
    console.log('  ❌ ' + m + '  → ' + e.message);
  }
}
console.log(`\n${failed === 0 ? '✅ Grafo de módulos OK' : '❌ ' + failed + ' módulo(s) con error'}`);
process.exit(failed === 0 ? 0 : 1);
