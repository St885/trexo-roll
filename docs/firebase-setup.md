# Configurar Firebase para TREXoRoll

El juego ya trae una **capa de cuenta preparada** (auth + Firestore + Analytics) que está
**inerte** hasta que rellenes la configuración. Sin configurar, todo funciona en **modo
demo** (invitado/local). Esta guía te lleva paso a paso para activar la nube.

> ⚠️ Antes de empezar, lee la sección **CSP** al final: la política de seguridad del
> `index.html` bloquea Firebase por defecto. Hay que ajustarla (o vendorizar el SDK).

---

## 1) Crear proyecto Firebase
1. Entra en https://console.firebase.google.com → **Agregar proyecto**.
2. Nombre: `trexoroll` (o el que quieras). Acepta los términos.
3. **Activa Google Analytics** cuando lo pregunte (lo usaremos para países). Crea/usa una
   cuenta de Analytics.

## 2) Agregar una app web
1. En la consola: ⚙️ **Configuración del proyecto** → **Tus apps** → icono **</>** (Web).
2. Apodo: `TREXoRoll Web`. (No hace falta Hosting.)
3. Te mostrará el objeto `firebaseConfig` con tus claves.

## 3) Copiar la configuración al juego
1. **Vendoriza el SDK** (una vez): `npm run fetch:firebase` → descarga el SDK real a
   `libs/firebase/` (sustituye los placeholders). Ver `docs/firebase-sdk-vendor.md`.
2. Abre `src/config/firebaseConfig.js`.
3. Sustituye cada `'REEMPLAZAR'` por el valor real (`apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`, `measurementId`).
4. Guarda. El juego detectará la config (`hasRealConfig()`), `isConfigured()` pasará a
   `true` y la pantalla de acceso mostrará el modo **nube** (campos de correo + recuperar).

> `sdkUrls` ya apunta a `./libs/firebase/` (vendorizado). La config web NO es secreta
> (se entrega al cliente). Si aun así no quieres versionarla, mira la nota de `.gitignore`
> (`git rm --cached src/config/firebaseConfig.js`).

## 4) Activar Authentication
1. Consola → **Compilación → Authentication → Comenzar**.

## 5) Activar Email/Password
1. Authentication → **Sign-in method** → **Correo electrónico/contraseña** → **Habilitar** → Guardar.
2. (Opcional, futuro) Google/Apple: el juego ya tiene placeholders seguros; se activarán
   más adelante en `authService.signInWithProvider`.

## 6) Activar Firestore
1. Consola → **Compilación → Firestore Database → Crear base de datos**.
2. Empieza en **modo producción** (reglas cerradas) y elige la región más cercana.

## 7) Configurar reglas de seguridad
1. Firestore → **Reglas** → pega esto y **Publica**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Esto garantiza que **cada jugador solo puede leer/escribir su propio documento**
`players/{uid}`. Detalles en `docs/auth-architecture.md`.

## 8) Activar Analytics
- Si activaste Analytics en el paso 1, ya está. Si no: ⚙️ **Integraciones → Google
  Analytics → Habilitar**. Asegúrate de que `measurementId` esté en tu `firebaseConfig.js`.

## 9) Conectar GA4
- Firebase crea automáticamente una propiedad **GA4** enlazada. Ábrela desde
  **Analytics → Panel → (ver en Google Analytics)**.

## 10) Ver países en los reportes
- En **Google Analytics (GA4)** → **Informes → Usuario → Datos demográficos → Detalles
  demográficos** o **Audiencias**, filtra/segmenta por **País**.
- El país lo deriva GA4 de la IP de forma **agregada**. El juego **no** pide GPS ni
  ubicación, ni guarda el país manualmente.

## 11) Probar registro real
1. Sirve el juego por HTTP (`npm start`) **con la CSP ajustada** (ver abajo).
2. En la pantalla de acceso (ahora en modo nube): **Crear cuenta** con un correo y
   contraseña (≥6). Debe crear el usuario en Authentication y el documento en
   `players/{uid}` con tu progreso local migrado.

## 12) Probar login real
1. Cierra sesión (Ajustes → Cerrar sesión) y vuelve a **Ingresar** con ese correo.
2. Tu progreso debe cargarse desde la nube. En **otro dispositivo/navegador**, al iniciar
   sesión, continúas desde tu avance (se elige el progreso más avanzado).

## 13) Probar recuperación de contraseña
1. En **Ingresar** → **¿Olvidaste tu contraseña?** → escribe el correo → revisa tu bandeja.

---

## CSP (ya preparada para Auth + Firestore)

La **Content-Security-Policy** de `index.html` **ya está lista** para Auth + Firestore con
el SDK **vendorizado**: mantiene `script-src 'self'` (no se confía en CDN de terceros) y
abre `connect-src` solo a dominios concretos de Google:
`identitytoolkit` · `securetoken` · `firestore` · `firebaseinstallations` `.googleapis.com`.

- En **modo demo** no se conecta a ninguno → no rompe nada.
- **Analytics (GA4)** necesita una directiva extra (inyecta `gtag.js`) → **opt-in**: añade
  la línea documentada en `docs/csp-firebase.md` cuando quieras activarlo. Mientras tanto,
  Auth + Firestore funcionan y Analytics se omite sin errores.
- Si prefieres el **CDN** en vez de vendorizar, hay que ampliar `script-src` (menos seguro):
  ver la sección correspondiente en `docs/csp-firebase.md`.

Detalle completo y verificación: **`docs/csp-firebase.md`** y **`docs/firebase-sdk-vendor.md`**.

## Dominios autorizados de Auth
- En Authentication → **Settings → Authorized domains**, añade `st885.github.io` (y
  `localhost`) para que el login funcione en producción y en local.

---

## Checklist de validación tras configurar
- [ ] `isConfigured()` = true (la pantalla de acceso muestra correo + recuperar).
- [ ] Registro crea usuario en Authentication y documento en `players/{uid}`.
- [ ] El progreso local se migra a la nube al crear cuenta.
- [ ] Login en otro dispositivo continúa el avance (gana el más avanzado).
- [ ] Recuperación de contraseña envía correo.
- [ ] GA4 muestra eventos y país (Audiencia → Geografía).
- [ ] Modo invitado sigue funcionando si cierras sesión.
