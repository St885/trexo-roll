# STATUS — TREXoRoll

| Campo | Valor |
|---|---|
| **Versión** | **0.28.0** (GitHub/web) — 🚀 **Release estable: login real con Firebase y celebraciones 3D**. Auth real (Google en localhost + email/password + invitado; CSP corregida; sin contraseñas guardadas) · pantalla de acceso premium · **4 dinos 3D de victoria** (T-Rexo, Triceratops, Raptor, Parasaurio; brachio ⏳ procedural) con fallback procedural y Android performance sin GLB · perfiles gráficos quality/balanced/performance · assets optimizados, backups fuera de repo/build. **Publicado en Prueba interna de Google Play y validado en teléfono Android real (2026-07-18)**: `versionCode 5` / `versionName 0.28.0`, targetSdk 35, firmado con la nueva upload key `trexoroll-upload`; **disponible para testers internos, funciona correctamente** (ver sección «Play Store — Prueba interna v0.28.0 validada» abajo). No producción |
| **Android** | `applicationId` `com.st885.trexoroll` · **`versionCode 5`** · **`versionName 0.28.0`** · `minSdk 22` · `compileSdk 35` · `targetSdk 35` · **`screenOrientation=fullSensor`** · permiso único `INTERNET` (sin AD_ID/GET_ACCOUNTS/READ_CONTACTS/ubicación/cámara/micro; sin Ads/Analytics/compras/Play Games) |
| **Estado** | ✅ Web local funcionando (acceso+juego) · ✅ **Google login OK en localhost** · ✅ email/password conectado · ✅ invitado intacto · ✅ Firebase config real activa (SHA debug + Play App Signing + upload key) · Analytics **OFF** · Cloud Sync **OFF** · ✅ **Publicado en Prueba interna (v0.28.0) y validado en teléfono Android real** · ✅ GitHub sincronizado. ⚠️ Pendientes antes de producción: 1) Data Safety (login real) · 2) App Access si aplica · 3) eliminación de cuenta · 4) revisión final de política de privacidad · 5) revisar scroll de la pantalla de victoria · 6) GLB de Braquiosaurio bebé azul · 7) decidir Analytics · 8) promoción a producción solo con autorización |
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

## 🗺️ 20 mapas nuevos + cavernícolas nómadas — v0.29.0 EN DESARROLLO (2026-07-20)

> **En desarrollo. NO se generó AAB. NO se tocó Play Console ni producción. NO push.**
> `package.json` = `0.29.0`. **Android intacto** en `versionCode 6` / `versionName 0.28.1`.

- **20 niveles nuevos: 51–70** (total 50 → 70). Mundo 11 "Tierras Salvajes" (51–60) y Mundo 12 "El
  Ocaso Jurásico" (61–70); dificultad gradual Difícil→Experto; hitos en 60 y 70. Variedad real de
  layouts; algunos con portales. **Los 70 niveles pasan el validador de solvencia** (BFS).
- **Cavernícolas nómadas: 2 por mapa nuevo** (`extraCavemen: 2`), en **posiciones aleatorias válidas
  cada carga/reinicio**.
- **Interacción aplicada:** **ambiental/visual** (patrullan y dan vida al mapa; **NO empujan ni dañan la
  bola** → no rompe la jugabilidad ni la ganabilidad). El cavernícola **con lanza** (peligroso) de los
  niveles ×5 no cambia.
- **Spawn aleatorio seguro** (`src/systems/wanderers.js`, puro y testeable): nunca sobre hoyos rojos,
  meta verde, pegado a la bola inicial, fuera del tablero, ni encimados; con **fallback determinista**.
- **Anti-hoyos en movimiento:** destino con **camino despejado** (no cruzan hoyos); si un paso deja de
  ser seguro (trampa dinámica movida), **recalculan**. Delta time; reutiliza `Caveman.js`; **sin
  acumular** al reiniciar (`clearBoard`).
- **Pruebas:** `npm test` (585 checks, incl. `cavemen-wander-smoke` con 12 puntos) · `test:graph` ·
  `test:visual` · `test:ui` · `build` · `cap:sync` — verde. Navegador real (Chrome+WebGL): niveles
  51/52/60/70 con 2 nómadas seguros, wander en movimiento, reinicio sin duplicar, **0 errores**.
