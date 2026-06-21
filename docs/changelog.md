# Changelog — TREXoRoll

Formato basado en *Keep a Changelog*. Versionado semántico.

## [0.15.2] — 2026-06-21 — Triceratops v2: más detalle, volumen y anatomía (3 monedas)

> Segunda pasada de calidad sobre la familia Triceratops. **Comportamiento intacto**
> (aparece al recoger 3 monedas, camina por abajo y se va). **Sin desplegar.**

### Cambiado
- **Familia Triceratops mucho más trabajada** (overlay SVG, mismo activador y capa):
  - **Volumen y sombreado**: luz superior en el lomo (`tri-hi`), sombra de oclusión en
    vientre y mejilla (`tri-ao`), vientre crema y gradiente de cuerpo más vivo (4 paradas).
  - **Cabeza/anatomía**: hocico con **pico** y **línea de boca**, **ojo con anillo** cálido
    (mirada amable), mejor silueta de cráneo.
  - **3 cuernos sólidos**: 2 frontales gruesos + 1 **trasero sombreado** (`tri-horn-bk`)
    para dar profundidad, mejor colocados; **cuerno nasal** claro.
  - **Gola ancha y reconocible**: interior más claro (`tri-frill-in`), **nervios**
    radiales (`tri-frill-lines`) y **epoccipitales** de marfil en el borde.
  - **Cuerpo robusto y bajo** con **4 patas gruesas** (columnares, traseras sombreadas)
    y dedos; **cola** proporcionada.
  - **Bebés** rehechos con la misma anatomía (4 patas, cola, gola, 3 cuernos incipientes,
    ojo con anillo): claramente la misma especie, más coherentes y tiernos.
- **Animación**: caminata de **4 patas en diagonal** con **bote de peso** (ligera rotación),
  vaivén de cabeza/cola y **meneo** desfasado de los bebés.
- **Composición**: lienzo más amplio (viewBox 460×185) y grupo algo mayor
  (`clamp(84px, 15vh, 152px)`) para más presencia; sigue por debajo del HUD/controles.

### Validado
- `npm test` (SVG Triceratops bien formado + 2 bebés + partes), `test:graph`, `test:visual`,
  llaves CSS (469/469), sin huérfanos y smoke de servidor: **verde**. Activación por 3
  monedas, conteo, puntos, estrellas, diplodocus, pteros, portales, dino de victoria, mono,
  ptero-rescate, música, controles y responsive **intactos**.

## [0.15.1] — 2026-06-21 — Rediseño visual de la familia Triceratops (3 monedas)

> Mejora visual del evento de la familia Triceratops. **Comportamiento intacto**
> (aparece al recoger 3 monedas, camina por abajo y se va). **Sin desplegar.**

### Cambiado
- **Familia Triceratops rehecha** (overlay SVG, misma capa `#critter-layer`, mismo activador):
  - **Paleta amarillo dorado + marrón anaranjado + marfil** (gradientes de volumen),
    sustituye al verde oliváceo anterior.
  - **Adulto** más robusto: **gola trabajada** (epoccipitales de marfil en el borde +
    patrón interno), **3 cuernos** de marfil bien definidos, cabeza con **pico** y **ojo
    con brillo**, cuerpo con vientre crema y patrón dorsal, **4 patas** con profundidad
    (traseras más oscuras) y dedos, cola proporcionada.
  - **Bebés** rehechos con el mismo esquema cromático, tiernos y coherentes (cabeza/ojo
    grandes), no simplones.
- **Animación de caminata** mejorada: **4 patas en diagonal** (alternancia natural), bote
  corporal, vaivén de cabeza y cola, y **meneo (waddle)** de los bebés desfasado.
- **Más presencia**: tamaño algo mayor (`clamp(78px, 14vh, 142px)`) y un pelín más alto
  del borde; entrada/salida **totalmente fuera de pantalla** (recorrido más limpio, ~8 s).
  Sigue con `pointer-events:none` y z-index **bajo el HUD/controles** (pasa por detrás).

### Validado
- `npm test` (SVG Triceratops bien formado + 2 bebés + partes + responsive), `test:graph`,
  `test:visual`, llaves CSS (461/461) y smoke de servidor: **verde**. Activación por 3
  monedas, conteo, puntos, estrellas, diplodocus, pteros, portales, dino de victoria, mono,
  ptero-rescate, música y controles **intactos**.

