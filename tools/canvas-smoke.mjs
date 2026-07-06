// canvas-smoke.mjs — Ejerce el código de dibujo Canvas 2D y construcción 3D sin
// navegador, con un contexto 2D simulado. Detecta errores de runtime en las
// texturas procedurales (caras de dino, fondos de bioma) y el dino de celebración.
//
// Uso:  node --import ./tools/register-three.mjs tools/canvas-smoke.mjs

// --- Stubs mínimos de DOM/Canvas -------------------------------------------
const grad = { addColorStop() {} };
function mockCtx() {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => grad;
      if (prop === 'canvas') return { width: 64, height: 64 };
      return () => {};
    },
    set() { return true; },
  });
}
globalThis.window = globalThis;
globalThis.self = globalThis;
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, className: '', style: {}, getContext: () => mockCtx() }),
  createElementNS: () => ({ style: {}, getContext: () => mockCtx() }),
};

let failures = 0;
const run = async (label, fn) => {
  try { await fn(); console.log('  ✅ ' + label); }
  catch (e) { failures++; console.log('  ❌ ' + label + ' → ' + e.message); }
};

const tex = await import('../src/scene/textures.js');
const { BALLS } = await import('../src/data/balls.js');
const cel = await import('../src/scene/CelebrationDino.js');

console.log('\n[Texturas procedurales]');
// La bola blanca principal muestra a OLIVER, el T-Rex bebé azul (emblem 'oliver'), no el T-Rex viejo.
await run("bola 'blanca' usa emblem 'oliver' (T-Rex bebé Oliver)", () => {
  const w = BALLS.find((b) => b.id === 'blanca');
  if (!w || w.emblem !== 'oliver') throw new Error("la bola blanca debe tener emblem 'oliver'");
  if (w.species !== 'trex') throw new Error('la especie/ability de la bola blanca NO debe cambiar (trex)');
});
for (const b of BALLS) {
  await run('makeBallTexture(' + b.id + ')', () => tex.makeBallTexture(b));
  await run('makeBallThumbnail(' + b.id + ')', () => tex.makeBallThumbnail(b, 96));
}
await run('makeBoardTexture', () => tex.makeBoardTexture());
await run('makeContactShadowTexture', () => tex.makeContactShadowTexture());
await run('makeSkyTexture', () => tex.makeSkyTexture());
await run('makeGlowTexture', () => tex.makeGlowTexture('#ffd86b'));

console.log('\n[Fondos de bioma + suelo]');
for (const theme of Object.keys(tex.THEMES)) {
  await run('makeThemeSky(' + theme + ')', () => tex.makeThemeSky(theme));
  await run('makeGroundTexture(' + theme + ')', () => tex.makeGroundTexture(theme));
}

console.log('\n[Construcción de tableros 3D (los 25 niveles)]');
const { buildBoard } = await import('../src/scene/BoardBuilder.js');
const { LEVELS } = await import('../src/levels/levels.js');
for (const lvl of LEVELS) {
  await run('buildBoard(' + lvl.id + ' · ' + lvl.name + ')', () => {
    const { group } = buildBoard(lvl);
    if (!group || !group.children || group.children.length === 0) throw new Error('grupo vacío');
  });
}

console.log('\n[Recompensas 3D: monedas, estrella, ptero, tapa de trampa]');
const art = await import('../src/scene/collectibleArt.js');
await run('makeCoin', () => art.makeCoin());
await run('makeStarToken', () => art.makeStarToken());
await run('makeTrapCover', () => art.makeTrapCover(1.0));
await run('makePtero', () => art.makePtero('#8a5a3a'));

console.log('\n[Dino de celebración + confeti]');
for (const b of BALLS) {
  await run('buildDino(' + b.id + ')', () => cel.buildDino(b));
}
await run('buildConfetti', () => cel.buildConfetti('#2ecc71'));

console.log('\n[Cavernícola con lanza]');
const cave = await import('../src/scene/Caveman.js');
await run('buildCaveman', () => {
  const { group } = cave.buildCaveman();
  if (!group || !group.children || group.children.length === 0) throw new Error('grupo vacío');
});
await run('buildThrownSpear', () => cave.buildThrownSpear());

