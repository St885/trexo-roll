// progressSyncService.js — Estrategia de sincronización entre el guardado LOCAL
// (storage.js) y la NUBE (Firestore, vía playerProfileService). No-op seguro sin Firebase.
//
// Política de conflictos (MVP, documentada en docs/auth-architecture.md): cuando hay
// progreso local y en la nube, se elige automáticamente el MÁS AVANZADO por:
//   1) mayor nivel desbloqueado, 2) mayor total de estrellas, 3) mayor bestScore.
// La UI puede ofrecer elegir manualmente; por defecto gana el más avanzado.

import { exportSave, importSave } from '../utils/storage.js';
import {
  localToProfile, profileToLocalSave, summarize,
  fetchProfile, saveProfile, createProfileIfMissing,
} from './playerProfileService.js';
import { getFirebase } from './firebaseClient.js';

export const SYNC_STATUS = {
  LOCAL: 'local',     // Guardado local
  CLOUD: 'cloud',     // Sincronizado en la nube
  OFFLINE: 'offline', // Sin conexión
  PENDING: 'pending', // Pendiente de sincronizar
};

/**
 * Decide qué progreso es más avanzado. Función PURA.
 * @returns {'local'|'cloud'|'equal'}
 */
export function chooseMoreAdvanced(localSummary, cloudSummary) {
  const a = localSummary || {}, b = cloudSummary || {};
  const keys = ['unlockedLevel', 'totalStars', 'bestScore'];
  for (const k of keys) {
    const av = Number(a[k]) || 0, bv = Number(b[k]) || 0;
    if (av > bv) return 'local';
    if (bv > av) return 'cloud';
  }
  return 'equal';
}

/** Sube el progreso local a la nube (crea el perfil si falta). */
export async function migrateLocalToCloud(uid, meta = {}) {
  const fb = await getFirebase();
  if (!fb || !uid) return { ok: false, status: SYNC_STATUS.LOCAL };
  const local = exportSave();
  const profile = localToProfile(local, meta);
  const res = await createProfileIfMissing(uid, profile);
  if (!res.created) await saveProfile(uid, profile);
  return { ok: true, status: SYNC_STATUS.CLOUD };
}

/** Trae el progreso de la nube y lo aplica al guardado local. */
export async function loadCloudToLocal(uid) {
  const profile = await fetchProfile(uid);
  if (!profile) return { ok: false, status: SYNC_STATUS.PENDING };
  importSave(profileToLocalSave(profile));
  return { ok: true, status: SYNC_STATUS.CLOUD };
}

/**
 * Sincroniza al iniciar sesión: compara local vs nube y aplica el más avanzado a ambos.
 * meta: {playerName, language, authProvider, email}.
 * @returns {{ok, status, choice}}
 */
export async function syncOnLogin(uid, meta = {}) {
  const fb = await getFirebase();
  if (!fb || !uid) return { ok: false, status: SYNC_STATUS.LOCAL, choice: 'local' };

  const local = exportSave();
  const cloud = await fetchProfile(uid);

  if (!cloud) {
    // Primera vez en la nube: sube el progreso local.
    const r = await migrateLocalToCloud(uid, meta);
    return { ok: r.ok, status: r.ok ? SYNC_STATUS.CLOUD : SYNC_STATUS.PENDING, choice: 'local' };
  }

  const choice = chooseMoreAdvanced(summarize(local), summarize(cloud));
  if (choice === 'cloud') {
    importSave(profileToLocalSave(cloud));          // la nube manda → actualiza local
  } else {
    const profile = localToProfile(exportSave(), meta);
    await saveProfile(uid, profile);                // local manda (o empate) → sube
  }
  return { ok: true, status: SYNC_STATUS.CLOUD, choice };
}

/** Sube el progreso local actual (uso tras ganar/comprar). Best-effort. */
export async function pushLocal(uid, meta = {}) {
  const fb = await getFirebase();
  if (!fb || !uid) return { ok: false, status: SYNC_STATUS.LOCAL };
  try {
    await saveProfile(uid, localToProfile(exportSave(), meta));
    return { ok: true, status: SYNC_STATUS.CLOUD };
  } catch (_) {
    return { ok: false, status: SYNC_STATUS.PENDING };
  }
}
