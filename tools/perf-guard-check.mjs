// perf-guard-check.mjs — Guardas ANTI-REGRESIÓN de rendimiento (Fase 9). Verifica de forma
// estática (sin navegador) que siguen en su sitio las correcciones que devolvieron la fluidez:
//   · scene.resize() ignora llamadas sin cambio real de tamaño (no reasigna el buffer GL),
//   · el pixelRatio se acota en táctil,
//   · los eventos frecuentes de resize/visualViewport se COALESCAN por rAF (no reflujo por evento),
//   · la instrumentación de rendimiento va detrás de DEBUG_PERFORMANCE=false y NO dibuja overlay,
//   · la pantalla de victoria no usa backdrop-filter sobre el lienzo animado,
//   · el joystick oculto no renderiza el knob cada frame.
//
// Uso:  node tools/perf-guard-check.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

const scene = read('src/scene/SceneManager.js');
const game = read('src/core/Game.js');
const input = read('src/core/InputController.js');
const constants = read('src/utils/constants.js');
const perf = read('src/utils/perf.js');
const css = read('styles/main.css');

console.log('\n[Guarda de resize — no reasignar buffer GL sin cambio real]');
ok(/resize\(\s*force\s*=\s*false\s*\)/.test(scene), 'resize(force=false) acepta forzar');
ok(/w === this\._lastW && h === this\._lastH && dpr === this\._lastDpr\s*\)\s*return/.test(scene),
  'resize() sale temprano si w/h/dpr no cambiaron');
ok(/if \(dpr !== this\._lastDpr\) this\.renderer\.setPixelRatio/.test(scene),
  'setPixelRatio SOLO cuando cambia el DPR (evita setSize doble)');

console.log('\n[pixelRatio acotado por el perfil gráfico]');
ok(/GRAPHICS_PRESETS/.test(constants), 'existen GRAPHICS_PRESETS (quality/balanced/performance)');
ok(/this\.gfx = getGraphicsProfile\(\)/.test(scene), 'SceneManager resuelve el perfil gráfico activo');
ok(/this\._dprCap = this\.gfx\.pixelRatioCap/.test(scene), 'el cap de pixelRatio viene del perfil gráfico');
ok(/this\.renderer\.shadowMap\.enabled = this\.gfx\.shadows/.test(scene), 'las sombras dependen del perfil (off en móvil)');

console.log('\n[Coalescer de viewport — no reflujo por cada evento]');
ok(/_coalescedViewportChange\(\)/.test(game), 'existe _coalescedViewportChange()');
ok(/requestAnimationFrame\(\(\)\s*=>\s*\{[\s\S]*_handleViewportChange\(\)/.test(game), 'coalesce por requestAnimationFrame');
ok(/addEventListener\('resize',\s*\(\)\s*=>\s*this\._coalescedViewportChange\(\)\)/.test(game),
  "window 'resize' usa el coalescer");
ok(/visualViewport\.addEventListener\('resize',\s*\(\)\s*=>\s*this\._coalescedViewportChange\(\)\)/.test(game),
  "visualViewport 'resize' usa el coalescer");

console.log('\n[Instrumentación SOLO desarrollo, sin overlay]');
ok(/export const DEBUG_PERFORMANCE = false;/.test(constants), 'DEBUG_PERFORMANCE = false por defecto (no se envía activa)');
ok(!/document\.createElement|innerHTML|appendChild|style\./.test(perf), 'perf.js NO crea overlay ni toca el DOM');
ok(/const ON = !!DEBUG_PERFORMANCE;/.test(perf) && /if \(!ON\) return/.test(perf), 'perf.js tiene coste cero cuando está desactivado');
ok(/perf\.frame\(\)/.test(game), 'el bucle principal instrumenta el frame');

console.log('\n[Victoria: sin backdrop-filter sobre el lienzo animado]');
const winBlock = (css.match(/#screen-win\.active\s*\{[\s\S]*?\}/) || [''])[0];
const winClean = winBlock.replace(/\/\*[\s\S]*?\*\//g, ''); // quita comentarios (pueden mencionar la palabra)
ok(winBlock.length > 0, 'existe la regla #screen-win.active');
ok(!/backdrop-filter\s*:/.test(winClean), '#screen-win.active NO usa la propiedad backdrop-filter (evita recomputar cada frame)');

console.log('\n[Joystick oculto no procesa el knob cada frame]');
ok(/setJoystickShown\(v\)/.test(input), 'InputController.setJoystickShown existe');
ok(/if \(!this\.knobEl \|\| \(!this\._joystickShown && !this\.joyActive\)\) return;/.test(input),
  '_renderKnob sale si el joystick está oculto e inactivo');
ok(/setJoystickShown\(this\.showJoystick\)/.test(game), 'Game informa la visibilidad del joystick al InputController');

console.log(`\n${fails === 0 ? '✅ Guardas de rendimiento OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
