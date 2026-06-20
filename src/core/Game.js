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
import { makeBallThumbnail } from '../scene/textures.js';
import {
  getHighScore, setHighScore, getUnlocked, unlockLevel,
  getStars, setStars, getTotalStars, getBestTime, setBestTime,
  getSelectedBall, setSelectedBall, setLastLevel, getLastLevel,
  getStarTokens, addStarTokens, getInventory, buyPowerup, consumePowerup,
  getLivesBank, addLivesBank, takeFromLivesBank,
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

// Mundos: agrupan los 25 niveles en 5 bloques de 5 (progresión visual).
const WORLDS = [
  { name: 'Valle Jurásico',   emoji: '🌿' },
  { name: 'Pantano Raptor',   emoji: '🐊' },
  { name: 'Cráter Volcánico', emoji: '🌋' },
  { name: 'Ruinas Fósiles',   emoji: '🦴' },
  { name: 'Isla TREXo',       emoji: '🏝️' },
];
const worldOf = (index) => WORLDS[Math.min(WORLDS.length - 1, Math.floor(index / 5))];
const worldNum = (index) => Math.min(WORLDS.length, Math.floor(index / 5) + 1);

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
    this.muted = false;

    // Recompensas dentro del nivel + potenciadores activados en preparación.
    this._collect = [];            // [{x,z,type,taken}] alineado con la escena
    this._coinsThisLevel = 0;
    this._fallShieldActive = false; // escudo armado para el nivel en curso
    this._pendingTrapBlock = false; // activar bloqueo de trampa al empezar
    this._pendingFallShield = false;// armar escudo de caída al empezar

    this._wireUI();
    window.addEventListener('resize', () => { this.scene.resize(); this.input.refresh(); });
    // Al rotar el móvil el layout tarda un instante en estabilizarse.
    window.addEventListener('orientationchange', () => setTimeout(() => { this.scene.resize(); this.input.refresh(); }, 200));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.playing) { e.preventDefault(); this._togglePause(); }
      }
    });
    this._loop = this._loop.bind(this);
  }

  start() {
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this.screens.show(SCREENS.LANDING);
    requestAnimationFrame(this._loop);
  }

  // --- Cableado de la interfaz ---------------------------------------------
  _wireUI() {
    const click = (id, fn) => this.screens.onClick(id, () => { sfx.click(); fn(); });

    click('btn-enter', () => this._showMenu());
    click('btn-continue', () => this._continueRun());
    click('btn-play', () => this._newRun());
    click('btn-balls', () => this._showBalls());
    click('btn-balls-back', () => this._showMenu());
    click('btn-shop', () => this._showShop());
    click('btn-shop-back', () => this._showMenu());
    click('btn-levels', () => this._showLevels());
    click('btn-howto', () => this.screens.show(SCREENS.HOWTO));
    click('btn-sound', () => this._toggleSound());
    click('btn-fullscreen', () => this._toggleFullscreen());

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
    click('btn-pause-sound', () => this._toggleSound());
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
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this._updateMenuProgress();
    // Llegamos aquí tras pulsar "Entrar" (gesto del usuario): podemos arrancar la
    // música de fondo respetando las restricciones de autoplay del navegador.
    if (!music.isPlaying()) music.start();
    music.setMuted(this.muted);
    this.screens.show(SCREENS.MENU);
  }

  /** Barra de progreso + botón "Continuar" en el menú (solo si hay progreso). */
  _updateMenuProgress() {
    const unlocked = Math.min(getUnlocked(), LEVELS.length);
    const total = getTotalStars();
    const pct = Math.round((total / MAX_STARS) * 100);
    const fill = document.getElementById('menu-progress-fill');
    if (fill) fill.style.width = pct + '%';
    setText('menu-progress-label', `⭐ ${total}/${MAX_STARS}  ·  Nivel ${unlocked}/${LEVELS.length} desbloqueado`);
    const hasProgress = unlocked > 1 || getLastLevel() > 1 || total > 0;
    const cont = document.getElementById('btn-continue');
    if (cont) cont.style.display = hasProgress ? 'block' : 'none';
    const shopBtn = document.getElementById('btn-shop');
    if (shopBtn) shopBtn.textContent = `🛒 Canje · ⭐ ${getStarTokens()}`;
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

  _toggleSound() {
    this.muted = !this.muted;
    sfx.setMuted(this.muted);
    music.setMuted(this.muted);
    if (!this.muted && !music.isPlaying()) music.start();
    const label = this.muted ? '🔇 Sonido: OFF' : '🔊 Sonido: ON';
    for (const id of ['btn-sound', 'btn-pause-sound']) {
      const btn = document.getElementById(id);
      if (btn) btn.textContent = label;
    }
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
      if (el) el.textContent = `Mejor: ${hs}  ·  ⭐ ${stars}/${MAX_STARS}`;
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
            `<span class="shop-name">${item.name}</span>` +
            `<span class="shop-desc">${item.desc}</span>` +
            `<span class="shop-owned">Tienes: <b>${owned}</b></span>` +
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
      fb.textContent = bought ? `✅ ¡${item.name} comprado!` : `❌ Te faltan estrellas (necesitas ⭐ ${item.cost}).`;
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
      name.textContent = def.label || def.name;
      card.appendChild(name);
      const dino = document.createElement('span');
      dino.className = 'ball-dino';
      dino.textContent = `${getDino(def.species).name} · ${def.name}`;
      card.appendChild(dino);
      if (def.blurb) {
        const blurb = document.createElement('span');
        blurb.className = 'ball-blurb';
        blurb.textContent = def.blurb;
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
    setText('prep-ball-name', `${def.label || def.name} · ${getDino(def.species).name}`);
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
        `<span class="world-name">Mundo ${w + 1} · ${world.name}</span>` +
        `<span class="world-stars">${worldUnlocked ? `⭐ ${earned}/${max}` : '🔒'}</span>`;
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
          `<span class="level-card-name">${lvl.name}</span>` +
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
    setText('prep-world', `${w.emoji} Mundo ${worldNum(this.levelIndex)} · ${w.name}`);
    setText('prep-level', `Nivel ${this.levelIndex + 1}: ${lvl.name}`);
    setText('prep-tier', lvl.tier || '');
    const tierEl = document.getElementById('prep-tier');
    if (tierEl) tierEl.dataset.tier = lvl.tier || '';
    setText('prep-lives', '🥚'.repeat(this.lives));
    setText('prep-objective', lvl.hint);
    // Recompensas disponibles en este nivel (monedas + estrella si toca).
    const { coins, star } = generateCollectibles(lvl, this.levelIndex);
    setText('prep-rewards', `🪙 ${coins.length} monedas${star ? '   ·   ⭐ ¡Estrella especial aquí!' : ''}`);
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
      tb.textContent = `🪨 Bloqueo (${inv.trapBlocks})`;
    }
    const fs = document.getElementById('btn-prep-shield');
    if (fs) {
      fs.style.display = inv.fallShields > 0 ? 'inline-flex' : 'none';
      fs.classList.toggle('active', this._pendingFallShield);
      fs.textContent = `🦅 Escudo (${inv.fallShields})`;
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
        hud.toast('🪨 Trampa bloqueada', 1400);
      }
    }
    if (this._pendingFallShield && consumePowerup('fallShields')) {
      this._fallShieldActive = true;
      hud.toast('🦅 Escudo de caída activo', 1400);
    }
    this._pendingTrapBlock = false;
    this._pendingFallShield = false;

    hud.setLevel(lvl.name, this.levelIndex + 1, LEVELS.length);
    hud.setLives(this.lives);
    hud.setScore(this.score);
    hud.setCoins(0);
    hud.setPowers(this._activePowers());
    hud.setTime(0);
    setThumb('hud-ball', getBall(this.selectedBall), 34);
    setLastLevel(this.levelIndex + 1);

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
    hud.toast(lvl.hint, 1700);
    hud.hint(this.isTouch ? '🎮 D-pad (izquierda) o joystick (derecha) para inclinar el tablero' : 'Inclina: flechas/WASD o arrastra el tablero con el ratón');
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
    setText('pause-level', `Nivel ${this.levelIndex + 1} · ${getLevel(this.levelIndex).name}`);
    setText('pause-lives', '🥚'.repeat(Math.max(0, this.lives)) || '—');
    const ps = document.getElementById('pause-score');
    if (ps) ps.innerHTML = `<b>${this.score}</b> pts`;
    const powers = this._activePowers();
    setText('pause-powers', powers.length ? `Poderes activos: ${powers.join('  ')}` : '');
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

    this._checkPickups();

    if (ev === 'goal') this._startResolve('goal');
    else if (ev === 'trap') this._startResolve('trap');
    else if (ev === 'fall') {
      if (this._fallShieldActive) this._startRescue();
      else this._startResolve('fall');
    }
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
        hud.toast('⭐ ¡Estrella de canje! +1 (para la tienda)', 1500);
      } else {
        this.score += COIN_POINTS; // 1 punto por moneda
        this._coinsThisLevel += 1;
        this._popPoints(c.x, c.z, `+${COIN_POINTS}`, 'coin');
        sfx.coin();
        hud.setCoins(this._coinsThisLevel);
        hud.setScore(this.score);
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
    hud.toast('🦅 ¡Rescate jurásico! El escudo te salvó', 1700);
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
    hud.toast('¡Nivel completado!', 1500);
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
        hud.toast('🥚 ¡Vida extra! Sigues en juego', 1500);
        this.physics.reset(lvl.start);
        this.ball.reset(lvl.start.x, lvl.start.z);
        this.input.reset();
        this.ballState = 'rolling';
        return;
      }
      this._noLives();
      return;
    }
    hud.toast(kind === 'fall' ? `¡Caíste! Intentos: ${this.lives}` : `¡Trampa! Intentos: ${this.lives}`, 1300);
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
    setText('win-title', isLast ? '🏆 ¡Juego completado!' : '¡Nivel superado!');
    setText('win-stars', starString(stars));
    setText('win-score', `Puntos: ${this.score}`);
    setText('win-detail', `+${SCORE.BASE_LEVEL} nivel  ·  +${lifeBonus} vidas  ·  +${timeBonus} tiempo`);
    // Recap de recompensas recogidas este nivel.
    const starTxt = this._starGotThisLevel ? '   ·   ⭐ estrella de canje' : (this._levelHasStar ? '   ·   ⭐ estrella perdida' : '');
    setText('win-rewards', `Recogido: 🪙 ${this._coinsThisLevel}${starTxt}`);
    setText('win-time', `Tiempo: ${time.toFixed(1)}s  ·  Mejor: ${(getBestTime(lvl.id) ?? time).toFixed(1)}s`);
    setText('win-progress', `Progreso: ${this.levelIndex + 1}/${LEVELS.length}  ·  ⭐ ${getTotalStars()}/${MAX_STARS}`);
    // Mensaje de desbloqueo (si este nivel abrió uno nuevo).
    const unlockedNew = newUnlocked > prevUnlocked && !isLast;
    if (unlockedNew) setText('win-unlock', `🔓 ¡Nivel ${Math.min(newUnlocked, LEVELS.length)} desbloqueado!`);
    showEl('win-unlock', unlockedNew);
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
    setText('over-score', `Puntos: ${this.score}`);
    setText('over-level', `Nivel alcanzado: ${this.levelIndex + 1}/${LEVELS.length}`);
    setText('over-high', `Mejor: ${getHighScore()}`);
    showEl('over-record', isRecord);
    this._renderReviveBox();
    this.screens.show(SCREENS.GAMEOVER);
  }

  _renderReviveBox() {
    const bank = getLivesBank();
    const cont = document.getElementById('btn-over-continue');
    if (cont) {
      cont.style.display = bank > 0 ? 'block' : 'none';
      cont.textContent = `⏩ Continuar · banco: ${bank}`;
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
    setText('ad-countdown', `Recompensa en ${n}…`);
    clearInterval(this._adTimer);
    this._adTimer = setInterval(() => {
      n -= 1;
      if (n > 0) { setText('ad-countdown', `Recompensa en ${n}…`); return; }
      clearInterval(this._adTimer);
      setText('ad-countdown', `🎁 ¡+${REVIVE_LIVES} vidas!`);
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
    setText('lifepacks-bank', `Banco de vidas: ${getLivesBank()}`);
    const list = document.getElementById('lifepacks-list');
    if (list) {
      list.innerHTML = '';
      for (const p of LIFE_PACKS) {
        const card = document.createElement('div');
        card.className = 'pack-card';
        card.innerHTML =
          `<div class="pack-lives" aria-hidden="true">❤️<b>${p.lives}</b></div>` +
          '<div class="pack-info">' +
            `<span class="pack-name">${p.lives} vidas</span>` +
            (p.tag ? `<span class="pack-tag">${p.tag}</span>` : '<span class="pack-sub">para tu banco</span>') +
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
      fb.textContent = `✅ +${n} vidas a tu banco (simulado)`;
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
    if (!music.isPlaying()) music.start();
    music.setMuted(this.muted);
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
