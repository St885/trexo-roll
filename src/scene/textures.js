// textures.js — Texturas procedurales dibujadas con Canvas 2D.
// Cero imágenes externas, cero copyright: todo se genera en runtime.

import * as THREE from 'three';
import { drawDino } from './dinoArt.js';

/** Silueta estilizada de un T-Rex (mirando a la derecha) compuesta por primitivas. */
export function drawTRex(ctx, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.fillStyle = color;

  const blob = (x, y, rx, ry, rot = 0) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  };

  // Cola (triángulo grueso que se afina)
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.quadraticCurveTo(-34, -8, -52, 2);
  ctx.quadraticCurveTo(-34, 6, -6, 10);
  ctx.closePath();
  ctx.fill();

  // Cuerpo
  blob(-4, 2, 22, 16);
  // Muslo trasero
  blob(2, 12, 11, 14);
  // Cuello + cabeza
  blob(20, -14, 11, 12, -0.5);
  blob(34, -20, 13, 10, -0.2);
  // Hocico
  ctx.beginPath();
  ctx.moveTo(40, -26);
  ctx.lineTo(58, -22);
  ctx.lineTo(58, -16);
  ctx.lineTo(46, -14);
  ctx.closePath();
  ctx.fill();
  // Mandíbula inferior (con hueco de boca)
  ctx.beginPath();
  ctx.moveTo(42, -12);
  ctx.lineTo(56, -12);
  ctx.lineTo(50, -6);
  ctx.lineTo(40, -8);
  ctx.closePath();
  ctx.fill();

  // Patas
  ctx.fillRect(-2, 14, 7, 18);   // pata trasera
  ctx.fillRect(8, 16, 6, 16);    // pata delantera
  // Pies
  ctx.fillRect(-4, 30, 12, 5);
  ctx.fillRect(7, 30, 12, 5);
  // Bracito
  ctx.fillRect(16, -4, 8, 4);

  // Ojo (hueco claro)
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  blob(34, -22, 2.2, 2.2);

  ctx.restore();
}

// Aclara (pct>0) u oscurece (pct<0) un color hex.
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = pct / 100;
  const adj = (c) => Math.max(0, Math.min(255, Math.round(c + (f < 0 ? c : 255 - c) * f)));
  return `rgb(${adj(r)},${adj(g)},${adj(b)})`;
}

const DEFAULT_BALL_DEF = { body: '#f6f8fa', body2: '#dde5ea', species: 'trex', dino: '#5f9e74', dark: '#173f2a' };

