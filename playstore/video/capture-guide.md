# Guía de captura — grabar el juego REAL

> Objetivo: obtener clips/stills **reales** de TREXoRoll, limpios (sin navegador, sin barras del
> sistema, sin cursor, sin datos personales, sin herramientas de desarrollo). Dos vías: **A)
> grabación manual** (recomendada para vídeo con movimiento) y **B) capturas automáticas**
> (stills reales ya generados / secuencias de fotogramas).

---

## Antes de empezar (preparar el juego)
1. **Local**: en `03_juegos/trexo-roll/` ejecuta `npx serve . -p 3000` y abre
   `http://localhost:3000`. (O usa producción: https://st885.github.io/trexo-roll/.)
2. Entra como **invitado** (no uses correo: evitamos datos personales).
3. Para clips **sin el tutorial encima**: juega una vez los niveles 1–5 (el «coach» solo sale
   la primera vez). En repeticiones, el gameplay sale limpio. *(Mostrar el coach también es
   válido: es UI real.)*
4. Silencia la música del juego si vas a poner música libre encima (Ajustes → Efectos/Música),
   para no mezclar audios.

## A) Grabación MANUAL (vídeo con movimiento) — recomendada

### Cómo grabar limpio (Windows)
- **Pantalla completa del juego**: pulsa **F11** en el navegador (oculta barras del navegador).
  O usa el botón **Pantalla** del menú del juego.
- **Grabador**: **Xbox Game Bar** (`Win + G` → botón grabar) o **OBS Studio** (gratis).
  - En OBS: fuente «Captura de ventana» del navegador, recorta a la zona del juego.
  - Oculta el cursor del ratón (en OBS: propiedades de la captura → «Capturar cursor» = OFF).
- **Resolución**: graba a **1920×1080** (horizontal) o **1080×1920** (vertical, en móvil).
- **FPS**: 60 (o 30). **Sin** audio del sistema si vas a añadir música aparte.

### Clips a grabar (horizontal 16:9) — ver `shot-list.md`
| Archivo | Pantalla / Nivel | Qué hacer | Duración |
|---|---|---|---|
| `clip-h2-gameplay-n1.mp4` | **Jugar → Nivel 1** | Inclina y lleva la bola al **hoyo verde** | 6–8 s |
| `clip-h3-recompensas.mp4` | **Niveles → Nivel 6** | Recoge **monedas** y la **estrella** ⭐, esquiva un hoyo rojo | 6–8 s |
| `clip-h4-trampas-moviles.mp4` | **Niveles → Nivel 16** | Muestra los **hoyos rojos** (algunos **se mueven**), esquívalos | 6–8 s |
| `clip-h5-avanzado.mp4` | **Niveles → Nivel 26+** (portales) o **Nivel 4** (cráter) | Entra/sal por un **portal** o rodea el **cráter** | 5–7 s |
| `clip-h6-skins.mp4` | **Menú → Skins** | Desliza por las skins lentamente | 4–5 s |
| `clip-h7-victoria.mp4` | Completa cualquier nivel | Deja ver el modal **¡Nivel superado!** con 3★ | 4–5 s |
| `clip-h8-niveles.mp4` | **Menú → Niveles** | Scroll suave por los mundos | 4–5 s |

### Versión VERTICAL (Shorts/Reels) — graba en MÓVIL
- Abre el juego en el **móvil en vertical** (Chrome) → «Añadir a pantalla de inicio» para pantalla
  completa, o F11. El juego es **responsive** y tiene cámara propia en vertical.
- Usa el **grabador de pantalla del móvil** (sin barra de notificaciones: activa «No molestar»).
- Graba: Nivel 1, Nivel 6, Nivel 16, Skins, Victoria → archivos `clip-v*.mp4` (1080×1920).

### Reglas de limpieza (QA)
- ❌ Nada de barra del navegador, pestañas, marcadores, Android Studio, DevTools, consola.
- ❌ Sin barra de tareas / reloj / notificaciones (usa pantalla completa + No molestar).
- ❌ Sin nombre de usuario real (juega como invitado; el saludo del menú es genérico).
- ❌ No abras pantallas de «compra/anuncio/login» (no existen activas; no grabarlas).

## B) Capturas AUTOMÁTICAS (ya disponibles / opcionales)

### Stills reales (ya generados)
En `playstore/assets/` tienes capturas **reales** de la build actual (menú, gameplay, trampas,
victoria, skins, niveles + tablets). Se pueden usar como **planos fijos** con zoom/pan suave
(efecto «Ken Burns») para montar el vídeo sin grabar movimiento.

### Secuencias de fotogramas reales (a petición)
El generador `playstore/assets/_gen/_capture.mjs` conduce el **juego real** vía CDP y captura
fotogramas. Puede ampliarse para grabar **secuencias** (screencast) de un nivel mientras la bola
rueda (simulando teclas), guardando `frameNNNN.jpg`. Con esas secuencias + **ffmpeg** se ensambla
un clip real. *(Este equipo no tiene ffmpeg instalado; por eso el vídeo final se ensambla en tu
editor — ver `editing-plan.md`.)*

---
© 2026 SLF Games. Todos los derechos reservados.