console.log('\n[Cohetes + fuegos artificiales]');
const rk = await import('../src/scene/RocketArt.js');
await run('makeRocket(color)', () => { const g = rk.makeRocket('color'); if (!g.children.length) throw new Error('vacío'); });
await run('makeRocket(red)', () => { const g = rk.makeRocket('red'); if (!g.children.length) throw new Error('vacío'); });
await run('makeRocketFlame', () => rk.makeRocketFlame());
await run('makeGlow', () => rk.makeGlow('#ffe7a0', 1.5));
await run('makeFireworkBurst', () => rk.makeFireworkBurst());

console.log('\n[Encuadre de cámara: horizontal más grande + sin recortar al inclinar]');
{
  const THREE = await import('three');
  const { computeSphereFrame, computeAxisFrame } = await import('../src/scene/SceneManager.js');
  const { footprintBounds } = await import('../src/physics/footprint.js');
  const { PHYS } = await import('../src/utils/constants.js');
  const FOV = 48, DECOR = 2.0;

  // Proyecta las esquinas a NDC a la inclinación MÁXIMA (en los 4 sentidos) y devuelve el
  // peor |ndc|. Reproduce el mecanismo real del juego (boardGroup.rotation.x/z + localToWorld).
  // margin = banda extra alrededor del footprint (0.3 ≈ borde del tablero; 2.0 ≈ decoración).
  const maxNdcAtTilt = (frame, b, aspect, margin, yMax) => {
    const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 260);
    cam.position.set(frame.pos.x, frame.pos.y, frame.pos.z);
    cam.lookAt(frame.target.x, frame.target.y, frame.target.z);
    cam.updateMatrixWorld(true);
    const board = new THREE.Object3D();
    const xs = [b.minX - margin, b.maxX + margin], zs = [b.minZ - margin, b.maxZ + margin], ys = [0, yMax];
    let worst = 0;
    for (const tx of [PHYS.MAX_TILT, -PHYS.MAX_TILT]) for (const tz of [PHYS.MAX_TILT, -PHYS.MAX_TILT]) {
      board.rotation.set(tx, 0, tz); board.updateMatrixWorld(true);
      for (const x of xs) for (const y of ys) for (const z of zs) {
        const v = new THREE.Vector3(x, y, z); board.localToWorld(v); v.project(cam);
        worst = Math.max(worst, Math.abs(v.x), Math.abs(v.y));
      }
    }
    return worst; // ≤ 1 ⇒ dentro de pantalla
  };
  const boardNdc = (f, b, aspect) => maxNdcAtTilt(f, b, aspect, 0.3, 0.5);  // TABLERO (footprint+rim)
  const decorNdc = (f, b, aspect) => maxNdcAtTilt(f, b, aspect, DECOR, 0.6); // con DECORACIÓN

  const samples = [LEVELS[0], LEVELS[1], LEVELS[8], LEVELS[12], LEVELS[24]]; // niveles 1,2,9,13,25
  for (const lvl of samples) {
    const b = footprintBounds(lvl.footprint);
    const center = { x: (b.minX + b.maxX) / 2, y: 0, z: (b.minZ + b.maxZ) / 2 };
    const wide = b.width / b.depth >= 1.5; // tableros anchos = los que se veían pequeños
    const landM = computeAxisFrame(b, center, FOV, 2.0, { landscapeMobile: true });  // MÓVIL horizontal (con zoom fino)
    const landD = computeAxisFrame(b, center, FOV, 2.0, {});                         // landscape genérico (sin zoom)
    const port = computeSphereFrame(b, center, FOV, 0.46, { smallPortrait: true });  // móvil vertical
    const sphereLand = computeSphereFrame(b, center, FOV, 2.0, {});                   // método ESFERA (pre-v0.24.1)
    // GUARDARRAÍL DURO: el TABLERO (footprint) nunca se recorta, ni al inclinar al máximo en
    // diagonal. Es el criterio de "sin recortes" del juego. (v0.24.7: máx. real ≈ 0.963.)
    await run(`L${lvl.id}: el TABLERO no se corta al inclinar (footprint ≤ 1.0)`, () => {
      const w = boardNdc(landM, b, 2.0); if (w > 1.0) throw new Error('tablero recortado (ndc ' + w.toFixed(3) + ')');
    });
    // DISEÑO v0.24.7 (móvil horizontal): se reserva menos banda de decoración para que el
    // tablero sea el protagonista. La decoración EXTERIOR puede asomar fuera del borde solo al
    // inclinar al máximo (transitorio, más inmersivo); el tablero sigue garantizado dentro.
    await run(`L${lvl.id}: la decoración solo asoma al inclinar (≤ 1.27)`, () => {
      const w = decorNdc(landM, b, 2.0); if (w > 1.27) throw new Error('decoración demasiado fuera (ndc ' + w.toFixed(3) + ')');
    });
    await run(`L${lvl.id}: VERTICAL no se corta (sin cambios)`, () => {
      const w = decorNdc(port, b, 0.46); if (w > 1.05) throw new Error('recorta (ndc ' + w.toFixed(3) + ')');
    });
    // El encuadre móvil horizontal es claramente MÁS CERCANO que el landscape genérico
    // (reserva menos decoración + zoom fino): ~20–23% más cerca (v0.24.7; antes ~11%).
    await run(`L${lvl.id}: móvil horizontal acerca ~20% (tablero más grande)`, () => {
      const closer = 1 - landM.dist / landD.dist;
      if (closer < 0.16 || closer > 0.28) throw new Error('fuera de rango (' + (closer * 100).toFixed(1) + '% más cerca)');
    });
    if (wide) await run(`L${lvl.id} (ancho ${(b.width / b.depth).toFixed(1)}:1): MUCHO más grande que el método esfera`, () => {
      if (!(landM.dist < sphereLand.dist * 0.72)) throw new Error(`poca mejora (axis ${landM.dist.toFixed(1)} vs esfera ${sphereLand.dist.toFixed(1)})`);
    });
    // El tablero llena MÁS la pantalla (v0.24.8: footprint en inclinación ≥ 0.82; v0.24.7 0.80; antes 0.74).
    await run(`L${lvl.id}: el tablero llena bien la pantalla (footprint ≥ 0.82)`, () => {
      const cov = boardNdc(landM, b, 2.0); if (cov < 0.82) throw new Error('infrautiliza (cobertura ' + cov.toFixed(3) + ')');
    });
  }
}

