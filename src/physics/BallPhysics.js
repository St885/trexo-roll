// BallPhysics.js — Simulación de física propia (sin librería externa).
//
// La bola se mueve en el plano LOCAL del tablero (x,z). El tablero se inclina
// (tiltX = rotación sobre X = α, tiltZ = rotación sobre Z = β). La gravedad del
// mundo (0,-G,0) se proyecta sobre el plano inclinado. Para R = Rx(α)·Rz(β):
//
//   a_x = -G · cos(α) · sin(β)
//   a_z =  G · sin(α)
//
// Esto reproduce de forma convincente el rodar de una bola sobre un tablero que
// se inclina, sin necesidad de un motor de física pesado.

import { PHYS } from '../utils/constants.js';
import { isInsideFootprint } from './footprint.js';

export class BallPhysics {
  constructor() {
    this.x = 0;
    this.z = 0;
    this.vx = 0;
    this.vz = 0;
    this.footprint = [];
    this.walls = [];
    this.goal = null;
    this.traps = [];
    this._acc = 0;     // acumulador de tiempo para el paso fijo
    this._offTime = 0; // tiempo acumulado fuera de la huella (gracia de caída)
  }

  /** Carga la geometría lógica del nivel y coloca la bola en el inicio. */
  loadLevel(level) {
    this.footprint = level.footprint;
    this.walls = level.walls || [];
    this.goal = level.goal;
    this.traps = level.traps || [];
    this.reset(level.start);
  }

  /** Reinicia la bola al punto de inicio, sin velocidad. */
  reset(start) {
    this.x = start.x;
    this.z = start.z;
    this.vx = 0;
    this.vz = 0;
    this._acc = 0;
    this._offTime = 0;
  }

  get speed() {
    return Math.hypot(this.vx, this.vz);
  }

  /**
   * Avanza la simulación. Devuelve un evento o null:
   *  'goal' | 'trap' | 'fall'
   * @param {number} dt  delta real (s)
   * @param {number} tiltX  inclinación sobre X (rad)
   * @param {number} tiltZ  inclinación sobre Z (rad)
   */
  update(dt, tiltX, tiltZ) {
    // Paso fijo para estabilidad numérica e independencia del framerate.
    this._acc += Math.min(dt, 0.05); // clamp anti-saltos (pestaña en 2º plano)
    let event = null;
    while (this._acc >= PHYS.SUBSTEP && !event) {
      event = this._step(PHYS.SUBSTEP, tiltX, tiltZ);
      this._acc -= PHYS.SUBSTEP;
    }
    return event;
  }

  _step(h, tiltX, tiltZ) {
    // Gravedad proyectada en el plano del tablero.
    let ax = -PHYS.GRAVITY * Math.cos(tiltX) * Math.sin(tiltZ);
    let az = PHYS.GRAVITY * Math.sin(tiltX);

    // Atracción suave hacia un hoyo cercano (para que "caiga" en vez de rozar).
    const pull = this._holePull();
    if (pull) {
      ax += pull.x;
      az += pull.z;
    }

    // Integración de velocidad + fricción de rodadura estable.
    this.vx = (this.vx + ax * h) / (1 + PHYS.DAMPING * h);
    this.vz = (this.vz + az * h) / (1 + PHYS.DAMPING * h);

    // Límite de velocidad (evita atravesar paredes/hoyos).
    const sp = this.speed;
    if (sp > PHYS.MAX_SPEED) {
      const k = PHYS.MAX_SPEED / sp;
      this.vx *= k;
      this.vz *= k;
    }

    // Integración de posición.
    this.x += this.vx * h;
    this.z += this.vz * h;

    // Colisiones contra paredes/obstáculos sólidos.
    this._resolveWalls();

    // ¿Cayó dentro de un hoyo?
    const hole = this._holeHit();
    if (hole === 'goal') return 'goal';
    if (hole === 'trap') return 'trap';

    // ¿Se salió del tablero? Con un pequeño margen de perdón: la bola puede
    // teetear en el borde un instante y recuperarse antes de caer.
    if (!isInsideFootprint(this.footprint, this.x, this.z)) {
      this._offTime += h;
      if (this._offTime >= PHYS.FALL_GRACE) return 'fall';
    } else {
      this._offTime = 0;
    }

    return null;
  }

  /** Atracción hacia el hoyo más cercano si la bola está sobre su boca. */
  _holePull() {
    const holes = this.goal ? [this.goal, ...this.traps] : this.traps;
    for (const hole of holes) {
      const dx = hole.x - this.x;
      const dz = hole.z - this.z;
      const dist = Math.hypot(dx, dz);
      if (dist < hole.r && dist > 1e-4) {
        const strength = PHYS.CAPTURE_PULL * (1 - dist / hole.r);
        return { x: (dx / dist) * strength, z: (dz / dist) * strength };
      }
    }
    return null;
  }

  /** ¿El centro de la bola entró en la zona de captura de algún hoyo? */
  _holeHit() {
    if (this.goal) {
      const dg = Math.hypot(this.goal.x - this.x, this.goal.z - this.z);
      if (dg < this.goal.r * PHYS.CAPTURE_FACTOR) return 'goal';
    }
    for (const t of this.traps) {
      const dt = Math.hypot(t.x - this.x, t.z - this.z);
      if (dt < t.r * PHYS.CAPTURE_FACTOR) return 'trap';
    }
    return null;
  }

  /** Resuelve colisión círculo (bola) vs AABB (paredes), con rebote. */
  _resolveWalls() {
    const r = PHYS.BALL_RADIUS;
    for (const w of this.walls) {
      const halfW = w.w / 2;
      const halfD = w.d / 2;
      // Punto del AABB más cercano al centro de la bola.
      const cx = clamp(this.x, w.x - halfW, w.x + halfW);
      const cz = clamp(this.z, w.z - halfD, w.z + halfD);
      let dx = this.x - cx;
      let dz = this.z - cz;
      let distSq = dx * dx + dz * dz;

      if (distSq > r * r) continue; // sin contacto

      let nx, nz, penetration;
      if (distSq > 1e-8) {
        const dist = Math.sqrt(distSq);
        nx = dx / dist;
        nz = dz / dist;
        penetration = r - dist;
      } else {
        // Centro dentro del AABB: empujar por el eje de menor penetración.
        const overlapX = halfW + r - Math.abs(this.x - w.x);
        const overlapZ = halfD + r - Math.abs(this.z - w.z);
        if (overlapX < overlapZ) {
          nx = Math.sign(this.x - w.x) || 1;
          nz = 0;
          penetration = overlapX;
        } else {
          nx = 0;
          nz = Math.sign(this.z - w.z) || 1;
          penetration = overlapZ;
        }
      }

      // Separar y reflejar la componente de velocidad entrante.
      this.x += nx * penetration;
      this.z += nz * penetration;
      const vDotN = this.vx * nx + this.vz * nz;
      if (vDotN < 0) {
        this.vx -= (1 + PHYS.RESTITUTION) * vDotN * nx;
        this.vz -= (1 + PHYS.RESTITUTION) * vDotN * nz;
      }
    }
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
