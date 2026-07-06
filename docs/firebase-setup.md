# Configurar Firebase para TREXoRoll (v0.26.0)

El juego trae una **capa de cuenta preparada** (Auth con **Google** y **correo/contraseña**,
Firestore y Analytics). Está **inerte** hasta que rellenes la config: sin configurar, todo corre
en **modo demo** (invitado/local) sin errores. Esta guía activa el login **real**.

> **Estado de esta versión (importante):**
> - **Autenticación real**: SÍ (Google + correo), en cuanto la config sea real.
> - **Sincronización de progreso en la nube (Firestore)**: **DESACTIVADA** (`ENABLE_CLOUD_SYNC=false`).
>   El login **autentica** pero **NO sube tu progreso** todavía (el progreso sigue **solo local**).
> - **Analytics (GA4)**: **DESACTIVADO** (`ENABLE_ANALYTICS=false`). No se recopila analítica.
> - Los pasos de **Firestore** y **Analytics** de esta guía son **preparación futura** (opcionales ahora).

> ## ✅ Estado de activación (2026-07-04)
> **Hecho automáticamente:**
> - **SDK de Firebase vendorizado** (v10.12.2) en `libs/firebase/` (`npm run fetch:firebase`) — real, no stubs.
> - **`google-services.json`** (Android) validado: `project_id=trexoroll`, `package=com.st885.trexoroll`, app_id + api_key presentes.
> - **Gradle** ya aplica `com.google.gms.google-services` de forma **condicional** (solo si existe el JSON) → Capacitor-safe, sin tocar AGP.
> - **`firebaseConfig.js`** rellenado con lo **derivable** del proyecto (no secreto): `projectId=trexoroll`, `authDomain=trexoroll.firebaseapp.com`, `storageBucket=trexoroll.firebasestorage.app`, `messagingSenderId=1022273256922`.
> - **Catálogo de eventos de Analytics** ampliado y cableado (sigue **inactivo** por el flag).
>
> **PENDIENTE (tú, manual):**
> 1. ~~Pegar `apiKey`/`appId` del app Web~~ → ✅ **HECHO (2026-07-04)**: config real conectada,
>    `hasRealConfig()=true`, **login real ACTIVO y verificado** (email/password responde
>    `auth/invalid-credential` real; Google popup/redirect disponible; invitado intacto).
> 2. **SHA-1 / SHA-256** del keystore de release → pégalas en la app Android de Firebase (paso 7).
> 3. Verificar **dominios autorizados** en Auth: `localhost`, `st885.github.io` (y ya vienen `trexoroll.firebaseapp.com` / `trexoroll.web.app`) (paso 5).
> 4. Para activar **Analytics** más adelante: `ENABLE_ANALYTICS=true` + `measurementId` real + añadir `https://www.google-analytics.com https://region1.google-analytics.com` a `connect-src` de la CSP.
> 5. ~~CSP para Google Sign-In~~ → ✅ **HECHO (2026-07-05, v0.27.3)**: la CSP bloqueaba
>    `apis.google.com/js/api.js` (gapi) y faltaba `frame-src`. Añadidos dominios CONCRETOS
>    (script-src: apis.google.com + gstatic; frame-src: accounts.google.com +
>    trexoroll.firebaseapp.com; form-action: accounts.google.com; img-src:
>    lh3.googleusercontent.com). Verificado: 0 violaciones CSP y el flujo llega a
>    accounts.google.com. `frame-ancestors` quitada del meta (los navegadores la ignoran ahí).

---

## 1) Crear proyecto Firebase
1. https://console.firebase.google.com → **Agregar proyecto**.
2. Nombre: `trexoroll` (o el que quieras). Acepta los términos.
3. Google Analytics: **puedes omitirlo** (Analytics está desactivado en esta versión). Actívalo
   solo si más adelante pones `ENABLE_ANALYTICS=true`.

## 2) Registrar la app WEB
1. ⚙️ **Configuración del proyecto** → **Tus apps** → icono **</>** (Web).
2. Apodo: `TREXoRoll Web`. (No hace falta Firebase Hosting.)
3. Copia el objeto `firebaseConfig` que te muestra (apiKey, authDomain, projectId, etc.).

