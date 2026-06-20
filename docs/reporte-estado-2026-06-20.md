# 📋 TREXoRoll — Reporte de estado completo

> Generado por **agente-orquestador** · revisión de solo lectura (sin cambios de código, commit, push ni deploy)
> **Fecha:** 2026-06-20 · **Versión local:** 0.11.1 · **Versión en producción:** 0.8.0
> Documento pensado para compartir con Rubí y definir los siguientes pasos.

---

## 1. Resumen ejecutivo

**TREXoRoll** es un juego web **3D de habilidad** (inclinas un tablero para rodar una bola-dinosaurio hasta el hoyo objetivo, evitando trampas y caídas), con temática jurásica y enfoque **mobile-first**. Stack vanilla (HTML + ES Modules + Three.js vendorizado), sin build step ni dependencias de red.

**Estado:** muy avanzado, **cerca de un MVP móvil sólido**. Tiene gameplay completo, 25 niveles en 5 mundos, controles táctiles robustos, economía (monedas/estrellas), tienda de canje con 3 potenciadores, música, efectos, dino de victoria, mono burlón al fallar, ptero-rescate y una **base de monetización por vidas** (simulada).

**Distancia a MVP sólido:** ~1 iteración. Lo que falta no es features sino **consolidación**: desplegar el gran bloque pendiente (producción está 3 versiones por detrás), **prueba en móvil real**, y decidir el rumbo de monetización/contenido. El bug crítico que bloqueaba la victoria **ya está corregido en local (v0.11.1) pero sin publicar**.

---

## 2. Estado general del proyecto

| Campo | Valor |
|---|---|
| **Ruta** | `03_juegos/trexo-roll/` |
| **Repo remoto** | `https://github.com/St885/trexo-roll.git` |
| **URL producción** | `https://st885.github.io/trexo-roll/` |
| **Rama actual** | `main` |
| **Versión local** | **0.11.1** |
| **Versión en producción** | **0.8.0** (3 versiones por detrás) |
| **Stack** | HTML5 · CSS3 · JavaScript ES6+ (ES Modules) · sin build step |
| **Three.js** | ✅ r160 **vendorizado** en `libs/three.module.js` (vía `importmap`) |
| **Assets locales** | ✅ `assets/audio/trexo-roll-adventure-bg.mp3` (4,6 MB) — único binario |
| **localStorage** | ✅ progreso, bola, estrellas, inventario, banco de vidas |
| **Tests/validaciones** | ✅ `npm test` (5 checks) + `test:graph` + `test:visual` |
| **Dependencias runtime** | **0** (Three.js local; sin CDNs ni APIs) |

---

## 3. Estructura de carpetas y archivos

```
trexo-roll/
├── index.html          ← punto de entrada, todas las pantallas (DOM overlays)
├── package.json        ← scripts de test (sin deps de runtime)
├── README.md · LICENSE · CLAUDE.md · STATUS.md
├── libs/three.module.js  ← Three.js r160 vendorizado
├── assets/audio/         ← música de fondo (mp3) + .gitkeep
├── styles/main.css       ← TODO el estilo/responsive (sistema de diseño)
├── docs/                 ← ficha-producto, mvp, gdd, technical-design, backlog,
│                            changelog, economia, monetizacion
├── tools/                ← validaciones (smoke tests, graph, imports-check…)
└── src/
    ├── main.js           ← arranque (boot)
    ├── core/             ← Game.js (orquestador), InputController.js, ScreenManager.js
    ├── physics/          ← BallPhysics.js (física propia), footprint.js (huella lógica)
    ├── scene/            ← capa 3D: SceneManager, BoardBuilder, Ball, CelebrationDino,
    │                        collectibleArt, decor, dinoArt, textures
    ├── levels/           ← levels.js (25 niveles), collectibles.js (monedas/estrella)
    ├── data/             ← balls.js (5 bolas), dinos.js (especies)
    ├── ui/               ← hud.js
    ├── effects/          ← sfx.js, music.js, tauntMonkey.js, music-procedural.js.bak
    └── utils/            ← constants.js, storage.js
```

**Archivos clave:** `index.html` (14 pantallas), `src/core/Game.js` (hub central, ~900 líneas), `src/scene/SceneManager.js` (Three.js), `styles/main.css` (diseño + responsive), `docs/` (documentación de producto/diseño/economía/monetización).

---

## 4. Funcionalidades implementadas

