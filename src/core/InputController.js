// InputController.js — Convierte teclado y gestos táctiles en una inclinación del
// tablero. Unifica desktop (flechas/WASD + arrastre con ratón) y móvil (arrastre).
//
// Mapeo (coherente con la física de BallPhysics):
//   Derecha → la bola va a +x  → tiltZ negativo
//   Izquierda → -x             → tiltZ positivo
//   Arriba (lejos, -z)         → tiltX negativo
//   Abajo (cerca, +z)          → tiltX positivo

import { PHYS } from '../utils/constants.js';

const DRAG_FULL_PX = 110; // píxeles de arrastre para inclinación máxima

export class InputController {
  constructor(targetEl) {
    this.targetEl = targetEl;
    this.tiltX = 0;
    this.tiltZ = 0;
    this.keys = { up: false, down: false, left: false, right: false };
    this.dragging = false;
    this._dragX = 0;
    this._dragZ = 0;
    this._startX = 0;
    this._startY = 0;
    this._pointerId = null;
    this._enabled = false;

    this._onKeyDown = (e) => this._key(e, true);
    this._onKeyUp = (e) => this._key(e, false);
    this._onPointerDown = (e) => this._pointerDown(e);
    this._onPointerMove = (e) => this._pointerMove(e);
    this._onPointerUp = (e) => this._pointerUp(e);
  }

  enable() {
    if (this._enabled) return;
    this._enabled = true;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.targetEl.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
  }

  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.targetEl.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
    this.reset();
  }

  reset() {
    this.tiltX = 0;
    this.tiltZ = 0;
    this.keys = { up: false, down: false, left: false, right: false };
    this.dragging = false;
    this._dragX = 0;
    this._dragZ = 0;
  }

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

  _pointerDown(e) {
    this.dragging = true;
    this._pointerId = e.pointerId;
    this._startX = e.clientX;
    this._startY = e.clientY;
    this._dragX = 0;
    this._dragZ = 0;
    if (this.targetEl.setPointerCapture) {
      try { this.targetEl.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    }
  }

  _pointerMove(e) {
    if (!this.dragging || e.pointerId !== this._pointerId) return;
    const dx = e.clientX - this._startX;
    const dy = e.clientY - this._startY;
    const k = PHYS.MAX_TILT / DRAG_FULL_PX;
    this._dragZ = clamp(-dx * k, -PHYS.MAX_TILT, PHYS.MAX_TILT);
    this._dragX = clamp(dy * k, -PHYS.MAX_TILT, PHYS.MAX_TILT);
  }

  _pointerUp(e) {
    if (e.pointerId !== this._pointerId) return;
    this.dragging = false;
    this._pointerId = null;
    this._dragX = 0;
    this._dragZ = 0;
  }

  /** Avanza el suavizado de la inclinación hacia el objetivo del input. */
  update(dt) {
    let targetX, targetZ;
    if (this.dragging) {
      targetX = this._dragX;
      targetZ = this._dragZ;
    } else {
      targetX = ((this.keys.down ? 1 : 0) + (this.keys.up ? -1 : 0)) * PHYS.MAX_TILT;
      targetZ = ((this.keys.left ? 1 : 0) + (this.keys.right ? -1 : 0)) * PHYS.MAX_TILT;
    }
    const a = Math.min(1, PHYS.TILT_LERP * dt);
    this.tiltX += (targetX - this.tiltX) * a;
    this.tiltZ += (targetZ - this.tiltZ) * a;
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
