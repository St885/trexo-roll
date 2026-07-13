# Auditoría de assets y licencias — TREXoRoll

> Proyecto: **TREXoRoll** · Publicador: **SLF Games** · Fecha: 2026-06-30
> Objetivo: dejar claro qué assets son **propios/procedurales**, cuáles son de **terceros** y
> cuáles están **pendientes de verificar** su licencia antes de publicar comercialmente.
> **No se inventan licencias.** Lo no verificado se marca como **PENDIENTE**.

---

## 1. Assets propios / procedurales (generados en runtime) — riesgo BAJO
La mayor parte del arte de TREXoRoll **no usa archivos externos**: se genera por código.
- **Texturas** (emblema T-Rex de la bola, superficie del tablero, cielo, huellas, biomas):
  Canvas 2D en `src/scene/textures.js` y `src/scene/decor.js`.
- **Geometría 3D** (bola, tablero, rocas, huevos, helechos, fósiles, hoyos, portales, dinos de
  celebración, cavernícola, pterosaurio): primitivas de **Three.js** en `src/scene/*`.
- **Efectos de sonido (SFX)**: tonos **sintetizados** con Web Audio API en `src/effects/sfx.js`.
- **Mono prehistórico, cohete, críters**: dibujo procedural propio.
→ **Originales de SLF Games.** Sin dependencia de material con copyright de terceros.

## 2. Assets generados internamente (archivos propios) — riesgo BAJO (verificar)
- `assets/icon.svg` — icono/favicon de la app. SVG vectorial, aparentemente **original**
  (dibujado a mano/código). *Acción:* confirmar que no incrusta logotipos de terceros.
- `playstore/icon/icon-512.png` y `playstore/feature-graphic/feature-1024x500.png` — gráficos
  de la ficha de Play Store. *Acción:* confirmar que se generaron a partir de arte propio.

## 3. Componentes de terceros con licencia conocida — riesgo BAJO
- **Three.js** (motor 3D) — licencia **MIT**. Vendorizado en `libs/three.module.js`.
  *Atribución:* incluida en `legal.html` y términos. Cumple para uso comercial.
- **Capacitor** (empaquetado Android) — licencia **MIT**. Solo build/runtime nativo.

## 4. Assets de terceros / PENDIENTES de verificar — ⚠️ riesgo a resolver ANTES de publicar
| Asset | Uso | Origen indicado | Riesgo | Acción recomendada |
|---|---|---|---|---|
| `assets/audio/trexo-roll-adventure-bg.mp3` (≈4.8 MB) | **Música de fondo** (la reproduce `src/effects/music.js`) | **Pixabay Music** — fuente indicada por Stefano (2026-07-13). Búsqueda de origen: https://pixabay.com/music/search/aventura/ · Nombre de archivo en el código: `nastelbom-adventure-471461(trexob).mp3` | **BAJO condicionado** | Ver §4.1 — **pendiente archivar la evidencia del track exacto antes de producción**. |

### 4.1 Música de fondo — estado detallado (actualizado 2026-07-13)

- **Asset:** `assets/audio/trexo-roll-adventure-bg.mp3`
- **Fuente indicada por el usuario:** **Pixabay Music**
- **URL de búsqueda/fuente:** https://pixabay.com/music/search/aventura/
- **Estado:** Licencia **gratuita / permitida** según **confirmación del usuario**.
- **Riesgo:** **BAJO condicionado** *(antes: ALTO)*.

> **Riesgo bajo condicionado:** el usuario confirma que la pista proviene de **Pixabay Music** y
> que es **música gratuita / de licencia permitida**. **Pendiente archivar la URL exacta del track
> y la evidencia de licencia antes de producción.**

**Antes de la publicación final en Play Store**, archivar la evidencia de licencia del **track
exacto** utilizado:

- [ ] **URL exacta del track** (no solo la búsqueda).
- [ ] **Nombre del track.**
- [ ] **Autor.**
- [ ] **Fecha de descarga.**
- [ ] **Captura o copia de la licencia** aplicable en Pixabay.
- [ ] **Archivo de licencia**, si existe.

