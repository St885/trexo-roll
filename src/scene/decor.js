// decor.js — Props jurásicos originales hechos con geometrías simples de Three.js.
// Rocas, huevos, helechos, fósiles y huellas. Nada con copyright.

import * as THREE from 'three';
import { drawTRex } from './textures.js';

// Materiales compartidos entre instancias. Marcados como `shared` para que el
// limpiador de la escena NO los libere al cambiar de nivel.
const ROCK_MAT = shared(new THREE.MeshStandardMaterial({ color: 0x8d8470, roughness: 0.95, flatShading: true }));
const EGG_MAT = shared(new THREE.MeshStandardMaterial({ color: 0xefe2c0, roughness: 0.6 }));
const FERN_MAT = shared(new THREE.MeshStandardMaterial({ color: 0x3f8f4f, roughness: 0.8, flatShading: true }));
const BONE_MAT = shared(new THREE.MeshStandardMaterial({ color: 0xe9e4d4, roughness: 0.7 }));

function shared(mat) {
  mat.userData.shared = true;
  return mat;
}

export function makeRock(scale = 1) {
  const geo = new THREE.IcosahedronGeometry(0.6 * scale, 0);
  const m = new THREE.Mesh(geo, ROCK_MAT);
  m.scale.y = 0.7;
  m.rotation.set(Math.random(), Math.random(), Math.random());
  m.castShadow = true;
  return m;
}

export function makeEgg(scale = 1) {
  const geo = new THREE.SphereGeometry(0.32 * scale, 16, 16);
  const m = new THREE.Mesh(geo, EGG_MAT);
  m.scale.y = 1.4;
  m.castShadow = true;
  return m;
}

export function makeEggNest(scale = 1) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 * scale, 0.14 * scale, 8, 16), ROCK_MAT);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  for (let i = 0; i < 3; i++) {
    const e = makeEgg(0.7 * scale);
    e.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.18, 0.2 * scale, Math.sin((i / 3) * Math.PI * 2) * 0.18);
    g.add(e);
  }
  return g;
}

export function makeFern(scale = 1) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45 * scale * (1 - i * 0.18), 0.7 * scale, 7), FERN_MAT);
    cone.position.y = 0.35 * scale + i * 0.32 * scale;
    cone.castShadow = true;
    g.add(cone);
  }
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 6), BONE_MAT);
  trunk.position.y = 0.15;
  g.add(trunk);
  return g;
}

export function makeFossil(scale = 1) {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.9 * scale, 8), BONE_MAT);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  for (const sx of [-0.5, 0.5]) {
    for (const sz of [-0.12, 0.12]) {
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 10, 10), BONE_MAT);
      knob.position.set(sx * scale, 0, sz * scale);
      g.add(knob);
    }
  }
  return g;
}

/**
 * Huella de dinosaurio: textura plana (tres dedos) que se apoya sobre el tablero.
 * Decorativa, no colisiona.
 */
export function makeFootprintDecal(scale = 1) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(40,30,20,0.35)';
  // Almohadilla central
  ctx.beginPath();
  ctx.ellipse(64, 80, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tres dedos
  for (const dx of [-26, 0, 26]) {
    ctx.beginPath();
    ctx.ellipse(64 + dx, 38, 10, 18, dx * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(0.9 * scale, 0.9 * scale);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.011; // justo sobre la superficie
  return m;
}

/** Pequeño tótem con la silueta de T-Rex (marca de la meta o decoración del menú). */
export function makeTRexBanner(scale = 1) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  drawTRex(ctx, 150, 150, 2.0, '#14402b');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6 * scale, 1.6 * scale), mat);
  return m;
}
