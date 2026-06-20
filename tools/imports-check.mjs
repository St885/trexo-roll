// imports-check.mjs — Detecta el error que congeló la victoria: usar una función de
// textures.js (p. ej. makeGlowTexture) SIN importarla → ReferenceError en runtime que
// los smoke-tests no pillan (no instancian WebGL). Verifica, para cada módulo, que toda
// función EXPORTADA por textures.js que se LLAMA esté también IMPORTADA en ese archivo.
//
// Uso:  node tools/imports-check.mjs

import fs from 'node:fs';

const texturesSrc = fs.readFileSync('src/scene/textures.js', 'utf8');
const exports = [...texturesSrc.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]);

const files = fs.readdirSync('src', { recursive: true })
  .filter((f) => f.endsWith('.js'))
  .map((f) => 'src/' + String(f).replaceAll('\\', '/'))
  .filter((f) => !f.endsWith('textures.js'));

let fails = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  // Nombres importados explícitamente desde textures.js (cualquier ruta relativa).
  const imp = src.match(/import\s*\{([^}]*)\}\s*from\s*['"][^'"]*textures\.js['"]/);
  const imported = new Set(imp ? imp[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()) : []);
  for (const name of exports) {
    const called = new RegExp(`\\b${name}\\s*\\(`).test(src);
    if (called && !imported.has(name)) {
      fails++;
      console.log(`  ❌ ${f}: usa ${name}() pero NO lo importa desde textures.js`);
    }
  }
}

if (fails === 0) console.log('✅ Imports de textures.js correctos en todos los módulos');
else console.log(`\n❌ ${fails} import(s) faltante(s) — causarían ReferenceError en runtime`);
process.exit(fails === 0 ? 0 : 1);
