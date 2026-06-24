# Build Android (Capacitor) — TREXoRoll

Empaquetado de TREXoRoll como app Android con **Capacitor**. El juego es estático (HTML +
ES modules + assets), así que el "build" solo copia los archivos de runtime a `www/` y
Capacitor los mete en la app. La **web/GitHub Pages no cambia** (sigue sirviéndose desde la
raíz).

## Requisitos (en tu máquina)
- **Node.js** 18+.
- **Android Studio** (incluye el Android SDK y Gradle).
- **JDK 17** (lo trae Android Studio).
- Variables: `ANDROID_HOME`/SDK configurado por Android Studio.

## Configuración ya incluida en el repo
- `capacitor.config.json` → `appId: com.st885.trexoroll`, `appName: TREXoRoll`, `webDir: www`.
- `package.json` con dependencias de Capacitor y scripts:
  `build`, `build:android`, `cap:add`, `cap:sync`, `cap:open`.
- `tools/build-web.mjs` → genera `www/`.

## Pasos (primera vez)
```bash
cd 03_juegos/trexo-roll

# 1) Instalar dependencias (Capacitor)
npm install

# 2) Generar el build web (carpeta www/)
npm run build

# 3) Crear el proyecto Android nativo (solo la PRIMERA vez)
npm run cap:add          # = npx cap add android  → crea android/

# 4) Copiar el web + plugins al proyecto Android
npm run cap:sync         # = npx cap sync android

# 5) Abrir en Android Studio
npm run cap:open         # = npx cap open android
```

## Pasos (cada cambio del juego)
```bash
npm run build:android    # build web + cap sync android
npm run cap:open
```
> Tras `cap sync`, en Android Studio pulsa **Run ▶** para probar en emulador o móvil.

## Ajustes Android recomendados (en `android/`, tras `cap add`)
Estos archivos los genera Capacitor; edítalos una vez:

### Nombre visible y versión
- `android/app/src/main/res/values/strings.xml` → `app_name` = `TREXoRoll`.
- `android/app/build.gradle` → `versionCode 1`, `versionName "0.24.0"`. Sube `versionCode`
  en cada release.

### SDK objetivo (Play exige actualizado)
- `android/app/build.gradle` → `compileSdk`/`targetSdk` = el más alto que instale tu Android
  Studio (p. ej. **35**). `minSdk` 23+ (recomendado 24/26). No dejes valores antiguos.

### Orientación
El juego es responsive (vertical y horizontal funcionan). Para v1 puedes elegir:
- **Ambas** (recomendado, ya responsive): no toques `screenOrientation`, o pon
  `android:screenOrientation="fullSensor"` en la `<activity>` de `AndroidManifest.xml`.
- **Solo vertical**: `android:screenOrientation="portrait"`.

### Pantalla completa / immersive (opcional)
- Tema sin barra de título: `android/app/src/main/res/values/styles.xml` (tema
  `Theme.AppCompat.NoActionBar` o el de Capacitor). Para immersive total, usa el plugin
  `@capacitor/status-bar` (opcional) o flags en `MainActivity`.

### Icono adaptable
- En Android Studio: clic derecho en `app/res` → **New → Image Asset** → usa
  `playstore/icon/icon-512.png` (o `assets/icon.svg`) como foreground; fondo `#0a3a20`.

### Splash / color de fondo
- `capacitor.config.json` ya fija `backgroundColor: #0a3a20`. Para un splash con logo,
  añade el plugin `@capacitor/splash-screen` (opcional) y un asset, o usa el splash del
  sistema (Android 12+).

## Permisos (mínimos)
- Capacitor añade `INTERNET` (necesario para la WebView y la futura nube). **No** se añade
  ubicación, cámara, micrófono ni contactos. Revisa `AndroidManifest.xml` y elimina permisos
  que no uses si algún plugin los introdujera.

## Generar el AAB (Android App Bundle) firmado
Desde **Android Studio**:
```
Build → Generate Signed Bundle / APK… → Android App Bundle → Next
→ (crear o elegir keystore) → Release → Finish
```
Resultado: `android/app/release/app-release.aab` (la ruta puede variar).

### Firma (keystore) — ver `docs/release-process.md`
- Crea un **keystore** una sola vez y **guárdalo seguro fuera del repo** (ya está en
  `.gitignore`: `*.keystore`, `*.jks`, `key.properties`).
- Activa **Play App Signing** en Play Console (Google gestiona la clave de firma de la app;
  tú firmas con tu upload key).

## Validación local del build web
```bash
npm run build           # genera www/
# Servir www/ como la app lo verá (mismo origen, rutas relativas):
npx serve www -p 3001   # abrir http://localhost:3001
```
La web normal sigue en la raíz (`npm start`), intacta para GitHub Pages.