## 3) Copiar la configuración al juego
1. **Vendoriza el SDK** (una vez): `npm run fetch:firebase` → descarga el SDK real de Firebase a
   `libs/firebase/` (sustituye los placeholders). Ver `docs/firebase-sdk-vendor.md`.
2. Abre **`src/config/firebaseConfig.js`** y sustituye cada `REPLACE_WITH_...` por el valor real:

   | Campo en `firebaseConfig` | De dónde sale (consola web) |
   |---|---|
   | `apiKey` | `firebaseConfig.apiKey` |
   | `authDomain` | `firebaseConfig.authDomain` (`tu-proyecto.firebaseapp.com`) |
   | `projectId` | `firebaseConfig.projectId` |
   | `storageBucket` | `firebaseConfig.storageBucket` (`tu-proyecto.appspot.com`) |
   | `messagingSenderId` | `firebaseConfig.messagingSenderId` |
   | `appId` | `firebaseConfig.appId` |
   | `measurementId` | `firebaseConfig.measurementId` (solo Analytics; opcional ahora) |

3. Guarda. `hasRealConfig()` pasará a `true` e `isConfigured()` a `true`; la pantalla de acceso
   mostrará el modo **nube** (correo + recuperar) y el botón **Continuar con Google** funcionará.

> La config web de Firebase **NO es secreta** (se sirve al cliente; la seguridad la dan las
> **reglas de Firestore** + la **restricción de la API key** por dominio/app en Google Cloud).
> **Restringe la API key**: Google Cloud Console → *APIs y servicios → Credenciales → tu clave →
> Restricciones de aplicación* (referrers HTTP para web / huella SHA para Android). Nunca pongas
> aquí contraseñas ni claves del Admin SDK.

## 4) Activar Authentication + proveedores
1. Consola → **Compilación → Authentication → Comenzar**.
2. **Sign-in method → Correo electrónico/contraseña → Habilitar → Guardar**.
3. **Sign-in method → Google → Habilitar** → elige el correo de soporte del proyecto → Guardar.

## 5) Dominios autorizados (Auth)
Authentication → **Settings → Authorized domains** → añade:
- **`st885.github.io`** (producción, GitHub Pages)
- **`localhost`** (desarrollo)

(Ya vienen `*.firebaseapp.com` y `*.web.app`.) Sin esto, Google Sign-In por web da error de dominio.

## 6) Registrar la app ANDROID
1. ⚙️ **Configuración del proyecto → Tus apps → icono Android**.
2. **Nombre del paquete**: exactamente **`com.st885.trexoroll`**.
3. Apodo: `TREXoRoll Android`.
4. **Huella SHA-1** (obligatoria para Google Sign-In en Android): añádela aquí (ver paso 7).
   Añade también la **SHA-256** (recomendado, requerido por algunas APIs).

### 7) Obtener SHA-1 y SHA-256 del keystore
Con **JDK/keytool** (viene con Android Studio):

```bash
# Debug (desarrollo) — Windows:
keytool -list -v -alias androiddebugkey -keystore "%USERPROFILE%\.android\debug.keystore" -storepass android -keypass android
# Debug — macOS/Linux:
keytool -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android

# Release (keystore real de TREXoRoll — te PEDIRÁ la contraseña de forma interactiva; NO la escribas
# en la línea de comandos ni la compartas):
keytool -list -v -keystore "C:\Users\olgit\Documents\AndroidKeys\trexoroll-release-key.jks" -alias trexoroll
```
Copia las líneas **SHA1:** y **SHA256:** y pégalas en la app Android de Firebase
(*Configuración del proyecto → Tus apps → Android (`com.st885.trexoroll`) → Agregar huella digital*).

> **Play App Signing**: si usas la **firma gestionada por Google Play**, añade TAMBIÉN la SHA-1 y
> SHA-256 que Play te muestra en *Play Console → Configuración → Integridad de la app → Firma de
> apps* (esa es la que firma el AAB en producción). Si no, Google Sign-In fallará en la versión de Play.

