// graphics-profile-check.mjs — Verifica el MODO RENDIMIENTO móvil/Android: presets gráficos
// (quality/balanced/performance), su resolución por dispositivo (device.js) y que el runtime los
// aplica. Sin navegador: importa los módulos (son seguros en Node) y comprueba estructura + valores.
//
// Uso:  node tools/graphics-profile-check.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

const { GRAPHICS_PRESETS, ANDROID_PERFORMANCE_PRESET, DESKTOP_PRESET, DEFAULT_TOUCH_PRESET } = await import('../src/utils/constants.js');
const device = await import('../src/utils/device.js');

console.log('\n[Presets gráficos]');
for (const name of ['quality', 'balanced', 'performance']) {
  const p = GRAPHICS_PRESETS[name];
  ok(!!p, `existe el preset '${name}'`);
  if (!p) continue;
  for (const k of ['pixelRatioCap', 'shadows', 'heavyGlows', 'particleScale', 'celebration3D']) {
    ok(k in p, `  ${name}.${k} definido`);
  }
}
ok(GRAPHICS_PRESETS.performance.pixelRatioCap <= 1.0, 'performance: pixelRatioCap ≤ 1.0');
ok(GRAPHICS_PRESETS.performance.shadows === false, 'performance: sombras OFF');
ok(GRAPHICS_PRESETS.performance.heavyGlows === false, 'performance: glows pesados OFF');
ok(GRAPHICS_PRESETS.performance.celebration3D === 'off', 'performance: celebración 3D OFF (procedural)');
ok(GRAPHICS_PRESETS.balanced.pixelRatioCap <= 1.25, 'balanced: pixelRatioCap ≤ 1.25');
ok(GRAPHICS_PRESETS.balanced.shadows === false, 'balanced: sombras OFF');
ok(GRAPHICS_PRESETS.balanced.celebration3D === 'onwin', 'balanced: celebración 3D perezosa al ganar');
ok(GRAPHICS_PRESETS.quality.shadows === true, 'quality: sombras ON');
ok(GRAPHICS_PRESETS.quality.celebration3D === 'preload', 'quality: celebración 3D precargada');

console.log('\n[Defaults de preset]');
ok(ANDROID_PERFORMANCE_PRESET === 'performance', "Android usa 'performance' por defecto");
ok(DEFAULT_TOUCH_PRESET === 'balanced', "otros táctiles usan 'balanced'");
ok(DESKTOP_PRESET === 'quality', "escritorio usa 'quality'");

console.log('\n[device.js — API de detección]');
for (const fn of ['isCapacitorNative', 'getPlatform', 'isAndroid', 'isAndroidWebView', 'isTouchDevice', 'isLowPowerMobile', 'getGraphicsProfile', 'resolvePresetName']) {
  ok(typeof device[fn] === 'function', `exporta ${fn}()`);
}
// En Node (sin DOM) no es táctil ni Android → perfil de escritorio 'quality'.
const prof = device.getGraphicsProfile();
ok(prof && prof.name === 'quality', `getGraphicsProfile() en Node → 'quality' (fue '${prof && prof.name}')`);
ok(typeof prof.pixelRatioCap === 'number' && typeof prof.shadows === 'boolean', 'el perfil trae pixelRatioCap y shadows');
ok(device.getPlatform() === 'web', "getPlatform() en Node → 'web'");
ok(device.isTouchDevice() === false && device.isAndroid() === false, 'Node no es táctil ni Android');

console.log('\n[Runtime aplica el perfil]');
const scene = read('src/scene/SceneManager.js');
const game = read('src/core/Game.js');
const celeb = read('src/scene/CelebrationDino.js');
ok(/this\.gfx = getGraphicsProfile\(\)/.test(scene) && /this\.gfx = getGraphicsProfile\(\)/.test(game),
  'SceneManager y Game resuelven el perfil');
ok(/if \(this\.gfx\.shadows\)/.test(scene), 'las sombras del sol se montan solo si el perfil las pide');
ok(/if \(this\.gfx\.heavyGlows\)/.test(scene), 'el aura de celebración solo en perfil con glows');
ok(/buildConfetti\(ballDef\.dino, this\.gfx\.particleScale\)/.test(scene), 'el confeti se escala por el perfil');
ok(/buildConfetti\(colorHex, scale = 1\)/.test(celeb), 'buildConfetti acepta escala');
ok(/\(this\.gfx && this\.gfx\.celebration3D\) === 'preload'/.test(game), "preload de GLB solo en perfil 'preload'");
ok(/\(this\.gfx && this\.gfx\.celebration3D\) === 'onwin'/.test(game), "carga perezosa de GLB al ganar en 'onwin'");
ok(/classList\.add\('gfx-' \+ this\.gfx\.name\)/.test(game), 'Game marca el <body> con la clase del perfil');

console.log('\n[Anti-crash: perfil NUNCA undefined / celebration3D siempre presente]');
// El perfil resuelto siempre trae celebration3D con un valor válido.
ok(['preload', 'onwin', 'off'].includes(prof.celebration3D), `getGraphicsProfile().celebration3D válido ('${prof.celebration3D}')`);
ok(typeof device.resolveGraphicsProfile === 'function' && device.resolveGraphicsProfile() === prof,
  'resolveGraphicsProfile() (alias) devuelve el mismo perfil, nunca undefined');
// Todos los presets DEFINEN celebration3D (si faltara, spawnCelebration/preload leerían undefined).
for (const [name, p] of Object.entries(GRAPHICS_PRESETS)) {
  ok(['preload', 'onwin', 'off'].includes(p.celebration3D), `preset '${name}' tiene celebration3D válido`);
}
const dev = read('src/utils/device.js');
ok(/const SAFE_PROFILE = \{[^}]*celebration3D:/.test(dev), 'device.js tiene SAFE_PROFILE con celebration3D (reserva)');
ok(/\.\.\.SAFE_PROFILE, \.\.\.preset/.test(dev), 'getGraphicsProfile hace merge sobre SAFE_PROFILE (todas las claves presentes)');
ok(/if \(!name \|\| !GRAPHICS_PRESETS\[name\]\) name = DESKTOP_PRESET/.test(dev), 'normaliza un preset inválido a uno existente');

console.log('\n[Anti-crash: orden en el constructor de Game (gfx antes de usarse)]');
// El bug era leer this.gfx.celebration3D (en _preloadCelebrationForBall) ANTES de asignar this.gfx.
const idxAssign = game.indexOf('this.gfx = getGraphicsProfile()');
const idxUse = game.indexOf('this._preloadCelebrationForBall()');
ok(idxAssign > 0 && idxUse > 0 && idxAssign < idxUse,
  `this.gfx se asigna (idx ${idxAssign}) ANTES de _preloadCelebrationForBall (idx ${idxUse})`);
ok(/\(this\.gfx && this\.gfx\.celebration3D\) === 'preload'/.test(game) && /\(this\.gfx && this\.gfx\.celebration3D\) === 'onwin'/.test(game),
  'las lecturas de celebration3D son defensivas (this.gfx && …)');

console.log(`\n${fails === 0 ? '✅ Perfil gráfico / modo rendimiento OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
