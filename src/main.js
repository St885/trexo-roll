// main.js — Punto de entrada de TREXoRoll.
// Arranca el juego cuando el DOM está listo y reporta errores de forma visible.

import { Game } from './core/Game.js';

function boot() {
  const container = document.getElementById('game-canvas');
  if (!container) {
    console.error('[TREXoRoll] No se encontró #game-canvas');
    return;
  }
  try {
    const game = new Game(container);
    game.start();
    // Útil para depurar desde la consola del navegador.
    window.__trexoroll = game;
    console.log('TREXoRoll iniciado correctamente.');
  } catch (err) {
    console.error('[TREXoRoll] Error al iniciar:', err);
    const fallback = document.getElementById('boot-error');
    if (fallback) {
      fallback.style.display = 'block';
      fallback.textContent = 'No se pudo iniciar el juego: ' + (err && err.message ? err.message : err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
