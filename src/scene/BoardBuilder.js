// BoardBuilder.js — Construye el tablero 3D a partir de la definición lógica del nivel.
// Usa la MISMA huella que la física, así lo que se ve coincide con lo que se juega.

import * as THREE from 'three';
import { makeBoardTexture } from './textures.js';
import { footprintBounds } from '../physics/footprint.js';
import { makeRock, makeFern, makeEggNest, makeFossil, makeFootprintDecal, makeTRexBanner } from './decor.js';

const THICKNESS = 0.5;
const WALL_HEIGHT = 0.85;
const HOLE_DEPTH = 1.0;

const WALL_MAT = new THREE.MeshStandardMaterial({ color: 0x9c6b43, roughness: 0.85 });
WALL_MAT.userData.shared = true; // compartido entre niveles: no liberar al limpiar

/**
 * @param {object} level  definición del nivel
 * @returns {{ group: THREE.Group, animated: THREE.Object3D[] }}
 */
export function buildBoard(level) {
  const group = new THREE.Group();
  const animated = [];
  const surfaceTex = makeBoardTexture(level.surfaceColor || '#6b8f5a', level.surfaceAccent || '#5a7a4c');
  const surfaceMat = new THREE.MeshStandardMaterial({ map: surfaceTex, roughness: 0.95 });

  // --- Superficie del tablero (unión de formas) ---
  for (const s of level.footprint) {
    let mesh;
    if (s.type === 'rect') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, THICKNESS, s.d), surfaceMat);
      mesh.position.set(s.x, -THICKNESS / 2, s.z);
    } else if (s.type === 'circle') {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, THICKNESS, 48), surfaceMat);
      mesh.position.set(s.x, -THICKNESS / 2, s.z);
    } else if (s.type === 'poly') {
      const shape = new THREE.Shape();
      s.points.forEach(([px, pz], i) => {
        // Nota: se usa -pz para que tras rotar -90° en X el mundo coincida con (px,pz).
        if (i === 0) shape.moveTo(px, -pz);
        else shape.lineTo(px, -pz);
      });
      mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), surfaceMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.material.side = THREE.DoubleSide;
    }
    if (mesh) {
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }

  // --- Paredes / obstáculos sólidos ---
  for (const w of level.walls || []) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w.w, WALL_HEIGHT, w.d), WALL_MAT);
    wall.position.set(w.x, WALL_HEIGHT / 2 - 0.05, w.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);
  }

  // --- Hoyo objetivo (meta) con anillo verde pulsante ---
  if (level.goal) {
    group.add(makeHole(level.goal, 0x10130f));
    const ring = makeRing(level.goal, 0x2ecc71, 0.9);
    group.add(ring);
    animated.push(ring);
    const banner = makeTRexBanner(0.7);
    banner.position.set(level.goal.x, 1.0, level.goal.z - level.goal.r - 0.2);
    animated.push(banner);
    banner.userData.billboard = true;
    group.add(banner);
  }

  // --- Hoyos trampa con anillo rojo ---
  for (const t of level.traps || []) {
    group.add(makeHole(t, 0x120a0a));
    group.add(makeRing(t, 0xe74c3c, 0.0));
  }

  // --- Decoración jurásica ---
  decorate(group, level);

  return { group, animated };
}

function makeHole(hole, color) {
  const cyl = new THREE.Mesh(
    new THREE.CylinderGeometry(hole.r, hole.r * 0.7, HOLE_DEPTH, 32),
    new THREE.MeshStandardMaterial({ color, roughness: 1 })
  );
  cyl.position.set(hole.x, -HOLE_DEPTH / 2 + 0.02, hole.z);
  return cyl;
}

function makeRing(hole, color, emissive) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(hole.r, 0.08, 10, 32),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, roughness: 0.5 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(hole.x, 0.03, hole.z);
  ring.userData.pulse = true;
  ring.userData.baseEmissive = emissive;
  return ring;
}

/** Coloca props alrededor (fuera de la huella) y algunas huellas sobre el tablero. */
function decorate(group, level) {
  const b = footprintBounds(level.footprint);
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  const radius = Math.max(b.width, b.depth) / 2 + 1.6;
  const factories = [makeRock, makeFern, makeEggNest, makeFossil, makeRock, makeFern];
  const count = 10;
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + 0.3;
    const rr = radius + (i % 2) * 0.9;
    const make = factories[i % factories.length];
    const prop = make(0.9 + Math.random() * 0.5);
    prop.position.set(cx + Math.cos(ang) * rr, -0.1, cz + Math.sin(ang) * rr * (b.depth / b.width || 1));
    prop.rotation.y = Math.random() * Math.PI * 2;
    group.add(prop);
  }
  // Huellas decorativas sobre la superficie (evitando hoyos).
  for (const spot of level.footDecals || []) {
    const fp = makeFootprintDecal(0.9);
    fp.position.x = spot.x;
    fp.position.z = spot.z;
    fp.rotation.z = spot.rot || 0;
    group.add(fp);
  }
}
