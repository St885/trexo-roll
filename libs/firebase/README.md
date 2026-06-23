# SDK de Firebase vendorizado — `libs/firebase/`

Aquí va el **SDK web modular de Firebase** servido desde el mismo origen (GitHub Pages),
para que la CSP mantenga `script-src 'self'` (sin confiar en CDN de terceros). El juego
carga estos archivos desde `src/config/firebaseConfig.js` (`sdkUrls` → rutas locales).

> **Estado actual: PLACEHOLDERS.** Los `firebase-*.js` de esta carpeta son marcadores que
> mantienen la estructura lista y el juego en **modo demo** (no rompen nada). Reemplázalos
> por el SDK real cuando vayas a activar la nube.

## Archivos

| Archivo | Contenido | Funciones que usa el juego |
|---|---|---|
| `firebase-app.js` | núcleo | `initializeApp` |
| `firebase-auth.js` | autenticación | `getAuth`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `sendPasswordResetEmail`, `updateProfile`, `onAuthStateChanged` |
| `firebase-firestore.js` | base de datos | `getFirestore`, `doc`, `getDoc`, `setDoc`, `serverTimestamp` |
| `firebase-analytics.js` | analítica (opcional) | `getAnalytics`, `isSupported`, `logEvent` |

## Versión y origen

- **SDK web modular v10.12.2** (fijar la MISMA versión en los 4 archivos).
- Origen oficial: `https://www.gstatic.com/firebasejs/10.12.2/firebase-<producto>.js`
- Los builds de gstatic importan entre sí con rutas **relativas** (`./firebase-app.js`), por
  lo que al guardarlos juntos en esta carpeta funcionan en local sin red.

## Cómo poblarlos (elige una)

### A) Script incluido (recomendado)
```bash
npm run fetch:firebase
```
Descarga los 4 archivos de gstatic a `libs/firebase/` (sobrescribe los placeholders).
Requiere conexión a internet (solo en tu máquina, una vez).

### B) Manual
Descarga estos 4 a esta carpeta con los **mismos nombres**:
```
https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js
https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js
https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js
https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js
```

### Verificar
1. Sirve el juego (`npm start`) y abre DevTools → pestaña **Network**.
2. Tras iniciar sesión, NO debe haber peticiones de script a `gstatic.com` (todo es local).
3. Si el navegador pide un archivo interno extra del SDK (mismo origen), descárgalo también
   a esta carpeta (Firebase rara vez parte sus bundles, pero por si una versión lo hace).

## Cómo actualizar en el futuro
1. Cambia la versión (p. ej. `10.12.2` → la nueva) en este README, en `fetch:firebase`
   (`tools/fetch-firebase.mjs`) y en los comentarios de `firebaseConfig.js`.
2. Vuelve a ejecutar `npm run fetch:firebase`.
3. Prueba registro/login/recuperación (ver `docs/firebase-setup.md`).

## Seguridad

- Aquí **solo** va código del SDK público de Firebase. **NUNCA** pongas en esta carpeta
  claves (`apiKey`), tokens, `serviceAccount*.json` ni configuraciones privadas.
- La config (claves web) va en `src/config/firebaseConfig.js`, no aquí. La seguridad real la
  dan las **reglas de Firestore** + los **dominios autorizados** de Auth.

## Alternativa sin vendorizar (Opción A — CDN)
Si prefieres no vendorizar, en `firebaseConfig.js` apunta `sdkUrls` al CDN de gstatic y
amplía la CSP (`script-src https://www.gstatic.com`). Ver `docs/csp-firebase.md`.
