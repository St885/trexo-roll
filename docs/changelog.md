# Changelog — TREXoRoll

Formato basado en *Keep a Changelog*. Versionado semántico.

## [0.3.1] — 2026-06-19 — Una especie de dino por bola

### Corregido
- **Cada bola es ahora una especie de dinosaurio DISTINTA** (no el mismo dino
  recoloreado): Blanca→**T-Rex**, Verde→**Velociraptor**, Rosada→**Parasaurio**,
  Amarilla→**Triceratops**, Azul→**Braquiosaurio**.
- **La criatura de victoria ya se lee claramente como dinosaurio** (antes parecía un
  patito): modelos 3D rehechos con rasgos inequívocos — T-Rex (cabezón con mandíbula y
  dientes, brazos diminutos), raptor (esbelto, cola larga), parasaurio (cresta tubular,
  pico), triceratops (gola + 3 cuernos), braquiosaurio (cuello larguísimo).
- La celebración instancia **el dinosaurio correcto según la bola elegida**.

### Añadido
- **Emblema de bola por especie**: silueta de perfil del dinosaurio (`scene/dinoArt.js`),
  claramente diferente entre bolas.
- **Animación de celebración por especie**: T-Rex cabezazo/rugido, raptor giro veloz,
  parasaurio baile, triceratops mini-embestida, braquiosaurio mecer el cuello.
- Arquitectura `data/dinos.js` (perfiles) + `data/balls.js` (mapeo bola→especie).
- Las tarjetas de selección y la preparación muestran el **nombre del dinosaurio**.

### Notas
- (Nota: la `version` del `package.json` no se había subido en 0.3.0; queda en 0.3.1.)

## [0.3.0] — 2026-06-19 — Bolas, mundos y celebración

### Añadido
- **Selección de bola**: 5 bolas (Blanca, Verde, Rosada, Amarilla, Azul), cada una con
  **cara de dinosaurio** procedural propia. Pantalla de selección, cambio rápido desde
  preparación, y **persistencia** en `localStorage`. Preview en menú, preparación y HUD.
- **Efecto especial de victoria**: el **dinosaurio de la bola elegida sale del hoyo,
  salta y baila** (mueve brazos y cola) con **confeti** y **rugido** procedural. El color
  del dino corresponde a la bola elegida.
- **Fondos jurásicos por bioma** (8 ambientaciones: valle, bosque, volcán, pantano,
  meseta, ruinas, isla, huevos): cielo en degradado + siluetas de horizonte (montañas,
  volcán con lava, palmeras, mesetas, columnas), color de suelo y niebla por bioma.
  Todo pintado por código (Canvas 2D), ligero.
- **10 niveles nuevos** (16–25) → **25 niveles** en total, con dificultad creciente:
  Valle de las Huellas, Pantano del Raptor, Cañón de Huesos, Cúpula Volcánica,
  Sendero del Triceratops, Isla del Huevo Dorado, Laberinto del Carnotauro,
  Fósiles Perdidos, Ruinas del T-Rex y Gran Final Jurásico.
- **HUD**: mini-icono de la bola elegida; animación "pop" en puntuación/estrellas.
- **Persistencia** ampliada: bola elegida y último nivel alcanzado.

### Mejorado
- Render con **tone mapping** y luces (de v0.2.0) ahora sobre mundos temáticos:
  cada bioma se siente como una región distinta.
- Smoke-test de dibujo/3D (`npm run test:visual`) que ejerce caras de bola, biomas y
  dino de celebración sin navegador.

### Notas
- Sigue sin dependencias externas en runtime ni assets con copyright.
- Pendiente: verificación visual y de sensación en navegador.

## [0.2.0] — 2026-06-19 — Iteración profesional

### Añadido
- **15 niveles** (antes 5): + Doble Recodo (L), Puente Colgante, Cruce, Serpiente,
  Foso Doble, Anillo, Diamante, Embudo, Laberinto II y Cima Final, con curva de
  dificultad (Fácil → Experto) y formas/uniones nuevas.
- **Validador de niveles** automático (`tools/level-validator.mjs`, en `npm test`):
  comprueba que ningún nivel sea imposible (BFS de start→meta evitando muros/trampas).
- **Sistema de estrellas** (1–3 por nivel) según vidas perdidas y tiempo vs. par;
  total de estrellas y **mejores tiempos** por nivel persistidos.
- **Récord**: feedback "¡Nuevo récord!" + sonido al batir la mejor puntuación.
- **Pausa** (botón ⏸ / tecla P / Esc) con Continuar, Reiniciar nivel y Menú.
- **Cronómetro** en el HUD; **indicador de inclinación** (ayuda táctil en móvil).
- **Feedback**: flash de pantalla (rojo al fallar, dorado al ganar), sacudida de cámara,
  sonidos de inicio y récord.

### Mejorado
- **Game feel**: gravedad, fricción ("peso"), suavizado de inclinación y rebote
  reajustados; **margen de perdón** al teetear en el borde antes de caer (`FALL_GRACE`).
- **Visual 3D**: tone mapping ACES + exposición, sombras 2048 + normalBias, luz de
  relleno fría (rim), y **sombra de contacto** bajo la bola. Viñeta cinematográfica.
- **UI**: transiciones de pantalla, chip de dificultad, marca consistente, panel de
  victoria con estrellas/tiempo/récord, selector de niveles con estrellas.

### Notas
- Sigue sin dependencias externas en runtime ni assets con copyright.
- Pendiente: verificación visual y de sensación de control en navegador.

## [0.1.0] — 2026-06-19 — MVP inicial

### Añadido
- Núcleo de física propia: gravedad por inclinación, integración con paso fijo,
  fricción, límite de velocidad, rebote círculo-vs-AABB, caída y detección de hoyos.
- Huella de tablero data-driven: formas `rect`, `circle` y `poly` (unión).
- Capa 3D con Three.js r160 (vendorizado): renderer con sombras, cámara con encuadre
  automático, cielo, niebla, suelo e iluminación.
- Bola blanca con emblema de T-Rex (procedural) y giro de rodadura.
- Tablero con superficie, muros, hoyo objetivo (anillo verde pulsante), hoyos trampa
  (anillo rojo) y decoración jurásica original (rocas, huevos, helechos, fósiles, huellas).
- 5 niveles: Valle Inicial, Sendero Largo, Cresta Triangular, Cráter Circular,
  Laberinto Jurásico.
- Bucle de juego: 3 vidas, reinicio de bola, puntuación (base + vidas + tiempo),
  progresión con desbloqueo persistente.
- 8 pantallas: landing, menú, niveles, cómo jugar, preparación, juego, victoria, game over.
- Controles desktop (flechas/WASD + arrastre) y móvil (arrastre táctil); UI responsive.
- Audio sintetizado (Web Audio API) silenciable.
- Smoke-test de física en Node (`npm test`).

### Notas
- Sin dependencias externas en runtime (Three.js en `libs/`).
- Pendiente de verificación manual en navegador (visual y sensación de control).
