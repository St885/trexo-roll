// SceneManager.js — Envoltorio de Three.js: renderer, cámara, luces, fondo y montaje
// del tablero. Aísla todo lo "3D" del resto del juego.

import * as THREE from 'three';
import { makeSkyTexture, makeContactShadowTexture, makeThemeSky, getTheme } from './textures.js';
import { buildBoard } from './BoardBuilder.js';
import { buildDino, buildConfetti } from './CelebrationDino.js';
import { footprintBounds } from '../physics/footprint.js';
import { PHYS } from '../utils/constants.js';

const CAM_DIR = new THREE.Vector3(0, 0.92, 1.0).normalize(); // dirección fija de la cámara
const V_FOV = 48;

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
    this.scene.fog = new THREE.Fog(0xbfe3d0, 42, 95);

    this.camera = new THREE.PerspectiveCamera(V_FOV, 1, 0.1, 200);
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

    // Sombra de contacto bajo la bola (da sensación de peso y apoyo).
    this._contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(PHYS.BALL_RADIUS * 3.2, PHYS.BALL_RADIUS * 3.2),
      new THREE.MeshBasicMaterial({ map: makeContactShadowTexture(), transparent: true, opacity: 0.35, depthWrite: false })
    );
    this._contactShadow.rotation.x = -Math.PI / 2;

    this.resize();
  }

  _addLights() {
    this.scene.add(new THREE.HemisphereLight(0xcfeaff, 0x6b7a3a, 0.7));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const sun = new THREE.DirectionalLight(0xfff1c9, 1.25);
    sun.position.set(10, 20, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = 24;
    sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
    sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
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
    const geo = new THREE.PlaneGeometry(200, 200);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 1 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.2;
    ground.receiveShadow = true;
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
    if (this.ground) this.ground.material.color.set(theme.ground);
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
    this.scene.add(group);
    this.boardGroup = group;
    this.animated = animated;

    const b = footprintBounds(level.footprint);
    this._bounds = b;
    this._boardCenter.set((b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2);
    this._frame(b);
    return group;
  }

  clearBoard() {
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
  }

  /** Lanza la celebración: el dino de la bola sale del hoyo y baila + confeti. */
  spawnCelebration(x, z, ballDef) {
    if (!this.boardGroup) return;
    this.clearCelebration();
    const dino = buildDino(ballDef);
    dino.position.set(x, -1.4, z);
    const { points, velocities } = buildConfetti(ballDef.dino);
    points.position.set(x, 0.6, z);
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

  /** Encuadra la cámara para que el tablero entre completo (también en vertical/móvil). */
  _frame(bounds) {
    const radius = Math.max(bounds.width, bounds.depth) / 2 + 2.2;
    const aspect = this.camera.aspect;
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const limiting = Math.min(vFov, hFov);
    const dist = radius / Math.tan(limiting / 2) + radius * 0.4;
    const pos = CAM_DIR.clone().multiplyScalar(dist).add(this._boardCenter);
    this.camera.position.copy(pos);
    this.camera.lookAt(this._boardCenter);
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
