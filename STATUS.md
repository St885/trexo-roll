# STATUS — TREXoRoll

| Campo | Valor |
|---|---|
| **Versión** | 0.17.0 — Pantalla de acceso/registro (simulada) + dinos premium (sin push aún) |
| **Estado** | ✅ Publicado en GitHub Pages (v0.15.2) · 🛠️ Local v0.17.0 (acumula 0.16.0 dinos premium) lista para **revisión de Stefano** antes de desplegar |
| **Fecha** | 2026-06-21 |
| **Ruta** | `03_juegos/trexo-roll/` |
| **Stack** | Three.js r160 (vendorizado) · JS ES6+ · CSS3 · Web Audio |
| **Dependencias runtime** | 0 (Three.js en `libs/`) |
| **Niveles** | 50 (Fácil → Experto) en 10 mundos, todos validados como superables |
| **Bolas** | 5, cada una con **especie de dino distinta** (T-Rex, Raptor, Parasaurio, Triceratops, Braquiosaurio) |
| **Biomas** | 8 ambientaciones jurásicas |
| **Git** | Repo `github.com/St885/trexo-roll`, rama `main` |
| **Deploy** | ✅ GitHub Pages — https://st885.github.io/trexo-roll/ · v0.8.0 (2026-06-19) |

---

## Novedades v0.15.0 — Responsive móvil real + familia Triceratops

- **Responsive por dispositivo**: perfil de viewport en JS (clases en `<body>`) + ajuste de
  cámara (tablero más grande en teléfonos pequeños verticales; aprovecha el ancho en
  horizontal) + `visualViewport` (barra del navegador) + paneles `dvh` + HUD/controles
  compactos en pantallas pequeñas (sin recortar la pausa).
- **Evento Triceratops**: al recoger 3 monedas, un adulto + 2 bebés caminan por el borde
  inferior y se van. Una vez por nivel; overlay que no toca física/HUD/controles ni el input.
- Validado con `npm test` (incl. checks de Triceratops y responsive), `test:graph`,
  `test:visual`, cross-check de IDs y smoke de servidor. ⚠️ **No desplegado**.

## Novedades v0.14.0 — 50 niveles, portales y eventos jurásicos

- **50 niveles** (25 nuevos, 26–50) en **10 mundos** (5 nuevos), dificultad creciente.
- **Portales naranjas** (2/nivel, enlazados): teletransporte con efecto de invocación,
  cooldown anti-loop y salida segura. No matan ni ganan.
- **Pterodáctilos** (2 vuelos/nivel) y **Diplodocus** (al coger estrella) como eventos
  ambientales en overlay DOM/SVG, sin tapar HUD/controles ni bloquear el input.
- HUD **Nivel X/50**; progresión, mundos y desbloqueos cubren los 50 niveles.
- Economía/tienda/poderes intactos. Validado con `npm test` (incl. física de portales +
  events-smoke), `test:graph`, `test:visual`, cross-check de IDs y smoke de servidor.
- ⚠️ **No desplegado**: pendiente de revisión manual de Stefano.

## Novedades v0.13.0 — Juego completo (revisión integral de pantallas)

- **Ajustes (⚙️)**: Música y Efectos **separados** y persistentes; **Reiniciar progreso**
  con confirmación; acceso a **Créditos**.
- **Créditos** (autoría + tecnología).
- **Cierre de campaña**: mensaje especial al completar los **25 niveles** con ⭐ y récord.
- **PWA**: `manifest.webmanifest` + **favicon SVG** original → instalable y con icono propio.
- Botón **🛒 Canje** ahora traducido; paridad i18n ES/EN completa.
- Validado con `npm test` / `test:graph` / `test:visual` + cross-check de IDs + smoke de servidor.
- ⚠️ **No desplegado**: pendiente de revisión manual de Stefano.

## Novedades v0.3.0

- Selección de 5 bolas con cara de dinosaurio + persistencia (preview en menú/prep/HUD).
- Efecto de victoria: el dino de tu bola sale del hoyo y baila + confeti + rugido.
- Fondos jurásicos por bioma (cielo + horizonte + suelo + niebla por código).
- 25 niveles (10 nuevos) con dificultad creciente.
- HUD con icono de bola; persistencia de bola y último nivel.

## Validaciones realizadas

| Validación | Resultado |
|---|---|
| Syntax-check de los módulos (`node --check`) | ✅ OK |
| Grafo de módulos completo en Node (incl. Three.js) | ✅ carga |
| Smoke-test de física + **25 niveles** (`npm test`) | ✅ todos superables |
| Smoke-test de dibujo/3D (`npm run test:visual`) | ✅ caras, biomas y dino sin errores |
| Cross-check de IDs DOM (52) | ✅ todos existen |
| Servidor local sirve la versión nueva | ✅ HTTP 200 |
| Prueba manual en navegador (visual + sensación) | ⏳ Pendiente (Stefano) |

## Pendientes / próximos pasos

1. Prueba manual en navegador (desktop + móvil): bolas, celebración, biomas y dificultad.
2. (Opcional) giroscopio móvil, música CC0, modelos `.glb`, más biomas/decoración 3D.
3. Despliegue GitHub Pages — requiere confirmación de Stefano.

## Riesgos abiertos

- Sensación de control y dificultad de niveles avanzados: solo verificable jugando.
- Apariencia de las caras de dino / fondos: ajustable en `src/scene/textures.js`.
