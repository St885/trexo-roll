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
    par: 30,
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
    par: 35,
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
    par: 35,
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
];

export function getLevel(index) {
  return LEVELS[Math.max(0, Math.min(index, LEVELS.length - 1))];
}
