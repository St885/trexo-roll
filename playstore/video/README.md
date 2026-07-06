# playstore/video/ — Paquete del vídeo promocional (TREXoRoll)

Documentación para producir el **tráiler real** del juego (Google Play + redes). Todo se basa en
**material real** de TREXoRoll (capturas/grabaciones de la build actual) + logo/icono/feature
propios. Sin mockups, sin recrear el juego en Canvas, sin marcas de terceros.

## Documentos
1. **`storyboard.md`** — guion visual plano a plano (16:9 principal + 9:16 vertical).
2. **`shot-list.md`** — lista de clips a capturar (pantalla/nivel real, acción, duración).
3. **`script-es.md`** — textos en pantalla y voz en off (ES + variante EN), reglas de cumplimiento.
4. **`capture-guide.md`** — cómo grabar el juego real limpio (manual + opción automática).
5. **`editing-plan.md`** — montaje, música libre, exportación (ffmpeg + alternativa con editor).

## Resumen rápido
- **Principal**: horizontal **16:9**, **20–30 s**, para YouTube (Play Console enlaza el tráiler de YouTube).
- **Vertical**: **1080×1920**, **15–25 s**, textos grandes, para TikTok/Reels/Shorts.
- **Música**: solo **libre/sin copyright** (Pixabay Music, YouTube Audio Library, FMA CC0). **No**
  usar la música del propio juego (licencia pendiente).
- **Restricciones**: sin UI de desarrollo, sin barras del sistema, sin datos personales, sin
  pantallas de compra/anuncio/login, sin afirmaciones falsas.

## Estado
- 🟡 **No se ensambla el MP4 aquí**: este equipo **no tiene ffmpeg** instalado. El vídeo final lo
  montas tú con un editor (CapCut/DaVinci) o instalando ffmpeg (órdenes en `editing-plan.md`).
- ✅ Hay **capturas reales** reutilizables en `../assets/` (planos fijos con zoom/pan si no grabas vídeo).
- 🚫 No se hace git push, deploy, AAB ni subida a YouTube/Play (lo decides tú).

---
© 2026 SLF Games. Todos los derechos reservados.
