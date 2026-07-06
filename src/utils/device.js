// device.js — Detección de plataforma + PERFIL GRÁFICO activo (modo rendimiento móvil/Android).
//
// El juego corre fluido en navegador de escritorio, pero en Android WebView / emulador (GPU
// limitada, gama media) conviene bajar la carga GPU. Aquí decidimos, UNA vez, qué "perfil gráfico"
// usar (quality/balanced/performance) según el dispositivo, y lo exponemos para que el renderer,
// las celebraciones y el CSS se adapten SIN tocar la jugabilidad ni la versión web.
//
// Robusto en Node (tests): todo va tras try/typeof; sin DOM devuelve valores de escritorio.

import { GRAPHICS_PRESETS, ANDROID_PERFORMANCE_PRESET, DEFAULT_TOUCH_PRESET, DESKTOP_PRESET } from './constants.js';

function ua() {
  try { return (typeof navigator !== 'undefined' && navigator.userAgent) || ''; } catch (_) { return ''; }
}

/** ¿Se ejecuta dentro de Capacitor (app nativa Android/iOS empaquetada)? */
export function isCapacitorNative() {
  try {
    const C = typeof window !== 'undefined' ? window.Capacitor : undefined;
    if (!C) return false;
    if (typeof C.isNativePlatform === 'function') return !!C.isNativePlatform();
    return !!C.isNative;
  } catch (_) { return false; }
}

/** Plataforma: 'android' | 'ios' | 'web' (usa Capacitor si está; si no, el userAgent). */
export function getPlatform() {
  try {
    const C = typeof window !== 'undefined' ? window.Capacitor : undefined;
    if (C && typeof C.getPlatform === 'function') return C.getPlatform();
  } catch (_) { /* noop */ }
  const s = ua();
  if (/android/i.test(s)) return 'android';
  if (/iphone|ipad|ipod/i.test(s)) return 'ios';
  return 'web';
}

export function isAndroid() { return getPlatform() === 'android' || /android/i.test(ua()); }

/** ¿Android dentro de un WebView (Capacitor nativo, o el token 'wv'/'Version/x' del WebView)? */
export function isAndroidWebView() {
  if (isCapacitorNative() && getPlatform() === 'android') return true;
  const s = ua();
  return /android/i.test(s) && (/\bwv\b/.test(s) || /Version\/[\d.]+/.test(s));
}

/** ¿Dispositivo táctil? (no depende del tamaño de pantalla). */
export function isTouchDevice() {
  try {
    if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) return true;
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return true;
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return true;
  } catch (_) { /* sin DOM */ }
  return false;
}

/** Heurística de móvil de baja potencia (gama media / emulador): poca RAM o pocos núcleos. */
export function isLowPowerMobile() {
  try {
    if (typeof navigator === 'undefined') return false;
    const mem = navigator.deviceMemory;      // GiB aprox. (Chromium)
    const cores = navigator.hardwareConcurrency;
    if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
    if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
  } catch (_) { /* noop */ }
  return false;
}

/** Override manual del preset (para QA): ?gfx=performance|balanced|quality o localStorage. */
function _override() {
  try {
    if (typeof location !== 'undefined' && location.search) {
      const m = /[?&]gfx=(quality|balanced|performance)/i.exec(location.search);
      if (m) return m[1].toLowerCase();
    }
    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem('trexoroll.gfx');
      if (v && GRAPHICS_PRESETS[v]) return v;
    }
  } catch (_) { /* noop */ }
  return null;
}

/** Nombre del preset gráfico que corresponde a ESTE dispositivo (sin override). */
export function resolvePresetName() {
  // Android/WebView (incl. emulador) → preset de rendimiento por defecto.
  if (isAndroidWebView() || (isAndroid() && isCapacitorNative())) return ANDROID_PERFORMANCE_PRESET;
  if (isLowPowerMobile()) return 'performance';
  if (isTouchDevice()) return DEFAULT_TOUCH_PRESET; // otro móvil (web/iOS): equilibrado
  return DESKTOP_PRESET;                            // escritorio: calidad
}

let _cached = null;
/**
 * Perfil gráfico ACTIVO (resuelto una vez): { name, pixelRatioCap, shadows, heavyGlows,
 * particleScale, celebration3D }. Prioriza el override de QA; si no, según el dispositivo.
 */
// Perfil de RESERVA por si GRAPHICS_PRESETS estuviera mal formado: nunca debe faltar celebration3D
// ni ninguna otra clave que el runtime lee (evita "Cannot read properties of undefined").
const SAFE_PROFILE = { pixelRatioCap: 1, shadows: false, heavyGlows: false, particleScale: 0.4, celebration3D: 'off' };

export function getGraphicsProfile() {
  if (_cached) return _cached;
  // Nombre: override de QA (ya validado) → por dispositivo. Si el string no es un preset válido,
  // se normaliza a un preset existente (nunca undefined).
  let name = _override() || resolvePresetName();
  if (!name || !GRAPHICS_PRESETS[name]) name = DESKTOP_PRESET;
  const preset = GRAPHICS_PRESETS[name] || GRAPHICS_PRESETS[DESKTOP_PRESET] || SAFE_PROFILE;
  // Merge SOBRE el perfil de reserva: garantiza que TODAS las claves existen aunque el preset
  // estuviera incompleto → celebration3D/pixelRatioCap/… nunca son undefined.
  _cached = { name, ...SAFE_PROFILE, ...preset };
  try {
    // Log de diagnóstico (una vez; se ve en la consola del emulador Android). No es overlay.
    console.info(`[GFX] preset=${_cached.name} pixelRatio=${_cached.pixelRatioCap} shadows=${_cached.shadows} heavyGlows=${_cached.heavyGlows} celebration3D=${_cached.celebration3D}`);
  } catch (_) { /* consola no disponible */ }
  return _cached;
}

// Alias con el nombre alternativo (misma función central; siempre devuelve un perfil válido).
export const resolveGraphicsProfile = getGraphicsProfile;
