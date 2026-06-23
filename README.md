# 🦖 TREXoRoll

### *Inclina, rueda y conquista cada tablero.*

Juego **3D de habilidad** para web y móvil con temática **jurásica**. Inclinas un tablero
flotante para hacer rodar una bola blanca —con el emblema de un T-Rex— hasta el hoyo
objetivo, esquivando hoyos trampa y caídas al vacío.

![estado](https://img.shields.io/badge/estado-v0.20.0-2ecc71) ![3D](https://img.shields.io/badge/3D-Three.js-blue) ![niveles](https://img.shields.io/badge/niveles-50-e9c46a) ![mundos](https://img.shields.io/badge/mundos-10-f4a261) ![bolas](https://img.shields.io/badge/bolas-5%20dinos-ff7bb0) ![skins](https://img.shields.io/badge/skins-8-9b5de5) ![deps](https://img.shields.io/badge/dependencias-0%20en%20runtime-success)

🎮 **Jugar online:** https://st885.github.io/trexo-roll/ *(activo tras el despliegue en GitHub Pages)*

---

## 🎮 Cómo jugar

- **Objetivo:** lleva la bola al **hoyo verde**.
- **Evita:** los **hoyos rojos** (trampa) y caer fuera del tablero.
- **Portales naranjas** 🟠 (desde el Mundo 6): entra en uno y sal por el otro — atajos,
  rutas alternativas y puzzles. No te quitan vida.
- Tienes **3 vidas**. Completa los **50 tableros** (10 mundos) para ganar.
- **Elige tu bola** entre 5 dinos: ¡el tuyo sale del hoyo a celebrar al ganar!
- Gana hasta **3 ⭐ por nivel**: 3★ sin perder vidas y bajo el tiempo objetivo; 2★ si cumples
  una condición (sin morir, rapidez o monedas); 1★ por completar.
- **Cofre jurásico** 🧰 cada 15 ⭐: ábrelo por recompensas (estrellas, ayudas, vidas o skins).
- **8 skins de bola** 🎨 (color y material) y **habilidad por dino** (resistencia, velocidad,
  imán de monedas, estabilidad, peso). La skin no cambia la especie ni su habilidad.
- **Jefes** 👑 cada 10 niveles, **clima** 🌦️ (lluvia/niebla/viento/ceniza/tormenta/calor) y
  **contrarreloj** ⏳ en niveles 11/22/33/44.
- **Recompensa diaria** 🎁 con racha: entra cada día para premios mejores.
- Puntúas por completar nivel, por vidas restantes y por rapidez.
- Ambiente vivo: **pterodáctilos** cruzan el cielo, un **diplodocus** se asoma cuando
  recoges una estrella ⭐, y una **familia Triceratops** (adulto + 2 bebés) camina por
  abajo al recoger **3 monedas** 🪙.
- **¡Cuidado con el cavernícola!** Desde el **nivel 5** (y cada 5), un cavernícola con
  lanza patrulla cerca del hoyo: si te toca, te patea y te lanza su lanza → pierdes una vida.
- **Cohetes** 🚀: pasa la bola por encima de un **cohete de colores** (niveles 3, 8, 13…) y
  estalla en **fuegos artificiales**; el **cohete con raya roja** (niveles 7, 17, 27…) lanza
  un evento en el que un pterodáctilo cruza el cielo y el cohete lo derriba (cartoon, sin daño).
- **Mobile-first de verdad:** se adapta a iPhone/Android, pequeños y grandes, vertical y
  horizontal (cámara y HUD se ajustan al tamaño de pantalla; sin scroll en partida).
- **Acceso jurásico:** al abrir, pantalla de acceso/registro **local y simulada** (invitado,
  ingresar, crear cuenta, Google/Apple/Samsung como placeholder, ES/EN, privacidad/términos).
  Sin backend, sin APIs y **sin guardar contraseñas** — ver [docs/seguridad.md](docs/seguridad.md).

### Controles

| Plataforma | Cómo inclinar el tablero |
|---|---|
| 🖥️ Desktop | **Flechas** o **W A S D**, o **arrastra** con el ratón |
| 📱 Móvil | **Arrastra** el dedo sobre la pantalla |
| ⏸️ Pausa | Botón **⏸** o tecla **P** / **Esc** |

El tablero vuelve solo a la horizontal cuando sueltas, para estabilizar la bola.

---

## 🚀 Ejecutar localmente

Los ES Modules necesitan servirse por HTTP (no funcionan abriendo el archivo directamente):

```bash
# Opción 1
npm start
# Opción 2
npx serve . -p 3000
```

Luego abre **http://localhost:3000**. No hace falta `npm install`: Three.js viene
incluido en `libs/`.

### Validar la física (sin navegador)

```bash
npm test
```

---

## 🦕 Bolas y mundos

- **5 bolas, 5 dinosaurios distintos** (no el mismo recoloreado):

  | Bola | Dinosaurio | Celebración |
  |------|-----------|-------------|
  | ⚪ Blanca | **T-Rex** | salto + cabezazo |
  | 🟢 Verde | **Velociraptor** | giro veloz |
  | 🌸 Rosada | **Parasaurio** | baile |
  | 🟡 Amarilla | **Triceratops** | mini-embestida |
  | 🔵 Azul | **Braquiosaurio** | mecer el cuello |

  Tu elección se guarda y, al ganar, **sale del hoyo el dinosaurio de tu bola** a celebrar.
- **8 biomas** que cambian el cielo, el horizonte, el suelo y la niebla: valle, bosque,
  volcán, pantano, meseta, ruinas, isla y nido de huevos.

## 🗺️ Niveles (25)

Curva de dificultad **Fácil → Experto**. Todos verificados como superables por
`tools/level-validator.mjs`.

| # | Nombre | # | Nombre | # | Nombre |
|---|--------|---|--------|---|--------|
| 1 | Valle Inicial | 10 | Foso Doble | 19 | Cúpula Volcánica |
| 2 | Sendero Largo | 11 | Anillo | 20 | Sendero del Triceratops |
| 3 | Cresta Triangular | 12 | Diamante | 21 | Isla del Huevo Dorado |
| 4 | Cráter Circular | 13 | Embudo | 22 | Laberinto del Carnotauro |
| 5 | Laberinto Jurásico | 14 | Laberinto II | 23 | Fósiles Perdidos |
| 6 | Doble Recodo | 15 | Cima Final | 24 | Ruinas del T-Rex |
| 7 | Puente Colgante | 16 | Valle de las Huellas | 25 | Gran Final Jurásico |
| 8 | Cruce Jurásico | 17 | Pantano del Raptor | | |
| 9 | Serpiente | 18 | Cañón de Huesos | | |

---

## 🛠️ Tecnologías

- **Three.js r160** (vendorizado, sin red en runtime) para el 3D.
- **JavaScript ES6+** (ES Modules, sin build step), **HTML5**, **CSS3** responsive.
- **Física propia** (sin librería externa).
- **Web Audio API** para los efectos de sonido.
- **localStorage** para mejor puntuación y progreso.

Todo el arte es **procedural y original** (Canvas 2D + geometrías) — **sin assets con
copyright**.

---

## 📦 Estado del MVP

**v0.3.0 — jugable de principio a fin.** Landing → menú → **elegir bola** → **25 niveles
3D** en 8 biomas, con pausa, estrellas, récord y **celebración del dino** al ganar →
victoria / game over. Pendiente: prueba manual en navegador y ajuste fino de la sensación
de control. Detalle en [`docs/`](docs/).

## 📁 Estructura

```
trexo-roll/
├── index.html          # importmap + pantallas
├── libs/three.module.js# Three.js vendorizado
├── src/
│   ├── core/           # Game, ScreenManager, InputController
│   ├── scene/          # SceneManager, BoardBuilder, Ball, decor, textures
│   ├── physics/        # BallPhysics, footprint
│   ├── levels/         # levels.js (data-driven)
│   ├── ui/ effects/ utils/
│   └── main.js
├── styles/main.css
├── assets/             # vacío: arte procedural (ver assets/README.md)
├── docs/               # gdd, mvp, technical-design, backlog, ficha-producto, changelog
└── tools/              # physics-smoke-test.mjs
```

---

© 2026 Stefano Luis. Personajes y arte **originales**.
