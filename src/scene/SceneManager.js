// SceneManager.js — Envoltorio de Three.js: renderer, cámara, luces, fondo y montaje
// del tablero. Aísla todo lo "3D" del resto del juego.

import * as THREE from 'three';
import { makeContactShadowTexture, getTheme, makeGlowTexture } from './textures.js';
import { buildBoard } from './BoardBuilder.js';
import { buildDino, buildConfetti } from './CelebrationDino.js';
import { buildCaveman, buildThrownSpear } from './Caveman.js';
import { makeRocket, makeRocketFlame, makeGlow, makeFireworkBurst } from './RocketArt.js';
import { makeCoin, makeStarToken, makeTrapCover, makePtero } from './collectibleArt.js';
import { footprintBounds, isInsideFootprint } from '../physics/footprint.js';
import { loadGLB, fitModel } from './gltf.js';
import { PHYS } from '../utils/constants.js';
import { countResize } from '../utils/perf.js';
import { getGraphicsProfile } from '../utils/device.js';

// Altura/giro POR DEFECTO de los modelos 3D de celebración (cada entrada de CELEBRATION_MODELS
// puede sobreescribir `height`/`yaw`). La altura mantiene la proporción con los dinos procedurales;
// el yaw orienta el frente del GLB hacia la cámara (+Z). Ajustables.
const CELEB_MODEL_HEIGHT = 2.2;
const CELEB_MODEL_YAW = Math.PI;

/** ¿Entorno de desarrollo? (localhost). Los logs de celebración NO salen en producción. */
function _celebDev() {
  try { const h = (typeof location !== 'undefined' && location.hostname) || ''; return h === 'localhost' || h === '127.0.0.1' || h === '' || h === '0.0.0.0'; }
  catch (_) { return false; }
}

const CAM_DIR = new THREE.Vector3(0, 0.92, 1.0).normalize(); // dirección fija de la cámara
const WORLD_UP = new THREE.Vector3(0, 1, 0);                  // "arriba" del mundo (base de cámara)
const V_FOV = 48;
// Acercamiento extra SOLO en móvil horizontal (tablero más grande sin recortar). 1.0 = sin
// cambio; >1 = más cerca. Aprovecha el margen conservador del encaje por inclinación máxima.
const LANDSCAPE_MOBILE_ZOOM = 1.16;
// Ajuste fino ADICIONAL de acercamiento en móvil horizontal (tablero un poco más grande).
// Fácil de afinar: 1.0 = sin cambio extra; >1 = más cerca. Conservador: el footprint del
// tablero sigue ≤ 1.0 NDC al inclinar al máximo en diagonal (margen ~1.6% global; ~5% en
// aspectos de teléfono típicos 16:9–20:9). Verificado en canvas-smoke contra los 50 niveles.
const LANDSCAPE_MOBILE_ZOOM_FACTOR = 1.03;
// Banda de decoración alrededor del tablero (debe coincidir con decorate() en
// BoardBuilder). El encuadre la incluye para que la decoración no se "corte".
const DECOR_MARGIN = 2.0;
// En MÓVIL horizontal reservamos MENOS banda de decoración en el encaje para que el TABLERO
// sea claramente el protagonista. La decoración exterior puede asomar levemente fuera del
// borde SOLO al inclinar al máximo (transitorio, más inmersivo); el footprint del tablero
// sigue garantizado dentro de pantalla (verificado en canvas-smoke contra los 50 niveles).
const LANDSCAPE_MOBILE_DECOR = 1.5;
// Altura del "suelo" (donde se proyecta la sombra del tablero). Ya no hay plano de
// suelo opaco: el fondo del gameplay es la imagen jurásica (CSS) detrás del lienzo.
const GROUND_Y = -4.2;

// ── Encuadre de cámara (funciones PURAS, testeables) ────────────────────────
// Devuelven {dist, target:{x,y,z}, pos:{x,y,z}} a partir de los datos del tablero y de la
// cámara, sin tocar estado. Las usa SceneManager._frame y se verifican en los tests.
//   · VERTICAL  → computeSphereFrame: encaje por esfera (estable; se mantiene tal cual).
//   · HORIZONTAL → computeAxisFrame: encaje por EJE (ancho→FOV horizontal, alto→vertical)
//     para que el tablero se vea GRANDE sin desperdiciar el ancho.

/** VERTICAL: una esfera centrada en el tablero lo contiene a cualquier inclinación. */
export function computeSphereFrame(bounds, boardCenter, fovDeg, aspect, fit = {}) {
  const cx = boardCenter.x, cy = boardCenter.y || 0, cz = boardCenter.z;
  const centerLen = Math.hypot(cx, cy, cz);
  const halfDiag = Math.hypot(bounds.width / 2, bounds.depth / 2);
  const decorReach = Math.max(bounds.width, bounds.depth) / 2 + DECOR_MARGIN;
  const radius = Math.max(halfDiag, decorReach) + centerLen + 0.5;

  const vFov = THREE.MathUtils.degToRad(fovDeg);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const limiting = Math.min(vFov, hFov);
  let marginK = 0.03, raiseK = 0.05;
  if (fit.smallPortrait) { marginK = 0.012; raiseK = 0.085; }
  const dist = radius / Math.sin(limiting / 2) + radius * marginK;
  const target = { x: cx, y: cy, z: cz + radius * raiseK };
  const pos = { x: CAM_DIR.x * dist + cx, y: CAM_DIR.y * dist + cy, z: CAM_DIR.z * dist + cz };
  return { dist, target, pos };
}

/** HORIZONTAL: ajusta las 8 esquinas reales del tablero a AMBOS FOV (tablero más grande). */
export function computeAxisFrame(bounds, boardCenter, fovDeg, aspect, fit = {}) {
  const cx = boardCenter.x, cy = boardCenter.y || 0, cz = boardCenter.z;
  const centerLen = Math.hypot(cx, cy, cz);
  // Banda de decoración reservada: menor en móvil horizontal (tablero protagonista).
  const decorM = fit.landscapeMobile ? LANDSCAPE_MOBILE_DECOR : DECOR_MARGIN;
  const hx = bounds.width / 2 + decorM;   // semiancho (X)
  const hz = bounds.depth / 2 + decorM;    // semiprofundidad (Z)
  // Balanceo vertical por inclinación máxima (cota segura desde el pivote/origen).
  const tiltSwing = (centerLen + Math.hypot(hx, hz)) * Math.sin(PHYS.MAX_TILT);
  const hy = 1.7 + tiltSwing;

  // Base de cámara (dirección fija; "arriba" del mundo = +Y).
  const forward = CAM_DIR.clone().negate();
  const right = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();

  const vFov = THREE.MathUtils.degToRad(fovDeg);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const tanV = Math.tan(vFov / 2), tanH = Math.tan(hFov / 2);

  let marginK = 0.06, raiseK = 0.02;
  // Móvil horizontal: tablero CENTRADO (raiseK 0) para recuperar margen vertical y poder
  // acercar un poco más sin que el borde superior se recorte al inclinar al máximo.
  if (fit.landscapeMobile) { marginK = 0.02; raiseK = 0.0; }
  const raiseZ = Math.max(hx, hz) * raiseK;
  const target = { x: cx, y: cy, z: cz + raiseZ };

  let dist = Math.hypot(hx, hz); // suelo: no meter la cámara dentro del tablero
  const o = new THREE.Vector3();
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    o.set(sx * hx, sy * hy, sz * hz - raiseZ); // offset de la esquina respecto al target
    const a = Math.abs(o.dot(right));   // extensión horizontal en pantalla
    const b = Math.abs(o.dot(up));      // extensión vertical en pantalla
    const c = o.dot(forward);           // profundidad (perspectiva)
    dist = Math.max(dist, a / tanH - c, b / tanV - c);
  }
  dist *= (1 + marginK);
  // Ajuste fino MÓVIL HORIZONTAL: la cota por inclinación máxima ('hy') es conservadora y
  // dejaba ~19% de pantalla sin usar. Acercamos la cámara un punto extra para que el tablero
  // se vea más grande, sin recortar (verificado contra la geometría real en canvas-smoke).
  if (fit.landscapeMobile) dist /= (LANDSCAPE_MOBILE_ZOOM * LANDSCAPE_MOBILE_ZOOM_FACTOR);

  const pos = { x: CAM_DIR.x * dist + target.x, y: CAM_DIR.y * dist + target.y, z: CAM_DIR.z * dist + target.z };
  return { dist, target, pos };
}

