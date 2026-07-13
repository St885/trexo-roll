// InputController.js — Inclinación del tablero desde varias fuentes que conviven:
//   1) Arrastre TÁCTIL del dedo sobre el tablero (control PRINCIPAL en móvil, v0.25.3;
//      TouchTiltController: suavizado, zona muerta, retorno al centro, multitouch seguro),
//   2) Joystick táctil analógico (control móvil SECUNDARIO / diagonales suaves),
//   3) Arrastre con puntero sobre el lienzo (SOLO ratón en desktop),
//   4) Teclado (flechas / WASD en desktop),
//   5) D-pad de 4 botones: OCULTO en móvil por defecto (solo con DEBUG_SHOW_DPAD); sigue
//      cableado para depuración y para el teclado en desktop.
//
// Patrón robusto: cada control escucha SUS PROPIOS eventos de puntero con setPointerCapture +
// { passive:false } + preventDefault, de modo que el navegador no convierte el gesto en
// scroll/zoom. Los botones de UI (pausa/HUD/joystick) tienen pointer-events:auto y el lienzo
// queda debajo (#screen-game pointer-events:none), así el arrastre táctil NO se activa al
// tocar la interfaz.
//
// Prioridad: joystick > D-pad/teclas > arrastre táctil > arrastre de ratón. El knob del
// joystick refleja la inclinación actual.
//
// Mapeo (coherente con BallPhysics):
//   Derecha → +x → tiltZ negativo   ·   Izquierda → -x → tiltZ positivo
//   Arriba (lejos, -z) → tiltX negativo   ·   Abajo (cerca, +z) → tiltX positivo

import { PHYS } from '../utils/constants.js';
import { TouchTiltController } from '../input/TouchTiltController.js';

const OPT = { passive: false };
const DIRS = ['up', 'down', 'left', 'right'];

// Tecla → dirección. Se consulta PRIMERO por `e.code` (la tecla FÍSICA) y solo como respaldo
// por `e.key` (el carácter que produce el layout activo).
//
// Por qué `e.code` primero: en teclados no-QWERTY (AZERTY, QWERTZ…) la tecla física "W" no
// emite 'w', así que con `e.key` el mando WASD queda descolocado. `e.code` ('KeyW') describe
// la POSICIÓN de la tecla, no el carácter → el mando funciona en cualquier distribución. Es
// la práctica habitual para controles de movimiento.
//
// `e.code` puede venir VACÍO en eventos sintéticos (inyectados por tests o automatización);
// por eso el respaldo a `e.key` es necesario, no decorativo.
const CODE_DIR = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
};
const KEY_DIR = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
};

export class InputController {
  constructor(canvasEl, joystickEl, knobEl, dpadEl, tiltSurfaceEl) {
    this.canvasEl = canvasEl;
    this.joystickEl = joystickEl || null;
    this.knobEl = knobEl || null;
    this.dpadEl = dpadEl || null;
    // Superficie del arrastre táctil: una capa dentro de #screen-game (pointer-events correcto).
    // El lienzo va bajo #ui (z-index 1) y no recibiría el toque; por eso NO se usa el lienzo.
    this.tiltSurfaceEl = tiltSurfaceEl || canvasEl;

    this.tiltX = 0;
    this.tiltZ = 0;
    this.keys = { up: false, down: false, left: false, right: false };

    // ¿Es un dispositivo táctil? En táctil el control PRINCIPAL es el arrastre del dedo sobre el
    // tablero (TouchTiltController); el arrastre "de ratón" del lienzo queda solo para desktop.
    this._isTouch = detectTouch();
    // Control táctil por arrastre (móvil): inclina el tablero con el dedo, con suavizado, zona
    // muerta, retorno al centro y multitouch seguro. Escucha sobre la superficie de inclinación.
    this.touchTilt = this._isTouch ? new TouchTiltController(this.tiltSurfaceEl) : null;

    // Arrastre (solo desktop/ratón)
    this.dragging = false; this._dragId = null; this._dragTouch = false;
    this._sx = 0; this._sy = 0; this._dragX = 0; this._dragZ = 0;

    // Joystick
    this.joyActive = false; this._joyId = null;
    this._joyCx = 0; this._joyCy = 0; this._joyR = 42;
    this._joyX = 0; this._joyZ = 0; this._knobPx = 0; this._knobPy = 0;

    this._enabled = false;
    this._dpadBound = [];
    // Joystick OPCIONAL (por defecto OFF en móvil). Cuando está oculto, NO renderizamos el knob
    // cada frame (evita trabajo inútil). Los eventos del joystick no llegan si está display:none.
    this._joystickShown = false;

    this._onKeyDown = (e) => this._key(e, true);
    this._onKeyUp = (e) => this._key(e, false);
    this._cDown = (e) => this._dragDown(e);
    this._cMove = (e) => this._dragMove(e);
    this._cUp = (e) => this._dragUp(e);
    this._jDown = (e) => this._joyDown(e);
    this._jMove = (e) => this._joyMove(e);
    this._jUp = (e) => this._joyUp(e);
    // Si el navegador roba el foco (llamada, cambio de pestaña…) soltamos todo
    // para que ninguna dirección se quede "pegada".
    this._onBlur = () => this.reset();
    this._onVisibility = () => { if (typeof document !== 'undefined' && document.hidden) this.reset(); };
  }

