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
  // v0.24.9: respuesta de inclinación un punto más ágil (6.5 → 7.6) → el D-pad/joystick se
  // sienten más precisos y el control más directo, sin volverse brusco. SOLO afecta el
  // suavizado de input (InputController); la física integrada y la solvencia no cambian
  // (el validador y physics-smoke aplican MAX_TILT directo, sin este lerp).
  TILT_LERP: 7.6,       // suavizado del tablero hacia la inclinación objetivo (mayor = más directo)
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

// --- Control TÁCTIL por arrastre (control PRINCIPAL en móvil, v0.25.3) ---
// El jugador arrastra el dedo sobre el tablero para inclinarlo; al soltar vuelve al centro.
// Ver src/input/TouchTiltController.js. La inclinación máxima usa PHYS.MAX_TILT.
export const TOUCH_TILT = {
  SENSITIVITY: 1.0,   // multiplicador de sensibilidad del arrastre
  DEADZONE: 0.04,     // zona muerta normalizada (ignora microarrastres involuntarios)
  RETURN_SPEED: 8,    // retorno al centro al soltar (lerp = min(1, RETURN_SPEED*dt))
  SMOOTHING: 0.18,    // constante de tiempo del suavizado durante el arrastre (s)
  FULL_PX: 78,        // px de arrastre para alcanzar MAX_TILT (coherente con DRAG_FULL_PX_MOBILE)
};

// D-pad de flechas: OCULTO en móvil por defecto (el control principal es el arrastre táctil
// directo sobre el tablero). Ponlo a true SOLO para depurar (también se puede activar añadiendo
// la clase 'debug-dpad' al <body>).
export const DEBUG_SHOW_DPAD = false;

// --- Rendimiento (móvil) ---
// Instrumentación de rendimiento: SOLO desarrollo. A true, mide FPS/frame time/update/render y
// cuenta resize + pointermove, e imprime un resumen periódico por consola. NUNCA overlay visible
// ni activo en producción. Ver src/utils/perf.js.
export const DEBUG_PERFORMANCE = false;
// Techo del devicePixelRatio (compatibilidad): el perfil gráfico activo (abajo) manda de verdad.
export const MOBILE_PIXEL_RATIO_CAP = 1.5;
export const DESKTOP_PIXEL_RATIO_CAP = 2;

// --- PERFIL GRÁFICO (modo rendimiento móvil/Android) ---
// El juego va fluido en escritorio pero en Android WebView / emulador (GPU limitada) conviene bajar
// la carga GPU. Cada preset ajusta el coste SIN tocar jugabilidad, física ni niveles:
//   · pixelRatioCap : techo del devicePixelRatio (menos píxeles = mucho menos coste de relleno).
//   · shadows       : sombras dinámicas en tiempo real (mapa de sombras). Caras en móvil.
//   · heavyGlows    : halos/auras aditivos grandes (p. ej. el aura de la celebración).
//   · particleScale : factor sobre el nº de partículas (confeti/ráfagas).
//   · celebration3D : 'preload' (carga el GLB al montar el nivel) | 'onwin' (carga perezosa al ganar,
//                     sin bloquear gameplay; hasta que llegue, usa el dino procedural) | 'off'
//                     (siempre dino procedural — el más liviano; nunca carga GLB).
// El dispositivo elige el preset por defecto (ver device.js); se puede forzar con ?gfx=… o
// localStorage 'trexoroll.gfx' para comparar en QA. NO desactiva controles ni cambia la física.
export const GRAPHICS_PRESETS = {
  quality:     { pixelRatioCap: DESKTOP_PIXEL_RATIO_CAP, shadows: true,  heavyGlows: true,  particleScale: 1.0, celebration3D: 'preload' },
  balanced:    { pixelRatioCap: 1.25, shadows: false, heavyGlows: true,  particleScale: 0.6, celebration3D: 'onwin' },
  performance: { pixelRatioCap: 1.0,  shadows: false, heavyGlows: false, particleScale: 0.4, celebration3D: 'off' },
};
// Preset por defecto para Android/WebView (incl. emulador). 'performance' prioriza fluidez.
export const ANDROID_PERFORMANCE_PRESET = 'performance';
// Preset por defecto para otros dispositivos táctiles (móvil web / iOS).
export const DEFAULT_TOUCH_PRESET = 'balanced';
// Preset por defecto en escritorio (ratón, GPU dedicada).
export const DESKTOP_PRESET = 'quality';

// --- Personaje 3D «T-Rexo / Oliver» (asset oficial) ---
// GLB con texturas embebidas: master ~6,4 MB (animaciones Mixamo); fallback ~3,7 MB.
// Ruta en MINÚSCULAS (`trexo/`) → segura en servidores/Android WebView case-sensitive (antes
// `T-Rexo/` con mayúsculas fallaba en web/móvil). Rutas RELATIVAS al documento → dev/www/Capacitor.
export const TREXO_MODEL_PATH = 'assets/models/characters/trexo/trexo_master.glb';
export const TREXO_FALLBACK_MODEL_PATH = 'assets/models/characters/trexo/trexo_character.glb';

// --- Modelo 3D de CELEBRACIÓN de victoria: triceratops bebé amarillo ---
// GLB optimizado (~1,9 MB, texturas 512, estático → animación PROCEDURAL). Ruta RELATIVA.
export const TRIKE_CELEB_MODEL_PATH = 'assets/models/characters/triceratops_baby/triceratops_baby_yellow.glb';

