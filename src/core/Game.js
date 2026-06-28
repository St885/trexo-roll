// Game.js — Orquestador central de TREXoRoll.
// Conecta escena 3D, física, input, pantallas, HUD, audio, bolas y progresión.

import { SceneManager } from '../scene/SceneManager.js';
import { Ball } from '../scene/Ball.js';
import { BallPhysics } from '../physics/BallPhysics.js';
import { InputController } from './InputController.js';
import { ScreenManager } from './ScreenManager.js';
import { LEVELS, getLevel } from '../levels/levels.js';
import { generateCollectibles, COIN_POINTS, PICKUP_RADIUS } from '../levels/collectibles.js';
import { generateRocket, ROCKET_HIT_R } from '../levels/rockets.js';
import { BALLS, getBall, getAbility } from '../data/balls.js';
import { SKINS, applySkin, skinsUnlockedByStars } from '../data/skins.js';
import { getDino } from '../data/dinos.js';
import { bossFor, weatherFor, windPushFor, timeAttackFor } from '../levels/levelEvents.js';
import { rollChest } from '../systems/chest.js';
import { evaluateDaily, todayStr, DAILY_REWARDS } from '../systems/daily.js';
import { SCREENS, LIVES_START, SCORE, PHYS } from '../utils/constants.js';
import * as hud from '../ui/hud.js';
import { sfx } from '../effects/sfx.js';
import { music } from '../effects/music.js';
import { showTaunt, renderMonkeyInto } from '../effects/tauntMonkey.js';
import * as critters from '../effects/critters.js';
import * as weather from '../effects/weather.js';
import { t, tf, getLang, setLang, applyTranslations, onLangChange } from '../utils/i18n.js';
import { getSession, setSession, clearSession, hasSession, sanitizeName } from '../utils/session.js';
// Capa de cuenta/nube (Firebase-ready, inerte en modo demo) + analítica.
import * as auth from '../services/authService.js';
import * as sync from '../services/progressSyncService.js';
import { track } from '../services/analyticsService.js';
import { makeBallThumbnail } from '../scene/textures.js';
import {
  getHighScore, setHighScore, getUnlocked, unlockLevel,
  getStars, setStars, getTotalStars, getBestTime, setBestTime,
  getSelectedBall, setSelectedBall, setLastLevel, getLastLevel,
  getStarTokens, addStarTokens, getInventory, buyPowerup, consumePowerup, addPowerup,
  getLivesBank, addLivesBank, takeFromLivesBank,
  getSettings, setSetting, resetProgress,
  getChestsAvailable, openChest, starsToNextChest, CHEST_STAR_COST,
  ownsSkin, getActiveSkin, unlockSkin, setActiveSkin,
  getDaily, setDaily,
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

// Emoji por tipo de jefe (banner de intro).
const BOSS_EMOJI = { caveman: '🪓', trex: '🦖', volcano: '🌋', storm: '⛈️', finale: '👑' };
// Emoji por tipo de clima.
const WEATHER_EMOJI = { rain: '🌧️', fog: '🌫️', wind: '🌬️', ash: '🌋', storm: '⛈️', heat: '🔥' };

export class Game {
  constructor(container) {
    this.container = container;
    this.scene = new SceneManager(container);
    this.selectedBall = getSelectedBall();
    this.ball = new Ball(applySkin(getBall(this.selectedBall), getActiveSkin()));
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
    this._updateGreeting();
    this._initAccount();        // detecta modo demo/nube y prepara UI de cuenta/sync
    // Acceso: si ya hay sesión local válida, va directo al landing; si no, pide acceso.
    if (hasSession()) {
      this.screens.show(SCREENS.LANDING);
    } else {
      this._showAuth();
    }
    requestAnimationFrame(this._loop);
  }

  // --- Cuenta / nube (Firebase-ready; inerte y seguro en modo demo) -----------

  /** Detecta si Firebase está configurado y prepara la UI de cuenta/sincronización. */
  _initAccount() {
    this._cloudMode = false;                 // por defecto, demo (local)
    this._cloudUser = null;
    this._syncStatus = sync.SYNC_STATUS.LOCAL;
    // Detección async: no bloquea el arranque. En demo, queda todo como está.
    auth.getAuthMode().then((mode) => {
      this._cloudMode = (mode === 'cloud');
      this._applyAuthModeUI();
    }).catch(() => { this._cloudMode = false; this._applyAuthModeUI(); });
    // Observa la sesión de la nube (si la hay) para reflejar el estado.
    try {
      auth.onAuthChange((u) => {
        this._cloudUser = u;
        this._setSyncStatus(u ? sync.SYNC_STATUS.CLOUD : (this._cloudMode ? sync.SYNC_STATUS.LOCAL : sync.SYNC_STATUS.LOCAL));
        this._updateAccountUI();
      });
    } catch (_) { /* sin Firebase: no pasa nada */ }
    this._applyAuthModeUI();
  }

  /** Aplica clase de modo (demo/nube) y textos asociados en la pantalla de acceso. */
  _applyAuthModeUI() {
    document.body.classList.toggle('cloud-auth', !!this._cloudMode);
    setText('auth-mode-msg', this._cloudMode ? t('auth.modeCloud') : t('auth.modeDemo'));
    this._updateAccountUI();
  }

  /** Refresca el bloque de cuenta + estado de sincronización en Ajustes. */
  _updateAccountUI() {
    const s = getSession();
    const acc = this._cloudUser
      ? tf('account.cloud', this._cloudUser.displayName || this._cloudUser.email || 'cuenta')
      : (s ? tf('account.local', s.playerName) : t('account.none'));
    setText('account-status', acc);
    const map = {
      [sync.SYNC_STATUS.LOCAL]: t('sync.local'),
      [sync.SYNC_STATUS.CLOUD]: t('sync.cloud'),
      [sync.SYNC_STATUS.OFFLINE]: t('sync.offline'),
      [sync.SYNC_STATUS.PENDING]: t('sync.pending'),
    };
    setText('sync-status', map[this._syncStatus] || t('sync.local'));
  }

  _setSyncStatus(status) {
    this._syncStatus = status;
    this._updateAccountUI();
  }

  /** Sube el progreso local a la nube si hay sesión real (best-effort, sin bloquear). */
  _pushCloudIfLogged() {
    if (!this._cloudUser) return;
    Promise.resolve(sync.pushLocal(this._cloudUser.uid, this._accountMeta()))
      .then((r) => { if (r) this._setSyncStatus(r.status); })
      .catch(() => this._setSyncStatus(sync.SYNC_STATUS.PENDING));
  }

  /** Metadatos de sesión para la sincronización con la nube. */
  _accountMeta(email) {
    const s = getSession();
    return {
      playerName: (s && s.playerName) || (this._cloudUser && this._cloudUser.displayName) || 'Jugador',
      language: getLang(),
      authProvider: this._cloudUser ? this._cloudUser.provider : 'password',
      email: email || (this._cloudUser && this._cloudUser.email) || '',
    };
  }

  /** Traduce un código de error de auth a un mensaje GENÉRICO (sin tecnicismos). */
  _authErrorMsg(code) {
    const map = {
      'auth/invalid-email': 'auth.errEmail',
      'auth/weak-password': 'auth.errWeak',
      'auth/email-already-in-use': 'auth.errInUse',
      'auth/invalid-credential': 'auth.errBadCreds',
      'auth/wrong-password': 'auth.errBadCreds',
      'auth/user-not-found': 'auth.errBadCreds',
      'auth/too-many-requests': 'auth.errTooMany',
      'auth/network-request-failed': 'auth.errNetwork',
      'auth/not-configured': 'auth.errNotReady',
    };
    return t(map[code] || 'auth.errGeneric');
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
    if (this.screens.isActive(SCREENS.SKINS)) this._renderSkins();
    if (this.screens.isActive(SCREENS.CHEST)) this._renderChest();
    if (this.screens.isActive(SCREENS.DAILY)) this._renderDaily();
    if (this.screens.isActive(SCREENS.LIFEPACKS)) this._renderLifePacks();
    if (this.screens.isActive(SCREENS.PREP)) this._showPrep();
    if (this.screens.isActive(SCREENS.LEGAL) && this._legalKind) this._showLegal(this._legalKind);
    this._updateGreeting();
  }

  _syncLangButtons() {
    const cur = getLang();
    for (const id of ['btn-lang-es', 'btn-lang-en', 'btn-auth-lang-es', 'btn-auth-lang-en', 'btn-set-lang-es', 'btn-set-lang-en']) {
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

    // Acceso / registro (simulado)
    click('btn-auth-guest', () => this._authGuest());
    click('btn-auth-login', () => this._authView('login'));
    click('btn-auth-register', () => this._authView('register'));
    click('btn-login-back', () => this._authView('home'));
    click('btn-register-back', () => this._authView('home'));
    click('btn-do-login', () => this._doLogin());
    click('btn-do-register', () => this._doRegister());
    click('btn-forgot', () => this._resetPassword());
    click('btn-auth-google', () => this._authProvider('google'));
    click('btn-auth-apple', () => this._authProvider('apple'));
    click('btn-auth-samsung', () => this._authProvider('samsung'));
    click('btn-provider-guest', () => this._authGuest());
    click('btn-provider-back', () => this._authView('home'));
    click('link-terms', () => this._showLegal('terms'));
    click('link-privacy', () => this._showLegal('privacy'));
    click('btn-legal-back', () => this._showAuthOrMenu());
    click('btn-auth-lang-es', () => setLang('es'));
    click('btn-auth-lang-en', () => setLang('en'));
    click('btn-set-logout', () => this._logout());

    click('btn-enter', () => this._showMenu());
    click('btn-lang-es', () => setLang('es'));
    click('btn-lang-en', () => setLang('en'));
    click('btn-continue', () => this._continueRun());
    click('btn-play', () => this._newRun());
    click('btn-balls', () => this._showBalls());
    click('btn-balls-back', () => this._showMenu());
    click('btn-shop', () => this._showShop());
    click('btn-shop-back', () => this._showMenu());
    // Skins, cofre jurásico y recompensa diaria (evolución v0.20)
    click('btn-skins', () => this._showSkins());
    click('btn-skins-back', () => this._showMenu());
    click('btn-chest', () => this._showChest());
    click('btn-chest-open', () => this._openChest());
    click('btn-chest-back', () => this._showMenu());
    click('btn-shop-chest', () => this._showChest());
    click('btn-daily', () => this._showDaily());
    click('btn-daily-claim', () => this._claimDaily());
    click('btn-daily-back', () => this._showMenu());
    click('btn-levels', () => this._showLevels());
    click('btn-howto', () => this.screens.show(SCREENS.HOWTO));
    click('btn-settings', () => this._showSettings());
    click('btn-fullscreen', () => this._toggleFullscreen());

    // Ajustes y créditos
    click('btn-set-fullscreen', () => this._toggleFullscreen());
    click('btn-set-lang-es', () => setLang('es'));
    click('btn-set-lang-en', () => setLang('en'));
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

  // --- Acceso / registro (SIMULADO, local; sin backend, APIs ni contraseñas) -----

  /** Muestra la pantalla de acceso en su vista inicial (opciones). */
  _showAuth() {
    this._authView('home');
    this._setAuthError('login-error', '');
    this._setAuthError('reg-error', '');
    this._applyAuthModeUI(); // refleja modo demo/nube (mensaje + campos correctos)
    this.screens.show(SCREENS.AUTH);
  }

  /** Alterna entre las vistas internas de la pantalla de acceso. */
  _authView(name) {
    for (const id of ['auth-home', 'auth-login', 'auth-register', 'auth-provider']) {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === 'auth-' + name) ? 'flex' : 'none';
    }
  }

  _setAuthError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  _authGuest() {
    track.guestStart();
    this._completeAuth('guest', t('player.guest'));
  }

  async _doLogin() {
    const pass = this._inputVal('login-pass'); // la contraseña NUNCA se guarda ni se loguea
    if (this._cloudMode) {
      // --- Nube: Firebase Auth con correo/contraseña ---
      const email = this._inputVal('login-email').trim();
      if (!auth.isValidEmail(email)) { this._setAuthError('login-error', t('auth.errEmail')); return; }
      if (!auth.isValidPassword(pass)) { this._setAuthError('login-error', t('auth.errWeak')); return; }
      this._setAuthError('login-error', t('auth.signingIn'));
      const res = await auth.signInEmail({ email, password: pass });
      if (!res.ok) { this._setAuthError('login-error', this._authErrorMsg(res.code)); return; }
      this._setAuthError('login-error', '');
      await this._afterCloudAuth(res, email, 'login');
      return;
    }
    // --- Demo local (sin Firebase configurado): nombre + contraseña (no se guarda) ---
    const name = sanitizeName(this._inputVal('login-name'), '');
    if (!name) { this._setAuthError('login-error', t('auth.errName')); return; }
    if (!pass || pass.length < 4) { this._setAuthError('login-error', t('auth.errPass')); return; }
    this._setAuthError('login-error', '');
    this._completeAuth('local-demo', name);
  }

  async _doRegister() {
    const name = sanitizeName(this._inputVal('reg-name'), '');
    const pass = this._inputVal('reg-pass');
    const pass2 = this._inputVal('reg-pass2');
    const terms = !!(document.getElementById('reg-terms') && document.getElementById('reg-terms').checked);
    if (!name) { this._setAuthError('reg-error', t('auth.errName')); return; }
    if (this._cloudMode) {
      // --- Nube: crea la cuenta real; migra el progreso local existente a la nube ---
      const email = this._inputVal('reg-email').trim();
      if (!auth.isValidEmail(email)) { this._setAuthError('reg-error', t('auth.errEmail')); return; }
      if (!auth.isValidPassword(pass)) { this._setAuthError('reg-error', t('auth.errWeak')); return; }
      if (pass !== pass2) { this._setAuthError('reg-error', t('auth.errMatch')); return; }
      if (!terms) { this._setAuthError('reg-error', t('auth.errTerms')); return; }
      this._setAuthError('reg-error', t('auth.creating'));
      const res = await auth.signUpEmail({ email, password: pass, displayName: name });
      if (!res.ok) { this._setAuthError('reg-error', this._authErrorMsg(res.code)); return; }
      this._setAuthError('reg-error', '');
      await this._afterCloudAuth(res, email, 'register');
      return;
    }
    // --- Demo local: validación mínima; la contraseña NO se guarda ---
    if (!pass || pass.length < 4) { this._setAuthError('reg-error', t('auth.errPass')); return; }
    if (pass !== pass2) { this._setAuthError('reg-error', t('auth.errMatch')); return; }
    if (!terms) { this._setAuthError('reg-error', t('auth.errTerms')); return; }
    this._setAuthError('reg-error', '');
    this._completeAuth('local-demo', name);
  }

  /** Tras un login/registro real: sesión + sincronización nube/local + analítica. */
  async _afterCloudAuth(res, email, kind) {
    const name = (res.user && res.user.displayName) || sanitizeName(this._inputVal(kind === 'register' ? 'reg-name' : 'login-name'), email.split('@')[0]);
    setSession({ authMode: 'email', playerName: name, acceptedTerms: true, language: getLang() });
    this._cloudUser = res.user;
    if (kind === 'register') track.signUp('password'); else track.login('password');
    // Sincroniza progreso (elige el más avanzado entre local y nube).
    try {
      const r = await sync.syncOnLogin(res.uid, this._accountMeta(email));
      this._setSyncStatus(r.status);
    } catch (_) { this._setSyncStatus(sync.SYNC_STATUS.PENDING); }
    // Refresca lo que depende del progreso (la nube pudo cambiar el local).
    this.selectedBall = getSelectedBall();
    this._updateBallPreviews();
    this._updateHighScoreLabels();
    this._clearAuthInputs();
    this._updateGreeting();
    this._updateAccountUI();
    this.screens.show(SCREENS.LANDING);
  }

  /** Recuperación de contraseña (solo en modo nube). */
  async _resetPassword() {
    if (!this._cloudMode) return;
    const email = this._inputVal('login-email').trim();
    if (!auth.isValidEmail(email)) { this._setAuthError('login-error', t('auth.errEmail')); return; }
    const res = await auth.resetPassword(email);
    this._setAuthError('login-error', res.ok ? t('auth.resetSent') : this._authErrorMsg(res.code));
  }

  /** Proveedor externo: placeholder seguro (aún sin integración real). */
  _authProvider(provider) {
    const map = { google: { name: 'Google', mode: 'google-placeholder' },
                  apple: { name: 'Apple', mode: 'apple-placeholder' },
                  samsung: { name: 'Samsung', mode: 'samsung-placeholder' } };
    const p = map[provider] || map.google;
    this._pendingProvider = p.mode;
    const nameEl = document.getElementById('auth-provider-name');
    if (nameEl) nameEl.textContent = p.name; // textContent (sin innerHTML): seguro
    this._authView('provider');
  }

  /** Lee un input de forma segura (string acotado). */
  _inputVal(id) {
    const el = document.getElementById(id);
    return el && typeof el.value === 'string' ? el.value : '';
  }

  /** Guarda la sesión local y entra al landing. NO toca el progreso del juego. */
  _completeAuth(mode, name) {
    setSession({ authMode: mode, playerName: name, acceptedTerms: true, language: getLang() });
    this._clearAuthInputs();
    this._updateGreeting();
    this.screens.show(SCREENS.LANDING);
  }

  _clearAuthInputs() {
    for (const id of ['login-name', 'login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-pass', 'reg-pass2']) {
      const el = document.getElementById(id); if (el) el.value = '';
    }
    const chk = document.getElementById('reg-terms'); if (chk) chk.checked = false;
  }

  /** Muestra la política de privacidad o los términos. which: 'privacy' | 'terms'. */
  _showLegal(which) {
    this._legalKind = which === 'terms' ? 'terms' : 'privacy';
    this._legalReturn = this.screens.isActive(SCREENS.LEGAL) ? (this._legalReturn || SCREENS.AUTH) : (this._currentScreen() || SCREENS.AUTH);
    const titleEl = document.getElementById('legal-title');
    const bodyEl = document.getElementById('legal-body');
    if (titleEl) titleEl.textContent = t(this._legalKind === 'terms' ? 'legal.termsTitle' : 'legal.privacyTitle');
    if (bodyEl) bodyEl.innerHTML = t(this._legalKind === 'terms' ? 'legal.termsBody' : 'legal.privacyBody'); // contenido propio (sin entradas de usuario)
    this.screens.show(SCREENS.LEGAL);
  }

  _showAuthOrMenu() { this.screens.show(this._legalReturn || SCREENS.AUTH); }

  _currentScreen() {
    const active = document.querySelector('.screen.active');
    return active ? active.id : null;
  }

  /** Cierra la sesión (local y, si la hay, de la nube). NO borra el progreso del juego. */
  async _logout() {
    try { await auth.signOutUser(); } catch (_) { /* en demo es no-op */ }
    this._cloudUser = null;
    this._setSyncStatus(sync.SYNC_STATUS.LOCAL);
    clearSession();
    this._updateGreeting();
    this._updateAccountUI();
    this._showAuth();
  }

  /** Saludo "¡Hola, X!" en el menú según la sesión local. */
  _updateGreeting() {
    const el = document.getElementById('menu-greeting');
    if (!el) return;
    const s = getSession();
    el.textContent = s ? tf('auth.greet', s.playerName) : '';
  }

  _showMenu() {
    this.playing = false;
    this.paused = false;
    this.input.disable();
    this.scene.clearBoard();
    critters.clear();
    weather.clear();
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this._updateMenuProgress();
    this._updateGreeting();
    // Llegamos aquí tras pulsar "Entrar" (gesto del usuario): podemos arrancar la
    // música de fondo respetando las restricciones de autoplay del navegador.
    this._applyAudio();
    this.screens.show(SCREENS.MENU);
  }

  /** Stats (estrellas/nivel/récord), barra de progreso, "Continuar" y badges de tiles. */
  _updateMenuProgress() {
    const unlocked = Math.min(getUnlocked(), LEVELS.length);
    const total = getTotalStars();
    const pct = Math.round((total / MAX_STARS) * 100);
    // Pills de estadísticas.
    setText('menu-stars', `${total}/${MAX_STARS}`);
    setText('menu-unlocked', `${unlocked}/${LEVELS.length}`);
    setText('menu-best', `${getHighScore()}`);
    // Barra de progreso + porcentaje.
    const fill = document.getElementById('menu-progress-fill');
    if (fill) fill.style.width = pct + '%';
    setText('menu-progress-label', `${pct}%`);
    // "Continuar" solo si hay progreso. Marca el contenedor cuando solo está "Jugar"
    // (para que el CTA ocupe el ancho completo en el layout de paisaje a 2 columnas).
    const hasProgress = unlocked > 1 || getLastLevel() > 1 || total > 0;
    const cont = document.getElementById('btn-continue');
    if (cont) {
      cont.style.display = hasProgress ? '' : 'none';
      const cta = cont.parentElement;
      if (cta) cta.classList.toggle('no-continue', !hasProgress);
    }

    // Badges de los tiles (Canje, Cofre, Diario) — sin tocar icono/etiqueta.
    this._setTileBadge('tile-shop-badge', `⭐${getStarTokens()}`, getStarTokens() > 0);
    const chests = getChestsAvailable();
    this._setTileBadge('tile-chest-badge', `${chests}`, chests > 0);
    this._markTileReady('btn-chest', chests > 0);
    const dailyReady = this._dailyState().canClaim;
    this._setTileBadge('tile-daily-badge', '', dailyReady); // punto (dot) sin texto
    this._markTileReady('btn-daily', dailyReady);
  }

  /** Pinta (o esconde) el badge de un tile. */
  _setTileBadge(id, text, show) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.hidden = !show;
  }

  /** Marca un tile como "listo" (glow) cuando hay algo que reclamar/abrir. */
  _markTileReady(btnId, ready) {
    const el = document.getElementById(btnId);
    if (el) el.classList.toggle('ready', ready);
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
    this._updateAccountUI(); // cuenta + estado de sincronización
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
          `<button class="btn tiny shop-buy" data-key="${item.key}">` +
            `<span class="sb-verb">${t('shop.redeem')}</span>` +
            `<span class="sb-cost">⭐ ${item.cost}</span>` +
          '</button>';
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

  // --- Skins de bola (colección) --------------------------------------------
  _showSkins() {
    this._renderSkins();
    this.screens.show(SCREENS.SKINS);
  }

  _renderSkins() {
    // Refleja la realidad: si ya tienes estrellas suficientes, desbloquea ANTES de pintar
    // (evita estados confusos tipo "tienes 72, requiere 6" en una skin "bloqueada").
    this._autoUnlockStarSkins();
    setText('skins-tokens', `${getStarTokens()}`);
    const list = document.getElementById('skins-list');
    if (!list) return;
    list.innerHTML = '';
    const active = getActiveSkin();
    for (const skin of SKINS) {
      const owned = ownsSkin(skin.id);
      const isActive = skin.id === active;
      const rarity = skin.rarity || 'comun';
      const state = isActive ? 'equipped' : owned ? 'owned'
        : skin.unlock.type === 'tokens' ? 'buy' : skin.unlock.type === 'chest' ? 'chest' : 'stars';
      const card = document.createElement('button');
      card.className = 'skin-card rar-' + rarity + (isActive ? ' selected' : '') + (owned ? ' owned' : ' locked');
      card.dataset.state = state;
      card.setAttribute('aria-label', t('skin.' + skin.id + '.name'));
      // Estructura premium: rareza · tipo · etiqueta equipada · orbe (bola) · nombre · estado.
      card.innerHTML =
        `<span class="skin-rarity">${t('rarity.' + rarity)}</span>` +
        `<span class="skin-type" aria-hidden="true">${skin.icon}</span>` +
        '<span class="skin-equip-tag">✓ ' + t('skins.equipped') + '</span>' +
        '<span class="skin-orb"><span class="skin-orb-ring" aria-hidden="true"></span></span>' +
        `<span class="skin-name">${t('skin.' + skin.id + '.name')}</span>` +
        `<span class="skin-status state-${state}">${this._skinStatusText(skin, owned, isActive)}</span>`;
      // Miniatura (bola con la skin sobre el dino elegido) dentro del orbe.
      const orb = card.querySelector('.skin-orb');
      const thumb = makeBallThumbnail(applySkin(getBall(this.selectedBall), skin.id), 112);
      thumb.className = 'skin-thumb';
      if (orb) orb.appendChild(thumb);
      if (!owned && orb) {
        const lock = document.createElement('span');
        lock.className = 'skin-lock'; lock.textContent = '🔒'; lock.setAttribute('aria-hidden', 'true');
        orb.appendChild(lock);
      }
      card.addEventListener('click', () => this._onSkinClick(skin, card));
      list.appendChild(card);
    }
    const fb = document.getElementById('skins-feedback');
    if (fb) { fb.textContent = ''; fb.className = 'shop-feedback'; }
  }

  _skinStatusText(skin, owned, isActive) {
    if (isActive) return t('skins.equipped');
    if (owned) return t('skins.tapEquip');
    const u = skin.unlock;
    if (u.type === 'stars') return tf('skins.needStars', u.need);
    if (u.type === 'tokens') return tf('skins.buyTokens', u.cost);
    if (u.type === 'chest') return t('skins.fromChest');
    return '';
  }

  _onSkinClick(skin, card) {
    const owned = ownsSkin(skin.id);
    if (owned) {
      setActiveSkin(skin.id);
      track.skinSelected(skin.id);
      sfx.click();
      this.ball.setSkin(this._ballVisual());
      this._updateBallPreviews();
      this._renderSkins();
      this._skinsFeedback(tf('skins.equippedOk', t('skin.' + skin.id + '.name')), true);
      return;
    }
    if (skin.unlock.type === 'tokens') {
      if (getStarTokens() >= skin.unlock.cost) {
        addStarTokens(-skin.unlock.cost);
        unlockSkin(skin.id);
        setActiveSkin(skin.id);
        sfx.buy();
        this.ball.setSkin(this._ballVisual());
        this._updateBallPreviews();
        this._renderSkins();
        this._updateMenuProgress();
        this._skinsFeedback(tf('skins.boughtOk', t('skin.' + skin.id + '.name')), true);
      } else {
        sfx.nope();
        this._skinsFeedback(tf('skins.notEnough', skin.unlock.cost), false);
      }
      return;
    }
    // Bloqueada por estrellas o solo-cofre: explica cómo conseguirla + sacudida de feedback.
    sfx.nope();
    if (card && card.classList) {
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }
    this._skinsFeedback(this._skinStatusText(skin, false, false), false);
  }

  _skinsFeedback(msg, ok) {
    const fb = document.getElementById('skins-feedback');
    if (!fb) return;
    fb.className = 'shop-feedback';
    void fb.offsetWidth;
    fb.textContent = msg;
    fb.classList.add('show', ok ? 'ok' : 'bad');
  }

  // --- Cofre jurásico -------------------------------------------------------
  _showChest() {
    this._renderChest();
    this.screens.show(SCREENS.CHEST);
  }

  _renderChest() {
    const avail = getChestsAvailable();
    setText('chest-count', tf('chest.available', avail));
    const need = starsToNextChest();
    setText('chest-progress', avail > 0 ? t('chest.readyHint') : tf('chest.nextHint', need, CHEST_STAR_COST));
    // Barra de progreso hacia el próximo cofre (llena si ya hay alguno disponible).
    const fill = document.getElementById('chest-bar-fill');
    if (fill) {
      const have = avail > 0 ? CHEST_STAR_COST : (CHEST_STAR_COST - need);
      fill.style.width = Math.round((have / CHEST_STAR_COST) * 100) + '%';
    }
    const box = document.getElementById('chest-box');
    if (box) { box.classList.toggle('ready', avail > 0); box.classList.toggle('locked', avail <= 0); }
    const btn = document.getElementById('btn-chest-open');
    if (btn) {
      btn.classList.toggle('disabled', avail <= 0);
      btn.textContent = avail > 0 ? t('chest.open') : t('chest.locked');
    }
    const reveal = document.getElementById('chest-reveal');
    if (reveal && !this._chestRevealing) { reveal.textContent = ''; reveal.className = 'chest-reveal'; }
  }

  _openChest() {
    if (getChestsAvailable() <= 0) { sfx.nope(); return; }
    if (!openChest()) { sfx.nope(); return; }
    const locked = SKINS.filter((s) => !ownsSkin(s.id)).map((s) => s.id);
    const reward = rollChest(Math.random, locked);
    this._applyChestReward(reward);
    track.chestOpened(reward.type);
    this._pushCloudIfLogged();
    // Animación de apertura + revelado.
    const box = document.getElementById('chest-box');
    if (box) { box.classList.remove('open'); void box.offsetWidth; box.classList.add('open'); }
    sfx.buy(); sfx.starGet();
    this._chestRevealing = true;
    const reveal = document.getElementById('chest-reveal');
    if (reveal) {
      reveal.className = 'chest-reveal';
      void reveal.offsetWidth;
      reveal.textContent = this._chestRewardText(reward);
      reveal.classList.add('show');
    }
    setTimeout(() => { this._chestRevealing = false; this._renderChest(); this._updateMenuProgress(); }, 1600);
  }

  /** Entrega la recompensa del cofre al inventario persistente. */
  _applyChestReward(r) {
    if (r.type === 'tokens') addStarTokens(r.amount);
    else if (r.type === 'livesBank') addLivesBank(r.amount);
    else if (r.type === 'skin') { unlockSkin(r.skinId); }
    else addPowerup(r.type, r.amount); // extraLives | trapBlocks | fallShields
  }

  _chestRewardText(r) {
    if (r.type === 'skin') return tf('chest.rewardSkin', r.icon, t('skin.' + r.skinId + '.name'));
    return tf('chest.reward', r.icon, r.amount, t('chest.r.' + r.type));
  }

  // --- Recompensa diaria ----------------------------------------------------
  _showDaily() {
    this._renderDaily();
    this.screens.show(SCREENS.DAILY);
  }

  _dailyState() {
    return evaluateDaily(getDaily(), todayStr());
  }

  _renderDaily() {
    const st = this._dailyState();
    const cur = getDaily();
    setText('daily-streak', tf('daily.streak', st.canClaim ? st.nextStreak : cur.streak));
    setText('daily-reward', tf('daily.todayReward', st.reward.icon, st.reward.amount, t('daily.r.' + st.reward.type)));
    // Calendario de 7 días (visual).
    const cal = document.getElementById('daily-calendar');
    if (cal) {
      cal.innerHTML = '';
      const activeDay = ((st.canClaim ? st.nextStreak : cur.streak) - 1) % 7;
      DAILY_REWARDS.forEach((d, i) => {
        const cell = document.createElement('div');
        const claimed = !st.canClaim ? i <= activeDay : i < ((st.nextStreak - 1) % 7);
        cell.className = 'daily-cell' + (i === activeDay ? ' today' : '') + (claimed ? ' claimed' : '');
        cell.innerHTML = `<span class="daily-day">${i + 1}</span><span class="daily-ic">${d.icon}</span><span class="daily-amt">${d.amount}</span>`;
        cal.appendChild(cell);
      });
    }
    const btn = document.getElementById('btn-daily-claim');
    if (btn) {
      btn.classList.toggle('disabled', !st.canClaim);
      btn.textContent = st.canClaim ? t('daily.claim') : t('daily.claimed');
    }
    const fb = document.getElementById('daily-feedback');
    if (fb && !this._dailyClaiming) { fb.textContent = ''; fb.className = 'shop-feedback'; }
  }

  _claimDaily() {
    const st = this._dailyState();
    if (!st.canClaim) { sfx.nope(); return; }
    this._applyDailyReward(st.reward);
    setDaily(todayStr(), st.nextStreak);
    track.dailyClaimed(st.nextStreak);
    this._pushCloudIfLogged();
    sfx.buy(); sfx.starGet();
    this._dailyClaiming = true;
    const fb = document.getElementById('daily-feedback');
    if (fb) {
      fb.className = 'shop-feedback';
      void fb.offsetWidth;
      fb.textContent = tf('daily.claimedOk', st.reward.icon, st.reward.amount, t('daily.r.' + st.reward.type));
      fb.classList.add('show', 'ok');
    }
    setTimeout(() => { this._dailyClaiming = false; this._renderDaily(); this._updateMenuProgress(); }, 200);
  }

  _applyDailyReward(r) {
    if (r.type === 'tokens') addStarTokens(r.amount);
    else if (r.type === 'livesBank') addLivesBank(r.amount);
    else addPowerup(r.type, r.amount);
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
      const thumb = makeBallThumbnail(applySkin(def, getActiveSkin()), 96);
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
      // Habilidad especial de la bola (nombre + descripción corta).
      if (def.ability) {
        const ab = document.createElement('span');
        ab.className = 'ball-ability';
        ab.innerHTML = `<b>${t('ability.' + def.ability.id + '.name')}</b> · ${t('ability.' + def.ability.id + '.desc')}`;
        card.appendChild(ab);
      }
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
    this.ball.setSkin(this._ballVisual(id));
    this._renderBallCards();
    this._updateBallPreviews();
  }

  /** Definición de bola RESUELTA con la skin activa (color/material) para los visuales. */
  _ballVisual(id = this.selectedBall) {
    return applySkin(getBall(id), getActiveSkin());
  }

  _updateBallPreviews() {
    const def = this._ballVisual();
    setThumb('menu-ball', def, 64);
    setThumb('prep-ball', def, 64);
    const baseDef = getBall(this.selectedBall);
    setText('prep-ball-name', `${tBallLabel(baseDef)} · ${tDinoName(baseDef.species)}`);
  }

  /** Cambia rápidamente a la siguiente bola sin salir de la preparación. */
  _cyclePrepBall() {
    const i = BALLS.findIndex((b) => b.id === this.selectedBall);
    const next = BALLS[(i + 1) % BALLS.length];
    this.selectedBall = next.id;
    setSelectedBall(next.id);
    this.ball.setSkin(this._ballVisual(next.id));
    this._updateBallPreviews();
  }

  _renderLevelCards() {
    const list = document.getElementById('levels-list');
    if (!list) return;
    const unlocked = getUnlocked();
    // Progreso general (estrellas totales + niveles desbloqueados).
    const totalStars = getTotalStars();
    const maxStars = LEVELS.length * 3;
    const pct = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;
    const pf = document.getElementById('levels-progress-fill');
    if (pf) pf.style.width = pct + '%';
    setText('levels-progress-label', tf('levels.progress', totalStars, maxStars, unlocked, LEVELS.length));

    list.innerHTML = '';
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
        const num = i + 1;
        const locked = num > unlocked;
        const stars = getStars(lvl.id);
        const done = stars > 0;
        const boss = bossFor(num);
        const ta = timeAttackFor(num);
        const btn = document.createElement('button');
        btn.className = 'level-card' + (locked ? ' locked' : '') + (done ? ' done' : '')
          + (boss ? ' is-boss' : '') + (ta ? ' is-ta' : '');
        btn.dataset.tier = lvl.tier || '';
        btn.disabled = locked;
        // Distintivo de nivel especial (jefe cada 10 / contrarreloj cada 11).
        const flag = boss
          ? '<span class="level-flag flag-boss" aria-hidden="true">👑</span>'
          : (ta ? '<span class="level-flag flag-ta" aria-hidden="true">⏳</span>' : '');
        btn.innerHTML =
          flag +
          `<span class="level-num">${num}</span>` +
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
    this._showBoardBehind = false; // sale del modal de victoria → deja de renderizar detrás
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
    // Eventos especiales del nivel (jefe / clima / contrarreloj) como avisos.
    this._renderPrepEvents(this.levelIndex + 1);
    this._updateBallPreviews();
    // Potenciadores: se eligen de nuevo para cada nivel.
    this._pendingTrapBlock = false;
    this._pendingFallShield = false;
    this._renderPrepPowerups();
    this.screens.show(SCREENS.PREP);
  }

  /** Pinta los avisos de eventos especiales del nivel en la preparación (chips). */
  _renderPrepEvents(levelNum) {
    const wrap = document.getElementById('prep-events');
    if (!wrap) return;
    const chips = [];
    const boss = bossFor(levelNum);
    if (boss) chips.push(`<span class="ev-chip ev-boss">${BOSS_EMOJI[boss.kind] || '🦖'} ${t(boss.nameKey)}</span>`);
    const ta = timeAttackFor(levelNum);
    if (ta) chips.push(`<span class="ev-chip ev-ta">⏳ ${tf('prep.timeAttack', ta)}</span>`);
    const wx = weatherFor(levelNum);
    if (wx) chips.push(`<span class="ev-chip ev-wx">${WEATHER_EMOJI[wx] || '🌦️'} ${t('weather.' + wx)}</span>`);
    wrap.innerHTML = chips.join(' ');
    wrap.style.display = chips.length ? 'flex' : 'none';
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
    const levelNum = this.levelIndex + 1;
    this.ball.setSkin(this._ballVisual());
    this.physics.loadLevel(lvl);

    // --- Habilidad de la bola: aplica modificadores físicos (pasivos, balanceados) ---
    const ability = getAbility(this.selectedBall);
    this.physics.setMods(ability ? ability.mods : {});
    this._coinMagnet = ability && ability.mods.coinMagnet ? ability.mods.coinMagnet : 0;
    this._guardCharges = ability && ability.mods.guard ? ability.mods.guard : 0;

    // --- Clima del nivel (visual) + empuje de viento (físico, muy leve) ---
    const wx = weatherFor(levelNum);
    weather.setWeather(wx);
    const push = windPushFor(levelNum);
    // Viento lateral, sentido alterno por nivel para variedad (constante durante el nivel).
    this.physics.setWind(push ? push * (levelNum % 2 === 0 ? 1 : -1) : 0, 0);

    // --- Jefe (cada 10 niveles): ambiente + temblores leves programados ---
    this._boss = bossFor(levelNum);
    this._bossShakeTimer = 0;

    // --- Contrarreloj (cada 11 niveles): límite de tiempo especial ---
    this._timeAttackLimit = timeAttackFor(levelNum);
    this._timeLeft = this._timeAttackLimit || 0;
    this._timeAttackBonusGiven = false;

    this.scene.resize();
    this.scene.mountLevel(lvl, this.ball.mesh);
    this.ball.reset(lvl.start.x, lvl.start.z);
    this.scene.setTilt(0, 0);

    // --- Recompensas del nivel (monedas + estrella-token cada 2 niveles) ---
    const { coins, star } = generateCollectibles(lvl, this.levelIndex);
    this._coinsAvailableThisLevel = coins.length;
    this._collect = [
      ...coins.map((c) => ({ x: c.x, z: c.z, type: 'coin', taken: false })),
      ...(star ? [{ x: star.x, z: star.z, type: 'star', taken: false }] : []),
    ];
    this.scene.mountCollectibles(coins, star);
    this._coinsThisLevel = 0;
    this._starGotThisLevel = false;
    this._levelHasStar = !!star;
    this._pickupR2 = PICKUP_RADIUS * PICKUP_RADIUS;
    // Atracción Alegre (bola rosa): radio de recogida de MONEDAS ampliado un poco.
    const coinR = PICKUP_RADIUS + (this._coinMagnet || 0);
    this._coinPickupR2 = coinR * coinR;

    // Cohete del nivel (ítem visual): colocado fuera de monedas/estrella y peligros.
    const occupied = [...coins, ...(star ? [star] : [])];
    const rocket = generateRocket(lvl, this.levelIndex, occupied);
    this.scene.mountRockets(rocket ? [rocket] : []);

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
    // Contrarreloj: muestra/oculta el cronómetro especial del HUD.
    this._setTimeAttackHud();
    setThumb('hud-ball', this._ballVisual(), 34);
    setLastLevel(this.levelIndex + 1);
    track.levelStart(this.levelIndex + 1);

    // Eventos ambientales: 2 vuelos de pterodáctilo por nivel (ida y vuelta) +
    // familia Triceratops al recoger 3 monedas (rearma la bandera por nivel).
    critters.clear();
    this._pteroTimes = critters.pteroFlightTimes(lvl.par);
    this._pteroFired = [false, false];
    this._triceratopsPlayed = false;

    // Cavernícola con lanza: aparece desde el nivel 5 y cada 5 niveles (5,10,…,50).
    this._cavemanActive = false;
    this._cavemanCooldown = 0;
    if ((this.levelIndex + 1) % 5 === 0 && lvl.goal) {
      this.scene.spawnCaveman(lvl.goal, lvl.footprint, lvl.traps, lvl.portals);
      this._cavemanActive = true;
      this._cavemanCooldown = 1.4; // gracia inicial: no golpea nada más empezar
    }

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
    // Intro de jefe / contrarreloj: banner destacado; si no, la pista del nivel.
    if (this._boss) {
      this._showBossIntro(this._boss);
    } else if (this._timeAttackLimit) {
      hud.toast(tf('ta.intro', this._timeAttackLimit), 1900);
    } else {
      hud.toast(tLevelHint(lvl), 1700);
    }
    hud.hint(this.isTouch ? t('hud.hintTouch') : t('hud.hintDesktop'));
  }

  /** Banner de jefe (overlay breve, no bloquea el input). */
  _showBossIntro(boss) {
    track.bossStarted(this.levelIndex + 1, boss.kind);
    const el = document.getElementById('boss-banner');
    if (el) {
      el.innerHTML =
        `<span class="boss-emoji" aria-hidden="true">${BOSS_EMOJI[boss.kind] || '🦖'}</span>` +
        `<span class="boss-text">${t(boss.nameKey)}</span>`;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
      clearTimeout(this._bossBannerTimer);
      this._bossBannerTimer = setTimeout(() => el.classList.remove('show'), 2600);
    }
    sfx.roar();
    this.scene.shake(0.18);
    hud.flash('gold');
  }

  /** Configura el cronómetro de contrarreloj en el HUD (o lo oculta). */
  _setTimeAttackHud() {
    const el = document.getElementById('hud-timeattack');
    if (!el) return;
    if (this._timeAttackLimit) {
      el.style.display = '';
      el.classList.remove('danger');
      el.textContent = '⏳ ' + this._timeAttackLimit.toFixed(1) + 's';
    } else {
      el.style.display = 'none';
    }
  }

  /**
   * Actualiza la cuenta atrás del contrarreloj. Devuelve true si se consumió el tiempo
   * (se aplicó penalización este frame y hay que cortar el resto del step).
   */
  _updateTimeAttack(dt) {
    this._timeLeft = Math.max(0, this._timeLeft - dt);
    const el = document.getElementById('hud-timeattack');
    if (el) {
      el.textContent = '⏳ ' + this._timeLeft.toFixed(1) + 's';
      el.classList.toggle('danger', this._timeLeft <= 5);
    }
    if (this._timeLeft <= 0) {
      hud.flash('danger');
      sfx.fail();
      this.scene.shake(0.25);
      this._taunt();
      hud.toast(t('ta.timeout'), 1300);
      this._loseLife('timeout');             // pierde 1 vida/intento
      this._timeLeft = this._timeAttackLimit; // reinicia el reloj para el reintento
      this._setTimeAttackHud();
      return true;
    }
    return false;
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

    // Contrarreloj: descuenta tiempo y, si llega a 0, penaliza (pierde una vida/intento).
    if (this._timeAttackLimit && this._updateTimeAttack(dt)) return;

    // Jefe: temblores ambientales muy leves y periódicos (no afectan a la física/control).
    // Para el T-Rex (20) y el gran final (50), cada "pisotón" suena (rugido suave) y, de
    // vez en cuando, cruza un pterodáctilo → sensación de jefe sin tocar la jugabilidad.
    if (this._boss && this._boss.shake > 0) {
      this._bossShakeTimer -= dt;
      if (this._bossShakeTimer <= 0) {
        this._bossShakeTimer = 3.4 + Math.random() * 2.6;
        this.scene.shake(this._boss.shake);
        if (this._boss.kind === 'trex' || this._boss.kind === 'finale') {
          sfx.roar();
          if (Math.random() < 0.5) critters.flyPtero(Math.random() < 0.5 ? 'ltr' : 'rtl');
        }
      }
    }

    this._maybeFlyPtero();
    this._checkPickups();
    this._checkRocket();

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
    } else {
      // Cavernícola: si la bola lo toca (y no en gracia), inicia su ataque.
      if (this._cavemanCooldown > 0) this._cavemanCooldown -= dt;
      else if (this._cavemanActive) {
        const c = this.scene.cavemanPos();
        if (c && Math.hypot(c.x - this.physics.x, c.z - this.physics.z) < PHYS.BALL_RADIUS + c.r) {
          this._startCavemanAttack();
        }
      }
    }
  }

  /** Lanza los 2 vuelos ambientales de pterodáctilo (ida y vuelta) según el tiempo. */
  _maybeFlyPtero() {
    if (!this._pteroTimes) return;
    const e = this._elapsed();
    if (!this._pteroFired[0] && e >= this._pteroTimes[0]) { this._pteroFired[0] = true; critters.flyPtero('ltr'); }
    if (!this._pteroFired[1] && e >= this._pteroTimes[1]) { this._pteroFired[1] = true; critters.flyPtero('rtl'); }
  }

  /** Cohete del nivel: si la bola pasa por encima, lo lanza. Es VISUAL: no toca la física,
   *  no cambia el estado de la bola ni el flujo de victoria/derrota. No se reactiva (hitbox off). */
  _checkRocket() {
    const i = this.scene.rocketHitTest(this.physics.x, this.physics.z, PHYS.BALL_RADIUS, ROCKET_HIT_R);
    if (i < 0) return;
    const fx = this.scene.launchRocket(i);
    if (!fx) return;
    track.rocketActivated(fx.type);
    if (fx.type === 'red') {
      // Coreografía: aparece el ptero → (retardo) despega el cohete LENTO → impacto → caída.
      hud.toast(t('msg.rocketRed'), 1300);
      setTimeout(() => sfx.rocketLaunch(), 480);  // despega tras el retardo (T_DELAY≈0.5 s)
      setTimeout(() => sfx.bonk(), 2000);         // impacto cartoon (T_IMPACT≈2 s)
      setTimeout(() => sfx.whoosh(), 2150);       // caída del pterodáctilo
    } else {
      sfx.rocketLaunch();
      hud.toast(t('msg.rocket'), 1100);
      setTimeout(() => sfx.firework(), 840);      // estallido de fuegos artificiales
    }
  }

  /** Recoge monedas/estrella si la bola pasa cerca. Suma puntos/estrellas-token. */
  _checkPickups() {
    const bx = this.physics.x, bz = this.physics.z;
    for (let i = 0; i < this._collect.length; i++) {
      const c = this._collect[i];
      if (c.taken) continue;
      const dx = c.x - bx, dz = c.z - bz;
      const r2 = c.type === 'coin' ? this._coinPickupR2 : this._pickupR2;
      if (dx * dx + dz * dz > r2) continue;
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

  /** Devuelve los iconos de los poderes/habilidades activos en el nivel en curso. */
  _activePowers() {
    const p = [];
    if (this._guardCharges > 0) p.push('🛡️');           // Resistencia Rex disponible
    if (this._coinMagnet > 0) p.push('🧲');              // Atracción Alegre activa
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

  // --- Cavernícola con lanza ------------------------------------------------

  /** La bola tocó al cavernícola: se detiene, patea la bola y prepara el lanzamiento. */
  _startCavemanAttack() {
    track.cavemanHit(this.levelIndex + 1);
    this.ballState = 'caveman';
    this.scene.cavemanStartAttack();
    // Dirección de la patada: desde el cavernícola hacia fuera (la bola sale despedida).
    const c = this.scene.cavemanPos() || { x: this.physics.x, z: this.physics.z };
    let dx = this.physics.x - c.x, dz = this.physics.z - c.z;
    const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    const m = this.ball.mesh.position;
    this._cavemanSeq = {
      t: 0, flashed: false,
      x0: m.x, y0: m.y, z0: m.z,
      tx: this.physics.x + dx * 6, tz: this.physics.z + dz * 6,
    };
    this.input.reset();
    sfx.drop();            // golpe de la patada
    this.scene.shake(0.25);
    hud.toast(t('msg.cavemanHit'), 900);
  }

  /** Secuencia del cavernícola: patada (bola vuela) → giro → lanzamiento → pérdida. */
  _updateCaveman(dt) {
    const seq = this._cavemanSeq; if (!seq) { this.ballState = 'rolling'; return; }
    seq.t += dt;
    const DUR = 1.5;
    const p = Math.min(1, seq.t / DUR);
    this.scene.animateCavemanAttack(p);
    // La bola sale despedida por la patada con un pequeño arco (primera mitad).
    const kp = Math.min(1, p / 0.5);
    const e = easeOut(kp);
    const arc = Math.sin(kp * Math.PI) * 0.8;
    this.ball.mesh.position.set(lerp(seq.x0, seq.tx, e), seq.y0 + arc, lerp(seq.z0, seq.tz, e));
    // Aplana la inclinación mientras dura la escena.
    const damp = Math.min(1, 8 * dt);
    this.input.tiltX += (0 - this.input.tiltX) * damp;
    this.input.tiltZ += (0 - this.input.tiltZ) * damp;
    this.scene.setTilt(this.input.tiltX, this.input.tiltZ);
    // Lanza hacia el jugador → destello de impacto.
    if (!seq.flashed && p >= 0.8) { seq.flashed = true; hud.flash('danger'); sfx.fail(); }
    if (p >= 1) this._cavemanResolve();
  }

  _cavemanResolve() {
    this._cavemanSeq = null;
    const lvl = getLevel(this.levelIndex);
    this.scene.cavemanEndAttack(lvl.start.x, lvl.start.z); // vuelve a patrullar, lejos del inicio
    this._cavemanCooldown = 1.4;                            // gracia tras reaparecer la bola
    this._loseLife('caveman');                              // flujo de pérdida existente
  }

  _loseLife(kind) {
    const lvl = getLevel(this.levelIndex);
    // Habilidad "Resistencia Rex" (bola blanca/T-Rex): resiste la primera pérdida del
    // nivel (no aplica al timeout del contrarreloj, para que ese modo siga teniendo reto).
    if (this._guardCharges > 0 && kind !== 'timeout') {
      this._guardCharges -= 1;
      hud.flash('gold');
      sfx.rescue();
      hud.toast(t('ability.rexGuard.proc'), 1500);
      this.physics.reset(lvl.start);
      this.ball.reset(lvl.start.x, lvl.start.z);
      this.input.reset();
      hud.setPowers(this._activePowers());
      this.ballState = 'rolling';
      return;
    }
    this.lives -= 1;
    hud.setLives(this.lives);
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
    const msg = kind === 'caveman' ? tf('msg.caveman', this.lives)
      : kind === 'fall' ? tf('msg.fell', this.lives)
      : kind === 'timeout' ? tf('ta.lifeLost', this.lives)
      : tf('msg.trap', this.lives);
    hud.toast(msg, 1300);
    this.physics.reset(lvl.start);
    this.ball.reset(lvl.start.x, lvl.start.z);
    this.input.reset();
    // Contrarreloj: cada intento dispone de la ventana completa de tiempo.
    if (this._timeAttackLimit) { this._timeLeft = this._timeAttackLimit; this._setTimeAttackHud(); }
    this.ballState = 'rolling';
  }

  _completeLevel() {
    this.playing = false;
    this.input.disable();
    weather.clear();
    const lvl = getLevel(this.levelIndex);
    const time = this._elapsed();
    const timeBonus = Math.max(0, Math.floor(lvl.par - time)) * SCORE.TIME_BONUS_PER_SEC;
    const lifeBonus = this.lives * SCORE.LIFE_BONUS;
    this.score += SCORE.BASE_LEVEL + lifeBonus + timeBonus;

    // --- Estrellas de nivel (1/2/3): reglas automáticas, justas y sin objetivos por nivel ---
    //   3★ = rendimiento EXCELENTE: sin perder vidas Y bajo el tiempo objetivo (par).
    //   2★ = BUEN rendimiento: cumple al menos UNA de {sin perder vidas, bajo par, monedas}.
    //   1★ = completar el nivel.
    const lost = this._livesAtLevelStart - this.lives;
    const noLifeLost = lost <= 0;
    const underPar = time <= lvl.par;
    const coinGoal = Math.max(1, Math.ceil((this._coinsAvailableThisLevel || 0) * 0.6));
    const enoughCoins = this._coinsThisLevel >= coinGoal;
    let stars;
    if (noLifeLost && underPar) stars = 3;
    else if (noLifeLost || underPar || enoughCoins) stars = 2;
    else stars = 1;
    const prevStars = getStars(lvl.id);
    setStars(lvl.id, stars);
    setBestTime(lvl.id, time);

    // Bonus de contrarreloj: completar un nivel cronometrado da estrellas de canje extra.
    let taBonus = 0;
    if (this._timeAttackLimit) { taBonus = 2; addStarTokens(taBonus); }

    // Analítica + sincronización best-effort del progreso a la nube (si hay cuenta).
    track.levelComplete(this.levelIndex + 1, stars);
    this._pushCloudIfLogged();

    // Auto-desbloqueo de skins por estrellas acumuladas + aviso de cofre listo.
    const newSkins = this._autoUnlockStarSkins();

    const prevUnlocked = getUnlocked();
    unlockLevel(this.levelIndex + 2);
    const newUnlocked = getUnlocked();
    const isRecord = setHighScore(this.score);
    if (isRecord) sfx.record();

    const isLast = this.levelIndex >= LEVELS.length - 1;
    const levelReward = SCORE.BASE_LEVEL + lifeBonus + timeBonus; // puntos ganados ESTE nivel
    // — Modal compacto: trofeo · título corto · estrellas · 4 stats · 1 línea de bonus —
    setText('win-title', isLast ? t('win.titleDone') : t('win.titleWin'));
    // Estrellas grandes: ganadas (★ dorada) y no ganadas (☆ apagada) con clases.
    const starsEl = document.getElementById('win-stars');
    if (starsEl) {
      let html = '';
      for (let i = 0; i < 3; i++) html += i < stars ? '<span class="won">★</span>' : '<span class="dim">☆</span>';
      starsEl.innerHTML = html;
    }
    setText('win-score', `${this.score}`);
    setText('win-reward', `+${levelReward}`);
    setText('win-time', fmtTime(time));
    setText('win-progress', `${getTotalStars()}/${MAX_STARS}`);

    // Bonus: UNA línea con lo más importante (máx 2 chips; el resto se guarda en silencio).
    const bonuses = [];
    if (isRecord) bonuses.push(t('win.bRecord'));
    if (newSkins.length) bonuses.push(t('win.bSkin'));
    if (stars > prevStars) bonuses.push(tf('win.bStars', stars));
    if (taBonus > 0) bonuses.push(tf('win.bTokens', taBonus));
    if (newUnlocked > prevUnlocked && !isLast) bonuses.push(t('win.bUnlock'));
    if (getChestsAvailable() > 0) bonuses.push(t('win.bChest'));
    const shown = bonuses.slice(0, 2);
    setText('win-bonus', shown.length ? `${t('win.bonus')} ${shown.join(' · ')}` : '');
    showEl('win-bonus', shown.length > 0);

    showEl('btn-win-next', !isLast);
    this._showBoardBehind = true; // deja ver el tablero/celebración detrás del modal (dimmed)
    this.screens.show(SCREENS.WIN);
  }

  /** Desbloquea automáticamente las skins por estrellas alcanzadas. @returns {string[]} nuevas. */
  _autoUnlockStarSkins() {
    const newly = [];
    for (const id of skinsUnlockedByStars(getTotalStars())) {
      if (!ownsSkin(id)) { unlockSkin(id); newly.push(id); }
    }
    return newly;
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
    weather.clear();
    const isRecord = setHighScore(this.score);
    if (isRecord) sfx.record();
    // Modal premium: las stats van como valor en su <b> (la etiqueta la pone el HTML/i18n).
    setText('over-score', this.score);
    setText('over-level', `${this.levelIndex + 1}/${LEVELS.length}`);
    setText('over-high', getHighScore());
    showEl('over-record', isRecord);
    renderMonkeyInto(document.getElementById('over-monkey'), 118);
    this._renderReviveBox();
    this.screens.show(SCREENS.GAMEOVER);
  }

  _renderReviveBox() {
    const bank = getLivesBank();
    const cont = document.getElementById('btn-over-continue');
    if (cont) {
      // "Continuar" solo aparece si hay vidas REALES en el banco interno (recurso de juego,
      // sin dinero real). Vídeo/compra simulados quedan ocultos en .over-sim[hidden].
      cont.style.display = bank > 0 ? '' : 'none';
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
    this._showBoardBehind = false;
    this.input.disable();
    this.scene.clearBoard();
    this._showMenu();
  }

  /** Salir de la partida e ir directo a la Tienda de Canje. */
  _quitToShop() {
    this.playing = false;
    this.paused = false;
    this._showBoardBehind = false;
    this.input.disable();
    this.scene.clearBoard();
    critters.clear();
    weather.clear();
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
      // Se renderiza también con _showBoardBehind: el modal de victoria deja ver el tablero
      // (y la celebración del dino) detrás, oscurecido, sin avanzar la física.
      if (this.playing || this._showBoardBehind) {
        if (this.playing && !this.paused) {
          if (this.ballState === 'rolling') this._stepPlay(dt);
          else if (this.ballState === 'celebrating') this._updateCelebration(dt);
          else if (this.ballState === 'rescuing') { /* la escena anima el ptero y mueve la bola */ }
          else if (this.ballState === 'caveman') this._updateCaveman(dt);
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

/** Formatea segundos como "m:ss.s" (p. ej. 26.2 → "0:26.2", 75.4 → "1:15.4"). */
function fmtTime(s) {
  s = Math.max(0, Number(s) || 0);
  const m = Math.floor(s / 60);
  const sec = s - m * 60;
  return `${m}:${sec.toFixed(1).padStart(4, '0')}`;
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
