// i18n-check.mjs — Verifica el sistema de idiomas: cada clave usada en data-i18n
// existe (como cadena) en ES y EN, y todas las claves ES tienen su par en EN.
//
// Uso:  node tools/i18n-check.mjs

import fs from 'node:fs';

if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
const { STRINGS } = await import('../src/utils/i18n.js');

const html = fs.readFileSync('index.html', 'utf8');
let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ❌ ' + msg); } };

// 1) Las claves de data-i18n / data-i18n-html deben ser CADENAS en ES y EN.
const used = new Set([...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((m) => m[1]));
for (const k of used) {
  ok(typeof STRINGS.es[k] === 'string', `ES['${k}'] debe ser cadena (data-i18n)`);
  ok(typeof STRINGS.en[k] === 'string', `EN['${k}'] debe ser cadena (data-i18n)`);
}

// 2) Paridad: toda clave de ES debe existir en EN (la UI completa traducida).
for (const k of Object.keys(STRINGS.es)) {
  ok(k in STRINGS.en, `falta traducción EN para: ${k}`);
}

console.log(`\n  data-i18n usadas: ${used.size}  ·  ES: ${Object.keys(STRINGS.es).length}  ·  EN: ${Object.keys(STRINGS.en).length}`);
console.log(`\n${fails === 0 ? '✅ i18n (ES/EN) OK' : '❌ ' + fails + ' fallo(s) de i18n'}`);
process.exit(fails === 0 ? 0 : 1);
