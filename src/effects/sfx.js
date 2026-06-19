// sfx.js — Efectos de sonido sintetizados con Web Audio API (sin archivos externos).
// Tonos cortos para clic, victoria, fallo y caída en hoyo. Silenciable.

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      ctx = null;
    }
  }
  // Algunos navegadores suspenden el contexto hasta una interacción del usuario.
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function beep(freq, dur, type = 'sine', gain = 0.12) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

export const sfx = {
  setMuted(v) { muted = v; },
  isMuted() { return muted; },
  click() { beep(420, 0.08, 'triangle'); },
  start() {
    beep(330, 0.1, 'triangle', 0.1);
    setTimeout(() => beep(494, 0.14, 'triangle', 0.1), 90);
  },
  win() {
    beep(523, 0.12, 'sine');
    setTimeout(() => beep(659, 0.12, 'sine'), 90);
    setTimeout(() => beep(784, 0.18, 'sine'), 190);
  },
  record() {
    beep(784, 0.1, 'sine');
    setTimeout(() => beep(988, 0.1, 'sine'), 80);
    setTimeout(() => beep(1319, 0.22, 'sine'), 170);
  },
  fail() { beep(180, 0.25, 'sawtooth', 0.1); },
  drop() { beep(120, 0.3, 'sine', 0.12); },
  /** Moneda recogida: blip corto y brillante. */
  coin() {
    beep(880, 0.06, 'triangle', 0.1);
    setTimeout(() => beep(1320, 0.1, 'triangle', 0.1), 55);
  },
  /** Estrella-token recogida: pequeño arpegio ascendente más vistoso. */
  starGet() {
    beep(660, 0.08, 'sine', 0.11);
    setTimeout(() => beep(990, 0.08, 'sine', 0.11), 80);
    setTimeout(() => beep(1320, 0.16, 'sine', 0.11), 165);
  },
  /** Compra en la tienda: chime positivo. */
  buy() {
    beep(523, 0.08, 'triangle', 0.1);
    setTimeout(() => beep(784, 0.14, 'triangle', 0.1), 90);
  },
  /** No se puede (sin estrellas suficientes): tono corto grave. */
  nope() { beep(160, 0.18, 'square', 0.08); },
  /** Rescate del ptero: barrido descendente-ascendente "aleteo". */
  rescue() {
    beep(300, 0.12, 'sine', 0.1);
    setTimeout(() => beep(500, 0.12, 'sine', 0.1), 110);
    setTimeout(() => beep(760, 0.18, 'sine', 0.1), 230);
  },
  roar() {
    // Rugido procedural: tono grave descendente con cuerpo.
    if (muted) return;
    const a = ac();
    if (!a) return;
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, a.currentTime + 0.5);
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, a.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.6);
    osc.connect(g).connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.62);
  },
};
