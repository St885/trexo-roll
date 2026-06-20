// balls.js — Catálogo de bolas jugables. Cada bola está asociada a una ESPECIE de
// dinosaurio distinta (no el mismo dino recoloreado). La especie define tanto el
// emblema 2D de la bola como el modelo 3D que celebra al ganar.
// Todo original y procedural (sin copyright).

export const BALLS = [
  { id: 'blanca',   name: 'Blanca',   label: 'Rex Blanco',      species: 'trex',        blurb: 'El clásico. Equilibrado y fiable.',      body: '#f6f8fa', body2: '#dde5ea', dino: '#5f9e74', dark: '#173f2a' },
  { id: 'verde',    name: 'Verde',    label: 'Raptor Verde',    species: 'raptor',      blurb: 'Ágil y veloz. Para los rápidos.',        body: '#8fe3aa', body2: '#52bd7c', dino: '#2ea35d', dark: '#0f3d24' },
  { id: 'rosada',   name: 'Rosada',   label: 'Dino Rosa',       species: 'parasaur',    blurb: 'Con estilo. Rueda con elegancia.',       body: '#ffb6d3', body2: '#f57bb0', dino: '#e85d99', dark: '#7a2f52' },
  { id: 'amarilla', name: 'Amarilla', label: 'Tricera Amarillo', species: 'triceratops', blurb: 'Firme y resistente como un cuerno.',     body: '#ffe487', body2: '#f5c542', dino: '#e9a200', dark: '#6e5210' },
  { id: 'azul',     name: 'Azul',     label: 'Bronto Azul',     species: 'brachio',     blurb: 'Tranquilo y sereno. Rodada pesada.',     body: '#a3ccff', body2: '#5b9bf0', dino: '#3b82d6', dark: '#163a66' },
];

export const DEFAULT_BALL = 'blanca';

export function getBall(id) {
  return BALLS.find((b) => b.id === id) || BALLS[0];
}
