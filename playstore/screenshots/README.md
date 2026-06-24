# Capturas de pantalla (Play Store)

Google Play pide **mínimo 2** capturas de teléfono (lado entre 320 y 3840 px; recomendado
1080×1920 vertical). Sugeridas para TREXoRoll:

1. **Menú principal** (jerarquía premium + barra de progreso).
2. **Gameplay** de un nivel (tablero 3D + HUD + controles táctiles).
3. **Selector de skins** o **cofre jurásico** (coleccionables).
4. **Pantalla de victoria** con estrellas y celebración del dino.
5. **Nivel jefe / contrarreloj** (HUD especial).

## Cómo capturarlas (forma fiable)
- En un **móvil real** o emulador con la app instalada: juega y usa la captura del sistema.
- O con **Android Studio** → Running Devices → icono de cámara.
- O desde **Chrome/Edge** abriendo el juego (`npm start`) con DevTools → modo dispositivo
  (1080×1920) → capturar.

## Nota
- Hay una previsualización estática del menú en `docs/menu-preview.html` (útil para la
  captura del menú sin arrancar todo el juego).
- Evita capturas con texto recortado o controles tapados. Una de gameplay vertical y una del
  menú suelen ser suficientes para empezar la prueba interna.