  enable() {
    if (this._enabled) return;
    this._enabled = true;
    this._measure();
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', this._onVisibility);
    }
    // Arrastre del lienzo: en DESKTOP con ratón usa el arrastre clásico; en MÓVIL usa el
    // TouchTiltController (control principal por dedo sobre el tablero).
    if (!this._isTouch) {
      this.canvasEl.addEventListener('pointerdown', this._cDown, OPT);
      this.canvasEl.addEventListener('pointermove', this._cMove, OPT);
      this.canvasEl.addEventListener('pointerup', this._cUp, OPT);
      this.canvasEl.addEventListener('pointercancel', this._cUp, OPT);
    } else if (this.touchTilt) {
      this.touchTilt.enable();
    }
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
    window.removeEventListener('blur', this._onBlur);
    if (typeof document !== 'undefined' && document.removeEventListener) {
      document.removeEventListener('visibilitychange', this._onVisibility);
    }
    if (!this._isTouch) {
      this.canvasEl.removeEventListener('pointerdown', this._cDown, OPT);
      this.canvasEl.removeEventListener('pointermove', this._cMove, OPT);
      this.canvasEl.removeEventListener('pointerup', this._cUp, OPT);
      this.canvasEl.removeEventListener('pointercancel', this._cUp, OPT);
    } else if (this.touchTilt) {
      this.touchTilt.disable();
    }
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
    if (this.touchTilt) this.touchTilt.reset();
    this._renderKnob();
  }

  /** Alias semántico: soltar todos los controles táctiles (pausa, cambio de pantalla…). */
  resetTouchControls() { this.reset(); }

  _measure() {
    if (this.joystickEl) this._joyR = (this.joystickEl.clientWidth || 120) * 0.36;
  }

  refresh() { this._measure(); this._renderKnob(); }

  /** Informa si el joystick está visible. Con OFF no se renderiza el knob cada frame. */
  setJoystickShown(v) { this._joystickShown = !!v; }

  // --- API de dirección (la usan D-pad y, si hiciera falta, otros controles) --
  /** Inclina el tablero hacia `dir` ('up'|'down'|'left'|'right') y lo mantiene. */
  pressDirection(dir) {
    if (!DIRS.includes(dir)) return;
    this.keys[dir] = true;
    this.dragging = false; this._dragId = null; // el D-pad cancela cualquier arrastre
    this._setBtnPressed(dir, true);
  }

  /** Suelta la dirección `dir`: esa componente vuelve a cero. */
  releaseDirection(dir) {
    if (!DIRS.includes(dir)) return;
    this.keys[dir] = false;
    this._setBtnPressed(dir, false);
  }

  _setBtnPressed(dir, on) {
    if (!this.dpadEl) return;
    const btn = this.dpadEl.querySelector ? this.dpadEl.querySelector(`[data-dir="${dir}"]`) : null;
    if (btn) btn.classList.toggle('pressed', on);
  }

  /** Inclinación actual ya suavizada. */
  getTiltInput() { return { tiltX: this.tiltX, tiltZ: this.tiltZ }; }

  // --- Teclado --------------------------------------------------------------
  _key(e, down) {
    // `e.code` PRIMERO (tecla física, independiente del layout); `e.key` como respaldo
    // (los eventos sintéticos llegan con `code` vacío).
    const dir = CODE_DIR[e.code] || KEY_DIR[e.key];
    if (!dir) return;
    this.keys[dir] = down;
    e.preventDefault();
  }

  // --- D-pad (4 botones digitales, control móvil principal) -----------------
  // Cada botón es independiente: pulsar dos a la vez (multitouch) da diagonales.
  _wireDpad() {
    if (!this.dpadEl) return;
    this._dpadBound = [];
    this.dpadEl.querySelectorAll('[data-dir]').forEach((btn) => {
      const dir = btn.dataset.dir;
      const down = (e) => {
        e.preventDefault();
        this.pressDirection(dir);
        btn.classList.add('pressed'); // estado visual directo sobre el botón pulsado
        try { btn.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
      };
      const up = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.releaseDirection(dir);
        btn.classList.remove('pressed');
      };
      btn.addEventListener('pointerdown', down, OPT);
      btn.addEventListener('pointerup', up, OPT);
      btn.addEventListener('pointercancel', up, OPT);   // dedo cancelado por el sistema
      btn.addEventListener('lostpointercapture', up);   // pérdida de captura → soltar
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

  // --- Arrastre sobre el lienzo (solo desktop/ratón) ------------------------
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

  // --- Joystick analógico (control móvil secundario) ------------------------
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
    if (this.touchTilt) this.touchTilt.update(dt);
    const keysActive = this.keys.up || this.keys.down || this.keys.left || this.keys.right;
    // Arrastre TÁCTIL (móvil): trae su propio suavizado/retorno al centro → se usa DIRECTO.
    // Prioridad general: joystick > D-pad/teclado > arrastre táctil > arrastre de ratón.
    if (!this.joyActive && !keysActive && this.touchTilt && this.touchTilt.isEngaged()) {
      this.tiltX = this.touchTilt.tiltX;
      this.tiltZ = this.touchTilt.tiltZ;
      this._renderKnob();
      return;
    }
    let targetX, targetZ;
    if (this.joyActive) {
      // 1) Joystick analógico (máxima prioridad si el dedo lo está usando).
      targetX = this._joyX; targetZ = this._joyZ;
    } else if (keysActive) {
      // 2) D-pad / teclado: SIEMPRE por encima del arrastre, para que un roce
      //    accidental en el tablero no anule el D-pad.
      targetX = ((this.keys.down ? 1 : 0) + (this.keys.up ? -1 : 0)) * PHYS.MAX_TILT;
      targetZ = ((this.keys.left ? 1 : 0) + (this.keys.right ? -1 : 0)) * PHYS.MAX_TILT;
    } else if (this.dragging) {
      // 3) Arrastre con ratón (solo desktop).
      targetX = this._dragX; targetZ = this._dragZ;
    } else {
      targetX = 0; targetZ = 0;
    }
    const a = Math.min(1, PHYS.TILT_LERP * dt);
    this.tiltX += (targetX - this.tiltX) * a;
    this.tiltZ += (targetZ - this.tiltZ) * a;
    this._renderKnob();
  }

  _renderKnob() {
    // Joystick oculto e inactivo → no escribir el estilo del knob cada frame (trabajo inútil).
    // Si está en uso (joyActive) siempre se refleja, aunque el flag no se haya propagado.
    if (!this.knobEl || (!this._joystickShown && !this.joyActive)) return;
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

/** Detección robusta de dispositivo táctil (sin romper en Node para los tests). */
function detectTouch() {
  try {
    if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) return true;
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return true;
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return true;
  } catch (_) { /* entorno sin DOM (tests) */ }
  return false;
}
