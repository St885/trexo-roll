// weather.js — Eventos CLIMÁTICOS visuales en una capa DOM independiente (#weather-layer).
// Mismo contrato de seguridad que critters.js:
//   · pointer-events: none      → nunca bloquean el D-pad/joystick/arrastre.
//   · z-index por DEBAJO del HUD → nunca tapan los controles ni el tablero (overlay sutil).
//   · no tocan la física ni la escena 3D (el empuje del viento lo aplica Game en la física,
//     aquí solo está la parte VISUAL).
// Mobile-first: pocas partículas, animadas por compositor (transform/opacity). Respeta
// prefers-reduced-motion. Fuera del navegador (tests Node) todo es no-op seguro.

const hasDOM = typeof document !== 'undefined' && !!document.getElementById;

function layer() {
  return hasDOM ? document.getElementById('weather-layer') : null;
}

const reduceMotion = () =>
  hasDOM && typeof window !== 'undefined' && window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nº de partículas por tipo (moderado para no penalizar móvil). Menos si reduced-motion.
const COUNTS = { rain: 46, ash: 30, storm: 40, heat: 0, fog: 0, wind: 18 };

let _current = null;

/** Limpia la capa de clima. */
export function clear() {
  const root = layer();
  if (root) while (root.firstChild) root.firstChild.remove();
  _current = null;
}

/**
 * Activa un clima en la capa. type ∈ rain|fog|wind|ash|storm|heat|null.
 * Idempotente: re-llamar con el mismo tipo no reconstruye.
 */
export function setWeather(type) {
  const root = layer();
  if (!root) { _current = type || null; return; }
  if (_current === type) return;
  clear();
  _current = type || null;
  if (!type) return;

  const wrap = document.createElement('div');
  wrap.className = 'weather weather-' + type;
  wrap.setAttribute('aria-hidden', 'true');

  const reduced = reduceMotion();

  if (type === 'fog' || type === 'heat') {
    // Niebla / calor: bandas suaves (sin partículas). El calor añade ondulación leve.
    for (let i = 0; i < 3; i++) {
      const band = document.createElement('div');
      band.className = 'wx-band b' + i;
      wrap.appendChild(band);
    }
  } else if (type === 'wind') {
    // Viento: líneas/hojas que cruzan en horizontal.
    const n = reduced ? 6 : COUNTS.wind;
    for (let i = 0; i < n; i++) {
      const g = document.createElement('div');
      g.className = 'wx-gust';
      g.textContent = i % 4 === 0 ? '🍃' : '';
      const top = Math.round((i / n) * 92) + 2;
      g.style.top = top + 'vh';
      g.style.animationDelay = (i * 0.31 % 3.2).toFixed(2) + 's';
      g.style.animationDuration = (2.2 + (i % 5) * 0.35).toFixed(2) + 's';
      wrap.appendChild(g);
    }
  } else {
    // Partículas que caen: lluvia / ceniza / tormenta.
    const n = reduced ? Math.round((COUNTS[type] || 30) * 0.4) : (COUNTS[type] || 30);
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'wx-p wx-' + type;
      p.style.left = (Math.round((i * 137.5) % 100)) + 'vw';
      p.style.animationDelay = ((i * 0.137) % 2.4).toFixed(2) + 's';
      p.style.animationDuration = (type === 'rain' ? 0.7 + (i % 5) * 0.12 : 2.4 + (i % 6) * 0.5).toFixed(2) + 's';
      wrap.appendChild(p);
    }
    if (type === 'storm') {
      const flash = document.createElement('div');
      flash.className = 'wx-flash';
      wrap.appendChild(flash);
    }
  }

  root.appendChild(wrap);
}

/** Tipo de clima activo (para tests/depuración). */
export function currentWeather() { return _current; }
