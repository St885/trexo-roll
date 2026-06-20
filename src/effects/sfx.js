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
  /**
   * Moneda recogida: "¡ding!" arcade ORIGINAL — dos notas brillantes ascendentes
   * (Do6 → Sol6) con un leve bend al alza en la segunda. Corto y satisfactorio.
   * (No reproduce el sonido protegido de ningún juego comercial.)
   */
  coin() {
    if (muted) return;
    const a = ac();
    if (!a) return;
    const t = a.currentTime;
    // Nota 1 (corta, percusiva)
    const o1 = a.createOscillator(), g1 = a.createGain();
    o1.type = 'triangle'; o1.frequency.setValueAtTime(1047, t);
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.exponentialRampToValueAtTime(0.12, t + 0.012);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o1.connect(g1).connect(a.destination); o1.start(t); o1.stop(t + 0.1);
    // Nota 2 (más aguda, con bend al alza = brillo arcade)
    const o2 = a.createOscillator(), g2 = a.createGain();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(1568, t + 0.055);
    o2.frequency.exponentialRampToValueAtTime(1720, t + 0.2);
    g2.gain.setValueAtTime(0.0001, t + 0.055);
    g2.gain.exponentialRampToValueAtTime(0.12, t + 0.075);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o2.connect(g2).connect(a.destination); o2.start(t + 0.055); o2.stop(t + 0.24);
  },
  /** Estrella-token recogida: arpegio ascendente brillante + chispa final (más especial). */
  starGet() {
    beep(784, 0.1, 'sine', 0.1);
    setTimeout(() => beep(988, 0.1, 'sine', 0.1), 80);
    setTimeout(() => beep(1319, 0.12, 'sine', 0.1), 165);
    setTimeout(() => beep(1760, 0.2, 'sine', 0.1), 255);
    setTimeout(() => beep(2637, 0.12, 'triangle', 0.06), 320); // chispa
  },
  /** Compra en la tienda: chime positivo. */
  buy() {
    beep(523, 0.08, 'triangle', 0.1);
    setTimeout(() => beep(784, 0.14, 'triangle', 0.1), 90);
  },
  /** No se puede (sin estrellas suficientes): tono corto grave. */
  nope() { beep(160, 0.18, 'square', 0.08); },
  /** Risita burlona del mono prehistórico (tres blips juguetones descendentes). */
  taunt() {
    beep(520, 0.08, 'square', 0.06);
    setTimeout(() => beep(470, 0.08, 'square', 0.06), 110);
    setTimeout(() => beep(400, 0.12, 'square', 0.06), 220);
  },
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
