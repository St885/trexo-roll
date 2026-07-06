// tutorial.js — Tutorial jugable de los primeros niveles (1-5). Mensajes cortos y NO
// invasivos que aparecen como un "coach" inferior: se auto-cierra, es descartable con un
// toque y no bloquea la partida (el input sigue activo). Se recuerda en localStorage para
// no repetirse a quien ya jugó. Original, sin dependencias externas.

const KEY = 'trexoroll.tut.v1';

// Secuencia de mensajes por nivel (claves i18n). Cortos, mobile-first, máx. 2 por nivel.
const STEPS = {
  1: ['tut.l1a', 'tut.l1b'], // inclinar/guiar la bola · llegar al hoyo verde
  2: ['tut.l2'],             // monedas
  3: ['tut.l3'],             // trampas rojas
  4: ['tut.l4'],             // estrellas
  5: ['tut.l5'],             // primer peligro/evento
};

function readSeen() {
  try { const r = localStorage.getItem(KEY); const a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : []; }
  catch { return []; }
}
function writeSeen(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch { /* almacenamiento no disponible: se ignora */ }
}

/** Claves i18n del tutorial de un nivel (vacío si no tiene). */
export function tutorialSteps(levelNum) {
  return STEPS[levelNum] ? [...STEPS[levelNum]] : [];
}

/** ¿Debe mostrarse el tutorial de este nivel? (tiene pasos y aún no se vio). */
export function shouldShowTutorial(levelNum) {
  return !!STEPS[levelNum] && !readSeen().includes(levelNum);
}

/** Marca el tutorial de un nivel como visto para no repetirlo. */
export function markTutorialSeen(levelNum) {
  const seen = readSeen();
  if (!seen.includes(levelNum)) { seen.push(levelNum); writeSeen(seen); }
}

/** Olvida todo el tutorial (lo usa «Reiniciar progreso»: el jugador vuelve a aprender). */
export function resetTutorial() { writeSeen([]); }

// --- Intros de MECÁNICA (independientes del tutorial 1-5) -------------------
// Se muestran UNA vez la primera vez que el jugador encuentra cada mecánica especial
// (p. ej. 'move' = hoyos rojos móviles, 'pulse' = hoyos que crecen/encogen), aunque llegue
// vía el selector de niveles. Se recuerdan por separado.
const MKEY = 'trexoroll.mech.v1';
function readMech() {
  try { const r = localStorage.getItem(MKEY); const a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : []; }
  catch { return []; }
}
function writeMech(arr) { try { localStorage.setItem(MKEY, JSON.stringify(arr)); } catch { /* se ignora */ } }

/** ¿Debe explicarse esta mecánica? ('move' | 'pulse'). */
export function shouldShowMechanic(kind) { return !!kind && !readMech().includes(kind); }
/** Marca una mecánica como ya explicada. */
export function markMechanicSeen(kind) { const s = readMech(); if (kind && !s.includes(kind)) { s.push(kind); writeMech(s); } }
/** Olvida las intros de mecánica (lo usa «Reiniciar progreso»). */
export function resetMechanics() { writeMech([]); }
