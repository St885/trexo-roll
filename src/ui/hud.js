// hud.js — Actualización del HUD en partida (nivel, vidas, tiempo, puntuación,
// toasts, pista y flashes de feedback). Funciones puras sobre el DOM.
// El knob del joystick lo gestiona InputController, no este módulo.

let el = null;

function refs() {
  if (el) return el;
  el = {
    level: document.getElementById('hud-level'),
    lives: document.getElementById('hud-lives'),
    time: document.getElementById('hud-time'),
    score: document.getElementById('hud-score'),
    toast: document.getElementById('hud-toast'),
    hint: document.getElementById('hud-hint'),
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

let toastTimer = null;
export function toast(text, ms = 1100) {
  const r = refs();
  if (!r.toast) return;
  r.toast.textContent = text;
  r.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => r.toast.classList.remove('show'), ms);
}

let hintTimer = null;
/** Muestra una pista breve al inicio del nivel y la desvanece (no estorba en partida). */
export function hint(text, ms = 3500) {
  const r = refs();
  if (!r.hint) return;
  r.hint.textContent = text;
  r.hint.classList.remove('hidden');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => r.hint.classList.add('hidden'), ms);
}

let flashTimer = null;
/** Destello de pantalla para feedback. kind: 'danger' | 'gold'. */
export function flash(kind) {
  const r = refs();
  if (!r.flash) return;
  r.flash.className = '';
  void r.flash.offsetWidth; // reinicia la animación
  r.flash.className = 'show ' + kind;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { r.flash.className = ''; }, 360);
}
