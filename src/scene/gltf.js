// gltf.js — Utilidades REUTILIZABLES para cargar modelos glTF/GLB con Three.js.
// El addon `GLTFLoader` se importa de forma PEREZOSA (dynamic import) por dos razones:
//   1) no se descarga/parsea hasta que de verdad se carga un modelo (no en cada pantalla), y
//   2) no entra en el grafo de módulos estático → los tests de Node (check-graph) no intentan
//      resolver `three/addons/...` (que solo existe vía importmap del navegador).
// GLTFLoader + BufferGeometryUtils están vendorizados (Three.js r160, MIT) en `libs/addons/`.

import * as THREE from 'three';

let _loader = null;
async function getLoader() {
  if (_loader) return _loader;
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  _loader = new GLTFLoader();
  return _loader;
}

/**
 * Carga un GLB/glTF. Devuelve `{ scene, animations, gltf }`. Lanza si falla la carga.
 * @param {string} url  ruta relativa al documento (dev/www/Capacitor)
 */
export async function loadGLB(url) {
  const loader = await getLoader();
  const gltf = await loader.loadAsync(url);
  return { scene: gltf.scene, animations: gltf.animations || [], gltf };
}

/**
 * Centra y escala un modelo para un visor: base (pies) a y=0, centrado en X/Z, altura = `targetHeight`.
 * Corrige rotación (`faceYaw`) y activa sombras si se pide. Idempotente sobre el objeto raíz.
 * @returns {{height:number, box:THREE.Box3}}
 */
export function fitModel(obj, { targetHeight = 2.4, faceYaw = 0, shadows = false } = {}) {
  obj.updateWorldMatrix(true, true);
  const box = measureBox(obj);
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  const h = size.y || 1;
  const s = targetHeight / h;
  obj.scale.multiplyScalar(s);
  // Recentrar tras escalar: X/Z al origen y base a y=0.
  obj.position.x -= center.x * s;
  obj.position.z -= center.z * s;
  obj.position.y -= box.min.y * s;
  if (faceYaw) obj.rotation.y += faceYaw;
  if (shadows) obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  return { height: targetHeight, box };
}

// Caja envolvente FIABLE para el modelo. En mallas SKINNED (p. ej. Mixamo) la caja de la
// geometría NO refleja el tamaño real (los huesos aplican la escala), lo que llevaría a escalar
// el modelo cientos de veces. Cuando hay esqueleto, medimos por las posiciones de los HUESOS.
function measureBox(obj) {
  const box = new THREE.Box3();
  const p = new THREE.Vector3();
  let bones = 0;
  obj.traverse((o) => { if (o.isBone) { o.getWorldPosition(p); box.expandByPoint(p); bones++; } });
  if (bones >= 2 && !box.isEmpty()) {
    // Los huesos dan las articulaciones (algo menos que la malla visible): un pequeño margen
    // evita que la cabeza/pies queden justos al encuadrar.
    const size = new THREE.Vector3(); box.getSize(size);
    box.expandByVector(size.multiplyScalar(0.08));
    return box;
  }
  return new THREE.Box3().setFromObject(obj);
}

/** Nombres de los clips de animación (para listarlos/depurar). */
export function clipNames(animations) {
  return (animations || []).map((c) => c.name);
}

/**
 * Elige un clip por lista de nombres PREFERIDOS (coincidencia por substring, sin distinguir
 * mayúsculas). Si ninguno coincide, devuelve el primero. `null` si no hay animaciones.
 */
export function pickClip(animations, preferred = []) {
  if (!animations || !animations.length) return null;
  for (const want of preferred) {
    const w = String(want).toLowerCase();
    const c = animations.find((a) => a.name && a.name.toLowerCase().includes(w));
    if (c) return c;
  }
  return animations[0];
}
