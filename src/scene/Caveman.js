// Caveman.js — Cavernícola 3D con lanza (enemigo dinámico desde el nivel 5 y cada 5).
// Estilo "caricatura premium": chunky/cartoon, cabezón y expresivo, con pelo y barba
// prehistóricos, piel (pelt) al hombro, manos y pies marcados y una lanza con punta de
// piedra. Construido con primitivas (sin assets externos) y materiales con volumen.
//
// Devuelve un THREE.Group con userData de las partes animables:
//   { legL, legR, armL, armThrow, head, body, spear, handAnchor }
// y métodos de animación los aplica SceneManager (caminar, patada, giro, lanzamiento).

import * as THREE from 'three';

function makeCaveMats() {
  const skin = new THREE.Color('#d79a64');
  return {
    skin:  new THREE.MeshStandardMaterial({ color: skin, roughness: 0.62, metalness: 0.02, emissive: skin.clone().multiplyScalar(0.08), emissiveIntensity: 0.5 }),
    skin2: new THREE.MeshStandardMaterial({ color: '#c2854f', roughness: 0.66 }),   // sombra de piel
    fur:   new THREE.MeshStandardMaterial({ color: '#7a5230', roughness: 0.92 }),    // pieles
    fur2:  new THREE.MeshStandardMaterial({ color: '#5e3e22', roughness: 0.95 }),    // pieles oscuras
    hair:  new THREE.MeshStandardMaterial({ color: '#3a2614', roughness: 0.9 }),     // pelo / barba
    nail:  new THREE.MeshStandardMaterial({ color: '#efe6cf', roughness: 0.5 }),     // uñas / dientes
    wood:  new THREE.MeshStandardMaterial({ color: '#7a5230', roughness: 0.8 }),     // asta de la lanza
    stone: new THREE.MeshStandardMaterial({ color: '#8b9094', roughness: 0.55, metalness: 0.08 }), // punta de piedra
    lash:  new THREE.MeshStandardMaterial({ color: '#43301a', roughness: 0.9 }),     // atadura
    white: new THREE.MeshStandardMaterial({ color: '#f7f3e6', roughness: 0.4 }),
    pupil: new THREE.MeshStandardMaterial({ color: '#1a120a', roughness: 0.3 }),
    mouth: new THREE.MeshStandardMaterial({ color: '#7a2e34', roughness: 0.7 }),
    brow:  new THREE.MeshStandardMaterial({ color: '#2f1e10', roughness: 0.85 }),
  };
}

/** Lanza completa (asta + atadura + punta de piedra), orientada a lo largo de +Y. */
function makeSpear(mats, len = 1.2) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, len, 8), mats.wood);
  shaft.castShadow = true; g.add(shaft);
  // Atadura (dos anillos oscuros bajo la punta).
  for (const y of [len * 0.5 - 0.06, len * 0.5 - 0.14]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 8, 14), mats.lash);
    ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring);
  }
  // Punta de piedra (lasca afilada).
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.26, 6), mats.stone);
  tip.position.y = len * 0.5 + 0.1; tip.castShadow = true; g.add(tip);
  const tip2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), mats.stone);
  tip2.position.y = len * 0.5 + 0.02; g.add(tip2);
  return g;
}

/** Pierna (muslo + espinilla + pie con dedos). Origen en la cadera; cuelga hacia -Y. */
function legPart(mats, side) {
  const g = new THREE.Group();
  const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.26, 10), mats.skin);
  thigh.position.y = -0.13; thigh.castShadow = true; g.add(thigh);
  const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.24, 10), mats.skin);
  shin.position.y = -0.37; shin.castShadow = true; g.add(shin);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), mats.skin);
  foot.scale.set(1.1, 0.6, 1.7); foot.position.set(0, -0.48, 0.1); foot.castShadow = true; g.add(foot);
  for (let i = 0; i < 3; i++) { // deditos del pie
    const toe = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mats.skin);
    toe.position.set((-0.06 + i * 0.06), -0.5, 0.26); g.add(toe);
  }
  return g;
}

/** Brazo (bíceps + antebrazo + mano cerrada). Origen en el hombro; cuelga hacia -Y. */
function armPart(mats) {
  const g = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.18, 4, 10), mats.skin);
  upper.position.y = -0.13; upper.castShadow = true; g.add(upper);
  const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.18, 4, 10), mats.skin);
  fore.position.y = -0.34; fore.castShadow = true; g.add(fore);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), mats.skin);
  hand.position.y = -0.48; hand.castShadow = true; g.add(hand);
  g.userData.hand = hand;
  return g;
}

