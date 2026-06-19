# Changelog — TREXoRoll

Formato basado en *Keep a Changelog*. Versionado semántico.

## [0.8.0] — 2026-06-19 — Recompensas: monedas, estrellas-token y Tienda de Canje

### Añadido — recompensas en el tablero
- **Monedas** (`🪙 +100`) colocadas de forma **procedural y determinista** en cada nivel,
  validadas contra huella/hoyos/trampas/inicio (nunca bloquean ni hacen imposible el nivel).
  Dificultad creciente: iniciales fáciles, medios en rutas secundarias, avanzados cerca de
  zonas de riesgo. Monedas 3D doradas que giran y flotan; **VFX "pop"** + sonido al recoger.
- **Estrella especial** (`⭐ +500`) **cada 2 niveles** (2, 4, 6…): suma puntos y **+1
  estrella-token**, con efecto y sonido más vistosos. Se guarda en `localStorage` al recogerla.
- **HUD**: chip de **monedas** del nivel (con animación al sumar).

### Añadido — inventario y Tienda de Canje
- **Inventario** persistente (`localStorage`): `starTokens`, `extraLives`, `trapBlocks`,
  `fallShields`. *(Las estrellas-token son distintas de las ★ de valoración por nivel.)*
- **Tienda de Canje** (menú → 🛒 Canje): muestra estrellas disponibles, las 3 recompensas
  con coste y cantidad poseída, botón de compra y feedback (éxito / faltan estrellas).

### Añadido — 3 potenciadores
- **Vida extra** (2★): si llegas a 0 vidas, se **consume automáticamente** y recuperas 1.
- **Bloqueo de trampa** (3★): se activa en preparación; **tapa la trampa más peligrosa**
  (la más cercana a la línea inicio→meta) — se ve gris/apagada y deja de contar.
- **Escudo de caída** (4★): si caes del tablero, **un pterosaurio te rescata** (animación) y
  te deja en zona segura; se consume. Mensaje "¡Rescate jurásico!".
- Activación por nivel desde **preparación** (toggles que aparecen solo si tienes stock).

### Validado
- `npm test` ampliado con **colocación de coleccionables** (105 monedas y 12 estrellas en
  los 25 niveles: válidas, deterministas, estrella en pares). `test:visual` cubre los modelos
  3D (moneda/estrella/ptero/tapa). `test:graph` incluye los módulos nuevos. Cross-check de
  IDs (48) y CSS: verde. **Controles móviles y música intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.7.1] — 2026-06-19 — Música de fondo desde archivo (pista de aventura)

### Cambiado — música de fondo
- La música ahora es una **pista de archivo**: `assets/audio/trexo-roll-adventure-bg.mp3`
  (copiada con permiso desde `04_recursos_compartidos/musica-de-fondo/aventura/`
  `nastelbom-adventure-471461(trexob).mp3`; original intacto). MP3 válido, 4.6 MB.
- `music.js` reescrito para reproducir el archivo con `HTMLAudioElement`:
  **bucle**, **volumen moderado** (0.4), **instancia única** (no se duplica al cambiar de
  pantalla), **autoplay-safe** (suena tras pulsar "Entrar"; reintenta en el siguiente gesto
  si el navegador lo bloquea). Silenciable desde el botón de sonido del **menú** y la **pausa**.
- La implementación **procedural anterior** se conserva como respaldo en
  `src/effects/music-procedural.js.bak` (no se borró nada).
- Ruta **relativa** (`assets/audio/…`) → funciona en local y en GitHub Pages (`/trexo-roll/`).

### Notas
- Sin dependencias nuevas. Los ajustes visuales de v0.7.0 (tablero más grande/elevado,
  fondo jungla) siguen aplicados. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.7.0] — 2026-06-19 — Tablero protagonista: más grande, elevado, jungla y nueva música

