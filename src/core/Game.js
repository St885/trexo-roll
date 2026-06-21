// Game.js — Orquestador central de TREXoRoll.
// Conecta escena 3D, física, input, pantallas, HUD, audio, bolas y progresión.

import { SceneManager } from '../scene/SceneManager.js';
import { Ball } from '../scene/Ball.js';
import { BallPhysics } from '../physics/BallPhysics.js';
import { InputController } from './InputController.js';
import { ScreenManager } from './ScreenManager.js';
import { LEVELS, getLevel } from '../levels/levels.js';
import { generateCollectibles, COIN_POINTS, PICKUP_RADIUS } from '../levels/collectibles.js';
import { BALLS, getBall } from '../data/balls.js';
import { getDino } from '../data/dinos.js';
import { SCREENS, LIVES_START, SCORE } from '../utils/constants.js';
import * as hud from '../ui/hud.js';
import { sfx } from '../effects/sfx.js';
import { music } from '../effects/music.js';
import { showTaunt } from '../effects/tauntMonkey.js';
import * as critters from '../effects/critters.js';
import { t, tf, getLang, setLang, applyTranslations, onLangChange } from '../utils/i18n.js';
import { makeBallThumbnail } from '../scene/textures.js';
import {
  getHighScore, setHighScore, getUnlocked, unlockLevel,
  getStars, setStars, getTotalStars, getBestTime, setBestTime,
  getSelectedBall, setSelectedBall, setLastLevel, getLastLevel,
  getStarTokens, addStarTokens, getInventory, buyPowerup, consumePowerup,
  getLivesBank, addLivesBank, takeFromLivesBank,
  getSettings, setSetting, resetProgress,
} from '../utils/storage.js';

// Paquetes de vidas (monetización conceptual; precios de muestra, compra SIMULADA).
const LIFE_PACKS = [
  { lives: 5,  price: '0,99 €', tag: '' },
  { lives: 15, price: '1,99 €', tag: 'Popular' },
  { lives: 50, price: '3,99 €', tag: 'Mejor valor' },
];
const REVIVE_LIVES = 3; // vidas que da el vídeo recompensado / un "continuar"

// Catálogo de la Tienda de Canje (clave de inventario → datos de la recompensa).
const SHOP = [
  { key: 'extraLives',  name: 'Vida extra',        icon: '🥚', cost: 2, desc: 'Si llegas a 0 vidas, recuperas 1 automáticamente.' },
  { key: 'trapBlocks',  name: 'Bloqueo de trampa', icon: '🪨', cost: 3, desc: 'Tapa la primera trampa peligrosa del nivel.' },
  { key: 'fallShields', name: 'Escudo de caída',   icon: '🦅', cost: 4, desc: 'Un pterosaurio te rescata si caes del tablero.' },
];

// Mundos: agrupan los 50 niveles en 10 bloques de 5 (progresión visual).
const WORLDS = [
  { name: 'Valle Jurásico',       emoji: '🌿' },
  { name: 'Pantano Raptor',       emoji: '🐊' },
  { name: 'Cráter Volcánico',     emoji: '🌋' },
  { name: 'Ruinas Fósiles',       emoji: '🦴' },
  { name: 'Isla TREXo',           emoji: '🏝️' },
  { name: 'Cañón del Pterodáctilo', emoji: '🦅' },
  { name: 'Selva Perdida',        emoji: '🌴' },
  { name: 'Cavernas de Ámbar',    emoji: '💎' },
  { name: 'Pantano de Sombras',   emoji: '🌑' },
  { name: 'Corona del T-Rex',     emoji: '👑' },
];
const worldOf = (index) => WORLDS[Math.min(WORLDS.length - 1, Math.floor(index / 5))];
const worldIdx = (index) => Math.min(WORLDS.length - 1, Math.floor(index / 5));
const worldNum = (index) => Math.min(WORLDS.length, Math.floor(index / 5) + 1);

// Accesores de contenido traducible: en EN usan el diccionario; en ES caen al texto
// original (de los datos) para no duplicar el español.
const tLevelName = (lvl) => t('lvl.' + lvl.id + '.name', lvl.name);
const tLevelHint = (lvl) => t('lvl.' + lvl.id + '.hint', lvl.hint);
const tTier = (tier) => t('tier.' + tier, tier);
const tWorldName = (i) => t('world.' + i, WORLDS[i].name);
const tBallLabel = (def) => t('ball.' + def.id + '.label', def.label || def.name);
const tBallColor = (def) => t('ball.' + def.id + '.name', def.name);
const tBallBlurb = (def) => t('ball.' + def.id + '.blurb', def.blurb);
const tDinoName = (species) => t('dino.' + species, getDino(species).name);
const tShopName = (item) => t('pwr.' + item.key + '.name', item.name);
const tShopDesc = (item) => t('pwr.' + item.key + '.desc', item.desc);

const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const starString = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
const MAX_STARS = LEVELS.length * 3;
const CELEBRATION_DUR = 1.7;

