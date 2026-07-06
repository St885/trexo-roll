# Capturas para Google Play Store — TREXoRoll (REALES)

> Publicador: **SLF Games** · © 2026 SLF Games. Todos los derechos reservados.
>
> **Estas capturas son REALES**: se tomaron del **juego en ejecución** (build actual) mediante
> Edge headless + WebGL por software (SwiftShader), conduciendo la instancia real
> `window.__trexoroll` vía CDP. **No son mockups, ilustraciones ni recreaciones en Canvas.**
> Se sembró un progreso ficticio (sin datos personales) para que las pantallas se vean ricas.

## Archivos a subir (capturas reales)

### Teléfono (Play Console → Capturas de teléfono · mín 2, máx 8)
| Archivo | Dimensiones | Peso | Contenido REAL |
|---|---|---|---|
| `phone-01-menu-real.png` | 1080×1920 | 887 KB | Menú principal real (botón **Continuar** ámbar, avatar, fondo jurásico) |
| `phone-02-gameplay-real.png` | 1920×1080 | 2179 KB | Gameplay real N1 «Valle Inicial» (tablero 3D, bola-dino, hoyo verde, HUD) |
| `phone-03-traps-real.png` | 1920×1080 | 2171 KB | Gameplay real N16 (hoyos rojos, algunos móviles) |
| `phone-04b-coins-real.png` | 1920×1080 | 2406 KB | Gameplay real N6 (monedas + estrella + trampa) — *opcional/bonus* |
| `phone-04-victory-real.png` | 1080×1920 | 979 KB | Modal real **¡Nivel superado!** con 3★ |
| `phone-05-skins-real.png` | 1080×1920 | 1326 KB | Selector real de 8 skins (Clásica, Fósil, Huevo, Hielo, Ámbar, Volcánica, Meteorito, Dorada) |
| `phone-06-levels-real.png` | 1080×1920 | 559 KB | Selector real de niveles (Mundo 1 Valle Jurásico, Mundo 2 Pantano Raptor) |

> Sugerencia de selección mínima (2–8): `phone-01`, `phone-02`, `phone-03`, `phone-05`,
> `phone-04`, `phone-06`. `phone-04b` es extra. Play admite mezclar vertical (UI) y horizontal
> (gameplay).

### Tablet 7" (opcional, recomendado)
| Archivo | Dimensiones | Peso |
|---|---|---|
| `tablet7-01-gameplay-real.png` | 2048×1280 | 2592 KB |
| `tablet7-02-menu-real.png` | 1400×2240 | 1599 KB |
| `tablet7-03-victory-real.png` | 1400×2240 | 1614 KB |
| `tablet7-04-skins-real.png` | 1400×2240 | 2132 KB |

### Tablet 10" (opcional, recomendado)
| Archivo | Dimensiones | Peso |
|---|---|---|
| `tablet10-01-gameplay-real.png` | 2048×1280 | 2584 KB |
| `tablet10-02-menu-real.png` | 1280×2048 | 1476 KB |
| `tablet10-03-victory-real.png` | 1280×2048 | 1466 KB |
| `tablet10-04-skins-real.png` | 1280×2048 | 1928 KB |

**Total: 15 capturas reales.** Todas cumplen los límites de Play Store (lado 320–3840 px,
ratio ≤ 2:1, captura < 8 MB). El **icono** está en `../icon/icon-512.png` y el **feature
graphic** en `../feature-graphic/feature-1024x500.png`.

## Cumplimiento (QA Play Store)
- ✅ Material **real** del juego (sin barras del navegador, sin Android Studio, sin DevTools).
- ✅ Sin datos personales: progreso sembrado y saludo genérico (entrada como invitado).
- ✅ Coherente con la ficha: **sin** anuncios, **sin** compras, **sin** login real; las skins
  usan **estrellas internas** (no dinero).
- ⚠️ **Fondo del juego — REGENERAR CAPTURAS**: estas capturas se tomaron con el **fondo antiguo**
  (imagen de terceros, ya **eliminada** del proyecto el 2026-07-02). El juego usa ahora un
  **fondo procedural propio** (Canvas 2D, sin marcas). **Antes de subir a Play**, **regenerar
  todas las capturas** (`phone-*-real.png`, `tablet*-real.png`) con la build actual para que
  coincidan con el juego real y no muestren el fondo retirado. Ver `_gen/_capture.mjs`.
- ℹ️ En `phone-02` aparece el *coach* inicial mencionando «ratón/WASD» (desktop). Es UI real y
  válida; si prefieres una toma 100% táctil, repite el nivel (el coach no reaparece) o captura
  en móvil. Ver `../video/capture-guide.md`.

## Regenerar las capturas
- Generador: `_gen/_capture.mjs` (teléfono + tablet7 + tablet10) y `_gen/_capture_t10.mjs`
  (solo tablet10 a resolución segura). **Nota**: tablet10 a 2560×1600 **cuelga** bajo
  SwiftShader (framebuffer ~4.1M px); por eso tablet10 se captura a 2048×1280 / 1280×2048.
- Uso: `node _gen/_capture.mjs <ROOT> <OUT_assets> <ruta_msedge.exe>` (servir desde la raíz del
  proyecto). El driver siembra `localStorage` (`trexoroll.save.v1`) y conduce `__trexoroll`.

## Carpetas
- `_gen/` — **generador** (no subir a Play Store).
- `_gen/_mockups_old/` — **mockups antiguos archivados** (ilustraciones previas, NO reales).
  Conservados por si se necesitan de referencia; **no** subir a Play Store.

---
© 2026 SLF Games. Todos los derechos reservados.