## [0.15.0] — 2026-06-21 — Responsive real para celulares + familia Triceratops (3 monedas)

> Adaptación a tamaños de celular reales y nuevo evento visual. **Sin desplegar.**

### Añadido — Responsive móvil
- **Perfil de viewport en JS** (`getViewportProfile`, `isSmallPhone`, `isTallPhone`,
  `isLandscapeMobile`) que pone **clases en `<body>`** (`is-portrait`/`is-landscape`/
  `is-small-phone`/`is-tall-phone`/`is-landscape-mobile`/`is-short`) y se recalcula en
  `resize`, `orientationchange` y **`visualViewport.resize`** (barra del navegador móvil).
- **Encuadre de cámara por dispositivo** (`SceneManager.setViewportFit`): en **teléfono
  pequeño vertical** el tablero se ve **más grande** y un poco **más elevado** (sitio para
  HUD arriba y controles abajo); en **móvil horizontal** se aprovecha el ancho. El encaje
  por esfera sigue garantizando que el tablero entra completo a cualquier inclinación.
- Afinado responsive: paneles con **viewport dinámico** (`dvh`) para respetar la barra del
  navegador; HUD y controles **más compactos en teléfonos pequeños**; HUD que **no recorta
  la pausa** en horizontal. El selector de **50 niveles** ya hace scroll interno.

### Añadido — Evento Triceratops (3 monedas)
- Al recoger la **3.ª moneda** de un nivel, una **familia Triceratops** (1 adulto con gola,
  3 cuernos, cuerpo robusto, patas y cola + **2 bebés**) **camina por el borde inferior**
  y desaparece por el otro lado (~7 s, dirección alterna por nivel). Caminata animada
  (patas alternando, vaivén de cabeza/cola, bote de los bebés).
- **Una sola vez por nivel** (bandera `_triceratopsPlayed`, rearmada en cada nivel).
- Vive en la capa `#critter-layer` (`pointer-events:none`, z-index **bajo el HUD/controles**)
  → **no** cambia la física, **no** bloquea el input, **no** tapa HUD ni controles, y pasa
  **detrás** de los controles de las esquinas. Respeta `prefers-reduced-motion` y safe-area.

### Validado
- `npm test` añade checks de **Triceratops** (SVG bien formado, 2 bebés, partes) y
  **responsive** (viewport meta, `overflow:hidden`/`touch-action:none`, `critter-layer`
  sin captura de puntero). Verde junto a `test:graph`, `test:visual`, IDs (122/63),
  llaves CSS (457/457) y smoke de servidor. Economía, portales, pteros, diplodocus, dino
  de victoria, mono y ptero-rescate **intactos**.

## [0.14.1] — 2026-06-21 — Rediseño del Diplodocus (estrella)

> Mejora visual del evento del **diplodocus** que aparece al recoger una estrella.
> **Sin desplegar** (pendiente de revisión).

### Cambiado
- **Diplodocus rehecho por completo** (overlay SVG, misma capa `#critter-layer`,
  mismo activador: recoger estrella). Antes era una silueta plana sin patas ni cola.
  Ahora tiene **silueta de saurópodo** real: cuello largo elegante, **cabeza de saurópodo**
  con cara amable (ojo con brillo, fosa nasal, boca), **cuerpo robusto con volumen**
  (gradientes de sombreado), **patas columnares** (delanteras + traseras con dedos),
  **cola armoniosa** con vaivén, manchas dorsales y sombra de contacto.
- **Hoja tropical** mejorada (fronda con nervadura) en lugar del blob genérico.
- **Animación pulida y sincronizada**: entrada con asentamiento → levanta el cuello hacia
  la hoja → **dos mordiscos** mientras la hoja se encoge y desaparece → salida suave.
- Tamaño ligeramente reducido (`clamp(150px, 31vh, 280px)`) para **tapar menos el tablero**.
  Sigue con `pointer-events:none` y z-index **por debajo del HUD/controles**.

### Validado
- `npm test` ahora verifica que los **SVG de critters están bien formados** (etiquetas
  balanceadas) y que el diplodocus incluye todas sus partes. `test:graph`, `test:visual`,
  llaves CSS (405/405) y smoke de servidor: **verde**. Sin dependencias nuevas, mismo
  rendimiento (vector ligero animado por compositor). El resto del juego, intacto.

