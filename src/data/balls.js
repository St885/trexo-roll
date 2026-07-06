// balls.js — Catálogo de bolas jugables. Cada bola está asociada a una ESPECIE de
// dinosaurio distinta (no el mismo dino recoloreado). La especie define tanto el
// emblema 2D de la bola como el modelo 3D que celebra al ganar.
// Todo original y procedural (sin copyright).
//
// HABILIDAD por bola (`ability`): efecto PASIVO y balanceado, que se explica en el
// selector de bolas y se aplica durante el gameplay. Diseño conservador: dan matiz y
// estrategia sin romper el balance ni los controles (no hay botones que tapen el HUD).
//   mods: modificadores aplicados al iniciar el nivel
//     · guard         → nº de "perdones" automáticos por nivel (resiste 1 pérdida)
//     · accelScale    → escala de la aceleración (gravedad proyectada): >1 más ágil, <1 más lento
//     · dampingScale  → escala de la fricción de rodadura: >1 asienta antes (más control)
//     · restitutionScale → escala del rebote contra paredes: <1 rebota menos (más estable)
//     · coinMagnet    → radio extra (unidades) para recoger monedas (atracción alegre)

export const BALLS = [
  {
    // species 'trex' (habilidad/física NO cambian); el EMBLEMA visual de la bola blanca principal
    // es OLIVER, el T-Rex bebé azul (emblem 'oliver'), coherente con el modelo 3D oliver_master.glb.
    id: 'blanca', name: 'Blanca', label: 'Rex Blanco', species: 'trex', emblem: 'oliver',
    blurb: 'El clásico. Equilibrado y fiable.', body: '#f6f8fa', body2: '#dde5ea', dino: '#5f9e74', dark: '#173f2a',
    ability: { id: 'rexGuard', mods: { guard: 1 } },
  },
  {
    id: 'verde', name: 'Verde', label: 'Raptor Verde', species: 'raptor',
    blurb: 'Ágil y veloz. Para los rápidos.', body: '#8fe3aa', body2: '#52bd7c', dino: '#2ea35d', dark: '#0f3d24',
    ability: { id: 'raptorDash', mods: { accelScale: 1.13 } },
  },
  {
    id: 'rosada', name: 'Rosada', label: 'Dino Rosa', species: 'parasaur',
    blurb: 'Con estilo. Rueda con elegancia.', body: '#ffb6d3', body2: '#f57bb0', dino: '#e85d99', dark: '#7a2f52',
    ability: { id: 'pinkAttract', mods: { coinMagnet: 0.7 } },
  },
  {
    id: 'amarilla', name: 'Amarilla', label: 'Tricera Amarillo', species: 'triceratops',
    blurb: 'Firme y resistente como un cuerno.', body: '#ffe487', body2: '#f5c542', dino: '#e9a200', dark: '#6e5210',
    ability: { id: 'triStability', mods: { restitutionScale: 0.55, dampingScale: 1.12 } },
  },
  {
    id: 'azul', name: 'Azul', label: 'Bronto Azul', species: 'brachio',
    blurb: 'Tranquilo y sereno. Rodada pesada.', body: '#a3ccff', body2: '#5b9bf0', dino: '#3b82d6', dark: '#163a66',
    ability: { id: 'brontoWeight', mods: { accelScale: 0.88, dampingScale: 1.16 } },
  },
];

export const DEFAULT_BALL = 'blanca';

export function getBall(id) {
  return BALLS.find((b) => b.id === id) || BALLS[0];
}

export function getAbility(ballId) {
  return getBall(ballId).ability;
}
