// constants.js — Configuración central de TREXoRoll.
// Un único lugar para tunear física, puntuación y reglas. Sin sobreingeniería.

export const GAME_NAME = 'TREXoRoll';
export const SUBTITLE = 'Inclina, rueda y conquista cada tablero.';

// --- Reglas de partida ---
export const LIVES_START = 3;

// --- Física del tablero inclinable (unidades del mundo, ~metros) ---
export const PHYS = {
  GRAVITY: 23,          // aceleración base de la gravedad proyectada en el plano
  MAX_TILT: 0.32,       // inclinación máxima del tablero en radianes (~18°)
  TILT_LERP: 6.5,       // suavizado del tablero hacia la inclinación objetivo (menor = más peso)
  DAMPING: 1.05,        // fricción de rodadura (mayor = la bola asienta antes; da sensación de peso)
  RESTITUTION: 0.45,    // rebote contra paredes/obstáculos (0..1; menor = más controlado)
  BALL_RADIUS: 0.5,
  MAX_SPEED: 20,        // límite de velocidad para evitar atravesar paredes
  SUBSTEP: 0.010,       // paso fijo de integración (s) para estabilidad
  CAPTURE_FACTOR: 0.66, // % del radio del hoyo dentro del cual la bola "cae"
  CAPTURE_PULL: 13,     // atracción suave hacia el centro del hoyo al entrar
  FALL_GRACE: 0.12,     // s de perdón que la bola puede teetear fuera del borde antes de caer
  // Sensibilidad del arrastre: píxeles para alcanzar la inclinación máxima.
  // Móvil más sensible (dedos, pantallas pequeñas) que ratón en desktop.
  DRAG_FULL_PX_DESKTOP: 110,
  DRAG_FULL_PX_MOBILE: 78,
};

// --- Puntuación ---
export const SCORE = {
  BASE_LEVEL: 1000,     // por completar un nivel
  LIFE_BONUS: 250,      // por vida restante al completar
  TIME_BONUS_PER_SEC: 8,// por segundo bajo el "par" del nivel
};

// --- Estados de la bola dentro de una partida ---
export const BALL_STATE = {
  ROLLING: 'rolling',
  SINKING_GOAL: 'sinking-goal',
  SINKING_TRAP: 'sinking-trap',
  FALLING: 'falling',
  DEAD: 'dead',
  WON: 'won',
};

// --- Pantallas de la app ---
export const SCREENS = {
  LANDING: 'screen-landing',
  MENU: 'screen-menu',
  BALLS: 'screen-balls',
  LEVELS: 'screen-levels',
  HOWTO: 'screen-howto',
  PREP: 'screen-prep',
  GAME: 'screen-game',
  PAUSE: 'screen-pause',
  WIN: 'screen-win',
  GAMEOVER: 'screen-gameover',
};

export const STORAGE_KEY = 'trexoroll.save.v1';
