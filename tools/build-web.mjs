// build-web.mjs — "Build" del juego para Capacitor (y como salida estática reutilizable).
//
// El proyecto NO usa bundler: es HTML + ES modules + assets estáticos con rutas RELATIVAS.
// Por eso el "build" consiste en COPIAR solo los archivos de runtime a www/, dejando fuera
// docs/, tools/, .git, playstore/, etc. Capacitor empaqueta esa carpeta (webDir: "www").
//
// La web/GitHub Pages NO usa www/: sigue sirviéndose desde la raíz. www/ es solo para la
// app Android. No toca nada del juego; solo copia.
//
// Uso:  npm run build     (o: node tools/build-web.mjs)

import { rm, mkdir, cp, stat, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'www');

// Archivos/carpetas de RUNTIME que necesita el juego en el dispositivo.
const INCLUDE = [
  'index.html',
  'manifest.webmanifest',
  'privacy.html',   // política pública (si existe)
  'terms.html',     // términos públicos (si existe)
  'legal.html',     // legal/créditos públicos (si existe)
  'assets',
  'libs',
  'src',
  'styles',
];

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

// Excluye del build las carpetas `_backup/` (originales de assets guardados como respaldo). No son
// de runtime: si se copiaran, inflarían www/ y el APK de Android con archivos que el juego no usa.
const buildFilter = (src) => !/[\\/]_backup([\\/]|$)/.test(src);

async function dirSize(p) {
  let total = 0;
  for (const e of await readdir(p, { withFileTypes: true })) {
    const fp = path.join(p, e.name);
    if (e.isDirectory()) total += await dirSize(fp);
    else total += (await stat(fp)).size;
  }
  return total;
}

async function main() {
  console.log('\n🏗️  Build web → www/ (para Capacitor / Android)\n');
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  let copied = 0;
  for (const item of INCLUDE) {
    const srcPath = path.join(root, item);
    if (!(await exists(srcPath))) { console.log(`  ·  (omitido, no existe) ${item}`); continue; }
    await cp(srcPath, path.join(out, item), { recursive: true, filter: buildFilter });
    console.log(`  ✅ ${item}`);
    copied++;
  }

  // Verificación mínima: www/index.html debe existir.
  if (!(await exists(path.join(out, 'index.html')))) {
    console.error('\n❌ www/index.html no existe tras el build.');
    process.exit(1);
  }
  const kb = Math.round((await dirSize(out)) / 1024);
  console.log(`\n✅ Build listo: www/ (${copied} entradas · ${kb} KB)`);
  console.log('   Siguiente: npx cap sync android   (ver docs/android-build.md)\n');
}

main().catch((e) => { console.error('Error en el build:', e.message); process.exit(1); });