### Tablero más grande (sin recortes)
- **Encuadre simplificado y correcto** (`SceneManager._frame`): como la rotación conserva
  la distancia al pivote, una **esfera de radio `flat`** (diagonal del tablero + banda de
  decoración) lo contiene COMPLETO a cualquier inclinación. Se eliminó el término extra de
  "balanceo" (sobre-conservador) y se redujeron los márgenes → la cámara se **acerca** y el
  tablero ocupa bastante más viewport, **sin reintroducir recortes de esquinas/objetos**.

### Tablero elevado (no hundido)
- **Grosor real** del tablero (THICKNESS 0.5 → 1.4) con **cantos oscuros** (material por
  cara en cajas y cilindros) → parece una **plataforma con cuerpo**, no una lámina.
- **Suelo más abajo** (−3.2 → −4.2) y **sombra grande proyectada** bajo el tablero → lo
  ancla y separa del fondo; el tablero "flota" como plataforma, deja de verse hundido.

### Fondo de jungla
- **Capas de profundidad** en el cielo de cada bioma: **bruma atmosférica** sobre el
  horizonte + **canopy de jungla** (copas frondosas en 2 capas, color del bioma) sobre las
  siluetas existentes → sensación de selva con profundidad en todos los mundos.
- **Niebla 3D más lejana** (near 42→80): el tablero y la decoración cercana quedan
  **nítidos** y solo se difumina el suelo/horizonte (antes la niebla "empañaba" el tablero).

### Música nueva (mejor que la anterior)
- `music.js` rehecho: **música generativa** con progresión **I–V–vi–IV** (Do–Sol–Lam–Fa),
  pad cálido + bajo + **melodía pentatónica que varía** (silencios y saltos de octava → no
  suena "en bucle") y **eco** corto para dar espacio. Épico-suave, amigable. Volumen
  moderado, **autoplay-safe**, silenciable desde menú y pausa.
- **Cómo cambiar a una pista de archivo** (CC0/libre): documentado en la cabecera de
  `music.js` (copiar mp3 a `assets/music/` y usar un `HTMLAudioElement`).

### Validado
- `npm test`, `test:graph` (incl. `music.js`), `test:visual` **ampliado** (construye los
  **25 tableros** con la geometría nueva + `makeGroundTexture`/canopy en 8 biomas): verde.
  **Controles móviles y de escritorio intactos** (sin tocar `InputController`).

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.6.0] — 2026-06-19 — Mapa: cámara robusta, fondo jurásico y música

### Corregido — objetos y esquinas desaparecían al inclinar el tablero
- **Causa raíz:** el encuadre de cámara se calculaba para el tablero **plano** y demasiado
  ajustado: usaba el lado mayor (no la **diagonal** real de las esquinas) y no tenía en
  cuenta el **balanceo** que la inclinación provoca; además la decoración (hija del grupo
  del tablero) quedaba en el borde del frame y, al rotar, se salía. Algunos objetos podían
  además **culearse** por una esfera de recorte desfasada al girar.
- **Solución:**
  - **Encuadre robusto** (`SceneManager._frame`): el radio a encuadrar cubre la **diagonal**
    del tablero, la **banda de decoración** y el **balanceo por inclinación máxima**; encaje
    por esfera (`sin`) en lugar de plano (`tan`). Resultado: el tablero entra completo aun
    inclinado, en vertical y horizontal.
  - **`frustumCulled = false`** en todo lo que cuelga del tablero (superficie, paredes,
    hoyos, anillos, decoración, banner) y en el dino de celebración + confeti → nada
    "desaparece" por culling al rotar.
  - **Volumen de sombra ampliado** (±34, far 100) y `far` de cámara a 260: las sombras no se
    cortan al inclinar.

### Mejorado — fondo y escenario
- **Suelo jurásico trabajado** (`makeGroundTexture`): reemplaza el verde plano por tierra
  del bioma con vetas, matas de follaje y piedrecitas; tinte por bioma. Más vivo sin
  distraer (la niebla + viñeta enfocan el tablero). Se mantiene HUD legible.
- **Decoración por bioma**: mezcla de props según el mundo (volcán=rocas, pantano/isla=
  helechos, huevos=nidos, ruinas=fósiles…), en una banda controlada (no invade el área
  jugable ni se corta) con leve jitter para que no se vea "en rejilla".

