// SceneManager.js — Envoltorio de Three.js: renderer, cámara, luces, fondo y montaje
// del tablero. Aísla todo lo "3D" del resto del juego.

import * as THREE from 'three';
import { makeSkyTexture, makeContactShadowTexture, makeThemeSky, getTheme, makeGroundTexture } from './textures.js';
import { buildBoard } from './BoardBuilder.js';
import { buildDino, buildConfetti } from './CelebrationDino.js';
import { makeCoin, makeStarToken, makeTrapCover, makePtero } from './collectibleArt.js';
import { footprintBounds } from '../physics/footprint.js';
import { PHYS } from '../utils/constants.js';

const CAM_DIR = new THREE.Vector3(0, 0.92, 1.0).normalize(); // dirección fija de la cámara
const V_FOV = 48;
// Banda de decoración alrededor del tablero (debe coincidir con decorate() en
// BoardBuilder). El encuadre la incluye para que la decoración no se "corte".
const DECOR_MARGIN = 2.0;

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping cinematográfico para un acabado más profesional.
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this._bgTexture = makeSkyTexture();
    this.scene.background = this._bgTexture;
    // Niebla LEJANA: deja el tablero (y la decoración cercana) nítidos y solo
    // difumina el suelo/horizonte → profundidad de jungla sin "empañar" el juego.
    this.scene.fog = new THREE.Fog(0xbfe3d0, 80, 220);

    this.camera = new THREE.PerspectiveCamera(V_FOV, 1, 0.1, 260);
    this.camera.position.set(0, 14, 16);
    this.camera.lookAt(0, 0, 0);

    this._addLights();
    this._addGround();

    this.boardGroup = null;
    this.animated = [];
    this._ballMesh = null;
    this._boardCenter = new THREE.Vector3();
    this._t = 0;
    this._shake = 0;
    this._celebration = null;
    this._collectibles = []; // {mesh, x, z, type, taken}
    this._pickFx = [];       // efectos "pop" al recoger
    this._ptero = null;      // estado del ptero-rescate

    // Sombra de contacto bajo la bola (da sensación de peso y apoyo).
    this._contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(PHYS.BALL_RADIUS * 3.2, PHYS.BALL_RADIUS * 3.2),
      new THREE.MeshBasicMaterial({ map: makeContactShadowTexture(), transparent: true, opacity: 0.35, depthWrite: false })
    );
    this._contactShadow.rotation.x = -Math.PI / 2;

    // Sombra grande y suave proyectada sobre el suelo, bajo el tablero: lo ancla y
    // refuerza la sensación de plataforma elevada (no "hundida" en el fondo).
    this._boardShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: makeContactShadowTexture(), transparent: true, opacity: 0.5, depthWrite: false })
    );
    this._boardShadow.rotation.x = -Math.PI / 2;
    this._boardShadow.frustumCulled = false;
    this._boardShadow.visible = false;
    this.scene.add(this._boardShadow);

    this.resize();
  }

  _addLights() {
    this.scene.add(new THREE.HemisphereLight(0xcfeaff, 0x6b7a3a, 0.7));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const sun = new THREE.DirectionalLight(0xfff1c9, 1.25);
    sun.position.set(10, 20, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    // Volumen de sombra amplio: cubre el tablero + decoración incluso inclinado,
    // así nada pierde su sombra al girar.
    const s = 34;
    sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
    sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 100;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
    this.scene.add(sun.target); // necesario para que el objetivo de la sombra se actualice
    this.sun = sun;
    // Luz de relleno fría desde atrás: separa la bola/tablero del fondo (rim light).
    const rim = new THREE.DirectionalLight(0x88b4ff, 0.4);
    rim.position.set(-12, 8, -10);
    this.scene.add(rim);
  }

  _addGround() {
    const geo = new THREE.PlaneGeometry(240, 240);
    this.groundTex = makeGroundTexture('valle');
    const mat = new THREE.MeshStandardMaterial({ map: this.groundTex, roughness: 1 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4.2; // más abajo que antes (-3.2): separa el tablero sin exagerar
    ground.receiveShadow = true;
    ground.frustumCulled = false; // suelo grande: nunca debe culearse
    this.scene.add(ground);
    this.ground = ground;
  }

  /** Aplica la ambientación del bioma: fondo, color de suelo y niebla. */
  applyTheme(name) {
    const theme = getTheme(name);
    const old = this._bgTexture;
    this._bgTexture = makeThemeSky(name);
    this.scene.background = this._bgTexture;
    if (old) old.dispose();
    if (this.ground) {
      const oldG = this.groundTex;
      this.groundTex = makeGroundTexture(name);
      this.ground.material.map = this.groundTex;
      this.ground.material.color.set(0xffffff); // el color real lo aporta la textura
      this.ground.material.needsUpdate = true;
      if (oldG) oldG.dispose();
    }
    if (this.scene.fog) this.scene.fog.color.set(theme.fog);
  }

  /** Sustituye el tablero actual por el del nivel dado y añade la bola. */
  mountLevel(level, ballMesh) {
    this.clearBoard();
    this.applyTheme(level.theme);
    const { group, animated } = buildBoard(level);
    group.add(ballMesh);
    group.add(this._contactShadow);
    this._ballMesh = ballMesh;
    // El tablero gira (rotation.x/z): desactivar el frustum culling de TODO lo que
    // cuelga de él evita que objetos/esquinas "desaparezcan" por una esfera de
    // recorte mal calculada al inclinar. La escena es pequeña: coste despreciable.
    group.traverse((o) => { o.frustumCulled = false; });
    this.scene.add(group);
    this.boardGroup = group;
    this.animated = animated;

    const b = footprintBounds(level.footprint);
    this._bounds = b;
    this._boardCenter.set((b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2);

    // Sombra grande del tablero sobre el suelo (anclaje + sensación de elevación).
    this._boardShadow.scale.set(b.width + 6, b.depth + 6, 1);
    this._boardShadow.position.set(this._boardCenter.x, this.ground.position.y + 0.06, this._boardCenter.z);
    this._boardShadow.visible = true;

    this._frame(b);
    return group;
  }

  clearBoard() {
    if (this._boardShadow) this._boardShadow.visible = false;
    if (!this.boardGroup) return;
    // La bola y la sombra se reutilizan: sacarlas antes de liberar el tablero.
    if (this._ballMesh && this._ballMesh.parent === this.boardGroup) {
      this.boardGroup.remove(this._ballMesh);
    }
    if (this._contactShadow.parent === this.boardGroup) {
      this.boardGroup.remove(this._contactShadow);
    }
    this.scene.remove(this.boardGroup);
    disposeTree(this.boardGroup);
    this.boardGroup = null;
    this.animated = [];
    this._celebration = null; // sus objetos se liberan con el árbol del tablero
    this._collectibles = [];  // sus meshes colgaban del tablero (ya liberados)
    this._pickFx = [];
    if (this._ptero) { this.scene.remove(this._ptero.group); disposeTree(this._ptero.group); this._ptero = null; }
  }

  // --- Coleccionables (monedas + estrella-token) ----------------------------
  /** Monta los coleccionables del nivel como hijos del tablero (se inclinan con él). */
  mountCollectibles(coins, star) {
    this._collectibles = [];
    if (!this.boardGroup) return;
    for (const c of coins || []) {
      const mesh = makeCoin();
      mesh.position.set(c.x, 0.55, c.z);
      mesh.traverse((o) => { o.frustumCulled = false; });
      this.boardGroup.add(mesh);
      this._collectibles.push({ mesh, x: c.x, z: c.z, type: 'coin', taken: false });
    }
    if (star) {
      const mesh = makeStarToken();
      mesh.position.set(star.x, 0.64, star.z);
      mesh.traverse((o) => { o.frustumCulled = false; });
      this.boardGroup.add(mesh);
      this._collectibles.push({ mesh, x: star.x, z: star.z, type: 'star', taken: false });
    }
  }

  /** Marca un coleccionable como recogido y lanza su efecto "pop". */
  collectAt(index) {
    const c = this._collectibles[index];
    if (!c || c.taken) return;
    c.taken = true;
    this._pickFx.push({ mesh: c.mesh, t: 0, dur: 0.3 });
  }

  /** Tapa una trampa bloqueada con una piedra gris (se ve "apagada"). */
  coverTrap(trap) {
    if (!this.boardGroup || !trap) return;
    const cover = makeTrapCover(trap.r || 1);
    cover.position.set(trap.x, 0.04, trap.z);
    cover.traverse((o) => { o.frustumCulled = false; });
    this.boardGroup.add(cover);
  }

  // --- Escudo de caída: rescate del pterosaurio -----------------------------
  /** Lanza el ptero, que recoge la bola caída y la deja en una zona segura. */
  startPteroRescue(safeX, safeZ, colorHex, onDone) {
    const ball = this._ballMesh;
    if (!ball) { if (onDone) onDone(); return; }
    ball.visible = true;
    const ptero = makePtero(colorHex || '#8a5a3a');
    ptero.traverse((o) => { o.frustumCulled = false; });
    ptero.position.set(ball.position.x, ball.position.y + 6, ball.position.z - 3);
    this.scene.add(ptero);
    this._ptero = {
      group: ptero, t: 0, onDone,
      bx: ball.position.x, by: ball.position.y, bz: ball.position.z,
      safeX, safeZ,
    };
  }

  _animatePtero(dt) {
    const P = this._ptero;
    if (!P) return;
    P.t += dt;
    const t = P.t;
    const ptero = P.group;
    const ball = this._ballMesh;
    const flap = Math.sin(t * 18) * 0.6;
    if (ptero.userData.wings) {
      ptero.userData.wings[0].rotation.z = flap;
      ptero.userData.wings[1].rotation.z = -flap;
    }
    const PICK = 0.55, CARRY = 1.5, OUT = 2.1;
    if (t < PICK) {
      const p = t / PICK;
      ptero.position.set(P.bx, lerp(P.by + 6, P.by + 0.7, p), lerp(P.bz - 3, P.bz, p));
      if (ball) ball.position.y = lerp(P.by, P.by - 0.6, p);
    } else if (t < CARRY) {
      const e = easeOut((t - PICK) / (CARRY - PICK));
      const bx = lerp(P.bx, P.safeX, e);
      const bz = lerp(P.bz, P.safeZ, e);
      const by = lerp(P.by - 0.6, PHYS.BALL_RADIUS, e) + Math.sin(e * Math.PI) * 1.3;
      if (ball) ball.position.set(bx, by, bz);
      ptero.position.set(bx, by + 0.85, bz);
    } else if (t < OUT) {
      const p = (t - CARRY) / (OUT - CARRY);
      if (ball) ball.position.set(P.safeX, PHYS.BALL_RADIUS, P.safeZ);
      ptero.position.set(lerp(P.safeX, P.safeX + 5, p), lerp(PHYS.BALL_RADIUS + 0.85, 7, p), lerp(P.safeZ, P.safeZ - 5, p));
    } else {
      this.scene.remove(ptero);
      disposeTree(ptero);
      const cb = P.onDone;
      this._ptero = null;
      if (cb) cb();
    }
  }

  /** Lanza la celebración: el dino de la bola sale del hoyo y baila + confeti. */
  spawnCelebration(x, z, ballDef) {
    if (!this.boardGroup) return;
    this.clearCelebration();
    const dino = buildDino(ballDef);
    dino.position.set(x, -1.4, z);
    const { points, velocities } = buildConfetti(ballDef.dino);
    points.position.set(x, 0.6, z);
    // Se añaden después del traverse de mountLevel: desactivar su culling aquí para
    // que el dino y el confeti no se recorten al moverse durante la celebración.
    dino.traverse((o) => { o.frustumCulled = false; });
    points.frustumCulled = false;
    this.boardGroup.add(dino);
    this.boardGroup.add(points);
    this._celebration = {
      dino, points, velocities, t: 0, baseY: 0.0, baseX: x, baseZ: z,
      anim: dino.userData.anim, head: dino.userData.head, neck: dino.userData.neck,
      tail: dino.userData.tail, arms: dino.userData.arms || [],
    };
  }

  clearCelebration() {
    if (!this._celebration || !this.boardGroup) { this._celebration = null; return; }
    for (const obj of [this._celebration.dino, this._celebration.points]) {
      this.boardGroup.remove(obj);
      disposeTree(obj);
    }
    this._celebration = null;
  }

  _animateCelebration(dt) {
    const c = this._celebration;
    if (!c) return;
    c.t += dt;
    const t = c.t;
    const d = c.dino;

    // Salida del hoyo (0–0.4 s) y luego saltitos.
    let y = c.baseY;
    if (t < 0.4) {
      y = -1.4 + (c.baseY + 1.4) * (1 - Math.pow(1 - t / 0.4, 3));
    } else {
      const hop = c.anim === 'neck' ? 0.12 : 0.3; // el braquiosaurio salta menos
      y = c.baseY + Math.abs(Math.sin((t - 0.4) * 7)) * hop;
    }
    d.position.set(c.baseX, y, c.baseZ);
    d.rotation.set(0, d.rotation.y + dt * 1.2, 0); // giro base lento

    // Animación específica de la especie.
    if (t > 0.4) {
      const u = t - 0.4;
      switch (c.anim) {
        case 'spin': d.rotation.y += dt * 5; if (c.tail) c.tail.rotation.z = Math.sin(u * 12) * 0.3; break;
        case 'dance': d.rotation.z = Math.sin(u * 8) * 0.18; break;
        case 'charge':
          d.position.z = c.baseZ + Math.sin(u * 6) * 0.45;
          if (c.head) c.head.rotation.x = Math.max(0, Math.sin(u * 6)) * 0.45; break;
        case 'neck': if (c.neck) c.neck.rotation.x = -0.3 + Math.sin(u * 3) * 0.45; break;
        case 'roar':
        default: if (c.head) c.head.rotation.x = -0.12 + Math.sin(u * 9) * 0.32; break;
      }
    }
    for (const arm of c.arms) arm.rotation.x = Math.sin(t * 14) * 0.8 - 0.2;

    // Confeti
    const pos = c.points.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      c.velocities[i * 3 + 1] -= 6 * dt; // gravedad
      pos.setX(i, pos.getX(i) + c.velocities[i * 3] * dt);
      pos.setY(i, pos.getY(i) + c.velocities[i * 3 + 1] * dt);
      pos.setZ(i, pos.getZ(i) + c.velocities[i * 3 + 2] * dt);
    }
    pos.needsUpdate = true;
    c.points.material.opacity = Math.max(0, 1 - t / 1.4);
  }

  /**
   * Encuadra la cámara para que el tablero entre COMPLETO incluso al inclinarse.
   * El radio a encuadrar cubre: (a) las esquinas reales del tablero (diagonal, no
   * solo el lado mayor), (b) la banda de decoración que lo rodea, y (c) el balanceo
   * que la inclinación máxima provoca en las esquinas. Así no se cortan esquinas ni
   * desaparece la decoración al girar.
   */
  _frame(bounds) {
    const halfDiag = Math.hypot(bounds.width / 2, bounds.depth / 2);
    const decorReach = Math.max(bounds.width, bounds.depth) / 2 + DECOR_MARGIN;
    // El tablero gira alrededor del pivote (origen): una ESFERA de este radio centrada
    // en el centro del tablero lo contiene COMPLETO a cualquier inclinación, porque la
    // rotación conserva la distancia al pivote. Por eso NO hace falta un término extra
    // de "balanceo" → la cámara puede acercarse (tablero más grande) sin recortar
    // esquinas ni objetos. 'offset' cubre tableros cuyo centro no esté en el pivote.
    const offset = this._boardCenter.length();
    const radius = Math.max(halfDiag, decorReach) + offset + 0.5;

    const aspect = this.camera.aspect;
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const limiting = Math.min(vFov, hFov);
    const portrait = aspect < 1;
    // Encaje por esfera (sin·, no tan·) con margen pequeño: tablero grande pero estable.
    const margin = portrait ? radius * 0.03 : radius * 0.07;
    const dist = radius / Math.sin(limiting / 2) + margin;
    const target = this._boardCenter.clone();
    target.z += portrait ? radius * 0.05 : 0; // sube un pelín el tablero (sitio para los controles)
    const pos = CAM_DIR.clone().multiplyScalar(dist).add(this._boardCenter);
    this.camera.position.copy(pos);
    this.camera.lookAt(target);
    if (this.sun) this.sun.target.position.copy(this._boardCenter);
  }

  setTilt(tiltX, tiltZ) {
    if (this.boardGroup) {
      this.boardGroup.rotation.x = tiltX;
      this.boardGroup.rotation.z = tiltZ;
    }
  }

  update(dt) {
    this._t += dt;
    this._shake *= Math.max(0, 1 - 9 * dt); // la sacudida se amortigua
    for (const obj of this.animated) {
      if (obj.userData.pulse) {
        const e = obj.userData.baseEmissive;
        obj.material.emissiveIntensity = e * (0.6 + 0.4 * Math.sin(this._t * 3));
        obj.scale.setScalar(1 + 0.06 * Math.sin(this._t * 3));
      }
      if (obj.userData.billboard) {
        const wp = new THREE.Vector3();
        obj.getWorldPosition(wp);
        obj.lookAt(this.camera.position.x, wp.y, this.camera.position.z);
      }
    }
    if (this._celebration) this._animateCelebration(dt);

    // Coleccionables: giro suave + flote.
    for (const c of this._collectibles) {
      if (c.taken) continue;
      c.mesh.rotation.y += dt * (c.type === 'star' ? 1.9 : 2.6);
      const baseY = c.type === 'star' ? 0.64 : 0.55;
      c.mesh.position.y = baseY + Math.sin(this._t * 3 + c.x) * 0.08;
    }
    // Efecto "pop" al recoger: crece, sube y desaparece.
    for (let i = this._pickFx.length - 1; i >= 0; i--) {
      const fx = this._pickFx[i];
      fx.t += dt;
      const p = Math.min(1, fx.t / fx.dur);
      fx.mesh.scale.setScalar(1 + p * 1.3);
      fx.mesh.position.y += dt * 2.6;
      fx.mesh.rotation.y += dt * 9;
      if (p >= 1) {
        if (this.boardGroup) this.boardGroup.remove(fx.mesh);
        disposeTree(fx.mesh);
        this._pickFx.splice(i, 1);
      }
    }
    // Ptero-rescate (escudo de caída).
    if (this._ptero) this._animatePtero(dt);

    // La sombra de contacto sigue a la bola y se atenúa cuando la bola se hunde/cae.
    if (this._ballMesh && this._contactShadow.parent) {
      const m = this._ballMesh;
      this._contactShadow.position.set(m.position.x, 0.04, m.position.z);
      const t = THREE.MathUtils.clamp(m.position.y / PHYS.BALL_RADIUS, 0, 1);
      this._contactShadow.material.opacity = 0.35 * t;
      this._contactShadow.scale.setScalar(0.85 + 0.3 * t);
    }
  }

  /** Provoca una breve sacudida de cámara (feedback de impacto). */
  shake(mag) {
    this._shake = Math.min(this._shake + mag, 0.6);
  }

  render() {
    let ox = 0, oy = 0;
    if (this._shake > 0.001) {
      ox = (Math.random() * 2 - 1) * this._shake;
      oy = (Math.random() * 2 - 1) * this._shake;
      this.camera.position.x += ox;
      this.camera.position.y += oy;
    }
    this.renderer.render(this.scene, this.camera);
    if (ox || oy) {
      this.camera.position.x -= ox;
      this.camera.position.y -= oy;
    }
  }

  resize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this._bounds) this._frame(this._bounds); // reencuadrar al rotar/redimensionar
  }
}

const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function disposeTree(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (m.userData && m.userData.shared) continue; // materiales compartidos: no liberar
        if (m.map) m.map.dispose();
        m.dispose();
      }
    }
  });
}
