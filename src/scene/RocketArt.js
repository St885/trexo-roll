// RocketArt.js — Cohetes 3D recogibles + VFX (llama de propulsión y fuegos artificiales).
// Estilo premium colorido, ligero para móvil. El de raya roja es claramente reconocible.
// Sin daño: son ítems de celebración. (El evento del pterodáctilo lo gestiona SceneManager.)

import * as THREE from 'three';
import { makeGlowTexture } from './textures.js';

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: opts.rough != null ? opts.rough : 0.45, metalness: opts.metal != null ? opts.metal : 0.15, emissive: opts.emissive || 0x000000, emissiveIntensity: opts.emissive ? 0.5 : 0 });
}

/**
 * Construye un cohete. type: 'color' (vivo y multicolor) | 'red' (crema con raya roja).
 * Origen en la base; apunta hacia +Y. Devuelve un THREE.Group con userData.tailY.
 */
export function makeRocket(type) {
  const g = new THREE.Group();
  const red = type === 'red';
  const C = red
    ? { body: '#f4ecd6', nose: '#e23b3b', fin: '#e23b3b', band: '#e23b3b', win: '#bfe3ff' }
    : { body: '#3aa0ff', nose: '#ffd23f', fin: '#ff5d8f', band: '#2ecc71', win: '#bfe3ff' };

  // Cuerpo (cilindro) — centro a media altura.
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.135, 0.5, 16), mat(C.body, { rough: 0.4 }));
  body.position.y = 0.32; body.castShadow = true; g.add(body);
  // Punta (cono) brillante.
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.135, 0.26, 16), mat(C.nose, { rough: 0.35, emissive: new THREE.Color(C.nose).multiplyScalar(0.18) }));
  nose.position.y = 0.7; nose.castShadow = true; g.add(nose);
  // Banda / raya (anillo): en el rojo es la RAYA ROJA bien marcada.
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.142, red ? 0.12 : 0.07, 18), mat(C.band, { metal: 0.25, emissive: red ? new THREE.Color(C.band).multiplyScalar(0.22) : 0x000000 }));
  band.position.y = red ? 0.34 : 0.46; g.add(band);
  if (red) {
    // Segunda raya fina (refuerza la lectura del "cohete con raya roja").
    const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 18), mat(C.band));
    band2.position.y = 0.56; g.add(band2);
  }
  // Ventanilla.
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), mat(C.win, { rough: 0.2, metal: 0.4, emissive: 0x224466 }));
  win.scale.set(1, 1, 0.5); win.position.set(0, 0.5, 0.13); g.add(win);
  // Aletas (3) en la base.
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), mat(C.fin, { rough: 0.4 }));
    fin.scale.set(0.5, 1, 1.1);
    fin.position.set(Math.cos(a) * 0.16, 0.11, Math.sin(a) * 0.16);
    fin.rotation.y = -a; fin.rotation.x = Math.PI; fin.castShadow = true; g.add(fin);
  }
  g.userData.tailY = 0.0;
  return g;
}

/** Llama de propulsión (conos aditivos cálidos) para el ascenso. Apunta hacia -Y. */
export function makeRocketFlame() {
  const g = new THREE.Group();
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 10), new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  f1.rotation.x = Math.PI; f1.position.y = -0.22; g.add(f1);
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 8), new THREE.MeshBasicMaterial({ color: '#ff7a2a', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  f2.rotation.x = Math.PI; f2.position.y = -0.16; g.add(f2);
  return g;
}

/** Disco de brillo aditivo (aura del ítem / destello de impacto). */
export function makeGlow(colorHex, size = 1.4) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: makeGlowTexture(colorHex), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 })
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

/**
 * Ráfaga de fuegos artificiales: partículas que explotan RADIALMENTE en varios colores.
 * @returns {{points: THREE.Points, velocities: Float32Array}}
 */
export function makeFireworkBurst() {
  const N = 64;
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const velocities = new Float32Array(N * 3);
  const palette = ['#ff5d8f', '#ffd23f', '#3aa0ff', '#2ecc71', '#ff7a2a', '#b06bff', '#ffffff'].map((c) => new THREE.Color(c));
  for (let i = 0; i < N; i++) {
    // Dirección uniforme sobre una esfera → explosión radial.
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const sp = 3.2 + Math.random() * 2.6;
    velocities[i * 3] = s * Math.cos(th) * sp;
    velocities[i * 3 + 1] = u * sp + 0.6;
    velocities[i * 3 + 2] = s * Math.sin(th) * sp;
    const c = palette[(Math.random() * palette.length) | 0];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mtl = new THREE.PointsMaterial({ size: 0.26, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  return { points: new THREE.Points(geo, mtl), velocities };
}
