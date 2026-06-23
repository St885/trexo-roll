# Menú principal — diseño (v0.21)

Rediseño visual del menú para recuperar limpieza/compacidad/jerarquía tras añadir las
funciones de la v0.20 (skins, cofre, diario), **sin perder ninguna**.

## Problema del menú anterior (v0.20)

11 botones idénticos (ancho completo / grid 2 col) apilados → panel **largo con scroll**,
**jerarquía plana** (todo pesaba igual), sensación **saturada** y poco premium.

## Estructura nueva (5 zonas)

```
┌───────────────────────────────────────┐
│ [avatar]  TREXoRoll                     │  Cabecera (horizontal, compacta)
│           ¡Hola, Stefano!               │
├───────────────────────────────────────┤
│ ⭐87/150   🔓23/50   🏆14820            │  Stats: 3 pills
│ ▓▓▓▓▓▓▓▓░░░░░░░  58%                    │  + barra de progreso
├───────────────────────────────────────┤
│ ⏩ Continuar            (ámbar)         │  CTAs principales
│ ▶ Jugar                (verde héroe)   │
├───────────────────────────────────────┤
│ 🎁Diario  🦕Dino   🎨Skins             │  Grid de tiles (acciones
│ 🧰Cofre   🛒Canje  🗺️Niveles            │  secundarias, 3×2)
├───────────────────────────────────────┤
│ ❓Ayuda  ⚙️Ajustes  ⛶Pantalla  ES EN   │  Fila utilitaria (terciaria)
└───────────────────────────────────────┘
```

## Decisiones de jerarquía

- **Principal:** `Continuar` (ámbar, "reanudar") y `Jugar` (verde, **héroe** con brillo y
  mayor tamaño). Dos colores distintos → ambos protagonistas, no copias atenuadas.
- **Secundaria:** 6 *tiles* (icono grande + etiqueta corta) en una rejilla limpia. Diario y
  Cofre son `tile-feature` (acento ámbar) por su valor de retención; muestran **badge** y
  **glow** cuando hay algo que reclamar/abrir. Canje muestra ⭐ disponibles.
- **Terciaria:** Ayuda / Ajustes / Pantalla + idioma, como botones pequeños con separador
  superior (menor peso visual).

## Premium / glass

- Panel `min(420px)` (440 en escritorio): glassmorphism `blur(14px) saturate`, fondo en
  degradado + glow radial verde sutil arriba, borde fino dorado, filo superior dorado,
  sombra profunda + realce interior.
- Stats en una sub-tarjeta oscura translúcida (profundidad por capas).
- Tiles con degradado, realce interior y estados hover/tap (elevación + escala).
- CTA héroe con barrido de brillo (animado por `transform` → compositor, suave en móvil).

## Responsive (mobile-first)

- **Vertical:** tiles 3×2, CTAs apilados. Cabe sin scroll en teléfonos estándar; en los más
  pequeños (≤380) se compactan pills/tiles/fuentes para minimizar cualquier scroll.
- **Paisaje móvil:** se aprovecha el ancho → CTAs en **2 columnas** y tiles en **una fila de
  6**; panel `max-height` ajustado. (Si solo está `Jugar`, ocupa el ancho completo.)
- **Tablet/desktop:** panel algo mayor (440px), CTAs y avatar más grandes, fondo jurásico
  visible alrededor sin restar protagonismo.
- Objetivos táctiles: tiles ≥64px, utilitarios ≥44px. Respeta `prefers-reduced-motion`.

## Cómo se alimenta (sin romper navegación)

Los `id` de los botones se conservan (misma navegación). `_updateMenuProgress()` ahora
rellena **pills** (⭐ estrellas, 🔓 nivel, 🏆 récord), la **barra** (+%), y los **badges** de
los tiles (Canje ⭐N, Cofre ✨N, Diario ●) sin sobrescribir su icono/etiqueta. El avatar es
la miniatura de la bola con la skin activa.

## Previsualización

`docs/menu-preview.html` — render estático del menú (datos de muestra) con el **CSS real**;
ábrelo en cualquier navegador para revisar el aspecto sin arrancar todo el juego.

## QA realizado

- Capturas reales (Edge headless) a 360 / 390 / 820 px: sin cortes, sin desbordes, sin
  scroll incómodo; jerarquía y badges correctos.
- `npm test` + `test:graph` + `test:visual` + `test:ui`: **verde**. Integridad de `id` del
  menú verificada (toda la navegación intacta).
