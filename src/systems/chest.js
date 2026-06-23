// chest.js — Lógica del COFRE JURÁSICO. Pura y testeable: la tirada recibe un RNG
// (por defecto Math.random) y, para premios de skin, el conjunto de skins aún
// bloqueadas. La persistencia/entrega real la hace quien llama (Game + storage).
//
// Balance: el cofre es generoso pero NO rompe la economía. Da recursos persistentes
// (estrellas de canje, potenciadores, banco de vidas), a veces una skin si quedan
// bloqueadas, y como premio mayor un pequeño boost de estrellas de canje. No otorga
// "estrellas de nivel" (esas solo se ganan jugando, para no falsear la progresión).

// Tabla ponderada de recompensas. weight = probabilidad relativa.
// type: 'tokens' | 'extraLives' | 'trapBlocks' | 'fallShields' | 'livesBank' | 'skin'
export const CHEST_TABLE = [
  { type: 'tokens',      min: 2, max: 4, weight: 26, icon: '⭐' },
  { type: 'extraLives',  min: 1, max: 1, weight: 18, icon: '🥚' },
  { type: 'trapBlocks',  min: 1, max: 2, weight: 16, icon: '🪨' },
  { type: 'fallShields', min: 1, max: 1, weight: 14, icon: '🦅' },
  { type: 'livesBank',   min: 3, max: 5, weight: 12, icon: '❤️' },
  { type: 'skin',        weight: 10, icon: '🎨' },          // solo si quedan skins bloqueadas
  { type: 'tokens',      min: 5, max: 7, weight: 4,  icon: '🌟' }, // jackpot menor
];

const randInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));

/**
 * Tira una recompensa del cofre.
 * @param {() => number} rng           generador [0,1) (por defecto Math.random)
 * @param {string[]} lockedSkins       ids de skins aún bloqueadas (para premio de skin)
 * @returns {{type:string, amount?:number, skinId?:string, icon:string}}
 */
export function rollChest(rng = Math.random, lockedSkins = []) {
  // Si no quedan skins por desbloquear, el premio 'skin' se convierte en tokens.
  const table = CHEST_TABLE.filter((e) => e.type !== 'skin' || lockedSkins.length > 0);
  const total = table.reduce((a, e) => a + e.weight, 0);
  let r = rng() * total;
  let pick = table[0];
  for (const e of table) { if ((r -= e.weight) < 0) { pick = e; break; } }

  if (pick.type === 'skin') {
    const skinId = lockedSkins[Math.floor(rng() * lockedSkins.length)] || lockedSkins[0];
    return { type: 'skin', skinId, icon: '🎨' };
  }
  return { type: pick.type, amount: randInt(rng, pick.min, pick.max), icon: pick.icon };
}
