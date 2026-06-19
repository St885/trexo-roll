// music.js — Música de fondo de TREXoRoll a partir de una pista de archivo.
//
// Pista: assets/audio/trexo-roll-adventure-bg.mp3
//   Origen: 04_recursos_compartidos/musica-de-fondo/aventura/
//           nastelbom-adventure-471461(trexob).mp3  (copiada con permiso de Stefano)
//
// Reproduce en bucle con HTMLAudioElement, a volumen moderado. Autoplay-safe: solo
// suena tras un gesto del usuario (start() se llama al pulsar "Entrar"); si el
// navegador bloquea el play, se reintenta en el siguiente gesto. Instancia única →
// no se duplica al cambiar de pantalla. Silenciable desde el botón de sonido.
//
// (La música procedural anterior queda como respaldo en `music-procedural.js.bak`.)
//
// ── Para cambiar de pista ────────────────────────────────────────────────────
//   1) Copia tu .mp3/.ogg libre (CC0 o con licencia válida) a assets/audio/.
//   2) Cambia TRACK_URL al nuevo nombre de archivo (ruta RELATIVA, sin "/" inicial,
//      para que funcione también en GitHub Pages bajo /trexo-roll/).
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_URL = 'assets/audio/trexo-roll-adventure-bg.mp3';
const VOLUME = 0.4; // volumen moderado (0..1)

let _audio = null;
let _started = false;
let _muted = false;
let _resumeHooked = false;

function _el() {
  if (!_audio) {
    _audio = new Audio(TRACK_URL);
    _audio.loop = true;          // bucle continuo
    _audio.preload = 'auto';
    _audio.volume = VOLUME;
  }
  return _audio;
}

function _tryPlay() {
  if (_muted) return;
  const a = _el();
  const p = a.play();
  if (p && p.catch) p.catch(() => _hookResume()); // autoplay bloqueado → reintenta en el próximo gesto
}

/** Si el navegador bloquea el play, reintenta una vez al primer gesto del usuario. */
function _hookResume() {
  if (_resumeHooked || typeof document === 'undefined') return;
  _resumeHooked = true;
  const onGesture = () => {
    document.removeEventListener('pointerdown', onGesture);
    document.removeEventListener('keydown', onGesture);
    _resumeHooked = false;
    if (_started && !_muted) _tryPlay();
  };
  document.addEventListener('pointerdown', onGesture, { once: true });
  document.addEventListener('keydown', onGesture, { once: true });
}

export const music = {
  isPlaying() { return _started && !!_audio && !_audio.paused; },
  isMuted() { return _muted; },

  /** Arranca la música (idempotente). Debe llamarse tras un gesto del usuario. */
  start() {
    const a = _el();
    a.volume = VOLUME;
    a.muted = _muted;
    _started = true;
    _tryPlay();
  },

  /** Silencia/restaura. No detiene la pista (evita reinicios y duplicados). */
  setMuted(m) {
    _muted = !!m;
    const a = _el();
    a.muted = _muted;
    if (!_muted && _started && a.paused) _tryPlay();
  },

  /** Detiene del todo y rebobina (p. ej. al salir). */
  stop() {
    if (_audio) {
      try { _audio.pause(); _audio.currentTime = 0; } catch (_) { /* noop */ }
    }
    _started = false;
  },
};