> ⚠️ **No se han inventado** el nombre del track, el autor, la URL exacta, el tipo de licencia
> concreto ni si la atribución es obligatoria. Todo eso queda **pendiente de confirmar** con la
> página real del track. Guardar la evidencia en una carpeta **no pública** (fuera del repo).
>
> **No se ha borrado, reemplazado ni modificado ningún archivo de audio.**
| ~~`assets/images/backgrounds/jurassic-world-bg.png`~~ | ~~Imagen de fondo~~ | Desconocido | ✅ **RESUELTO (2026-07-02)** | **Eliminado del proyecto.** El fondo de escena ahora se genera de forma **PROCEDURAL** (Canvas 2D, original de SLF Games) en `src/scene/textures.js` → `makeSceneBackgroundURL`, inyectado como data URL en la variable CSS `--bg-jungle` (antes `--bg-jurassic`). Sin archivo binario, sin nombre de marca, sin licencia que verificar. El PNG se movió a cuarentena fuera del repo. |

## 5. Búsqueda de marcas / IP de terceros en el proyecto
Búsqueda de nombres sensibles (Jurassic Park, Mario, Pokémon, Disney, Royal Match, etc.) en
**código y textos visibles del juego**: **sin coincidencias** salvo el **nombre de archivo**
`jurassic-world-bg.png` (ver §4) y el uso **genérico** del adjetivo «jurásico/jurassic» (el
periodo geológico **no** es marca registrada; «Jurassic Park»/«Jurassic World» **sí** lo son).
- El **nombre del juego** `TREXoRoll` y «T-REXo» son propios; «T-Rex» es un término genérico
  (especie), no exclusivo de ninguna marca.

## 6. Riesgos detectados (resumen)
1. **Música de fondo (mp3)** → **riesgo BAJO condicionado** *(actualizado 2026-07-13; antes ALTO)*.
   Fuente indicada por el usuario: **Pixabay Music** (https://pixabay.com/music/search/aventura/).
   **Pendiente**: archivar la **URL exacta del track** y la evidencia de licencia antes de
   producción (ver §4.1).
2. ~~**Imagen de fondo (png)** con **nombre de marca** y licencia desconocida~~ → ✅ **RESUELTO
   (2026-07-02)**: reemplazada por un **fondo procedural propio** (Canvas 2D); PNG eliminado.
3. Iconos/gráficos de ficha: confirmar que parten de arte propio (riesgo bajo).
4. ⚠️ **Capturas de Play Store** (`playstore/assets/phone-*-real.png`, `tablet*-real.png`) se
   tomaron con el **fondo antiguo**; deben **regenerarse** con el fondo procedural antes de subir.

## 7. Recomendaciones
1. **Antes de generar el AAB de producción**, resolver §4:
   - **Archivar la evidencia de licencia del track exacto** de Pixabay (URL del track, nombre,
     autor, fecha de descarga, captura de la licencia). Fuente ya documentada en **§4.1**;
     riesgo rebajado a **BAJO condicionado**. (Pendiente la evidencia.)
   - ~~Renombrar/sustituir el fondo~~ → ✅ **HECHO**: fondo **procedural propio** (`makeSceneBackgroundURL`).
   - **Regenerar las capturas de Play Store** con el nuevo fondo procedural (las actuales muestran el fondo antiguo).
2. Mantener este archivo actualizado cada vez que se añada un asset binario.
3. Regla de oro (ya en `assets/README.md`): **no colocar material con copyright** en `assets/`.
4. Guardar evidencias de licencia (capturas, recibos, IDs) en una carpeta **no pública**
   (p. ej. `playstore/private/`, ya ignorada por git).

> **Nota:** este informe es orientativo y **no sustituye asesoramiento legal profesional**.

---

© 2026 SLF Games. Todos los derechos reservados.
