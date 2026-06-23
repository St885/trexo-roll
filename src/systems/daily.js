// daily.js — Lógica de la RECOMPENSA DIARIA (sistema de retención). Pura y testeable:
// recibe la fecha de hoy como string 'YYYY-MM-DD' (en el juego se calcula con el reloj
// local del navegador). Sin backend. La persistencia la gestiona quien llama (storage).
//
// Modelo: el jugador reclama 1 recompensa por día. Si entra en días consecutivos, la
// racha sube y la recompensa mejora (tabla de 7 días que se repite). Si falta un día,
// la racha se reinicia. No se puede reclamar dos veces el mismo día.

// Tabla de recompensas por día de racha (1..7). Generosa pero sin romper la economía.
// type ∈ inventario/recursos persistentes: 'tokens'|'extraLives'|'trapBlocks'|'fallShields'|'livesBank'
export const DAILY_REWARDS = [
  { day: 1, type: 'tokens',      amount: 2, icon: '⭐' },
  { day: 2, type: 'extraLives',  amount: 1, icon: '🥚' },
  { day: 3, type: 'tokens',      amount: 3, icon: '⭐' },
  { day: 4, type: 'trapBlocks',  amount: 1, icon: '🪨' },
  { day: 5, type: 'fallShields', amount: 1, icon: '🦅' },
  { day: 6, type: 'livesBank',   amount: 3, icon: '❤️' },
  { day: 7, type: 'tokens',      amount: 5, icon: '🌟' },
];

/** Convierte 'YYYY-MM-DD' a un índice de día (entero) para comparar consecutividad. */
function dayIndex(dateStr) {
  // Interpretación UTC estable e independiente de zona (solo importa la diferencia).
  const ms = Date.parse(dateStr + 'T00:00:00Z');
  return Number.isFinite(ms) ? Math.floor(ms / 86400000) : NaN;
}

/** Recompensa correspondiente a una racha dada (1-based; se repite cada 7 días). */
export function rewardForStreak(streak) {
  const s = Math.max(1, streak | 0);
  const idx = ((s - 1) % 7);
  return DAILY_REWARDS[idx];
}

/**
 * Calcula el estado de la recompensa diaria para "hoy".
 * @param {{lastClaimDate:string, streak:number}} daily  estado persistido
 * @param {string} today  'YYYY-MM-DD'
 * @returns {{canClaim:boolean, nextStreak:number, reward:object, alreadyToday:boolean}}
 */
export function evaluateDaily(daily, today) {
  const last = daily && daily.lastClaimDate ? daily.lastClaimDate : '';
  const prevStreak = daily ? (daily.streak | 0) : 0;
  if (last === today) {
    return { canClaim: false, nextStreak: prevStreak, reward: rewardForStreak(prevStreak), alreadyToday: true };
  }
  const di = dayIndex(today);
  const li = dayIndex(last);
  const consecutive = Number.isFinite(li) && (di - li === 1);
  const nextStreak = consecutive ? prevStreak + 1 : 1;
  return { canClaim: true, nextStreak, reward: rewardForStreak(nextStreak), alreadyToday: false };
}

/** Fecha local de hoy en 'YYYY-MM-DD' (usa el reloj del navegador). */
export function todayStr(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
