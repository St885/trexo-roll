# Checklist Google Play Console — TREXoRoll

Pasos para publicar TREXoRoll (empezando por **prueba interna**). El material de la ficha
está en `playstore/`. Build y firma: `docs/android-build.md` y `docs/release-process.md`.

## A) Cuenta y app
- [ ] Crear cuenta de **Google Play Console** (pago único de registro de desarrollador).
- [ ] **Crear app** → Nombre: `TREXoRoll` · Idioma por defecto: Español (España/LatAm) ·
      Tipo: **Juego** · **Gratis**.
- [ ] Categoría sugerida: **Juegos → Puzzle** (alternativa: Casual / Arcade).
- [ ] Etiquetas: puzzle, arcade, casual, dinosaurios.

## B) Ficha de Play Store (Store listing)
- [ ] **Título** (≤30): `TREXoRoll` → `playstore/descriptions/title.txt`.
- [ ] **Descripción corta** (≤80) → `playstore/descriptions/short.txt`.
- [ ] **Descripción larga** (≤4000) → `playstore/descriptions/full.txt`.
- [ ] **Icono** 512×512 → `playstore/icon/icon-512.png` ✅ (generado).
- [ ] **Gráfico destacado** 1024×500 → `playstore/feature-graphic/feature-1024x500.png` ✅.
- [ ] **Capturas** (mín. 2 de teléfono) → ver `playstore/screenshots/README.md`.
- [ ] Contacto de soporte: `stefano.luisf@gmail.com`.

## C) Política de privacidad
- [ ] URL pública: `https://st885.github.io/trexo-roll/privacy.html` (tras desplegar la web).
  - Fuente: `privacy.html` (raíz) · markdown: `docs/privacy-policy.md`.

## D) Contenido de la app (App content)
- [ ] **Clasificación de contenido** (cuestionario IARC): es un juego casual sin violencia
      real, sin contenido sensible → resultado esperado **PEGI 3 / Apto para todos**.
- [ ] **Público objetivo y contenido**: apto para todas las edades. Si marcas que incluye
      niños, cumple la política de "Diseñado para familias" (sin anuncios ni datos → fácil).
- [ ] **Data Safety** (Seguridad de los datos) — ver sección F.
- [ ] **Anuncios**: **No** contiene anuncios.
- [ ] **Acceso a la app**: todo el contenido disponible sin login (modo invitado/local) →
      indícalo (no requiere credenciales para revisar).
- [ ] **Gobierno/financiero/salud/COVID**: No aplica.

## E) Versión (Release)
- [ ] Crea una **prueba interna** y sube el `app-release.aab` (`docs/release-process.md`).
- [ ] Notas de la versión → `playstore/release-notes/internal-v1.txt`.
- [ ] Añade testers (emails). Comparte el enlace de prueba interna.
- [ ] (Cuentas nuevas) Play exige un periodo de **prueba cerrada** con testers antes de
      Producción: crea también una pista **Closed testing** cuando toque.

## F) Data Safety (formulario) — coincide con la realidad
- **¿Recopila o comparte datos del usuario?** → **No** (nada sale del dispositivo).
- Datos almacenados solo en el dispositivo: progreso del juego + nombre de perfil local.
- **Ubicación**: No · **Info personal**: No · **Mensajes**: No · **Fotos**: No ·
  **Contactos**: No · **Actividad de la app**: No se recopila/transmite.
- **Anuncios**: No · **Analítica**: No (en esta versión).
- **Cifrado en tránsito**: N/A (no hay transmisión).
- **Eliminación de datos**: el usuario puede borrar desde Ajustes → Reiniciar progreso.

> ⚠️ Mantén esto coherente: NO declares Analytics, anuncios ni compras mientras no estén
> activos. Cuando se active Firebase/Analytics en el futuro, **actualiza Data Safety y la
> política** antes de publicar esa versión.

## G) Permisos
- [ ] Revisa `AndroidManifest.xml`: solo `INTERNET` (técnico). Sin ubicación/cámara/micro/
      contactos. Elimina cualquier permiso que algún plugin añada y no uses.

## H) Subida y revisión
- [ ] Sube AAB → completa todas las secciones (Play marca en verde lo que falta).
- [ ] Envía a revisión de la pista elegida. La prueba interna suele estar lista en minutos;
      producción puede tardar más.

---

## Pruebas en móvil real (antes de promocionar) — Parte 11
1. [ ] Instalar la app (desde Android Studio Run, o el AAB vía Internal testing/`bundletool`).
2. [ ] Abrir la app (splash + carga).
3. [ ] Pantalla inicial / acceso: textos correctos; Google/Apple/Samsung como **«Próximamente»**.
4. [ ] **Continuar como invitado** → entra al menú.
5. [ ] **Jugar nivel 1**: el tablero responde a la inclinación.
6. [ ] **Controles táctiles**: D-pad y joystick, en vertical y horizontal.
7. [ ] **Sonido**: música y efectos suenan tras la primera interacción.
8. [ ] **Pausa**: botón ⏸ funciona; reanudar/reiniciar/menú.
9. [ ] **Menú**: tiles (Diario, Dino, Skins, Cofre, Canje, Niveles) navegan bien.
10. [ ] **Nivel 10** (jefe): banner + ambiente, sin romper la jugabilidad.
11. [ ] **Nivel 11** (contrarreloj): cronómetro y penalización.
12. [ ] **Cohetes**: de colores (fuegos) y rojo (pterodáctilo) se activan.
13. [ ] **Cavernícola** (nivel 5/10): aparece y no toca hoyos.
14. [ ] **Victoria**: estrellas + celebración del dino.
15. [ ] **Derrota**: game over + mono burlón.
16. [ ] **Cerrar y reabrir** la app.
17. [ ] **Progreso local** conservado (nivel, estrellas, skins, monedas).

> Extra: probar en un móvil pequeño (vertical) y uno grande; verificar safe-areas (notch) y
> que nada tape los controles.

---

## Regenerar assets gráficos (icono / feature) — método headless (opcional)
El icono y el feature se generaron desde `assets/icon.svg`. Para rehacerlos sin editor:
1. Crea un HTML que muestre `assets/icon.svg` (icono) o una composición con el título
   (feature) — ver el commit que añadió `playstore/`.
2. Renderiza con un navegador headless al tamaño exacto:
   ```
   msedge --headless=new --disable-gpu --force-device-scale-factor=1 \
     --window-size=512,512 --screenshot=icon-512.png file:///.../icono.html
   ```
   (1024×500 para el feature). O simplemente expórtalo desde tu editor SVG/diseño.
