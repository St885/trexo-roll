# CSP y Firebase — TREXoRoll

La Content-Security-Policy vive en una `<meta http-equiv="Content-Security-Policy">` en
`index.html`. Filosofía: **abrir lo mínimo**. Como el SDK de Firebase está **vendorizado**
(`libs/firebase/`), el código ejecutable sigue siendo de mismo origen y `script-src` se
mantiene en `'self'`. Lo único que se abre es `connect-src` hacia dominios concretos de
Google (sin comodines como `connect-src *`).

## CSP aplicada (Auth + Firestore listos)

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
media-src 'self';
font-src 'self';
connect-src 'self'
  https://identitytoolkit.googleapis.com
  https://securetoken.googleapis.com
  https://firestore.googleapis.com
  https://firebaseinstallations.googleapis.com;
object-src 'none';
base-uri 'self';
form-action 'none';
frame-ancestors 'none'
```

### Por qué cada dominio
| Directiva / dominio | Para qué | Necesario |
|---|---|---|
| `script-src 'self'` | ejecutar el SDK vendorizado (libs/) y el código del juego | sí |
| `connect-src https://identitytoolkit.googleapis.com` | Firebase Auth (registro/login/reset) | sí (Auth) |
| `connect-src https://securetoken.googleapis.com` | refresco de tokens de sesión | sí (Auth) |
| `connect-src https://firestore.googleapis.com` | lectura/escritura de `players/{uid}` | sí (Firestore) |
| `connect-src https://firebaseinstallations.googleapis.com` | ID de instalación que el SDK exige | sí |
| `'unsafe-inline'` (script/style) | `<importmap>` + `style=""` inline | sí (ya existía) |

> En **modo demo** (sin claves) no se conecta a ninguno de estos dominios: la CSP está
> preparada, pero no fuerza ninguna conexión. No rompe assets, audio, imágenes ni scripts.

## Analytics (GA4) — OPT-IN

Firebase Analytics **inyecta `gtag.js` desde `googletagmanager.com`**, así que necesita
abrir `script-src` (y algo de `connect-src`/`img-src`). Para no relajar la ejecución de
scripts por defecto, **Analytics es opcional**: hasta que añadas estas directivas,
`firebaseClient` activa Auth+Firestore y **omite** Analytics sin errores.

Para habilitarlo, edita la CSP de `index.html` y añade:
```
script-src  … https://www.googletagmanager.com;
connect-src … https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com;
img-src     'self' data: https://www.google-analytics.com;
```

## Alternativa: SDK por CDN (Opción A, sin vendorizar)

Si en `firebaseConfig.js` apuntas `sdkUrls` al CDN de gstatic en vez de a `libs/firebase/`,
debes ampliar también `script-src`:
```
script-src  'self' 'unsafe-inline' https://www.gstatic.com;
connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com
            https://securetoken.googleapis.com https://firestore.googleapis.com
            https://firebaseinstallations.googleapis.com;
```
Esto confía en `gstatic.com` para ejecutar código → **menos seguro** que vendorizar. Por eso
TREXoRoll usa vendorizado por defecto.

## Proveedores externos (Google/Apple/Samsung) — futuro

El login con popup/redirect de proveedores necesitaría `frame-src` y `connect-src` del
dominio `https://<projectId>.firebaseapp.com`. No está habilitado todavía (el juego usa
correo/contraseña). Documentar y añadir cuando se activen.

## Validación tras tocar la CSP
- El juego sigue cargando (assets, audio, imágenes, scripts locales) en local y en GitHub
  Pages.
- DevTools → Console: sin violaciones de CSP para los recursos del juego.
- Con claves reales: el login/registro conecta solo a los dominios listados.
