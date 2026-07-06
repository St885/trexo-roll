// celebration-smoke.mjs — Verifica el sistema de CELEBRACIÓN DE VICTORIA POR ESPECIE: cada bola
// hace salir del hoyo SU dinosaurio (T-Rexo/Oliver para trex, triceratops bebé para triceratops,
// procedural para el resto). No usa navegador; comprueba datos (CELEBRATION_MODELS), assets en disco
// y guardas de código anti-regresión (que no se vuelva a un único modelo global para todas las bolas).
//
// Uso:  node tools/celebration-smoke.mjs

import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✅' : '❌'} ${msg}`); if (!cond) fails++; };

const { CELEBRATION_MODELS, TREXO_MODEL_PATH, TRIKE_CELEB_MODEL_PATH, RAPTOR_BABY_MODEL_PATH, PARASAUR_BABY_MODEL_PATH } = await import('../src/utils/constants.js');
const { BALLS } = await import('../src/data/balls.js');

console.log('\n[CELEBRATION_MODELS — modelos 3D por especie]');
ok(!!CELEBRATION_MODELS, 'CELEBRATION_MODELS existe');
ok(!!CELEBRATION_MODELS.trex, 'hay entrada para la especie trex (Rex Blanco → T-Rexo/Oliver)');
ok(CELEBRATION_MODELS.trex && /characters\/trexo\/trexo_master\.glb$/.test(CELEBRATION_MODELS.trex.path),
  `trex usa el modelo T-Rexo (${CELEBRATION_MODELS.trex && CELEBRATION_MODELS.trex.path})`);
ok(CELEBRATION_MODELS.trex && CELEBRATION_MODELS.trex.path === TREXO_MODEL_PATH, 'trex.path === TREXO_MODEL_PATH');
ok(CELEBRATION_MODELS.trex && !!CELEBRATION_MODELS.trex.fallbackPath, 'trex tiene fallbackPath (T-Rexo character)');
ok(!!CELEBRATION_MODELS.triceratops, 'hay entrada para la especie triceratops (Tricera Amarillo)');
ok(CELEBRATION_MODELS.triceratops && CELEBRATION_MODELS.triceratops.path === TRIKE_CELEB_MODEL_PATH,
  'triceratops usa el triceratops bebé amarillo');
ok(!!CELEBRATION_MODELS.raptor, 'hay entrada para la especie raptor (Raptor Verde → raptor bebé verde)');
ok(CELEBRATION_MODELS.raptor && CELEBRATION_MODELS.raptor.path === RAPTOR_BABY_MODEL_PATH
  && /characters\/raptor_baby\/raptor_baby_green\.glb$/.test(CELEBRATION_MODELS.raptor.path),
  `raptor usa el raptor bebé verde (${CELEBRATION_MODELS.raptor && CELEBRATION_MODELS.raptor.path})`);
ok(!!CELEBRATION_MODELS.parasaur, 'hay entrada para la especie parasaur (Dino Rosa → parasaurio bebé rosa)');
ok(CELEBRATION_MODELS.parasaur && CELEBRATION_MODELS.parasaur.path === PARASAUR_BABY_MODEL_PATH
  && /characters\/parasaur_baby\/parasaur_baby_pink\.glb$/.test(CELEBRATION_MODELS.parasaur.path),
  `parasaur usa el parasaurio bebé rosa (${CELEBRATION_MODELS.parasaur && CELEBRATION_MODELS.parasaur.path})`);
// Especie AÚN sin GLB (brachio → procedural buildDino).
for (const sp of ['brachio']) {
  ok(!CELEBRATION_MODELS[sp], `${sp} SIN modelo forzado (usa dino procedural buildDino)`);
}

console.log('\n[Ruta del modelo T-Rexo normalizada (minúsculas, segura en web/Android)]');
ok(/^assets\/models\/characters\/trexo\//.test(TREXO_MODEL_PATH), `TREXO_MODEL_PATH en trexo/ minúsculas (${TREXO_MODEL_PATH})`);
ok(!/T-Rexo|oliver/i.test(TREXO_MODEL_PATH), 'TREXO_MODEL_PATH no usa la ruta antigua T-Rexo/ ni oliver/');

console.log('\n[Assets referenciados por CELEBRATION_MODELS existen en disco]');
for (const [sp, entry] of Object.entries(CELEBRATION_MODELS)) {
  for (const key of ['path', 'fallbackPath']) {
    const rel = entry[key];
    if (!rel) continue;
    const abs = join(root, rel);
    const exists = existsSync(abs);
    const mb = exists ? (statSync(abs).size / 1048576).toFixed(2) : '0';
    ok(exists, `${sp}.${key}: ${rel} existe (${mb} MB)`);
  }
}

console.log('\n[Cada especie de bola es renderizable en la victoria (GLB o procedural)]');
const PROCEDURAL_SPECIES = ['trex', 'raptor', 'parasaur', 'triceratops', 'brachio']; // buildDino cubre estas
for (const b of BALLS) {
  const hasModel = !!CELEBRATION_MODELS[b.species];
  const hasProc = PROCEDURAL_SPECIES.includes(b.species);
  ok(hasModel || hasProc, `bola '${b.id}' (species ${b.species}) tiene modelo GLB o procedural`);
}

console.log('\n[Guardas de código anti-regresión]');
const scene = readFileSync(join(root, 'src/scene/SceneManager.js'), 'utf8');
ok(/_celebModels\.get\(\s*species\s*\)/.test(scene), 'spawnCelebration elige el modelo POR species (_celebModels.get(species))');
ok(/CELEBRATION_SPECIES/.test(scene), 'spawnCelebration registra CELEBRATION_SPECIES (log de desarrollo)');
ok(!/this\._celebModel\b(?!s)/.test(scene), 'ya NO existe un único modelo global this._celebModel (evita "mismo dino para todas")');
ok(/preloadCelebrationModel\(\s*species\s*,\s*entry\s*\)/.test(scene), 'preloadCelebrationModel recibe (species, entry) por especie');
const game = readFileSync(join(root, 'src/core/Game.js'), 'utf8');
ok(/CELEBRATION_MODELS\[\s*species\s*\]/.test(game), 'Game.js precarga por especie desde CELEBRATION_MODELS');
ok(/_preloadCelebrationForBall/.test(game), 'Game.js tiene _preloadCelebrationForBall (precarga de la bola seleccionada)');

console.log(`\n${fails === 0 ? '✅ Celebración por especie OK' : '❌ ' + fails + ' fallo(s)'}\n`);
process.exit(fails === 0 ? 0 : 1);
