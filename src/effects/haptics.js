// haptics.js — Vibración táctil OPCIONAL y segura (Android/Chrome). Usa la Vibration API
// estándar, que NO requiere permisos. Silenciosa si la API no existe (desktop/iOS) o si
// está deshabilitada. Patrones muy cortos para reforzar el feedback sin molestar. Se
// sincroniza con el ajuste de Efectos (si el jugador silencia SFX, también la háptica).

let enabled = true;

/** Habilita/deshabilita la háptica (ligada al ajuste de Efectos). */
export function setHapticsEnabled(on) { enabled = !!on; }

function buzz(pattern) {
  if (!enabled) return;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch { /* no soportado o bloqueado: se ignora en silencio */ }
}

export const haptics = {
  coin()   { buzz(8); },                         // recoger moneda (toque mínimo)
  star()   { buzz(18); },                        // recoger estrella
  hit()    { buzz([0, 35, 45, 35]); },           // pérdida de vida / trampa
  win()    { buzz([0, 20, 30, 20]); },           // nivel superado
  triple() { buzz([0, 25, 40, 25, 40, 60]); },   // 3 estrellas (celebración)
};