## [0.14.0] — 2026-06-21 — 50 niveles, portales naranjas y eventos jurásicos

> Gran expansión de contenido y mecánicas. **Sin desplegar** (pendiente de revisión).

### Añadido
- **25 niveles nuevos (26–50)** → **50 niveles** en total, con dificultad creciente
  (media-alta → experto/final) y mucha variedad de formas (cañones, puentes, círculos,
  hexágonos, rombos, islas, laberintos y campos de columnas).
- **5 mundos nuevos** (6–10) → **10 mundos** de 5 niveles:
  Cañón del Pterodáctilo 🦅 · Selva Perdida 🌴 · Cavernas de Ámbar 💎 ·
  Pantano de Sombras 🌑 · Corona del T-Rex 👑.
- **Mecánica de portales naranjas** (2 por nivel, enlazados): entrar en uno saca la bola
  por el otro. **No mata ni gana**; conserva la dirección (amortiguada, con mínimo de
  salida y colocación segura validada), tiene **cooldown anti-loop** (0,55 s) y **efecto
  de invocación** (vórtice naranja giratorio + aro de luz que se expande + chispas + sonido
  de teletransporte). Se resuelve **dentro de la física** (no rompe la semántica de eventos).
- **Pterodáctilos ambientales**: 2 vuelos por nivel (ida y vuelta) cruzando el cielo.
- **Diplodocus**: al recoger una **estrella**, un diplodocus se asoma desde un lateral,
  come una hoja y se va. Ambos eventos viven en una **capa overlay DOM/SVG** con
  `pointer-events:none` y **por debajo del HUD/controles** → no tapan la interfaz, no
  bloquean el input, no tocan la física y son ligeros en móvil.
- HUD ahora muestra **Nivel X/50**; selector de niveles, progresión y desbloqueos cubren
  los 50 niveles y 10 mundos automáticamente. Textos nuevos en **ES e inglés**.

### Cambiado
- `BallPhysics`: nuevo soporte de `portals` con `consumePortalFx()` (la capa visual
  lanza el efecto sin acoplar física y render).
- `level-validator`: ahora es **portal-aware** (modela el teletransporte en la BFS de
  solvencia, así los niveles de islas requieren portal y aun así se validan) y comprueba
  que 26–50 tengan exactamente 2 portales bien colocados.
- **Economía intacta**: monedas = 1 punto, estrellas acumulables para canje, tienda y
  potenciadores sin cambios. Los coleccionables nunca se colocan sobre un portal.

### Validado
- `npm test` ahora incluye **test de física de portales** (entra→sale por el hermano, no
  mata/gana, salida controlada, sin ping-pong) y **events-smoke** (critters no-op sin DOM,
  tiempos de vuelo, 2 portales en 26–50 / 0 en 1–25, 50 niveles). Todo **verde**, junto a
  `test:graph`, `test:visual` (construye los 50 tableros), cross-check de IDs (122/63),
  llaves CSS balanceadas y smoke de servidor.

### Notas
- Sin dependencias nuevas. CSP intacta (todo mismo origen). **Sin push/deploy.**

## [0.13.0] — 2026-06-21 — Juego completo: Ajustes, Créditos, PWA y cierre de campaña

> Revisión integral de **todas las pantallas** para dejar el juego "terminado".
> **Sin desplegar** (pendiente de revisión de Stefano).

### Añadido
- **Pantalla de Ajustes** (⚙️, accesible desde el menú) con:
  - **Música** y **Efectos** como interruptores **independientes** (antes era un único
    silencio global). Se **persisten** en `localStorage` y se aplican al instante.
  - **Reiniciar progreso** con **diálogo de confirmación** (borra estrellas, niveles,
    récords e inventario; conserva idioma, ajustes de audio y dino elegido).
  - Acceso a **Créditos**.
- **Pantalla de Créditos** (autoría, tecnología, "100% procedural y original").
- **Mensaje de campaña completada**: al superar el **nivel 25**, la pantalla de victoria
  muestra ⭐ totales / máximo y la mejor puntuación ("¡Has completado los 25 niveles!").
