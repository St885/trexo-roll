// tauntMonkey.js — "Mono prehistórico burlón": cuando el jugador falla (cae en una
// trampa o se sale del tablero sin escudo) aparece un instante un simio primitivo
// que se ríe y señala, y luego desaparece. Es un OVERLAY 2D (Canvas) ligero: no
// toca la escena 3D ni bloquea la jugabilidad. Original, sin assets externos.

import { getLang } from '../utils/i18n.js';

const TAUNTS = {
  es: ['¡Ñaca ñaca!', '¡Otra vez será!', '¡Ja, ja!', '¡Casi!', '¡Buuu!', '¡Uh uh ah ah!'],
  en: ['Nyah nyah!', 'Maybe next time!', 'Ha, ha!', 'So close!', 'Booo!', 'Ooh ooh aah aah!'],
};
let _active = false;

/** Aparición breve del mono burlón. No bloquea: se quita solo. */
export function showTaunt() {
  if (typeof document === 'undefined') return;
  if (_active) return; // uno cada vez
  const layer = document.getElementById('fx-layer');
  if (!layer) return;
  _active = true;

  const wrap = document.createElement('div');
  wrap.className = 'taunt-monkey ' + (Math.random() < 0.5 ? 'left' : 'right');

  const canvas = drawMonkey(170);
  canvas.className = 'taunt-monkey-art';
  wrap.appendChild(canvas);

  const list = TAUNTS[getLang()] || TAUNTS.es;
  const bubble = document.createElement('div');
  bubble.className = 'taunt-bubble';
  bubble.textContent = list[(Math.random() * list.length) | 0];
  wrap.appendChild(bubble);

  layer.appendChild(wrap);
  setTimeout(() => { wrap.remove(); _active = false; }, 1500);
}

/** Dibuja un simio prehistórico estilizado y burlón. Devuelve un <canvas>. */
function drawMonkey(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const fur = '#6b4a2f', furDark = '#46301c', face = '#caa06b', belly = '#dcbb8c';
  const cx = size * 0.5, cy = size * 0.58, s = size / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  const blob = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); };

  // Brazo derecho levantado señalando (burla).
  ctx.strokeStyle = fur; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(20, -6); ctx.quadraticCurveTo(46, -22, 52, -48); ctx.stroke();
  ctx.fillStyle = fur; blob(53, -52, 8, 8); // mano
  ctx.strokeStyle = fur; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(53, -52); ctx.lineTo(58, -64); ctx.stroke(); // dedo

  // Cuerpo y barriga.
  ctx.fillStyle = fur; blob(0, 26, 30, 34);
  ctx.fillStyle = belly; blob(0, 32, 18, 24);
  // Piernas.
  ctx.fillStyle = fur; blob(-16, 54, 11, 13); blob(16, 54, 11, 13);
  // Brazo izquierdo (en jarra).
  ctx.strokeStyle = fur; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(-40, 6, -32, 26); ctx.stroke();

  // Cabeza grande con orejas y mechones.
  ctx.fillStyle = fur; blob(-28, -36, 12, 12); blob(28, -36, 12, 12); // orejas
  ctx.fillStyle = furDark; blob(-28, -36, 6, 6); blob(28, -36, 6, 6);
  ctx.fillStyle = fur; blob(0, -34, 32, 30);
  // Mechones de pelo (prehistórico).
  ctx.fillStyle = furDark;
  for (const a of [-0.8, -0.3, 0.2, 0.7]) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 1.6) * 30, -34 + Math.sin(a - 1.6) * 28);
    ctx.lineTo(Math.cos(a - 1.6) * 40, -34 + Math.sin(a - 1.6) * 38);
    ctx.lineTo(Math.cos(a - 1.4) * 30, -34 + Math.sin(a - 1.4) * 28);
    ctx.closePath(); ctx.fill();
  }
  // Cara.
  ctx.fillStyle = face; blob(0, -28, 22, 20);
  // Ceja gruesa (frente prominente).
  ctx.fillStyle = furDark; ctx.beginPath(); ctx.ellipse(0, -40, 22, 8, 0, 0, Math.PI); ctx.fill();
  // Ojos pícaros (mirando de reojo).
  ctx.fillStyle = '#ffffff'; blob(-9, -34, 7, 8); blob(9, -34, 7, 8);
  ctx.fillStyle = '#241a10'; blob(-6, -33, 3.4, 3.8); blob(12, -33, 3.4, 3.8);
  // Hocico + fosas.
  ctx.fillStyle = belly; blob(0, -18, 14, 11);
  ctx.fillStyle = furDark; blob(-4, -20, 1.8, 2.4); blob(4, -20, 1.8, 2.4);
  // Boca: sonrisa burlona ancha con dientes.
  ctx.fillStyle = '#3a241a'; ctx.beginPath(); ctx.ellipse(0, -12, 12, 7, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-9, -13, 18, 3.2);
  ctx.beginPath(); ctx.moveTo(7, -13); ctx.lineTo(11, -13); ctx.lineTo(8, -7); ctx.closePath(); ctx.fill(); // colmillo

  ctx.restore();
  return canvas;
}