// ── Sincronía de RENDER de hoyos dinámicos: setTrapTransform actualiza la malla ──────────
// Bloquea el bug "el hoyo no anima visualmente": comprueba sobre mallas THREE reales que
// posición, escala (= radio actual / base), brillo y opacidad cambian por llamada.
{
  const THREE = await import('three');
  const { SceneManager } = await import('../src/scene/SceneManager.js');
  const baseR = 1.0;
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(baseR, baseR * 0.7, 0.6, 12), new THREE.MeshStandardMaterial());
  const ring = new THREE.Mesh(new THREE.TorusGeometry(baseR, 0.08, 8, 12), new THREE.MeshStandardMaterial({ emissive: 0xe74c3c, emissiveIntensity: 0 }));
  const ctx = { _trapMeshes: [{ hole, ring, baseR }], _t: 1.0 };
  const apply = (x, z, r, active) => SceneManager.prototype.setTrapTransform.call(ctx, 0, x, z, r, active);

  await run('setTrapTransform: hoyo GRANDE/activo → mueve, agranda y enrojece la malla', () => {
    apply(2, 3, 1.5, true);
    if (Math.abs(hole.position.x - 2) > 1e-6 || Math.abs(hole.position.z - 3) > 1e-6) throw new Error('posición no actualizada');
    if (Math.abs(hole.scale.x - 1.5) > 1e-6) throw new Error('escala del hoyo ≠ r/baseR');
    if (Math.abs(ring.scale.x - 1.5) > 1e-6) throw new Error('escala del anillo ≠ r/baseR');
    if (ring.material.emissiveIntensity < 0.3) throw new Error('activo debería brillar (rojo intenso)');
    if (ring.material.opacity < 1) throw new Error('activo debería ser opaco');
  });
  await run('setTrapTransform: hoyo PEQUEÑO/inactivo → encoge y se apaga/translúcido', () => {
    apply(0, 0, 0.2, false);
    if (hole.scale.x > 0.5) throw new Error('el hoyo no encogió visualmente');
    if (ring.material.emissiveIntensity > 0.2) throw new Error('inactivo debería verse apagado');
    if (ring.material.opacity >= 1) throw new Error('inactivo debería ser translúcido');
  });
  await run('radio VISUAL sincronizado con el radio LÓGICO (scale = r/baseR)', () => {
    apply(0, 0, 0.85, true);
    if (Math.abs(hole.scale.x - 0.85 / baseR) > 1e-6) throw new Error('desincronía visual/lógica');
  });
}

console.log(`\n${failures === 0 ? '✅ Código de dibujo/3D sin errores de runtime' : '❌ ' + failures + ' fallo(s)'}\n`);
process.exit(failures === 0 ? 0 : 1);
