# Plan de edición y exportación — Vídeo TREXoRoll

> Cómo montar los clips/stills **reales** en el vídeo final. Incluye **música libre**,
> **secuencia de montaje**, **órdenes ffmpeg** (para cuando lo instales) y una **alternativa
> manual** con editor. **Este equipo NO tiene ffmpeg instalado**, así que el ensamblado final lo
> haces tú con un editor o instalando ffmpeg.

---

## 1. Editor recomendado (gratis)
- **CapCut** (escritorio/móvil), **DaVinci Resolve** (gratis, pro), **Shotcut** u **OpenShot**.
- Para Shorts/Reels verticales: **CapCut** móvil es lo más rápido.

## 2. Música SIN copyright (libre / CC0) — elige UNA
> Descarga la pista, revisa su licencia y **guarda la atribución** si la pide. No uses la música
> del propio juego en el vídeo (su licencia está pendiente de validar).
- **YouTube Audio Library** (studio.youtube.com → Audio): pistas «No requiere atribución».
- **Pixabay Music** (pixabay.com/music) — licencia Pixabay (uso libre, sin atribución).
- **Free Music Archive** (freemusicarchive.org) — filtra por **CC0 / CC-BY** (CC-BY exige crédito).
- **Incompetech** (Kevin MacLeod) — CC-BY (requiere crédito en la descripción).
- Estilo sugerido: **upbeat / aventura / chiptune ligero**, 90–120 BPM, ~25 s. Tono alegre,
  encaja con la estética jurásica/arcade.
- **SFX**: usa los del propio juego (ya están en los clips) o SFX CC0 de Pixabay/freesound (CC0).

## 3. Secuencia de montaje (horizontal 16:9)
Coloca en la línea de tiempo, en este orden (ver `storyboard.md` y `script-es.md`):

```
[0:00-0:03] H1 title card (icono/feature) + texto "TREXoRoll / Inclina, rueda y conquista"
[0:03-0:08] H2 gameplay N1  + texto "Llega al hoyo verde"
[0:08-0:13] H3 recompensas  + texto "Esquiva trampas y recoge recompensas"
[0:13-0:18] H4 trampas/portales + texto "50 niveles progresivos"
[0:18-0:22] H6+H7+H8 skins/victoria/niveles (cortes rápidos) + "Desbloquea recompensas internas"
[0:22-0:25] H9 title card final + "TREXoRoll — aventura jurásica de precisión" + © 2026 SLF Games
```
- Música de fondo en toda la pista; baja el volumen 2–3 dB bajo los SFX.
- Cortes limpios; opcional *whip*/*speed-ramp* corto entre planos. Textos crema `#f6f1e3`
  con sombra, acentos `#f2c14e`/`#34d27b`. Aparición ≤0.3 s.
- **Sin** logos de terceros, barras del sistema ni UI de desarrollo en ningún frame.

## 4. Ajustes de exportación

### Horizontal (Google Play / YouTube)
- Resolución **1920×1080**, **16:9**, **30 fps** (o 60), **H.264 .mp4**, audio AAC 192 kbps.
- Bitrate ~10–12 Mbps. Duración **20–30 s**.

### Vertical (TikTok / Reels / Shorts)
- Resolución **1080×1920**, **9:16**, **30 fps**, **H.264 .mp4**. Duración **15–25 s**.
- Textos GRANDES en la franja superior (zona segura: evita los 200 px de arriba/abajo por la UI
  de cada red).

> Nota Google Play: el tráiler se sube **a YouTube** y se enlaza en la ficha (Play Console pide la
> URL de YouTube). No subas el archivo directamente a Play. *(No subir nada todavía — tú decides.)*

## 5. Órdenes ffmpeg (para cuando instales ffmpeg)
> Instalar: `winget install Gyan.FFmpeg` (o descarga desde gyan.dev / ffmpeg.org). Verifica con
> `ffmpeg -version`. Ejecuta dentro de `playstore/video/`.

**a) Recortar un clip bruto** (de `00:02` a `00:09`, 7 s):
```bash
ffmpeg -ss 00:00:02 -to 00:00:09 -i clip-h2-gameplay-n1.mp4 -c copy h2.mp4
```

**b) Normalizar todos los clips al mismo formato** (1080p/30fps, sin audio) antes de concatenar:
```bash
ffmpeg -i h2.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30" -an -c:v libx264 -pix_fmt yuv420p h2-norm.mp4
```

**c) Concatenar** (crea `list.txt` con `file 'h1-norm.mp4'` … una línea por clip):
```bash
ffmpeg -f concat -safe 0 -i list.txt -c copy video-mudo.mp4
```

**d) Añadir música libre y cerrar al final del vídeo**:
```bash
ffmpeg -i video-mudo.mp4 -i musica-libre.mp3 -map 0:v -map 1:a -shortest -c:v copy -c:a aac -b:a 192k trexoroll-promo-16x9.mp4
```

**e) Generar la versión vertical 1080×1920** (recorte centrado desde 16:9, si no grabaste vertical):
```bash
ffmpeg -i trexoroll-promo-16x9.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy trexoroll-promo-9x16.mp4
```
> Mejor calidad: grabar vertical real (ver `capture-guide.md`) en vez de recortar.

**f) (Opcional) Construir un clip real desde una secuencia de fotogramas** (si generamos
`frameNNNN.jpg` con el driver CDP):
```bash
ffmpeg -framerate 30 -i frame%04d.jpg -c:v libx264 -pix_fmt yuv420p -vf "scale=1920:1080" clip-h2-gameplay-n1.mp4
```

## 6. Alternativa SIN ffmpeg (montaje manual)
1. Importa los clips/stills reales al editor (CapCut/Resolve).
2. Ordena según §3, añade los textos de `script-es.md`, pon la música libre de §2.
3. Exporta con los ajustes de §4. Hecho — sin tocar ffmpeg.

## 7. Checklist final QA antes de exportar
- [ ] Solo aparece material **real** del juego + logo/icono/feature propios.
- [ ] **Sin** navegador, barras del sistema, Android Studio, DevTools, consola, cursor.
- [ ] **Sin** nombre/correo reales (juego como invitado).
- [ ] **Sin** pantallas de compra/anuncio/login; **sin** afirmaciones falsas (ver `script-es.md`).
- [ ] Música **libre/sin copyright** con su licencia/atribución guardada.
- [ ] Duración: 16:9 = 20–30 s · 9:16 = 15–25 s.
- [ ] Logo y © 2026 SLF Games al cierre. Sin marcas de terceros.

---
© 2026 SLF Games. Todos los derechos reservados.
