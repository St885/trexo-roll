# Technical Design — TREXoRoll

> Artefacto de **agente-videojuegos**. El "cómo" técnico del MVP.

---

## 1. Stack y principios

| Elemento | Decisión |
|---|---|
| Render 3D | **Three.js r160**, **vendorizado** en `libs/three.module.js` (sin red en runtime) |
| Carga de módulos | ES Modules nativos + `importmap` (`"three"` → archivo local) |
| Lenguaje | JavaScript ES6+ (sin TypeScript, sin build step) |
| Física | **Propia** (sin librería): proyección de gravedad sobre plano inclinado |
| UI / pantallas | DOM overlays + CSS (no UI dentro del canvas) → responsive y accesible |
| Audio | Web Audio API sintetizado |
| Persistencia | `localStorage` con *fallback* en memoria |
| Servidor dev | `npx serve` (estático) |

**Principios:** simplicidad sobre sobreingeniería, data-driven para niveles, una sola
responsabilidad por módulo, lo "3D" aislado del resto.

---

## 2. Arquitectura de módulos

```
index.html ─ importmap("three" → libs/three.module.js) + pantallas DOM
  └─ src/main.js                arranque, manejo de errores
       └─ core/Game.js          ORQUESTADOR: estados, vidas, score, progresión, bucle
            ├─ core/ScreenManager.js     conmuta pantallas DOM y conecta botones
            ├─ core/InputController.js   teclado + arrastre → inclinación suavizada
            ├─ scene/SceneManager.js     renderer, cámara, luces, cielo, montaje de tablero
            │     ├─ scene/BoardBuilder.js   huella → mallas (superficie, muros, hoyos, decor)
            │     ├─ scene/Ball.js           esfera + emblema + giro de rodadura
            │     ├─ scene/decor.js          props jurásicos (primitivas)
            │     └─ scene/textures.js       texturas Canvas 2D (emblema, suelo, cielo)
            ├─ physics/BallPhysics.js    integración, rebote, caída, hoyos
            │     └─ physics/footprint.js    formas del tablero + punto-dentro
            ├─ levels/levels.js          datos de los 5 niveles
            ├─ ui/hud.js                 HUD en partida
            ├─ effects/sfx.js            audio sintetizado
            └─ utils/{constants,storage}.js  config central + persistencia
```

La **física** (`physics/*`, `levels/*`, `utils/constants.js`) **no importa Three.js**,
por eso puede simularse y testearse en Node (`tools/physics-smoke-test.mjs`).

---

## 3. Flujo de juego (máquina de estados)

```
LANDING → MENU → PREP → GAME → (WIN → PREP/MENU) | (GAMEOVER → PREP/MENU)
```

Estado de la bola en partida: `rolling` → (`sinking-goal` | `sinking-trap` | `falling`)
→ resolución (completar nivel o perder vida). El bucle `requestAnimationFrame` solo
actualiza/renderiza cuando `playing === true`.

---

## 4. Sistema de niveles (data-driven)

Cada nivel en `levels/levels.js`:

```js
{
  id, name, hint, surfaceColor, surfaceAccent,
  footprint: [ {type:'rect'|'circle'|'poly', ...} ],  // huella jugable (unión de formas)
  start: {x, z},
  goal:  {x, z, r},
  traps: [ {x, z, r}, ... ],
  walls: [ {x, z, w, d}, ... ],   // AABB sólidos (rebote)
  footDecals: [ {x, z, rot} ],    // huellas decorativas
  par                              // segundos de referencia para bonus de tiempo
}
```

La **misma huella** alimenta el render (`BoardBuilder`) y la física (`footprint`),
garantizando que lo que se ve coincide con lo que se juega. Añadir nivel = añadir objeto.

---

## 5. Física y control

Coordenadas: plano local del tablero, `x→derecha`, `z→hacia la cámara`.

- **Gravedad proyectada** sobre el plano inclinado `R = Rx(α)·Rz(β)`
  (`α=tiltX`, `β=tiltZ`):
  - `a_x = -G·cos(α)·sin(β)`
  - `a_z =  G·sin(α)`
- Integración con **paso fijo** (`SUBSTEP`) para estabilidad e independencia del framerate.
- **Fricción** estable, **límite de velocidad** (anti-tunneling) y **substeps**.
- **Rebote** círculo-vs-AABB contra muros (con separación + reflexión + restitución).
- **Caída** si el centro sale de la huella; **hoyo** por distancia al centro con
  atracción suave de captura.

**Control** (`InputController`): teclado (flechas/WASD) y **arrastre de puntero**
(unifica ratón y táctil) producen una inclinación objetivo; se **suaviza** hacia ella y
vuelve a cero al soltar. Mapeo elegido para que la dirección de arrastre/tecla coincida
con la dirección de rodadura.

---

## 6. Capa 3D

- `SceneManager`: `WebGLRenderer` (sombras PCFSoft, `pixelRatio ≤ 2`), cielo por textura
  de fondo, niebla, suelo, `HemisphereLight` + `Ambient` + `DirectionalLight` (sol con
  sombra). Cámara **perspectiva** con **encuadre automático** según la huella y el
  aspecto de pantalla (clave para móvil vertical).
- El tablero es un `Group` que **se inclina** (`rotation.x/z`); la bola es **hija** del
  grupo, por lo que se inclina visualmente con él mientras rueda en el plano local.
