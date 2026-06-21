// BoardBuilder.js — Construye el tablero 3D a partir de la definición lógica del nivel.
// Usa la MISMA huella que la física, así lo que se ve coincide con lo que se juega.

import * as THREE from 'three';
import { makeBoardTexture, makeGlowTexture } from './textures.js';
import { footprintBounds } from '../physics/footprint.js';
import { makeRock, makeFern, makeEggNest, makeFossil, makeFootprintDecal, makeTRexBanner } from './decor.js';

const THICKNESS = 1.4;   // grosor del tablero (plataforma elevada, no una lámina hundida)
const WALL_HEIGHT = 0.85;
const HOLE_DEPTH = 1.0;

const WALL_MAT = new THREE.MeshStandardMaterial({ color: 0x9c6b43, roughness: 0.85 });
WALL_MAT.userData.shared = true; // compartido entre niveles: no liberar al limpiar

// Lados/canto del tablero: tierra oscura, para que la plataforma "tenga cuerpo".
const SIDE_MAT = new THREE.MeshStandardMaterial({ color: 0x40341f, roughness: 1 });
SIDE_MAT.userData.shared = true;

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
      // Caja con TOP texturizado (superficie) y CANTOS oscuros → plataforma con cuerpo.
      // Orden de materiales del Box: [+x, -x, +y(top), -y, +z, -z].
      const mats = [SIDE_MAT, SIDE_MAT, surfaceMat, SIDE_MAT, SIDE_MAT, SIDE_MAT];
      mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, THICKNESS, s.d), mats);
      mesh.position.set(s.x, -THICKNESS / 2, s.z);
    } else if (s.type === 'circle') {
      // Cilindro con leve estrechamiento abajo (look de plataforma/roca). [lado, top, fondo].
      const mats = [SIDE_MAT, surfaceMat, SIDE_MAT];
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r * 0.9, THICKNESS, 48), mats);
      mesh.position.set(s.x, -THICKNESS / 2, s.z);
    } else if (s.type === 'poly') {
      const shape = new THREE.Shape();
      s.points.forEach(([px, pz], i) => {
        // Nota: se usa -pz para que tras rotar -90° en X el mundo coincida con (px,pz).
        if (i === 0) shape.moveTo(px, -pz);
        else shape.lineTo(px, -pz);
      });
      // Superficie plana (geometría probada y robusta para tableros poligonales).
      mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), surfaceMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.material.side = THREE.DoubleSide;
    }
    if (mesh) {
      mesh.receiveShadow = true;
      if (s.type !== 'poly') mesh.castShadow = true;
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

  // --- Portales naranjas (teletransporte) con aro emisivo + vórtice giratorio ---
  for (const p of level.portals || []) {
    group.add(makeHole(p, 0x2a1505));               // boca oscura cálida
    const ring = makeRing(p, 0xff8a2a, 0.9);        // aro ámbar pulsante
    group.add(ring);
    animated.push(ring);
    const swirl = makePortalSwirl(p);               // disco de energía que gira
    group.add(swirl);
    animated.push(swirl);
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

// Vórtice de energía del portal: disco aditivo naranja que gira y "respira".
function makePortalSwirl(portal) {
  const swirl = new THREE.Mesh(
    new THREE.CircleGeometry((portal.r || 1) * 0.92, 32),
    new THREE.MeshBasicMaterial({
      map: makeGlowTexture('#ffb15a'), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0.85, side: THREE.DoubleSide,
    })
  );
  swirl.rotation.x = -Math.PI / 2;
  swirl.position.set(portal.x, 0.06, portal.z);
  swirl.userData.spin = 2.4;          // rad/s (lo anima SceneManager)
  swirl.userData.pulse = true;        // late suavemente
  swirl.userData.baseEmissive = 0;    // MeshBasic: el pulse solo escala
  return swirl;
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

// Mezcla de props por bioma: cada mundo se siente distinto (volcán = rocas,
// pantano/isla = helechos, huevos = nidos, ruinas = fósiles…).
const THEME_PROPS = {
  valle:   [makeRock, makeFern, makeEggNest, makeFossil, makeRock, makeFern],
  bosque:  [makeFern, makeFern, makeRock, makeFern, makeEggNest, makeFern],
  volcan:  [makeRock, makeRock, makeFossil, makeRock, makeFern, makeRock],
  pantano: [makeFern, makeFern, makeEggNest, makeFern, makeRock, makeFern],
  meseta:  [makeRock, makeFossil, makeRock, makeFern, makeEggNest, makeRock],
  ruinas:  [makeRock, makeFossil, makeRock, makeFossil, makeRock, makeFern],
  isla:    [makeFern, makeRock, makeFern, makeEggNest, makeFern, makeRock],
  huevos:  [makeEggNest, makeFern, makeEggNest, makeRock, makeEggNest, makeFern],
};

/** Coloca props en una banda controlada alrededor del tablero (sin invadir el área
 *  jugable ni salirse del encuadre) y algunas huellas sobre la superficie. */
function decorate(group, level) {
  const b = footprintBounds(level.footprint);
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  // Banda ajustada: lo bastante fuera para no tapar el tablero, lo bastante dentro
  // para no cortarse al inclinar (coincide con DECOR_MARGIN del encuadre de cámara).
  const radius = Math.max(b.width, b.depth) / 2 + 1.0;
  const zSquash = b.depth / b.width || 1;
  const factories = THEME_PROPS[level.theme] || THEME_PROPS.valle;
  const count = 10;
  for (let i = 0; i < count; i++) {
    // Reparto angular uniforme + pequeño jitter para que no se vea "en rejilla".
    const ang = (i / count) * Math.PI * 2 + 0.3 + (Math.random() - 0.5) * 0.18;
    const rr = radius + (i % 2) * 0.4;
    const make = factories[i % factories.length];
    const prop = make(0.9 + Math.random() * 0.5);
    prop.position.set(cx + Math.cos(ang) * rr, -0.1, cz + Math.sin(ang) * rr * zSquash);
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
