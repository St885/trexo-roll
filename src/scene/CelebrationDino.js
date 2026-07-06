// CelebrationDino.js — Dinosaurios 3D de celebración, UNO por especie (no el mismo
// recoloreado). Cada modelo se construye con primitivas y lee claramente como su
// dinosaurio, con su PERSONALIDAD propia (T-Rex feroz, Raptor ágil, Parasaurio tierno,
// Triceratops robusto, Braquiosaurio sereno). Coloreado con el color de la bola elegida.
//
// Mejoras de acabado: tono medio para volumen, marfil para cuernos/garras/dientes,
// interior de boca, párpados para expresión, espinas dorsales, mandíbula articulada
// (T-Rex), garra falciforme (Raptor), gola con epoccipitales (Triceratops).

import * as THREE from 'three';
import { getDino } from '../data/dinos.js';

function makeMats(ballDef) {
  const skin = new THREE.Color(ballDef.dino);
  const dark = new THREE.Color(ballDef.dark);
  const belly = skin.clone().lerp(new THREE.Color('#fff7e0'), 0.5);
  const mid = skin.clone().lerp(dark, 0.42);
  return {
    // Piel principal con leve realce de color bajo el tone mapping (más viva).
    skin:  new THREE.MeshStandardMaterial({ color: skin, roughness: 0.5, metalness: 0.05, emissive: skin.clone().multiplyScalar(0.1), emissiveIntensity: 0.5 }),
    mid:   new THREE.MeshStandardMaterial({ color: mid, roughness: 0.58 }),     // tono medio (sombra/volumen)
    belly: new THREE.MeshStandardMaterial({ color: belly, roughness: 0.6 }),    // vientre claro
    dark:  new THREE.MeshStandardMaterial({ color: dark, roughness: 0.55 }),    // crestas, espinas, manchas
    white: new THREE.MeshStandardMaterial({ color: 0xf6f2e3, roughness: 0.4 }), // esclerótica / dientes
    ivory: new THREE.MeshStandardMaterial({ color: 0xefe6c8, roughness: 0.45, metalness: 0.02 }), // cuernos / garras / pico
    pupil: new THREE.MeshStandardMaterial({ color: 0x140d08, roughness: 0.25 }),
    mouth: new THREE.MeshStandardMaterial({ color: 0x9a4350, roughness: 0.7 }), // interior de boca
  };
}

// Pata con muslo (más grueso arriba) + espinilla + pie + garras. opts: claws, sickle.
function leg(mats, x, z, h = 0.42, r = 0.15, opts = {}) {
  const g = new THREE.Group();
  const thigh = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.3, r, h * 0.56, 12), mats.skin);
  thigh.position.y = h - h * 0.28; thigh.castShadow = true; g.add(thigh);
  const shin = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.82, h * 0.56, 12), mats.skin);
  shin.position.y = h * 0.28; shin.castShadow = true; g.add(shin);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(r * 1.2, 12, 10), mats.skin);
  foot.scale.set(1.1, 0.5, 1.7); foot.position.set(0, 0.04, r * 0.8); g.add(foot);
  const claws = opts.claws == null ? 3 : opts.claws;
  for (let i = 0; i < claws; i++) {
    const cx = claws === 1 ? 0 : (-(claws - 1) / 2 + i) * r * 0.72;
    const claw = new THREE.Mesh(new THREE.ConeGeometry(r * 0.16, r * 0.5, 6), mats.ivory);
    claw.rotation.x = Math.PI / 2.3; claw.position.set(cx, 0.02, r * 1.65); g.add(claw);
  }
  if (opts.sickle) {
    // Garra falciforme (Velociraptor): una uña grande y curva levantada del pie.
    const s = new THREE.Mesh(new THREE.ConeGeometry(r * 0.24, r * 1.15, 8), mats.ivory);
    s.position.set(0, r * 0.55, r * 1.2); s.rotation.x = -0.95; g.add(s);
  }
  g.position.set(x, 0, z);
  return g;
}

