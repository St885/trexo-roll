# Proceso de release Android — TREXoRoll

Guía del flujo completo, con foco en **firma segura** y versiones.

## 1) Versionado
- `versionName` = la versión del juego (p. ej. `0.24.0`), visible al usuario.
- `versionCode` = entero que **sube en cada subida a Play** (1, 2, 3…). Play rechaza un AAB
  con un `versionCode` ya usado.
- Edita ambos en `android/app/build.gradle`.

## 2) Crear el keystore (una sola vez)
> El keystore es tu **identidad de firma**. Si lo pierdes, no puedes actualizar la app.
> Guárdalo en un sitio seguro y haz copia de seguridad. **NUNCA** lo subas al repo.

```bash
keytool -genkey -v -keystore trexoroll-upload.keystore \
  -alias trexoroll -keyalg RSA -keysize 2048 -validity 9125
```
- Te pedirá una contraseña: guárdala en un gestor de contraseñas (no en el repo).
- `.gitignore` ya ignora `*.keystore`, `*.jks`, `key.properties`, `keystore.properties`.

### Opcional: `key.properties` (para firmar desde Gradle)
Crea `android/key.properties` (IGNORADO por git):
```
storePassword=TU_PASSWORD
keyPassword=TU_PASSWORD
keyAlias=trexoroll
storeFile=../trexoroll-upload.keystore
```
Y referencia ese archivo en `android/app/build.gradle` (bloque `signingConfigs`). Si prefieres
no tocar Gradle, firma desde el asistente de Android Studio (ver `docs/android-build.md`).

## 3) Play App Signing (recomendado)
- En Play Console, al crear la app, activa **Play App Signing**: Google guarda la **clave de
  firma de la app** y tú subes firmando con tu **upload key** (el keystore de arriba).
- Ventaja: si pierdes la upload key, Google puede ayudarte a resetearla; la app sigue firmada
  de forma consistente.

## 4) Generar el AAB
- `npm run build:android` → `npm run cap:open` → en Android Studio: **Generate Signed Bundle
  → Android App Bundle → Release** (ver `docs/android-build.md`).
- Sube el `app-release.aab` a Play Console.

## 5) Pistas (tracks) de publicación
1. **Prueba interna** (Internal testing): hasta 100 testers por email; disponible en minutos.
   → empieza aquí.
2. **Prueba cerrada** (Closed testing): grupos de testers; requerido por Play para cuentas
   nuevas antes de producción (política de testers).
3. **Producción**: tras superar pruebas y revisiones.

## 6) Antes de cada subida (checklist mínimo)
- [ ] `npm test` + `test:graph/visual/ui` en verde.
- [ ] `npm run build:android` sin errores; app probada en móvil real.
- [ ] `versionCode` incrementado.
- [ ] Sin permisos sensibles nuevos en `AndroidManifest.xml`.
- [ ] Sin claves reales, sin Analytics/anuncios/compras (esta fase).
- [ ] Notas de la versión actualizadas (`playstore/release-notes/`).

## 7) Seguridad del repo
- `keystore`, contraseñas y `key.properties` **fuera del repo** (`.gitignore`).
- `www/` y artefactos de `android/` de build están ignorados (se regeneran).
- La web/GitHub Pages no se ve afectada por el flujo Android.