- **Gestión de memoria:** al cambiar de nivel se liberan geometrías y materiales/texturas
  *por-tablero*; los materiales compartidos (`userData.shared`) y la **bola reutilizada**
  no se liberan.

---

## 7. Responsive / móvil

- Pantallas DOM con CSS fluido (`clamp`, fl*, grid), `safe-area-inset`, objetivos táctiles
  grandes, `touch-action: none` para evitar scroll durante el arrastre.
- La pantalla de juego es transparente y deja pasar el puntero al lienzo (solo los chips
  del HUD capturan eventos).
- Encuadre de cámara recalculado en `resize` y rotación de pantalla.

---

## 8. Cómo ejecutar y validar

```bash
# Ejecutar (servidor estático)
npx serve . -p 3000      # o: npm start  → abrir http://localhost:3000

# Validar la física sin navegador
npm test                 # node tools/physics-smoke-test.mjs
```

> No requiere `npm install`: Three.js está en `libs/`. `npx serve` se usa solo como
> servidor estático de desarrollo.

---

## 9. Riesgos técnicos y deuda

| Tema | Estado / nota |
|---|---|
| Sensación de control (tuning) | Verificable solo en navegador; constantes centralizadas en `utils/constants.js` |
| Orientación de tableros poligonales | Transformada verificada matemáticamente (coincide con la huella) |
| Sin tests visuales automatizados | Mitigado con smoke-test de física; pendiente prueba manual en navegador |
| Tablero poligonal sin grosor lateral | Aceptado para el MVP (losa plana) |

---

## 10. Novedades v0.2.0

- **15 niveles** (data-driven) + **validador automático** (`tools/level-validator.mjs`,
  BFS de solvencia) integrado en `npm test`.
- **Game feel**: constantes reajustadas en `utils/constants.js` (peso/fricción/rebote)
  y **gracia de caída** (`PHYS.FALL_GRACE`) en `physics/BallPhysics.js`.
- **Progresión**: estrellas (1–3) y mejores tiempos por nivel + récord, en
  `utils/storage.js`; mostrados en selector y victoria.
- **Pausa** (P/Esc/botón) con reiniciar nivel; **cronómetro** e **indicador de
  inclinación** en `ui/hud.js`.
- **Render**: tone mapping ACES + exposición, sombras 2048 + `normalBias`, **rim light**
  fría y **sombra de contacto** bajo la bola (`scene/SceneManager.js`, `scene/textures.js`).
- **Feedback**: flash de pantalla (`#flash`), **sacudida de cámara** (`SceneManager.shake`)
  y sonidos de inicio/récord (`effects/sfx.js`).

---

## 11. Novedades v0.3.0

- **Bolas y especies** (`data/balls.js` + `data/dinos.js`): cada bola mapea a una
  **especie distinta** (trex, raptor, parasaur, triceratops, brachio). El emblema 2D es la
  **silueta de perfil** de esa especie (`scene/dinoArt.js` → `drawDino`), usada en
  `makeBallTexture`/`makeBallThumbnail`. `Ball.setSkin()` cambia la textura en caliente;
  persistencia en `utils/storage.js` (`selectedBall`).
- **Celebración por especie** (`scene/CelebrationDino.js`): `buildDino(ballDef)` despacha a
  un constructor 3D **distinto por especie** (rasgos inequívocos) + `buildConfetti()`.
  `SceneManager.spawnCelebration/_animateCelebration` sacan el dino del hoyo con una
  **animación propia** (`DINOS[].anim`: roar/spin/dance/charge/neck); `Game` añade un estado
  `celebrating` antes de la victoria. Sonido `sfx.roar()`.
- **Biomas** (`scene/textures.js` `THEMES`, `makeThemeSky`): 8 ambientaciones; cada nivel
  declara `theme`. `SceneManager.applyTheme()` cambia fondo, color de suelo y niebla.
- **50 niveles** (`levels/levels.js`) en **10 mundos**, con `theme` y dificultad creciente;
  validados por `tools/level-validator.mjs` (BFS **portal-aware**).
- **Portales** (`level.portals`: 2 hoyos enlazados): el teletransporte se resuelve en
  `physics/BallPhysics.js` (`_teleport`/`consumePortalFx`, cooldown anti-loop, salida
  segura); render en `scene/BoardBuilder.js` (hoyo + aro + vórtice) y FX de invocación en
  `scene/SceneManager.js` (`spawnPortalFx`). Sonido `sfx.portal()`.
- **Eventos ambientales** (`effects/critters.js`, capa DOM `#critter-layer`,
  `pointer-events:none`, z-index < HUD): **pterodáctilos** (2 vuelos/nivel), **diplodocus**
  (al recoger estrella) y **familia Triceratops** (`triceratops(dir)`, al recoger 3 monedas;
  adulto + 2 bebés caminando por abajo, 1 vez por nivel). No tocan física ni input.
- **Responsive** (`core/Game.js`): perfil de viewport (`getViewportProfile`, `isSmallPhone`,
  `isLandscapeMobile`) → clases en `<body>` + `SceneManager.setViewportFit()` para afinar el
  encuadre de cámara por dispositivo. Listeners `resize`/`orientationchange`/`visualViewport`.
- **QA**: `npm run test:visual` (`tools/canvas-smoke.mjs`) ejerce el dibujo Canvas 2D y
  la construcción 3D con un contexto simulado (sin navegador). `tools/events-smoke.mjs`
  valida portales, critters (SVG bien formado) y el layout responsive base.