// Ojos con esclerótica, pupila, chispa especular y párpado superior (expresión).
function addEyes(head, mats, z, y, spread, r, opts = {}) {
  for (const sx of [-spread, spread]) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mats.white);
    w.position.set(sx, y, z); head.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(r * 0.55, 12, 10), mats.pupil);
    p.position.set(sx, y, z + r * 0.62); head.add(p);
    const hi = new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 6, 6), mats.white);
    hi.position.set(sx + r * 0.24, y + r * 0.28, z + r * 0.74); head.add(hi);
    if (opts.lid) {
      // Párpado: media esfera de piel inclinada. lidAngle define la "mirada"
      // (poco = fiera, mucho = serena/tierna).
      const lid = new THREE.Mesh(new THREE.SphereGeometry(r * 1.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mats.skin);
      lid.position.set(sx, y + r * 0.12, z); lid.rotation.x = opts.lidAngle == null ? -0.5 : opts.lidAngle;
      lid.rotation.z = sx < 0 ? -0.12 : 0.12; head.add(lid);
    }
  }
}

/** Cresta/ceja sobre los ojos: da carácter. */
function addBrow(head, mats, z, y, spread, w = 0.14) {
  for (const sx of [-spread, spread]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.18), mats.dark);
    brow.position.set(sx, y, z); brow.rotation.z = sx < 0 ? 0.22 : -0.22; head.add(brow);
  }
}

/** Fosas nasales en el hocico. */
function addNostrils(head, mats, z, y, spread, r = 0.03) {
  for (const sx of [-spread, spread]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mats.dark);
    n.position.set(sx, y, z); head.add(n);
  }
}

/** Fila de dientes (conos marfil). up=true apunta hacia arriba (mandíbula inferior). */
function teeth(target, mats, y, span, count, len = 0.1, up = false) {
  for (let i = 0; i < count; i++) {
    const tx = (-(count - 1) / 2 + i) * (span / Math.max(1, count - 1));
    const tt = new THREE.Mesh(new THREE.ConeGeometry(0.028, len, 6), mats.white);
    tt.position.set(tx, y, 0); tt.rotation.x = up ? 0 : Math.PI; target.add(tt);
  }
}

/** Espinas/placas dorsales (conos oscuros) en posiciones [x,y,z,escala,inclinación]. */
function spikes(target, mats, list, baseLen = 0.16, baseR = 0.06) {
  for (const [x, y, z, s = 1, lean = 0] of list) {
    const sp = new THREE.Mesh(new THREE.ConeGeometry(baseR * s, baseLen * s, 6), mats.dark);
    sp.position.set(x, y, z); sp.rotation.x = lean; target.add(sp);
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
    head: res.head, neck: res.neck || null, tail: res.tail || null,
    arms: res.arms || [], jaw: res.jaw || null, crest: res.crest || null, legs: res.legs || [],
  };
  return res.group;
}

