# Seguridad — TREXoRoll

> Auditoría defensiva del 2026-06-21 (v0.12.0). Objetivo: evitar "hackeo" y robo de datos.

## 1. Modelo de amenazas (qué hay que proteger)

TREXoRoll es un **juego web 100% del lado del cliente**, estático, alojado en **GitHub
Pages (HTTPS)**. Esto define una superficie de ataque **muy pequeña**:

| Característica | Implicación de seguridad |
|---|---|
| **Sin backend / sin servidor propio** | No hay SQL injection, ni bypass de auth, ni base de datos que robar. |
| **Acceso/registro SIMULADO (v0.17.0)** | Login/registro **locales**, sin backend. **No se guardan contraseñas ni emails**; ver §5. |
| **Sin datos personales (PII)** | Solo un **nombre visible** opcional (saneado). No se pide email ni nada identificable obligatorio. |
| **Sin pagos reales** | La monetización (vídeo/packs) es **simulada**; no se procesan tarjetas. |
| **Sin dependencias de red en runtime** | Three.js está **vendorizado** en `libs/`; audio e imagen son **locales**. |
| **Entradas de texto: solo acceso local** | Nombre/contraseña del acceso simulado; **saneadas**, sin innerHTML con datos de usuario → sin XSS (ver §5). |
| **Datos solo en `localStorage`** | Progreso del juego: récord, estrellas, inventario, idioma. **No sensible.** |

**Conclusión:** lo único que un atacante podría "robar" es el **progreso del juego** del
propio dispositivo (no sensible), y solo si ya tiene control del navegador del usuario.
No hay datos de terceros ni servidor que comprometer.

## 2. Resultado de la auditoría (código)

| Comprobación | Resultado |
|---|---|
| `eval`, `new Function`, `document.write`, `setTimeout('string')` | ✅ **Ninguno** |
| Red: `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `EventSource` | ✅ **Ninguna** |
| URLs externas en runtime (CDN, APIs) | ✅ **Ninguna** (Three.js local) |
| Entradas de usuario: `<input>`, `contenteditable`, `postMessage` | ✅ **Ninguna** |
| `location.href/replace/assign`, `target="_blank"` sin `noopener` | ✅ **Ninguno** |
| Secretos (API keys, tokens, passwords) en el repo | ✅ **Ninguno** (los "token" son la moneda del juego) |
| `innerHTML` con datos no confiables | ✅ **No** — solo interpola **contenido del propio juego** (datos/i18n) y **números saneados** |
| Saneado de `localStorage` al leer | ✅ **Sí** — `storage.js` coacciona a `Number`/tipos; `i18n` valida idioma a `es`/`en` |

**Sinks de `innerHTML` revisados** (tienda, niveles, mundos, packs, marcador de pausa,
`applyTranslations`): todos interpolan exclusivamente cadenas del diccionario/datos
(autoría del proyecto) o números calculados/saneados. Como **no existe ningún campo de
texto del usuario**, no hay forma de inyectar HTML/JS malicioso.

## 3. Endurecimiento aplicado (v0.12.0+)

- **Content-Security-Policy** (meta en `index.html`):
  `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self';
  object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`.
  - Bloquea: **scripts/recursos externos**, **conexiones salientes** (exfiltración de datos),
    **objetos/plugins**, **secuestro de `<base>`**, **envío de formularios**, **iframes**.
  - `'unsafe-inline'` se mantiene **solo** para el `<importmap>` y los `style=""` inline.
    Como **no hay vector de XSS** (sin entradas), su impacto de seguridad es nulo aquí.
- **`<meta name="referrer" content="no-referrer">`**: no se filtra la URL a terceros.

## 4. Riesgos residuales (bajos) y mitigación

| Riesgo | Severidad | Estado / Nota |
|---|---|---|
| **Trampas (auto-tampering de `localStorage`)**: el jugador puede editar su propio progreso/estrellas/vidas | 🟡 Bajo | **Inevitable en cliente puro.** Solo afecta a su propio dispositivo; no hay ranking/economía compartida. Se mitiga con saneado de tipos. |
| **Clickjacking** (incrustar el juego en un iframe) | 🟢 Muy bajo | `frame-ancestors 'none'` en CSP. *(Esta directiva en `<meta>` la ignoran los navegadores; para forzarla hace falta la cabecera HTTP `X-Frame-Options`/CSP, que GitHub Pages no permite fijar. Opcional: añadir un "frame-bust" JS.)* |
| **CSP con `'unsafe-inline'`** | 🟢 Muy bajo | Endurecimiento futuro: usar **hash SHA-256** del importmap para quitar `'unsafe-inline'` de `script-src`. |
| **Imagen de fondo pesada (~2,1 MB)** | 🟢 N/A seguridad | Rendimiento, no seguridad. |

## 5. Requisitos para el FUTURO (si se añade backend/monetización real)

Hoy no aplican (todo es cliente), pero **en cuanto se añada algo de lo siguiente**, la
seguridad cambia de categoría:

1. **Monetización real (IAP / anuncios):** validar las compras/recompensas **en servidor**.
   Nunca confiar en el cliente para otorgar vidas/estrellas pagadas (`localStorage` es
   manipulable). Usar recibos firmados (Play Billing / StoreKit) verificados server-side.
2. **Ranking/leaderboard online:** validar puntuaciones en servidor (el cliente miente).
   Anti-cheat básico (límites plausibles, firma de sesión).
3. **Cuentas/login:** HTTPS (ya), tokens con expiración, almacenamiento seguro, OWASP Top 10.
4. **Cualquier llamada de red:** mantener `connect-src` restringido a los orígenes propios.
5. **Cabeceras HTTP** (si se migra de GitHub Pages a un host con control de cabeceras):
   `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
   `Referrer-Policy: no-referrer`, `Strict-Transport-Security`.

## 6. Veredicto

**Postura de seguridad: BUENA para un juego estático sin backend.** No hay datos sensibles
ni servidor que comprometer; las únicas entradas (acceso local) están **saneadas** y no
generan XSS; sin red ni dependencias externas; `localStorage` saneado; CSP que bloquea
exfiltración y recursos externos. El único "riesgo" real es que el jugador haga trampas en
su propio dispositivo, lo cual es inherente al cliente y no compromete a nadie más.

---

## 7. Acceso / registro local (v0.17.0)

La pantalla de acceso es una **simulación 100% local**, preparada para una futura
integración real sin comprometer la postura actual:

- **No hay autenticación real ni APIs externas.** Los botones de Google/Apple/Samsung son
  **placeholders** ("Función preparada para futura integración").
- **No se guardan contraseñas ni emails.** El "login"/"registro" aceptan un nombre y una
  contraseña, pero la **contraseña no se persiste ni se transmite** (no hay red).
- En `localStorage` (`trexoroll.session.v1`) solo se guarda: `authMode`, `playerName`
  (saneado: sin `<>`, ≤24 chars), `acceptedTerms` y `language`. **Independiente del progreso
  de juego** (cerrar sesión no borra el avance).
- El nombre del jugador se muestra siempre con `textContent` (nunca `innerHTML`). El único
  `innerHTML` de esta zona es el **texto legal**, que es **contenido propio** (sin datos del
  usuario) → sin vector de XSS.
- La CSP se mantiene: no se envían formularios (`form-action 'none'`), la interacción es por
  botones + JS, todo de mismo origen.
