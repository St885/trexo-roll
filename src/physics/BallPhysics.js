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

import { PHYS, PORTAL } from '../utils/constants.js';
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
    this.portals = [];   // pares de hoyos naranjas enlazados (0..2)
    this._acc = 0;     // acumulador de tiempo para el paso fijo
    this._offTime = 0; // tiempo acumulado fuera de la huella (gracia de caída)
    this._portalCd = 0;    // cooldown anti-loop tras teletransportar (s)
    this._portalFx = null; // evento de portal pendiente de consumir por la capa visual
    // Modificadores por habilidad de bola + clima (neutros por defecto → física base intacta).
    this.accelScale = 1;       // escala de la aceleración (Raptor >1, Bronto <1)
    this.dampingScale = 1;     // escala de la fricción (Tricera/Bronto >1)
    this.restitutionScale = 1; // escala del rebote contra paredes (Tricera <1)
    this.windAx = 0;           // empuje lateral del viento (clima), unidades de aceleración
    this.windAz = 0;
  }

  /**
   * Aplica los modificadores de la habilidad de bola (escala física). Valores ausentes
   * vuelven a neutro. NO toca la geometría ni la solvencia del nivel.
   */
  setMods(mods = {}) {
    this.accelScale = mods.accelScale || 1;
    this.dampingScale = mods.dampingScale || 1;
    this.restitutionScale = mods.restitutionScale || 1;
  }

  /** Empuje lateral del viento (clima). ax,az en unidades de aceleración del plano. */
  setWind(ax = 0, az = 0) {
    this.windAx = ax || 0;
    this.windAz = az || 0;
  }

  /** Carga la geometría lógica del nivel y coloca la bola en el inicio. */
  loadLevel(level) {
    this.footprint = level.footprint;
    this.walls = level.walls || [];
    this.goal = level.goal;
    // CLON de las trampas: los hoyos dinámicos mutan x/z/r/active por frame; clonar evita
    // corromper la definición del nivel (que se reutiliza en repeticiones). Las trampas
    // estáticas simplemente no se mutan. `active` por defecto = true (puede tragar la bola).
    this.traps = (level.traps || []).map((t) => ({ x: t.x, z: t.z, r: t.r, active: true }));
    this.portals = level.portals || [];
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
    this._portalCd = 0;
    this._portalFx = null;
  }

  /**
   * Devuelve y limpia el último evento de portal (para que la capa visual lance el
   * efecto de vórtice y el sonido). null si no hubo teletransporte desde la última vez.
   * @returns {{fromX,fromZ,toX,toZ,exitX,exitZ}|null}
   */
  consumePortalFx() {
    const f = this._portalFx;
    this._portalFx = null;
    return f;
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
    if (this._portalCd > 0) this._portalCd = Math.max(0, this._portalCd - h);

    // Gravedad proyectada en el plano del tablero (escalada por la habilidad de bola).
    let ax = -PHYS.GRAVITY * this.accelScale * Math.cos(tiltX) * Math.sin(tiltZ);
    let az = PHYS.GRAVITY * this.accelScale * Math.sin(tiltX);

    // Empuje del viento (clima): muy leve, constante mientras dura el nivel.
    ax += this.windAx;
    az += this.windAz;

    // Atracción suave hacia un hoyo cercano (para que "caiga" en vez de rozar).
    const pull = this._holePull();
    if (pull) {
      ax += pull.x;
      az += pull.z;
    }

    // Integración de velocidad + fricción de rodadura estable (escalada por habilidad).
    const damp = PHYS.DAMPING * this.dampingScale;
    this.vx = (this.vx + ax * h) / (1 + damp * h);
    this.vz = (this.vz + az * h) / (1 + damp * h);

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

    // Portales (no terminal): si la bola entra en uno, sale por el otro.
    if (this.portals.length === 2 && this._portalCd === 0) this._maybeTeleport();

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
      if (hole.active === false) continue; // hoyo dinámico cerrado/pequeño: ni atrae ni traga
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
      if (t.active === false) continue; // hoyo dinámico inactivo (más pequeño que la bola)
      // La colisión usa el RADIO ACTUAL (t.r), no el base: un hoyo pequeño no traga injustamente.
      const dt = Math.hypot(t.x - this.x, t.z - this.z);
      if (dt < t.r * PHYS.CAPTURE_FACTOR) return 'trap';
    }
    return null;
  }

  /** ¿La bola entró en un portal? Si es así, la teletransporta al portal hermano. */
  _maybeTeleport() {
    for (let i = 0; i < this.portals.length; i++) {
      const a = this.portals[i];
      const ar = a.r || 1;
      if (Math.hypot(a.x - this.x, a.z - this.z) < ar * PORTAL.CAPTURE) {
        this._teleport(a, this.portals[1 - i]);
        return;
      }
    }
  }

  /**
   * Saca la bola por el portal de salida: conserva dirección (amortiguada, con un
   * mínimo para que abandone la boca), la coloca JUSTO fuera de la captura y valida
   * que el destino sea seguro (dentro de la huella, sin pared ni trampa).
   */
  _teleport(entry, exit) {
    const R = PHYS.BALL_RADIUS;
    const er = exit.r || 1;
    let vx = this.vx * PORTAL.EXIT_DAMP;
    let vz = this.vz * PORTAL.EXIT_DAMP;
    let sp = Math.hypot(vx, vz);
    // Dirección de salida: la de la velocidad si es apreciable; si no, hacia el centro
    // del tablero (zona despejada) para no salir contra un borde.
    let dx, dz;
    if (sp > 0.6) { dx = vx / sp; dz = vz / sp; }
    else {
      const cl = Math.hypot(exit.x, exit.z) || 1;
      dx = -exit.x / cl; dz = -exit.z / cl;
    }
    if (sp < PORTAL.EXIT_MIN_SPEED) { vx = dx * PORTAL.EXIT_MIN_SPEED; vz = dz * PORTAL.EXIT_MIN_SPEED; }

    const margin = er * PORTAL.CAPTURE + R + 0.35;
    let nx = exit.x + dx * margin;
    let nz = exit.z + dz * margin;
    if (!this._safeSpot(nx, nz)) {
      // Reintento hacia el centro del tablero.
      const cl = Math.hypot(exit.x, exit.z) || 1;
      nx = exit.x - (exit.x / cl) * margin;
      nz = exit.z - (exit.z / cl) * margin;
      if (!this._safeSpot(nx, nz)) { nx = exit.x; nz = exit.z; }
    }

    this.x = nx; this.z = nz;
    this.vx = vx; this.vz = vz;
    this._portalCd = PORTAL.COOLDOWN;
    this._offTime = 0;
    this._portalFx = { fromX: entry.x, fromZ: entry.z, toX: nx, toZ: nz, exitX: exit.x, exitZ: exit.z };
  }

  /** ¿(x,z) es un punto seguro para reaparecer? (dentro de huella, sin pared ni trampa) */
  _safeSpot(x, z) {
    const R = PHYS.BALL_RADIUS;
    if (!isInsideFootprint(this.footprint, x, z)) return false;
    for (const w of this.walls) {
      if (Math.abs(x - w.x) < w.w / 2 + R && Math.abs(z - w.z) < w.d / 2 + R) return false;
    }
    for (const t of this.traps) {
      if (Math.hypot(t.x - x, t.z - z) < t.r * PHYS.CAPTURE_FACTOR + R) return false;
    }
    return true;
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
        const rest = PHYS.RESTITUTION * this.restitutionScale;
        this.vx -= (1 + rest) * vDotN * nx;
        this.vz -= (1 + rest) * vDotN * nz;
      }
    }
  }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