// --- T-Rex: feroz. Bípedo robusto, cabezón con mandíbula que abre y dientes, espinas.
function buildTRex(mats) {
  const group = new THREE.Group();
  const legs = [leg(mats, -0.24, 0, 0.55, 0.2, { claws: 3 }), leg(mats, 0.24, 0, 0.55, 0.2, { claws: 3 })];
  legs.forEach((l) => group.add(l));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.58, 22, 18), mats.skin);
  body.scale.set(1, 1.2, 1.05); body.position.set(0, 1.0, 0); body.castShadow = true; group.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), mats.belly);
  chest.scale.set(0.92, 1.15, 0.7); chest.position.set(0, 0.92, 0.28); group.add(chest);
  const tail = new THREE.Group(); tail.position.set(0, 0.85, -0.4); group.add(tail);
  const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.3, 10), mats.skin);
  tailMesh.rotation.x = Math.PI * 0.6; tailMesh.position.set(0, -0.05, -0.45); tailMesh.castShadow = true; tail.add(tailMesh);
  spikes(group, mats, [[0, 1.55, -0.1, 1.1], [0, 1.5, -0.42, 1.2], [0, 1.34, -0.74, 1.0], [0, 1.12, -1.04, 0.8]], 0.18, 0.07);
  const arms = [];
  for (const sx of [-0.4, 0.4]) {
    const a = new THREE.Group(); a.position.set(sx, 1.05, 0.32);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 4, 8), mats.skin); upper.rotation.x = 0.5; a.add(upper);
    for (const cx of [-0.035, 0.035]) {
      const cl = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.1, 5), mats.ivory); cl.position.set(cx, -0.16, 0.05); a.add(cl);
    }
    arms.push(a); group.add(a);
  }
  const head = new THREE.Group(); head.position.set(0, 1.62, 0.14); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), mats.skin);
  skull.scale.set(1, 0.95, 1.35); skull.position.set(0, 0.06, 0.12); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 0.5), mats.skin);
  snout.position.set(0, 0.02, 0.5); head.add(snout);
  const mouthIn = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.42), mats.mouth);
  mouthIn.position.set(0, -0.12, 0.46); head.add(mouthIn);
  const upTeeth = new THREE.Group(); upTeeth.position.set(0, -0.12, 0.66); head.add(upTeeth);
  teeth(upTeeth, mats, 0, 0.34, 6, 0.1, false);
  // Mandíbula inferior articulada (bisagra al fondo de la boca).
  const jaw = new THREE.Group(); jaw.position.set(0, -0.16, 0.22); head.add(jaw);
  const jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.46), mats.skin); jawMesh.position.set(0, 0, 0.24); jaw.add(jawMesh);
  const loTeeth = new THREE.Group(); loTeeth.position.set(0, 0.09, 0.42); jaw.add(loTeeth);
  teeth(loTeeth, mats, 0, 0.32, 6, 0.09, true);
  addBrow(head, mats, 0.34, 0.32, 0.19, 0.18);
  addEyes(head, mats, 0.34, 0.2, 0.19, 0.085, { lid: true, lidAngle: -0.3 });
  addNostrils(head, mats, 0.72, 0.06, 0.07);
  return { group, head, tail, arms, jaw, legs };
}

// --- Velociraptor: ágil. Esbelto, horizontal, garra falciforme, cresta de plumas, cola rígida.
function buildRaptor(mats) {
  const group = new THREE.Group();
  const legs = [leg(mats, -0.2, 0.02, 0.5, 0.13, { claws: 2, sickle: true }), leg(mats, 0.2, 0.08, 0.5, 0.13, { claws: 2, sickle: true })];
  legs.forEach((l) => group.add(l));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), mats.skin);
  body.scale.set(1.05, 0.82, 1.65); body.position.set(0, 0.76, 0); body.rotation.x = 0.18; body.castShadow = true; group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), mats.belly);
  belly.scale.set(0.9, 0.7, 1.3); belly.position.set(0, 0.66, 0.2); group.add(belly);
  const tail = new THREE.Group(); tail.position.set(0, 0.85, -0.5); group.add(tail);
  const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.5, 8), mats.skin);
  tailMesh.rotation.x = Math.PI * 0.4; tailMesh.position.set(0, 0.06, -0.55); tailMesh.castShadow = true; tail.add(tailMesh);
  spikes(group, mats, [[0, 1.0, 0.34, 0.8, 0.4], [0, 1.06, 0.12, 0.9, 0.3], [0, 1.02, -0.12, 0.9, 0.2], [0, 0.9, -0.36, 0.8, 0.1]], 0.14, 0.045);
  const head = new THREE.Group(); head.position.set(0, 1.02, 0.5); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mats.skin);
  skull.scale.set(1, 0.92, 1.35); skull.castShadow = true; head.add(skull);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.46, 10), mats.skin);
  snout.rotation.x = Math.PI * 0.5; snout.position.set(0, -0.03, 0.34); head.add(snout);
  const teethG = new THREE.Group(); teethG.position.set(0, -0.1, 0.42); head.add(teethG);
  teeth(teethG, mats, 0, 0.16, 5, 0.06, false);
  addBrow(head, mats, 0.2, 0.16, 0.12, 0.12);
  addEyes(head, mats, 0.18, 0.08, 0.13, 0.062, { lid: true, lidAngle: -0.28 });
  addNostrils(head, mats, 0.52, 0.0, 0.05, 0.022);
  const arms = [];
  for (const sx of [-0.26, 0.26]) {
    const a = new THREE.Group(); a.position.set(sx, 0.74, 0.28); a.rotation.x = 0.7;
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.2, 4, 8), mats.skin); a.add(fore);
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), mats.ivory); claw.position.set(0, -0.16, 0.02); a.add(claw);
    arms.push(a); group.add(a);
  }
  return { group, head, tail, arms, legs };
}