/** Construye el cavernícola. Mira hacia +Z por defecto. */
export function buildCaveman() {
  const mats = makeCaveMats();
  const group = new THREE.Group();

  // --- Piernas (cortas y robustas) ---
  const legL = legPart(mats, -1); legL.position.set(-0.16, 0.52, 0); group.add(legL);
  const legR = legPart(mats, 1); legR.position.set(0.16, 0.52, 0); group.add(legR);

  // --- Cuerpo (torso robusto + barriga + pieles) ---
  const body = new THREE.Group(); group.add(body);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 16), mats.skin);
  torso.scale.set(1.05, 1.1, 0.92); torso.position.set(0, 0.86, 0); torso.castShadow = true; body.add(torso);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mats.skin2);
  belly.scale.set(1, 1, 0.8); belly.position.set(0, 0.74, 0.18); body.add(belly);
  // Piel al hombro (pelt): banda diagonal de piel marrón.
  const pelt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.12), mats.fur);
  pelt.position.set(-0.06, 0.86, 0.34); pelt.rotation.z = 0.5; pelt.castShadow = true; body.add(pelt);
  const peltEdge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), mats.fur2);
  peltEdge.position.set(-0.2, 1.02, 0.36); peltEdge.rotation.z = 0.5; body.add(peltEdge);
  // Taparrabos de piel.
  const loin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.3, 14, 1, true), mats.fur);
  loin.position.set(0, 0.56, 0); loin.castShadow = true; body.add(loin);
  for (let i = 0; i < 5; i++) { // flecos del taparrabos
    const fr = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), mats.fur2);
    const a = (i / 4 - 0.5) * 1.6;
    fr.position.set(Math.sin(a) * 0.46, 0.4, Math.cos(a) * 0.46 * 0.9); fr.rotation.x = Math.PI; body.add(fr);
  }

  // --- Brazos ---
  const armThrow = armPart(mats); armThrow.position.set(0.44, 1.02, 0.04); armThrow.rotation.z = -0.35; group.add(armThrow);
  const armL = armPart(mats); armL.position.set(-0.44, 1.02, 0.04); armL.rotation.z = 0.5; armL.rotation.x = -0.2; group.add(armL);

  // --- Cabeza (grande y expresiva) ---
  const head = new THREE.Group(); head.position.set(0, 1.32, 0.02); group.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), mats.skin);
  skull.scale.set(1, 0.98, 1.02); skull.castShadow = true; head.add(skull);
  // Pelo salvaje (mechones oscuros arriba/lados).
  const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mats.hair);
  hairTop.position.set(0, 0.06, -0.02); hairTop.castShadow = true; head.add(hairTop);
  for (const [hx, hz, hr] of [[-0.3, 0.05, 0.12], [0.3, 0.05, 0.12], [-0.18, -0.28, 0.1], [0.18, -0.28, 0.1], [0, 0.34, 0.1]]) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(hr, 0.22, 6), mats.hair);
    tuft.position.set(hx, 0.14, hz); tuft.rotation.set(hz * 1.5, 0, -hx * 1.2); head.add(tuft);
  }
  // Nariz grande (rasgo cavernícola).
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mats.skin2);
  nose.scale.set(0.9, 0.85, 1.3); nose.position.set(0, -0.02, 0.34); head.add(nose);
  // Ceja/entrecejo prominente.
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.09, 0.14), mats.brow);
  brow.position.set(0, 0.14, 0.28); brow.rotation.x = 0.2; head.add(brow);
  // Ojos expresivos (decididos) bajo la ceja.
  for (const sx of [-0.13, 0.13]) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.072, 14, 12), mats.white);
    w.position.set(sx, 0.04, 0.3); head.add(w);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), mats.pupil);
    p.position.set(sx + (sx < 0 ? 0.012 : -0.012), 0.03, 0.36); head.add(p);
    const hi = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), mats.white);
    hi.position.set(sx + 0.02, 0.07, 0.38); head.add(hi);
  }
  // Boca / gesto (entreabierta con un par de dientes).
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.06), mats.mouth);
  mouth.position.set(0, -0.18, 0.31); head.add(mouth);
  for (const sx of [-0.05, 0.05]) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.05, 0.04), mats.nail);
    tooth.position.set(sx, -0.15, 0.33); head.add(tooth);
  }
  // Barba tupida (mechones oscuros en la mandíbula).
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), mats.hair);
  beard.scale.set(1, 1.1, 1.05); beard.position.set(0, -0.16, 0.06); beard.castShadow = true; head.add(beard);
  for (let i = 0; i < 5; i++) {
    const bt = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), mats.hair);
    bt.position.set((-0.2 + i * 0.1), -0.34, 0.18); bt.rotation.x = Math.PI; head.add(bt);
  }

  // --- Lanza (sujeta por la mano derecha = brazo lanzador) ---
  const spear = makeSpear(mats, 1.2);
  // Anclada al brazo lanzador (en la mano), inclinada hacia atrás-arriba (lista para lanzar).
  const handAnchor = armThrow.userData.hand;
  spear.position.set(0, -0.46, 0.04); spear.rotation.set(0.5, 0, 0.2);
  armThrow.add(spear);

  group.userData = { legL, legR, armL, armThrow, head, body, spear, handAnchor: armThrow };
  return { group, legL, legR, armL, armThrow, head, body, spear };
}

/** Lanza-proyectil (al lanzarse hacia el jugador). Orientada a lo largo de +Y. */
export function buildThrownSpear() {
  const mats = makeCaveMats();
  return makeSpear(mats, 1.0);
}