- **Instalable como app (PWA)**: `manifest.webmanifest` + **favicon SVG original**
  (`assets/icon.svg`, arte jurásico vectorial) enlazados en `index.html`.
- Textos nuevos en **ES e inglés** (paridad i18n completa).

### Cambiado
- **Audio** refactorizado: `this.muted` global → `sfxOn`/`musicOn` separados; nuevos
  métodos `_applyAudio` / `_toggleMusic` / `_toggleSfx` / `_toggleMasterSound`. El botón
  de sonido en **Pausa** ahora es un **silencio maestro** (apaga/enciende todo).
- El botón **🛒 Canje** del menú ahora se traduce (faltaba `data-i18n`).

### Validado
- `npm test` (física · 25 niveles · controles · coleccionables · imports · **i18n ES/EN**),
  `test:graph`, `test:visual`: **verde**. Cross-check de **IDs DOM** (121 en HTML / 62 en JS):
  todos existen. Llaves CSS balanceadas (342/342). `manifest` JSON e `icon.svg` válidos.
  Smoke de servidor: index/manifest/icono/CSS/JS sirven con MIME correcto.

### Notas
- Sin dependencias nuevas. CSP intacta (todo mismo origen). **Sin push/deploy.**
- Limitación menor conocida: iOS no usa SVG para `apple-touch-icon` (se podría añadir un
  PNG si se quiere icono perfecto al "Añadir a pantalla de inicio" en iPhone).

## [0.12.1] — 2026-06-21 — Revisión y endurecimiento de seguridad

### Auditoría (sin hallazgos críticos)
- Juego **100% cliente, sin backend, sin login, sin PII, sin pagos reales, sin red**.
  Escaneo: **sin** `eval`/`Function`/`document.write`, **sin** llamadas de red, **sin** URLs
  externas (Three.js vendorizado), **sin** entradas de usuario (→ sin vector de XSS),
  **sin** secretos. Los `innerHTML` solo interpolan contenido propio/números saneados.
  `localStorage` se **sanea** al leer (tipos/Number; idioma validado a es/en).

### Endurecido
- **Content-Security-Policy** (meta): `default-src 'self'`; bloquea scripts/recursos
  externos, **conexiones salientes (exfiltración)**, objetos/plugins, `<base>`, formularios
  e **iframes** (`frame-ancestors 'none'`). `'unsafe-inline'` se mantiene solo para el
  `<importmap>` y los `style=""` (sin impacto: no hay XSS posible).
- **`<meta name="referrer" content="no-referrer">`**.
- Documentación completa en **`docs/seguridad.md`** (modelo de amenazas, hallazgos, riesgos
  residuales y requisitos para el futuro si se añade backend/monetización real).

### Validado
- `npm test`, `test:graph`: verde. CSP diseñada para **no romper** el juego (todo es mismo
  origen + inline permitido); servidor local OK.

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.12.0] — 2026-06-21 — Selector de idioma (Español / Inglés)

### Añadido
- **Sistema de i18n** (`src/utils/i18n.js`): por defecto **Español**; el jugador puede
  cambiar a **Inglés** desde un **selector en el menú** y **todo el juego** se traduce.
  El idioma se **guarda en `localStorage`** (`getLang/setLang`).
- **Cobertura completa**: textos estáticos (vía `data-i18n` / `data-i18n-html`) y dinámicos
  (vía `t()/tf()`): menús, cómo jugar, preparación, HUD, pausa, tienda/canje, victoria,
  pantalla "sin vidas" + monetización, vídeo y packs, mensajes/toasts, y **contenido**
  (25 niveles: nombre + pista, 5 mundos, 5 bolas: nombre/etiqueta/personalidad, especies de
  dino, dificultades, ítems de tienda) y las frases del **mono burlón**.
- Cambio de idioma **en caliente**: re-traduce el DOM (`applyTranslations`) y refresca lo
  dinámico de la pantalla activa sin recargar.

### Arquitectura
- Para el **contenido**, EN usa el diccionario y **ES cae al texto original** de los datos
  (`t(key, fallback)`), evitando duplicar el español. La **UI** tiene ES+EN en el diccionario.
- Nuevo check `tools/i18n-check.mjs` (en `npm test`): valida que cada clave `data-i18n`
  exista como cadena en ES y EN, y la **paridad** ES→EN.

