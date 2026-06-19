// ScreenManager.js — Conmuta las pantallas (DOM overlays) y conecta botones.
// Cada pantalla es un <section class="screen" id="...">. Solo una está activa.

export class ScreenManager {
  constructor() {
    this.screens = Array.from(document.querySelectorAll('.screen'));
    this.current = null;
  }

  show(id) {
    for (const s of this.screens) {
      s.classList.toggle('active', s.id === id);
    }
    this.current = id;
    document.body.dataset.screen = id;
  }

  isActive(id) {
    return this.current === id;
  }

  /** Conecta un click de un elemento por id a un handler. */
  onClick(elementId, handler) {
    const el = document.getElementById(elementId);
    if (el) el.addEventListener('click', handler);
    return el;
  }
}
