# SDK de Firebase vendorizado — estrategia

## Estrategia elegida: **VENDORIZADO** (SDK local en `libs/firebase/`)

Entre las opciones evaluadas:

- **A) CDN + CSP**: cargar el SDK desde `gstatic.com` y abrir `script-src` a ese dominio.
- **B) Vendorizado**: servir el SDK desde el mismo origen (GitHub Pages) y mantener
  `script-src 'self'`. ← **elegida**

### Por qué B (vendorizado)
- **Más seguro**: todo el código ejecutable es de mismo origen; no se confía en un tercero
  para ejecutar scripts (`script-src` sigue `'self'`). Menor superficie de XSS/supply-chain.
- **Más estable / GitHub Pages**: sin dependencia de la disponibilidad o cambios del CDN;
  el SDK queda fijado a una versión versionada en el repo.
- **CSP mínima**: solo hay que abrir `connect-src` a dominios concretos de Google para las
  llamadas reales de Auth/Firestore (eso es inevitable: ahí ocurre la autenticación).

> La única parte que necesita un script externo es **Analytics (GA4)**, que inyecta
> `gtag.js` desde `googletagmanager.com`. Por eso Analytics es **opt-in** (ver
> `docs/csp-firebase.md`); Auth + Firestore funcionan 100% vendorizados.

## Qué se añadió a `libs/firebase/`

| Archivo | Rol |
|---|---|
| `firebase-app.js` | núcleo (`initializeApp`) — **placeholder** hasta vendorizar |
| `firebase-auth.js` | autenticación — **placeholder** |
| `firebase-firestore.js` | base de datos — **placeholder** |
| `firebase-analytics.js` | analítica (opcional) — **placeholder** |
| `README.md` | versión, origen, cómo poblar/actualizar, seguridad |

- **Versión objetivo**: Firebase Web modular **v10.12.2**.
- **Origen**: `https://www.gstatic.com/firebasejs/10.12.2/firebase-<producto>.js` (oficial).
- Los placeholders exportan `__PLACEHOLDER__ = true`; `firebaseClient` lo detecta y se queda
  en **modo demo** (no rompe nada). Al reemplazarlos por el SDK real, se activa la nube.

## Cómo poblar el SDK real (cuando tengas claves)
```bash
npm run fetch:firebase     # descarga los 4 archivos a libs/firebase/ (sobrescribe placeholders)
```
o manualmente (mismos nombres) — ver `libs/firebase/README.md`. Después, pega tus claves en
`src/config/firebaseConfig.js` y prueba.

## Cómo actualizar de versión
1. Cambia `FIREBASE_VERSION` en `tools/fetch-firebase.mjs` y la versión en
   `libs/firebase/README.md` + comentarios de `firebaseConfig.js`.
2. `npm run fetch:firebase`.
3. Prueba registro/login/recuperación (`docs/firebase-setup.md`).

## Cómo carga el juego el SDK
- `src/config/firebaseConfig.js` → `sdkUrls` apunta a `./libs/firebase/firebase-*.js`.
- `src/services/firebaseClient.js` hace `import()` **dinámico** de esas rutas SOLO si hay
  config real y entorno de navegador. Sin config/SDK → `null` → modo demo. Errores: aviso
  **solo en desarrollo**, genérico (sin exponer claves/config).

## Seguridad
- En `libs/firebase/` va **solo** SDK público: sin `apiKey`, sin tokens, sin
  `serviceAccount*.json`, sin configuraciones privadas.
- La config web (claves) va en `src/config/firebaseConfig.js` (no es secreta; la seguridad
  la dan reglas de Firestore + dominios autorizados de Auth).