/** Textura de la bola (cuerpo del color elegido + emblema de la SILUETA de su dino). */
export function makeBallTexture(ballDef) {
  const def = ballDef || DEFAULT_BALL_DEF;
  const w = 1024, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Base con degradado para dar volumen de bola.
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, shade(def.body, 18));
  g.addColorStop(0.5, def.body);
  g.addColorStop(1, def.body2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Dos emblemas en lados opuestos (u≈0.25 y u≈0.75) para que se vean al rodar.
  for (const cx of [w * 0.25, w * 0.75]) {
    const cy = h * 0.5;
    const R = 150;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, R - 12, 0, Math.PI * 2);
    ctx.fillStyle = shade(def.body, 26); ctx.fill();
    drawDino(ctx, def.species, cx, cy, 1.65, def.dino, def.dark);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Miniatura de una bola para la interfaz (devuelve un <canvas>). */
export function makeBallThumbnail(ballDef, size = 120) {
  const def = ballDef || DEFAULT_BALL_DEF;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  // Cuerpo con brillo
  const g = ctx.createRadialGradient(c * 0.7, c * 0.6, size * 0.08, c, c, c);
  g.addColorStop(0, shade(def.body, 30));
  g.addColorStop(0.7, def.body);
  g.addColorStop(1, def.body2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(c, c, c - 2, 0, Math.PI * 2); ctx.fill();
  // Silueta del dino de la especie, centrada
  drawDino(ctx, def.species, c, c, size / 145, def.dino, def.dark);
  // Brillo especular
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(c * 0.7, c * 0.55, size * 0.12, size * 0.07, -0.5, 0, Math.PI * 2); ctx.fill();
  return canvas;
}

/** Textura de la superficie del tablero: tierra/piedra jurásica con ruido suave. */
export function makeBoardTexture(base = '#6b8f5a', accent = '#5a7a4c') {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Manchas/ruido para textura orgánica.
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 3 + 0.5;
    ctx.globalAlpha = Math.random() * 0.25;
    ctx.fillStyle = Math.random() > 0.5 ? accent : '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Sombra de contacto: disco radial oscuro que se desvanece hacia el borde. */
export function makeContactShadowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.25)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// --- Ambientaciones jurásicas (fondo + suelo + niebla por bioma) -----------

export const THEMES = {
  valle:   { sky: ['#7ec8e3', '#bfe3d0', '#f3e2a9', '#cfe0a0'], ground: 0x4f7a3a, fog: 0xbfe3d0, scenery: 'mountains', sun: '#fff3c0' },
  bosque:  { sky: ['#6fb6d6', '#9fd6b0', '#bfd99a', '#7a9a55'], ground: 0x3f6a32, fog: 0xaacdb0, scenery: 'trees', sun: '#eaffd0' },
  volcan:  { sky: ['#3a2535', '#7a3b3b', '#c25b2e', '#e08a3a'], ground: 0x5a3a30, fog: 0xc8a089, scenery: 'volcano', sun: '#ffd070' },
  pantano: { sky: ['#5b6b5a', '#7a8a66', '#9a9a6a', '#6a7a4a'], ground: 0x46583a, fog: 0x8a9a76, scenery: 'trees', sun: '#e8e6b0' },
  meseta:  { sky: ['#86b6d8', '#cfe0c0', '#e6cf9a', '#caa56a'], ground: 0x8a7a52, fog: 0xdcc59a, scenery: 'mesas', sun: '#fff0c8' },
  ruinas:  { sky: ['#7a90b0', '#b8c4cc', '#d9c9a8', '#a89878'], ground: 0x6a6a5a, fog: 0xc2c2b0, scenery: 'ruins', sun: '#f5ecd0' },
  isla:    { sky: ['#4fb3d9', '#7fd0e0', '#cdeccf', '#e9d9a0'], ground: 0x3f8f6a, fog: 0xbfe6e0, scenery: 'trees', sun: '#fff6d0' },
  huevos:  { sky: ['#8fb6e0', '#cfe0e6', '#e6d6c0', '#d0b890'], ground: 0x6a8050, fog: 0xd6e0d0, scenery: 'mesas', sun: '#fff3d8' },
};

export function getTheme(name) { return THEMES[name] || THEMES.valle; }

/** Pinta el fondo del bioma: cielo en degradado + sol + siluetas de horizonte. */
export function makeThemeSky(name) {
  const t = getTheme(name);
  const w = 1024, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, t.sky[0]);
  g.addColorStop(0.5, t.sky[1]);
  g.addColorStop(0.78, t.sky[2]);
  g.addColorStop(1, t.sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Sol / luna suave
  ctx.save();
  ctx.globalAlpha = 0.85;
  const sg = ctx.createRadialGradient(w * 0.72, h * 0.28, 6, w * 0.72, h * 0.28, 90);
  sg.addColorStop(0, t.sun);
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(w * 0.72, h * 0.28, 90, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Bruma atmosférica sobre el horizonte (da profundidad de jungla; va detrás de las
  // siluetas y el canopy).
  ctx.save();
  ctx.globalAlpha = 0.3;
  const mg = ctx.createLinearGradient(0, h * 0.46, 0, h * 0.66);
  mg.addColorStop(0, 'rgba(255,255,255,0)');
  mg.addColorStop(1, '#ffffff');
  ctx.fillStyle = mg;
  ctx.fillRect(0, h * 0.44, w, h * 0.26);
  ctx.restore();

  drawScenery(ctx, t, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawScenery(ctx, t, w, h) {
  const horizon = h * 0.62;
  const far = shade(t.sky[3], -28);
  const near = shade(t.sky[3], -48);

  if (t.scenery === 'mountains' || t.scenery === 'mesas') {
    ctx.fillStyle = far;
    for (let i = -1; i < 7; i++) {
      const x = (i * w) / 6 + (i % 2) * 40;
      const peak = horizon - (t.scenery === 'mesas' ? 60 : 120) - (i % 3) * 25;
      if (t.scenery === 'mesas') {
        ctx.fillRect(x - 70, peak, 200, h - peak);
      } else {
        ctx.beginPath(); ctx.moveTo(x - 130, horizon); ctx.lineTo(x, peak); ctx.lineTo(x + 130, horizon); ctx.closePath(); ctx.fill();
      }
    }
  } else if (t.scenery === 'volcano') {
    // Volcán central con cráter brillante y humo
    ctx.fillStyle = far;
    for (const cx of [w * 0.2, w * 0.85]) {
      ctx.beginPath(); ctx.moveTo(cx - 110, horizon); ctx.lineTo(cx, horizon - 90); ctx.lineTo(cx + 110, horizon); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = near;
    const vx = w * 0.5;
    ctx.beginPath();
    ctx.moveTo(vx - 200, horizon); ctx.lineTo(vx - 50, horizon - 175); ctx.lineTo(vx + 50, horizon - 175); ctx.lineTo(vx + 200, horizon); ctx.closePath(); ctx.fill();
    const lava = ctx.createLinearGradient(0, horizon - 175, 0, horizon - 120);
    lava.addColorStop(0, '#ffd86b'); lava.addColorStop(1, '#e8542a');
    ctx.fillStyle = lava;
    ctx.fillRect(vx - 50, horizon - 178, 100, 16);
    ctx.fillStyle = 'rgba(255,180,120,0.25)';
    ctx.beginPath(); ctx.ellipse(vx, horizon - 230, 60, 90, 0, 0, Math.PI * 2); ctx.fill();
  } else if (t.scenery === 'trees') {
    ctx.fillStyle = far;
    for (let i = 0; i < 5; i++) { const x = i * 230 + 60; mountain(ctx, x, horizon, 90, 70); }
    // Palmeras
    ctx.strokeStyle = near; ctx.fillStyle = near; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (const px of [w * 0.12, w * 0.34, w * 0.6, w * 0.82]) {
      ctx.beginPath(); ctx.moveTo(px, horizon); ctx.quadraticCurveTo(px + 14, horizon - 70, px + 6, horizon - 120); ctx.stroke();
      for (let a = -2; a <= 2; a++) {
        ctx.beginPath(); ctx.moveTo(px + 6, horizon - 120);
        ctx.quadraticCurveTo(px + 6 + a * 30, horizon - 150, px + 6 + a * 55, horizon - 120 + Math.abs(a) * 14); ctx.stroke();
      }
    }
  } else if (t.scenery === 'ruins') {
    ctx.fillStyle = far;
    for (let i = 0; i < 5; i++) { const x = i * 230 + 80; mountain(ctx, x, horizon, 70, 50); }
    ctx.fillStyle = near;
    for (const cx of [w * 0.15, w * 0.3, w * 0.55, w * 0.7, w * 0.88]) {
      const hh = 90 + (cx % 50);
      ctx.fillRect(cx, horizon - hh, 26, hh);
      ctx.fillRect(cx - 6, horizon - hh - 10, 38, 12);
    }
  }
  // Treeline de jungla (copas frondosas en dos capas) → sensación de selva con
  // profundidad en TODOS los biomas. El color sale del suelo del bioma para cohesión.
  const canopyBase = '#' + (t.ground >>> 0).toString(16).padStart(6, '0');
  drawCanopy(ctx, canopyBase, horizon, w);

  // Banda de horizonte para asentar (tapa la base de las copas).
  ctx.fillStyle = near;
  ctx.fillRect(0, horizon - 2, w, h - horizon + 2);
}

function mountain(ctx, x, baseY, halfW, ht) {
  ctx.beginPath(); ctx.moveTo(x - halfW, baseY); ctx.lineTo(x, baseY - ht); ctx.lineTo(x + halfW, baseY); ctx.closePath(); ctx.fill();
}

/** Copas de jungla: grupos de círculos solapados en dos capas (lejana clara, cercana
 *  oscura) sobre el horizonte. Crea una línea de árboles frondosa con profundidad. */
function drawCanopy(ctx, baseHex, horizon, w) {
  const layers = [
    { dy: -4, r: 24, col: shade(baseHex, 8),   step: 64 },
    { dy: 10, r: 34, col: shade(baseHex, -16), step: 86 },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    for (let x = -30; x < w + 50; x += L.step * (0.7 + Math.random() * 0.6)) {
      const cy = horizon + L.dy - Math.random() * 8;
      const rr = L.r * (0.7 + Math.random() * 0.6);
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(
          x + (Math.random() - 0.5) * rr,
          cy + (Math.random() - 0.5) * rr * 0.5,
          rr * (0.55 + Math.random() * 0.5),
          0, Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
}

/**
 * Suelo jurásico "trabajado": tierra del bioma con vetas, matas de follaje y
 * piedrecitas. Reemplaza el verde plano por un suelo con vida sin distraer del
 * tablero (la niebla + viñeta oscurecen los bordes para enfocar el juego).
 */
export function makeGroundTexture(name) {
  const t = getTheme(name);
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const base = '#' + (t.ground >>> 0).toString(16).padStart(6, '0');

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Vetas de tierra (bandas suaves para romper la uniformidad)
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = i % 2 ? shade(base, 14) : shade(base, -16);
    ctx.fillRect(0, (i / 6) * size + Math.random() * 18, size, size / 9);
  }
  ctx.globalAlpha = 1;

  // Matas de hierba / follaje
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 3 + Math.random() * 9;
    ctx.globalAlpha = 0.12 + Math.random() * 0.18;
    ctx.fillStyle = Math.random() > 0.5 ? shade(base, 22) : shade(base, -22);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Piedrecitas dispersas
  for (let i = 0; i < 44; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = shade('#8d8470', Math.random() * 30 - 15);
    ctx.beginPath();
    ctx.arc(x, y, 1.4 + Math.random() * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Aura/halo radial (brillo) para monedas y estrella. Pensado para blending aditivo. */
export function makeGlowTexture(colorHex = '#ffd86b') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const n = parseInt((colorHex || '#ffd86b').slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.35)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Cielo jurásico: degradado vertical cálido. Devuelve una THREE.Texture para fondo. */
export function makeSkyTexture() {
  const w = 16, h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#7ec8e3');   // cielo alto
  g.addColorStop(0.55, '#bfe3d0'); // medio
  g.addColorStop(0.8, '#f3e2a9');  // horizonte cálido
  g.addColorStop(1, '#e9c46a');    // tierra/horizonte
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