### Añadido — música de fondo
- **`music.js`**: música procedural (Web Audio) estilo aventura jurásica — pad grave suave +
  melodía pentatónica amable en bucle. **Sin archivos ni copyright.** Volumen moderado.
  **Autoplay-safe**: arranca tras el primer gesto (pulsar "Entrar"). Silenciable desde el
  botón de sonido del **menú** y del **menú de pausa** (etiquetas sincronizadas).

### Validado
- `npm test` (física + 25 niveles + **controles móviles**), `test:graph` (incl. `music.js`),
  `test:visual` (incl. `makeGroundTexture` en los 8 biomas), cross-check de IDs y CSS: verde.
  **Controles móviles y de escritorio intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.5.0] — 2026-06-19 — Pase de pulido visual y UX (todas las pantallas)

Iteración de polish sobre **todas** las pantallas, mobile-first y coherente, **sin tocar
la lógica de los controles táctiles** (D-pad/joystick siguen validados por `npm test`).

### Añadido
- **Sistema de diseño**: tokens de color jurásicos ampliados, sombras en capas, jerarquía
  tipográfica, filo dorado en paneles y **animaciones de entrada** de pantalla/panel.
- **Landing** rediseñada: etiqueta de marca, bola 🦖 con rebote, fondo con decoración
  jurásica flotante (hojas/huesos/huevos), CTA claro ("Entrar a la aventura").
- **Menú**: **barra de progreso** (estrellas totales + nivel desbloqueado) y botón
  **"⏩ Continuar"** (aparece solo si hay progreso; retoma el último nivel jugado).
- **Selección de dino**: nombres de personaje (**Rex Blanco, Raptor Verde, Dino Rosa,
  Tricera Amarillo, Bronto Azul**), tarjetas con check de selección y mejor contraste.
- **Selector de niveles**: franja de color por dificultad (Fácil/Media/Difícil/Experto).
- **Victoria**: emoji 🏆, **destellos** cayendo, y botón **"↻ Repetir nivel"**.
- **Game Over**: emoji, mensaje motivador y **nivel alcanzado**.
- **Pausa**: mini-resumen (vidas + puntos).
- **Cómo jugar**: ítems en tarjetas legibles; controles móviles explicados (D-pad/joystick).

### Mejorado
- Botones (variantes primary/amber/ghost), paneles, sombras, contraste y espaciados.
- HUD: chips más legibles y mejor distribución; respeto de *safe areas* en ambos lados.
- Responsive: revisados vertical/horizontal/tablet/desktop; compactaciones en paisaje bajo;
  decoración desactivada donde estorbaba; `prefers-reduced-motion` respetado.

### Calidad
- Limpieza de CSS sin uso (`.decor-line`).
- Cross-check de IDs DOM: los 41 IDs referenciados por JS existen en `index.html`
  (se detectó y corrigió la pérdida accidental de `over-record`).

### Validado
- `npm test` (física + 25 niveles + pipeline de control), `test:graph`, `test:visual`,
  balance de CSS y cross-check de IDs: todo en verde. **Controles móviles intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.4.2] — 2026-06-19 — Control móvil definitivo: D-pad robusto

### Corregido (el D-pad "dejaba de responder" al jugar en móvil real)
- **Causa raíz:** el **arrastre sobre el lienzo** tenía prioridad sobre el D-pad. En
  cuanto el dedo (o la palma) rozaba el tablero, el arrastre tomaba el control y el
  D-pad quedaba anulado → sensación de "los controles no funcionan".
- **Solución:**
  - **Nueva prioridad** `joystick > D-pad/teclas > arrastre`. El D-pad pulsado **siempre**
    manda sobre un arrastre accidental, y pulsarlo **cancela** cualquier arrastre activo.
  - **Arrastre del lienzo desactivado en dispositivos táctiles** (era el origen del
    conflicto): en móvil el control es el **D-pad** + **joystick**; el arrastre con ratón
    se mantiene en desktop.

