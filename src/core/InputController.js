// InputController.js — Inclinación del tablero desde varias fuentes que conviven:
//   1) Joystick táctil virtual analógico (control móvil principal),
//   2) D-pad de 4 botones (control móvil robusto / alternativo),
//   3) Arrastre con puntero sobre el lienzo (ratón en desktop o dedo),
//   4) Teclado (flechas / WASD en desktop).
//
// Patrón robusto (como legendary-adventures): cada control escucha SUS PROPIOS
// eventos de puntero con setPointerCapture + { passive:false } + preventDefault,
// de modo que el navegador no convierte el gesto en scroll/zoom.
//
// Prioridad: joystick > arrastre > teclas (D-pad/teclado). El knob refleja siempre
// la inclinación actual.
//
// Mapeo (coherente con BallPhysics):
//   Derecha → +x → tiltZ negativo   ·   Izquierda → -x → tiltZ positivo
//   Arriba (lejos, -z) → tiltX negativo   ·   Abajo (cerca, +z) → tiltX positivo

import { PHYS } from '../utils/constants.js';

const OPT = { passive: false };

export class InputController {
  constructor(canvasEl, joystickEl, knobEl, dpadEl) {
    this.canvasEl = canvasEl;
    this.joystickEl = joystickEl || null;
    this.knobEl = knobEl || null;
    this.dpadEl = dpadEl || null;

    this.tiltX = 0;
    this.tiltZ = 0;
    this.keys = { up: false, down: false, left: false, right: false };

    // Arrastre
    this.dragging = false; this._dragId = null; this._dragTouch = false;
    this._sx = 0; this._sy = 0; this._dragX = 0; this._dragZ = 0;

    // Joystick
    this.joyActive = false; this._joyId = null;
    this._joyCx = 0; this._joyCy = 0; this._joyR = 42;
    this._joyX = 0; this._joyZ = 0; this._knobPx = 0; this._knobPy = 0;

    this._enabled = false;
    this._dpadBound = [];

    this._onKeyDown = (e) => this._key(e, true);
    this._onKeyUp = (e) => this._key(e, false);
    this._cDown = (e) => this._dragDown(e);
    this._cMove = (e) => this._dragMove(e);
    this._cUp = (e) => this._dragUp(e);
    this._jDown = (e) => this._joyDown(e);
    this._jMove = (e) => this._joyMove(e);
    this._jUp = (e) => this._joyUp(e);
  }

