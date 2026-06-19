// Game.js — Orquestador central de TREXoRoll.
// Conecta escena 3D, física, input, pantallas, HUD, audio, bolas y progresión.

import { SceneManager } from '../scene/SceneManager.js';
import { Ball } from '../scene/Ball.js';
import { BallPhysics } from '../physics/BallPhysics.js';
import { InputController } from './InputController.js';
import { ScreenManager } from './ScreenManager.js';
import { LEVELS, getLevel } from '../levels/levels.js';
import { BALLS, getBall } from '../data/balls.js';
import { getDino } from '../data/dinos.js';
import { SCREENS, LIVES_START, SCORE } from '../utils/constants.js';
import * as hud from '../ui/hud.js';
import { sfx } from '../effects/sfx.js';
import { makeBallThumbnail } from '../scene/textures.js';
import {
  getHighScore, setHighScore, getUnlocked, unlockLevel,
  getStars, setStars, getTotalStars, getBestTime, setBestTime,
  getSelectedBall, setSelectedBall, setLastLevel,
} from '../utils/storage.js';

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
    click('btn-play', () => this._newRun());
    click('btn-balls', () => this._showBalls());
    click('btn-balls-back', () => this._showMenu());
    click('btn-levels', () => this._showLevels());
    click('btn-howto', () => this.screens.show(SCREENS.HOWTO));
    click('btn-sound', () => this._toggleSound());
    click('btn-fullscreen', () => this._toggleFullscreen());

    click('btn-prep-start', () => this._startLevel());
    click('btn-prep-ball', () => this._cyclePrepBall());
    click('btn-prep-back', () => this._showMenu());
    click('btn-howto-back', () => this._showMenu());
    click('btn-levels-back', () => this._showMenu());

    click('btn-pause', () => this._pause());
    click('btn-resume', () => this._resume());
    click('btn-restart', () => this._restartLevel());
    click('btn-pause-menu', () => this._quitToMenu());

    click('btn-win-next', () => this._onWinNext());
    click('btn-win-menu', () => this._quitToMenu());
    click('btn-over-retry', () => this._onRetry());
    click('btn-over-menu', () => this._quitToMenu());
  }

  _showMenu() {
    this.playing = false;
    this.paused = false;
    this.input.disable();
    this.scene.clearBoard();
    this._updateHighScoreLabels();
    this._updateBallPreviews();
    this.screens.show(SCREENS.MENU);
  }

  _showLevels() {
    this._renderLevelCards();
    this.screens.show(SCREENS.LEVELS);
  }

  _toggleSound() {
    this.muted = !this.muted;
    sfx.setMuted(this.muted);
    const btn = document.getElementById('btn-sound');
    if (btn) btn.textContent = this.muted ? '🔇 Sonido: OFF' : '🔊 Sonido: ON';
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
      name.textContent = def.name;
      card.appendChild(name);
      const dino = document.createElement('span');
      dino.className = 'ball-dino';
      dino.textContent = getDino(def.species).name;
      card.appendChild(dino);
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
    setText('prep-ball-name', `${def.name} · ${getDino(def.species).name}`);
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
    LEVELS.forEach((lvl, i) => {
      const locked = i + 1 > unlocked;
      const stars = getStars(lvl.id);
      const btn = document.createElement('button');
      btn.className = 'level-card' + (locked ? ' locked' : '');
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
      list.appendChild(btn);
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
    setText('prep-level', `Nivel ${this.levelIndex + 1}: ${lvl.name}`);
    setText('prep-tier', lvl.tier || '');
    setText('prep-lives', '🥚'.repeat(this.lives));
    setText('prep-objective', lvl.hint);
    this._updateBallPreviews();
    this.screens.show(SCREENS.PREP);
  }

  _startLevel() {
    const lvl = getLevel(this.levelIndex);
    this.ball.setSkin(getBall(this.selectedBall));
    this.physics.loadLevel(lvl);
    this.scene.resize();
    this.scene.mountLevel(lvl, this.ball.mesh);
    this.ball.reset(lvl.start.x, lvl.start.z);
    this.scene.setTilt(0, 0);

    hud.setLevel(lvl.name, this.levelIndex + 1, LEVELS.length);
    hud.setLives(this.lives);
    hud.setScore(this.score);
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
    hud.hint(this.isTouch ? '🕹️ Joystick (derecha) o flechas (izquierda) para inclinar' : 'Inclina: flechas/WASD o arrastra el tablero');
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

    if (ev === 'goal') this._startResolve('goal');
    else if (ev === 'trap') this._startResolve('trap');
    else if (ev === 'fall') this._startResolve('fall');
  }

  _startResolve(kind) {
    const p = this.ball.mesh.position;
    let toX = p.x, toZ = p.z, toY = -6;
    if (kind === 'goal') {
      toX = this.physics.goal.x; toZ = this.physics.goal.z; toY = -0.5;
    } else if (kind === 'trap') {
      const t = this._nearestTrap(); toX = t.x; toZ = t.z; toY = -0.5;
      sfx.drop(); this.scene.shake(0.3); hud.flash('danger');
    } else {
      sfx.fail(); this.scene.shake(0.3); hud.flash('danger');
    }
    this._anim = {
      kind, t: 0, dur: kind === 'fall' ? 0.6 : 0.55,
      fromX: p.x, fromY: p.y, fromZ: p.z, toX, toY, toZ,
    };
    this.ballState = kind === 'goal' ? 'sinking-goal' : kind === 'trap' ? 'sinking-trap' : 'falling';
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
    this.scene.spawnCelebration(this.physics.goal.x, this.physics.goal.z, this.ball.ballDef);
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
    if (this.lives <= 0) { this._gameOver(); return; }
    hud.toast(kind === 'fall' ? `¡Caíste! Intentos: ${this.lives}` : `¡Trampa! Intentos: ${this.lives}`, 1300);
    const lvl = getLevel(this.levelIndex);
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
    unlockLevel(this.levelIndex + 2);
    const isRecord = setHighScore(this.score);
    if (isRecord) sfx.record();

    const isLast = this.levelIndex >= LEVELS.length - 1;
    setText('win-title', isLast ? '🏆 ¡Juego completado!' : '¡Nivel superado!');
    setText('win-stars', starString(stars));
    setText('win-score', `Puntos: ${this.score}`);
    setText('win-detail', `+${SCORE.BASE_LEVEL} nivel  ·  +${lifeBonus} vidas  ·  +${timeBonus} tiempo`);
    setText('win-time', `Tiempo: ${time.toFixed(1)}s  ·  Mejor: ${(getBestTime(lvl.id) ?? time).toFixed(1)}s`);
    setText('win-progress', `Progreso: ${this.levelIndex + 1}/${LEVELS.length}  ·  ⭐ ${getTotalStars()}/${MAX_STARS}`);
    showEl('win-record', isRecord);
    showEl('btn-win-next', !isLast);
    this.screens.show(SCREENS.WIN);
  }

  _onWinNext() {
    if (this.levelIndex >= LEVELS.length - 1) { this._quitToMenu(); return; }
    this.levelIndex += 1;
    this._showPrep();
  }

  _gameOver() {
    this.playing = false;
    this.input.disable();
    const isRecord = setHighScore(this.score);
    if (isRecord) sfx.record();
    setText('over-score', `Puntos: ${this.score}`);
    setText('over-high', `Mejor: ${getHighScore()}`);
    showEl('over-record', isRecord);
    this.screens.show(SCREENS.GAMEOVER);
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

  // --- Bucle principal ------------------------------------------------------
  _loop(now) {
    const dt = Math.min((now - this._last) / 1000 || 0, 0.05);
    this._last = now;
    if (this.playing) {
      if (!this.paused) {
        if (this.ballState === 'rolling') this._stepPlay(dt);
        else if (this.ballState === 'celebrating') this._updateCelebration(dt);
        else this._updateAnim(dt);
      }
      this.scene.update(dt);
      this.scene.render();
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