export class SceneManager {
  constructor(container) {
    this.container = container;
    // alpha: lienzo TRANSPARENTE → se ve la imagen jurásica (fondo CSS) detrás del tablero.
    // PERFIL GRÁFICO activo (quality/balanced/performance) según el dispositivo (Android/WebView →
    // performance). Ajusta pixelRatio, sombras, halos y partículas SIN tocar la jugabilidad.
    this.gfx = getGraphicsProfile();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    // Techo del devicePixelRatio del perfil: en Android/emulador se limita (1,0/1,25) para no disparar
    // el coste de relleno; en escritorio se permite 2. Menos píxeles = mucho más fluido en móvil.
    this._dprCap = this.gfx.pixelRatioCap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this._dprCap));
    // Caché del último tamaño aplicado: resize() ignora llamadas sin cambio real (evita reasignar
    // el buffer GL en cada evento espurio de visualViewport/resize → causa de tirones al mover).
    this._lastW = 0; this._lastH = 0; this._lastDpr = 0;
    this.renderer.setClearColor(0x000000, 0); // sin color de fondo (transparente)
    // Sombras dinámicas SOLO en 'quality': el mapa de sombras suaves (PCF) es caro en móvil. Con
    // shadows=false no se renderiza mapa de sombras (las sombras "de contacto" son planos con textura).
    this.renderer.shadowMap.enabled = this.gfx.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping cinematográfico para un acabado más profesional.
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    // El fondo del gameplay es la IMAGEN jurásica (CSS, detrás del lienzo transparente):
    // la escena 3D NO pinta cielo propio.
    this.scene.background = null;
    this._bgTexture = null;
    // Niebla LEJANA y sutil: solo afecta a geometría muy distante (no "empaña" el tablero).
    this.scene.fog = new THREE.Fog(0xbfe3d0, 80, 220);

    this.camera = new THREE.PerspectiveCamera(V_FOV, 1, 0.1, 260);
    this.camera.position.set(0, 14, 16);
    this.camera.lookAt(0, 0, 0);

    this._addLights();
    this.ground = null; // sin plano de suelo opaco: se ve la imagen jurásica detrás

    this.boardGroup = null;
    this.animated = [];
    this._ballMesh = null;
    this._boardCenter = new THREE.Vector3();
    this._t = 0;
    this._shake = 0;
    this._fit = {};          // perfil de viewport (afina el encuadre por dispositivo)
    this._celebration = null;
    // Celebración por ESPECIE: modelos 3D cacheados (species → pivot) + promesas y rutas en curso.
    // Cada bola saca SU dinosaurio del hoyo; una especie sin GLB cae al procedural (buildDino).
    this._celebModels = new Map();        // species → THREE.Group (modelo cargado, reutilizado)
    this._celebModelPromises = new Map(); // species → Promise (carga en curso/hecha; no re-carga)
    this._celebModelPaths = new Map();    // species → ruta usada (para logs de desarrollo)
    this._collectibles = []; // {mesh, x, z, type, taken}
    this._pickFx = [];       // efectos "pop" al recoger
    this._ptero = null;      // estado del ptero-rescate
    this._bursts = [];       // ráfagas de partículas (estrella, rescate)
    this._portalRings = [];  // anillos de luz al teletransportar (entrada/salida)
    this._caveman = null;    // cavernícola con lanza (niveles 5, 10, …)
    this._spearFx = null;    // lanza-proyectil (al lanzar hacia el jugador)
    this._rockets = [];      // cohetes en reposo sobre el tablero (ítems recogibles)
    this._rocketFx = [];     // cohetes en animación (lanzamiento/fuegos/evento ptero)

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
    // Sombras dinámicas SOLO en perfil 'quality'. En móvil/Android se apagan (gran ahorro GPU): la
    // iluminación se mantiene, solo desaparece la sombra proyectada en tiempo real.
    if (this.gfx.shadows) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      // Volumen de sombra amplio: cubre el tablero + decoración incluso inclinado, así nada pierde
      // su sombra al girar.
      const s = 34;
      sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
      sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 100;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.02;
    }
    this.scene.add(sun);
    this.scene.add(sun.target); // necesario para que el objetivo de la sombra se actualice
    this.sun = sun;
    // Luz de relleno fría desde atrás: separa la bola/tablero del fondo (rim light).
    const rim = new THREE.DirectionalLight(0x88b4ff, 0.4);
    rim.position.set(-12, 8, -10);
    this.scene.add(rim);
  }

  /** Ambientación del bioma: ahora solo ajusta la NIEBLA (el fondo es la imagen
   *  jurásica vía CSS; no se pinta cielo ni suelo 3D). */
  applyTheme(name) {
    const theme = getTheme(name);
    if (this.scene.fog) this.scene.fog.color.set(theme.fog);
  }

  /** Sustituye el tablero actual por el del nivel dado y añade la bola. */
  mountLevel(level, ballMesh) {
    this.clearBoard();
    this.applyTheme(level.theme);
    const { group, animated, trapMeshes } = buildBoard(level);
    group.add(ballMesh);
    group.add(this._contactShadow);
    this._ballMesh = ballMesh;
    this._trapMeshes = trapMeshes || []; // mallas de trampa (para hoyos dinámicos)
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

    // Sombra grande del tablero (anclaje sobre el paisaje + sensación de elevación).
    this._boardShadow.scale.set(b.width + 6, b.depth + 6, 1);
    this._boardShadow.position.set(this._boardCenter.x, GROUND_Y + 0.06, this._boardCenter.z);
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
    // Los MODELOS 3D de celebración (uno por especie) se REUTILIZAN: sacarlos antes de liberar el
    // tablero para no disponer su geometría/texturas (si alguno quedó colgando tras la celebración).
    for (const model of this._celebModels.values()) {
      if (model && model.parent) model.parent.remove(model);
    }
    this.scene.remove(this.boardGroup);
    disposeTree(this.boardGroup);
    this.boardGroup = null;
    this.animated = [];
    this._celebration = null; // sus objetos se liberan con el árbol del tablero
    this._collectibles = [];  // sus meshes colgaban del tablero (ya liberados)
    this._pickFx = [];
    this._bursts = [];        // sus puntos colgaban del tablero (ya liberados)
    this._portalRings = [];   // sus mallas colgaban del tablero (ya liberadas)
    this._caveman = null;     // su grupo colgaba del tablero (ya liberado)
    this._rockets = [];       // sus mallas colgaban del tablero (ya liberadas)
    // Las animaciones de cohete viven en la raíz de la escena: liberar a mano.
    for (const fx of this._rocketFx) this._disposeRocketFx(fx);
    this._rocketFx = [];
    if (this._spearFx) { this.scene.remove(this._spearFx.mesh); disposeTree(this._spearFx.mesh); this._spearFx = null; }
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

  /** Ráfaga de partículas (confeti) en un punto del tablero. */
  spawnBurst(x, y, z, colorHex) {
    if (!this.boardGroup) return;
    const { points, velocities } = buildConfetti(colorHex || '#ffd86b');
    points.position.set(x, y, z);
    points.frustumCulled = false;
    this.boardGroup.add(points);
    this._bursts.push({ points, velocities, t: 0 });
  }

  /**
   * Efecto de invocación/teletransporte del portal: un aro de luz naranja que se
   * expande y desvanece, más una ráfaga de chispas. Se lanza en la entrada y la
   * salida para que el "salto" se lea con claridad. Ligero para móvil.
   */
  spawnPortalFx(x, z, colorHex = '#ffb15a') {
    if (!this.boardGroup) return;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.42, 28),
      new THREE.MeshBasicMaterial({
        color: colorHex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, opacity: 0.9, side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.12, z);
    ring.frustumCulled = false;
    this.boardGroup.add(ring);
    this._portalRings.push({ mesh: ring, t: 0, dur: 0.5 });
    this.spawnBurst(x, 0.35, z, colorHex);
  }

  /**
   * Mueve/escala/colorea un hoyo trampa DINÁMICO (lo llama el sistema de hoyos dinámicos).
   * @param {number} index  índice de la trampa en el nivel
   * @param {number} x @param {number} z  posición actual (unidades del tablero)
   * @param {number} r  radio actual @param {boolean} active  ¿puede tragar la bola?
   */
  setTrapTransform(index, x, z, r, active) {
    const tm = this._trapMeshes && this._trapMeshes[index];
    if (!tm) return;
    const s = Math.max(0.04, r / (tm.baseR || 1));
    tm.hole.position.x = x; tm.hole.position.z = z;
    tm.ring.position.x = x; tm.ring.position.z = z;
    tm.hole.scale.set(s, 1, s);   // el cilindro mantiene su altura (Y), cambia su radio (X/Z)
    tm.ring.scale.set(s, s, s);
    // Señal de peligro: rojo INTENSO + leve pulso cuando puede tragar; apagado/translúcido si no.
    const glow = active ? (0.6 + 0.25 * Math.sin(this._t * 6)) : 0.06;
    if (tm.ring.material) {
      tm.ring.material.emissiveIntensity = glow;
      tm.ring.material.transparent = true;
      tm.ring.material.opacity = active ? 1 : 0.4;
    }
    if (tm.hole.material) { tm.hole.material.transparent = true; tm.hole.material.opacity = active ? 1 : 0.5; }
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
      if (!P.burstDone) { this.spawnBurst(P.safeX, PHYS.BALL_RADIUS + 0.3, P.safeZ, '#bfe3ff'); P.burstDone = true; }
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

  /**
   * Precarga (una vez, CACHEADA POR ESPECIE) el MODELO 3D de celebración de una especie. Al ganar
   * con esa bola, si el modelo está listo sustituye al dino procedural; si no cargó, se usa el
   * procedural (fallback). El modelo se envuelve en un PIVOTE (malla centrada, base a y=0) para que
   * la animación de celebración lo mueva igual que a los dinos procedurales. NO lanza si falla.
   * @param {string} species  clave de especie ('trex', 'triceratops', …)
   * @param {{path:string, fallbackPath?:string, height?:number, yaw?:number}} entry  ver CELEBRATION_MODELS
   */
  preloadCelebrationModel(species, entry) {
    if (!species || !entry || !entry.path) return Promise.resolve(null);
    if (this._celebModelPromises.has(species)) return this._celebModelPromises.get(species);
    const height = entry.height || CELEB_MODEL_HEIGHT;
    const yaw = entry.yaw == null ? CELEB_MODEL_YAW : entry.yaw;
    if (_celebDev()) console.log('CELEBRATION_MODEL_PATH', species, entry.path);
    const promise = (async () => {
      // Intenta la ruta principal y, si falla, la de reserva. Devuelve el pivote o null (procedural).
      const urls = [entry.path, entry.fallbackPath].filter(Boolean);
      for (const url of urls) {
        try {
          const { scene } = await loadGLB(url);
          fitModel(scene, { targetHeight: height, faceYaw: yaw, shadows: true });
          // Normaliza materiales para que el modelo se vea BIEN en cualquier GPU: NO metálico (si el
          // metallicRoughness map no cargara, el default metalness=1 dejaría el modelo NEGRO sin env
          // map), emissive SUTIL, sRGB en los mapas de color, y OPACO (algunos exports Mixamo marcan
          // BLEND por error → el personaje saldría invisible). Materiales 'shared' (se reutiliza).
          let meshes = 0; const matNames = [];
          scene.traverse((o) => {
            if (!o.isMesh || !o.material) return;
            meshes++;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of mats) {
              matNames.push(m.name || m.type);
              if ('metalness' in m) m.metalness = 0;
              if (m.emissive) m.emissiveIntensity = 0.2;
              if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
              if (m.emissiveMap) m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
              if (m.opacity == null || m.opacity >= 1) { m.transparent = false; m.depthWrite = true; m.alphaTest = 0; }
              m.userData = m.userData || {}; m.userData.shared = true;
              m.needsUpdate = true;
            }
          });
          const pivot = new THREE.Group();
          pivot.add(scene);
          pivot.traverse((o) => { o.frustumCulled = false; });
          this._celebModels.set(species, pivot);
          this._celebModelPaths.set(species, url);
          if (_celebDev()) { console.log('CELEBRATION_MODEL_LOADED', species, true, url); console.log('CELEBRATION_MODEL_CHILDREN', species, meshes); console.log('CELEBRATION_MODEL_MATERIALS', species, matNames.join(', ')); }
          return pivot;
        } catch (e) {
          if (_celebDev()) console.warn('CELEBRATION_MODEL_LOAD_FAIL', species, url, (e && e.message) || e);
        }
      }
      this._celebModels.set(species, null); // todas las rutas fallaron → dino procedural
      if (_celebDev()) console.warn('CELEBRATION_MODEL_LOADED', species, false);
      return null;
    })();
    this._celebModelPromises.set(species, promise);
    return promise;
  }

  /** Lanza la celebración: el dino de la bola (o su modelo 3D POR ESPECIE) sale del hoyo y baila
   *  + confeti. El modelo se elige por `ballDef.species` (cada bola SU dinosaurio); si esa especie
   *  no tiene GLB cargado, se usa el dino PROCEDURAL de la MISMA especie (buildDino). */
  spawnCelebration(x, z, ballDef) {
    if (!this.boardGroup) return;
    this.clearCelebration();
    const species = (ballDef && ballDef.species) || 'trex';
    if (_celebDev()) console.log('CELEBRATION_SPECIES', species);
    // Prioridad: modelo 3D de ESTA especie si está cargado; si no, procedural (misma especie).
    const speciesModel = this._celebModels.get(species) || null;
    const useModel = !!speciesModel;
    let dino;
    if (useModel) {
      dino = speciesModel;
      dino.position.set(0, 0, 0); dino.rotation.set(0, 0, 0); dino.scale.set(1, 1, 1); // reset (reutilizado)
      if (_celebDev()) console.log('CELEBRATION_MODEL_USED', species, this._celebModelPaths.get(species) || true);
    } else {
      dino = buildDino(ballDef);
      // No hay GLB para esta especie (o no cargó) → dino procedural de la especie. Aviso en desarrollo.
      if (_celebDev()) console.warn('CELEBRATION_MODEL_FALLBACK_USED', species, 'procedural buildDino');
    }
    dino.position.set(x, -1.4, z);
    // Partículas escaladas por el perfil (menos confeti en móvil).
    const { points, velocities } = buildConfetti(ballDef.dino, this.gfx.particleScale);
    points.position.set(x, 0.6, z);
    // Aura de victoria: halo aditivo bajo el dino. Solo con heavyGlows (perfil quality/balanced);
    // en 'performance' se omite (ahorra un plano aditivo grande cada frame de la celebración).
    let aura = null;
    if (this.gfx.heavyGlows) {
      aura = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 3.4),
        new THREE.MeshBasicMaterial({
          map: makeGlowTexture('#ffe7a0'), transparent: true, depthWrite: false,
          blending: THREE.AdditiveBlending, opacity: 0,
        })
      );
      aura.rotation.x = -Math.PI / 2; aura.position.set(x, 0.04, z);
      aura.frustumCulled = false;
      this.boardGroup.add(aura);
    }
    // Se añaden después del traverse de mountLevel: desactivar su culling aquí.
    dino.traverse((o) => { o.frustumCulled = false; });
    points.frustumCulled = false;
    this.boardGroup.add(dino);
    this.boardGroup.add(points);
    // Polvo al emerger del hoyo (impacto visual).
    this.spawnBurst(x, 0.15, z, '#d8c39a');
    this._celebration = {
      dino, points, velocities, aura, t: 0, baseY: 0.0, baseX: x, baseZ: z,
      isModel: useModel,
      anim: useModel ? 'model' : dino.userData.anim, head: dino.userData.head, neck: dino.userData.neck,
      tail: dino.userData.tail, arms: dino.userData.arms || [],
      jaw: dino.userData.jaw || null, crest: dino.userData.crest || null, legs: dino.userData.legs || [],
    };
  }

  clearCelebration() {
    if (!this._celebration || !this.boardGroup) { this._celebration = null; return; }
    const c = this._celebration;
    // El MODELO 3D cacheado se REUTILIZA: solo se quita del tablero, NO se libera. El dino
    // procedural y el confeti/aura sí se liberan.
    if (c.dino) {
      if (c.dino.parent) c.dino.parent.remove(c.dino);
      if (!c.isModel) disposeTree(c.dino);
    }
    for (const obj of [c.points, c.aura]) {
      if (!obj) continue;
      if (obj.parent) obj.parent.remove(obj);
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

    // Salida del hoyo (0–0.4 s) con overshoot, y luego saltitos (primer salto fuerte).
    let y = c.baseY;
    let sy = 1;
    if (t < 0.4) {
      const e = 1 - Math.pow(1 - t / 0.4, 3);
      y = -1.4 + (c.baseY + 1.4) * e + Math.sin(e * Math.PI) * 0.35; // overshoot = impacto
      sy = 1 + Math.sin(e * Math.PI) * 0.14; // estiramiento vertical al emerger del hoyo
    } else {
      const hop = c.anim === 'neck' ? 0.12 : 0.3; // el braquiosaurio salta menos
      const boost = t < 0.95 ? 1.7 : 1; // primer salto más alto
      y = c.baseY + Math.abs(Math.sin((t - 0.4) * 7)) * hop * boost;
    }
    d.position.set(c.baseX, y, c.baseZ);
    d.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy)); // squash&stretch (conserva volumen)
    d.rotation.set(0, d.rotation.y + dt * 1.2, 0); // giro base lento

    // Aura de victoria: aparece, late y se desvanece al final.
    if (c.aura) {
      const fade = t < 1.3 ? Math.min(1, t * 3) : Math.max(0, (1.7 - t) / 0.4);
      c.aura.material.opacity = 0.8 * fade * (0.75 + 0.25 * Math.sin(t * 6));
      c.aura.scale.setScalar(1 + 0.12 * Math.sin(t * 4));
    }

    // Animación específica de la especie.
    if (t > 0.4) {
      const u = t - 0.4;
      switch (c.anim) {
        case 'model': // Triceratops bebé (GLB estático): animación PROCEDURAL — balanceo suave + giro alegre
          d.rotation.z = Math.sin(u * 6) * 0.10;
          d.rotation.y += dt * 1.6; break;
        case 'spin': // Raptor: giro veloz + coletazo rígido
          d.rotation.y += dt * 5; if (c.tail) c.tail.rotation.z = Math.sin(u * 12) * 0.3; break;
        case 'dance': // Parasaurio: balanceo + cabeceo de la cresta
          d.rotation.z = Math.sin(u * 8) * 0.18;
          if (c.crest) c.crest.rotation.x = Math.sin(u * 8) * 0.16; break;
        case 'charge': // Triceratops: embestida adelante/atrás + cabezazo de cuernos
          d.position.z = c.baseZ + Math.sin(u * 6) * 0.45;
          if (c.head) c.head.rotation.x = Math.max(0, Math.sin(u * 6)) * 0.45; break;
        case 'neck': // Braquiosaurio: mecer el cuello largo
          if (c.neck) c.neck.rotation.x = -0.3 + Math.sin(u * 3) * 0.45; break;
        case 'roar':
        default: // T-Rex: cabezazo + mandíbula que abre al rugir
          if (c.head) c.head.rotation.x = -0.12 + Math.sin(u * 9) * 0.32;
          if (c.jaw) c.jaw.rotation.x = 0.12 + Math.max(0, Math.sin(u * 9)) * 0.5; break;
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

  // --- Cavernícola con lanza (enemigo dinámico desde el nivel 5) --------------

  /** Coloca un cavernícola que patrulla LEJOS del hoyo verde y sin tocar ningún hoyo. */
  spawnCaveman(goal, footprint, traps, portals) {
    if (!this.boardGroup || !goal) return;
    const { group, legL, legR, armL, armThrow, head, body, spear } = buildCaveman();
    group.traverse((o) => { o.frustumCulled = false; });
    this.boardGroup.add(group);
    const b = this._bounds || { minX: goal.x - 4, maxX: goal.x + 4, minZ: goal.z - 4, maxZ: goal.z + 4 };
    const r = 0.55;
    const c = {
      group, legL, legR, armL, armThrow, head, body, spear,
      footprint: footprint || null, traps: traps || [], portals: portals || [],
      goalX: goal.x, goalZ: goal.z, goalR: goal.r || 1,
      // Separación mínima CLARA del hoyo verde (no bloquea su entrada).
      goalMin: Math.max(2.4, (goal.r || 1) + r + 1.1),
      bounds: b, r, baseY: 0.0, speed: 1.25,
      x: goal.x, z: goal.z, target: null, facing: 0, mode: 'walk', attackP: 0, walkT: 0, nextPick: 0, active: true,
    };
    this._caveman = c;
    // Posición inicial válida en la banda LEJOS del hoyo (no lo tapa, dentro del tablero).
    const start = this._safeCavemanSpot() || { x: this._clampBound(goal.x + c.goalMin, 'x'), z: goal.z };
    c.x = start.x; c.z = start.z;
    group.position.set(c.x, c.baseY, c.z);
    this._pickCavemanTarget();
  }

  _clampBound(v, axis) {
    const b = this._caveman.bounds;
    return axis === 'x' ? Math.max(b.minX + 0.8, Math.min(b.maxX - 0.8, v))
      : Math.max(b.minZ + 0.8, Math.min(b.maxZ - 0.8, v));
  }

  /** ¿(x,z) es transitable? Dentro de la huella y sin tocar NINGÚN hoyo (meta/trampas/portales). */
  _cavemanWalkable(x, z) {
    const c = this._caveman;
    const b = c.bounds;
    if (x < b.minX + 0.8 || x > b.maxX - 0.8 || z < b.minZ + 0.8 || z > b.maxZ - 0.8) return false;
    if (c.footprint) {
      if (!isInsideFootprint(c.footprint, x, z)) return false;
      for (const [ox, oz] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) {
        if (!isInsideFootprint(c.footprint, x + ox, z + oz)) return false;
      }
    }
    if (Math.hypot(x - c.goalX, z - c.goalZ) < c.goalMin) return false;   // lejos del hoyo verde
    const M = 0.45; // holgura del cuerpo respecto al borde de cualquier hoyo
    for (const t of c.traps) { if (Math.hypot(x - t.x, z - t.z) < (t.r || 1) + c.r + M) return false; }
    for (const p of c.portals) { if (Math.hypot(x - p.x, z - p.z) < (p.r || 1) + c.r + M) return false; }
    return true;
  }

  /** El segmento (x0,z0)→(x1,z1) no cruza ningún hoyo (muestreo). */
  _cavemanPathClear(x0, z0, x1, z1) {
    const steps = 7;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (!this._cavemanWalkable(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t)) return false;
    }
    return true;
  }

  /** Punto transitable en la banda alrededor del hoyo (goalMin … goalMin+1.4), o null. */
  _safeCavemanSpot() {
    const c = this._caveman;
    for (let tries = 0; tries < 30; tries++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = c.goalMin + Math.random() * 1.4;
      const x = c.goalX + Math.cos(ang) * rad, z = c.goalZ + Math.sin(ang) * rad;
      if (this._cavemanWalkable(x, z)) return { x, z };
    }
    return null;
  }

  /** Nuevo destino transitable con el CAMINO despejado (sin cruzar ningún hoyo). */
  _pickCavemanTarget() {
    const c = this._caveman; if (!c) return;
    for (let tries = 0; tries < 14; tries++) {
      const spot = this._safeCavemanSpot();
      if (spot && this._cavemanPathClear(c.x, c.z, spot.x, spot.z)) { c.target = spot; return; }
    }
    c.target = this._safeCavemanSpot() || { x: c.x, z: c.z }; // último recurso
  }

  /** Posición lógica del cavernícola para la colisión (o null). */
  cavemanPos() {
    const c = this._caveman;
    if (!c || !c.active || c.mode !== 'walk') return null;
    return { x: c.x, z: c.z, r: c.r };
  }

  /** Inicia el ataque (deja de caminar). Game controla el progreso. */
  cavemanStartAttack() {
    const c = this._caveman; if (!c) return;
    c.mode = 'attack'; c.attackP = 0; c._spearThrown = false;
  }

  /** Renderiza la pose del ataque para progreso p∈[0,1]: patada → giro → lanzamiento. */
  animateCavemanAttack(p) {
    const c = this._caveman; if (!c || c.mode !== 'attack') return;
    c.attackP = p;
    const g = c.group;
    // Patada (0–0.28): pierna derecha golpea adelante, leve inclinación.
    const kick = p < 0.28 ? Math.sin((p / 0.28) * Math.PI) : 0;
    c.legR.rotation.x = -1.5 * kick;
    c.legL.rotation.x = 0.3 * kick;
    g.rotation.z = 0.12 * kick;
    // Giro hacia el jugador (0.28–0.5): rota a mirar +Z (cámara).
    if (p >= 0.28) {
      const tp = Math.min(1, (p - 0.28) / 0.22);
      g.rotation.y = c.facing * (1 - tp);
      c.legR.rotation.x = 0; c.legL.rotation.x = 0; g.rotation.z = 0;
    }
    // Armado y lanzamiento (0.5–0.85): el brazo se echa atrás y golpea adelante.
    if (p >= 0.5) {
      const tp = (p - 0.5) / 0.35; // 0..1
      const wind = tp < 0.5 ? tp / 0.5 : 1; // armado
      const fire = tp < 0.5 ? 0 : (tp - 0.5) / 0.5; // disparo
      c.armThrow.rotation.x = -2.2 * wind + 3.0 * fire;
      c.head.rotation.x = -0.15 * wind;
      // Suelta la lanza-proyectil hacia el jugador a mitad del disparo.
      if (!c._spearThrown && fire > 0.25) { c._spearThrown = true; this._throwSpear(); }
    }
  }

  /** Termina el ataque: vuelve a caminar y recoloca lejos de la bola. */
  cavemanEndAttack(awayX, awayZ) {
    const c = this._caveman; if (!c) return;
    c.mode = 'walk'; c.attackP = 0;
    c.armThrow.rotation.set(0, 0, -0.35); c.armL.rotation.set(-0.2, 0, 0.5);
    c.legL.rotation.x = 0; c.legR.rotation.x = 0; c.group.rotation.set(0, 0, 0);
    if (c.spear) c.spear.visible = true; // recupera su lanza (otra para el próximo)
    // Recolócate en la banda LEJOS del hoyo y lejos del reinicio de la bola.
    if (typeof awayX === 'number') {
      for (let tries = 0; tries < 22; tries++) {
        const ang = Math.random() * Math.PI * 2;
        const r = c.goalMin + Math.random() * 1.4;
        const x = c.goalX + Math.cos(ang) * r, z = c.goalZ + Math.sin(ang) * r;
        if (this._cavemanWalkable(x, z) && Math.hypot(x - awayX, z - awayZ) > 2.0) {
          c.x = x; c.z = z; c.group.position.set(c.x, c.baseY, c.z); break;
        }
      }
    }
    c.nextPick = 0;
    this._pickCavemanTarget();
  }

  /** Crea la lanza-proyectil que vuela hacia el jugador (cámara). */
  _throwSpear() {
    const c = this._caveman; if (!c) return;
    if (c.spear) c.spear.visible = false; // la lanza sujeta "sale volando"
    const mesh = buildThrownSpear();
    mesh.traverse((o) => { o.frustumCulled = false; });
    const from = new THREE.Vector3(); c.armThrow.getWorldPosition(from); from.y += 0.2;
    mesh.position.copy(from);
    this.scene.add(mesh);
    const to = this.camera.position.clone(); // hacia el jugador
    this._spearFx = { mesh, t: 0, dur: 0.5, from, to };
  }

  _animateSpearFx(dt) {
    const s = this._spearFx; if (!s) return;
    s.t += dt;
    const p = Math.min(1, s.t / s.dur);
    s.mesh.position.lerpVectors(s.from, s.to, p);
    s.mesh.lookAt(s.to);
    s.mesh.scale.setScalar(0.6 + p * 2.4); // se agranda al acercarse (impacto)
    if (p >= 1) { this.scene.remove(s.mesh); disposeTree(s.mesh); this._spearFx = null; }
  }

  _walkCaveman(dt) {
    const c = this._caveman;
    if (!c || c.mode !== 'walk') return;
    c.walkT += dt;
    if (!c.target) this._pickCavemanTarget();
    const dx = c.target.x - c.x, dz = c.target.z - c.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.12) {
      // Re-elige destino al llegar, con una pequeña pausa (evita recálculos en bucle).
      if (c.walkT >= c.nextPick) { this._pickCavemanTarget(); c.nextPick = c.walkT + 0.35; }
    } else {
      const step = Math.min(d, c.speed * dt);
      c.x += (dx / d) * step; c.z += (dz / d) * step;
      c.facing = Math.atan2(dx, dz); // +Z es "adelante"
      c.group.rotation.y = c.facing;
    }
    // Caminar: piernas y brazos alternan + rebote del cuerpo.
    const sw = Math.sin(c.walkT * 8);
    c.legL.rotation.x = sw * 0.6; c.legR.rotation.x = -sw * 0.6;
    c.armThrow.rotation.x = -sw * 0.3; c.armL.rotation.x = -0.2 + sw * 0.3;
    const bob = Math.abs(Math.sin(c.walkT * 8)) * 0.05;
    c.group.position.set(c.x, c.baseY + bob, c.z);
  }

  // --- Cohetes (ítems de celebración: color y raya roja) ---------------------

  /** Monta los cohetes del nivel sobre el tablero. rockets: [{x,z,type}]. */
  mountRockets(rockets) {
    this._rockets = [];
    if (!this.boardGroup) return;
    for (const r of rockets || []) {
      const mesh = makeRocket(r.type);
      mesh.position.set(r.x, 0.12, r.z);
      const glow = makeGlow(r.type === 'red' ? '#ff7a6a' : '#ffe7a0', 1.5);
      glow.position.set(r.x, 0.05, r.z);
      const grp = new THREE.Group(); grp.add(mesh); grp.add(glow);
      grp.traverse((o) => { o.frustumCulled = false; });
      this.boardGroup.add(grp);
      this._rockets.push({ grp, mesh, glow, x: r.x, z: r.z, type: r.type, active: true, phase: Math.random() * 6.28 });
    }
  }

  /** ¿La bola (bx,bz, radio) está sobre un cohete activo? Devuelve su índice o -1. */
  rocketHitTest(bx, bz, ballR, hitR) {
    for (let i = 0; i < this._rockets.length; i++) {
      const r = this._rockets[i];
      if (!r.active) continue;
      if (Math.hypot(r.x - bx, r.z - bz) < ballR + hitR) return i;
    }
    return -1;
  }

  /** Lanza el cohete de índice i: deja el tablero y empieza su animación en el aire. */
  launchRocket(i) {
    const r = this._rockets[i];
    if (!r || !r.active) return null;
    r.active = false;
    // Saca el cohete del tablero conservando su transformación mundial (vuela en el cielo).
    const m = r.mesh;
    m.updateWorldMatrix(true, false);
    const wp = new THREE.Vector3(); m.getWorldPosition(wp);
    const wq = new THREE.Quaternion(); m.getWorldQuaternion(wq);
    r.grp.remove(m); this.scene.add(m);
    m.position.copy(wp); m.quaternion.copy(wq);
    // Quita la malla en reposo (queda el grupo con el aura → la desvanecemos).
    this.boardGroup.remove(r.grp); disposeTree(r.grp);
    const flame = makeRocketFlame(); m.add(flame);
    const fx = {
      type: r.type, mesh: m, flame, t: 0, vy: 5.2, x0: wp.x, z0: wp.z, baseY: wp.y,
      state: r.type === 'red' ? 'rocketLaunching' : 'launching',
      trail: [], fw: null, glow: null, exploded: false, ptero: null, impactDone: false,
    };
    if (r.type === 'red') this._spawnEventPtero(fx, wp);
    this._rocketFx.push(fx);
    return fx;
  }

  /** Pterodáctilo del EVENTO (distinto de los ambientales). Coreografía cinematográfica:
   *  retardo (aparece y empieza a volar) → ASCENSO LENTO del cohete → impacto JUSTO cuando
   *  el ptero cruza la x del cohete (bien visible) → caída. */
  _spawnEventPtero(fx, rocketWp) {
    const meetY = rocketWp.y + 4.3;          // altura del encuentro (cielo, bien visible)
    const T_DELAY = 0.5, T_RISE = 1.5;        // despegue tardío + ascenso lento (≈2 s al impacto)
    const tImpact = T_DELAY + T_RISE;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const startX = rocketWp.x - dir * 13;     // entra desde fuera de pantalla
    const speed = (rocketWp.x - startX) / tImpact; // llega a la x del cohete EXACTO en el impacto
    const ptero = makePtero('#8a5a3a');
    ptero.traverse((o) => { o.frustumCulled = false; });
    ptero.position.set(startX, meetY, rocketWp.z);
    ptero.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    this.scene.add(ptero);
    fx.meetY = meetY; fx.tDelay = T_DELAY; fx.tRise = T_RISE; fx.tImpact = tImpact;
    fx.ptero = { mesh: ptero, x: startX, speed, dir, vy: 0, flapT: 0, falling: false };
  }

  _spawnTrailPuff(fx) {
    const puff = makeGlow(fx.type === 'red' ? '#ffcf9a' : '#fff0c0', 0.5);
    puff.rotation.x = 0; // mira a cámara (billboard sencillo: plano horizontal-ish)
    puff.position.set(fx.mesh.position.x, fx.mesh.position.y - 0.25, fx.mesh.position.z);
    this.scene.add(puff);
    fx.trail.push({ mesh: puff, t: 0 });
  }

  _explodeRocket(fx) {
    const { points, velocities } = makeFireworkBurst();
    points.position.copy(fx.mesh.position);
    points.frustumCulled = false;
    this.scene.add(points);
    fx.fw = { points, velocities, t: 0 };
    const glow = makeGlow('#fff0c0', 3.2); glow.rotation.x = 0;
    glow.position.copy(fx.mesh.position); this.scene.add(glow);
    fx.glow = { mesh: glow, t: 0 };
    if (fx.flame) { fx.mesh.remove(fx.flame); }
    this.scene.remove(fx.mesh); disposeTree(fx.mesh); fx.mesh = null;
    fx.exploded = true;
  }

  _impactRocket(fx) {
    // Destello + pequeña nube cartoon (sin sangre): glow + chispas.
    const pos = fx.mesh ? fx.mesh.position.clone() : fx.ptero.mesh.position.clone();
    const { points, velocities } = makeFireworkBurst();
    points.position.copy(pos); points.frustumCulled = false; this.scene.add(points);
    fx.fw = { points, velocities, t: 0 };
    const glow = makeGlow('#ffe7a0', 2.2); glow.rotation.x = 0; glow.position.copy(pos); this.scene.add(glow);
    fx.glow = { mesh: glow, t: 0 };
    if (fx.mesh) { this.scene.remove(fx.mesh); disposeTree(fx.mesh); fx.mesh = null; } // el cohete se consume en el impacto
    fx.impactDone = true;
    fx.ptero.falling = true; fx.ptero.vy = 1.6; // sale rebotado por el golpe y empieza a caer
  }

  _updateRockets(dt) {
    // Cohetes en reposo: flote + giro suave + brillo del aura.
    for (const r of this._rockets) {
      if (!r.active) continue;
      r.phase += dt;
      r.mesh.rotation.y += dt * 1.4;
      r.mesh.position.y = 0.12 + Math.sin(r.phase * 2.2) * 0.06;
      if (r.glow) r.glow.material.opacity = 0.55 + 0.25 * Math.sin(r.phase * 3);
    }
    // Cohetes en animación.
    for (let i = this._rocketFx.length - 1; i >= 0; i--) {
      const fx = this._rocketFx[i];
      if (this._stepRocketFx(fx, dt)) { this._disposeRocketFx(fx); this._rocketFx.splice(i, 1); }
    }
  }

  /** Avanza una animación de cohete. Devuelve true cuando ha terminado. */
  _stepRocketFx(fx, dt) {
    fx.t += dt;
    // Estela: partículas de brillo que se desvanecen.
    for (let j = fx.trail.length - 1; j >= 0; j--) {
      const p = fx.trail[j]; p.t += dt;
      const k = Math.min(1, p.t / 0.5);
      p.mesh.material.opacity = 0.8 * (1 - k);
      p.mesh.scale.setScalar(1 + k * 1.5);
      if (k >= 1) { this.scene.remove(p.mesh); disposeTree(p.mesh); fx.trail.splice(j, 1); }
    }
    // Fuegos / destello.
    if (fx.fw) {
      fx.fw.t += dt;
      const pos = fx.fw.points.geometry.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        fx.fw.velocities[k * 3 + 1] -= 3.2 * dt; // gravedad suave
        pos.setX(k, pos.getX(k) + fx.fw.velocities[k * 3] * dt);
        pos.setY(k, pos.getY(k) + fx.fw.velocities[k * 3 + 1] * dt);
        pos.setZ(k, pos.getZ(k) + fx.fw.velocities[k * 3 + 2] * dt);
      }
      pos.needsUpdate = true;
      fx.fw.points.material.opacity = Math.max(0, 1 - fx.fw.t / 1.15);
    }
    if (fx.glow) { fx.glow.t += dt; fx.glow.mesh.material.opacity = Math.max(0, 0.85 * (1 - fx.glow.t / 0.5)); fx.glow.mesh.scale.setScalar(1 + fx.glow.t * 4); }

    if (fx.type === 'color') return this._stepColorRocket(fx, dt);
    return this._stepRedRocket(fx, dt);
  }

  _stepColorRocket(fx, dt) {
    if (fx.state === 'launching' && fx.mesh) {
      fx.vy += 7 * dt;
      fx.mesh.position.y += fx.vy * dt;
      fx.mesh.rotation.y += dt * 6;
      if (fx.flame) fx.flame.scale.set(1, 0.8 + Math.random() * 0.5, 1);
      if (fx.t - (fx._lastPuff || 0) > 0.06) { fx._lastPuff = fx.t; this._spawnTrailPuff(fx); }
      if (fx.t >= 0.85) { this._explodeRocket(fx); fx.state = 'exploding'; }
      return false;
    }
    // exploding → done cuando se apagan los fuegos.
    return (!fx.fw || fx.fw.t >= 1.15) && fx.trail.length === 0;
  }

  _stepRedRocket(fx, dt) {
    const pt = fx.ptero;
    // Pterodáctilo: cruza la pantalla aleteando, o cae tras el impacto.
    if (pt) {
      pt.flapT += dt;
      if (pt.mesh.userData.wings) {
        const flap = Math.sin(pt.flapT * (pt.falling ? 8 : 16)) * 0.6;
        pt.mesh.userData.wings[0].rotation.z = flap;
        pt.mesh.userData.wings[1].rotation.z = -flap;
      }
      if (!pt.falling) {
        pt.x += pt.speed * dt;
        pt.mesh.position.set(pt.x, fx.meetY, pt.mesh.position.z); // y FIJA → impacto preciso
      } else {
        pt.vy -= 9 * dt; // gravedad
        pt.mesh.position.y += pt.vy * dt;
        pt.mesh.position.x += pt.dir * 1.5 * dt;
        pt.mesh.rotation.z += dt * 6; // tumbo cartoon (mareado), sin sangre
        pt.mesh.rotation.x += dt * 3;
      }
    }
    if (fx.state === 'rocketLaunching' && fx.mesh) {
      if (fx.t < fx.tDelay) {
        // Ignición en la rampa: la llama prende y el cohete tiembla (aún NO despega).
        const ip = fx.t / fx.tDelay;
        fx.mesh.position.set(fx.x0 + Math.sin(fx.t * 42) * 0.02, fx.baseY, fx.z0);
        fx.mesh.rotation.z = Math.sin(fx.t * 30) * 0.04;
        if (fx.flame) fx.flame.scale.set(1, 0.25 + ip * 0.75, 1);
        if (fx.t - (fx._lastPuff || 0) > 0.1) { fx._lastPuff = fx.t; this._spawnTrailPuff(fx); }
      } else {
        // Ascenso LENTO y claro (ease-in) hasta la altura del encuentro.
        const riseP = Math.min(1, (fx.t - fx.tDelay) / fx.tRise);
        const eased = Math.pow(riseP, 1.5);
        fx.mesh.position.set(fx.x0, fx.baseY + (fx.meetY - fx.baseY) * eased, fx.z0);
        fx.mesh.rotation.z = 0;
        if (fx.flame) fx.flame.scale.set(1, 0.9 + Math.random() * 0.5, 1);
        if (fx.t - (fx._lastPuff || 0) > 0.05) { fx._lastPuff = fx.t; this._spawnTrailPuff(fx); }
        if (fx.t >= fx.tImpact) { this._impactRocket(fx); fx.state = 'falling'; }
      }
      return false;
    }
    // Cayendo → terminado cuando el ptero sale por abajo y se apagan los efectos.
    if (pt && pt.mesh.position.y < -7) { this.scene.remove(pt.mesh); disposeTree(pt.mesh); fx.ptero = null; }
    return !fx.ptero && (!fx.fw || fx.fw.t >= 1.15) && fx.trail.length === 0;
  }

  _disposeRocketFx(fx) {
    if (fx.mesh) { this.scene.remove(fx.mesh); disposeTree(fx.mesh); fx.mesh = null; }
    if (fx.fw) { this.scene.remove(fx.fw.points); disposeTree(fx.fw.points); fx.fw = null; }
    if (fx.glow) { this.scene.remove(fx.glow.mesh); disposeTree(fx.glow.mesh); fx.glow = null; }
    if (fx.ptero) { this.scene.remove(fx.ptero.mesh); disposeTree(fx.ptero.mesh); fx.ptero = null; }
    for (const p of fx.trail) { this.scene.remove(p.mesh); disposeTree(p.mesh); }
    fx.trail = [];
  }

  /**
   * Encuadra la cámara para que el tablero entre COMPLETO incluso al inclinarse.
   * El radio a encuadrar cubre: (a) las esquinas reales del tablero (diagonal, no
   * solo el lado mayor), (b) la banda de decoración que lo rodea, y (c) el balanceo
   * que la inclinación máxima provoca en las esquinas. Así no se cortan esquinas ni
   * desaparece la decoración al girar.
   */
  _frame(bounds) {
    const portrait = this.camera.aspect < 1;
    const r = portrait
      ? computeSphereFrame(bounds, this._boardCenter, this.camera.fov, this.camera.aspect, this._fit)
      : computeAxisFrame(bounds, this._boardCenter, this.camera.fov, this.camera.aspect, this._fit);
    this.camera.position.set(r.pos.x, r.pos.y, r.pos.z);
    this.camera.lookAt(r.target.x, r.target.y, r.target.z);
    if (this.sun) this.sun.target.position.copy(this._boardCenter);
  }

  /** Recibe el perfil de viewport (de Game) para afinar el encuadre por dispositivo. */
  setViewportFit(fit) {
    this._fit = fit || {};
    if (this._bounds) this._frame(this._bounds);
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
      if (obj.userData.spin) {
        obj.rotation.z += dt * obj.userData.spin; // vórtice de portal girando
      }
      if (obj.userData.billboard) {
        obj.getWorldPosition(_tmpWp); // vector reutilizado: sin asignar memoria por frame
        obj.lookAt(this.camera.position.x, _tmpWp.y, this.camera.position.z);
      }
    }
    if (this._celebration) this._animateCelebration(dt);

    // Coleccionables: giro suave + flote + respiración del aura.
    for (const c of this._collectibles) {
      if (c.taken) continue;
      c.mesh.rotation.y += dt * (c.type === 'star' ? 1.9 : 2.6);
      const baseY = c.type === 'star' ? 0.64 : 0.55;
      c.mesh.position.y = baseY + Math.sin(this._t * 3 + c.x) * 0.08;
      c.mesh.scale.setScalar(1 + Math.sin(this._t * 4 + c.x) * (c.type === 'star' ? 0.06 : 0.045));
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

    // Ráfagas de partículas (estrella, rescate): caen con gravedad y se desvanecen.
    for (let i = this._bursts.length - 1; i >= 0; i--) {
      const b = this._bursts[i];
      b.t += dt;
      const pos = b.points.geometry.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        b.velocities[j * 3 + 1] -= 6 * dt;
        pos.setX(j, pos.getX(j) + b.velocities[j * 3] * dt);
        pos.setY(j, pos.getY(j) + b.velocities[j * 3 + 1] * dt);
        pos.setZ(j, pos.getZ(j) + b.velocities[j * 3 + 2] * dt);
      }
      pos.needsUpdate = true;
      b.points.material.opacity = Math.max(0, 1 - b.t / 1.2);
      if (b.t >= 1.2) {
        if (this.boardGroup) this.boardGroup.remove(b.points);
        disposeTree(b.points);
        this._bursts.splice(i, 1);
      }
    }

    // Aros de teletransporte: se expanden y se desvanecen.
    for (let i = this._portalRings.length - 1; i >= 0; i--) {
      const r = this._portalRings[i];
      r.t += dt;
      const p = Math.min(1, r.t / r.dur);
      r.mesh.scale.setScalar(1 + p * 6);
      r.mesh.material.opacity = 0.9 * (1 - p);
      if (p >= 1) {
        if (this.boardGroup) this.boardGroup.remove(r.mesh);
        disposeTree(r.mesh);
        this._portalRings.splice(i, 1);
      }
    }

    // Cavernícola: patrulla cuando camina; el ataque lo dirige Game por progreso.
    if (this._caveman) this._walkCaveman(dt);
    if (this._spearFx) this._animateSpearFx(dt);

    // Cohetes (ítems): flote en reposo + animaciones de lanzamiento/fuegos/evento.
    if (this._rockets.length || this._rocketFx.length) this._updateRockets(dt);

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

  resize(force = false) {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, this._dprCap);
    // GUARDA: si el tamaño real y el DPR no cambiaron, NO hacer nada. renderer.setSize reasigna el
    // buffer de dibujo GL (caro) y provoca tirones si se llama en cada evento espurio de resize/
    // visualViewport (frecuentes en Android WebView). `force` lo salta (p. ej. al montar un nivel).
    if (!force && w === this._lastW && h === this._lastH && dpr === this._lastDpr) return;
    // setPixelRatio() reaplica el tamaño internamente (otro setSize): llamarlo SOLO si el DPR
    // cambió de verdad (rotación/monitor), no en cada cambio de ancho/alto. Evita un setSize doble.
    if (dpr !== this._lastDpr) this.renderer.setPixelRatio(dpr);
    this._lastW = w; this._lastH = h; this._lastDpr = dpr;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this._bounds) this._frame(this._bounds); // reencuadrar al rotar/redimensionar
    countResize(); // instrumentación: cuenta SOLO resizes reales aplicados
  }

  /** Proyecta un punto del PLANO del tablero (local) a píxeles de pantalla. */
  projectBoardPoint(x, z, y = 0.6) {
    if (!this.boardGroup) return { visible: false, x: 0, y: 0 };
    _tmpVec.set(x, y, z);
    this.boardGroup.localToWorld(_tmpVec); // respeta la inclinación del tablero
    _tmpVec.project(this.camera);
    const el = this.renderer.domElement;
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || window.innerHeight;
    return { visible: _tmpVec.z < 1, x: (_tmpVec.x * 0.5 + 0.5) * w, y: (-_tmpVec.y * 0.5 + 0.5) * h };
  }
}

const _tmpVec = new THREE.Vector3();
const _tmpWp = new THREE.Vector3(); // reutilizado en update() para billboards (sin allocs por frame)

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
