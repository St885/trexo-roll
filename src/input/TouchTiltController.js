// TouchTiltController.js — Control TÁCTIL PRINCIPAL en móvil (v0.25.3).
// El jugador arrastra el dedo sobre el ÁREA DE JUEGO (lienzo) para inclinar el tablero: el
// desplazamiento del dedo define la inclinación objetivo y, al soltar, el tablero vuelve
// suavemente al centro. Pensado para Android WebView / Capacitor.
//
// Diseño robusto:
//  - Pointer Events (pointerdown/move/up/cancel) con { passive:false } + preventDefault, para
//    que el navegador NO convierta el gesto en scroll/zoom (junto al touch-action:none del CSS).
//  - Multitouch SEGURO: solo sigue el PRIMER pointer activo; ignora pointers extra.
//  - Zona muerta (deadzone) para evitar inclinaciones por microarrastres involuntarios.
//  - Suavizado (lerp) mientras se arrastra + retorno al centro al soltar.
//  - Ignora los botones de UI SIN esfuerzo: el CSS deja #screen-game con pointer-events:none
//    salvo los botones/joystick (pointer-events:auto), así el toque sobre pausa/HUD/joystick
//    NO llega al lienzo y no mueve el tablero.
//  - Funciona en horizontal y vertical (trabaja con desplazamientos en px de pantalla).
//
// Mapeo (coherente con BallPhysics e InputController):
//   arrastrar DERECHA (+dx) → la bola rueda a +x → tiltZ NEGATIVO
//   arrastrar ABAJO   (+dy) → la bola rueda a +z (hacia la cámara) → tiltX POSITIVO

import { PHYS, TOUCH_TILT } from '../utils/constants.js';
import { countPointerMove } from '../utils/perf.js';

const OPT = { passive: false };

export class TouchTiltController {
  /**
   * @param {HTMLElement} targetEl  elemento del área de juego (renderer.domElement)
   * @param {object} [opts]  { maxTilt, sensitivity, deadzone, returnSpeed, smoothing, fullPx, onFirstDrag }
   */
  constructor(targetEl, opts = {}) {
    this.el = targetEl;
    this.maxTilt = opts.maxTilt != null ? opts.maxTilt : PHYS.MAX_TILT;
    this.sensitivity = opts.sensitivity != null ? opts.sensitivity : TOUCH_TILT.SENSITIVITY;
    this.deadzone = opts.deadzone != null ? opts.deadzone : TOUCH_TILT.DEADZONE;
    this.returnSpeed = opts.returnSpeed != null ? opts.returnSpeed : TOUCH_TILT.RETURN_SPEED;
    this.smoothing = opts.smoothing != null ? opts.smoothing : TOUCH_TILT.SMOOTHING;
    this.fullPx = opts.fullPx != null ? opts.fullPx : TOUCH_TILT.FULL_PX;
    this._onFirstDrag = opts.onFirstDrag || null;
    this.onDragStart = opts.onDragStart || null; // feedback visual: empieza el arrastre
    this.onDragEnd = opts.onDragEnd || null;     // feedback visual: se suelta el dedo

    this.tiltX = 0; this.tiltZ = 0;       // inclinación SUAVIZADA (salida hacia la física)
    this._targetX = 0; this._targetZ = 0; // inclinación objetivo del arrastre actual
    this.dragging = false;
    this._id = null;                       // pointerId activo (solo el primero)
    this._sx = 0; this._sy = 0;            // origen del arrastre (px)
    this._enabled = false;

    this._down = (e) => this._pointerDown(e);
    this._move = (e) => this._pointerMove(e);
    this._up = (e) => this._pointerUp(e);
  }

  enable() {
    if (this._enabled || !this.el || !this.el.addEventListener) return;
    this._enabled = true;
    this.el.addEventListener('pointerdown', this._down, OPT);
    this.el.addEventListener('pointermove', this._move, OPT);
    this.el.addEventListener('pointerup', this._up, OPT);
    this.el.addEventListener('pointercancel', this._up, OPT);
  }

  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    this.el.removeEventListener('pointerdown', this._down, OPT);
    this.el.removeEventListener('pointermove', this._move, OPT);
    this.el.removeEventListener('pointerup', this._up, OPT);
    this.el.removeEventListener('pointercancel', this._up, OPT);
    this.reset();
  }

  reset() {
    this.dragging = false; this._id = null;
    this._targetX = 0; this._targetZ = 0;
    this.tiltX = 0; this.tiltZ = 0;
  }

  /** ¿Hay arrastre activo o inclinación residual volviendo al centro? */
  isEngaged() {
    return this.dragging || Math.abs(this.tiltX) > 1e-3 || Math.abs(this.tiltZ) > 1e-3;
  }

  /** Inclinación actual (ya suavizada) para el sistema de física. */
  getTilt() { return { tiltX: this.tiltX, tiltZ: this.tiltZ }; }

  _pointerDown(e) {
    if (this.dragging) return; // ya seguimos un dedo: ignora pointers extra (multitouch seguro)
    this.dragging = true;
    this._id = e.pointerId;
    this._sx = e.clientX; this._sy = e.clientY;
    this._targetX = 0; this._targetZ = 0;
    try { this.el.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    if (this._onFirstDrag) { try { this._onFirstDrag(); } catch (_) { /* noop */ } this._onFirstDrag = null; }
    if (this.onDragStart) { try { this.onDragStart(); } catch (_) { /* noop */ } }
    if (e.preventDefault) e.preventDefault();
  }

  _pointerMove(e) {
    if (!this.dragging || e.pointerId !== this._id) return;
    countPointerMove(); // instrumentación (coste cero si DEBUG_PERFORMANCE=false)
    if (e.preventDefault) e.preventDefault();
    const dx = e.clientX - this._sx;
    const dy = e.clientY - this._sy;
    // Zona muerta: por debajo de un desplazamiento mínimo NO se inclina (evita temblor).
    if (Math.hypot(dx, dy) / this.fullPx < this.deadzone) { this._targetX = 0; this._targetZ = 0; return; }
    const k = (this.maxTilt / this.fullPx) * this.sensitivity;
    this._targetZ = clamp(-dx * k, -this.maxTilt, this.maxTilt); // derecha → tiltZ negativo
    this._targetX = clamp(dy * k, -this.maxTilt, this.maxTilt);  // abajo → tiltX positivo
  }

  _pointerUp(e) {
    if (e.pointerId !== this._id) return;
    this.dragging = false; this._id = null;
    this._targetX = 0; this._targetZ = 0; // objetivo = centro → vuelve suavemente
    if (this.onDragEnd) { try { this.onDragEnd(); } catch (_) { /* noop */ } }
  }

  /**
   * Avanza el suavizado. Mientras se arrastra, se acerca al objetivo con la constante de
   * tiempo `smoothing`; al soltar, vuelve al centro a `returnSpeed`. Frame-rate independiente.
   */
  update(dt) {
    if (!(dt > 0)) return;
    if (dt > 0.1) dt = 0.1; // acota saltos de frame (rotación/pausa) para no dar tirones
    const a = this.dragging
      ? (this.smoothing > 0 ? 1 - Math.exp(-dt / this.smoothing) : 1)
      : Math.min(1, this.returnSpeed * dt);
    this.tiltX += (this._targetX - this.tiltX) * a;
    this.tiltZ += (this._targetZ - this.tiltZ) * a;
    if (!this.dragging && Math.abs(this.tiltX) < 1e-4 && Math.abs(this.tiltZ) < 1e-4) {
      this.tiltX = 0; this.tiltZ = 0; // asienta exactamente en el centro
    }
  }
}

function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
