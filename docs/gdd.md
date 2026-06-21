# Game Design Document — TREXoRoll

> **Subtítulo:** *Inclina, rueda y conquista cada tablero.*
> Versión MVP 0.1.0 · Documento vivo

---

## 1. Visión del juego

TREXoRoll es un juego **3D de habilidad** para web y móvil con temática **jurásica**.
El jugador no controla la bola directamente: **inclina un tablero flotante** para que
una bola blanca tipo billar —con el **emblema de un T-Rex** estampado— ruede por
física hasta el **hoyo objetivo**, evitando **hoyos trampa** y caídas al vacío.

**Pilares de diseño:**

1. **Control indirecto satisfactorio** — la gracia está en dominar la inercia de la bola.
2. **Lectura clara** — meta verde, trampas rojas, bordes evidentes.
3. **Accesible y rápido** — partidas cortas, jugable con una mano en móvil.
4. **Identidad jurásica** — color, huevos, fósiles, helechos, el T-Rex de la bola.

**Público:** casual, todas las edades. **Sesión típica:** 1–5 minutos.

---

## 2. Mecánica principal

- El tablero se inclina sobre dos ejes (adelante/atrás e izquierda/derecha).
- La **gravedad proyectada** sobre el plano inclinado acelera la bola.
- La bola tiene **inercia y fricción**: hay que anticipar y frenar.
- **Paredes/rieles** rebotan la bola; **huecos** la hacen caer.

### Condiciones
- **Victoria de nivel:** la bola entra en el hoyo objetivo (anillo verde).
- **Fallo (pierde 1 vida):** la bola entra en un hoyo trampa **o** cae fuera del tablero.
- **Game Over:** se agotan las 3 vidas.

---

## 3. Reglas

| Regla | Valor |
|---|---|
| Vidas iniciales | 3 |
| Al perder vida | la bola reaparece en el inicio del nivel |
| Victoria | bola en el hoyo objetivo |
| Derrota de intento | trampa, caída fuera del tablero |
| Game Over | 0 vidas |
| Puntuación base por nivel | 1000 |
| Bonus por vida restante | 250 c/u |
| Bonus por tiempo | 8 pts por segundo bajo el "par" del nivel |
| Progreso | niveles se desbloquean al completarse (localStorage) |

---

## 4. Niveles (25)

Curva de dificultad **Fácil → Media → Difícil → Experto**, repartidos en **8 biomas**
jurásicos. Cada uno con forma de tablero o combinación de obstáculos distinta. Los 10
niveles avanzados (16–25) introducen formas en L, puentes, cruces, fosos, anillos,
embudos, hexágonos y laberintos de varios tramos:

| # | Nombre | Forma / reto | # | Nombre | Forma / reto |
|---|--------|--------------|---|--------|--------------|
| 1 | Valle Inicial | Rect. amplio (tutorial) | 9 | Serpiente | Serpenteante con baffles |
| 2 | Sendero Largo | Pasillo + tope + trampa | 10 | Foso Doble | Dos fosos, carriles seguros |
| 3 | Cresta Triangular | Triángulo sin bordes | 11 | Anillo | Círculo, trampa central enorme |
| 4 | Cráter Circular | Círculo, trampa central | 12 | Diamante | Rombo, trampas alineadas |
| 5 | Laberinto Jurásico | Rect. con muros | 13 | Embudo | De ancho a cuello estrecho |
| 6 | Doble Recodo | Forma en L | 14 | Laberinto II | Serpentina de 3 tramos |
| 7 | Puente Colgante | Plataformas + puente | 15 | Cima Final | Cámaras + 4 trampas |
| 8 | Cruce Jurásico | Forma de cruz | | | |

> Arquitectura de niveles **data-driven**: añadir un nivel = añadir un objeto a
> `src/levels/levels.js`. La solvencia se garantiza con `tools/level-validator.mjs`.

### Estrellas y progresión

Cada nivel otorga **1–3 estrellas**: 3 si se completa sin perder vidas y bajo el
tiempo objetivo (`par`); se pierde una estrella por perder ≥1 vida y otra por pasarse
de tiempo. Se guardan estrellas, mejores tiempos y mejor puntuación (`localStorage`).

---

## 5. Experiencia de usuario (flujo de pantallas)

```
Landing → Menú → (Jugar | Niveles | Cómo jugar | Sonido)
                     │
                     ▼
                Preparación → Juego 3D ──► Victoria ──► (Siguiente nivel | Menú)
                                  │
                                  └────────► Game Over ──► (Reintentar | Menú)
```

- **Landing:** título, subtítulo, bola con emblema, botón *Entrar*.
- **Menú:** Jugar, Niveles, Cómo jugar, Sonido; mejor puntuación; decoración jurásica.
- **Preparación:** nivel, vidas, objetivo, advertencia, *Iniciar nivel*.
- **Juego:** escena 3D + HUD (nivel, vidas, puntos) + pista de control.
- **Victoria / Game Over:** puntuación, progreso y navegación.

---

## 6. Controles

| Plataforma | Entrada |
|---|---|
| Desktop | Flechas o **WASD** para inclinar; o **arrastrar** con el ratón |
| Móvil | **Arrastrar** el dedo sobre la pantalla para inclinar |