// --- Parasaurolophus: tierno/elegante. Pico de pato + cresta tubular curva hacia atrás.
function buildParasaur(mats) {
  const group = new THREE.Group();
  const legs = [leg(mats, -0.22, 0, 0.52, 0.16, { claws: 3 }), leg(mats, 0.22, 0, 0.52, 0.16, { claws: 3 })];
  legs.forEach((l) => group.add(l));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 16), mats.skin);
  body.scale.set(1, 1.18, 1.2); body.position.set(0, 0.98, 0); body.castShadow = true; group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), mats.belly);
  belly.scale.set(0.92, 1.18, 0.62); belly.position.set(0, 0.88, 0.28); group.add(belly);
  const tail = new THREE.Group(); tail.position.set(0, 0.8, -0.42); group.add(tail);
  const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.1, 8), mats.skin);
  tailMesh.rotation.x = Math.PI * 0.6; tailMesh.position.set(0, -0.02, -0.45); tailMesh.castShadow = true; tail.add(tailMesh);
  const head = new THREE.Group(); head.position.set(0, 1.54, 0.16); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mats.skin);
  skull.scale.set(1, 1, 1.25); skull.castShadow = true; head.add(skull);
  const bill = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.34), mats.mid);
  bill.position.set(0, -0.11, 0.36); head.add(bill);
  const billTop = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.3), mats.skin);
  billTop.position.set(0, -0.02, 0.34); head.add(billTop);
  // Cresta tubular en dos tramos (base de piel + punta oscura) curvada hacia atrás.
  const crest = new THREE.Group(); crest.position.set(0, 0.2, -0.16); head.add(crest);
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.5, 10), mats.skin);
  c1.position.set(0, 0.16, -0.2); c1.rotation.x = -Math.PI * 0.34; c1.castShadow = true; crest.add(c1);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.42, 10), mats.dark);
  c2.position.set(0, 0.42, -0.42); c2.rotation.x = -Math.PI * 0.34; crest.add(c2);
  addEyes(head, mats, 0.27, 0.08, 0.16, 0.072, { lid: true, lidAngle: -0.72 });
  addNostrils(head, mats, 0.5, -0.07, 0.06, 0.022);
  return { group, head, tail, crest, arms: [], legs };
}

// --- Triceratops: robusto. Gola con epoccipitales + 3 cuernos sólidos + pico, cuadrúpedo.
function buildTriceratops(mats) {
  const group = new THREE.Group();
  const legs = [];
  for (const [x, z] of [[-0.32, -0.34], [0.32, -0.34], [-0.32, 0.34], [0.32, 0.34]]) { const l = leg(mats, x, z, 0.44, 0.18, { claws: 3 }); legs.push(l); group.add(l); }
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 22, 16), mats.skin);
  body.scale.set(1.12, 1.0, 1.5); body.position.set(0, 0.8, -0.04); body.castShadow = true; group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), mats.belly);
  belly.scale.set(1.0, 0.7, 1.3); belly.position.set(0, 0.62, 0.06); group.add(belly);
  const tail = new THREE.Group(); tail.position.set(0, 0.74, -0.92); group.add(tail);
  const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 8), mats.skin);
  tailMesh.rotation.x = Math.PI * 0.6; tailMesh.position.set(0, 0, -0.1); tail.add(tailMesh);
  const head = new THREE.Group(); head.position.set(0, 0.84, 0.72); group.add(head);
  const frill = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.1, 24), mats.dark);
  frill.rotation.x = Math.PI * 0.5; frill.position.set(0, 0.12, -0.18); frill.castShadow = true; head.add(frill);
  const frillIn = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.12, 24), mats.mid);
  frillIn.rotation.x = Math.PI * 0.5; frillIn.position.set(0, 0.12, -0.14); head.add(frillIn);
  // Epoccipitales: bolitas marfil en el borde superior de la gola.
  for (let i = 0; i <= 8; i++) {
    const ang = -Math.PI * 0.5 + (i / 8) * Math.PI;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mats.ivory);
    b.position.set(Math.cos(ang) * 0.56, 0.12 + Math.sin(ang) * 0.56, -0.18); head.add(b);
  }
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), mats.skin);
  skull.scale.set(1, 0.92, 1.15); skull.position.set(0, 0.0, 0.16); head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 8), mats.ivory);
  beak.rotation.x = Math.PI * 0.5; beak.position.set(0, -0.08, 0.46); head.add(beak);
  const horn = (x, y, z, len, rx, rad) => {
    const h = new THREE.Mesh(new THREE.ConeGeometry(rad, len, 10), mats.ivory);
    h.position.set(x, y, z); h.rotation.x = rx; h.castShadow = true; head.add(h);
  };
  horn(-0.17, 0.34, 0.22, 0.56, 0.4, 0.07); horn(0.17, 0.34, 0.22, 0.56, 0.4, 0.07); horn(0, -0.02, 0.46, 0.32, 1.0, 0.06);
  addBrow(head, mats, 0.34, 0.18, 0.18, 0.14);
  addEyes(head, mats, 0.36, 0.12, 0.18, 0.07, { lid: true, lidAngle: -0.5 });
  return { group, head, tail, arms: [], legs };
}

