// auth-smoke.mjs — Verifica la CAPA DE CUENTA (Firebase-ready) y sus garantías de
// seguridad/privacidad SIN navegador ni Firebase configurado:
//   · En demo (sin Firebase) todo degrada con seguridad (no lanza, modo 'demo').
//   · NUNCA se guarda contraseña en el guardado local ni en el perfil de la nube.
//   · La analítica filtra parámetros sensibles (password/token/email).
//   · Mapeo local↔perfil y resolución de conflictos correctos.
//
// Uso:  node tools/auth-smoke.mjs

// localStorage mínimo (storage.js cae a memoria si no existe; lo damos para roundtrip).
globalThis.localStorage = (() => { const m = new Map(); return {
  getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k),
}; })();

import { isConfigured } from '../src/services/firebaseClient.js';
import * as auth from '../src/services/authService.js';
import { localToProfile, profileToLocalSave, maskEmail, summarize, countCompleted } from '../src/services/playerProfileService.js';
import { chooseMoreAdvanced, SYNC_STATUS } from '../src/services/progressSyncService.js';
import { EVENTS, logEvent, sanitizeParams } from '../src/services/analyticsService.js';
import { importSave, exportSave } from '../src/utils/storage.js';
import { AUTH_MODES } from '../src/utils/session.js';
import { STRINGS } from '../src/utils/i18n.js';
import { isAndroidWebView } from '../src/utils/device.js';

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

console.log('\n[Fallback seguro sin Firebase]');
ok((await isConfigured()) === false, 'isConfigured() = false (sin config real)');
ok((await auth.getAuthMode()) === 'demo', 'getAuthMode() = demo');
const login = await auth.signInEmail({ email: 'a@b.com', password: 'secret1' });
ok(login.ok === false && login.code === 'auth/not-configured', 'signInEmail degrada a not-configured (no lanza)');
const reg = await auth.signUpEmail({ email: 'a@b.com', password: 'secret1', displayName: 'Stefano' });
ok(reg.ok === false && reg.code === 'auth/not-configured', 'signUpEmail degrada a not-configured');
ok((await auth.resetPassword('a@b.com')).code === 'auth/not-configured', 'resetPassword degrada a not-configured');
ok((await auth.signInWithGoogle()).code === 'auth/not-configured', 'signInWithGoogle degrada a not-configured (no lanza)');
ok((await auth.signInWithProvider('google')).code === 'auth/not-configured', "signInWithProvider('google') enruta a Google (not-configured en demo)");
ok((await auth.signInWithProvider('apple')).code === 'auth/provider-not-enabled', 'proveedores no implementados = not-enabled');
ok((await auth.startGuest()).ok === true, 'modo invitado disponible');
ok((await auth.continueAsGuest()).ok === true, 'continueAsGuest() disponible (alias)');
ok((await auth.initAuth()).mode === 'demo', 'initAuth() = demo sin Firebase (no lanza)');
ok((await auth.isGuest()) === true, 'isGuest() = true sin sesión');
ok((await auth.getPublicPlayerProfile()) === null, 'getPublicPlayerProfile() = null sin sesión');
ok((await auth.getCurrentUser()) === null, 'getCurrentUser() = null sin sesión');
ok(typeof auth.registerWithEmail === 'function' && typeof auth.loginWithEmail === 'function' && typeof auth.logout === 'function' && typeof auth.onAuthStateChanged === 'function', 'API FASE 4 presente (registerWithEmail/loginWithEmail/logout/onAuthStateChanged)');
ok(AUTH_MODES.includes('email'), "AUTH_MODES incluye 'email' (cuenta real)");

console.log('\n[Validación de inputs]');
ok(auth.isValidEmail('john@doe.com') && !auth.isValidEmail('nope'), 'email válido/ inválido');
ok(auth.isValidPassword('secret1') && !auth.isValidPassword('123'), 'contraseña mínima 6');

console.log('\n[Privacidad: nunca se guarda contraseña]');
// Mapeo local→perfil con metadatos: NO debe aparecer la contraseña por ningún lado.
const localSave = { unlocked: 9, highScore: 4200, stars: { 1: 3, 2: 2, 3: 3, 4: 1 }, starTokens: 7, livesBank: 2,
  extraLives: 1, trapBlocks: 0, fallShields: 1, ownedSkins: ['classic', 'ambar'], activeSkin: 'ambar',
  chestsOpened: 2, daily: { lastClaimDate: '2026-06-23', streak: 4 }, sfxOn: true, musicOn: false };