### Gameplay ✅
- **Bola** con skin por especie y giro de rodadura coherente con la velocidad.
- **Tablero inclinable** (rotación X/Z hasta ~18°).
- **Física propia** (sin librería): gravedad proyectada, paso fijo (`SUBSTEP`), fricción/damping, límite de velocidad, rebote círculo-vs-AABB en paredes, captura de hoyos, **margen de perdón** al borde (`FALL_GRACE`).
- **Hoyo objetivo**, **trampas**, **caída lateral**, **victoria**, **derrota**, **reinicio de bola**, **progresión** con desbloqueo persistente.

### Niveles ✅
- **25 niveles**, todos validados como **superables** (BFS).
- **5 mundos** (Valle Jurásico, Pantano Raptor, Cráter Volcánico, Ruinas Fósiles, Isla TREXo).
- Dificultad creciente (tiers Fácil → Experto) + 8 biomas temáticos.

### Recompensas ✅
- **Monedas** (procedurales, deterministas, escaladas por dificultad) = **1 punto** c/u, con VFX "pop", aura, popup "+1" y sonido.
- **Estrella especial** cada 2 niveles = **+1 estrella de canje** (acumulable, **no da puntos**), con partículas y sonido especial.
- **Puntos** = monedas + bonus de nivel (base/tiempo/vidas).

### Tienda / Canje ✅
- **Vida extra** (2★) · **Bloqueo de trampa** (3★) · **Escudo de caída** (4★).
- **Inventario** + **estrellas** persistidos en localStorage; feedback de compra animado.

### Personajes / Visuales ✅
- **5 bolas** seleccionables (Rex Blanco, Raptor Verde, Dino Rosa, Tricera Amarillo, Bronto Azul), cada una con especie y personalidad.
- **Dinosaurios 3D de celebración** (uno por especie, con ojos/garras/cejas/fosas).
- **Dino de victoria** que emerge del hoyo con polvo + aura + baile.
- **Mono prehistórico** burlón al fallar (overlay 2D + risita).
- **Ptero-rescate** (pterosaurio que salva la bola con el escudo de caída).

### Audio ✅
- **Música de fondo** (MP3, loop, volumen moderado, autoplay-safe, silenciable).
- **Sonidos**: moneda (arcade), estrella (arpegio+chispa), compra, "no se puede", risa del mono, victoria, rugido, fallo, caída, récord, rescate, clic de UI.

### Mobile ✅
- **D-pad** (control principal) + **joystick** analógico (secundario), **touch-action: none**, safe areas, HUD compacto, controles solo en dispositivos táctiles (`body.is-touch`).

---

## 5. Estado de las pantallas

| # | Pantalla | Estado | Funciona | A mejorar / Riesgos |
|---|---|---|---|---|
| 1 | **Landing** | ✅ Sólida | Marca, CTA, bola animada, decoración | Logo aún es texto (no logotipo propio) |
| 2 | **Menú** | ✅ Sólida | Continuar, Jugar, Canje (⭐), Niveles, Bola, Cómo jugar, Sonido, Pantalla completa, barra de progreso | — |
| 3 | **Selector de bola** | ✅ Buena | 5 bolas con preview/nombre/dino/personalidad/✓ | Falta variedad (solo 5) — candidato a skins |
| 4 | **Selector de niveles** | ✅ Buena | Agrupado por **mundos**, estrellas/candado, ✓ completado | — |
| 5 | **Cómo jugar** | ✅ Buena | Tarjetas: objetivo, controles, monedas, estrella, canje | — |
| 6 | **Preparación** | ✅ Buena | Mundo, dificultad, objetivo, monedas/estrella del nivel, toggles de potenciador, cambiar bola | — |
| 7 | **Juego 3D** | ✅ **Corregido** | Tablero, física, recogidas, eventos | Bug de victoria **corregido en v0.11.1** (sin desplegar) |
| 8 | **HUD** | ✅ Buena | Nivel, vidas, tiempo, puntos, 🪙 monedas, poderes activos, pausa | En pantallas <380px oculta el tiempo (decisión) |
| 9 | **Pausa** | ✅ Buena | Continuar, Reiniciar, Canje, Sonido, Menú, poderes activos | — |
| 10 | **Tienda/Canje** | ✅ Buena | 3 recompensas, coste, inventario, feedback | — |
| 11 | **Victoria** | ✅ **Corregida** | Dino, estrellas, recap 🪙/⭐, desbloqueo, siguiente/repetir/menú | (Antes bloqueada — ya resuelto) |
| 12 | **Game Over / Sin vidas** | ✅ Buena | Puntos, nivel, récord + **monetización** | Flujos de monetización **simulados** |
| 13 | **Modal sin vidas** | ✅ Existe | Ver vídeo (+3), Comprar vidas, Continuar (banco), Reintentar, Menú | Integrado en `screen-gameover` |
| 14 | **Monetización placeholder** | ✅ Existe | `screen-adview` (vídeo simulado), `screen-lifepacks` (packs 5/15/50) | Sin SDK/IAP real (por diseño) |

