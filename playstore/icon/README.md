# Icono de la app (512×512)

- `icon-512.png` — generado desde `assets/icon.svg` (el mismo icono del juego/PWA).
  Válido para subir a Play Console (Icono de la app). Fondo a sangre (sirve también como
  base maskable para el icono adaptable de Android).
- Para REGENERARLO o cambiar el arte: edita `assets/icon.svg` y vuelve a exportarlo a PNG
  512×512 (cualquier editor SVG, o el método headless documentado en
  `docs/play-store-checklist.md`).

> El icono adaptable de Android (foreground/background) lo genera Android Studio con
> **Image Asset Studio** (clic derecho en `res` → New → Image Asset) usando este PNG/SVG.
