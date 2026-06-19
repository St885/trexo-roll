// hud.js — Actualización del HUD en partida (nivel, vidas, tiempo, puntuación,
// indicador de inclinación, toasts y flashes de feedback). Funciones puras sobre el DOM.

let el = null;

function refs() {
  if (el) return el;
  el = {
    level: document.getElementById('hud-level'),
    lives: document.getElementById('hud-lives'),
    time: document.getElementById('hud-time'),
    score: document.getElementById('hud-score'),
    toast: document.getElementById('hud-toast'),
    tiltDot: document.getElementById('tilt-dot'),
    flash: document.getElementById('flash'),
  };
  return el;
}

export function setLevel(name, number, total) {
  const r = refs();
  if (r.level) r.level.textContent = `Nivel ${number}/${total} · ${name}`;
}

export function setLives(lives) {
  const r = refs();
  if (r.lives) r.lives.textContent = '🥚'.repeat(Math.max(0, lives)) || '—';
}

export function setTime(seconds) {
  const r = refs();
  if (r.time) r.time.textContent = '⏱️ ' + seconds.toFixed(1) + 's';
}

export function setScore(score) {
  const r = refs();
  if (r.score) r.score.textContent = `Puntos: ${score}`;
}

/** Mueve el punto del indicador de inclinación. nx, ny en [-1, 1]. */
export function setTilt(nx, ny) {
  const r = refs();
  if (!r.tiltDot) return;
  const R = 20; // radio en píxeles
  r.tiltDot.style.transform = `translate(${(nx * R).toFixed(1)}px, ${(ny * R).toFixed(1)}px)`;
}

let toastTimer = null;
export function toast(text, ms = 1100) {
  const r = refs();
  if (!r.toast) return;
  r.toast.textContent = text;
  r.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => r.toast.classList.remove('show'), ms);
}

let flashTimer = null;
/** Destello de pantalla para feedback. kind: 'danger' | 'gold'. */
export function flash(kind) {
  const r = refs();
  if (!r.flash) return;
  r.flash.className = '';
  // forzar reflow para reiniciar la animación
  void r.flash.offsetWidth;
  r.flash.className = 'show ' + kind;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { r.flash.className = ''; }, 360);
}
