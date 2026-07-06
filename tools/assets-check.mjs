// assets-check.mjs — Verifica que los MODELOS 3D referenciados por constants.js existen en la
// ruta esperada dentro de assets/ (referencia no rota). El build los copia a www/ y cap:sync a
// Android. No usa navegador.
//
// Uso:  node tools/assets-check.mjs

import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const constants = readFileSync(join(root, 'src/utils/constants.js'), 'utf8');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

// Extrae rutas de modelo declaradas como constantes 'assets/models/...'
const paths = [...constants.matchAll(/'(assets\/models\/[^']+\.glb)'/g)].map((m) => m[1]);

console.log('\n[Modelos 3D referenciados por constants.js]');
ok(paths.length >= 1, `hay rutas de modelo declaradas (${paths.length})`);
ok(paths.some((p) => p.includes('triceratops_baby_yellow')), 'referencia al triceratops de victoria presente');

for (const rel of paths) {
  const abs = join(root, rel);
  const exists = existsSync(abs);
  const mb = exists ? (statSync(abs).size / 1048576).toFixed(2) : '0';
  ok(exists, `${rel} existe (${mb} MB)`);
  if (exists) ok(statSync(abs).size < 20 * 1048576, `${rel} < 20 MB (optimizado para móvil)`);
}

// Los modelos de celebración se OPTIMIZAN para móvil (texturas → 512×512 PNG; geometría intacta).
// Cada uno debe pesar CLARAMENTE menos que su original respaldado en _backup/ y por debajo de un
// techo móvil. Evita regresiones (re-subir el GLB pesado sin optimizar).
console.log('\n[Modelos de celebración optimizados para móvil]');
const OPTIMIZED_MODELS = [
  { dir: 'trexo', file: 'trexo_master.glb', backup: 'trexo_master_original.glb', capMB: 4 },
  { dir: 'trexo', file: 'trexo_character.glb', backup: 'trexo_character_original.glb', capMB: 3 },
  { dir: 'raptor_baby', file: 'raptor_baby_green.glb', backup: 'raptor_baby_green_original.glb', capMB: 3 },
  { dir: 'parasaur_baby', file: 'parasaur_baby_pink.glb', backup: 'parasaur_baby_pink_original.glb', capMB: 3 },
];
for (const { dir, file, backup, capMB } of OPTIMIZED_MODELS) {
  const cur = join(root, `assets/models/characters/${dir}/${file}`);
  const bak = join(root, `assets/models/characters/${dir}/_backup/${backup}`);
  if (existsSync(cur)) {
    const curSize = statSync(cur).size;
    ok(curSize < capMB * 1048576, `${file} < ${capMB} MB (${(curSize / 1048576).toFixed(2)} MB, optimizado)`);
    if (existsSync(bak)) {
      const origSize = statSync(bak).size;
      ok(curSize < origSize, `${file} (${(curSize / 1048576).toFixed(2)} MB) pesa menos que el original respaldado (${(origSize / 1048576).toFixed(2)} MB)`);
    }
  } else {
    ok(false, `${file} existe`);
  }
}

// La CSP debe permitir blob: en img-src (GLTFLoader carga las texturas embebidas del GLB como
// blob:). Sin esto, las texturas NO cargan y el modelo sale oscuro/sin color.
console.log('\n[CSP permite texturas de GLB]');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const csp = (html.match(/Content-Security-Policy"[^>]*content="([^"]+)"/) || [])[1] || '';
const imgSrc = (csp.match(/img-src([^;]*)/) || [])[1] || '';
ok(/\bblob:/.test(imgSrc), `img-src incluye blob: (texturas GLB) — "${imgSrc.trim()}"`);

console.log(`\n${fails === 0 ? '✅ Assets de modelos OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
