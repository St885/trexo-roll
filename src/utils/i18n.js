// i18n.js — Internacionalización (Español / Inglés). Por defecto español.
// El idioma se guarda en localStorage. Uso:
//   t('btn.play')                → cadena de UI (ES+EN en el diccionario)
//   t('lvl.1.name', lvl.name)    → contenido: EN del diccionario; ES = fallback (texto original)
//   applyTranslations()          → traduce todos los [data-i18n] del DOM

const KEY = 'trexoroll.lang.v1';
let _lang = 'es';
try {
  const s = localStorage.getItem(KEY);
  if (s === 'es' || s === 'en') _lang = s;
} catch (_) { /* sin persistencia */ }

const _listeners = [];

export function getLang() { return _lang; }

export function setLang(lang) {
  _lang = (lang === 'en') ? 'en' : 'es';
  try { localStorage.setItem(KEY, _lang); } catch (_) { /* noop */ }
  for (const fn of _listeners) { try { fn(_lang); } catch (_) { /* noop */ } }
}

/** Registra un callback que se ejecuta al cambiar de idioma. */
export function onLangChange(fn) { if (typeof fn === 'function') _listeners.push(fn); }

/**
 * Traduce una clave. Para CONTENIDO, pasa el texto español como `fallback`:
 * en EN devuelve la traducción del diccionario (o el fallback si falta); en ES
 * devuelve el fallback (texto original), evitando duplicar el español aquí.
 */
export function t(key, fallback) {
  const cur = STRINGS[_lang] || {};
  if (cur[key] != null) return cur[key];
  if (fallback != null) return fallback;
  if (STRINGS.es[key] != null) return STRINGS.es[key];
  return key;
}

/** Aplica las traducciones a todos los elementos marcados con data-i18n*. */
export function applyTranslations(root) {
  const r = root || (typeof document !== 'undefined' ? document : null);
  if (!r || !r.querySelectorAll) return;
  r.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  r.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  r.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
}

