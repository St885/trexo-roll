// fetch-firebase.mjs — Descarga el SDK web modular de Firebase a libs/firebase/ (vendorizado).
// Lo ejecuta EL USUARIO cuando quiere activar la nube:  npm run fetch:firebase
//
// · Requiere conexión a internet (descarga desde gstatic, origen oficial de Firebase).
// · Sobrescribe los placeholders de libs/firebase/ con el SDK real.
// · NO descarga ni escribe claves, tokens ni nada sensible: solo el SDK público.
// · Si no hay red o falla, el juego sigue en modo demo (placeholders intactos si no se
//   sobrescriben). Para actualizar de versión, cambia FIREBASE_VERSION.

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import https from 'node:https';

const FIREBASE_VERSION = '10.12.2';
const PRODUCTS = ['firebase-app', 'firebase-auth', 'firebase-firestore', 'firebase-analytics'];
const BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'libs', 'firebase');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode} en ${url}`)); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function main() {
  console.log(`\n📦 Descargando Firebase Web SDK v${FIREBASE_VERSION} → libs/firebase/\n`);
  await mkdir(outDir, { recursive: true });
  let okCount = 0;
  for (const prod of PRODUCTS) {
    const url = `${BASE}/${prod}.js`;
    const dest = path.join(outDir, `${prod}.js`);
    try {
      const data = await get(url);
      // Comprobación mínima de cordura: que parezca código JS (no una página de error).
      if (data.length < 500 || /<html/i.test(data.slice(0, 200).toString())) {
        throw new Error('respuesta inesperada (¿no es el SDK?)');
      }
      // VENDORIZADO REAL: los bundles del CDN se importan ENTRE SÍ con URLs absolutas a gstatic
      // (p. ej. firebase-auth.js hace `import ... from "https://www.gstatic.com/.../firebase-app.js"`).
      // Con la CSP `script-src 'self'` eso se BLOQUEA → Firebase no inicializaría. Se reescriben a
      // rutas locales relativas (./firebase-app.js), que es el sentido de vendorizar (mismo origen).
      const text = data.toString('utf8').replaceAll(`${BASE}/`, './');
      await writeFile(dest, text);
      console.log(`  ✅ ${prod}.js  (${(text.length / 1024).toFixed(0)} KB, imports reescritos a locales)`);
      okCount++;
    } catch (e) {
      console.log(`  ❌ ${prod}.js  → ${e.message}`);
    }
  }
  if (okCount === PRODUCTS.length) {
    console.log('\n✅ SDK vendorizado. Ahora pega tus claves en src/config/firebaseConfig.js y prueba.');
    console.log('   (Verifica en DevTools → Network que no haya peticiones de script a gstatic.com.)\n');
  } else {
    console.log(`\n⚠️  Descargados ${okCount}/${PRODUCTS.length}. Revisa tu conexión y vuelve a intentar.`);
    console.log('   Mientras tanto, el juego sigue en modo demo (placeholders).\n');
    process.exit(1);
  }
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1); });