export class Game {
  constructor(container) {
    this.container = container;
    this.scene = new SceneManager(container);
    this.selectedBall = getSelectedBall();
    this.ball = new Ball(getBall(this.selectedBall));
    this.physics = new BallPhysics();
    this.input = new InputController(
      this.scene.renderer.domElement,
      document.getElementById('joystick'),
      document.getElementById('joystick-knob'),
      document.getElementById('dpad'),
    );
    this.screens = new ScreenManager();
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    document.body.classList.toggle('is-touch', this.isTouch);
    this._applyViewportProfile(); // clases de body + encuadre de cámara por dispositivo

    this.levelIndex = 0;
    this.lives = LIVES_START;
    this.score = 0;
    this.playing = false;
    this.paused = false;
    this.ballState = 'rolling';
    this._anim = null;
    this._celebT = 0;
    this._levelStart = 0;
    this._pausedAccum = 0;
    this._pauseStart = 0;
    this._livesAtLevelStart = LIVES_START;
    this._last = performance.now();
    // Ajustes de audio (separados, persistidos). La música arranca en el menú (gesto).
    const settings = getSettings();
    this.sfxOn = settings.sfxOn;
    this.musicOn = settings.musicOn;
    sfx.setMuted(!this.sfxOn);

    // Recompensas dentro del nivel + potenciadores activados en preparación.
    this._collect = [];            // [{x,z,type,taken}] alineado con la escena
    this._coinsThisLevel = 0;
    this._triceratopsPlayed = false; // evento de la familia Triceratops (1 vez por nivel)
    this._fallShieldActive = false; // escudo armado para el nivel en curso
    this._pendingTrapBlock = false; // activar bloqueo de trampa al empezar
    this._pendingFallShield = false;// armar escudo de caída al empezar

    this._wireUI();
    // Al cambiar de idioma: traducir el DOM estático y refrescar lo dinámico.
    onLangChange(() => this._onLangChanged());
    const relayout = () => { this._applyViewportProfile(); this.scene.resize(); this.input.refresh(); };
    window.addEventListener('resize', relayout);
    // Al rotar el móvil el layout tarda un instante en estabilizarse.
    window.addEventListener('orientationchange', () => setTimeout(relayout, 200));
    // Barra del navegador móvil apareciendo/desapareciendo: reencuadra al cambiar el
    // viewport visible (sin spamear: la propia llamada es barata e idempotente).
    if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.playing) { e.preventDefault(); this._togglePause(); }
      }
    });
    this._loop = this._loop.bind(this);
  }

  // --- Responsive: perfil de viewport (clases en body + encuadre de cámara) -----

  /** ¿Pantalla de teléfono pequeño? (lado corto ≤ 380 css px). */
  isSmallPhone() { return Math.min(window.innerWidth, window.innerHeight) <= 380; }
  /** ¿Teléfono alto/estrecho (vertical muy alargado)? */
  isTallPhone() { return window.innerHeight / Math.max(1, window.innerWidth) >= 1.9; }
  /** ¿Móvil en horizontal (táctil + ancho > alto)? */
  isLandscapeMobile() { return this.isTouch && window.innerWidth > window.innerHeight; }

  /** Devuelve un perfil legible del viewport actual. */
  getViewportProfile() {
    const w = window.innerWidth, h = window.innerHeight;
    return {
      width: w, height: h,
      landscape: w > h,
      smallPhone: this.isSmallPhone(),
      tallPhone: this.isTallPhone(),
      landscapeMobile: this.isLandscapeMobile(),
      short: h <= 480,
    };
  }

  /** Aplica clases al <body> y pasa el perfil de encuadre a la escena. Idempotente. */
  _applyViewportProfile() {
    const p = this.getViewportProfile();
    const b = document.body.classList;
    b.toggle('is-portrait', !p.landscape);
    b.toggle('is-landscape', p.landscape);
    b.toggle('is-small-phone', p.smallPhone);
    b.toggle('is-tall-phone', p.tallPhone);
    b.toggle('is-landscape-mobile', p.landscapeMobile);
    b.toggle('is-short', p.short);
    // Encuadre de cámara: tablero más grande en teléfonos pequeños verticales;
    // aprovechar ancho en móvil horizontal.
    if (this.scene && this.scene.setViewportFit) {
      this.scene.setViewportFit({
        smallPortrait: p.smallPhone && !p.landscape,
        landscapeMobile: p.landscapeMobile,
      });
    }
  }

  start() {
    applyTranslations();        // traduce el DOM al idioma guardado (ES por defecto)
    this._syncLangButtons();
    this._syncAudioLabels();
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this.screens.show(SCREENS.LANDING);
    requestAnimationFrame(this._loop);
  }

  /** Tras cambiar de idioma: re-traduce estáticos y refresca textos dinámicos. */
  _onLangChanged() {
    applyTranslations();
    this._syncLangButtons();
    this._syncAudioLabels();
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this._updateMenuProgress();
    if (this.screens.isActive(SCREENS.BALLS)) this._renderBallCards();
    if (this.screens.isActive(SCREENS.LEVELS)) this._renderLevelCards();
    if (this.screens.isActive(SCREENS.SHOP)) this._renderShop();
    if (this.screens.isActive(SCREENS.LIFEPACKS)) this._renderLifePacks();
    if (this.screens.isActive(SCREENS.PREP)) this._showPrep();
  }

  _syncLangButtons() {
    const cur = getLang();
    for (const id of ['btn-lang-es', 'btn-lang-en']) {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', el.dataset.lang === cur);
    }
  }

  _syncAudioLabels() {
    // Botón maestro en Pausa: refleja si TODO el audio está silenciado.
    const allOff = !this.sfxOn && !this.musicOn;
    const master = document.getElementById('btn-pause-sound');
    if (master) master.textContent = allOff ? t('sound.off') : t('sound.on');
    // Toggles granulares en Ajustes.
    const m = document.getElementById('btn-set-music');
    if (m) m.textContent = tf('set.music', this.musicOn);
    const s = document.getElementById('btn-set-sfx');
    if (s) s.textContent = tf('set.sfx', this.sfxOn);
  }

  // --- Cableado de la interfaz ---------------------------------------------
  _wireUI() {
    const click = (id, fn) => this.screens.onClick(id, () => { sfx.click(); fn(); });

    click('btn-enter', () => this._showMenu());
    click('btn-lang-es', () => setLang('es'));
    click('btn-lang-en', () => setLang('en'));
    click('btn-continue', () => this._continueRun());
    click('btn-play', () => this._newRun());
    click('btn-balls', () => this._showBalls());
    click('btn-balls-back', () => this._showMenu());
    click('btn-shop', () => this._showShop());
    click('btn-shop-back', () => this._showMenu());
    click('btn-levels', () => this._showLevels());
    click('btn-howto', () => this.screens.show(SCREENS.HOWTO));
    click('btn-settings', () => this._showSettings());
    click('btn-fullscreen', () => this._toggleFullscreen());

    // Ajustes y créditos
    click('btn-set-music', () => this._toggleMusic());
    click('btn-set-sfx', () => this._toggleSfx());
    click('btn-set-reset', () => this._askResetProgress());
    click('btn-reset-yes', () => this._confirmResetProgress());
    click('btn-reset-no', () => this._cancelResetProgress());
    click('btn-set-credits', () => this._showCredits());
    click('btn-settings-back', () => this._showMenu());
    click('btn-credits-back', () => this._showSettings());

    click('btn-prep-start', () => this._startLevel());
    click('btn-prep-ball', () => this._cyclePrepBall());
    click('btn-prep-trapblock', () => this._togglePrepPower('trap'));
    click('btn-prep-shield', () => this._togglePrepPower('shield'));
    click('btn-prep-back', () => this._showMenu());
    click('btn-howto-back', () => this._showMenu());
    click('btn-levels-back', () => this._showMenu());

    click('btn-pause', () => this._pause());
    click('btn-resume', () => this._resume());
    click('btn-restart', () => this._restartLevel());
    click('btn-pause-sound', () => this._toggleMasterSound());
    click('btn-pause-shop', () => this._quitToShop());
    click('btn-pause-menu', () => this._quitToMenu());

    click('btn-win-next', () => this._onWinNext());
    click('btn-win-retry', () => this._showPrep());
    click('btn-win-menu', () => this._quitToMenu());
    click('btn-over-video', () => this._watchAd());
    click('btn-over-buylives', () => this._showLifePacks());
    click('btn-over-continue', () => this._continueFromBank());
    click('btn-over-retry', () => this._onRetry());
    click('btn-over-menu', () => this._quitToMenu());
    click('btn-ad-cancel', () => this._cancelAd());
    click('btn-lifepacks-back', () => this._noLives());
    click('btn-lifepacks-continue', () => this._continueFromBank());
  }

  _showMenu() {
    this.playing = false;
    this.paused = false;
    this.input.disable();
    this.scene.clearBoard();
    critters.clear();
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this._updateMenuProgress();
    // Llegamos aquí tras pulsar "Entrar" (gesto del usuario): podemos arrancar la
    // música de fondo respetando las restricciones de autoplay del navegador.
    this._applyAudio();
    this.screens.show(SCREENS.MENU);
  }

  /** Barra de progreso + botón "Continuar" en el menú (solo si hay progreso). */
  _updateMenuProgress() {
    const unlocked = Math.min(getUnlocked(), LEVELS.length);
    const total = getTotalStars();
    const pct = Math.round((total / MAX_STARS) * 100);
    const fill = document.getElementById('menu-progress-fill');
    if (fill) fill.style.width = pct + '%';
    setText('menu-progress-label', tf('menu.progressLabel', total, MAX_STARS, unlocked, LEVELS.length));
    const hasProgress = unlocked > 1 || getLastLevel() > 1 || total > 0;
    const cont = document.getElementById('btn-continue');
    if (cont) cont.style.display = hasProgress ? 'block' : 'none';
    const shopBtn = document.getElementById('btn-shop');
    if (shopBtn) shopBtn.textContent = tf('menu.shopBtn', getStarTokens());
  }

  /** "Continuar": empieza en el último nivel jugado (o el más avanzado desbloqueado). */
  _continueRun() {
    const target = Math.max(getLastLevel(), getUnlocked());
    const index = Math.min(Math.max(1, target), LEVELS.length) - 1;
    this._startRunAt(index);
  }

  _showLevels() {
    this._renderLevelCards();
    this.screens.show(SCREENS.LEVELS);
  }

  // --- Audio: música y efectos por separado, persistidos --------------------

  /** Aplica el estado de audio actual a los buses y arranca la música si toca. */
  _applyAudio() {
    sfx.setMuted(!this.sfxOn);
    music.setMuted(!this.musicOn);
    if (this.musicOn && !music.isPlaying()) music.start();
    this._syncAudioLabels();
  }

  _toggleMusic() {
    this.musicOn = !this.musicOn;
    setSetting('musicOn', this.musicOn);
    this._applyAudio();
  }

  _toggleSfx() {
    this.sfxOn = !this.sfxOn;
    setSetting('sfxOn', this.sfxOn);
    this._applyAudio();
  }

  /** Botón maestro (Pausa): si algo suena lo silencia todo; si todo está mudo, lo reactiva. */
  _toggleMasterSound() {
    const anyOn = this.sfxOn || this.musicOn;
    this.sfxOn = !anyOn;
    this.musicOn = !anyOn;
    setSetting('sfxOn', this.sfxOn);
    setSetting('musicOn', this.musicOn);
    this._applyAudio();
  }

  _showSettings() {
    this._cancelResetProgress();
    this._setSettingsFeedback('');
    this._syncAudioLabels();
    this.screens.show(SCREENS.SETTINGS);
  }

  _showCredits() {
    this.screens.show(SCREENS.CREDITS);
  }

  _setSettingsFeedback(msg) {
    const el = document.getElementById('settings-feedback');
    if (el) el.textContent = msg || '';
  }

  _askResetProgress() {
    const box = document.getElementById('reset-confirm');
    if (box) box.style.display = '';
    this._setSettingsFeedback('');
  }

  _cancelResetProgress() {
    const box = document.getElementById('reset-confirm');
    if (box) box.style.display = 'none';
  }

  _confirmResetProgress() {
    resetProgress();
    this._cancelResetProgress();
    // Refrescar todo lo que depende del progreso/inventario.
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this._updateMenuProgress();
    this._setSettingsFeedback(t('set.resetDone'));
  }

  /** Pantalla completa (Android/desktop). En iOS Safari no siempre es posible. */
  _toggleFullscreen() {
    const el = document.documentElement;
    try {
      if (!document.fullscreenElement) {
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) req.call(el);
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
    } catch (_) { /* no soportado: se ignora */ }
  }

  _updateHighScoreLabels() {
    const hs = getHighScore();
    const stars = getTotalStars();
    for (const id of ['menu-highscore', 'landing-highscore']) {
      const el = document.getElementById(id);
      if (el) el.textContent = tf('best.label', hs, stars, MAX_STARS);
    }
  }

  // --- Tienda de Canje ------------------------------------------------------
  _showShop() {
    this._renderShop();
    this.screens.show(SCREENS.SHOP);
  }

  _renderShop() {
    setText('shop-tokens', `⭐ ${getStarTokens()}`);
    const tokens = getStarTokens();
    const inv = getInventory();
    const list = document.getElementById('shop-list');
    if (list) {
      list.innerHTML = '';
      for (const item of SHOP) {
        const owned = inv[item.key] || 0;
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML =
          `<div class="shop-icon" aria-hidden="true">${item.icon}</div>` +
          '<div class="shop-info">' +
            `<span class="shop-name">${tShopName(item)}</span>` +
            `<span class="shop-desc">${tShopDesc(item)}</span>` +
            `<span class="shop-owned">${t('shop.owned')} <b>${owned}</b></span>` +
          '</div>' +
          `<button class="btn tiny shop-buy" data-key="${item.key}">⭐ ${item.cost}</button>`;
        const buyBtn = card.querySelector('.shop-buy');
        if (tokens < item.cost) buyBtn.classList.add('disabled');
        buyBtn.addEventListener('click', () => this._buy(item));
        list.appendChild(card);
      }
    }
    const fb = document.getElementById('shop-feedback');
    if (fb) { fb.textContent = ''; fb.className = 'shop-feedback'; }
  }

  _buy(item) {
    const bought = buyPowerup(item.key, item.cost);
    if (bought) { sfx.buy(); this._renderShop(); this._updateMenuProgress(); }
    else sfx.nope();
    // El feedback se anima DESPUÉS de re-renderizar (que limpia el mensaje).
    const fb = document.getElementById('shop-feedback');
    if (fb) {
      fb.className = 'shop-feedback';
      void fb.offsetWidth; // reinicia la animación
      fb.textContent = bought ? tf('shop.boughtOk', tShopName(item)) : tf('shop.notEnough', item.cost);
      fb.classList.add('show', bought ? 'ok' : 'bad');
    }
  }

  // --- Selección de bola ----------------------------------------------------
  _showBalls() {
    this._renderBallCards();
    this.screens.show(SCREENS.BALLS);
  }

  _renderBallCards() {
    const list = document.getElementById('balls-list');
    if (!list) return;
    list.innerHTML = '';
    for (const def of BALLS) {
      const card = document.createElement('button');
      card.className = 'ball-card' + (def.id === this.selectedBall ? ' selected' : '');
      const thumb = makeBallThumbnail(def, 96);
      thumb.className = 'ball-thumb';
      card.appendChild(thumb);
      const name = document.createElement('span');
      name.className = 'ball-name';
      name.textContent = tBallLabel(def);
      card.appendChild(name);
      const dino = document.createElement('span');
      dino.className = 'ball-dino';
      dino.textContent = `${tDinoName(def.species)} · ${tBallColor(def)}`;
      card.appendChild(dino);
      if (def.blurb) {
        const blurb = document.createElement('span');
        blurb.className = 'ball-blurb';
        blurb.textContent = tBallBlurb(def);
        card.appendChild(blurb);
      }
      card.addEventListener('click', () => this._selectBall(def.id));
      list.appendChild(card);
    }
  }

  _selectBall(id) {
    sfx.click();
    this.selectedBall = id;
    setSelectedBall(id);
    this.ball.setSkin(getBall(id));
    this._renderBallCards();
    this._updateBallPreviews();
  }

  _updateBallPreviews() {
    const def = getBall(this.selectedBall);
    setThumb('menu-ball', def, 56);
    setThumb('prep-ball', def, 64);
    setText('prep-ball-name', `${tBallLabel(def)} · ${tDinoName(def.species)}`);
  }

  /** Cambia rápidamente a la siguiente bola sin salir de la preparación. */
  _cyclePrepBall() {
    const i = BALLS.findIndex((b) => b.id === this.selectedBall);
    const next = BALLS[(i + 1) % BALLS.length];
    this.selectedBall = next.id;
    setSelectedBall(next.id);
    this.ball.setSkin(next);
    this._updateBallPreviews();
  }

  _renderLevelCards() {
    const list = document.getElementById('levels-list');
    if (!list) return;
    list.innerHTML = '';
    const unlocked = getUnlocked();
    WORLDS.forEach((world, w) => {
      const from = w * 5;
      const to = Math.min(from + 5, LEVELS.length);
      if (from >= LEVELS.length) return;

      // Cabecera de mundo con estrellas conseguidas / candado.
      let earned = 0, max = 0;
      for (let i = from; i < to; i++) { earned += getStars(LEVELS[i].id); max += 3; }
      const worldUnlocked = from + 1 <= unlocked;
      const header = document.createElement('div');
      header.className = 'world-header' + (worldUnlocked ? '' : ' locked');
      header.innerHTML =
        `<span class="world-emoji" aria-hidden="true">${world.emoji}</span>` +
        `<span class="world-name">${tf('prep.world', w + 1, tWorldName(w))}</span>` +
        `<span class="world-stars">${worldUnlocked ? tf('levels.worldStars', earned, max) : '🔒'}</span>`;
      list.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'levels-grid';
      for (let i = from; i < to; i++) {
        const lvl = LEVELS[i];
        const locked = i + 1 > unlocked;
        const stars = getStars(lvl.id);
        const done = stars > 0;
        const btn = document.createElement('button');
        btn.className = 'level-card' + (locked ? ' locked' : '') + (done ? ' done' : '');
        btn.dataset.tier = lvl.tier || '';
        btn.disabled = locked;
        btn.innerHTML =
          `<span class="level-num">${i + 1}</span>` +
          `<span class="level-card-name">${tLevelName(lvl)}</span>` +
          (locked
            ? '<span class="level-lock">🔒</span>'
            : `<span class="level-stars">${starString(stars)}</span>`);
        btn.addEventListener('click', () => {
          if (locked) return;
          sfx.click();
          this._startRunAt(i);
        });
        grid.appendChild(btn);
      }
      list.appendChild(grid);
    });
  }

  // --- Flujo de partida -----------------------------------------------------
  _newRun() {
    this._startRunAt(0);
  }

  _startRunAt(index) {
    this.levelIndex = index;
    this.lives = LIVES_START;
    this.score = 0;
    this._showPrep();
  }

  _showPrep() {
    const lvl = getLevel(this.levelIndex);
    const w = worldOf(this.levelIndex);
    setText('prep-world', `${w.emoji} ${tf('prep.world', worldNum(this.levelIndex), tWorldName(worldIdx(this.levelIndex)))}`);
    setText('prep-level', tf('prep.levelN', this.levelIndex + 1, tLevelName(lvl)));
    setText('prep-tier', tTier(lvl.tier || ''));
    const tierEl = document.getElementById('prep-tier');
    if (tierEl) tierEl.dataset.tier = lvl.tier || ''; // raw para el color por CSS
    setText('prep-lives', '🥚'.repeat(this.lives));
    setText('prep-objective', tLevelHint(lvl));
    // Recompensas disponibles en este nivel (monedas + estrella si toca).
    const { coins, star } = generateCollectibles(lvl, this.levelIndex);
    setText('prep-rewards', tf('prep.rewards', coins.length, !!star));
    this._updateBallPreviews();
    // Potenciadores: se eligen de nuevo para cada nivel.
    this._pendingTrapBlock = false;
    this._pendingFallShield = false;
    this._renderPrepPowerups();
    this.screens.show(SCREENS.PREP);
  }

  /** Activa/desactiva un potenciador para el próximo nivel (si hay stock). */
  _togglePrepPower(which) {
    const inv = getInventory();
    if (which === 'trap') {
      if (inv.trapBlocks <= 0) return;
      this._pendingTrapBlock = !this._pendingTrapBlock;
    } else {
      if (inv.fallShields <= 0) return;
      this._pendingFallShield = !this._pendingFallShield;
    }
    sfx.click();
    this._renderPrepPowerups();
  }

  /** Pinta los botones de potenciador disponibles en preparación. */
  _renderPrepPowerups() {
    const inv = getInventory();
    const wrap = document.getElementById('prep-powerups');
    if (wrap) wrap.style.display = (inv.trapBlocks > 0 || inv.fallShields > 0) ? 'flex' : 'none';
    const tb = document.getElementById('btn-prep-trapblock');
    if (tb) {
      tb.style.display = inv.trapBlocks > 0 ? 'inline-flex' : 'none';
      tb.classList.toggle('active', this._pendingTrapBlock);
      tb.textContent = tf('prep.trapBlock', inv.trapBlocks);
    }
    const fs = document.getElementById('btn-prep-shield');
    if (fs) {
      fs.style.display = inv.fallShields > 0 ? 'inline-flex' : 'none';
      fs.classList.toggle('active', this._pendingFallShield);
      fs.textContent = tf('prep.shield', inv.fallShields);
    }
  }

  _startLevel() {
    const lvl = getLevel(this.levelIndex);
    this.ball.setSkin(getBall(this.selectedBall));
    this.physics.loadLevel(lvl);
    this.scene.resize();
    this.scene.mountLevel(lvl, this.ball.mesh);
    this.ball.reset(lvl.start.x, lvl.start.z);
    this.scene.setTilt(0, 0);

    // --- Recompensas del nivel (monedas + estrella-token cada 2 niveles) ---
    const { coins, star } = generateCollectibles(lvl, this.levelIndex);
    this._collect = [
      ...coins.map((c) => ({ x: c.x, z: c.z, type: 'coin', taken: false })),
      ...(star ? [{ x: star.x, z: star.z, type: 'star', taken: false }] : []),
    ];
    this.scene.mountCollectibles(coins, star);
    this._coinsThisLevel = 0;
    this._starGotThisLevel = false;
    this._levelHasStar = !!star;
    this._pickupR2 = PICKUP_RADIUS * PICKUP_RADIUS;

    // --- Potenciadores activados en preparación (se consumen aquí) ---
    this._fallShieldActive = false;
    this._trapBlockedThisLevel = false;
    if (this._pendingTrapBlock && consumePowerup('trapBlocks')) {
      const t = this._firstDangerousTrap(lvl);
      if (t) {
        this.physics.traps = this.physics.traps.filter((x) => x !== t); // deja de ser trampa
        this.scene.coverTrap(t);                                         // se ve tapada/gris
        this._trapBlockedThisLevel = true;
        hud.toast(t('msg.trapBlocked'), 1400);
      }
    }
    if (this._pendingFallShield && consumePowerup('fallShields')) {
      this._fallShieldActive = true;
      hud.toast(t('msg.shieldOn'), 1400);
    }
    this._pendingTrapBlock = false;
    this._pendingFallShield = false;

    hud.setLevel(tLevelName(lvl), this.levelIndex + 1, LEVELS.length);
    hud.setLives(this.lives);
    hud.setScore(this.score);
    hud.setCoins(0);
    hud.setPowers(this._activePowers());
    hud.setTime(0);
    setThumb('hud-ball', getBall(this.selectedBall), 34);
    setLastLevel(this.levelIndex + 1);

    // Eventos ambientales: 2 vuelos de pterodáctilo por nivel (ida y vuelta) +
    // familia Triceratops al recoger 3 monedas (rearma la bandera por nivel).
    critters.clear();
    this._pteroTimes = critters.pteroFlightTimes(lvl.par);
    this._pteroFired = [false, false];
    this._triceratopsPlayed = false;

    this.input.reset();
    this.input.enable();
    this._levelStart = performance.now();
    this._pausedAccum = 0;
    this._livesAtLevelStart = this.lives;
    this.ballState = 'rolling';
    this.paused = false;
    this.playing = true;
    this.screens.show(SCREENS.GAME);
    sfx.start();
    hud.toast(tLevelHint(lvl), 1700);
    hud.hint(this.isTouch ? t('hud.hintTouch') : t('hud.hintDesktop'));
  }

  _elapsed() {
    return (performance.now() - this._levelStart - this._pausedAccum) / 1000;
  }

  // --- Pausa ----------------------------------------------------------------
  _togglePause() {
    if (this.paused) this._resume(); else this._pause();
  }

  _pause() {
    if (!this.playing || this.paused) return;
    this.paused = true;
    this._pauseStart = performance.now();
    this.input.reset();
    this.scene.setTilt(0, 0);
    setText('pause-level', tf('pause.levelN', this.levelIndex + 1, tLevelName(getLevel(this.levelIndex))));
    setText('pause-lives', '🥚'.repeat(Math.max(0, this.lives)) || '—');
    const ps = document.getElementById('pause-score');
    if (ps) ps.innerHTML = `<b>${this.score}</b> pts`;
    const powers = this._activePowers();
    setText('pause-powers', powers.length ? tf('pause.powers', powers.join('  ')) : '');
    this.screens.show(SCREENS.PAUSE);
  }

  _resume() {
    if (!this.paused) return;
    this.paused = false;
    this._pausedAccum += performance.now() - this._pauseStart;
    this.screens.show(SCREENS.GAME);
  }

  _restartLevel() {
    this.paused = false;
    this._startLevel();
  }

  // --- Bucle de juego -------------------------------------------------------
  _stepPlay(dt) {
    this.input.update(dt); // mueve también el knob del joystick (refleja la inclinación)
    this.scene.setTilt(this.input.tiltX, this.input.tiltZ);

    const ev = this.physics.update(dt, this.input.tiltX, this.input.tiltZ);
    this.ball.setPlanePosition(this.physics.x, this.physics.z);
    this.ball.roll(this.physics.vx, this.physics.vz, dt);
    hud.setTime(this._elapsed());

    this._maybeFlyPtero();
    this._checkPickups();

    // Portal (no termina el nivel): efecto de invocación en ambos extremos + sonido.
    const pfx = this.physics.consumePortalFx();
    if (pfx) {
      this.scene.spawnPortalFx(pfx.exitX, pfx.exitZ); // salida (donde reaparece)
      this.scene.spawnPortalFx(pfx.fromX, pfx.fromZ); // entrada (donde desapareció)
      sfx.portal();
    }

    if (ev === 'goal') this._startResolve('goal');
    else if (ev === 'trap') this._startResolve('trap');
    else if (ev === 'fall') {
      if (this._fallShieldActive) this._startRescue();
      else this._startResolve('fall');
    }
  }

  /** Lanza los 2 vuelos ambientales de pterodáctilo (ida y vuelta) según el tiempo. */
  _maybeFlyPtero() {
    if (!this._pteroTimes) return;
    const e = this._elapsed();
    if (!this._pteroFired[0] && e >= this._pteroTimes[0]) { this._pteroFired[0] = true; critters.flyPtero('ltr'); }
    if (!this._pteroFired[1] && e >= this._pteroTimes[1]) { this._pteroFired[1] = true; critters.flyPtero('rtl'); }
  }

  /** Recoge monedas/estrella si la bola pasa cerca. Suma puntos/estrellas-token. */
  _checkPickups() {
    const bx = this.physics.x, bz = this.physics.z;
    for (let i = 0; i < this._collect.length; i++) {
      const c = this._collect[i];
      if (c.taken) continue;
      const dx = c.x - bx, dz = c.z - bz;
      if (dx * dx + dz * dz > this._pickupR2) continue;
      c.taken = true;
      this.scene.collectAt(i);
      if (c.type === 'star') {
        // La estrella NO da puntos: suma 1 estrella de canje (recurso acumulable).
        this._starGotThisLevel = true;
        addStarTokens(1); // persistida en localStorage
        this.scene.spawnBurst(c.x, 0.7, c.z, '#ffe26a'); // ráfaga dorada
        this._popPoints(c.x, c.z, '⭐ +1', 'star');
        sfx.starGet();
        hud.flash('gold');
        hud.toast(t('msg.starGet'), 1500);
        critters.diplodocus(); // un diplodocus se asoma a celebrar (overlay lateral)
      } else {
        this.score += COIN_POINTS; // 1 punto por moneda
        this._coinsThisLevel += 1;
        this._popPoints(c.x, c.z, `+${COIN_POINTS}`, 'coin');
        sfx.coin();
        hud.setCoins(this._coinsThisLevel);
        hud.setScore(this.score);
        // A las 3 monedas del nivel: pasa la familia Triceratops (1 sola vez por nivel).
        if (this._coinsThisLevel >= 3 && !this._triceratopsPlayed) {
          this._triceratopsPlayed = true;
          critters.triceratops(this.levelIndex % 2 === 0 ? 'ltr' : 'rtl');
        }
      }
    }
  }

  /** Popup flotante de puntos ("+100"/"+500") en la posición del coleccionable. */
  _popPoints(x, z, text, kind) {
    const layer = document.getElementById('fx-layer');
    if (!layer) return;
    const p = this.scene.projectBoardPoint(x, z, 0.7);
    if (!p || !p.visible) return;
    const el = document.createElement('div');
    el.className = 'point-pop ' + (kind || 'coin');
    el.textContent = text;
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  /** Devuelve los iconos de los poderes activos en el nivel en curso. */
  _activePowers() {
    const p = [];
    if (this._trapBlockedThisLevel) p.push('🪨');
    if (this._fallShieldActive) p.push('🦅');
    return p;
  }

  /** Escudo de caída: el pterosaurio rescata la bola y la deja en zona segura. */
  _startRescue() {
    this._fallShieldActive = false; // se consume al usarse
    hud.setPowers(this._activePowers());
    this.ballState = 'rescuing';
    this.input.reset();
    this.input.tiltX = 0; this.input.tiltZ = 0;
    this.scene.setTilt(0, 0);
    sfx.rescue();
    hud.flash('gold');
    hud.toast(t('msg.rescue'), 1700);
    const lvl = getLevel(this.levelIndex);
    const color = getBall(this.selectedBall).dino;
    this.scene.startPteroRescue(lvl.start.x, lvl.start.z, color, () => {
      this.physics.reset(lvl.start);
      this.ball.reset(lvl.start.x, lvl.start.z);
      this.input.reset();
      this.ballState = 'rolling';
    });
  }

  /** Trampa "más peligrosa": la más cercana a la línea inicio→meta. */
  _firstDangerousTrap(lvl) {
    const traps = lvl.traps || [];
    if (!traps.length) return null;
    const mx = (lvl.start.x + (lvl.goal ? lvl.goal.x : lvl.start.x)) / 2;
    const mz = (lvl.start.z + (lvl.goal ? lvl.goal.z : lvl.start.z)) / 2;
    let best = traps[0], bestD = Infinity;
    for (const t of traps) {
      const d = Math.hypot(t.x - mx, t.z - mz);
      if (d < bestD) { bestD = d; best = t; }
    }
    return best;
  }

  _startResolve(kind) {
    const p = this.ball.mesh.position;
    let toX = p.x, toZ = p.z, toY = -6;
    if (kind === 'goal') {
      toX = this.physics.goal.x; toZ = this.physics.goal.z; toY = -0.5;
    } else if (kind === 'trap') {
      const t = this._nearestTrap(); toX = t.x; toZ = t.z; toY = -0.5;
      sfx.drop(); this.scene.shake(0.3); hud.flash('danger');
      this._taunt();
    } else {
      sfx.fail(); this.scene.shake(0.3); hud.flash('danger');
      this._taunt();
    }
    this._anim = {
      kind, t: 0, dur: kind === 'fall' ? 0.6 : 0.55,
      fromX: p.x, fromY: p.y, fromZ: p.z, toX, toY, toZ,
    };
    this.ballState = kind === 'goal' ? 'sinking-goal' : kind === 'trap' ? 'sinking-trap' : 'falling';
  }

  /** Mono prehistórico burlón al fallar (overlay breve + risita). No bloquea el juego. */
  _taunt() {
    showTaunt();
    sfx.taunt();
  }

  _nearestTrap() {
    let best = null, bestD = Infinity;
    for (const t of this.physics.traps) {
      const d = Math.hypot(t.x - this.physics.x, t.z - this.physics.z);
      if (d < bestD) { bestD = d; best = t; }
    }
    return best || { x: this.physics.x, z: this.physics.z };
  }

  _updateAnim(dt) {
    const a = this._anim;
    a.t += dt;
    const p = Math.min(1, a.t / a.dur);
    const e = easeOut(p);
    const m = this.ball.mesh;
    m.position.set(lerp(a.fromX, a.toX, e), lerp(a.fromY, a.toY, e), lerp(a.fromZ, a.toZ, e));
    if (a.kind !== 'fall') m.scale.setScalar(lerp(1, 0.4, e));
    const k = Math.min(1, 8 * dt);
    this.input.tiltX += (0 - this.input.tiltX) * k;
    this.input.tiltZ += (0 - this.input.tiltZ) * k;
    this.scene.setTilt(this.input.tiltX, this.input.tiltZ);
    if (p >= 1) this._resolveAnim();
  }

  _resolveAnim() {
    const kind = this._anim.kind;
    this._anim = null;
    if (kind === 'goal') this._startCelebration();
    else this._loseLife(kind);
  }

  // --- Celebración de victoria ---------------------------------------------
  _startCelebration() {
    this.ball.mesh.visible = false;
    // La celebración es PURAMENTE visual: si algo fallara, no debe bloquear el
    // avance a la pantalla de victoria (estado 'celebrating' + _completeLevel).
    try {
      this.scene.spawnCelebration(this.physics.goal.x, this.physics.goal.z, this.ball.ballDef);
    } catch (err) {
      console.error('[TREXoRoll] La celebración visual falló (se continúa):', err);
    }
    sfx.win();
    sfx.roar();
    this.scene.shake(0.18);
    hud.flash('gold');
    hud.toast(t('msg.levelDone'), 1500);
    this._celebT = 0;
    this.ballState = 'celebrating';
  }

  _updateCelebration(dt) {
    this._celebT += dt;
    const k = Math.min(1, 8 * dt);
    this.input.tiltX += (0 - this.input.tiltX) * k;
    this.input.tiltZ += (0 - this.input.tiltZ) * k;
    this.scene.setTilt(this.input.tiltX, this.input.tiltZ);
    if (this._celebT >= CELEBRATION_DUR) this._completeLevel();
  }

  _loseLife(kind) {
    this.lives -= 1;
    hud.setLives(this.lives);
    const lvl = getLevel(this.levelIndex);
    if (this.lives <= 0) {
      // Vida extra del inventario: se consume automáticamente y sigues en juego.
      if (consumePowerup('extraLives')) {
        this.lives = 1;
        hud.setLives(this.lives);
        hud.flash('gold');
        hud.toast(t('msg.extraLife'), 1500);
        this.physics.reset(lvl.start);
        this.ball.reset(lvl.start.x, lvl.start.z);
        this.input.reset();
        this.ballState = 'rolling';
        return;
      }
      this._noLives();
      return;
    }
    hud.toast(kind === 'fall' ? tf('msg.fell', this.lives) : tf('msg.trap', this.lives), 1300);
    this.physics.reset(lvl.start);
    this.ball.reset(lvl.start.x, lvl.start.z);
    this.input.reset();
    this.ballState = 'rolling';
  }

  _completeLevel() {
    this.playing = false;
    this.input.disable();
    const lvl = getLevel(this.levelIndex);
    const time = this._elapsed();
    const timeBonus = Math.max(0, Math.floor(lvl.par - time)) * SCORE.TIME_BONUS_PER_SEC;
    const lifeBonus = this.lives * SCORE.LIFE_BONUS;
    this.score += SCORE.BASE_LEVEL + lifeBonus + timeBonus;

    const lost = this._livesAtLevelStart - this.lives;
    let stars = 3;
    if (lost >= 1) stars -= 1;
    if (time > lvl.par) stars -= 1;
    stars = Math.max(1, stars);
    setStars(lvl.id, stars);
    setBestTime(lvl.id, time);
    const prevUnlocked = getUnlocked();
    unlockLevel(this.levelIndex + 2);
    const newUnlocked = getUnlocked();
    const isRecord = setHighScore(this.score);
    if (isRecord) sfx.record();

    const isLast = this.levelIndex >= LEVELS.length - 1;
    setText('win-title', isLast ? t('win.titleDone') : t('win.titleWin'));
    setText('win-stars', starString(stars));
    setText('win-score', tf('win.score', this.score));
    setText('win-detail', tf('win.detail', SCORE.BASE_LEVEL, lifeBonus, timeBonus));
    // Recap de recompensas recogidas este nivel.
    const starTxt = this._starGotThisLevel ? t('win.rewardStar') : (this._levelHasStar ? t('win.rewardStarLost') : '');
    setText('win-rewards', tf('win.rewards', this._coinsThisLevel, starTxt));
    setText('win-time', tf('win.time', time.toFixed(1), (getBestTime(lvl.id) ?? time).toFixed(1)));
    setText('win-progress', tf('win.progress', this.levelIndex + 1, LEVELS.length, getTotalStars(), MAX_STARS));
    // Mensaje de desbloqueo (si abrió un nivel nuevo) o de juego completado (último nivel).
    if (isLast) {
      setText('win-unlock', tf('win.completeMsg', getTotalStars(), MAX_STARS, getHighScore()));
      showEl('win-unlock', true);
    } else {
      const unlockedNew = newUnlocked > prevUnlocked;
      if (unlockedNew) setText('win-unlock', tf('win.unlock', Math.min(newUnlocked, LEVELS.length)));
      showEl('win-unlock', unlockedNew);
    }
    showEl('win-record', isRecord);
    showEl('btn-win-next', !isLast);
    this.screens.show(SCREENS.WIN);
  }

  _onWinNext() {
    if (this.levelIndex >= LEVELS.length - 1) { this._quitToMenu(); return; }
    this.levelIndex += 1;
    this._showPrep();
  }

  // --- Sin vidas + monetización (vídeo recompensado / packs de vidas) -------
  _noLives() {
    this.playing = false;
    this.input.disable();
    const isRecord = setHighScore(this.score);
    if (isRecord) sfx.record();
    setText('over-score', tf('over.score', this.score));
    setText('over-level', tf('over.levelReached', this.levelIndex + 1, LEVELS.length));
    setText('over-high', tf('over.high', getHighScore()));
    showEl('over-record', isRecord);
    this._renderReviveBox();
    this.screens.show(SCREENS.GAMEOVER);
  }

  _renderReviveBox() {
    const bank = getLivesBank();
    const cont = document.getElementById('btn-over-continue');
    if (cont) {
      cont.style.display = bank > 0 ? 'block' : 'none';
      cont.textContent = tf('over.continueBank', bank);
    }
  }

  /** Continúa la partida con las vidas concedidas (vídeo, banco…). */
  _reviveWith(lives) {
    if (lives <= 0) return;
    this.lives = lives;
    this._startLevel(); // retoma el nivel actual
  }

  _continueFromBank() {
    const got = takeFromLivesBank(REVIVE_LIVES);
    if (got > 0) this._reviveWith(got);
  }

  /** Vídeo recompensado SIMULADO (sin SDK real): cuenta atrás → +vidas → continúa. */
  _watchAd() {
    this.screens.show(SCREENS.ADVIEW);
    let n = 3;
    setText('ad-countdown', tf('ad.countdown', n));
    clearInterval(this._adTimer);
    this._adTimer = setInterval(() => {
      n -= 1;
      if (n > 0) { setText('ad-countdown', tf('ad.countdown', n)); return; }
      clearInterval(this._adTimer);
      setText('ad-countdown', tf('ad.reward', REVIVE_LIVES));
      setTimeout(() => this._reviveWith(REVIVE_LIVES), 750);
    }, 1000);
  }

  _cancelAd() {
    clearInterval(this._adTimer);
    this._noLives();
  }

  // --- Tienda de paquetes de vidas (compra simulada) ------------------------
  _showLifePacks() {
    this._renderLifePacks();
    this.screens.show(SCREENS.LIFEPACKS);
  }

  _renderLifePacks() {
    setText('lifepacks-bank', tf('packs.bank', getLivesBank()));
    const list = document.getElementById('lifepacks-list');
    if (list) {
      list.innerHTML = '';
      for (const p of LIFE_PACKS) {
        const tag = p.tag === 'Popular' ? t('packs.tagPopular') : (p.tag === 'Mejor valor' ? t('packs.tagBest') : '');
        const card = document.createElement('div');
        card.className = 'pack-card';
        card.innerHTML =
          `<div class="pack-lives" aria-hidden="true">❤️<b>${p.lives}</b></div>` +
          '<div class="pack-info">' +
            `<span class="pack-name">${tf('packs.lives', p.lives)}</span>` +
            (tag ? `<span class="pack-tag">${tag}</span>` : `<span class="pack-sub">${t('packs.forBank')}</span>`) +
          '</div>' +
          `<button class="btn tiny pack-buy">${p.price}</button>`;
        card.querySelector('.pack-buy').addEventListener('click', () => this._buyLifePack(p.lives));
        list.appendChild(card);
      }
    }
    const fb = document.getElementById('lifepacks-feedback');
    if (fb) { fb.textContent = ''; fb.className = 'shop-feedback'; }
  }

  _buyLifePack(n) {
    addLivesBank(n); // compra SIMULADA (MVP): sin pago real
    sfx.buy();
    this._renderLifePacks();
    const fb = document.getElementById('lifepacks-feedback');
    if (fb) {
      fb.className = 'shop-feedback';
      void fb.offsetWidth;
      fb.textContent = tf('packs.bought', n);
      fb.classList.add('show', 'ok');
    }
  }

  _onRetry() {
    this.lives = LIVES_START;
    this._showPrep();
  }

  _quitToMenu() {
    this.playing = false;
    this.paused = false;
    this.input.disable();
    this.scene.clearBoard();
    this._showMenu();
  }

  /** Salir de la partida e ir directo a la Tienda de Canje. */
  _quitToShop() {
    this.playing = false;
    this.paused = false;
    this.input.disable();
    this.scene.clearBoard();
    critters.clear();
    this._applyAudio();
    this._showShop();
  }

  // --- Bucle principal ------------------------------------------------------
  _loop(now) {
    const dt = Math.min((now - this._last) / 1000 || 0, 0.05);
    this._last = now;
    // Red de seguridad: un error en un frame NO debe matar el bucle de render
    // (antes, una excepción aquí dejaba el juego congelado). Se registra y se sigue.
    try {
      if (this.playing) {
        if (!this.paused) {
          if (this.ballState === 'rolling') this._stepPlay(dt);
          else if (this.ballState === 'celebrating') this._updateCelebration(dt);
          else if (this.ballState === 'rescuing') { /* la escena anima el ptero y mueve la bola */ }
          else this._updateAnim(dt);
        }
        this.scene.update(dt);
        this.scene.render();
      }
    } catch (err) {
      console.error('[TREXoRoll] Error en el bucle de juego (se continúa):', err);
    }
    requestAnimationFrame(this._loop);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showEl(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? 'block' : 'none';
}

function setThumb(id, ballDef, size) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  el.appendChild(makeBallThumbnail(ballDef, size));
}
