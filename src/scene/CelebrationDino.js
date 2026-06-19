// CelebrationDino.js — Dinosaurios 3D de celebración, UNO por especie (no el mismo
// recoloreado). Cada modelo se construye con primitivas y lee claramente como su
// dinosaurio. Coloreado con el color de la bola elegida.

import * as THREE from 'three';
import { getDino } from '../data/dinos.js';

function makeMats(ballDef) {
  return {
    skin: new THREE.MeshStandardMaterial({ color: new THREE.Color(ballDef.dino), roughness: 0.6 }),
    belly: new THREE.MeshStandardMaterial({ color: new THREE.Color(ballDef.dino).lerp(new THREE.Color('#ffffff'), 0.4), roughness: 0.6 }),
    dark: new THREE.MeshStandardMaterial({ color: new THREE.Color(ballDef.dark), roughness: 0.5 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
  };
}

function leg(mats, x, z, h = 0.42, r = 0.15) {
  const g = new THREE.Group();
  const l = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, h, 8), mats.skin);
  l.position.y = h / 2; l.castShadow = true; g.add(l);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 10, 8), mats.skin);
  foot.scale.set(1.2, 0.5, 1.6); foot.position.set(0, 0.02, r * 0.7); g.add(foot);
  g.position.set(x, 0, z);
  return g;
}

function addEyes(head, mats, z, y, spread, r) {
  for (const sx of [-spread, spread]) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), mats.white);
    w.position.set(sx, y, z); head.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(r * 0.5, 8, 8), mats.dark);
    p.position.set(sx, y, z + r * 0.6); head.add(p);
  }
}

/** Construye el dinosaurio 3D de la especie de la bola. Devuelve un THREE.Group. */
export function buildDino(ballDef) {
  const mats = makeMats(ballDef);
  let res;
  switch (ballDef.species) {
    case 'raptor': res = buildRaptor(mats); break;
    case 'parasaur': res = buildParasaur(mats); break;
    case 'triceratops': res = buildTriceratops(mats); break;
    case 'brachio': res = buildBrachio(mats); break;
    case 'trex':
    default: res = buildTRex(mats); break;
  }
  res.group.userData = {
    anim: getDino(ballDef.species).anim,
    head: res.head, neck: res.neck || null, tail: res.tail || null, arms: res.arms || [],
  };
  return res.group;
}

// --- T-Rex: bípedo erguido, cabezón con mandíbula y dientes, brazos diminutos
function buildTRex(mats) {
  const group = new THREE.Group();
  group.add(leg(mats, -0.22, 0, 0.5, 0.17));
  group.add(leg(mats, 0.22, 0, 0.5, 0.17));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), mats.skin);
  body.scale.set(1, 1.25, 1); body.position.set(0, 0.95, 0); body.castShadow = true; group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), mats.belly);
  belly.scale.set(0.9, 1.2, 0.6); belly.position.set(0, 0.85, 0.28); group.add(belly);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.15, 8), mats.skin);
  tail.rotation.x = Math.PI * 0.62; tail.position.set(0, 0.72, -0.55); tail.castShadow = true; group.add(tail);
  const arms = [];
  for (const sx of [-0.42, 0.42]) {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.2, 4, 8), mats.skin);
    a.position.set(sx, 1.02, 0.3); arms.push(a); group.add(a);
  }
  const head = new THREE.Group(); head.position.set(0, 1.55, 0.12); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 14), mats.skin);
  skull.scale.set(1, 0.95, 1.4); skull.position.set(0, 0.05, 0.12); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.5), mats.skin);
  snout.position.set(0, 0.04, 0.5); head.add(snout);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.44), mats.skin);
  jaw.position.set(0, -0.16, 0.46); head.add(jaw);
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), mats.white);
    t.rotation.x = Math.PI; t.position.set(-0.16 + i * 0.1, -0.04, 0.66); head.add(t);
  }
  addEyes(head, mats, 0.34, 0.18, 0.18, 0.08);
  return { group, head, tail, arms };
}

// --- Velociraptor: esbelto, horizontal, cola larga levantada, cabeza pequeña
function buildRaptor(mats) {
  const group = new THREE.Group();
  group.add(leg(mats, -0.2, 0, 0.46, 0.12));
  group.add(leg(mats, 0.2, 0.06, 0.46, 0.12));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), mats.skin);
  body.scale.set(1.1, 0.85, 1.55); body.position.set(0, 0.72, 0); body.rotation.x = 0.22; body.castShadow = true; group.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.35, 8), mats.skin);
  tail.rotation.x = Math.PI * 0.42; tail.position.set(0, 0.88, -0.72); tail.castShadow = true; group.add(tail);
  const head = new THREE.Group(); head.position.set(0, 0.98, 0.46); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), mats.skin);
  skull.scale.set(1, 0.9, 1.3); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 8), mats.skin);
  snout.rotation.x = Math.PI * 0.5; snout.position.set(0, -0.02, 0.32); head.add(snout);
  addEyes(head, mats, 0.2, 0.07, 0.12, 0.06);
  const arms = [];
  for (const sx of [-0.28, 0.28]) {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.18, 4, 8), mats.skin);
    a.position.set(sx, 0.72, 0.26); a.rotation.x = 0.6; arms.push(a); group.add(a);
  }
  return { group, head, tail, arms };
}