---

## 6. Estado de controles

- **Desktop:** teclado (flechas/WASD) + **arrastre con ratón** sobre el tablero. ✅
- **Mobile:** **D-pad** (4 botones, principal) + **joystick** analógico (secundario). ✅
- **Eventos:** Pointer Events con `setPointerCapture` + `{ passive:false }` + `preventDefault`; `touch-action: none` en lienzo/UI; el arrastre del lienzo **se desactiva en táctil** (evita conflictos).
- **Prioridad:** `joystick > D-pad/teclas > arrastre` (el D-pad pulsado siempre manda).
- **Anti-scroll/zoom:** `overscroll-behavior: none`, `user-scalable=no`, safe areas.
- **Reset robusto:** ante `blur`/`visibilitychange` (sin teclas pegadas).
- **Compatibilidad iPhone/Android:** patrón probado (estilo legendary-adventures). **Conectados a la física:** ✅ confirmado por `input-smoke` (diagonales, prioridad, reset).
- ⚠️ **Pendiente:** prueba en **dispositivo físico real** (iOS Safari + Android Chrome).

---

## 7. Estado de gráficos

| Elemento | Estado | Nota |
|---|---|---|
| **Tablero** | ✅ Bueno | Grueso, cantos oscuros (plataforma), textura por bioma, sombra proyectada |
| **Cámara** | ✅ Robusta | Encuadre por esfera (no recorta esquinas al inclinar), grande y elevado |
| **Fondo** | ✅ Bueno | Cielo por bioma + canopy de jungla + bruma; niebla lejana |
| **Materiales** | ✅ Bien | Tone mapping ACES, rim light, emisivos suaves |
| **Monedas** | ✅ Muy bien | Relieve + borde + aura dorada, giro/flote |
| **Estrella** | ✅ Muy bien | Extruida con bisel + aura, giro elegante |
| **Dinos 3D** | ✅ Bien (mejorables) | Low-poly con ojos/garras/cejas/fosas; **el arte 2D del emblema** es el más flojo |
| **Mono** | ✅ Bueno | Dibujo Canvas 2D estilizado y claro |
| **Ptero-rescate** | ✅ Bueno | Alas membranosas, cresta, ojos |
| **Efectos** | ✅ Bien | Partículas (estrella/rescate/victoria), popups, flashes |
| **Iluminación/sombras** | ✅ Bien | Hemisférica + direccional con shadow map 2048 + sombra de contacto |
| **Rendimiento visual** | 🟡 A verificar | Bueno en teoría (low-poly, recursos liberados por nivel); **falta medir FPS en móvil real** |

**Más flojo / a mejorar:** los **emblemas 2D de las bolas** (`dinoArt.js`) y la variedad de **decoración ambiental**.

---

## 8. Estado de economía y progresión

| Concepto | Estado |
|---|---|
| **Puntos** | Moneda = **1 punto** + bonus de nivel (base 1000 / tiempo / vidas) |
| **Monedas** | Contador por nivel; 1 punto c/u (ya **no** infla la puntuación) |
| **Estrellas de canje** | **+1** por estrella especial; **acumulables**, **no son puntos** ✅ separación clara |
| **Costes de canje** | 2★ / 3★ / 4★ — equilibrados con ~**12★** por recorrido completo |
| **Inventario** | `extraLives`, `trapBlocks`, `fallShields`, `starTokens`, `livesBank` (localStorage) |
| **Progresión** | Desbloqueo por nivel; 5 mundos; "Continuar" al último jugado |
| **Guardado** | localStorage con **fallback en memoria** (tolerante a fallos) |

**Inconsistencias detectadas:** ✅ **ninguna grave**. La economía quedó coherente tras el rebalanceo (moneda 100→1, estrella sin puntos).
🟡 **Observación menor:** el bonus de nivel (1000) ahora domina la puntuación frente a las monedas; conviene **decidir si el "score" debe pesar más las monedas** o mantener el nivel como peso principal.

---

## 9. Estado de monetización

**Base preparada (MVP conceptual, flujos SIMULADOS — sin SDK/IAP real):**