const profile = localToProfile(localSave, { playerName: 'Stefano', language: 'es', authProvider: 'password', email: 'john.doe@gmail.com', password: 'SHOULD_NOT_LEAK' });
const profileJson = JSON.stringify(profile);
// No debe filtrarse el VALOR de la contraseña ni existir una clave "password".
// (authProvider:'password' es el TIPO de proveedor de Firebase, no una credencial.)
ok(!profileJson.toLowerCase().includes('should_not_leak') && !profileJson.includes('"password":') && !profileJson.includes('"pass":'), 'el perfil NO contiene contraseña (ni clave ni valor)');
ok(profile.emailPublicSafe === maskEmail('john.doe@gmail.com') && !profile.emailPublicSafe.includes('hn.doe'), 'email enmascarado (no se guarda completo)');
ok(profile.progress.unlockedLevel === 9 && profile.progress.totalStars === 9 && profile.progress.completedLevels === 4, 'progreso mapeado correctamente');
// importSave nunca persiste claves desconocidas como password.
importSave({ unlocked: 12, password: 'SECRET', token: 'T' });
const after = exportSave();
ok(after.unlocked === 12 && after.password === undefined && after.token === undefined, 'importSave ignora password/token');

console.log('\n[Roundtrip local↔nube]');
const back = profileToLocalSave(profile);
ok(back.unlocked === 9 && back.highScore === 4200 && back.activeSkin === 'ambar' && JSON.stringify(back.stars) === JSON.stringify(localSave.stars), 'profileToLocalSave reconstruye el progreso');
ok(countCompleted({ 1: 3, 2: 0, 3: 1 }) === 2, 'countCompleted cuenta niveles con ≥1★');

console.log('\n[Resolución de conflictos (más avanzado)]');
ok(chooseMoreAdvanced({ unlockedLevel: 10, totalStars: 5, bestScore: 1 }, { unlockedLevel: 8, totalStars: 99, bestScore: 99 }) === 'local', 'prioriza nivel desbloqueado');
ok(chooseMoreAdvanced({ unlockedLevel: 8, totalStars: 20, bestScore: 1 }, { unlockedLevel: 8, totalStars: 30, bestScore: 1 }) === 'cloud', 'a igual nivel, gana más estrellas');
ok(chooseMoreAdvanced({ unlockedLevel: 8, totalStars: 20, bestScore: 50 }, { unlockedLevel: 8, totalStars: 20, bestScore: 10 }) === 'local', 'a igual nivel y estrellas, gana mejor score');
ok(chooseMoreAdvanced({ unlockedLevel: 5, totalStars: 5, bestScore: 5 }, { unlockedLevel: 5, totalStars: 5, bestScore: 5 }) === 'equal', 'empate detectado');
ok(summarize(localSave).unlockedLevel === 9 && summarize(profile).unlockedLevel === 9, 'summarize acepta local y perfil');

console.log('\n[Analítica: filtra datos sensibles]');
const clean = sanitizeParams({ level: 3, stars: 2, password: 'X', token: 'Y', email: 'a@b.com', idToken: 'Z' });
ok(clean.level === 3 && clean.stars === 2, 'mantiene parámetros seguros');
ok(clean.password === undefined && clean.token === undefined && clean.email === undefined && clean.idToken === undefined, 'descarta password/token/email/idToken');
let threw = false; try { await logEvent(EVENTS.LEVEL_START, { level: 1, password: 'X' }); await logEvent(EVENTS.LOGIN, { method: 'password' }); } catch (_) { threw = true; }
ok(!threw, 'logEvent no lanza nunca (no-op seguro sin Firebase)');
ok(Object.keys(EVENTS).length >= 12, `eventos definidos (${Object.keys(EVENTS).length})`);

console.log('\n[Red de seguridad anti-pantalla-negra]');
// Mensajes de recuperación/timeout definidos en AMBOS idiomas (para que el usuario nunca quede
// sin feedback ante un fallo de auth). Si falta uno, el fix de pantalla negra estaría a medias.
const RECOVERY_KEYS = ['auth.errTimeout', 'auth.googleWebOnly', 'recover.title', 'recover.body', 'recover.retry', 'recover.guest'];
for (const k of RECOVERY_KEYS) {
  ok(typeof STRINGS.es[k] === 'string' && typeof STRINGS.en[k] === 'string', `clave i18n "${k}" en ES y EN`);
}
// En Node (sin navegador WebView) el gating de Google NO oculta el botón: Google sigue disponible
// en la versión web. La ocultación solo aplica dentro del WebView de Android (isAndroidWebView()).
ok(isAndroidWebView() === false, 'isAndroidWebView() = false fuera de WebView (Google visible en web)');

console.log(`\n${fails === 0 ? '✅ Capa de cuenta (auth/sync/analytics) OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
