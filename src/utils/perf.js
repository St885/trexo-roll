// perf.js — Instrumentación de rendimiento LIGERA y SOLO de desarrollo (Fase 2).
//
// Mide, cuando DEBUG_PERFORMANCE está activo:
//   · FPS aproximado, frame time promedio y MÁXIMO (detecta spikes),
//   · tiempo de update y de render por frame (promedio),
//   · nº de resize/orientation reales aplicados,
//   · nº de pointermove por segundo,
//   · spikes al tocar/arrastrar, al aparecer la victoria y al rotar (marcas puntuales).
//
// Diseño: coste CERO cuando está desactivado (todas las funciones salen en la 1ª línea si !ON).
// NO dibuja overlay ni toca la UI: imprime un resumen por consola cada ~2 s. Nunca en producción
// (el flag vive en constants.js y por defecto es false). No usa Date.now(): usa performance.now().

import { DEBUG_PERFORMANCE } from './constants.js';

const ON = !!DEBUG_PERFORMANCE;
const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : 0);

const S = {
  frames: 0, frameSum: 0, frameMax: 0,
  updateSum: 0, renderSum: 0,
  resizes: 0, pointerMoves: 0,
  lastReport: 0, lastFrame: 0,
  spikes: [], // { label, ms }
};

/** Marca el inicio de un tramo y devuelve una función stop() que devuelve el tiempo en ms. */
export function mark() {
  if (!ON) return () => 0;
  const t0 = now();
  return () => now() - t0;
}

/** Llamar al inicio del frame del bucle principal. Acumula frame time y reporta cada ~2 s. */
export function frame() {
  if (!ON) return;
  const t = now();
  if (S.lastFrame) {
    const ft = t - S.lastFrame;
    S.frames++; S.frameSum += ft;
    if (ft > S.frameMax) S.frameMax = ft;
  }
  S.lastFrame = t;
  if (!S.lastReport) S.lastReport = t;
  if (t - S.lastReport >= 2000) _report(t);
}

export function addUpdate(ms) { if (ON) S.updateSum += ms; }
export function addRender(ms) { if (ON) S.renderSum += ms; }
export function countResize() { if (ON) S.resizes++; }
export function countPointerMove() { if (ON) S.pointerMoves++; }

/** Marca un spike puntual (p. ej. 'victoria', 'rotacion', 'drag-start') con su duración. */
export function spike(label, ms) {
  if (!ON) return;
  S.spikes.push({ label, ms: Math.round(ms * 10) / 10 });
  if (S.spikes.length > 12) S.spikes.shift();
}

function _report(t) {
  const secs = (t - S.lastReport) / 1000;
  const n = Math.max(1, S.frames);
  const avg = S.frameSum / n;
  const fps = 1000 / avg;
  const spikeStr = S.spikes.length ? '  spikes: ' + S.spikes.map((s) => `${s.label}=${s.ms}ms`).join(', ') : '';
  // eslint-disable-next-line no-console
  console.log(
    `[PERF] fps≈${fps.toFixed(0)}  frame avg=${avg.toFixed(1)}ms max=${S.frameMax.toFixed(1)}ms  ` +
    `update=${(S.updateSum / n).toFixed(2)}ms render=${(S.renderSum / n).toFixed(2)}ms  ` +
    `resizes/2s=${S.resizes}  pointermove/s=${(S.pointerMoves / secs).toFixed(0)}${spikeStr}`
  );
  S.frames = 0; S.frameSum = 0; S.frameMax = 0; S.updateSum = 0; S.renderSum = 0;
  S.resizes = 0; S.pointerMoves = 0; S.spikes = []; S.lastReport = t;
}

/** ¿Está activa la instrumentación? (para envolver trabajo extra solo cuando se mide). */
export const PERF_ON = ON;