// ============================================================================
// Diccionario
// ============================================================================
export const STRINGS = {
  es: {
    // — Idioma / selector —
    'lang.label': 'Idioma',
    // — Comunes —
    'common.back': '← Volver',
    'common.menu': 'Menú',
    'common.best': 'Mejor',
    // — Landing —
    'landing.tag': 'Aventura jurásica',
    'landing.subtitle': 'Inclina el tablero, rueda tu dino y conquista 25 mundos prehistóricos.',
    'landing.enter': '▶ Entrar a la aventura',
    'landing.ctaHint': 'Apto para móvil · sin descargas',
    // — Menú —
    'menu.continue': '⏩ Continuar',
    'menu.play': '▶ Jugar',
    'menu.balls': '🦕 Elegir dino',
    'menu.shop': 'Canje',
    'menu.levels': '🗺️ Niveles',
    'menu.howto': '❓ Cómo jugar',
    'menu.fullscreen': '⛶ Pantalla completa',
    'menu.progress': 'Progreso',
    // — Selección de dino —
    'balls.title': 'Elige tu dino',
    'balls.subtitle': 'Cada bola es una especie distinta… ¡que sale a celebrar contigo al ganar!',
    // — Tienda de canje —
    'shop.title': '🛒 Tienda de Canje',
    'shop.subtitle': 'Cambia tus estrellas especiales por ayudas. Consíguelas cada 2 niveles.',
    'shop.owned': 'Tienes:',
    'shop.available': 'Disponibles:',
    'shop.boughtOk': (n) => `✅ ¡${n} comprado!`,
    'shop.notEnough': (c) => `❌ Te faltan estrellas (necesitas ⭐ ${c}).`,
    // — Niveles —
    'levels.title': 'Niveles',
    'levels.subtitle': '5 mundos · 25 tableros. Gana ⭐ para canjear ayudas.',
    'levels.worldStars': (e, m) => `⭐ ${e}/${m}`,
    // — Cómo jugar —
    'howto.title': 'Cómo jugar',
    'howto.1': '🎯 <strong>Objetivo:</strong> lleva la bola al <span class="goal-txt">hoyo verde</span>.',
    'howto.2': '⚠️ <strong>Evita:</strong> los <span class="trap-txt">hoyos rojos</span> y caer fuera del tablero.',
    'howto.3': '🖥️ <strong>Teclado:</strong> Flechas o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> para inclinar.',
    'howto.4': '📱 <strong>Móvil:</strong> usa el <strong>D-pad</strong> (izquierda) o el <strong>joystick</strong> (derecha). Mantén pulsada una dirección para inclinar; pulsa dos para diagonal.',
    'howto.5': '🖱️ <strong>Ratón:</strong> arrastra sobre el tablero para inclinar.',
    'howto.6': '⏸️ <strong>Pausa:</strong> botón ⏸ o tecla <kbd>P</kbd> / <kbd>Esc</kbd>.',
    'howto.7': '🦕 <strong>Bola:</strong> elige entre 5 dinos; el tuyo celebra al ganar.',
    'howto.8': '🪙 <strong>Monedas:</strong> rueda cerca para recogerlas y sumar puntos extra.',
    'howto.9': '⭐ <strong>Estrella especial</strong> (cada 2 niveles): súmala y cánjeala por ayudas en la <strong>🛒 Tienda de Canje</strong>.',
    'howto.10': '⭐ Gana <strong>3 estrellas</strong> de nivel: sin perder vidas y bajo el tiempo objetivo.',
    'howto.11': '🥚 Tienes <strong>3 vidas</strong>. Completa los <strong>25 tableros</strong> para ganar.',
    // — Preparación —
    'prep.yourBall': 'Tu bola:',
    'prep.change': 'Cambiar',
    'prep.warn': '⚠️ Evita los hoyos trampa y no caigas del tablero.',
    'prep.useHelp': 'Usar ayuda:',
    'prep.start': 'Iniciar nivel',
    'prep.backMenu': '← Menú',
    'prep.world': (n, name) => `Mundo ${n} · ${name}`,
    'prep.levelN': (n, name) => `Nivel ${n}: ${name}`,
    'prep.rewards': (coins, star) => `🪙 ${coins} monedas${star ? '   ·   ⭐ ¡Estrella especial aquí!' : ''}`,
    'prep.ballName': (label, dino) => `${label} · ${dino}`,
    'prep.trapBlock': (n) => `🪨 Bloqueo (${n})`,
    'prep.shield': (n) => `🦅 Escudo (${n})`,
    // — HUD —
    'hud.level': 'Nivel',
    'hud.points': 'Puntos',
    'hud.hintTouch': '🎮 D-pad (izquierda) o joystick (derecha) para inclinar el tablero',
    'hud.hintDesktop': 'Inclina: flechas/WASD o arrastra el tablero con el ratón',
    // — Sonido —
    'sound.on': '🔊 Sonido: ON',
    'sound.off': '🔇 Sonido: OFF',
    // — Pausa —
    'pause.title': '⏸ Pausa',
    'pause.resume': '▶ Continuar',
    'pause.restart': '↻ Reiniciar nivel',
    'pause.shop': '🛒 Canje',
    'pause.powers': (p) => `Poderes activos: ${p}`,
    'pause.levelN': (n, name) => `Nivel ${n} · ${name}`,
    // — Toasts / mensajes de juego —
    'msg.levelDone': '¡Nivel completado!',
    'msg.trapBlocked': '🪨 Trampa bloqueada',
    'msg.shieldOn': '🦅 Escudo de caída activo',
    'msg.rescue': '🦅 ¡Rescate jurásico! El escudo te salvó',
    'msg.starGet': '⭐ ¡Estrella de canje! +1 (para la tienda)',
    'msg.extraLife': '🥚 ¡Vida extra! Sigues en juego',
    'msg.fell': (n) => `¡Caíste! Intentos: ${n}`,
    'msg.trap': (n) => `¡Trampa! Intentos: ${n}`,
    'menu.shopBtn': (n) => `🛒 Canje · ⭐ ${n}`,
    'menu.progressLabel': (s, m, u, total) => `⭐ ${s}/${m}  ·  Nivel ${u}/${total} desbloqueado`,
    'best.label': (hs, s, m) => `Mejor: ${hs}  ·  ⭐ ${s}/${m}`,
    // — Victoria —
    'win.titleDone': '🏆 ¡Juego completado!',
    'win.titleWin': '¡Nivel superado!',
    'win.record': '🏅 ¡Nuevo récord!',
    'win.next': 'Siguiente nivel ▶',
    'win.retry': '↻ Repetir nivel',
    'win.detail': (base, life, time) => `+${base} nivel  ·  +${life} vidas  ·  +${time} tiempo`,
    'win.rewards': (coins, starTxt) => `Recogido: 🪙 ${coins}${starTxt}`,
    'win.rewardStar': '   ·   ⭐ estrella de canje',
    'win.rewardStarLost': '   ·   ⭐ estrella perdida',
    'win.time': (t, b) => `Tiempo: ${t}s  ·  Mejor: ${b}s`,
    'win.progress': (n, total, s, m) => `Progreso: ${n}/${total}  ·  ⭐ ${s}/${m}`,
    'win.unlock': (n) => `🔓 ¡Nivel ${n} desbloqueado!`,
    'win.score': (s) => `Puntos: ${s}`,
    // — Sin vidas / monetización —
    'over.title': '¡Sin vidas!',
    'over.motivate': '¡Estuviste cerca! Sigue y conquista el tablero.',
    'over.reviveTitle': '¿Seguir jugando?',
    'over.video': '📺 Ver vídeo · +3 vidas',
    'over.buyLives': '🛒 Comprar vidas',
    'over.retry': '↻ Reintentar (3 vidas)',
    'over.continueBank': (n) => `⏩ Continuar · banco: ${n}`,
    'over.score': (s) => `Puntos: ${s}`,
    'over.levelReached': (n, total) => `Nivel alcanzado: ${n}/${total}`,
    'over.high': (hs) => `Mejor: ${hs}`,
    // — Vídeo recompensado —
    'ad.tag': 'Simulación interna · sin anuncios reales',
    'ad.title': '📺 Vídeo recompensado',
    'ad.cancel': 'Saltar (sin recompensa)',
    'ad.countdown': (n) => `Recompensa en ${n}…`,
    'ad.reward': (n) => `🎁 ¡+${n} vidas!`,
    // — Packs de vidas —
    'packs.title': '🛒 Paquetes de vidas',
    'packs.subtitle': 'Compra <strong>simulada</strong> (MVP) — aún sin pago real.',
    'packs.bank': (n) => `Banco de vidas: ${n}`,
    'packs.continue': '⏩ Continuar con el banco',
    'packs.lives': (n) => `${n} vidas`,
    'packs.forBank': 'para tu banco',
    'packs.tagPopular': 'Popular',
    'packs.tagBest': 'Mejor valor',
    'packs.bought': (n) => `✅ +${n} vidas a tu banco (simulado)`,
    // — Tiers —
    'tier.Fácil': 'Fácil', 'tier.Media': 'Media', 'tier.Difícil': 'Difícil', 'tier.Experto': 'Experto',
  },

  en: {
    'lang.label': 'Language',
    'common.back': '← Back',
    'common.menu': 'Menu',
    'common.best': 'Best',
    'landing.tag': 'Jurassic adventure',
    'landing.subtitle': 'Tilt the board, roll your dino and conquer 25 prehistoric worlds.',
    'landing.enter': '▶ Enter the adventure',
    'landing.ctaHint': 'Mobile-ready · no downloads',
    'menu.continue': '⏩ Continue',
    'menu.play': '▶ Play',
    'menu.balls': '🦕 Choose dino',
    'menu.shop': 'Shop',
    'menu.levels': '🗺️ Levels',
    'menu.howto': '❓ How to play',
    'menu.fullscreen': '⛶ Fullscreen',
    'menu.progress': 'Progress',
    'balls.title': 'Choose your dino',
    'balls.subtitle': 'Each ball is a different species… and comes out to celebrate with you when you win!',
    'shop.title': '🛒 Exchange Shop',
    'shop.subtitle': 'Trade your special stars for help items. Earn them every 2 levels.',
    'shop.owned': 'You have:',
    'shop.available': 'Available:',
    'shop.boughtOk': (n) => `✅ ${n} purchased!`,
    'shop.notEnough': (c) => `❌ Not enough stars (you need ⭐ ${c}).`,
    'levels.title': 'Levels',
    'levels.subtitle': '5 worlds · 25 boards. Earn ⭐ to redeem help items.',
    'levels.worldStars': (e, m) => `⭐ ${e}/${m}`,
    'howto.title': 'How to play',
    'howto.1': '🎯 <strong>Goal:</strong> take the ball to the <span class="goal-txt">green hole</span>.',
    'howto.2': '⚠️ <strong>Avoid:</strong> the <span class="trap-txt">red holes</span> and falling off the board.',
    'howto.3': '🖥️ <strong>Keyboard:</strong> Arrows or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to tilt.',
    'howto.4': '📱 <strong>Mobile:</strong> use the <strong>D-pad</strong> (left) or the <strong>joystick</strong> (right). Hold a direction to tilt; press two for diagonal.',
    'howto.5': '🖱️ <strong>Mouse:</strong> drag over the board to tilt.',
    'howto.6': '⏸️ <strong>Pause:</strong> the ⏸ button or <kbd>P</kbd> / <kbd>Esc</kbd>.',
    'howto.7': '🦕 <strong>Ball:</strong> pick from 5 dinos; yours celebrates when you win.',
    'howto.8': '🪙 <strong>Coins:</strong> roll close to collect them for extra points.',
    'howto.9': '⭐ <strong>Special star</strong> (every 2 levels): collect it and redeem help in the <strong>🛒 Exchange Shop</strong>.',
    'howto.10': '⭐ Earn <strong>3 level stars</strong>: without losing lives and under the target time.',
    'howto.11': '🥚 You have <strong>3 lives</strong>. Complete the <strong>25 boards</strong> to win.',
    'prep.yourBall': 'Your ball:',
    'prep.change': 'Change',
    'prep.warn': '⚠️ Avoid the trap holes and don’t fall off the board.',
    'prep.useHelp': 'Use help:',
    'prep.start': 'Start level',
    'prep.backMenu': '← Menu',
    'prep.world': (n, name) => `World ${n} · ${name}`,
    'prep.levelN': (n, name) => `Level ${n}: ${name}`,
    'prep.rewards': (coins, star) => `🪙 ${coins} coins${star ? '   ·   ⭐ Special star here!' : ''}`,
    'prep.ballName': (label, dino) => `${label} · ${dino}`,
    'prep.trapBlock': (n) => `🪨 Block (${n})`,
    'prep.shield': (n) => `🦅 Shield (${n})`,
    'hud.level': 'Level',
    'hud.points': 'Points',
    'hud.hintTouch': '🎮 D-pad (left) or joystick (right) to tilt the board',
    'hud.hintDesktop': 'Tilt: arrows/WASD or drag the board with the mouse',
    'sound.on': '🔊 Sound: ON',
    'sound.off': '🔇 Sound: OFF',
    'pause.title': '⏸ Pause',
    'pause.resume': '▶ Resume',
    'pause.restart': '↻ Restart level',
    'pause.shop': '🛒 Shop',
    'pause.powers': (p) => `Active powers: ${p}`,
    'pause.levelN': (n, name) => `Level ${n} · ${name}`,
    'msg.levelDone': 'Level complete!',
    'msg.trapBlocked': '🪨 Trap blocked',
    'msg.shieldOn': '🦅 Fall shield active',
    'msg.rescue': '🦅 Jurassic rescue! The shield saved you',
    'msg.starGet': '⭐ Exchange star! +1 (for the shop)',
    'msg.extraLife': '🥚 Extra life! You’re still in',
    'msg.fell': (n) => `You fell! Tries: ${n}`,
    'msg.trap': (n) => `Trap! Tries: ${n}`,
    'menu.shopBtn': (n) => `🛒 Shop · ⭐ ${n}`,
    'menu.progressLabel': (s, m, u, total) => `⭐ ${s}/${m}  ·  Level ${u}/${total} unlocked`,
    'best.label': (hs, s, m) => `Best: ${hs}  ·  ⭐ ${s}/${m}`,
    'win.titleDone': '🏆 Game complete!',
    'win.titleWin': 'Level cleared!',
    'win.record': '🏅 New record!',
    'win.next': 'Next level ▶',
    'win.retry': '↻ Replay level',
    'win.detail': (base, life, time) => `+${base} level  ·  +${life} lives  ·  +${time} time`,
    'win.rewards': (coins, starTxt) => `Collected: 🪙 ${coins}${starTxt}`,
    'win.rewardStar': '   ·   ⭐ exchange star',
    'win.rewardStarLost': '   ·   ⭐ star missed',
    'win.time': (t, b) => `Time: ${t}s  ·  Best: ${b}s`,
    'win.progress': (n, total, s, m) => `Progress: ${n}/${total}  ·  ⭐ ${s}/${m}`,
    'win.unlock': (n) => `🔓 Level ${n} unlocked!`,
    'win.score': (s) => `Points: ${s}`,
    'over.title': 'Out of lives!',
    'over.motivate': 'So close! Keep going and conquer the board.',
    'over.reviveTitle': 'Keep playing?',
    'over.video': '📺 Watch video · +3 lives',
    'over.buyLives': '🛒 Buy lives',
    'over.retry': '↻ Retry (3 lives)',
    'over.continueBank': (n) => `⏩ Continue · bank: ${n}`,
    'over.score': (s) => `Points: ${s}`,
    'over.levelReached': (n, total) => `Level reached: ${n}/${total}`,
    'over.high': (hs) => `Best: ${hs}`,
    'ad.tag': 'Internal simulation · no real ads',
    'ad.title': '📺 Rewarded video',
    'ad.cancel': 'Skip (no reward)',
    'ad.countdown': (n) => `Reward in ${n}…`,
    'ad.reward': (n) => `🎁 +${n} lives!`,
    'packs.title': '🛒 Life packs',
    'packs.subtitle': '<strong>Simulated</strong> purchase (MVP) — no real payment yet.',
    'packs.bank': (n) => `Life bank: ${n}`,
    'packs.continue': '⏩ Continue with the bank',
    'packs.lives': (n) => `${n} lives`,
    'packs.forBank': 'for your bank',
    'packs.tagPopular': 'Popular',
    'packs.tagBest': 'Best value',
    'packs.bought': (n) => `✅ +${n} lives to your bank (simulated)`,
    'tier.Fácil': 'Easy', 'tier.Media': 'Medium', 'tier.Difícil': 'Hard', 'tier.Experto': 'Expert',

    // — Contenido: niveles (nombre + pista) —
    'lvl.1.name': 'Starting Valley', 'lvl.1.hint': 'Take the ball to the green hole across the valley.',
    'lvl.2.name': 'Long Path', 'lvl.2.hint': 'A long corridor with a trap in the middle. Control your speed.',
    'lvl.3.name': 'Triangular Crest', 'lvl.3.hint': 'Triangular board with no edges: precision or fall. Aim for the vertex.',
    'lvl.4.name': 'Circular Crater', 'lvl.4.hint': 'Go around the crater’s central trap. The rim is treacherous.',
    'lvl.5.name': 'Jurassic Maze', 'lvl.5.hint': 'Cross the maze dodging the traps to the goal.',
    'lvl.6.name': 'Double Bend', 'lvl.6.hint': 'L-shaped board: advance and turn the corner toward the goal.',
    'lvl.7.name': 'Hanging Bridge', 'lvl.7.hint': 'Cross the narrow bridge without falling into the void.',
    'lvl.8.name': 'Jurassic Crossing', 'lvl.8.hint': 'Cross shape: go from the left arm to the top arm.',
    'lvl.9.name': 'Serpent', 'lvl.9.hint': 'Winding corridor: cross each gap in zig-zag.',
    'lvl.10.name': 'Double Pit', 'lvl.10.hint': 'Two large pits: weave your way through the safe lanes.',
    'lvl.11.name': 'Ring', 'lvl.11.hint': 'Skirt the ring’s huge central trap.',
    'lvl.12.name': 'Diamond', 'lvl.12.hint': 'Edgeless rhombus: weave between the aligned traps.',
    'lvl.13.name': 'Funnel', 'lvl.13.hint': 'From wide to narrow: line up the neck toward the goal.',
    'lvl.14.name': 'Maze II', 'lvl.14.hint': 'A three-section winding maze. Patience and precision.',
    'lvl.15.name': 'Final Peak', 'lvl.15.hint': 'Narrow chambers and traps everywhere.',
    'lvl.16.name': 'Valley of Footprints', 'lvl.16.hint': 'Follow the path dodging the footprint-traps in zig-zag.',
    'lvl.17.name': 'Raptor Swamp', 'lvl.17.hint': 'Mud everywhere: advance along the firm lanes.',
    'lvl.18.name': 'Bone Canyon', 'lvl.18.hint': 'Narrow canyon: slalom between the rock outcrops.',
    'lvl.19.name': 'Volcanic Dome', 'lvl.19.hint': 'Burning crater: skirt the central magma and its vents.',
    'lvl.20.name': 'Triceratops Trail', 'lvl.20.hint': 'Three winding sections with traps at every bend.',
    'lvl.21.name': 'Golden Egg Island', 'lvl.21.hint': 'Islands linked by bridges: cross the center to the north meadow.',
    'lvl.22.name': 'Carnotaurus Maze', 'lvl.22.hint': 'A wide four-section maze. Don’t rush.',
    'lvl.23.name': 'Lost Fossils', 'lvl.23.hint': 'Edgeless hexagonal plateau: precision among the fossils.',
    'lvl.24.name': 'T-Rex Ruins', 'lvl.24.hint': 'Forest of columns: weave between the ruins to the goal.',
    'lvl.25.name': 'Grand Jurassic Finale', 'lvl.25.hint': 'The ultimate challenge: a burning winding maze to the summit.',

    // — Contenido: mundos —
    'world.0': 'Jurassic Valley', 'world.1': 'Raptor Swamp', 'world.2': 'Volcanic Crater',
    'world.3': 'Fossil Ruins', 'world.4': 'TREXo Island',

    // — Contenido: bolas (label / color / personalidad) —
    'ball.blanca.label': 'White Rex', 'ball.blanca.name': 'White', 'ball.blanca.blurb': 'The classic. Balanced and reliable.',
    'ball.verde.label': 'Green Raptor', 'ball.verde.name': 'Green', 'ball.verde.blurb': 'Agile and fast. For the quick.',
    'ball.rosada.label': 'Pink Dino', 'ball.rosada.name': 'Pink', 'ball.rosada.blurb': 'Stylish. Rolls with elegance.',
    'ball.amarilla.label': 'Yellow Tricera', 'ball.amarilla.name': 'Yellow', 'ball.amarilla.blurb': 'Firm and tough as a horn.',
    'ball.azul.label': 'Blue Bronto', 'ball.azul.name': 'Blue', 'ball.azul.blurb': 'Calm and serene. Heavy roll.',

    // — Contenido: especies de dino —
    'dino.trex': 'T-Rex', 'dino.raptor': 'Velociraptor', 'dino.parasaur': 'Parasaur',
    'dino.triceratops': 'Triceratops', 'dino.brachio': 'Brachiosaurus',

    // — Contenido: tienda —
    'pwr.extraLives.name': 'Extra life', 'pwr.extraLives.desc': 'If you reach 0 lives, you recover 1 automatically.',
    'pwr.trapBlocks.name': 'Trap block', 'pwr.trapBlocks.desc': 'Covers the first dangerous trap in the level.',
    'pwr.fallShields.name': 'Fall shield', 'pwr.fallShields.desc': 'A pterosaur rescues you if you fall off the board.',
  },
};

/** Texto traducible que puede ser cadena o función con argumentos. */
export function tf(key, ...args) {
  const v = t(key);
  return typeof v === 'function' ? v(...args) : v;
}
