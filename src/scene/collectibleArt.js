// collectibleArt.js — Modelos 3D procedurales de las recompensas: moneda dorada,
// estrella-token, el pterosaurio del "escudo de caída" y la tapa de trampa
// bloqueada. Todo con primitivas de Three.js (sin assets externos). Pensado para
// leerse claro desde la cámara cenital y con buen rendimiento en móvil.

import * as THREE from 'three';
import { makeGlowTexture } from './textures.js';

// --- Materiales compartidos (no se liberan al cambiar de nivel) -------------
const COIN_MAT = shared(new THREE.MeshStandardMaterial({
  color: 0xffd24a, metalness: 0.85, roughness: 0.22,
  emissive: 0x7a5200, emissiveIntensity: 0.45,
}));
const COIN_FACE = shared(new THREE.MeshStandardMaterial({
  color: 0xffe27a, metalness: 0.8, roughness: 0.25, emissive: 0x6b4a00, emissiveIntensity: 0.3,
}));
const COIN_RIM = shared(new THREE.MeshStandardMaterial({ color: 0xc8861f, metalness: 0.75, roughness: 0.35 }));
const STAR_MAT = shared(new THREE.MeshStandardMaterial({
  color: 0xffe46a, metalness: 0.45, roughness: 0.2, emissive: 0xffb000, emissiveIntensity: 0.7,
}));
const COVER_MAT = shared(new THREE.MeshStandardMaterial({ color: 0x7d7d76, roughness: 1 }));

function shared(mat) { mat.userData.shared = true; return mat; }

function glowMesh(colorHex, size) {
  const mat = new THREE.MeshBasicMaterial({
    map: makeGlowTexture(colorHex), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.9,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.rotation.x = -Math.PI / 2; // tumbado sobre el tablero (halo)
  return m;
}

/**
 * Moneda dorada: disco grueso con relieve y borde, ligeramente inclinado para que
 * "destelle" al girar, con un aura dorada en el suelo. Gira sobre Y (lo anima la escena).
 */
export function makeCoin() {
  const group = new THREE.Group();

  const pivot = new THREE.Group();
  pivot.rotation.x = 0.5; // inclinación: la cara capta luz y se ve girar
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 28), COIN_MAT);
  disc.castShadow = true;
  pivot.add(disc);
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.17, 22), COIN_FACE);
  pivot.add(boss); // relieve central
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 10, 28), COIN_RIM);
  rim.rotation.x = Math.PI / 2;
  pivot.add(rim);
  group.add(pivot);

  const glow = glowMesh('#ffd86b', 1.35);
  glow.position.y = -0.5; // se apoya como halo en el tablero
  group.add(glow);

  group.userData.spin = true;
  return group;
}

/**
 * Estrella-token: estrella de 5 puntas extruida con bisel, dorada e intensa, con un
 * aura más grande y brillante que la moneda. Gira sobre Y con elegancia.
 */
export function makeStarToken() {
  const group = new THREE.Group();

  const shape = starShape(0.52, 0.23, 5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.13, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2,
  });
  geo.center();
  const star = new THREE.Mesh(geo, STAR_MAT);
  star.castShadow = true;
  star.rotation.x = -Math.PI / 2; // tumbada: se lee la estrella desde la cámara cenital
  group.add(star);

  const glow = glowMesh('#ffe26a', 1.9);
  glow.position.y = -0.5;
  group.add(glow);

  group.userData.spin = true;
  group.userData.star = true;
  return group;
}

/** Tapa gris para una trampa bloqueada (piedra plana con aro): se ve "apagada". */
export function makeTrapCover(radius) {
  const g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.95, radius * 1.05, 0.18, 18), COVER_MAT);
  cap.position.y = 0.05;
  cap.receiveShadow = true;
  g.add(cap);
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * 0.5, 0), COVER_MAT);
  rock.scale.y = 0.6; rock.position.y = 0.16; rock.castShadow = true;
  g.add(rock);
  return g;
}

/**
 * Pterosaurio (no ave): cuerpo, cabeza con pico y cresta larga, ojos, y dos alas
 * membranosas con hueso de borde. userData.wings = [izq, der] para aletear.
 */
export function makePtero(colorHex = '#8a5a3a') {
  const base = new THREE.Color(colorHex);
  const skin = new THREE.MeshStandardMaterial({ color: base, roughness: 0.7 });
  const belly = new THREE.MeshStandardMaterial({ color: base.clone().lerp(new THREE.Color('#ffffff'), 0.35), roughness: 0.7 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: base.clone().lerp(new THREE.Color('#2b1c12'), 0.3), roughness: 0.85, side: THREE.DoubleSide,
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a1d12, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 12), skin);
  body.rotation.x = Math.PI / 2; body.castShadow = true; g.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), belly);
  chest.scale.set(0.9, 0.8, 1.1); chest.position.set(0, -0.04, 0.18); g.add(chest);

  // Cabeza, pico largo y cresta (rasgos de pterosaurio).
  const head = new THREE.Group(); head.position.set(0, 0.05, 0.42); g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), skin);
  skull.scale.set(1, 0.95, 1.15); head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.46, 10), dark);
  beak.rotation.x = Math.PI / 2; beak.position.set(0, -0.01, 0.3); head.add(beak);
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 8), skin);
  crest.rotation.x = -Math.PI * 0.72; crest.position.set(0, 0.16, -0.06); head.add(crest);
  // Ojos con brillo.
  for (const sx of [-0.09, 0.09]) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), white);
    w.position.set(sx, 0.04, 0.08); head.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), dark);
    p.position.set(sx, 0.04, 0.11); head.add(p);
  }

  // Alas membranosas con hueso de borde (pivotan en el hombro).
  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    const membrane = new THREE.Shape();
    membrane.moveTo(0, 0.06);
    membrane.quadraticCurveTo(0.7, 0.22, 1.18, 0.12);
    membrane.quadraticCurveTo(0.8, -0.06, 0.55, -0.22);
    membrane.quadraticCurveTo(0.25, -0.12, 0, -0.04);
    membrane.closePath();
    const wgeo = new THREE.ExtrudeGeometry(membrane, { depth: 0.015, bevelEnabled: false });
    const wmesh = new THREE.Mesh(wgeo, wingMat);
    wmesh.scale.x = side;
    wing.add(wmesh);
    // Hueso del borde de ataque.
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, 1.2, 6), skin);
    bone.rotation.z = Math.PI / 2; bone.position.set(side * 0.6, 0.09, 0); wing.add(bone);
    wing.position.set(side * 0.12, 0.06, 0.04);
    g.add(wing);
    wings.push(wing);
  }

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.28, 6), dark);
    leg.position.set(side * 0.08, -0.16, -0.05); g.add(leg);
  }

  g.userData.wings = wings;
  return g;
}

// --- helpers ---------------------------------------------------------------
function starShape(outer, inner, points) {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}
