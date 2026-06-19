// dinos.js — Perfiles de las especies de dinosaurio. Metadatos compartidos por el
// emblema 2D (scene/dinoArt.js) y el modelo 3D de celebración (scene/CelebrationDino.js).
//
// anim: estilo de celebración asociado a cada especie.
//   roar   → salto + cabezazo (T-Rex)
//   spin   → rebote rápido + giro veloz (Velociraptor)
//   dance  → balanceo + giro (Parasaurio)
//   charge → mini embestida adelante/atrás + cabeza (Triceratops)
//   neck   → mecer el cuello arriba/abajo (Braquiosaurio)

export const DINOS = {
  trex:        { name: 'T-Rex',          anim: 'roar' },
  raptor:      { name: 'Velociraptor',   anim: 'spin' },
  parasaur:    { name: 'Parasaurio',     anim: 'dance' },
  triceratops: { name: 'Triceratops',    anim: 'charge' },
  brachio:     { name: 'Braquiosaurio',  anim: 'neck' },
};

export function getDino(id) {
  return DINOS[id] || DINOS.trex;
}