El tablero vuelve suavemente a la horizontal al soltar, para poder estabilizar la bola.

---

## 7. Estilo visual

- **Paleta:** verdes selva, ámbar cálido, acentos verde (meta) y rojo (trampa), crema.
- **Ambiente:** cielo degradado cálido, niebla suave, suelo selvático, luz de sol.
- **Props originales:** rocas, huevos en nido, helechos, fósiles, huellas de dinosaurio,
  estandarte con silueta de T-Rex en la meta.
- **Bola:** blanca tipo billar con emblema circular verde y silueta de T-Rex.
- **Sin assets con copyright:** todo procedural (Canvas 2D + geometrías + Web Audio).

---

## 8. Audio

Tonos sintetizados (Web Audio API): clic de UI, victoria (arpegio ascendente),
fallo, y caída en hoyo. Silenciable desde el menú.

---

## 9b. Bolas, biomas y celebración (v0.3.0)

- **Bolas (5):** Blanca, Verde, Rosada, Amarilla, Azul. Cada una con una **cara de
  dinosaurio** propia (expresión distinta) dibujada por código. El jugador elige y su
  elección se guarda. Preview en menú, preparación y HUD.
- **Celebración de victoria:** al entrar en el hoyo, el **dinosaurio del color de la bola
  elegida sale del hoyo, salta y baila** (brazos y cola) con **confeti** y **rugido**.
  Premia y diferencia cada victoria.
- **Biomas (8):** valle, bosque, volcán, pantano, meseta, ruinas, isla, nido de huevos.
  Cambian cielo, horizonte (montañas, volcán con lava, palmeras, mesetas, columnas),
  color de suelo y niebla. Cada grupo de niveles se siente como una región distinta.

---

## 9. Fuera de alcance del MVP

Multijugador, editor de niveles, modelos 3D detallados (.glb), música de fondo,
tablas de clasificación online, monetización. Ver `mvp.md` y `backlog.md`.

---

## 10. Expansión v0.14.0 — 50 niveles, portales y eventos jurásicos

### 10.1 Contenido
- **50 niveles** en **10 mundos** (5 niveles cada uno). Mundos 6–10:
  Cañón del Pterodáctilo, Selva Perdida, Cavernas de Ámbar, Pantano de Sombras,
  Corona del T-Rex. Dificultad creciente: media-alta (26–30) → experto/final (46–50).

### 10.2 Portales naranjas (nueva mecánica)
- Cada nivel 26–50 tiene **2 hoyos naranjas enlazados**. Entrar en uno teletransporta
  la bola al otro. **No mata ni gana**; la bola continúa.
- La salida **conserva la dirección** (amortiguada `EXIT_DAMP`, con velocidad mínima
  `EXIT_MIN_SPEED` para abandonar la boca) y se coloca en un **punto seguro** validado
  (dentro de la huella, sin pared ni trampa). El **cooldown** (`COOLDOWN`) evita ping-pong.
- Diseño: atajos, rutas alternativas, acceso a recompensas y puzzles (incl. niveles de
  **islas** que requieren el portal). Efecto de **invocación**: vórtice naranja giratorio,
  aro de luz expansivo, chispas y sonido de teletransporte.

### 10.3 Eventos ambientales (no intrusivos)
- **Pterodáctilos**: 2 vuelos por nivel (ida y vuelta) cruzando el cielo.
- **Diplodocus**: al recoger una **estrella**, se asoma desde un lateral, come una hoja
  y se va.
- **Familia Triceratops** (v0.15.0): al recoger la **3.ª moneda** del nivel, un adulto
  (gola + 3 cuernos + cuerpo robusto + patas + cola) con **2 bebés** camina por el borde
  inferior y desaparece por el otro lado. **Una vez por nivel** (bandera rearmada por nivel).
- Todos viven en una **capa overlay DOM/SVG** (`#critter-layer`) con `pointer-events:none`
  y z-index **por debajo del HUD/controles** → nunca tapan la interfaz ni bloquean el input,
  no tocan la física y son ligeros en móvil.

> La economía (monedas = 1 punto, estrellas acumulables para la Tienda de Canje) y los
> potenciadores se mantienen **sin cambios**.

---

## 11. Responsive / mobile-first (v0.15.0)

- **Perfil de viewport** (`Game.getViewportProfile/isSmallPhone/isTallPhone/isLandscapeMobile`)
  → clases en `<body>`; se recalcula en `resize`, `orientationchange` y `visualViewport`.
- **Cámara por dispositivo** (`SceneManager.setViewportFit`): tablero más grande y elevado
  en teléfono pequeño vertical; aprovecha el ancho en móvil horizontal. El encaje por esfera
  mantiene el tablero completo a cualquier inclinación.
- **Layout**: `html/body` con `overflow:hidden` + `touch-action:none` (sin scroll en partida);
  paneles con `dvh`; safe-areas (`env(safe-area-inset-*)`); HUD y D-pad/joystick compactos en
  pantallas pequeñas sin perder el toque cómodo (mín. 44px) ni recortar la pausa.
- Soportado: iPhone/Android pequeños y grandes, vertical y horizontal, pantallas altas/anchas.
