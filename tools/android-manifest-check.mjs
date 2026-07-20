// android-manifest-check.mjs — Guarda de release Android (sin navegador). Verifica que el
// AndroidManifest y los gradle NO introduzcan permisos/SDKs nuevos y que orientación/versión/
// target sean los esperados para TREXoRoll v0.25.3. Lee los ficheros del proyecto.
//
// Uso:  node tools/android-manifest-check.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = readFileSync(join(root, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
const appGradle = readFileSync(join(root, 'android/app/build.gradle'), 'utf8');
const vars = readFileSync(join(root, 'android/variables.gradle'), 'utf8');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

console.log('\n[Permisos]');
const perms = [...manifest.matchAll(/uses-permission[^>]*android:name="([^"]+)"/g)].map((m) => m[1]);
ok(perms.length === 1 && perms[0] === 'android.permission.INTERNET', `único permiso INTERNET (${perms.join(', ') || 'ninguno'})`);
ok(!/AD_ID/i.test(manifest), 'sin permiso AD_ID en el manifest');
// Auth real NO debe traer permisos sensibles (Google Sign-In por Firebase no los necesita).
ok(!/GET_ACCOUNTS/.test(manifest), 'sin GET_ACCOUNTS');
ok(!/READ_CONTACTS/.test(manifest), 'sin READ_CONTACTS');
ok(!/ACCESS_(FINE|COARSE)_LOCATION/.test(manifest), 'sin permisos de ubicación');
ok(!/\bCAMERA\b/.test(manifest), 'sin permiso de cámara');
ok(!/RECORD_AUDIO/.test(manifest), 'sin permiso de micrófono');

console.log('\n[Sin SDKs/monetización nuevos]');
ok(!/google-services|firebase|admob|play-services-ads|com\.android\.billing|games\.v2/i.test(manifest), 'sin Firebase/Ads/Billing/PlayGames en el manifest');

console.log('\n[Orientación (rotación horizontal/vertical)]');
ok(/android:screenOrientation="fullSensor"/.test(manifest), 'screenOrientation="fullSensor" (soporta y rota horizontal + vertical)');

console.log('\n[Identidad y versión]');
ok(/applicationId\s+"com\.st885\.trexoroll"/.test(appGradle), 'applicationId com.st885.trexoroll (sin cambios)');
ok(/versionCode\s+6\b/.test(appGradle), 'versionCode 6');
ok(/versionName\s+"0\.28\.1"/.test(appGradle), 'versionName 0.28.1');

console.log('\n[SDK]');
ok(/targetSdkVersion\s*=\s*35/.test(vars), 'targetSdkVersion 35 (mantenido)');
ok(/compileSdkVersion\s*=\s*35/.test(vars), 'compileSdkVersion 35 (mantenido)');
ok(/minSdkVersion\s*=\s*22/.test(vars), 'minSdkVersion 22 (sin cambios)');

console.log(`\n${fails === 0 ? '✅ Android release guard OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