// --- Modelo 3D de CELEBRACIÓN de victoria: raptor bebé verde (bola Raptor Verde) ---
// GLB optimizado (13,25 → ~1,6 MB: texturas 2048→512; geometría intacta, estático → animación
// PROCEDURAL). Original respaldado en raptor_baby/_backup/ (excluido del build). Ruta RELATIVA.
export const RAPTOR_BABY_MODEL_PATH = 'assets/models/characters/raptor_baby/raptor_baby_green.glb';

// --- Modelo 3D de CELEBRACIÓN de victoria: parasaurio bebé rosa (bola Dino Rosa) ---
// GLB optimizado (13,53 → ~1,7 MB: geometría simplificada 224k→~56k tris — de sobra al tamaño de
// celebración — + texturas 2048→512; estático → animación PROCEDURAL; salida GLB estándar sin
// Draco/meshopt). Original respaldado en parasaur_baby/_backup/ (excluido del build). Ruta RELATIVA.
export const PARASAUR_BABY_MODEL_PATH = 'assets/models/characters/parasaur_baby/parasaur_baby_pink.glb';

// --- Modelos 3D de CELEBRACIÓN por ESPECIE (mapa bola → dinosaurio que sale del hoyo al ganar) ---
// Cada bola hace emerger de la meta SU dinosaurio. Una especie con entrada aquí usa su GLB (cargado
// una vez y CACHEADO por especie); una especie SIN entrada usa el dino PROCEDURAL de
// `CelebrationDino.buildDino` (raptor, parasaurio, braquiosaurio). `height`/`yaw` afinan escala y
// orientación. `fallbackPath` (opcional) se prueba si `path` falla; si todo falla → procedural.
// IMPORTANTE: solo `triceratops` saca el triceratops; NO forzar un mismo dino para todas las bolas.
export const CELEBRATION_MODELS = {
  // yaw 0: el frente NATIVO de T-Rexo ya mira a +Z (hacia la cámara de celebración), como los dinos
  // procedurales; NO usar Math.PI (eso lo dejaría de espaldas — verificado en QA visual headless).
  trex:        { path: TREXO_MODEL_PATH, fallbackPath: TREXO_FALLBACK_MODEL_PATH, height: 2.2, yaw: 0 },
  // yaw Math.PI: el triceratops bebé tiene el frente nativo en -Z (afinado previamente).
  triceratops: { path: TRIKE_CELEB_MODEL_PATH, height: 2.2, yaw: Math.PI },
  // Raptor bebé verde (bola Raptor Verde). Sin fallbackPath → si el GLB falla, dino procedural.
  // yaw afinado por QA visual headless (igual que los anteriores).
  raptor:      { path: RAPTOR_BABY_MODEL_PATH, height: 2.2, yaw: 0 },
  // Parasaurio bebé rosa (bola Dino Rosa). Sin fallbackPath → si el GLB falla, dino procedural.
  parasaur:    { path: PARASAUR_BABY_MODEL_PATH, height: 2.2, yaw: 0 },
};
// PENDIENTE de modelo 3D (sigue con dino PROCEDURAL en la victoria):
//   · brachio (Bronto Azul) → ruta futura recomendada: assets/models/characters/brachio_baby/brachio_baby_blue.glb

// --- Portales (hoyos naranjas tipo teletransporte) ---
// Dos portales por nivel, enlazados: entrar en uno saca la bola por el otro.
// No matan ni ganan: la bola continúa. Tienen cooldown anti-loop y una salida
// controlada (ni disparo injusto ni quedarse pegada en la boca de salida).
export const PORTAL = {
  CAPTURE: 0.8,        // % del radio del portal dentro del cual la bola "entra" (mayor que un hoyo → captura fiable)
  COOLDOWN: 0.55,      // s tras teletransportar en los que se ignora la entrada (evita ping-pong infinito)
  EXIT_DAMP: 0.7,      // factor sobre la velocidad al salir (evita salir disparada injustamente)
  EXIT_MIN_SPEED: 3.2, // velocidad mínima de salida hacia fuera de la boca (garantiza que abandone el portal)
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
  AUTH: 'screen-auth',         // acceso/registro (simulado, sin backend real)
  LEGAL: 'screen-legal',       // política de privacidad / términos
  LANDING: 'screen-landing',
  MENU: 'screen-menu',
  BALLS: 'screen-balls',
  SHOP: 'screen-shop',
  SETTINGS: 'screen-settings',
  CREDITS: 'screen-credits',
  LEVELS: 'screen-levels',
  HOWTO: 'screen-howto',
  SKINS: 'screen-skins',       // colección de skins de bola
  CHEST: 'screen-chest',       // cofre jurásico
  DAILY: 'screen-daily',       // recompensa diaria
  PREP: 'screen-prep',
  GAME: 'screen-game',
  PAUSE: 'screen-pause',
  WIN: 'screen-win',
  GAMEOVER: 'screen-gameover',
  ADVIEW: 'screen-adview',     // vídeo recompensado (placeholder/simulación)
  LIFEPACKS: 'screen-lifepacks', // tienda de paquetes de vidas
};

export const STORAGE_KEY = 'trexoroll.save.v1';
