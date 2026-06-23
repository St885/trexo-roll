// playerProfileService.js — Perfil del jugador en Firestore (players/{uid}) y FUNCIONES
// PURAS de mapeo entre el guardado local (storage.js) y el documento de la nube.
//
// PRIVACIDAD: el documento NO contiene contraseña ni tokens. El correo se guarda solo
// en forma "públicamente segura" (enmascarada); el correo real lo gestiona Firebase Auth.
// Cada documento es privado del dueño (reglas de Firestore: uid == auth.uid).

import { getFirebase } from './firebaseClient.js';

// --- Mapeo PURO (testeable sin Firebase) -------------------------------------

/** Enmascara un correo para guardarlo de forma no sensible: "jo***@dominio.com". */
export function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  const head = local.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}

/** Nº de niveles completados (con ≥1 estrella) a partir del mapa de estrellas. */
export function countCompleted(starMap) {
  if (!starMap || typeof starMap !== 'object') return 0;
  return Object.values(starMap).filter((v) => (Number(v) || 0) > 0).length;
}

function sumStars(starMap) {
  if (!starMap || typeof starMap !== 'object') return 0;
  return Object.values(starMap).reduce((a, b) => a + (Number(b) || 0), 0);
}

/**
 * Construye el documento de perfil (sin timestamps de servidor) a partir del guardado
 * local + metadatos de sesión/usuario. `meta`: {playerName, language, authProvider, email}.
 */
export function localToProfile(localSave = {}, meta = {}) {
  const stars = localSave.stars || {};
  return {
    playerName: (meta.playerName || localSave.playerName || 'Jugador').slice(0, 24),
    emailPublicSafe: maskEmail(meta.email || ''),
    preferredLanguage: meta.language === 'en' ? 'en' : 'es',
    authProvider: meta.authProvider || 'password',
    progress: {
      unlockedLevel: Math.max(1, Number(localSave.unlocked) || 1),
      bestScore: Math.max(0, Number(localSave.highScore) || 0),
      totalStars: sumStars(stars),
      levelStars: stars,
      completedLevels: countCompleted(stars),
    },
    inventory: {
      coins: 0, // las monedas son puntuación por nivel, no moneda persistente en este juego
      starTokens: nn(localSave.starTokens),
      livesBank: nn(localSave.livesBank),
      extraLives: nn(localSave.extraLives),
      trapBlocks: nn(localSave.trapBlocks),
      fallShields: nn(localSave.fallShields),
      ownedSkins: Array.isArray(localSave.ownedSkins) ? localSave.ownedSkins : ['classic'],
      activeSkin: typeof localSave.activeSkin === 'string' ? localSave.activeSkin : 'classic',
    },
    rewards: {
      dailyReward: localSave.daily || { lastClaimDate: '', streak: 0 },
      jurassicChest: null, // reservado para estado futuro del cofre
      openedChests: nn(localSave.chestsOpened),
    },
    settings: {
      soundEnabled: localSave.sfxOn !== false,
      musicEnabled: localSave.musicOn !== false,
      language: meta.language === 'en' ? 'en' : 'es',
    },
  };
}

/** Convierte un documento de perfil de la nube a la forma del guardado local (storage). */
export function profileToLocalSave(profile = {}) {
  const p = profile.progress || {};
  const inv = profile.inventory || {};
  const rw = profile.rewards || {};
  const st = profile.settings || {};
  return {
    highScore: Math.max(0, Number(p.bestScore) || 0),
    unlocked: Math.max(1, Number(p.unlockedLevel) || 1),
    stars: p.levelStars && typeof p.levelStars === 'object' ? p.levelStars : {},
    starTokens: nn(inv.starTokens),
    livesBank: nn(inv.livesBank),
    extraLives: nn(inv.extraLives),
    trapBlocks: nn(inv.trapBlocks),
    fallShields: nn(inv.fallShields),
    ownedSkins: Array.isArray(inv.ownedSkins) ? inv.ownedSkins : ['classic'],
    activeSkin: typeof inv.activeSkin === 'string' ? inv.activeSkin : 'classic',
    chestsOpened: nn(rw.openedChests),
    daily: rw.dailyReward && typeof rw.dailyReward === 'object' ? rw.dailyReward : { lastClaimDate: '', streak: 0 },
    sfxOn: st.soundEnabled !== false,
    musicOn: st.musicEnabled !== false,
  };
}

/** Métricas para resolver conflictos de progreso (mayor = más avanzado). */
export function summarize(src = {}) {
  // Acepta tanto un guardado local como un perfil de nube.
  if (src.progress) {
    return {
      unlockedLevel: Number(src.progress.unlockedLevel) || 1,
      totalStars: Number(src.progress.totalStars) || 0,
      bestScore: Number(src.progress.bestScore) || 0,
    };
  }
  return {
    unlockedLevel: Number(src.unlocked) || 1,
    totalStars: sumStars(src.stars),
    bestScore: Number(src.highScore) || 0,
  };
}

function nn(v) { return Math.max(0, Number(v) || 0); }

// --- Firestore (async; no-op seguro si no hay Firebase) ----------------------

function _ref(fb, uid) {
  return fb.sdk.firestore.doc(fb.db, 'players', uid);
}

/** Lee el perfil de la nube. Devuelve el documento o null. */
export async function fetchProfile(uid) {
  const fb = await getFirebase();
  if (!fb || !uid) return null;
  try {
    const snap = await fb.sdk.firestore.getDoc(_ref(fb, uid));
    return snap.exists() ? snap.data() : null;
  } catch (_) { return null; }
}

/** Guarda/mezcla el perfil. Añade lastLoginAt y createdAt (si nuevo) con hora de servidor. */
export async function saveProfile(uid, profile, { isNew = false } = {}) {
  const fb = await getFirebase();
  if (!fb || !uid) return { ok: false, code: 'not-configured' };
  try {
    const ts = fb.sdk.firestore.serverTimestamp();
    const data = { ...profile, lastLoginAt: ts };
    if (isNew) data.createdAt = ts;
    await fb.sdk.firestore.setDoc(_ref(fb, uid), data, { merge: true });
    return { ok: true };
  } catch (e) { return { ok: false, code: (e && e.code) || 'error' }; }
}

/** Crea el perfil si no existe; devuelve {created, profile}. */
export async function createProfileIfMissing(uid, profile) {
  const existing = await fetchProfile(uid);
  if (existing) return { created: false, profile: existing };
  await saveProfile(uid, profile, { isNew: true });
  return { created: true, profile };
}
