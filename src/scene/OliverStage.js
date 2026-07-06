// OliverStage.js — Visor 3D AISLADO para el personaje «Oliver / T-REXo Aventurero».
// Es una escena Three.js independiente (su propio renderer/cámara/luz) que se monta en un
// contenedor pequeño (p. ej. la pantalla de victoria). Diseño SEGURO y progresivo:
//   · Carga PEREZOSA: el GLB (y el addon GLTFLoader) solo se cargan la primera vez que se muestra.
//   · FALLBACK: si `oliver_master.glb` falla, prueba `oliver_character.glb`; si ambos fallan,
//     no rompe nada (el contenedor queda vacío y el llamador conserva su icono de reserva).
//   · Su bucle de render SOLO corre mientras está visible (no gasta FPS en gameplay).
//   · No toca la escena principal, los controles, la rotación ni los niveles.

import * as THREE from 'three';
import { loadGLB, fitModel, clipNames, pickClip } from './gltf.js';
import { TREXO_MODEL_PATH, TREXO_FALLBACK_MODEL_PATH } from '../utils/constants.js';

// Animaciones preferidas para una pose de CELEBRACIÓN (nombres de Mixamo del máster).
const CELEBRATE_CLIPS = ['dance', 'shake', 'celebrate', 'big_wave', 'wave', 'jump', 'idle'];

export class OliverStage {
  /** @param {HTMLElement} container  contenedor donde montar el lienzo */
  constructor(container, { onReady = null, onFail = null } = {}) {
    this.container = container;
    this.onReady = onReady; this.onFail = onFail;
    this.renderer = null; this.scene = null; this.camera = null;
    this.mixer = null; this.model = null; this.clock = null;
    this._raf = null; this._visible = false;
    this._state = 'idle'; // idle | loading | ready | failed
    this._logged = false;
  }

  _init() {
    const [w, h] = this._size();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    this.camera.position.set(0, 1.55, 5.2);
    this.camera.lookAt(0, 1.3, 0);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x53613a, 1.2));
    const key = new THREE.DirectionalLight(0xfff3d8, 1.5); key.position.set(2.6, 5, 4); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fd0ff, 0.5); rim.position.set(-3, 3, -4); this.scene.add(rim);
    this.clock = new THREE.Clock();
  }

  _size() {
    const w = this.container.clientWidth || 120;
    const h = this.container.clientHeight || 130;
    return [w, h];
  }

  /** Muestra el visor (lo inicializa y carga el modelo la primera vez). */
  async show() {
    if (this._visible) return;
    this._visible = true;
    if (!this.renderer) this._init();
    if (this._state === 'idle') await this._load();
    if (this._visible) this._start();
  }

  /** Oculta el visor y DETIENE su bucle de render (no gasta FPS fuera de la pantalla). */
  hide() {
    this._visible = false;
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  async _load() {
    this._state = 'loading';
    let data = null;
    try {
      data = await loadGLB(TREXO_MODEL_PATH);
    } catch (e) {
      console.warn('[Oliver] master no cargó, probando fallback:', (e && e.message) || e);
      try { data = await loadGLB(TREXO_FALLBACK_MODEL_PATH); }
      catch (e2) { console.warn('[Oliver] fallback tampoco cargó:', (e2 && e2.message) || e2); }
    }
    if (!data) { this._state = 'failed'; if (this.onFail) try { this.onFail(); } catch (_) {} return; }

    this.model = data.scene;
    fitModel(this.model, { targetHeight: 2.7, faceYaw: 0, shadows: false });
    // Robustez visual: algunos exports (Mixamo) marcan el material como BLEND (transparente) por
    // error → un personaje sólido saldría invisible. En este VISOR forzamos opaco + doble cara
    // para que Oliver se vea siempre; las texturas del GLB se aplican igual.
    this.model.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        m.transparent = false; m.depthWrite = true; m.alphaTest = 0;
        if (m.opacity < 1) m.opacity = 1; // conserva el 'side' original (el modelo es doble cara)
        m.needsUpdate = true;
      }
    });
    this.scene.add(this.model);

    // Requisito: listar las animaciones disponibles UNA vez.
    if (!this._logged) { console.log('[Oliver] animaciones disponibles:', clipNames(data.animations)); this._logged = true; }

    if (data.animations && data.animations.length) {
      this.mixer = new THREE.AnimationMixer(this.model);
      const clip = pickClip(data.animations, CELEBRATE_CLIPS);
      if (clip) { const act = this.mixer.clipAction(clip); act.reset().play(); }
    }
    this._state = 'ready';
    if (this.onReady) try { this.onReady(); } catch (_) {}
  }

  _start() {
    if (this._raf) return;
    const loop = () => {
      if (!this._visible) { this._raf = null; return; }
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, this.clock.getDelta());
      if (this.mixer) this.mixer.update(dt);
      if (this.model) this.model.rotation.y += dt * 0.5; // giro suave de escaparate
      this.renderer.render(this.scene, this.camera);
    };
    this._raf = requestAnimationFrame(loop);
  }

  /** Recalcula el tamaño del lienzo (al rotar / redimensionar). */
  resize() {
    if (!this.renderer) return;
    const [w, h] = this._size();
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  get ready() { return this._state === 'ready'; }
}