  enable() {
    if (this._enabled) return;
    this._enabled = true;
    this._measure();
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    // Arrastre: el lienzo captura su propio puntero.
    this.canvasEl.addEventListener('pointerdown', this._cDown, OPT);
    this.canvasEl.addEventListener('pointermove', this._cMove, OPT);
    this.canvasEl.addEventListener('pointerup', this._cUp, OPT);
    this.canvasEl.addEventListener('pointercancel', this._cUp, OPT);
    // Joystick: escucha en su propio elemento (con captura).
    if (this.joystickEl) {
      this.joystickEl.addEventListener('pointerdown', this._jDown, OPT);
      this.joystickEl.addEventListener('pointermove', this._jMove, OPT);
      this.joystickEl.addEventListener('pointerup', this._jUp, OPT);
      this.joystickEl.addEventListener('pointercancel', this._jUp, OPT);
    }
    this._wireDpad();
    this._renderKnob();
  }

  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvasEl.removeEventListener('pointerdown', this._cDown, OPT);
    this.canvasEl.removeEventListener('pointermove', this._cMove, OPT);
    this.canvasEl.removeEventListener('pointerup', this._cUp, OPT);
    this.canvasEl.removeEventListener('pointercancel', this._cUp, OPT);
    if (this.joystickEl) {
      this.joystickEl.removeEventListener('pointerdown', this._jDown, OPT);
      this.joystickEl.removeEventListener('pointermove', this._jMove, OPT);
      this.joystickEl.removeEventListener('pointerup', this._jUp, OPT);
      this.joystickEl.removeEventListener('pointercancel', this._jUp, OPT);
    }
    this._unwireDpad();
    this.reset();
  }

  reset() {
    this.tiltX = 0; this.tiltZ = 0;
    this.keys = { up: false, down: false, left: false, right: false };
    this.dragging = false; this._dragId = null;
    this.joyActive = false; this._joyId = null;
    this._dragX = 0; this._dragZ = 0; this._joyX = 0; this._joyZ = 0;
    this._knobPx = 0; this._knobPy = 0;
    if (this.joystickEl) this.joystickEl.classList.remove('active');
    if (this.dpadEl) this.dpadEl.querySelectorAll('.pressed').forEach((b) => b.classList.remove('pressed'));
    this._renderKnob();
  }

  _measure() {
    if (this.joystickEl) this._joyR = (this.joystickEl.clientWidth || 120) * 0.36;
  }

  refresh() { this._measure(); this._renderKnob(); }

  // --- Teclado --------------------------------------------------------------
  _key(e, down) {
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': this.keys.up = down; break;
      case 'ArrowDown': case 's': case 'S': this.keys.down = down; break;
      case 'ArrowLeft': case 'a': case 'A': this.keys.left = down; break;
      case 'ArrowRight': case 'd': case 'D': this.keys.right = down; break;
      default: return;
    }
    e.preventDefault();
  }

  // --- D-pad (4 botones digitales) -----------------------------------------
  _wireDpad() {
    if (!this.dpadEl) return;
    this._dpadBound = [];
    this.dpadEl.querySelectorAll('[data-dir]').forEach((btn) => {
      const dir = btn.dataset.dir;
      const down = (e) => {
        e.preventDefault();
        this.keys[dir] = true;
        btn.classList.add('pressed');
        try { btn.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
      };
      const up = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.keys[dir] = false;
        btn.classList.remove('pressed');
      };
      btn.addEventListener('pointerdown', down, OPT);
      btn.addEventListener('pointerup', up, OPT);
      btn.addEventListener('pointercancel', up, OPT);
      btn.addEventListener('lostpointercapture', up);
      this._dpadBound.push({ btn, down, up });
    });
  }

  _unwireDpad() {
    for (const { btn, down, up } of this._dpadBound) {
      btn.removeEventListener('pointerdown', down, OPT);
      btn.removeEventListener('pointerup', up, OPT);
      btn.removeEventListener('pointercancel', up, OPT);
      btn.removeEventListener('lostpointercapture', up);
    }
    this._dpadBound = [];
  }

  // --- Arrastre sobre el lienzo --------------------------------------------
  _dragDown(e) {
    if (this.joyActive) return;
    this.dragging = true;
    this._dragId = e.pointerId;
    this._dragTouch = e.pointerType === 'touch';
    this._sx = e.clientX; this._sy = e.clientY;
    this._dragX = 0; this._dragZ = 0;
    try { this.canvasEl.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
  }

  _dragMove(e) {
    if (!this.dragging || e.pointerId !== this._dragId) return;
    e.preventDefault();
    const dx = e.clientX - this._sx;
    const dy = e.clientY - this._sy;
    const full = this._dragTouch ? PHYS.DRAG_FULL_PX_MOBILE : PHYS.DRAG_FULL_PX_DESKTOP;
    const k = PHYS.MAX_TILT / full;
    this._dragZ = clamp(-dx * k, -PHYS.MAX_TILT, PHYS.MAX_TILT);
    this._dragX = clamp(dy * k, -PHYS.MAX_TILT, PHYS.MAX_TILT);
  }

  _dragUp(e) {
    if (e.pointerId !== this._dragId) return;
    this.dragging = false; this._dragId = null;
    this._dragX = 0; this._dragZ = 0;
  }

  // --- Joystick analógico ---------------------------------------------------
  _joyDown(e) {
    e.preventDefault();
    this.joyActive = true;
    this._joyId = e.pointerId;
    const r = this.joystickEl.getBoundingClientRect();
    this._joyCx = r.left + r.width / 2;
    this._joyCy = r.top + r.height / 2;
    this._joyR = r.width * 0.36;
    this.joystickEl.classList.add('active');
    try { this.joystickEl.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    this._joyVec(e);
  }

  _joyMove(e) {
    if (!this.joyActive || e.pointerId !== this._joyId) return;
    e.preventDefault();
    this._joyVec(e);
  }

  _joyUp(e) {
    if (e.pointerId !== this._joyId) return;
    this.joyActive = false; this._joyId = null;
    this._joyX = 0; this._joyZ = 0;
    if (this.joystickEl) this.joystickEl.classList.remove('active');
  }

  _joyVec(e) {
    let dx = e.clientX - this._joyCx;
    let dy = e.clientY - this._joyCy;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > this._joyR) { dx = (dx / dist) * this._joyR; dy = (dy / dist) * this._joyR; }
    const nx = dx / this._joyR;
    const ny = dy / this._joyR;
    this._joyZ = clamp(-nx * PHYS.MAX_TILT, -PHYS.MAX_TILT, PHYS.MAX_TILT);
    this._joyX = clamp(ny * PHYS.MAX_TILT, -PHYS.MAX_TILT, PHYS.MAX_TILT);
    this._knobPx = dx; this._knobPy = dy;
  }

  /** Avanza el suavizado de la inclinación hacia el objetivo del input activo. */
  update(dt) {
    let targetX, targetZ;
    if (this.joyActive) {
      targetX = this._joyX; targetZ = this._joyZ;
    } else if (this.dragging) {
      targetX = this._dragX; targetZ = this._dragZ;
    } else {
      targetX = ((this.keys.down ? 1 : 0) + (this.keys.up ? -1 : 0)) * PHYS.MAX_TILT;
      targetZ = ((this.keys.left ? 1 : 0) + (this.keys.right ? -1 : 0)) * PHYS.MAX_TILT;
    }
    const a = Math.min(1, PHYS.TILT_LERP * dt);
    this.tiltX += (targetX - this.tiltX) * a;
    this.tiltZ += (targetZ - this.tiltZ) * a;
    this._renderKnob();
  }

  _renderKnob() {
    if (!this.knobEl) return;
    let px, py;
    if (this.joyActive) {
      px = this._knobPx; py = this._knobPy;
    } else {
      px = (-this.tiltZ / PHYS.MAX_TILT) * this._joyR;
      py = (this.tiltX / PHYS.MAX_TILT) * this._joyR;
    }
    this.knobEl.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