### Mejorado
- **D-pad principal**, grande (168px) y de **alto contraste** (verde al pulsar), siempre
  visible; **diagonales** pulsando dos botones (multitouch). Joystick analógico queda como
  **complemento** secundario (un poco más pequeño y discreto).
- **Reset robusto del input**: al perder el foco (`blur`) o cambiar de pestaña
  (`visibilitychange`) se sueltan todas las direcciones → ninguna tecla se queda "pegada".
- API de control clara: `pressDirection`, `releaseDirection`, `resetTouchControls`,
  `getTiltInput`.
- "Cómo jugar" y la pista en partida actualizadas (D-pad como control móvil principal).

### Validado
- `npm test` ampliado: además de joystick/D-pad, ahora cubre **diagonales**, **prioridad
  D-pad > arrastre** y **reset sin teclas pegadas**. Todo en verde.

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.4.1] — 2026-06-19 — Controles móviles funcionales

### Corregido (el control táctil no inclinaba el tablero)
- **Causa raíz:** el lienzo y contenedores no tenían `touch-action: none`, así que el
  navegador interpretaba el gesto como scroll y **cancelaba el puntero**; además el
  joystick escuchaba `pointermove` en `window` y **sin `preventDefault`**.
- **Solución (patrón de legendary-adventures):** cada control escucha **sus propios**
  eventos de puntero con `setPointerCapture` + `{ passive: false }` + `preventDefault`;
  `touch-action: none` en `#game-canvas`, su `<canvas>`, `#ui` y `.screen`.

### Añadido
- **D-pad** de 4 botones (abajo-izquierda) como control robusto que alimenta el sistema
  de teclas — funciona aunque el joystick no responda perfecto. Joystick analógico
  reubicado abajo-derecha (pulgar derecho).
- Controles táctiles **solo en dispositivos táctiles** (`body.is-touch`); desktop queda limpio.
- **Botón “⛶ Pantalla completa”** en el menú y **metas PWA** (`apple-mobile-web-app-capable`,
  `mobile-web-app-capable`, `status-bar-style`) para mejor experiencia en móvil.
- Smoke-test del pipeline de control (`tools/input-smoke.mjs`, en `npm test`): valida que
  joystick y D-pad **modifican la inclinación** y resetean al soltar.

### Mejorado
- **Cámara móvil vertical:** menos margen → **tablero más grande**, y un leve desplazamiento
  para dejar sitio a los controles de abajo.

## [0.4.0] — 2026-06-19 — Mobile & responsive

### Añadido
- **Joystick táctil virtual** como control móvil principal: inclina en 8 direcciones,
  vuelve suave al centro al soltar, indicador visual activo. Convive con arrastre
  (ratón/táctil) y teclado; prioridad joystick > arrastre > teclado. El knob refleja
  siempre la inclinación actual.
- **Sensibilidad separada** móvil vs. desktop para el arrastre (`PHYS.DRAG_FULL_PX_*`).
- **Pista contextual** al iniciar nivel (“Arrastra el joystick…” en táctil) que se desvanece.
- Manejo de **`orientationchange`** además de `resize` (cámara y joystick se reajustan).

### Mejorado
- **HUD responsive**: chips compactos en pantallas estrechas, botón de pausa con área
  táctil ≥44px, joystick reubicado a un lado en paisaje (alcance del pulgar).
- **Canvas/cámara**: más margen de encuadre en vertical (tablero completo + aire para el joystick).
- **Pantallas**: objetivos táctiles grandes (`pointer: coarse`), grids más compactas en móvil,
  paneles compactos en paisaje bajo.
- **Anti-fricción táctil**: `touch-action: none`, `overscroll-behavior: none`,
  `-webkit-touch-callout: none`, sin zoom por doble toque; respeto de *safe areas* (notch).

### Notas
- Controles desktop (flechas/WASD + arrastre con ratón) intactos.
- Sin dependencias nuevas; sin push/deploy (pendiente de confirmación de Stefano).

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
