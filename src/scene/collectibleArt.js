// collectibleArt.js — Modelos 3D procedurales de las recompensas: moneda dorada,
// estrella-token, el pterosaurio del "escudo de caída" y la tapa de trampa
// bloqueada. Todo con primitivas de Three.js (sin assets externos).

import * as THREE from 'three';

const COIN_MAT = new THREE.MeshStandardMaterial({
  color: 0xffcf3f, metalness: 0.65, roughness: 0.28,
  emissive: 0x6b4a00, emissiveIntensity: 0.4,
});
COIN_MAT.userData.shared = true;
const COIN_RIM = new THREE.MeshStandardMaterial({ color: 0xb5791f, metalness: 0.6, roughness: 0.4 });
COIN_RIM.userData.shared = true;

const STAR_MAT = new THREE.MeshStandardMaterial({
  color: 0xffe26a, metalness: 0.4, roughness: 0.25,
  emissive: 0xffae00, emissiveIntensity: 0.55,
});
STAR_MAT.userData.shared = true;

const COVER_MAT = new THREE.MeshStandardMaterial({ color: 0x7d7d76, roughness: 1 });
COVER_MAT.userData.shared = true;

/** Moneda dorada: disco grueso ligeramente inclinado, con borde. Gira y brilla. */
export function makeCoin() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 22), COIN_MAT);
  disc.castShadow = true;
  g.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 22), COIN_RIM);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  g.rotation.x = 0.5; // ligeramente inclinada para que se vea la cara desde arriba
  g.userData.spin = true;
  return g;
}

/** Estrella-token: estrella de 5 puntas extruida, dorada y brillante. Más vistosa. */
export function makeStarToken() {
  const shape = starShape(0.5, 0.22, 5);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
  geo.center();
  const star = new THREE.Mesh(geo, STAR_MAT);
  star.castShadow = true;
  const g = new THREE.Group();
  star.rotation.x = -Math.PI / 2; // tumbada: se ve la estrella desde la cámara cenital
  g.add(star);
  g.userData.spin = true;
  g.userData.star = true;
  return g;
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

/** Pterosaurio simple (no ave): cuerpo, cabeza con pico y cresta, y dos alas
 *  membranosas que pueden aletear. userData.wings = [izq, der]. */
export function makePtero(colorHex = '#8a5a3a') {
  const skin = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: 0.7 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex).lerp(new THREE.Color('#2b1c12'), 0.25),
    roughness: 0.8, side: THREE.DoubleSide,
  });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.6 });

  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 10), skin);
  body.rotation.x = Math.PI / 2; body.castShadow = true; g.add(body);

  // Cabeza adelante (+z) con pico largo y cresta hacia atrás (rasgos de pterosaurio).
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skin);
  head.position.set(0, 0.05, 0.42); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 8), beakMat);
  beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.04, 0.68); g.add(beak);
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), skin);
  crest.rotation.x = -Math.PI * 0.7; crest.position.set(0, 0.18, 0.34); g.add(crest);

  // Alas membranosas: triángulos finos a cada lado, pivotando en el "hombro".
  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    const tri = new THREE.Shape();
    tri.moveTo(0, 0); tri.lineTo(1.1, 0.15); tri.lineTo(0.95, -0.25); tri.closePath();
    const wgeo = new THREE.ExtrudeGeometry(tri, { depth: 0.02, bevelEnabled: false });
    const wmesh = new THREE.Mesh(wgeo, wingMat);
    wmesh.scale.x = side; // espejo para el ala derecha
    wing.add(wmesh);
    wing.position.set(side * 0.12, 0.05, 0.05);
    g.add(wing);
    wings.push(wing);
  }

  const legMat = beakMat;
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.28, 6), legMat);
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