| Vía | Estado |
|---|---|
| **Rewarded video → +vidas** | ✅ Placeholder funcional (`screen-adview`, cuenta atrás → +3 vidas → continúa) |
| **Ver vídeo para ganar vidas** | ✅ Implementado (simulado) |
| **Tienda de vidas / packs** | ✅ `screen-lifepacks` (5/15/50, precios de muestra, compra simulada → banco) |
| **Banco de vidas** | ✅ `livesBank` persistente + "Continuar" |
| **Skins** | ❌ No (propuesto en doc) |
| **Quitar anuncios** | ❌ No (propuesto) |
| **Pase/season pass** | ❌ No (propuesto) |
| **Recompensas diarias** | ❌ No (propuesto) |

📄 **Documentado** en `docs/monetizacion.md` (modelo, arquitectura, integración futura de ads/IAP y otras vías: cosméticos, retención, pase jurásico). **Recomendación:** integrar primero **rewarded ads reales por vidas** (ya prototipado) cuando se empaquete a móvil.

---

## 10. Bugs conocidos y riesgos

| Severidad | Item | Estado |
|---|---|---|
| 🔴 **Crítico** | **Victoria bloqueada** (`makeGlowTexture` sin importar → mataba el render loop) | ✅ **Corregido en v0.11.1 (local)** + blindaje try/catch + check de imports. **Sin desplegar.** |
| 🟠 **Alto** | **18+4 archivos sin commit/deploy** (todo v0.9.0→v0.11.1) | Riesgo de pérdida/divergencia; producción está en v0.8.0 (sin el fix ni las features) |
| 🟠 **Alto** | **Sin prueba en móvil real** (iOS/Android) | Controles/audio/FPS validados solo en lógica/DevTools |
| 🟡 **Medio** | **Audio móvil / autoplay** | Música arranca tras gesto; verificar en iOS Safari real |
| 🟡 **Medio** | **Rendimiento móvil** | No medido en dispositivo (shadow map 2048, partículas) |
| 🟡 **Medio** | **Monetización solo simulada** | No es bug; falta integración real cuando toque |
| 🟢 **Bajo** | `music-procedural.js.bak` orphan + `.gitkeep` redundante | Limpieza menor |
| 🟢 **Bajo** | Emblemas 2D de bola algo simples | Mejora visual futura |

**Verificados como OK (no bugs):** caída lateral + `FALL_GRACE`, escudo/ptero-rescate, canje, localStorage (con fallback), controles móviles, objetos/esquinas que ya no desaparecen al inclinar, rutas **relativas** compatibles con GitHub Pages.

---

## 11. Validaciones disponibles

```bash
cd 03_juegos/trexo-roll

npm test            # física + 25 niveles superables + pipeline de control
                    #   + colocación de coleccionables + imports-check
npm run test:graph  # carga TODO el grafo de módulos (incl. Three.js) en Node
npm run test:visual # ejerce dibujo Canvas 2D + construcción 3D (sin navegador)

npm start           # servidor local → http://localhost:3000 (prueba manual)
```

**Cobertura:** física (direcciones/caída/trampa/meta), validador de niveles (BFS), `input-smoke` (D-pad/joystick/prioridad/reset), `collectibles-smoke` (105 monedas + 12 estrellas válidas/deterministas), `imports-check` (anti-regresión del bug de victoria), grafo de módulos, smoke visual (texturas/dinos/monedas/estrella/ptero/tableros).
**Manual recomendado:** móvil real (iOS+Android), giro de pantalla, victoria→siguiente nivel, flujo sin vidas, mute.

---

## 12. Resultado de validaciones (ejecutadas 2026-06-20, sin modificar nada)

| Comando | Resultado |
|---|---|
| `npm test` | ✅ **OK** — todo verde (control móvil, coleccionables, **imports-check ✅**) |
| `npm run test:graph` | ✅ **Grafo de módulos OK** |
| `npm run test:visual` | ✅ **Código de dibujo/3D sin errores** |

**Errores:** ninguno. **Warnings:** solo avisos benignos de Git `LF will be replaced by CRLF` (fin de línea en Windows; no afectan). **Estado final de validaciones: VERDE.**

---

## 13. Estado de producción

- **Repo:** `github.com/St885/trexo-roll` · **rama:** `main`.
- **GitHub Pages:** ✅ configurado, sirve desde `main` (despliegue automático al hacer push; sin workflow de Actions).
- **URL:** https://st885.github.io/trexo-roll/ → actualmente **v0.8.0**.
- **Sincronización:** ❌ **No sincronizada.** Local = **v0.11.1**; hay **18 archivos modificados + 4 nuevos** sin commit (≈979 inserciones / 140 borrados acumulados).
- **Implica:** producción **no tiene** el fix de victoria ni las features v0.9.0–v0.11.1 (mundos, packs/monetización, mono burlón, economía nueva, mejoras visuales, dino de victoria). El **fix crítico de victoria solo existe en local**.
- **Último commit publicado:** `ce3a4d0` (v0.8.0).

