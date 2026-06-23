// levelEvents.js — Configuración DETERMINISTA y PURA (testeable sin navegador) de los
// eventos especiales por número de nivel:
//   · Jefes / eventos especiales cada 10 niveles (10, 20, 30, 40, 50).
//   · Eventos climáticos (lluvia, niebla, viento, ceniza, tormenta, calor) en niveles dados.
//   · Modo contrarreloj cada 11 niveles (11, 22, 33, 44).
//
// IMPORTANTE: estos eventos NO cambian la geometría del nivel (huella/trampas/portales/
// meta), así no afectan a la solvencia validada por tools/level-validator.mjs. Son capas
// de ambiente (overlay), presión muy leve y/o reglas de tiempo. El balance es conservador.

// --- Jefes cada 10 niveles ---------------------------------------------------
// kind: identificador visual del jefe. weather: clima asociado. shake: intensidad de
// temblores periódicos (0 = ninguno). windPush: empuje lateral muy leve (solo 40/50).
const BOSSES = {
  10: { kind: 'caveman', weather: null,     shake: 0.00, windPush: 0,    nameKey: 'boss.10' },
  20: { kind: 'trex',    weather: null,     shake: 0.10, windPush: 0,    nameKey: 'boss.20' },
  30: { kind: 'volcano', weather: 'ash',    shake: 0.12, windPush: 0,    nameKey: 'boss.30' },
  40: { kind: 'storm',   weather: 'storm',  shake: 0.06, windPush: 0.9,  nameKey: 'boss.40' },
  50: { kind: 'finale',  weather: 'storm',  shake: 0.10, windPush: 0.7,  nameKey: 'boss.50' },
};

/** Devuelve la config de jefe para el nº de nivel (1-based) o null si no es nivel jefe. */
export function bossFor(levelNumber) {
  return BOSSES[levelNumber] || null;
}

export function isBossLevel(levelNumber) {
  return !!BOSSES[levelNumber];
}

// --- Clima por nivel ---------------------------------------------------------
// Distribución pedida por producto. Algunos climas son SOLO visuales; el viento aplica
// un empuje lateral muy leve (solo en niveles avanzados, ver windPushFor).
const WEATHER = {
  rain:  [6, 16, 26, 36, 46],
  fog:   [9, 19, 29, 39, 49],
  wind:  [14, 24, 34, 44],
  ash:   [20, 30, 40, 50],
  storm: [],   // las tormentas las marca el jefe (40, 50)
  heat:  [4, 19, 30],
};

// Índice inverso nivel → tipo de clima (el jefe puede sobreescribir).
const _weatherByLevel = (() => {
  const map = {};
  for (const [type, levels] of Object.entries(WEATHER)) {
    for (const n of levels) map[n] = type;
  }
  return map;
})();

/**
 * Tipo de clima del nivel (1-based) o null. El clima del jefe tiene prioridad.
 * @returns {('rain'|'fog'|'wind'|'ash'|'storm'|'heat'|null)}
 */
export function weatherFor(levelNumber) {
  const boss = BOSSES[levelNumber];
  if (boss && boss.weather) return boss.weather;
  return _weatherByLevel[levelNumber] || null;
}

/**
 * Empuje lateral del viento (unidades de aceleración del plano) para el nivel.
 * Solo en climas de viento/tormenta y SOLO desde el nivel 14 (avanzados), muy leve.
 * Devuelve 0 si no aplica.
 */
export function windPushFor(levelNumber) {
  const boss = BOSSES[levelNumber];
  if (boss && boss.windPush) return boss.windPush;
  const w = weatherFor(levelNumber);
  if (w === 'wind' && levelNumber >= 14) return 0.8; // empuje muy suave
  return 0;
}

// --- Modo contrarreloj cada 11 niveles ---------------------------------------
const TIME_ATTACK = {
  11: 22,
  22: 26,
  33: 30,
  44: 34,
  55: 38, // por si en el futuro hay nivel 55
};

/** Límite de tiempo (s) del nivel contrarreloj, o null si no es contrarreloj. */
export function timeAttackFor(levelNumber) {
  return TIME_ATTACK[levelNumber] || null;
}

export function isTimeAttackLevel(levelNumber) {
  return TIME_ATTACK[levelNumber] != null;
}

/** Resumen completo de eventos del nivel (para HUD/prep). */
export function eventsFor(levelNumber) {
  return {
    boss: bossFor(levelNumber),
    weather: weatherFor(levelNumber),
    windPush: windPushFor(levelNumber),
    timeAttack: timeAttackFor(levelNumber),
  };
}