- **QA pendiente:** validación humana en móvil real (sensación, rendimiento con nómadas + trampas
  dinámicas en los mapas grandes 60/70), y revisar encuadre de cámara en los tableros más anchos (28×18).
- **Archivos:** `src/levels/levels.js` (+20 niveles), `src/systems/wanderers.js` (nuevo),
  `src/scene/SceneManager.js`, `src/core/Game.js`, `package.json`, `tools/cavemen-wander-smoke.mjs`
  (nuevo), `tools/level-validator.mjs`, `tools/events-smoke.mjs`, `tools/canvas-smoke.mjs`,
  `docs/changelog.md`.

---

## 🔒 Auditoría de seguridad + fix pantalla negra — v0.28.1 / versionCode 6 (2026-07-20)

> **Revisión integral de seguridad antes de seguir con testers. Sin generar AAB (pendiente
> de autorización). Cambios en rama `main`, sin commit/push todavía.**

**Estado tras la auditoría:** `npm test` ✅ · `npm run build` ✅ · `npx cap sync android` ✅ ·
`test:graph`/`test:visual`/`test:ui` ✅ · validación en navegador real (Chrome headless + WebGL vía
CDP): boot sin errores de consola, recuperación anti-pantalla-negra y ocultación de Google en WebView
verificadas end-to-end ✅.

### Causa probable del aviso "app no muy segura"
No hay indicios de malware. Lo más probable es **reputación baja de app nueva + canal de prueba +
sideload/instalación fuera de Play**: Play Protect avisa de apps recién publicadas o instaladas por
enlace de tester hasta que ganan reputación. En el **código** no se encontró causa: permiso único
`INTERNET`, sin cleartext, sin dominios inseguros, sin secretos. Recomendación (no implementada, requiere
tu OK): valorar **Play Integrity API** más adelante; el aviso debería remitir al madurar la prueba cerrada.

### Bug de pantalla negra (causa raíz + fix)
- **Causa:** el login de Google usa `signInWithPopup` y, al fallar en el WebView de Capacitor, cae a
  `signInWithRedirect`; ese redirect es **inestable dentro del WebView** (navega fuera y al volver puede
  dejar el WebView en blanco).
- **Fix elegido (autorizado):** **ocultar el botón de Google solo dentro del WebView de Android**
  (`isAndroidWebView()`); email/contraseña + invitado siguen funcionando. En navegador web Google sigue
  disponible. Más una **red de seguridad anti-pantalla-negra**:
  - `recoverToSafeScreen()` en `visibilitychange`/`pageshow`: si no hay ninguna `.screen.active`, restaura
    landing/acceso. **Nunca pantalla negra.**
  - **Watchdog de 25 s** en el login de Google (si el flujo se cuelga, libera el botón y avisa).
  - Handlers globales `error`/`unhandledrejection` en `main.js` con **log seguro** (solo código/mensaje,
    nunca tokens/PII) y **panel de recuperación** con "Reintentar".

### Hallazgos de la auditoría
- **Permisos Android:** solo `INTERNET` (mínimo). ✅
- **Secretos:** ninguno versionado. `android/`, `google-services.json`, `keystore.properties`,
  `*.jks/*.pem/*.aab/*.apk`, `.env` correctamente ignorados. La config **web** de Firebase
  (`firebaseConfig.js`) es **pública por diseño** (se sirve a todos los clientes); la seguridad la dan
  reglas de Firestore + dominios autorizados + Auth. **Recomendado:** restringir la API key web en Google
  Cloud Console (por app Android / referrers) — no es urgente ni bloqueante.
- **Tokens/contraseñas:** nunca se guardan en localStorage/sessionStorage. El SDK de Firebase gestiona su
  propia sesión (IndexedDB). `_safeUser` proyecta sin tokens; analytics filtra parámetros sensibles. ✅
- **Almacenamiento local:** solo progreso/ajustes/sesión no sensibles (nombre saneado, idioma). ✅
- **Red:** sin `fetch/XHR/WebSocket` propios; toda la red va por el SDK de Firebase (HTTPS). Analytics
  **OFF** y Cloud Sync **OFF** por flags con guardas. ✅
