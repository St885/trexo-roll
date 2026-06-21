// events-smoke.mjs — Verifica los eventos visuales nuevos SIN navegador:
//   1) critters: API segura (no-op fuera del DOM) y tiempos de vuelo coherentes.
//   2) Integridad de portales por nivel: 26–50 con EXACTAMENTE 2; 1–25 con ninguno.
//
// Uso:  node tools/events-smoke.mjs   (se ejecuta también en `npm test`)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as critters from '../src/effects/critters.js';
import { LEVELS } from '../src/levels/levels.js';

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✅' : '  ❌'} ${msg}`); if (!cond) failures++; };

console.log('\n[Critters: API ambiental]');
// Fuera del navegador (sin document) todas las funciones deben ser no-op y NO lanzar.
let threw = false;
try {
  critters.flyPtero('ltr'); critters.flyPtero('rtl');
  critters.diplodocus(); critters.diplodocus('left'); critters.diplodocus('right');
  critters.clear();
} catch (_) { threw = true; }
ok(!threw, 'flyPtero/diplodocus/clear no lanzan sin DOM (no-op seguro)');

console.log('\n[Critters: tiempos de los 2 vuelos por nivel]');
for (const par of [40, 60, 90, 110]) {
  const ts = critters.pteroFlightTimes(par);
  ok(Array.isArray(ts) && ts.length === 2, `par ${par}: devuelve 2 tiempos`);
  ok(ts[0] > 0 && ts[1] > ts[0], `par ${par}: ida(${ts[0]}) antes que vuelta(${ts[1]})`);
  ok(ts[1] <= 14, `par ${par}: el 2º vuelo ocurre dentro de un margen razonable (${ts[1]}s)`);
}

console.log('\n[Portales: 2 por nivel en 26–50, ninguno en 1–25]');
let newWith2 = 0, oldWithPortals = 0;
for (const lvl of LEVELS) {
  const n = (lvl.portals || []).length;
  if (lvl.id >= 26) { if (n === 2) newWith2++; else { console.log(`  ❌ Nivel ${lvl.id} tiene ${n} portales (esperado 2)`); failures++; } }
  else if (n !== 0) { oldWithPortals++; console.log(`  ❌ Nivel ${lvl.id} (1–25) tiene portales y no debería`); failures++; }
}
ok(newWith2 === 25, `los 25 niveles nuevos (26–50) tienen 2 portales (${newWith2}/25)`);
ok(oldWithPortals === 0, 'los 25 niveles originales no tienen portales');
ok(LEVELS.length === 50, `hay 50 niveles en total (${LEVELS.length})`);

console.log('\n[SVG de critters: bien formado]');
{
  const src = readFileSync(fileURLToPath(new URL('../src/effects/critters.js', import.meta.url)), 'utf8');
  const grab = (name) => { const m = src.match(new RegExp(name + '\\s*=\\s*`([\\s\\S]*?)`')); return m ? m[1] : ''; };
  // Comprueba que las etiquetas abren/cierran correctamente (XML/SVG bien formado).
  const balanced = (svg) => {
    const stack = [];
    const re = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
    let m;
    while ((m = re.exec(svg))) {
      const [, closing, tag, , selfClose] = m;
      if (closing) { if (stack.pop() !== tag) return false; }
      else if (!selfClose) stack.push(tag);
    }
    return stack.length === 0;
  };
  const diplo = grab('DIPLO_SVG');
  const ptero = grab('PTERO_SVG');
  const tri = grab('TRICERATOPS_SVG');
  ok(diplo.length > 400, 'DIPLO_SVG presente y con detalle');
  ok(balanced(diplo), 'DIPLO_SVG: etiquetas balanceadas (bien formado)');
  ok(balanced(ptero), 'PTERO_SVG: etiquetas balanceadas (bien formado)');
  ok(balanced(tri), 'TRICERATOPS_SVG: etiquetas balanceadas (bien formado)');
  // El diplodocus debe incluir todas sus partes nuevas (silueta completa + materiales).
  for (const cls of ['dp-tail', 'dp-leg', 'dp-body', 'dp-neck', 'dp-head', 'dp-eye', 'dp-leaf-blade', 'dpBody', 'dpLeaf']) {
    ok(diplo.includes(cls), `DIPLO_SVG incluye '${cls}'`);
  }
  // El triceratops: adulto (gola + cuernos + patas + cola) + EXACTAMENTE 2 bebés.
  for (const cls of ['tri-adult', 'tri-frill', 'tri-horn', 'tri-leg', 'tri-tail', 'tri-eye', 'triBody', 'triFrill']) {
    ok(tri.includes(cls), `TRICERATOPS_SVG incluye '${cls}'`);
  }
  ok((tri.match(/tri-baby/g) || []).length === 2, 'TRICERATOPS_SVG tiene 2 bebés (tri-baby)');
  ok(typeof critters.triceratops === 'function', 'critters.triceratops es función');
}

console.log('\n[Responsive: viewport y layout base]');
{
  const html = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');
  const css = readFileSync(fileURLToPath(new URL('../styles/main.css', import.meta.url)), 'utf8');
  const vp = (html.match(/name="viewport"\s+content="([^"]+)"/) || [])[1] || '';
  ok(/width=device-width/.test(vp), 'viewport: width=device-width');
  ok(/viewport-fit=cover/.test(vp), 'viewport: viewport-fit=cover (notch/safe-area)');
  ok(/initial-scale=1/.test(vp), 'viewport: initial-scale=1');
  ok(/name="mobile-web-app-capable"/.test(html) && /name="apple-mobile-web-app-capable"/.test(html), 'metas mobile-web-app-capable presentes');
  ok(/html,\s*body\s*\{[\s\S]*?overflow:\s*hidden/.test(css), 'html/body: overflow hidden (sin scroll en gameplay)');
  ok(/html,\s*body\s*\{[\s\S]*?touch-action:\s*none/.test(css), 'html/body: touch-action none');
  ok(/#critter-layer\s*\{[^}]*pointer-events:\s*none/.test(css), '#critter-layer: pointer-events none (no bloquea input)');
}

console.log(`\n${failures === 0 ? '✅ Eventos (portales + critters) OK' : '❌ ' + failures + ' fallo(s)'}\n`);
process.exit(failures === 0 ? 0 : 1);
