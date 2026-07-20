// main.js — Punto de entrada de TREXoRoll.
// Arranca el juego cuando el DOM está listo y reporta errores de forma visible.
//
// SEGURIDAD / ROBUSTEZ: instala una red de seguridad GLOBAL para que la app NUNCA se quede
// en pantalla negra ante un fallo (error no capturado, promesa rechazada, arranque roto):
//   · window 'error' / 'unhandledrejection' → log SEGURO (mensaje, sin tokens/PII) + recuperación.
//   · Si el juego ya existe, delega en game.recoverToSafeScreen() (restaura la pantalla visible).
//   · Si no, muestra un panel de recuperación con "Reintentar".

import { Game } from './core/Game.js';

let _recovering = false;

/** Muestra el panel de recuperación (última red de seguridad). Reutiliza #boot-error. */
function showRecovery(detail) {
  const box = document.getElementById('boot-error');
  if (!box) return;
  box.classList.add('recovery');
  box.style.display = 'block';
  box.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = 'Recuperando el juego…'; // texto neutro (sin tecnicismos ni datos)
  const btn = document.createElement('button');
  btn.textContent = '↻ Reintentar';
  btn.className = 'btn primary';
  btn.addEventListener('click', () => { try { location.reload(); } catch (_) {} });
  box.appendChild(p);
  box.appendChild(btn);
  if (detail) console.error('[TREXoRoll] Recuperación:', detail);
}

/** Ante un fallo global: primero intenta recuperar la pantalla; si no puede, ofrece reintentar. */
function handleGlobalFailure(detail) {
  try {
    const game = window.__trexoroll;
    if (game && typeof game.recoverToSafeScreen === 'function') {
      game.recoverToSafeScreen();
      // Si tras recuperar hay una pantalla visible, no molestamos al usuario con el panel.
      if (document.querySelector('.screen.active')) return;
    }
  } catch (_) { /* seguimos al panel de recuperación */ }
  if (_recovering) return; // evita panel duplicado ante ráfagas de errores
  _recovering = true;
  showRecovery(detail);
}

// Log SEGURO: nunca se imprime el objeto de error completo (podría arrastrar datos); solo el
// mensaje/código. No exponemos tokens, credenciales ni PII.
function safeMessage(e) {
  try {
    const err = (e && (e.reason || e.error)) || e;
    if (!err) return 'error';
    if (typeof err === 'string') return err;
    return (err.code ? err.code + ' ' : '') + (err.message || 'error');
  } catch (_) { return 'error'; }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('error', (e) => {
    console.error('[TREXoRoll] Error global:', safeMessage(e));
    handleGlobalFailure(safeMessage(e));
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[TREXoRoll] Promesa no gestionada:', safeMessage(e));
    handleGlobalFailure(safeMessage(e));
  });
}

function boot() {
  const container = document.getElementById('game-canvas');
  if (!container) {
    console.error('[TREXoRoll] No se encontró #game-canvas');
    return;
  }
  try {
    const game = new Game(container);
    game.start();
    // Útil para depurar desde la consola del navegador y para la red de seguridad global.
    window.__trexoroll = game;
    console.log('TREXoRoll iniciado correctamente.');
  } catch (err) {
    console.error('[TREXoRoll] Error al iniciar:', safeMessage(err));
    showRecovery(safeMessage(err));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