### Validado
- `npm test` (física + niveles + control + coleccionables + imports + **i18n**), `test:graph`
  (incl. `i18n.js`), `test:visual`, cross-check de IDs (60) y CSS: verde. Prueba funcional de
  cambio ES↔EN correcta. **Controles, música, tienda, progresión e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.11.3] — 2026-06-20 — Imagen jurásica también de fondo en el GAMEPLAY

### Cambiado — fondo de la pantalla de juego
- Ahora el **paisaje jurásico** (`jurassic-world-bg.png`) se ve **durante la partida**,
  detrás del tablero 3D (antes se veía el cielo procedural + suelo verde plano).
- **Cómo (Opción A — fondo CSS detrás del lienzo):**
  - Renderer Three.js **transparente** (`alpha: true` + `setClearColor(…, 0)`).
  - `scene.background = null` (la escena ya no pinta cielo propio).
  - Se **retira el plano de suelo verde** dominante (era lo que tapaba el fondo); el
    tablero queda como **plataforma flotante** sobre el paisaje, anclado por su
    **sombra** proyectada (blob suave) y la sombra de contacto de la bola.
  - La imagen se aplica como `background-image` de `#game-canvas` (cover/center/no-repeat)
    con un **overlay suave** (más claro que en menús) para que el paisaje luzca sin restar
    legibilidad al tablero; la **viñeta** existente refuerza el foco central.
- `applyTheme()` ahora solo ajusta la **niebla** por bioma (ya no pinta cielo ni suelo 3D).

### Notas
- El tablero sigue recibiendo la **sombra real** de la bola en su superficie.
- Se mantiene el mismo asset que en menús → coherencia visual y **una sola descarga**
  (cacheada). Sigue pendiente optimizar el PNG (~2,1 MB → WebP/JPG) en una pasada de
  rendimiento. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.11.2] — 2026-06-20 — Imagen de fondo jurásica en menús

### Añadido
- **Imagen de fondo** `assets/images/backgrounds/jurassic-world-bg.png` (1672×941) aplicada
  a las **pantallas de menú/overlay**: landing, menú, selección de bola, canje, niveles,
  cómo jugar, preparación, victoria, game over, vídeo y packs de vidas.
- Integración **mobile-first**: `cover` (sin deformar) + `center` + `no-repeat`, con
  **overlay oscuro** (gradiente 0.5→0.84) para mantener legibilidad de textos/botones, y
  **color de fallback** si la imagen no cargara. Ruta **centralizada** en la variable CSS
  `--bg-jurassic`.

### Decisión de diseño
- El **gameplay** (`#screen-game`) **no** usa la imagen: conserva su **cielo 3D por bioma**
  (la imagen quedaría oculta tras el lienzo WebGL y restaría claridad al tablero). El menú
  de **pausa** mantiene su fondo translúcido para ver el tablero detrás.

### Nota
- La imagen pesa **~2,1 MB (PNG)**; candidata a optimizar (WebP/JPG ~300–500 KB) en una
  pasada futura de rendimiento. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.11.1] — 2026-06-20 — Fix crítico: la victoria se congelaba

### Corregido
- **Causa raíz:** en v0.11.0 se añadió un *aura de victoria* en `SceneManager.spawnCelebration`
  usando `makeGlowTexture`, pero **no se importó** esa función en `SceneManager.js`. Al ganar,
  `spawnCelebration` lanzaba `ReferenceError: makeGlowTexture is not defined` → la excepción
  **mataba el bucle `requestAnimationFrame`** → el juego se quedaba congelado, sin dino de
  celebración ni pantalla de victoria. (La derrota no usa esa función → el mono seguía bien.)
  Los smoke-tests no lo detectaban porque no instancian WebGL/celebración.
- **Solución:** importar `makeGlowTexture` en `SceneManager.js`.
- **Blindaje (tolerancia a fallos):**
  - `Game._startCelebration` envuelve la celebración en `try/catch`: aunque el visual falle,
    el estado pasa a `celebrating` y se llega a la pantalla de victoria igualmente.
  - `Game._loop` envuelve el frame en `try/catch`: un error puntual **ya no detiene** el
    render loop (se registra y continúa).
- **Regresión:** nuevo `tools/imports-check.mjs` (en `npm test`) verifica que toda función
  de `textures.js` **usada** en un módulo esté **importada** → caza esta clase de error.