## 8) `google-services.json` (solo si usas el flujo NATIVO en Android)
- **Descárgalo** desde la app Android de Firebase (*Descargar google-services.json*).
- **Ubicación**: `android/app/google-services.json`.
- **Decisión de seguridad de este proyecto**: **NO se versiona** (ya está en `.gitignore`, línea
  `google-services.json`). Cada quien lo coloca localmente. No lo subas al repo.
- **¿Cuándo hace falta?** Solo si activas el **plugin nativo** de Google Sign-In (ver §10, opción B).
  Para el flujo **web/JS** (opción A) **no** es imprescindible.

## 9) (FUTURO / opcional) Firestore para sincronizar progreso
> **No hace falta para esta versión** (Cloud Sync está OFF). Actívalo solo cuando quieras sync.
1. Consola → **Firestore Database → Crear base de datos** → **modo producción** → región cercana.
2. **Reglas**: pega las de **`docs/firestore-rules.md`** y **Publica** (cada usuario solo su doc).
3. En el código, cambia **`ENABLE_CLOUD_SYNC = false` → `true`** en `src/config/firebaseConfig.js`.
   A partir de ahí, al iniciar sesión se sincroniza el progreso (elige el más avanzado, ver
   `docs/auth-architecture.md`). Antes de eso, el progreso **no** sube.

## 10) Google Sign-In en Android (decisión técnica)
El WebView de Capacitor NO siempre soporta el **popup** de Google. Dos caminos:
- **A) Firebase JS SDK (por defecto en el código)**: `signInWithPopup` en web; en móvil cae a
  `signInWithRedirect`. **Funciona seguro en web (GitHub Pages)**; en Android WebView puede
  requerir ajustes de OAuth/redirect y **no siempre es fiable**. Sin dependencias nuevas.
- **B) Plugin nativo `@capacitor-firebase/authentication`** (recomendado para Android): login de
  Google nativo y robusto. **Requiere**: `npm i @capacitor-firebase/authentication`, `npx cap sync`,
  `google-services.json` (§8), SHA (§7) y config nativa. **Añade dependencia nativa** → hazlo como
  paso aparte y con confirmación. *(No está añadido en esta versión.)*

> Recomendación: **web con opción A**; **Android con opción B** cuando prepares el AAB de login.

## 11) (FUTURO / opcional) Analytics (GA4)
> Desactivado en esta versión. Para activarlo: pon `ENABLE_ANALYTICS = true`, incluye
> `measurementId`, y ajusta la **CSP** (ver `docs/csp-firebase.md`, inyecta `gtag.js`). Al activarlo,
> **actualiza Data Safety** (analítica pasa a recopilarse).

---

## Probar: modo DEMO vs modo REAL
- **Modo DEMO (actual, sin config):** `hasRealConfig()` = false. Puedes **jugar como invitado**;
  «Continuar con Google» avisa que la nube no está disponible; correo/registro degradan a
  `auth/not-configured` sin romper. **Nada sale del dispositivo.**
- **Modo REAL (tras esta guía):** `hasRealConfig()` = true. La pantalla de acceso muestra el modo
  nube; **Google** y **correo/contraseña** crean/inician sesión de verdad; *Ajustes → Cuenta*
  muestra tu sesión y **Cerrar sesión**. Con Cloud Sync OFF, tu progreso **sigue siendo local**.

### Checklist de validación tras configurar
- [ ] `npm run fetch:firebase` ejecutado (SDK real en `libs/firebase/`, no placeholders).
- [ ] `firebaseConfig.js` con valores reales (sin `REPLACE_WITH_`).
- [ ] Authentication con **Email/Password** y **Google** habilitados.
- [ ] Dominios autorizados: `st885.github.io` + `localhost`.
- [ ] (Android) app registrada con `com.st885.trexoroll` + **SHA-1/SHA-256** (debug y de Play).
- [ ] Login con Google (web) y con correo funciona; **Cerrar sesión** funciona.
- [ ] **Modo invitado** sigue funcionando (no se bloquea el juego).
- [ ] El progreso local **no cambia** (Cloud Sync sigue OFF).

Ver también: `docs/firestore-rules.md`, `docs/auth-architecture.md`, `docs/csp-firebase.md`,
`docs/firebase-sdk-vendor.md`, `playstore/data-safety-draft.md`.