> ⚠️ Recomendación: **commit + deploy del bloque pendiente es la acción prioritaria** (ver §14).

---

## 14. Recomendaciones de mejora

### 🔴 Prioridad crítica
1. **Desplegar el bloque pendiente** (v0.9.0→v0.11.1) con el **fix de victoria**. Producción está atrasada y sin el fix publicado.
2. **Prueba en móvil real** (iOS Safari + Android Chrome): controles, audio, FPS, safe areas, victoria→siguiente nivel.

### 🟠 Prioridad alta
3. **Medir rendimiento móvil** (FPS, sombras 2048, partículas) y ajustar si hace falta (p. ej. shadow map 1024 en móvil).
4. **Decidir e integrar monetización real** (rewarded ads por vidas) si se va a app — hoy es simulada.
5. **QA del flujo sin vidas** completo en móvil (vídeo → continuar; packs → banco → continuar).

### 🟡 Prioridad media
6. **Mejorar emblemas 2D** de las bolas (lo más flojo visualmente).
7. **Logotipo propio** de TREXoRoll (hoy es tipografía).
8. **Pulir economía de "score"** (decidir peso monedas vs bonus de nivel).
9. **Más decoración ambiental** y variación entre mundos.

### 🟢 Prioridad baja
10. **Skins** (bolas/dinos/tableros) como primera capa cosmética monetizable.
11. **Recompensa/racha diaria** (retención).
12. **Pase jurásico** + eventos temporales.
13. Limpieza: `music-procedural.js.bak`.

---

## 15. Roadmap recomendado

### ▶ Próxima iteración (ya)
- Commit + **deploy v0.11.1** (con fix de victoria).
- **Prueba en móvil real** + checklist de QA.
- Medir FPS móvil y ajustar sombras/partículas si procede.

### 📦 Versión 1.1 (próxima estable)
- Monetización **rewarded ads real por vidas** (sustituir placeholder).
- Mejora de **emblemas 2D** + logotipo.
- **Recompensa diaria** básica (retención).
- Pulido de balance de score.

### 📦 Versión 1.2
- **Skins** (bola/dino/tablero) + "quitar anuncios".
- Más decoración/variedad por mundo.
- Packs de estrellas + bundle inicial.

### 📱 Preparación para app móvil (Android/iPhone)
- **PWA** (manifest + service worker) como paso intermedio para "instalar".
- **Capacitor** para empaquetar a Android/iOS nativo.
- Integrar **SDK de ads** (AdMob/Unity) + **IAP** (Play Billing/StoreKit) en los flujos ya diseñados (`_watchAd`, `_buyLifePack`).
- Iconos/splash, safe areas nativas, gestión de ciclo de vida (pausa al perder foco).

---

## 16. Preguntas abiertas para Stefano

1. **Nombre del recurso premium/estrella:** ¿se queda "estrella de canje", o le ponemos marca propia (p. ej. **DinoStars**, **Ámbar Jurásico**, **Fósiles**)?
2. **Nombre de la moneda blanda** (monedas del tablero): ¿"monedas" o algo temático (p. ej. **Huevos** / **Pepitas**)?
3. **Monetización primero:** ¿**anuncios** (rewarded por vidas) o **tienda/IAP**? ¿O ambos a la vez?
4. **Foco de la próxima iteración:** ¿**gráficos** (emblemas/logo/decoración) o **más contenido** (niveles/mundos)?
5. **PWA vs Capacitor:** ¿preparamos **PWA** ya (rápido, "instalable") o vamos directo a **Capacitor/Android**?
6. **Deploy ahora:** ¿confirmas que **publique v0.11.1** (incluye el fix de victoria) o prefieres probar antes en local/móvil?
7. **Peso del "score":** ¿quieres que las **monedas pesen más** en la puntuación, o el bonus de completar nivel sigue siendo el principal?
8. **Skins de pago:** ¿te interesa que las próximas bolas/dinos sean **cosméticos monetizables** o gratuitos por progresión?

---

**Estado final del proyecto:** 🟢 **Sólido y funcional en local (v0.11.1), con todas las validaciones en verde.** El paso más urgente es **publicar el bloque pendiente** (que incluye el fix de victoria) y **probar en móvil real**.

*— Fin del reporte —*