### Verificado
- Flujo de victoria: meta → física controlada → celebración → overlay → recompensas →
  desbloqueo → continuar. `npm test` (con imports-check), `test:graph`, `test:visual`: verde.
  **Mono de derrota, controles, música, tienda y progresión intactos.**

## [0.11.0] — 2026-06-20 — Economía, mono burlón, dino de victoria y monetización mobile

Iteración (5 ciclos internos) con foco **mobile-first**. Sin romper controles, música,
tienda/canje, progresión ni inventario.

### Economía (monedas = 1 punto · estrellas acumulables)
- **Moneda: 100 → 1 punto.** Deja de inflar la puntuación.
- **Estrella: ya no da puntos**; suma **+1 estrella de canje** (recurso acumulable para la
  tienda). HUD y mensajes clarificados ("⭐ +1 de canje" vs "Puntos"). Ver `docs/economia.md`.
- Costes de tienda revisados (2/3/4 ⭐) — equilibrados con ~12 ⭐ por recorrido; sin cambios.

### Dino de victoria (más impacto)
- **Emergencia con impacto**: overshoot al salir del hoyo, **polvo** al emerger, **primer
  salto más alto** y **aura de victoria** brillante bajo el dino (late y se desvanece).
- (Sobre las mejoras de v0.10.0: ojos con brillo, garras, cejas, fosas, materiales.)

### Mono prehistórico burlón (al fallar)
- Nuevo `src/effects/tauntMonkey.js`: al caer en **trampa** o salirte del tablero **sin
  escudo**, aparece un instante un **simio primitivo** (dibujado en Canvas 2D) que se ríe
  y se burla (bocadillo + meneo), con **risita** sintetizada, y desaparece solo (~1,5 s).
  Es un overlay ligero: **no bloquea** el juego ni la pérdida de vida.

### Monetización mobile (MVP conceptual, flujos SIMULADOS)
- **Pantalla "¡Sin vidas!"** con opciones para seguir jugando:
  **📺 Ver vídeo (+3 vidas)**, **🛒 Comprar vidas**, **⏩ Continuar (banco)**, Reintentar, Menú.
- **Vídeo recompensado** placeholder (`screen-adview`): cuenta atrás → concede vidas →
  continúa. Etiquetado "simulación · sin anuncios reales" (con opción Saltar).
- **Tienda de packs de vidas** (`screen-lifepacks`): 5/15/50 con precios de muestra; compra
  **simulada** que llena el **banco de vidas** (`localStorage.livesBank`).
- Documentación completa en **`docs/monetizacion.md`** (modelo, arquitectura, integración
  futura de ads/IAP y otras vías: cosméticos, retención/diario, pase jurásico).

### Validado
- `npm test`, `test:graph` (incl. `tauntMonkey.js`), `test:visual`, cross-check de IDs (60)
  y CSS: verde. **Controles móviles, música, tienda, progresión e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.10.0] — 2026-06-20 — Calidad visual: dinos, monedas, estrella, FX y sonido

Iteración de calidad visual/audio centrada en el gameplay, **sin tocar** controles,
música de fondo, tienda/inventario, progresión ni física.

### Dinosaurios (modelos 3D de celebración y ptero)
- **Más carácter y forma de dinosaurio**: ojos con **brillo especular**, **garras** en los
  pies (3 uñas por pata), **cejas** y **fosas nasales** en T-Rex y Velociraptor, materiales
  con leve *sheen* y realce de color (emisivo suave) bajo el tone mapping. Mantiene la
  identidad por especie (no son el mismo recoloreado).
- **Pterosaurio del rescate** rehecho: **alas membranosas** con hueso de borde, **cresta**
  larga, **ojos** y cuerpo de dos tonos (lomo/vientre).

### Monedas
- Disco grueso con **relieve central** y **borde**, ligeramente inclinado para que **destelle
  al girar**; **material dorado** mejor (metálico + emisivo cálido) y **aura** dorada en el
  suelo. Animación idle de giro + flote + leve respiración del aura.

### Estrella especial
- Estrella de 5 puntas **extruida con bisel**, **emisivo intenso** y **aura** más grande y
  brillante que la moneda; giro elegante. Se lee claramente como "más especial".

