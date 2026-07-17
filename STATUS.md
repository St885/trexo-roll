# STATUS — TREXoRoll

| Campo | Valor |
|---|---|
| **Versión** | **0.28.0** (GitHub/web) — 🚀 **Release estable: login real con Firebase y celebraciones 3D**. Auth real (Google en localhost + email/password + invitado; CSP corregida; sin contraseñas guardadas) · pantalla de acceso premium · **4 dinos 3D de victoria** (T-Rexo, Triceratops, Raptor, Parasaurio; brachio ⏳ procedural) con fallback procedural y Android performance sin GLB · perfiles gráficos quality/balanced/performance · assets optimizados, backups fuera de repo/build. **AAB de Prueba interna v0.28.0 preparado localmente (2026-07-18)**: `versionCode 5` / `versionName 0.28.0`, targetSdk 35, firmado con la nueva upload key `trexoroll-upload`; **pendiente de subida manual a Prueba interna** (ver sección «Preparación AAB v0.28.0» abajo). No producción |
| **Android** | `applicationId` `com.st885.trexoroll` · **`versionCode 5`** · **`versionName 0.28.0`** · `minSdk 22` · `compileSdk 35` · `targetSdk 35` · **`screenOrientation=fullSensor`** · permiso único `INTERNET` (sin AD_ID/GET_ACCOUNTS/READ_CONTACTS/ubicación/cámara/micro; sin Ads/Analytics/compras/Play Games) |
| **Estado** | ✅ Web local funcionando (acceso+juego) · ✅ **Google login OK en localhost** · ✅ email/password conectado · ✅ invitado intacto · ✅ Firebase config real activa · Analytics **OFF** · Cloud Sync **OFF** · 📲 Android listo para probar (Google requiere SHA-1/256 en Firebase) · ✅ GitHub sincronizado (release 0.28.0). ⚠️ Pendientes: 1) SHA-1/SHA-256 del keystore → Firebase Android · 2) probar Google Sign-In en Samsung real · 3) rendimiento en Samsung real (no solo emulador) · 4) revisar scroll de la pantalla de victoria · 5) GLB de Braquiosaurio bebé azul · 6) Play Console Data Safety antes de publicar login real · 7) AAB interno solo cuando se autorice |
| **Fecha** | 2026-07-18 |
| **Ruta** | `03_juegos/trexo-roll/` |
| **Stack** | Three.js r160 (vendorizado) · JS ES6+ · CSS3 · Web Audio |
| **Dependencias runtime** | 0 (Three.js en `libs/`) |
| **Niveles** | 50 (Fácil → Experto) en 10 mundos, todos validados como superables |
| **Bolas** | 5, cada una con **especie de dino distinta** (T-Rex, Raptor, Parasaurio, Triceratops, Braquiosaurio) |
| **Biomas** | 8 ambientaciones jurásicas |
| **Git** | Repo `github.com/St885/trexo-roll`, rama `main` · commit prod **`8bfc40a`** |
| **Deploy** | ✅ GitHub Pages — https://st885.github.io/trexo-roll/ · **v0.24.8 (2026-06-28, commit 8bfc40a)** |

---

## 📦 Preparación AAB v0.28.0 — Prueba interna (2026-07-18)

> **AAB release firmado generado localmente para la Prueba interna de Google Play.
> NO subido a Play Console. NO producción. NO se tocó Play App Signing.**
> Subida manual pendiente por Stefano.