- **CSP:** estricta, sin comodines, `object-src 'none'`, `base-uri 'self'`, dominios concretos de Google
  para Auth. ✅
- **Dependencias:** `npm audit --omit=dev` → **0 vulnerabilidades**. Las 2 "high" (`tar`) provienen solo
  de `@capacitor/cli` (**devDependency**, build-time, **no se envía a usuarios**) y su fix es un major
  breaking — **no aplicado** (requeriría tu OK).
- **Capacitor:** `androidScheme: https`, `allowMixedContent: false`. ✅
- **Legal/Play:** `privacy.html` completa (datos, Firebase Auth, no ads/compras/analytics, eliminación de
  cuenta, contacto). **Nueva `delete-account.html`** dedicada (TREXoRoll · SLF Games · pasos · correo de
  soporte · qué se elimina · retención ≤30 días), enlazada desde privacy y añadida al build/`www/`.

### Archivos modificados
`src/main.js`, `src/core/Game.js`, `src/utils/i18n.js`, `styles/main.css`, `privacy.html`,
`tools/build-web.mjs`, `tools/auth-smoke.mjs`, `tools/android-manifest-check.mjs`, `package.json`
(0.28.1) · **nuevo** `delete-account.html` · **local (ignorado)** `android/app/build.gradle`
(`versionCode 6` / `versionName 0.28.1`).

### ✅ AAB release generado (2026-07-20)
- **Ruta:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Tamaño:** ~16 MB (16 840 030 bytes)
- **Firma:** ✅ verificada (`jarsigner -verify` → *jar verified*; tarea `signReleaseBundle` OK)
- **Versión:** `versionCode 6` / `versionName 0.28.1` (confirmado en el manifest de release)
- **applicationId:** `com.st885.trexoroll` (sin cambios)
- **Contenido:** ✅ sin `_backup`, `keystore`, `.env`, `.pem`, `.jks`, `google-services.json` ni secretos.
- **Gates previos:** `npm test` ✅ · `npm run build` ✅ · `npx cap sync android` ✅.
- **NO subido a Play Console. NO push.** Commit del código: `ad49c74` (solo cambios seguros; el AAB
  no se versiona).

### Pendiente
- Subir el AAB a Play Console **solo con tu autorización** (Data Safety + URL de eliminación de cuenta
  `…/delete-account.html`).
- (Opcional, con tu OK) restringir API key web, valorar Play Integrity, plugin nativo de Google Sign-In.

---

## ✅ Play Store — Prueba interna v0.28.0 validada (2026-07-18)

> **TREXoRoll v0.28.0 publicado en el canal de Prueba interna de Google Play y
> validado en un teléfono Android real. Funciona correctamente. NO producción.**

| Ítem | Valor |
|---|---|
| **Fecha** | 2026-07-18 |
| **versionCode / versionName** | `5` / `0.28.0` |
| **AAB firmado** | ✅ Generado correctamente (firmado con la nueva upload key) |
| **Subida a Play Console** | ✅ Subido |
| **Canal** | **Prueba interna** |
| **Estado en Play Console** | ✅ Disponible para testers internos |
| **Validación en dispositivo** | ✅ Probado en **teléfono Android real** (modo test / prueba interna) por Stefano |
| **Resultado** | ✅ Funciona correctamente en modo test |
| **Firma (upload key)** | Nueva upload key `trexoroll-upload` (Play App Signing re-firma para distribución) |
| **Play App Signing** | ✅ Activo |
| **Firebase (Android)** | Actualizado con SHA **debug** + **Play App Signing** + **nueva upload key** · `google-services.json` local (ignorado por git) |

### Pendiente antes de producción (NO hacer sin autorización explícita de Stefano)
- [ ] **Data Safety** — declarar el manejo de datos por el login real (Firebase Auth).
- [ ] **App Access** — credenciales de acceso para la revisión de Google, si aplica.
- [ ] **Eliminación de cuenta** — flujo/URL de borrado de cuenta (requisito de Google para apps con login).
- [ ] **Política de privacidad** — revisión final.
- [ ] **Pantalla de victoria** — revisión visual (scroll).
- [ ] **Analytics** — decidir si activarlo más adelante (hoy **OFF**).
- [ ] **Promoción a producción** — solo con **autorización explícita**. No se sube a producción por ahora.

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