### Efectos de recolección (FX)
- **Popup de puntos flotante** "+100" / "+500" en la posición del coleccionable (proyección
  3D→pantalla respetando la inclinación del tablero) en una nueva capa `#fx-layer`.
- **Partículas**: ráfaga dorada al recoger la estrella (ya existía) + destello/aura.

### Sonido (Web Audio sintetizado, sin copyright)
- **Moneda**: "¡ding!" arcade **original** — dos notas ascendentes (Do6→Sol6) con leve *bend*
  al alza; corto y satisfactorio. **No** reproduce el sonido protegido de ningún juego.
- **Estrella**: arpegio ascendente de 4 notas + **chispa** final (más brillante y especial
  que la moneda). Volumen balanceado, suena junto a la música; cada recogida crea sus
  osciladores (sin duplicación); respeta el autoplay del navegador (suena tras gesto).

### Sistema de pickups/FX/audio (breve)
- `src/levels/collectibles.js` coloca monedas/estrella; `src/scene/collectibleArt.js` los
  modela en 3D; `SceneManager` los anima, recoge (pop), proyecta a pantalla (`projectBoardPoint`)
  y lanza partículas (`spawnBurst`); `Game._checkPickups` detecta la recogida, suma puntos,
  persiste estrellas-token, muestra el popup (`_popPoints`) y dispara el sonido (`sfx.coin/starGet`).
  Para **cambiar un sonido**: editar `src/effects/sfx.js`. Para el **aspecto** de moneda/estrella:
  `src/scene/collectibleArt.js` + `makeGlowTexture` en `src/scene/textures.js`.

### Rendimiento
- Materiales emisivos y auras (planos con blending aditivo) son ligeros; las texturas de
  brillo se **liberan** al cambiar de nivel (sin fugas). Apto para móvil.

### Validado
- `npm test`, `test:graph`, `test:visual` (incl. `makeGlowTexture` + construcción de
  monedas/estrella/ptero/dinos), cross-check de IDs (56) y CSS: verde. **Controles móviles,
  música, tienda, progresión e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.9.0] — 2026-06-20 — Pulido profundo de pantallas (3 ciclos)

Iteración de UX/visual en todas las pantallas, **sin tocar** controles móviles, música,
progresión, tienda/inventario ni física.

### Ciclo 1 — alto impacto
- **Selector de niveles por MUNDOS**: 25 niveles agrupados en 5 mundos (Valle Jurásico,
  Pantano Raptor, Cráter Volcánico, Ruinas Fósiles, Isla TREXo) con cabecera, estrellas por
  mundo y candado; tarjetas con ✓ de completado.
- **Preparación enriquecida**: muestra el **mundo**, las **monedas** del nivel y avisa si hay
  **estrella especial** aquí.
- **Selector de bola** con **personalidad** (frase breve por dino).
- **Victoria**: recap de lo recogido (🪙 monedas, ⭐ estrella) y **mensaje de desbloqueo**
  ("🔓 ¡Nivel X desbloqueado!").
- **Game Over**: sugerencia de canje + botón **🛒 Ir a Canje**.
- **Pausa**: resumen de **poderes activos** + botón **🛒 Canje**.
- **HUD**: chip de **poderes activos** (🪨/🦅) cuando aplican.

### Ciclo 2 — animaciones y feedback
- **Feedback de compra** en la tienda animado (éxito en verde / falta en rojo) — corregido
  un caso en que el mensaje se borraba al re-render.
- **Partículas**: ráfaga dorada al recoger la **estrella** y al **ptero-rescate** (aterrizaje).
- Hover con relieve en tarjetas de tienda, ✓ de nivel completado, realces al pulsar.

### Ciclo 3 — QA visual / mobile
- **HUD anti-saturación**: nombre de nivel truncado, gaps compactos; en pantallas muy
  estrechas (<380px) se prioriza nivel/vidas/puntos/monedas (se oculta el tiempo).
- **Anti-overflow**: nombres de mundo con elipsis; pantalla de niveles con scroll cómodo.
- Objetivos táctiles ≥44px mantenidos; sin solapes con el tablero ni los controles.

### Validado
- `npm test`, `test:graph`, `test:visual`, cross-check de IDs (55) y balance CSS: verde.
  **Controles móviles, música, progresión, tienda e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

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
