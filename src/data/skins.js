// skins.js — Catálogo de SKINS de la bola. Una skin cambia SOLO la apariencia de la
// esfera (cuerpo + acabado del material), NO la especie de dino ni su habilidad: el
// emblema del dino se mantiene siempre, así la identidad/habilidad de la bola elegida
// no se pierde al cambiar de skin (skins y dinos son capas ortogonales).
//
// Campos:
//   id, name (clave i18n 'skin.<id>.name'), icon (emoji para la UI)
//   body / body2 → colores del cuerpo (null = usar los del dino elegido, "clásica")
//   mat → propiedades del MeshStandardMaterial (roughness/metalness/emissive/emissiveHex)
//   unlock → cómo se consigue: { type, ... }
//        { type: 'default' }              → de serie
//        { type: 'stars', need: N }       → al acumular N ⭐ de nivel (auto)
//        { type: 'tokens', cost: N }      → comprable con estrellas de canje
//        { type: 'chest' }                → solo puede salir de un cofre jurásico
// Todo procedural y original (sin assets ni IP de terceros).

// rarity ∈ base | comun | rara | epica | legendaria → color/gema de rareza en la UI.
export const SKINS = [
  {
    id: 'classic', name: 'Clásica TREXo', icon: '⚪', rarity: 'base',
    body: null, body2: null,
    mat: { roughness: 0.25, metalness: 0.05, emissive: 0 },
    unlock: { type: 'default' },
  },
  {
    id: 'fosil', name: 'Fósil', icon: '🦴', rarity: 'comun',
    body: '#e8e2d0', body2: '#b9ad93',
    mat: { roughness: 0.7, metalness: 0.0, emissive: 0 },
    unlock: { type: 'stars', need: 6 },
  },
  {
    id: 'huevo', name: 'Huevo de Dino', icon: '🥚', rarity: 'comun',
    body: '#f3ead6', body2: '#d8c39c',
    mat: { roughness: 0.5, metalness: 0.0, emissive: 0 },
    unlock: { type: 'stars', need: 12 },
  },
  {
    id: 'hielo', name: 'Hielo', icon: '🧊', rarity: 'rara',
    body: '#dff3ff', body2: '#7fb8e6',
    mat: { roughness: 0.12, metalness: 0.15, emissive: 0.10, emissiveHex: '#7fd3ff' },
    unlock: { type: 'tokens', cost: 5 },
  },
  {
    id: 'ambar', name: 'Ámbar', icon: '🟧', rarity: 'rara',
    body: '#ffce5e', body2: '#d98a1a',
    mat: { roughness: 0.18, metalness: 0.25, emissive: 0.14, emissiveHex: '#ffae2e' },
    unlock: { type: 'tokens', cost: 8 },
  },
  {
    id: 'volcanica', name: 'Volcánica', icon: '🌋', rarity: 'epica',
    body: '#3a160e', body2: '#d2401a',
    mat: { roughness: 0.35, metalness: 0.1, emissive: 0.45, emissiveHex: '#ff5a1e' },
    unlock: { type: 'stars', need: 24 },
  },
  {
    id: 'meteorito', name: 'Meteorito', icon: '☄️', rarity: 'epica',
    body: '#54504a', body2: '#26221e',
    mat: { roughness: 0.85, metalness: 0.35, emissive: 0.08, emissiveHex: '#ff7a3a' },
    unlock: { type: 'chest' },
  },
  {
    id: 'dorada', name: 'Dorada', icon: '🏆', rarity: 'legendaria',
    body: '#ffe9a0', body2: '#e2a522',
    mat: { roughness: 0.12, metalness: 0.9, emissive: 0.18, emissiveHex: '#ffcf52' },
    unlock: { type: 'stars', need: 45 },
  },
];

export const DEFAULT_SKIN = 'classic';

export function getSkin(id) {
  return SKINS.find((s) => s.id === id) || SKINS[0];
}

/** Skins que se desbloquean automáticamente al alcanzar X estrellas de nivel. */
export function skinsUnlockedByStars(totalStars) {
  return SKINS.filter((s) => s.unlock.type === 'stars' && totalStars >= s.unlock.need).map((s) => s.id);
}

/** Skins que pueden salir de un cofre (chest-only + las de estrellas/tokens aún no logradas). */
export function chestSkinPool() {
  return SKINS.filter((s) => s.unlock.type === 'chest').map((s) => s.id);
}

/**
 * Combina la definición de la bola (dino) con la skin activa: la skin sobreescribe
 * el color del cuerpo y el material; el emblema del dino (species/dino/dark) se conserva.
 * @returns {object} ballDef extendido con {skinMat}
 */
export function applySkin(ballDef, skinId) {
  const skin = getSkin(skinId);
  const out = { ...ballDef };
  if (skin.body) { out.body = skin.body; out.body2 = skin.body2; }
  out.skinMat = skin.mat;
  out.skinId = skin.id;
  return out;
}