// --- Parasaurolophus: cresta tubular hacia atrás, pico de pato
function buildParasaur(mats) {
  const group = new THREE.Group();
  group.add(leg(mats, -0.22, 0, 0.5, 0.15));
  group.add(leg(mats, 0.22, 0, 0.5, 0.15));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 16), mats.skin);
  body.scale.set(1, 1.15, 1.15); body.position.set(0, 0.95, 0); body.castShadow = true; group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), mats.belly);
  belly.scale.set(0.9, 1.15, 0.6); belly.position.set(0, 0.85, 0.28); group.add(belly);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.05, 8), mats.skin);
  tail.rotation.x = Math.PI * 0.6; tail.position.set(0, 0.75, -0.5); tail.castShadow = true; group.add(tail);
  const head = new THREE.Group(); head.position.set(0, 1.5, 0.14); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mats.skin);
  skull.scale.set(1, 1, 1.2); skull.castShadow = true; head.add(skull);
  const bill = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.4), mats.skin);
  bill.position.set(0, -0.07, 0.34); head.add(bill);
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.72, 8), mats.dark);
  crest.rotation.x = -Math.PI * 0.32; crest.position.set(0, 0.3, -0.34); head.add(crest);
  addEyes(head, mats, 0.27, 0.07, 0.15, 0.07);
  return { group, head, tail, arms: [] };
}

// --- Triceratops: gola + tres cuernos + pico, cuadrúpedo
function buildTriceratops(mats) {
  const group = new THREE.Group();
  for (const [x, z] of [[-0.3, -0.35], [0.3, -0.35], [-0.3, 0.32], [0.3, 0.32]]) group.add(leg(mats, x, z, 0.42, 0.16));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 16), mats.skin);
  body.scale.set(1.1, 1, 1.5); body.position.set(0, 0.78, -0.05); body.castShadow = true; group.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 8), mats.skin);
  tail.rotation.x = Math.PI * 0.62; tail.position.set(0, 0.72, -0.92); group.add(tail);
  const head = new THREE.Group(); head.position.set(0, 0.82, 0.72); group.add(head);
  const frill = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 22), mats.dark);
  frill.rotation.x = Math.PI * 0.5; frill.position.set(0, 0.1, -0.16); frill.castShadow = true; head.add(frill);
  const frill2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 22), mats.skin);
  frill2.rotation.x = Math.PI * 0.5; frill2.position.set(0, 0.1, -0.12); head.add(frill2);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), mats.skin);
  skull.scale.set(1, 0.9, 1.1); skull.position.set(0, 0.02, 0.14); head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), mats.dark);
  beak.rotation.x = Math.PI * 0.5; beak.position.set(0, -0.06, 0.44); head.add(beak);
  const horn = (x, y, z, len, rx) => {
    const h = new THREE.Mesh(new THREE.ConeGeometry(0.05, len, 8), mats.white);
    h.position.set(x, y, z); h.rotation.x = rx; h.castShadow = true; head.add(h);
  };
  horn(-0.16, 0.3, 0.2, 0.5, 0.5); horn(0.16, 0.3, 0.2, 0.5, 0.5); horn(0, 0.0, 0.42, 0.28, 0.9);
  addEyes(head, mats, 0.34, 0.12, 0.17, 0.07);
  return { group, head, tail, arms: [] };
}

// --- Braquiosaurio: cuello larguísimo, cabeza pequeña arriba, cuadrúpedo
function buildBrachio(mats) {
  const group = new THREE.Group();
  for (const [x, z] of [[-0.34, -0.4], [0.34, -0.4], [-0.34, 0.4], [0.34, 0.4]]) group.add(leg(mats, x, z, 0.55, 0.18));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 16), mats.skin);
  body.scale.set(1, 1.1, 1.5); body.position.set(0, 1.05, 0); body.castShadow = true; group.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.5, 8), mats.skin);
  tail.rotation.x = Math.PI * 0.72; tail.position.set(0, 0.95, -1.0); tail.castShadow = true; group.add(tail);
  const neck = new THREE.Group(); neck.position.set(0, 1.35, 0.5); group.add(neck);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.26, 1.5, 10), mats.skin);
  neckMesh.position.set(0, 0.65, 0.05); neckMesh.rotation.x = -0.3; neckMesh.castShadow = true; neck.add(neckMesh);
  const head = new THREE.Group(); head.position.set(0, 1.42, 0.45); neck.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), mats.skin);
  skull.scale.set(1, 0.9, 1.3); head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.22), mats.skin);
  snout.position.set(0, -0.02, 0.18); head.add(snout);
  addEyes(head, mats, 0.14, 0.05, 0.1, 0.05);
  return { group, head, neck, tail, arms: [] };
}

/** Ráfaga de confeti de partículas. Devuelve { points, velocities }. */
export function buildConfetti(colorHex) {
  const N = 48;
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const velocities = new Float32Array(N * 3);
  const palette = [new THREE.Color(colorHex), new THREE.Color('#ffffff'), new THREE.Color('#ffe07a'), new THREE.Color('#2ecc71')];

  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 1] = 0.2 + Math.random() * 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    const ang = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 2.2;
    velocities[i * 3] = Math.cos(ang) * sp * 0.5;
    velocities[i * 3 + 1] = 2.5 + Math.random() * 2.5;
    velocities[i * 3 + 2] = Math.sin(ang) * sp * 0.5;
    const c = palette[(Math.random() * palette.length) | 0];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  return { points, velocities };
}