// --- Braquiosaurio: sereno/elegante. Cuello larguísimo, cabeza pequeña arriba, cuadrúpedo.
function buildBrachio(mats) {
  const group = new THREE.Group();
  const legs = [];
  for (const [x, z] of [[-0.36, -0.42], [0.36, -0.42], [-0.36, 0.42], [0.36, 0.42]]) { const l = leg(mats, x, z, 0.6, 0.2, { claws: 3 }); legs.push(l); group.add(l); }
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 22, 16), mats.skin);
  body.scale.set(1, 1.12, 1.5); body.position.set(0, 1.1, 0); body.castShadow = true; group.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.56, 16, 12), mats.belly);
  belly.scale.set(0.95, 0.8, 1.25); belly.position.set(0, 0.92, 0.06); group.add(belly);
  const tail = new THREE.Group(); tail.position.set(0, 1.0, -0.95); group.add(tail);
  const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.7, 10), mats.skin);
  tailMesh.rotation.x = Math.PI * 0.72; tailMesh.position.set(0, 0.0, -0.6); tailMesh.castShadow = true; tail.add(tailMesh);
  // Cuello largo articulado (dos tramos que se afinan) + cabeza pequeña arriba.
  const neck = new THREE.Group(); neck.position.set(0, 1.45, 0.45); group.add(neck);
  const neckLo = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.9, 12), mats.skin);
  neckLo.position.set(0, 0.36, 0.06); neckLo.rotation.x = -0.3; neckLo.castShadow = true; neck.add(neckLo);
  const neckHi = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.9, 12), mats.skin);
  neckHi.position.set(0, 1.06, 0.26); neckHi.rotation.x = -0.3; neckHi.castShadow = true; neck.add(neckHi);
  const head = new THREE.Group(); head.position.set(0, 1.5, 0.46); neck.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), mats.skin);
  skull.scale.set(1, 0.92, 1.35); head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.22), mats.skin);
  snout.position.set(0, -0.02, 0.18); head.add(snout);
  const bump = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mats.skin); // cresta nasal del braquiosaurio
  bump.position.set(0, 0.12, 0.02); head.add(bump);
  addEyes(head, mats, 0.14, 0.04, 0.11, 0.05, { lid: true, lidAngle: -0.82 });
  addNostrils(head, mats, 0.22, 0.07, 0.04, 0.018);
  return { group, head, neck, tail, arms: [], legs };
}

/** Ráfaga de confeti de partículas. `scale` (perfil gráfico) reduce el nº en móvil.
 *  Devuelve { points, velocities }. */
export function buildConfetti(colorHex, scale = 1) {
  const N = Math.max(8, Math.round(54 * scale));
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const velocities = new Float32Array(N * 3);
  const palette = [new THREE.Color(colorHex), new THREE.Color('#ffffff'), new THREE.Color('#ffe07a'), new THREE.Color('#2ecc71'), new THREE.Color('#ffb347')];

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
