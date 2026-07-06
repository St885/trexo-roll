// levels.js — Definición de los niveles del juego (25 en total).
//
// Coordenadas: plano del tablero, x → derecha, z → hacia la cámara, origen al centro.
// Cada nivel define su huella (footprint, unión de formas), inicio, meta, trampas,
// paredes, decoración y bioma (theme). Añadir un nivel = añadir un objeto a este array.
//
// La solvencia de TODOS los niveles se verifica con `node tools/level-validator.mjs`.
// Biomas (theme): valle, bosque, volcan, pantano, meseta, ruinas, isla, huevos.

export const LEVELS = [
  // 1 ─────────────────────────────────────────────────────────────────────
  {
    id: 1, name: 'Valle Inicial', tier: 'Fácil', theme: 'valle',
    hint: 'Lleva la bola al hoyo verde al otro lado del valle.',
    surfaceColor: '#6b8f5a', surfaceAccent: '#5a7a4c',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 20, d: 12 }],
    start: { x: -7, z: 0 }, goal: { x: 7, z: 0, r: 1.2 },
    traps: [{ x: -2, z: 4, r: 1.0 }],
    walls: [{ x: 0, z: -5.6, w: 16, d: 0.5 }, { x: 0, z: 5.6, w: 16, d: 0.5 }],
    footDecals: [{ x: -3, z: -2 }, { x: 2.5, z: 2.5, rot: 0.6 }],
    par: 36, // v0.24.9: aprendizaje más amable (margen para 3★ mientras se aprende)
  },
  // 2 ─────────────────────────────────────────────────────────────────────
  {
    id: 2, name: 'Sendero Largo', tier: 'Fácil', theme: 'valle',
    hint: 'Un pasillo largo con una trampa en medio. Controla la velocidad.',
    surfaceColor: '#7a8a52', surfaceAccent: '#67753f',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 8 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: -1.5, r: 1.0 },
    traps: [{ x: 0, z: 1.5, r: 0.95 }],
    walls: [{ x: 0, z: -3.6, w: 22, d: 0.5 }, { x: 0, z: 3.6, w: 22, d: 0.5 }, { x: 1, z: -2, w: 0.5, d: 3 }],
    footDecals: [{ x: -4, z: 2 }, { x: 5, z: -2.5 }],
    par: 40, // v0.24.9: aprendizaje más amable
  },
  // 3 ─────────────────────────────────────────────────────────────────────
  {
    id: 3, name: 'Cresta Triangular', tier: 'Media', theme: 'meseta',
    hint: 'Tablero triangular sin bordes: precisión o caída. Apunta al vértice.',
    surfaceColor: '#8a7d55', surfaceAccent: '#766845',
    footprint: [{ type: 'poly', points: [[-9, 5], [9, 5], [0, -7]] }],
    start: { x: -4, z: 3 }, goal: { x: 0, z: -4, r: 1.0 },
    traps: [{ x: -3, z: 0, r: 0.9 }, { x: 3, z: 1, r: 0.9 }],
    walls: [],
    footDecals: [{ x: 0, z: 3 }],
    par: 40, // v0.24.9: aprendizaje más amable
  },
  // 4 ─────────────────────────────────────────────────────────────────────
  {
    id: 4, name: 'Cráter Circular', tier: 'Media', theme: 'volcan',
    hint: 'Rodea la trampa central del cráter. El borde es traicionero.',
    surfaceColor: '#5a7f78', surfaceAccent: '#4a6b65',
    footprint: [{ type: 'circle', x: 0, z: 0, r: 8 }],
    start: { x: -5.5, z: 0 }, goal: { x: 5.5, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 1.3 }, { x: 0, z: -4, r: 0.9 }, { x: 0, z: 4, r: 0.9 }],
    walls: [],
    footDecals: [{ x: -2.5, z: -2.5 }, { x: 2.5, z: 2.5 }],
    par: 40,
  },
  // 5 ─────────────────────────────────────────────────────────────────────
  {
    id: 5, name: 'Laberinto Jurásico', tier: 'Media', theme: 'bosque',
    hint: 'Atraviesa el laberinto esquivando las trampas hasta la meta.',
    surfaceColor: '#5f7a4a', surfaceAccent: '#4f663d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 14 }],
    start: { x: -9, z: -5 }, goal: { x: 9, z: 5, r: 1.1 },
    traps: [{ x: -6, z: 3, r: 0.9 }, { x: 0, z: 0, r: 1.0 }, { x: 6, z: -3, r: 0.9 }],
    walls: [
      { x: 0, z: -6.8, w: 21, d: 0.4 }, { x: 0, z: 6.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 13.6 }, { x: 10.8, z: 0, w: 0.4, d: 13.6 },
      { x: -2.5, z: -3, w: 0.6, d: 8 }, { x: 2.5, z: 3, w: 0.6, d: 8 },
    ],
    footDecals: [{ x: -7, z: -2 }, { x: 7, z: 2 }],
    par: 55,
  },
  // 6 ─────────────────────────────────────────────────────────────────────
  {
    id: 6, name: 'Doble Recodo', tier: 'Media', theme: 'bosque',
    hint: 'Tablero en L: avanza y gira la esquina hacia la meta.',
    surfaceColor: '#6e8a4e', surfaceAccent: '#5c7440',
    footprint: [{ type: 'rect', x: -3, z: -3, w: 14, d: 6 }, { type: 'rect', x: 1, z: 2, w: 6, d: 14 }],
    start: { x: -8, z: -3 }, goal: { x: 1, z: 7, r: 1.1 },
    traps: [{ x: 3, z: -4, r: 0.9 }, { x: -1, z: 4, r: 0.9 }],
    walls: [],
    footDecals: [{ x: -6, z: -3 }, { x: 1, z: 4 }],
    par: 45,
  },
  // 7 ─────────────────────────────────────────────────────────────────────
  {
    id: 7, name: 'Puente Colgante', tier: 'Media', theme: 'isla',
    hint: 'Cruza el puente estrecho sin caer al vacío.',
    surfaceColor: '#7d8a55', surfaceAccent: '#6a7547',
    footprint: [{ type: 'rect', x: -8, z: 0, w: 8, d: 9 }, { type: 'rect', x: 0, z: 0, w: 9, d: 2.6 }, { type: 'rect', x: 8, z: 0, w: 8, d: 9 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.1 },
    traps: [{ x: -8, z: 2.5, r: 0.9 }, { x: 8, z: -2.5, r: 0.9 }],
    walls: [],
    footDecals: [{ x: -9, z: -2 }, { x: 9, z: 2 }],
    par: 45,
  },
  // 8 ─────────────────────────────────────────────────────────────────────
  {
    id: 8, name: 'Cruce Jurásico', tier: 'Media', theme: 'valle',
    hint: 'Forma de cruz: ve del brazo izquierdo al brazo superior.',
    surfaceColor: '#5f8a6a', surfaceAccent: '#4f7458',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 18, d: 4.5 }, { type: 'rect', x: 0, z: 0, w: 4.5, d: 18 }],
    start: { x: -7, z: 0 }, goal: { x: 0, z: 7, r: 1.1 },
    traps: [{ x: 6, z: 0, r: 0.9 }, { x: 0, z: -6, r: 0.9 }],
    walls: [],
    footDecals: [{ x: -5, z: 0 }, { x: 0, z: 5 }],
    par: 45,
  },
  // 9 ─────────────────────────────────────────────────────────────────────
  {
    id: 9, name: 'Serpiente', tier: 'Difícil', theme: 'pantano',
    hint: 'Pasillo serpenteante: cruza cada hueco en zig-zag.',
    surfaceColor: '#6a7a4a', surfaceAccent: '#59673d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 14 }],
    start: { x: -9, z: -5 }, goal: { x: 9, z: 5, r: 1.1 },
    traps: [{ x: 3, z: -4.5, r: 0.8 }, { x: 0, z: 0, r: 0.9 }, { x: -3, z: 4.5, r: 0.8 }],
    walls: [
      { x: 0, z: -6.8, w: 23, d: 0.4 }, { x: 0, z: 6.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 13.6 }, { x: 11.8, z: 0, w: 0.4, d: 13.6 },
      { x: -2, z: -2.3, w: 16, d: 0.5 }, { x: 2, z: 2.3, w: 16, d: 0.5 },
    ],
    footDecals: [{ x: -8, z: 0 }, { x: 8, z: 0 }],
    par: 60,
  },
  // 10 ────────────────────────────────────────────────────────────────────
  {
    id: 10, name: 'Foso Doble', tier: 'Difícil', theme: 'volcan',
    hint: 'Dos grandes fosos: teje tu camino por los carriles seguros.',
    surfaceColor: '#7a6a4a', surfaceAccent: '#67593d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 20, d: 12 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.1 },
    traps: [{ x: -3, z: 0, r: 1.6 }, { x: 4, z: 0, r: 1.6 }, { x: 0, z: 4, r: 0.8 }, { x: 1, z: -4, r: 0.8 }],
    walls: [
      { x: 0, z: -5.8, w: 19, d: 0.4 }, { x: 0, z: 5.8, w: 19, d: 0.4 },
      { x: -9.8, z: 0, w: 0.4, d: 11.6 }, { x: 9.8, z: 0, w: 0.4, d: 11.6 },
    ],
    footDecals: [{ x: -7, z: 3 }, { x: 7, z: -3 }],
    par: 50,
  },
  // 11 ────────────────────────────────────────────────────────────────────
  {
    id: 11, name: 'Anillo', tier: 'Difícil', theme: 'ruinas',
    hint: 'Bordea la enorme trampa central del anillo.',
    surfaceColor: '#5a7a82', surfaceAccent: '#4a666d',
    footprint: [{ type: 'circle', x: 0, z: 0, r: 9 }],
    start: { x: -6, z: 0 }, goal: { x: 6, z: 0, r: 1.1 },
    traps: [{ x: 0, z: 0, r: 2.6 }, { x: 0, z: 5.5, r: 0.9 }, { x: 0, z: -5.5, r: 0.9 }],
    walls: [],
    footDecals: [{ x: -3, z: -3 }, { x: 3, z: 3 }],
    par: 55,
  },
  // 12 ────────────────────────────────────────────────────────────────────
  {
    id: 12, name: 'Diamante', tier: 'Difícil', theme: 'meseta',
    hint: 'Rombo sin bordes: serpentea entre las trampas alineadas.',
    surfaceColor: '#7a5a7a', surfaceAccent: '#664a66',
    footprint: [{ type: 'poly', points: [[0, -7.5], [9, 0], [0, 7.5], [-9, 0]] }],
    start: { x: -6, z: 0 }, goal: { x: 6, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 1.1 }, { x: 0, z: 3.4, r: 0.8 }, { x: 0, z: -3.4, r: 0.8 }],
    walls: [],
    footDecals: [{ x: -3, z: 0 }, { x: 3, z: 0 }],
    par: 50,
  },
  // 13 ────────────────────────────────────────────────────────────────────
  {
    id: 13, name: 'Embudo', tier: 'Difícil', theme: 'huevos',
    hint: 'De lo ancho a lo estrecho: enfila el cuello hacia la meta.',
    surfaceColor: '#6a7a55', surfaceAccent: '#596747',
    footprint: [
      { type: 'rect', x: -6, z: 0, w: 10, d: 11 }, { type: 'rect', x: 0, z: 0, w: 6, d: 6 },
      { type: 'rect', x: 5, z: 0, w: 6, d: 2.6 }, { type: 'rect', x: 9, z: 0, w: 5, d: 5 },
    ],
    start: { x: -9, z: 0 }, goal: { x: 10, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 2, r: 0.7 }, { x: 0, z: -2, r: 0.7 }, { x: -6, z: 3.5, r: 0.9 }],
    walls: [],
    footDecals: [{ x: -8, z: -3 }, { x: 9, z: 1.5 }],
    par: 50,
  },
  // 14 ────────────────────────────────────────────────────────────────────
  {
    id: 14, name: 'Laberinto II', tier: 'Experto', theme: 'bosque',
    hint: 'Laberinto serpenteante de tres tramos. Paciencia y precisión.',
    surfaceColor: '#566a44', surfaceAccent: '#465738',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 16 }],
    start: { x: -10, z: -5 }, goal: { x: 10, z: 6, r: 1.1 },
    traps: [{ x: 0, z: -5, r: 0.8 }, { x: -8, z: -0.7, r: 0.8 }, { x: 0, z: 2.7, r: 0.8 }, { x: -8, z: 6, r: 0.8 }],
    walls: [
      { x: 0, z: -7.8, w: 25, d: 0.4 }, { x: 0, z: 7.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 15.6 }, { x: 12.8, z: 0, w: 0.4, d: 15.6 },
      { x: -3, z: -2.5, w: 18, d: 0.5 }, { x: 3, z: 1.0, w: 18, d: 0.5 }, { x: -3, z: 4.5, w: 18, d: 0.5 },
    ],
    footDecals: [{ x: -10, z: 0 }, { x: 10, z: -2 }],
    par: 70,
  },
  // 15 ────────────────────────────────────────────────────────────────────
  {
    id: 15, name: 'Cima Final', tier: 'Experto', theme: 'volcan',
    hint: 'Cámaras estrechas y trampas por doquier.',
    surfaceColor: '#704a4a', surfaceAccent: '#5d3d3d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 16, d: 14 }],
    start: { x: -6, z: -5 }, goal: { x: 6, z: 5, r: 0.95 },
    traps: [{ x: 0, z: 0, r: 1.0 }, { x: -5, z: 3, r: 0.8 }, { x: 5, z: -3, r: 0.8 }, { x: 0, z: -5, r: 0.7 }],
    walls: [
      { x: 0, z: -6.8, w: 15, d: 0.4 }, { x: 0, z: 6.8, w: 15, d: 0.4 },
      { x: -7.8, z: 0, w: 0.4, d: 13.6 }, { x: 7.8, z: 0, w: 0.4, d: 13.6 },
      { x: -2.5, z: -3, w: 0.6, d: 6 }, { x: 2.5, z: 3, w: 0.6, d: 6 },
    ],
    footDecals: [{ x: -5, z: 0 }, { x: 5, z: 0 }],
    par: 75,
  },
  // 16 ────────────────────────────────────────────────────────────────────
  {
    id: 16, name: 'Valle de las Huellas', tier: 'Difícil', theme: 'valle',
    hint: 'Sigue el sendero esquivando las huellas-trampa en zig-zag.',
    surfaceColor: '#6b8f5a', surfaceAccent: '#587846',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 12 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.1 },
    traps: [{ x: -5, z: 1.8, r: 0.85 }, { x: -1, z: -1.8, r: 0.85 }, { x: 3, z: 1.8, r: 0.85 }, { x: 6, z: -1.8, r: 0.85 }],
    walls: [
      { x: 0, z: -5.8, w: 21, d: 0.4 }, { x: 0, z: 5.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 11.6 }, { x: 10.8, z: 0, w: 0.4, d: 11.6 },
    ],
    footDecals: [{ x: -7, z: -3 }, { x: 0, z: 3 }, { x: 7, z: 3 }],
    par: 55,
  },
  // 17 ────────────────────────────────────────────────────────────────────
  {
    id: 17, name: 'Pantano del Raptor', tier: 'Difícil', theme: 'pantano',
    hint: 'Lodazales por todas partes: avanza por los carriles firmes.',
    surfaceColor: '#566a3f', surfaceAccent: '#475636',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 14 }],
    start: { x: -10, z: -4 }, goal: { x: 10, z: 4, r: 1.05 },
    traps: [{ x: -6, z: 0, r: 1.4 }, { x: 0, z: 3.2, r: 1.3 }, { x: 5, z: -2.5, r: 1.3 }, { x: 2, z: 5, r: 0.8 }],
    walls: [
      { x: 0, z: -6.8, w: 23, d: 0.4 }, { x: 0, z: 6.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 13.6 }, { x: 11.8, z: 0, w: 0.4, d: 13.6 },
    ],
    footDecals: [{ x: -8, z: 4 }, { x: 8, z: -4 }],
    par: 65,
  },
  // 18 ────────────────────────────────────────────────────────────────────
  {
    id: 18, name: 'Cañón de Huesos', tier: 'Difícil', theme: 'meseta',
    hint: 'Cañón estrecho: eslalon entre los salientes de roca.',
    surfaceColor: '#8a7a55', surfaceAccent: '#766845',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 7 }],
    start: { x: -11, z: 0 }, goal: { x: 11, z: 0, r: 1.0 },
    traps: [{ x: -4, z: 0, r: 0.7 }, { x: 4, z: 0, r: 0.7 }],
    walls: [
      { x: 0, z: -3.3, w: 25, d: 0.4 }, { x: 0, z: 3.3, w: 25, d: 0.4 },
      { x: -7, z: -1.4, w: 0.6, d: 4 }, { x: -2, z: 1.4, w: 0.6, d: 4 },
      { x: 3, z: -1.4, w: 0.6, d: 4 }, { x: 8, z: 1.4, w: 0.6, d: 4 },
    ],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 60,
  },
  // 19 ────────────────────────────────────────────────────────────────────
  {
    id: 19, name: 'Cúpula Volcánica', tier: 'Experto', theme: 'volcan',
    hint: 'Cráter ardiente: rodea el magma central y sus bocas.',
    surfaceColor: '#6a4038', surfaceAccent: '#56332c',
    footprint: [{ type: 'circle', x: 0, z: 0, r: 9 }],
    start: { x: -6.5, z: 2 }, goal: { x: 6.5, z: -2, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 2.3 }, { x: -3.5, z: -4, r: 0.85 }, { x: 3.5, z: 4, r: 0.85 }, { x: 0, z: 6.5, r: 0.85 }],
    walls: [],
    footDecals: [{ x: -4, z: 4 }, { x: 4, z: -4 }],
    par: 60,
  },
  // 20 ────────────────────────────────────────────────────────────────────
  {
    id: 20, name: 'Sendero del Triceratops', tier: 'Experto', theme: 'bosque',
    hint: 'Tres tramos serpenteantes con trampas en cada recodo.',
    surfaceColor: '#4f6a3c', surfaceAccent: '#415731',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 16 }],
    start: { x: -10, z: 5 }, goal: { x: 10, z: -5, r: 1.05 },
    traps: [{ x: -4, z: 5, r: 0.8 }, { x: 6, z: 2.5, r: 0.8 }, { x: -6, z: -2.5, r: 0.8 }, { x: 4, z: -5, r: 0.8 }],
    walls: [
      { x: 0, z: -7.8, w: 23, d: 0.4 }, { x: 0, z: 7.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 15.6 }, { x: 11.8, z: 0, w: 0.4, d: 15.6 },
      { x: 2, z: 2.4, w: 18, d: 0.5 }, { x: -2, z: -2.4, w: 18, d: 0.5 },
    ],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 75,
  },
  // 21 ────────────────────────────────────────────────────────────────────
  {
    id: 21, name: 'Isla del Huevo Dorado', tier: 'Experto', theme: 'isla',
    hint: 'Islas unidas por puentes: cruza el centro hasta la pradera norte.',
    surfaceColor: '#3f8a66', surfaceAccent: '#347355',
    footprint: [
      { type: 'rect', x: 0, z: 0, w: 7, d: 7 },
      { type: 'rect', x: -6, z: 0, w: 6, d: 2.6 }, { type: 'rect', x: -10, z: 0, w: 4, d: 4 },
      { type: 'rect', x: 6, z: 0, w: 6, d: 2.6 }, { type: 'rect', x: 10, z: 0, w: 4, d: 4 },
      { type: 'rect', x: 0, z: -6, w: 2.6, d: 6 }, { type: 'rect', x: 0, z: -10, w: 4, d: 4 },
    ],
    start: { x: -10, z: 0 }, goal: { x: 0, z: -10, r: 1.0 },
    traps: [{ x: 1.4, z: 1.4, r: 0.9 }, { x: 10, z: 0, r: 0.8 }],
    walls: [],
    footDecals: [{ x: 0, z: 0 }, { x: -10, z: 0 }],
    par: 60,
  },
  // 22 ────────────────────────────────────────────────────────────────────
  {
    id: 22, name: 'Laberinto del Carnotauro', tier: 'Experto', theme: 'ruinas',
    hint: 'Laberinto amplio de cuatro tramos. No te precipites.',
    surfaceColor: '#6a6658', surfaceAccent: '#565347',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 18 }],
    start: { x: -11, z: -6 }, goal: { x: 11, z: 6, r: 1.05 },
    traps: [{ x: -2, z: -6, r: 0.8 }, { x: -9, z: -1, r: 0.8 }, { x: 2, z: 1, r: 0.8 }, { x: -2, z: 5, r: 0.8 }],
    walls: [
      { x: 0, z: -8.8, w: 25, d: 0.4 }, { x: 0, z: 8.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 17.6 }, { x: 12.8, z: 0, w: 0.4, d: 17.6 },
      { x: -3, z: -3.5, w: 18, d: 0.5 }, { x: 3, z: -0.2, w: 18, d: 0.5 }, { x: -3, z: 3.0, w: 18, d: 0.5 }, { x: 3, z: 6.0, w: 14, d: 0.5 },
    ],
    footDecals: [{ x: -10, z: 0 }, { x: 10, z: 0 }],
    par: 85,
  },
  // 23 ────────────────────────────────────────────────────────────────────
  {
    id: 23, name: 'Fósiles Perdidos', tier: 'Experto', theme: 'meseta',
    hint: 'Meseta hexagonal sin bordes: precisión entre los fósiles.',
    surfaceColor: '#8a8055', surfaceAccent: '#756c46',
    footprint: [{ type: 'poly', points: [[-5, -8], [5, -8], [9.5, 0], [5, 8], [-5, 8], [-9.5, 0]] }],
    start: { x: -6, z: 0 }, goal: { x: 6, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 1.1 }, { x: 0, z: 4, r: 0.8 }, { x: 0, z: -4, r: 0.8 }, { x: -3, z: 0, r: 0.8 }],
    walls: [],
    footDecals: [{ x: 3, z: 3 }, { x: 3, z: -3 }],
    par: 65,
  },
  // 24 ────────────────────────────────────────────────────────────────────
  {
    id: 24, name: 'Ruinas del T-Rex', tier: 'Experto', theme: 'ruinas',
    hint: 'Bosque de columnas: serpentea entre las ruinas hasta la meta.',
    surfaceColor: '#6f6a5c', surfaceAccent: '#5b574b',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 16 }],
    start: { x: -10, z: -6 }, goal: { x: 10, z: 6, r: 1.0 },
    traps: [{ x: -4, z: 0, r: 0.9 }, { x: 4, z: 0, r: 0.9 }, { x: 0, z: -5, r: 0.8 }, { x: 0, z: 5, r: 0.8 }],
    walls: [
      { x: 0, z: -7.8, w: 23, d: 0.4 }, { x: 0, z: 7.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 15.6 }, { x: 11.8, z: 0, w: 0.4, d: 15.6 },
      { x: -7, z: -4, w: 1.4, d: 1.4 }, { x: -7, z: 4, w: 1.4, d: 1.4 },
      { x: 0, z: 0, w: 1.4, d: 1.4 }, { x: 7, z: -4, w: 1.4, d: 1.4 }, { x: 7, z: 4, w: 1.4, d: 1.4 },
      { x: -3.5, z: 2.5, w: 1.4, d: 1.4 }, { x: 3.5, z: -2.5, w: 1.4, d: 1.4 },
    ],
    footDecals: [{ x: -9, z: 6 }, { x: 9, z: -6 }],
    par: 80,
  },
  // 25 ────────────────────────────────────────────────────────────────────
  {
    id: 25, name: 'Gran Final Jurásico', tier: 'Experto', theme: 'volcan',
    hint: 'El reto definitivo: laberinto ardiente serpenteante hasta la cima.',
    surfaceColor: '#6a3a36', surfaceAccent: '#56302c',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 20, d: 16 }],
    start: { x: -8, z: -6 }, goal: { x: 8, z: 6.5, r: 0.95 },
    traps: [{ x: -4, z: -6, r: 0.8 }, { x: 0, z: -1, r: 0.85 }, { x: -3, z: 3, r: 0.8 }, { x: 6, z: 3, r: 0.8 }, { x: 1, z: 6.5, r: 0.75 }],
    walls: [
      { x: 0, z: -7.8, w: 19, d: 0.4 }, { x: 0, z: 7.8, w: 19, d: 0.4 },
      { x: -9.8, z: 0, w: 0.4, d: 15.6 }, { x: 9.8, z: 0, w: 0.4, d: 15.6 },
      { x: -2.5, z: -3, w: 14, d: 0.5 }, { x: 2.5, z: 1, w: 14, d: 0.5 }, { x: -2.5, z: 5, w: 14, d: 0.5 },
    ],
    footDecals: [{ x: -8, z: 0 }, { x: 8, z: 0 }],
    par: 90,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MUNDO 6 — Cañón del Pterodáctilo (26–30) · introducción de PORTALES naranjas
  // ═══════════════════════════════════════════════════════════════════════
  // 26 ────────────────────────────────────────────────────────────────────
  {
    id: 26, name: 'Nido del Cañón', tier: 'Difícil', theme: 'meseta',
    hint: 'Cañón ventoso: los hoyos naranjas son portales: entra en uno y sal por el otro.',
    surfaceColor: '#9a8552', surfaceAccent: '#82703f',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 12 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.1 },
    traps: [{ x: -4, z: 2.2, r: 0.95 }, { x: 0, z: -2.2, r: 0.95 }, { x: 4, z: 2.2, r: 0.95 }, { x: 6, z: -2.6, r: 0.85 }],
    walls: [
      { x: 0, z: -5.8, w: 21, d: 0.4 }, { x: 0, z: 5.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 11.6 }, { x: 10.8, z: 0, w: 0.4, d: 11.6 },
    ],
    portals: [{ x: -6, z: -3.6, r: 1.0 }, { x: 6, z: 3.6, r: 1.0 }],
    footDecals: [{ x: -7, z: 3 }, { x: 7, z: -3 }],
    par: 56,
  },
  // 27 ────────────────────────────────────────────────────────────────────
  {
    id: 27, name: 'Puente del Viento', tier: 'Difícil', theme: 'meseta',
    hint: 'Cruza el puente o teletranspórtate de risco a risco. ¡No caigas al vacío!',
    surfaceColor: '#94824f', surfaceAccent: '#7d6c3d',
    footprint: [{ type: 'rect', x: -8, z: 0, w: 8, d: 9 }, { type: 'rect', x: 0, z: 0, w: 9, d: 2.6 }, { type: 'rect', x: 8, z: 0, w: 8, d: 9 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.1 },
    traps: [{ x: -8, z: 2.6, r: 0.85 }, { x: -6, z: -2.6, r: 0.8 }, { x: 8, z: 2.6, r: 0.8 }, { x: 6, z: -2.6, r: 0.85 }],
    walls: [],
    portals: [{ x: -10.5, z: 3, r: 1.0 }, { x: 10.5, z: -3, r: 1.0 }],
    footDecals: [{ x: -8, z: 0 }, { x: 8, z: 0 }],
    par: 60,
  },
  // 28 ────────────────────────────────────────────────────────────────────
  {
    id: 28, name: 'Mesa de los Nidos', tier: 'Difícil', theme: 'meseta',
    hint: 'Atraviesa la meseta esquivando los nidos-trampa. Un atajo naranja te espera.',
    surfaceColor: '#a08a55', surfaceAccent: '#88753f',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 14 }],
    start: { x: -10, z: -4 }, goal: { x: 10, z: 4, r: 1.05 },
    traps: [{ x: -6, z: -0.5, r: 1.2 }, { x: -1, z: 3.2, r: 1.0 }, { x: 2, z: -3, r: 1.1 }, { x: 6, z: 2.5, r: 1.0 }, { x: 8, z: -3.2, r: 0.9 }],
    walls: [
      { x: 0, z: -6.8, w: 23, d: 0.4 }, { x: 0, z: 6.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 13.6 }, { x: 11.8, z: 0, w: 0.4, d: 13.6 },
    ],
    portals: [{ x: -8, z: 4, r: 1.0 }, { x: 4, z: -5, r: 1.0 }],
    footDecals: [{ x: -9, z: 4 }, { x: 9, z: -4 }],
    par: 64,
  },
  // 29 ────────────────────────────────────────────────────────────────────
  {
    id: 29, name: 'Corriente Ascendente', tier: 'Difícil', theme: 'meseta',
    hint: 'Trampas escalonadas: los portales acortan el ascenso por el cañón.',
    surfaceColor: '#8f7d4c', surfaceAccent: '#79683c',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 20, d: 12 }],
    start: { x: -8, z: -4 }, goal: { x: 8, z: 4, r: 1.0 },
    traps: [{ x: -3, z: 1, r: 1.0 }, { x: -1, z: -2.5, r: 0.95 }, { x: 2, z: 2.8, r: 0.95 }, { x: 4, z: -1.5, r: 1.0 }, { x: 6, z: 2, r: 0.9 }],
    walls: [
      { x: 0, z: -5.8, w: 19, d: 0.4 }, { x: 0, z: 5.8, w: 19, d: 0.4 },
      { x: -9.8, z: 0, w: 0.4, d: 11.6 }, { x: 9.8, z: 0, w: 0.4, d: 11.6 },
    ],
    portals: [{ x: -6, z: 3.5, r: 1.0 }, { x: 6, z: -3.5, r: 1.0 }],
    footDecals: [{ x: -7, z: -3 }, { x: 7, z: 3 }],
    par: 62,
  },
  // 30 ────────────────────────────────────────────────────────────────────
  {
    id: 30, name: 'Vértigo del Cañón', tier: 'Difícil', theme: 'meseta',
    hint: 'Risco circular sin bordes: precisión total. Los portales cruzan el abismo.',
    surfaceColor: '#937f4a', surfaceAccent: '#7c6a3a',
    footprint: [{ type: 'circle', x: 0, z: 0, r: 9 }],
    start: { x: -6, z: 0 }, goal: { x: 6, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 1.6 }, { x: 0, z: 4.5, r: 0.9 }, { x: 0, z: -4.5, r: 0.9 }, { x: -3.5, z: 2.5, r: 0.8 }],
    walls: [],
    portals: [{ x: -5, z: -5, r: 1.0 }, { x: 5, z: 5, r: 1.0 }],
    footDecals: [{ x: -3, z: -3 }, { x: 3, z: 3 }],
    par: 60,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MUNDO 7 — Selva Perdida (31–35) · jungla densa, pasos estrechos
  // ═══════════════════════════════════════════════════════════════════════
  // 31 ────────────────────────────────────────────────────────────────────
  {
    id: 31, name: 'Espesura', tier: 'Experto', theme: 'bosque',
    hint: 'La jungla se cierra: serpentea entre la maleza y usa los portales.',
    surfaceColor: '#3f6a39', surfaceAccent: '#33572f',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 14 }],
    start: { x: -10, z: -5 }, goal: { x: 10, z: 5, r: 1.05 },
    traps: [{ x: -2, z: -4.5, r: 0.9 }, { x: 0, z: -0.3, r: 0.95 }, { x: 0, z: 4.5, r: 0.9 }, { x: 6, z: 3.5, r: 0.85 }],
    walls: [
      { x: 0, z: -6.8, w: 23, d: 0.4 }, { x: 0, z: 6.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 13.6 }, { x: 11.8, z: 0, w: 0.4, d: 13.6 },
      { x: -3, z: -2.5, w: 18, d: 0.5 }, { x: 3, z: 2.0, w: 18, d: 0.5 },
    ],
    portals: [{ x: 8, z: -4, r: 1.0 }, { x: -8, z: 4, r: 1.0 }],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 70,
  },
  // 32 ────────────────────────────────────────────────────────────────────
  {
    id: 32, name: 'Lianas Cruzadas', tier: 'Experto', theme: 'bosque',
    hint: 'Cuatro tramos enmarañados. Los portales cruzan las lianas más densas.',
    surfaceColor: '#3a6336', surfaceAccent: '#2f5230',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 14 }],
    start: { x: -11, z: -5 }, goal: { x: 11, z: 5, r: 1.05 },
    traps: [{ x: -2, z: -4.5, r: 0.9 }, { x: 0, z: -1.2, r: 0.9 }, { x: 2, z: 1.8, r: 0.9 }, { x: -2, z: 4.8, r: 0.9 }],
    walls: [
      { x: 0, z: -6.8, w: 25, d: 0.4 }, { x: 0, z: 6.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 13.6 }, { x: 12.8, z: 0, w: 0.4, d: 13.6 },
      { x: -4, z: -2.6, w: 18, d: 0.5 }, { x: 4, z: 0.4, w: 18, d: 0.5 }, { x: -4, z: 3.4, w: 18, d: 0.5 },
    ],
    portals: [{ x: 10, z: -4.5, r: 1.0 }, { x: -10, z: 4.5, r: 1.0 }],
    footDecals: [{ x: -10, z: 0 }, { x: 10, z: 0 }],
    par: 80,
  },
  // 33 ────────────────────────────────────────────────────────────────────
  {
    id: 33, name: 'Niebla Verde', tier: 'Experto', theme: 'bosque',
    hint: 'Hexágono sin bordes entre la niebla. Cae o teletranspórtate con cuidado.',
    surfaceColor: '#37602f', surfaceAccent: '#2c4d27',
    footprint: [{ type: 'poly', points: [[-5, -8], [5, -8], [9.5, 0], [5, 8], [-5, 8], [-9.5, 0]] }],
    start: { x: -6, z: 0 }, goal: { x: 6, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 1.1 }, { x: 0, z: 4, r: 0.85 }, { x: 0, z: -4, r: 0.85 }, { x: -3, z: 0, r: 0.8 }, { x: 3, z: 0, r: 0.8 }],
    walls: [],
    portals: [{ x: -7, z: -3, r: 1.0 }, { x: 7, z: 3, r: 1.0 }],
    footDecals: [{ x: -4, z: 4 }, { x: 4, z: -4 }],
    par: 72,
  },
  // 34 ────────────────────────────────────────────────────────────────────
  {
    id: 34, name: 'Sendero Oculto', tier: 'Experto', theme: 'bosque',
    hint: 'Camino en L por la espesura. El portal abre la ruta escondida.',
    surfaceColor: '#436b3a', surfaceAccent: '#36582f',
    footprint: [{ type: 'rect', x: -3, z: -3, w: 16, d: 6 }, { type: 'rect', x: 3, z: 2, w: 6, d: 16 }],
    start: { x: -9, z: -3 }, goal: { x: 3, z: 8, r: 1.1 },
    traps: [{ x: -5, z: -3, r: 0.9 }, { x: -1, z: -4, r: 0.85 }, { x: 3, z: -1, r: 0.9 }, { x: 3, z: 4, r: 0.9 }, { x: 1, z: 7, r: 0.8 }],
    walls: [],
    portals: [{ x: -9, z: -1, r: 1.0 }, { x: 5, z: 5, r: 1.0 }],
    footDecals: [{ x: -7, z: -3 }, { x: 3, z: 6 }],
    par: 66,
  },
  // 35 ────────────────────────────────────────────────────────────────────
  {
    id: 35, name: 'Corazón de la Selva', tier: 'Experto', theme: 'bosque',
    hint: 'El centro de la jungla: laberinto cerrado. Los portales son tu atajo.',
    surfaceColor: '#345c2c', surfaceAccent: '#294a24',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 16 }],
    start: { x: -9, z: -6 }, goal: { x: 9, z: 6, r: 1.05 },
    traps: [{ x: 0, z: -5.5, r: 0.9 }, { x: -1, z: -1.8, r: 0.9 }, { x: 1, z: 1.8, r: 0.9 }, { x: -1, z: 5.5, r: 0.9 }],
    walls: [
      { x: 0, z: -7.8, w: 21, d: 0.4 }, { x: 0, z: 7.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 15.6 }, { x: 10.8, z: 0, w: 0.4, d: 15.6 },
      { x: -2, z: -3.5, w: 16, d: 0.5 }, { x: 2, z: 0, w: 16, d: 0.5 }, { x: -2, z: 3.5, w: 16, d: 0.5 },
    ],
    portals: [{ x: 8, z: -5, r: 1.0 }, { x: -8, z: 5, r: 1.0 }],
    footDecals: [{ x: -8, z: 0 }, { x: 8, z: 0 }],
    par: 82,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MUNDO 8 — Cavernas de Ámbar (36–40) · cuevas técnicas, columnas
  // ═══════════════════════════════════════════════════════════════════════
  // 36 ────────────────────────────────────────────────────────────────────
  {
    id: 36, name: 'Cristales', tier: 'Experto', theme: 'huevos',
    hint: 'Cueva de cristales: eslalon entre columnas. Portales entre las vetas.',
    surfaceColor: '#8a6a3a', surfaceAccent: '#74592f',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 12 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.0 },
    traps: [{ x: -2, z: 3.5, r: 0.8 }, { x: 2, z: -3.5, r: 0.8 }],
    walls: [
      { x: 0, z: -5.8, w: 21, d: 0.4 }, { x: 0, z: 5.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 11.6 }, { x: 10.8, z: 0, w: 0.4, d: 11.6 },
      { x: -4, z: -1.4, w: 0.6, d: 7 }, { x: 0, z: 1.4, w: 0.6, d: 7 }, { x: 4, z: -1.4, w: 0.6, d: 7 },
    ],
    portals: [{ x: -7, z: 3, r: 1.0 }, { x: 7, z: -3, r: 1.0 }],
    footDecals: [{ x: -7, z: 0 }, { x: 7, z: 0 }],
    par: 72,
  },
  // 37 ────────────────────────────────────────────────────────────────────
  {
    id: 37, name: 'Galería de Ámbar', tier: 'Experto', theme: 'huevos',
    hint: 'Largos corredores de ámbar. Los portales saltan de galería a galería.',
    surfaceColor: '#946f3a', surfaceAccent: '#7d5d30',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 14 }],
    start: { x: -11, z: 5 }, goal: { x: 11, z: -5, r: 1.05 },
    traps: [{ x: -2, z: 4.5, r: 0.9 }, { x: 0, z: 1.2, r: 0.9 }, { x: 2, z: -1.8, r: 0.9 }, { x: -2, z: -4.8, r: 0.9 }],
    walls: [
      { x: 0, z: -6.8, w: 25, d: 0.4 }, { x: 0, z: 6.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 13.6 }, { x: 12.8, z: 0, w: 0.4, d: 13.6 },
      { x: 4, z: 2.6, w: 18, d: 0.5 }, { x: -4, z: -0.4, w: 18, d: 0.5 }, { x: 4, z: -3.4, w: 18, d: 0.5 },
    ],
    portals: [{ x: 10, z: 4.5, r: 1.0 }, { x: -10, z: -4.5, r: 1.0 }],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 84,
  },
  // 38 ────────────────────────────────────────────────────────────────────
  {
    id: 38, name: 'Estalactitas', tier: 'Experto', theme: 'huevos',
    hint: 'Goteo de piedra: pilares y trampas. Teletranspórtate entre columnas.',
    surfaceColor: '#8a6736', surfaceAccent: '#74562d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 14 }],
    start: { x: -9, z: -5 }, goal: { x: 9, z: 5, r: 1.0 },
    traps: [{ x: 1, z: 5, r: 0.85 }, { x: -3, z: -5, r: 0.85 }],
    walls: [
      { x: 0, z: -6.8, w: 21, d: 0.4 }, { x: 0, z: 6.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 13.6 }, { x: 10.8, z: 0, w: 0.4, d: 13.6 },
      { x: -5, z: -1, w: 1.4, d: 1.4 }, { x: -5, z: 3, w: 1.4, d: 1.4 },
      { x: -1, z: -3, w: 1.4, d: 1.4 }, { x: -1, z: 1, w: 1.4, d: 1.4 },
      { x: 3, z: -1, w: 1.4, d: 1.4 }, { x: 3, z: 3, w: 1.4, d: 1.4 }, { x: 6, z: -3, w: 1.4, d: 1.4 },
    ],
    portals: [{ x: -8, z: 4, r: 1.0 }, { x: 8, z: -4, r: 1.0 }],
    footDecals: [{ x: -7, z: 5 }, { x: 7, z: -5 }],
    par: 78,
  },
  // 39 ────────────────────────────────────────────────────────────────────
  {
    id: 39, name: 'Cámara Sellada', tier: 'Experto', theme: 'huevos',
    hint: 'Laberinto cerrado de ámbar. Sin los portales, no hay salida fácil.',
    surfaceColor: '#92703c', surfaceAccent: '#7b5d31',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 16 }],
    start: { x: 9, z: -6 }, goal: { x: -9, z: 6, r: 1.05 },
    traps: [{ x: 0, z: -5.5, r: 0.9 }, { x: 1, z: -1.8, r: 0.9 }, { x: -1, z: 1.8, r: 0.9 }, { x: 1, z: 5.5, r: 0.9 }],
    walls: [
      { x: 0, z: -7.8, w: 21, d: 0.4 }, { x: 0, z: 7.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 15.6 }, { x: 10.8, z: 0, w: 0.4, d: 15.6 },
      { x: 2, z: -3.5, w: 16, d: 0.5 }, { x: -2, z: 0, w: 16, d: 0.5 }, { x: 2, z: 3.5, w: 16, d: 0.5 },
    ],
    portals: [{ x: -8, z: -5, r: 1.0 }, { x: 8, z: 5, r: 1.0 }],
    footDecals: [{ x: -8, z: 0 }, { x: 8, z: 0 }],
    par: 86,
  },
  // 40 ────────────────────────────────────────────────────────────────────
  {
    id: 40, name: 'Veta Dorada', tier: 'Experto', theme: 'huevos',
    hint: 'Rombo de ámbar sin bordes. El huevo dorado espera tras los portales.',
    surfaceColor: '#9a743c', surfaceAccent: '#82612f',
    footprint: [{ type: 'poly', points: [[0, -8.5], [10, 0], [0, 8.5], [-10, 0]] }],
    start: { x: -7, z: 0 }, goal: { x: 7, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 1.2 }, { x: 0, z: 3.6, r: 0.85 }, { x: 0, z: -3.6, r: 0.85 }, { x: -3.5, z: 0, r: 0.8 }, { x: 3.5, z: 0, r: 0.8 }],
    walls: [],
    portals: [{ x: -5, z: -3, r: 1.0 }, { x: 5, z: 3, r: 1.0 }],
    footDecals: [{ x: -4, z: 4 }, { x: 4, z: -4 }],
    par: 76,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MUNDO 9 — Pantano de Sombras (41–45) · oscuridad, lodazales, riesgo alto
  // ═══════════════════════════════════════════════════════════════════════
  // 41 ────────────────────────────────────────────────────────────────────
  {
    id: 41, name: 'Lodo Negro', tier: 'Experto', theme: 'pantano',
    hint: 'Grandes lodazales en la oscuridad. Los portales evitan que te hundas.',
    surfaceColor: '#3c4a3a', surfaceAccent: '#2f3b2e',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 14 }],
    start: { x: -10, z: -4 }, goal: { x: 10, z: 4, r: 1.05 },
    traps: [{ x: -6, z: 0.5, r: 1.5 }, { x: -1, z: -3, r: 1.3 }, { x: 2, z: 3, r: 1.3 }, { x: 5, z: -1.5, r: 1.4 }, { x: 8, z: 3, r: 0.9 }],
    walls: [
      { x: 0, z: -6.8, w: 23, d: 0.4 }, { x: 0, z: 6.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 13.6 }, { x: 11.8, z: 0, w: 0.4, d: 13.6 },
    ],
    portals: [{ x: -3, z: -5, r: 1.0 }, { x: 9, z: -1, r: 1.0 }],
    footDecals: [{ x: -9, z: -4 }, { x: 9, z: 4 }],
    par: 78,
  },
  // 42 ────────────────────────────────────────────────────────────────────
  {
    id: 42, name: 'Brumas', tier: 'Experto', theme: 'pantano',
    hint: 'Niebla espesa y pasos estrechos. Los portales cruzan la bruma.',
    surfaceColor: '#3a473a', surfaceAccent: '#2d392d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 16 }],
    start: { x: -11, z: -6 }, goal: { x: 11, z: 6, r: 1.05 },
    traps: [{ x: 0, z: -5.5, r: 0.9 }, { x: -1, z: -1.5, r: 0.95 }, { x: 1, z: 1.8, r: 0.95 }, { x: -1, z: 5.5, r: 0.9 }, { x: 8, z: 5, r: 0.85 }],
    walls: [
      { x: 0, z: -7.8, w: 25, d: 0.4 }, { x: 0, z: 7.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 15.6 }, { x: 12.8, z: 0, w: 0.4, d: 15.6 },
      { x: -3, z: -3.6, w: 18, d: 0.5 }, { x: 3, z: 0, w: 18, d: 0.5 }, { x: -3, z: 3.6, w: 18, d: 0.5 },
    ],
    portals: [{ x: 10, z: -5, r: 1.0 }, { x: -10, z: 5, r: 1.0 }],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 88,
  },
  // 43 ────────────────────────────────────────────────────────────────────
  {
    id: 43, name: 'Raíces Trampa', tier: 'Experto', theme: 'pantano',
    hint: 'Raíces que atrapan: eslalon entre ellas con ayuda de los portales.',
    surfaceColor: '#384534', surfaceAccent: '#2c3729',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 12 }],
    start: { x: -10, z: 0 }, goal: { x: 10, z: 0, r: 1.0 },
    traps: [{ x: -4, z: 3.5, r: 0.8 }, { x: 0, z: -3.5, r: 0.8 }, { x: 4, z: 3.5, r: 0.8 }],
    walls: [
      { x: 0, z: -5.8, w: 23, d: 0.4 }, { x: 0, z: 5.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 11.6 }, { x: 11.8, z: 0, w: 0.4, d: 11.6 },
      { x: -6, z: -1.4, w: 0.6, d: 7 }, { x: -2, z: 1.4, w: 0.6, d: 7 }, { x: 2, z: -1.4, w: 0.6, d: 7 }, { x: 6, z: 1.4, w: 0.6, d: 7 },
    ],
    portals: [{ x: -8, z: -3, r: 1.0 }, { x: 8, z: 3, r: 1.0 }],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 76,
  },
  // 44 ────────────────────────────────────────────────────────────────────
  {
    id: 44, name: 'Aguas Profundas', tier: 'Experto', theme: 'pantano',
    hint: 'Estanque circular sin orillas. Precisión o los portales te salvan.',
    surfaceColor: '#36443a', surfaceAccent: '#2a362d',
    footprint: [{ type: 'circle', x: 0, z: 0, r: 9.5 }],
    start: { x: -6.5, z: 0 }, goal: { x: 6.5, z: 0, r: 1.0 },
    traps: [{ x: 0, z: 0, r: 2.2 }, { x: -4, z: 3.5, r: 0.85 }, { x: 4, z: -3.5, r: 0.85 }, { x: 0, z: 6, r: 0.85 }, { x: 0, z: -6, r: 0.85 }],
    walls: [],
    portals: [{ x: -5, z: -5, r: 1.0 }, { x: 5, z: 5, r: 1.0 }],
    footDecals: [{ x: -3, z: -4 }, { x: 3, z: 4 }],
    par: 80,
  },
  // 45 ────────────────────────────────────────────────────────────────────
  {
    id: 45, name: 'Sombra Final', tier: 'Experto', theme: 'pantano',
    hint: 'El laberinto más oscuro del pantano. Memoriza la ruta y los portales.',
    surfaceColor: '#333f31', surfaceAccent: '#283324',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 24, d: 16 }],
    start: { x: -10, z: -6 }, goal: { x: 10, z: 6, r: 1.05 },
    traps: [{ x: 0, z: -6, r: 0.9 }, { x: -1, z: -2.2, r: 0.9 }, { x: 1, z: 1.5, r: 0.9 }, { x: -1, z: 5.5, r: 0.9 }, { x: 8, z: 6, r: 0.85 }],
    walls: [
      { x: 0, z: -7.8, w: 23, d: 0.4 }, { x: 0, z: 7.8, w: 23, d: 0.4 },
      { x: -11.8, z: 0, w: 0.4, d: 15.6 }, { x: 11.8, z: 0, w: 0.4, d: 15.6 },
      { x: -2, z: -4, w: 16, d: 0.5 }, { x: 2, z: -0.3, w: 16, d: 0.5 }, { x: -2, z: 3.4, w: 16, d: 0.5 },
    ],
    portals: [{ x: 8, z: -5.5, r: 1.0 }, { x: -8, z: 5.5, r: 1.0 }],
    footDecals: [{ x: -8, z: 0 }, { x: 8, z: 0 }],
    par: 92,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MUNDO 10 — Corona del T-Rex (46–50) · final épico, máxima dificultad
  // ═══════════════════════════════════════════════════════════════════════
  // 46 ────────────────────────────────────────────────────────────────────
  {
    id: 46, name: 'Ascenso Ardiente', tier: 'Experto', theme: 'volcan',
    hint: 'Comienza el ascenso final entre la lava. Los portales saltan grietas.',
    surfaceColor: '#5a3230', surfaceAccent: '#46271f',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 14 }],
    start: { x: -9, z: -5 }, goal: { x: 9, z: 5, r: 1.05 },
    traps: [{ x: -5, z: 1, r: 1.0 }, { x: -1, z: -2.5, r: 0.95 }, { x: 2, z: 2.5, r: 0.95 }, { x: 5, z: -1.5, r: 1.0 }, { x: 6, z: 3.5, r: 0.85 }],
    walls: [
      { x: 0, z: -6.8, w: 21, d: 0.4 }, { x: 0, z: 6.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 13.6 }, { x: 10.8, z: 0, w: 0.4, d: 13.6 },
    ],
    portals: [{ x: -7, z: 4, r: 1.0 }, { x: 7, z: -4, r: 1.0 }],
    footDecals: [{ x: -8, z: -4 }, { x: 8, z: 4 }],
    par: 82,
  },
  // 47 ────────────────────────────────────────────────────────────────────
  {
    id: 47, name: 'Lava Partida', tier: 'Experto', theme: 'volcan',
    hint: 'Islas de roca sobre lava: solo los portales cruzan el río ardiente.',
    surfaceColor: '#5e3330', surfaceAccent: '#48271f',
    footprint: [{ type: 'rect', x: -7, z: 0, w: 9, d: 11 }, { type: 'rect', x: 7, z: 0, w: 9, d: 11 }],
    start: { x: -9, z: 0 }, goal: { x: 9, z: 0, r: 1.1 },
    traps: [{ x: -7, z: 3, r: 0.9 }, { x: -7, z: -3, r: 0.9 }, { x: 7, z: 3, r: 0.9 }, { x: 7, z: -3, r: 0.9 }],
    walls: [],
    portals: [{ x: -4, z: 0, r: 1.0 }, { x: 4, z: 0, r: 1.0 }],
    footDecals: [{ x: -7, z: 0 }, { x: 7, z: 0 }],
    par: 70,
  },
  // 48 ────────────────────────────────────────────────────────────────────
  {
    id: 48, name: 'Trono Roto', tier: 'Experto', theme: 'volcan',
    hint: 'Las ruinas del trono: laberinto ardiente. Cada portal, una decisión.',
    surfaceColor: '#56302d', surfaceAccent: '#42251d',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 16 }],
    start: { x: -11, z: -6 }, goal: { x: 11, z: 6, r: 1.05 },
    traps: [{ x: 0, z: -5.5, r: 0.9 }, { x: 1, z: -1.5, r: 0.95 }, { x: -1, z: 1.8, r: 0.95 }, { x: 1, z: 5.5, r: 0.9 }, { x: -8, z: 5, r: 0.85 }],
    walls: [
      { x: 0, z: -7.8, w: 25, d: 0.4 }, { x: 0, z: 7.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 15.6 }, { x: 12.8, z: 0, w: 0.4, d: 15.6 },
      { x: 3, z: -3.6, w: 18, d: 0.5 }, { x: -3, z: 0, w: 18, d: 0.5 }, { x: 3, z: 3.6, w: 18, d: 0.5 },
    ],
    portals: [{ x: -9, z: -3, r: 1.0 }, { x: 9, z: 3, r: 1.0 }],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 92,
  },
  // 49 ────────────────────────────────────────────────────────────────────
  {
    id: 49, name: 'Furia del T-Rex', tier: 'Experto', theme: 'volcan',
    hint: 'La montaña ruge: columnas y trampas con poco margen. Portales = supervivencia.',
    surfaceColor: '#5a302c', surfaceAccent: '#44231c',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 22, d: 16 }],
    start: { x: -9, z: -6 }, goal: { x: 9, z: 6, r: 1.05 },
    traps: [{ x: -3, z: 5, r: 0.85 }, { x: 3, z: -5, r: 0.85 }, { x: 2, z: 3, r: 0.8 }],
    walls: [
      { x: 0, z: -7.8, w: 21, d: 0.4 }, { x: 0, z: 7.8, w: 21, d: 0.4 },
      { x: -10.8, z: 0, w: 0.4, d: 15.6 }, { x: 10.8, z: 0, w: 0.4, d: 15.6 },
      { x: -5, z: -2, w: 1.4, d: 1.4 }, { x: -5, z: 2.5, w: 1.4, d: 1.4 },
      { x: 0, z: -3.5, w: 1.4, d: 1.4 }, { x: 0, z: 0.5, w: 1.4, d: 1.4 },
      { x: 5, z: -2, w: 1.4, d: 1.4 }, { x: 5, z: 2.5, w: 1.4, d: 1.4 },
    ],
    portals: [{ x: -8, z: 5, r: 1.0 }, { x: 8, z: -5, r: 1.0 }],
    footDecals: [{ x: -8, z: -5 }, { x: 8, z: 5 }],
    par: 94,
  },
  // 50 ────────────────────────────────────────────────────────────────────
  {
    id: 50, name: 'Corona Jurásica', tier: 'Experto', theme: 'volcan',
    hint: 'El reto definitivo: el gran laberinto de la corona. Domina trampas y portales.',
    surfaceColor: '#62332c', surfaceAccent: '#4a241b',
    footprint: [{ type: 'rect', x: 0, z: 0, w: 26, d: 18 }],
    start: { x: -11, z: -7 }, goal: { x: 11, z: 7, r: 1.0 },
    traps: [{ x: 0, z: -6.5, r: 0.9 }, { x: -1, z: -3, r: 0.9 }, { x: 1, z: 0, r: 0.9 }, { x: -1, z: 3, r: 0.9 }, { x: 1, z: 6, r: 0.9 }],
    walls: [
      { x: 0, z: -8.8, w: 25, d: 0.4 }, { x: 0, z: 8.8, w: 25, d: 0.4 },
      { x: -12.8, z: 0, w: 0.4, d: 17.6 }, { x: 12.8, z: 0, w: 0.4, d: 17.6 },
      { x: -3, z: -4.5, w: 18, d: 0.5 }, { x: 3, z: -1.5, w: 18, d: 0.5 }, { x: -3, z: 1.5, w: 18, d: 0.5 }, { x: 3, z: 4.5, w: 18, d: 0.5 },
    ],
    portals: [{ x: 10, z: -6, r: 1.0 }, { x: -10, z: 6, r: 1.0 }],
    footDecals: [{ x: -9, z: 0 }, { x: 9, z: 0 }],
    par: 110,
  },
];

export function getLevel(index) {
  return LEVELS[Math.max(0, Math.min(index, LEVELS.length - 1))];
}