| Ítem | Valor |
|---|---|
| **Play App Signing** | ✅ Activo (no modificado) |
| **Nueva upload key** | ✅ Activa y aceptada en Play Console |
| **Keystore local** | `~/Documents/AndroidKeys/trexoroll-upload-key-2026.jks` (fuera del repo) |
| **Alias** | `trexoroll-upload` |
| **SHA-1 upload key** | `EE:9B:67:BD:31:05:9F:24:31:5A:8E:C8:F0:AB:B8:D8:2C:60:A8:C3` (coincide con Play Console) |
| **SHA-256 upload key** | `8D:1B:01:A9:6E:95:C4:90:7B:58:D8:AE:6B:56:79:6C:56:DD:77:AC:67:DE:7A:E9:5C:A2:AA:E8:C0:A9:E1:F6` (coincide) |
| **versionCode / versionName** | `5` / `0.28.0` |
| **applicationId** | `com.st885.trexoroll` (sin cambios) |
| **SDK** | targetSdk 35 · minSdk 22 · compileSdk 35 |
| **Permisos** | `INTERNET` + `…DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (app-scoped, benigno, auto-AndroidX). Sin Ads/Analytics/compras/Cloud Sync |
| **google-services.json** | Colocado local en `android/app/` (project `trexoroll`; incluye las 3 SHA: debug, Play App Signing y nueva upload). **Ignorado por git** |

### Firma release (local, NO versionada)
- `android/app/build.gradle` lee `android/keystore.properties` si existe (con guarda: no rompe `assembleDebug`).
- `android/keystore.properties` con `storeFile`/`keyAlias` reales; **contraseñas rellenadas a mano por Stefano**; archivo **ignorado por git**. Sin contraseñas en el repo.
- Debug signing intacto (`AndroidDebugKey`).

### Builds (reproducibles, JDK 21 del JBR)
| Paso | Resultado |
|---|---|
| `npm run build` | ✅ OK → `www/` |
| `npm run cap:sync` | ✅ OK |
| `./gradlew clean assembleDebug` | ✅ BUILD SUCCESSFUL (APK debug ~17 MB) |
| `./gradlew bundleRelease` | ✅ BUILD SUCCESSFUL — `validateSigningRelease` + `signReleaseBundle` |
| `jarsigner -verify` del AAB | ✅ `jar verified` (aviso de cadena self-signed = normal en upload key) |
| Cert firmante del AAB (`keytool -printcert`) | ✅ SHA-1/256 = nueva upload key |
| `:app:signingReport` (variante release) | ✅ alias `trexoroll-upload`, mismas SHA |

- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Tamaño:** ~16 MB (16 834 941 bytes)
- **Sin** `_backup`, keystore, `.env` ni secretos dentro del bundle.

### Próximo paso (manual — NO automatizado)
Subir `app-release.aab` en **Play Console → TREXoRoll → Probar y publicar → Pruebas → Prueba interna → Crear nueva versión**. **No producción.**

---

## 🖥️ Validación Mac / Android Studio — 2026-07-13

> El proyecto viene de **Windows** y queda validado en **Mac**. **No se generó AAB ni APK de
> release, no se subió nada a Play Store y no se tocó ningún keystore.**

### Verificado por ejecución (comandos reproducibles)

| Paso | Resultado |
|---|---|
| `npm run build` | ✅ OK → `www/` |
| `npm run cap:sync` (`npx cap sync android`) | ✅ OK → assets a `android/app/src/main/assets/public` |
| `npm test` (17 smoke tests) | ✅ OK · 0 fallos |
| `npm run test:graph` / `test:visual` / `test:ui` | ✅ OK |
| **APK debug** compilado con `gradlew assembleDebug` (JDK 21 del JBR) | ✅ BUILD SUCCESSFUL |
| **App ejecutada en emulador Pixel 8** (API 37, arm64) vía `adb install` | ✅ Arranca, login invitado, juego 3D, niveles superados, **0 errores JS** |

**🐛 Bug de migración Windows→Mac corregido:** `node_modules/.bin/cap` y `android/gradlew`
habían **perdido el bit de ejecución** (`-rw-rw-r--`), y `npx cap sync android` fallaba con
`Permission denied`. Restaurado con `chmod +x`. Sin esto **ningún build de Android funciona en
Mac**. (Ambos están fuera de git, así que no queda rastro en el repo: repetirlo tras un `clone`
o un `npm install` si vuelve a fallar.)

### Confirmado por Stefano (configuración de Android Studio / consolas — no verificable desde CLI)

- Android Studio configurado en Mac · **Gradle Sync OK**.
- **Android SDK** apuntando a la ruta de Mac: `~/Library/Android/sdk`.
- **Gradle JDK** corregido a **Embedded JDK / JetBrains Runtime**.
- **Firebase (Android)**: añadidas las **SHA-1/SHA-256 de debug** y las de **Play App Signing**.
- **`google-services.json`** actualizado **localmente**.
- **Play App Signing: ACTIVO**.

> ℹ️ `android/` está **completo en `.gitignore`** (0 archivos en git). Por eso
> `google-services.json`, `local.properties` y `gradle.properties` **nunca llegan al repo**
> (protección de secretos). Tras clonar hay que regenerar el proyecto Android con
> `npx cap add android` / `npx cap sync android` y volver a colocar `google-services.json`.

### Pendientes (bloqueantes de release)

1. **No se tiene la contraseña del keystore antiguo** → hay que **crear una nueva upload key**
   y **solicitar el cambio de clave de subida** en Play Console (posible porque **Play App
   Signing está activo**).
2. **Configurar la firma de release**: `android/app/build.gradle` **no tiene `signingConfig`**
   (0 referencias) → hoy `bundleRelease` produciría un AAB **sin firmar**.
3. **Alinear versiones** antes del AAB: Android sigue en `versionCode 4` / `versionName 0.26.0`
   frente a `package.json` **0.28.0**.
4. **Generar el AAB solo cuando Stefano lo autorice.** **Nada de Play Store todavía.**
5. Probar en **Samsung real** (rendimiento y Google Sign-In); hasta ahora solo emulador.

---

## 📦 Base para el próximo AAB final (Play Store)

> **TREXoRoll v0.24.8** (commit **`8bfc40a`** en `main`) queda fijada como la **versión base
> aprobada** para generar el **próximo AAB final** si se continúa con Play Store.
> - El AAB se genera **localmente** desde esta versión: `npm run build && npm run cap:sync` y
>   luego firmar con el keystore (fuera del repo). **No se generó AAB en este paso.**
> - `appId` Android: `com.st885.trexoroll`. Pendientes de cuenta en Play Console: Data Safety,
>   clasificación IARC, política de privacidad publicada, verificación de identidad
>   (ver `docs/play-store-policy-audit.md`, `playstore/data-safety-draft.md`,
>   `playstore/content-rating-draft.md`).
>
> **🆕 Cumplimiento target SDK 35 + versionCode 2** — 2026-07-01. Play exige `targetSdk ≥ 35`
> **y** un `versionCode` no usado (el 1 ya estaba consumido).
> - `android/app/build.gradle`: `versionCode` **1 → 2**, `versionName` **"1.0" → "0.25.2"**
>   (`applicationId` `com.st885.trexoroll` intacto).
> - `android/variables.gradle`: `compileSdkVersion`/`targetSdkVersion` **34 → 35** (`minSdk 22`
>   intacto). Verificado con Gradle `:app:properties` (target 35 / compile 35).
> - Sin permisos, SDKs ni cambios de package nuevos. **Antes de generar el AAB**: instalar la
>   plataforma **Android 15 (API 35)** en el SDK Manager (instaladas: API 34 y 36; **falta la 35**;
>   Android Studio la ofrece con un clic).
>
> **🆕 v0.25.3 — Rotación móvil + control táctil + versionCode 3** — 2026-07-01.
> - `android/app/build.gradle`: `versionCode` **2 → 3**, `versionName` **"0.25.2" → "0.25.3"**.
> - `AndroidManifest.xml`: `MainActivity` con **`screenOrientation="fullSensor"`** (rota
>   horizontal+vertical; antes seguía el auto-rotate del sistema y en teléfonos con rotación
>   bloqueada no giraba).
> - Nuevo **control táctil por arrastre** (`src/input/TouchTiltController.js`) como control
>   principal en móvil; **D-pad de flechas oculto** (flag `DEBUG_SHOW_DPAD`); joystick secundario.
> - Sin permisos/SDKs/monetización nuevos. Reflujo de viewport centralizado (`_handleViewportChange`).
>
> **🆕 v0.25.4 — Revisión integral + versionCode 4** — 2026-07-01.
> - `versionCode` **3 → 4**, `versionName` **"0.25.3" → "0.25.4"** (package.json 0.25.4).
> - **Joystick OPCIONAL** en móvil (oculto por defecto; ajuste `showJoystick` en Ajustes →
>   Controles); arrastre táctil como control principal; D-pad sigue oculto; teclado desktop intacto.
> - **Feedback** de arrastre (halo tenue), **halo del hoyo verde**, **hoyos rojos** con emissive
>   (peligro), **HUD** más legible en horizontal, **-1 alloc por frame** (billboard reutiliza vector).
> - **Sin** tocar física/dificultad/solvencia ni la sensación del táctil. Sin permisos/SDKs/
>   monetización nuevos. Igual que antes: **instalar API 35** en el SDK Manager antes del AAB.

---

## Novedades v0.22.0 — Cuenta y nube (Firebase-ready, segura)

- Capa de servicios para **Firebase Auth + Firestore + GA4**, **inerte en modo demo** hasta
  configurar (no rompe invitado, web ni GitHub Pages).
- **Sin contraseñas** en local ni en la nube; correo enmascarado; errores genéricos; sin GPS.
- Migración de progreso local→nube al crear cuenta; **resolución de conflictos** (más
  avanzado: nivel → estrellas → score); estados de sincronización en Ajustes.
- UI de acceso con modo demo/nube, correo, recuperar contraseña. 12 eventos de analítica.
- Docs: `firebase-setup.md` (con la **CSP** a ajustar) y `auth-architecture.md`.
- Validado: `npm test` (incl. `auth-smoke`, 225 asserts), `test:graph/visual/ui`: **verde**.
  ⚠️ **No desplegado** — pendiente de que Stefano configure Firebase.

## Novedades v0.21.0 — Rediseño visual del menú principal

- Menú **premium y mobile-first**: cabecera compacta (avatar + título + saludo), tarjeta de
  stats (pills ⭐/🔓/🏆 + barra %), **CTAs** `Continuar` (ámbar) y `Jugar` (verde héroe), grid
  de **tiles** (Diario/Dino/Skins/Cofre/Canje/Niveles con badges/glow) y fila utilitaria.
- Resuelve la sensación de saturación/scroll del menú anterior **sin perder funciones**.
- QA visual con capturas reales (Edge headless) a 360/390/820 px. Detalle en `docs/menu.md`;
  previsualización en `docs/menu-preview.html`.
- Validado: `npm test`, `test:graph`, `test:visual`, `test:ui`: **verde**. ⚠️ **No desplegado**.

## Novedades v0.20.0 — Evolución de progresión y rejugabilidad

- **Estrellas 1/2/3** refinadas (reglas automáticas: vidas + tiempo + monedas, sin objetivos
  por nivel) mostradas en selector, victoria y progreso.
- **Cofre jurásico** cada 15 ⭐ de nivel (pantalla animada, recompensas, indicador, persistencia).
- **8 skins de bola** (color + material) desbloqueables por estrellas, canje o cofre; equipables.
- **Habilidades por bola** (pasivas, balanceadas): Resistencia Rex, Impulso Raptor, Atracción
  Alegre, Estabilidad Tricera, Peso Bronto. Se aplican en la física y se explican en el selector.
- **Jefes** en 10/20/30/40/50 (banner + ambiente: temblores, rugidos, clima).
- **Eventos climáticos** (lluvia/niebla/viento/ceniza/tormenta/calor) en capa overlay segura;
  el viento empuja **muy levemente** solo en niveles avanzados.
- **Recompensa diaria** con racha de 7 días e indicador en el menú.
- **Contrarreloj** en 11/22/33/44 (HUD con cronómetro, penalización y bonus).
- Validado: `npm test` (incl. `systems-smoke`), `test:graph`, `test:visual` y `test:ui` (nuevo): **verde**.
  Sistemas existentes intactos. ⚠️ **No desplegado** — pendiente de revisión de Stefano.

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
