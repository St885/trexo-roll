# Changelog — TREXoRoll

Formato basado en *Keep a Changelog*. Versionado semántico.

## [0.24.8] — 2026-06-28 — Ajuste fino de encuadre horizontal (tablero un poco más grande)

> Acercamiento extra **conservador** en móvil horizontal. **Solo** landscape mobile; portrait
> y desktop intactos; sin tocar jugabilidad, controles, colisiones ni física.

### Qué se ajustó
- Nuevo factor tunable **`LANDSCAPE_MOBILE_ZOOM_FACTOR = 1.03`** (zoom efectivo 1.16 → **1.195**).
- Tablero **centrado** en horizontal (`raiseK` 0.03 → 0.0): recupera margen vertical para poder
  acercar sin que el borde superior se recorte al inclinar al máximo.

### Cuánto más grande
- ~**3% más de zoom** efectivo (+ el centrado aprovecha algo más de alto). Nota: el tablero ya
  estaba **al límite de "sin recorte"** (footprint 0.963 NDC en v0.24.7); por eso el margen
  seguro real era ~3–4%, no 8–12% (acoplamiento entre tamaño en reposo y la inclinación
  diagonal máxima alcanzable con el D-pad). Se priorizó **no recortar** y conservar margen.

### Seguridad (medido en los 50 niveles)
- Footprint al inclinar al máximo en diagonal: **≤ 0.952 @ aspect 2.0** (margen 4.8%) y
  **≤ 0.984** en todos los aspectos 1.6–2.33 (margen ≥1.6%). Niveles prioritarios 1/2/9/10/25:
  0.921–0.955, todos **sin recorte**. Decoración solo asoma al inclinar (≤1.235).
- **Portrait**: `computeSphereFrame` intacto (test "VERTICAL no se corta" sin cambios).
- **Desktop / landscape genérico**: rama `fit={}` intacta (sin el factor ni el cambio de raise).
- HUD compacto y controles de v0.24.7 sin cambios → no se tapan elementos clave.

### Validado
- `npm test` (225), `test:graph` (22), `test:visual` (127, guardarraíl footprint ≤ 1.0 intacto),
  `test:ui` (22), `build`, `cap:sync`: **verde**. Sin nuevo AAB.

## [0.24.7] — 2026-06-27 — Tablero protagonista en móvil horizontal (encuadre)

> El tablero se ve **claramente más grande** en landscape mobile, sin recortes al inclinar y
> **sin tocar portrait, jugabilidad, controles, colisiones ni física**.

### Causa raíz
- El encaje horizontal reservaba la banda **completa** de decoración (`DECOR_MARGIN = 2.0`)
  alrededor del tablero y una cota de inclinación conservadora, dejando el tablero pequeño
  (en reposo llenaba ~65–70% del ancho y ~58% del alto). El tablero **nunca** se acercaba a
  recortarse (footprint ≈ 0.85 NDC): sobraba margen sin aprovechar.

### Cambios de encuadre (SOLO móvil horizontal)
- **Menos banda de decoración reservada** en el encaje: `LANDSCAPE_MOBILE_DECOR = 1.5` (antes
  2.0). La decoración exterior puede **asomar levemente** fuera del borde solo al inclinar al
  máximo (transitorio, más inmersivo); el **footprint del tablero sigue garantizado dentro**.
- **Acercamiento fino** `LANDSCAPE_MOBILE_ZOOM` 1.13 → **1.16**.
- **Tablero un poco más arriba** (`raiseK` 0.0 → 0.03) → más hueco abajo para los controles.
- Resultado (medido en los 50 niveles × aspectos 1.6–2.33): tablero en reposo **~72–80% ancho
  / ~63–64% alto**; footprint al inclinar al máximo **≤ 0.963** (sin recortes, 3.7% de margen);
  encuadre ~20% más cercano que el landscape genérico. **Portrait idéntico** (computeSphereFrame
  intacto; el test "VERTICAL no se corta" pasa sin cambios).

### Protagonismo visual (CSS, solo landscape mobile)
- **HUD más compacto** (franja superior más fina: menos padding, chips 0.66rem, mini-bola 26px)
  → más espacio vertical para el tablero. HUD y controles siguen visibles.
- **Fondo del paisaje un punto más tenue** y **viñeta más marcada** → mejor separación del
  tablero respecto al entorno, sin ocultar el fondo. Estética premium conservada.

### Validado
- `canvas-smoke` (encuadre): guardarraíl duro **footprint ≤ 1.0** y **VERTICAL sin cambios**
  intactos; umbrales de decoración/cercanía actualizados al nuevo diseño (con comentarios).
- `npm test` (225), `test:graph` (22), `test:visual` (127), `test:ui` (22), `build`,
  `cap:sync`: **verde**. Sin permisos nuevos, sin cambios de jugabilidad/física. Sin nuevo AAB.

## [0.24.6] — 2026-06-27 — Pulido premium de pantallas secundarias y derrota

> Mejora de calidad visual y UX de las pantallas secundarias, manteniendo el cumplimiento
> de Play Store (sin activar anuncios/compras/login/Firebase/Analytics ni permisos nuevos).

### Game Over premium (P1)
- Rediseño con el **mismo lenguaje visual que la victoria v0.24.4**: panel compacto, fondo
  oscurecido, **insignia con el mono prehistórico** (arte original reutilizado), título corto
  («¡Turno perdido!» / «Inténtalo otra vez»), 3 stats en filas (Puntos/Nivel/Mejor), CTA
  **↻ Reintentar** y fila secundaria **Continuar/Menú**. Acento verde/dorado con toque rojo.
- **Continuar** solo aparece si hay vidas **reales** en el banco interno; sin CTA vacío.
- Sin opciones de compra ni de vídeo: las funciones simuladas quedan en `.over-sim[hidden]`.
- Landscape y móvil pequeño verificados con capturas (cabe entero, sin recortes).

### Selector de niveles (P2)
- **Barra de progreso general** (⭐ totales · 🔓 niveles) y **leyenda**.
- **Distintivos** de nivel especial: 👑 **jefe** (10/20/…/50) y ⏳ **contrarreloj** (11/22/33/44),
  con franja de color propia. Nombre corto, estrellas y estado bloqueado/desbloqueado intactos.
  (Sin mapa de mundos: se mantiene la lista por mundos.)

### Cofre jurásico (P3)
- **Barra de estrellas** hacia el próximo cofre y **estado bloqueado elegante** (cofre atenuado).

### Canje (P4)
- Reenfocado como **canje de recursos internos**: «♻️ Canje de estrellas», subtítulo «Usa tus
  estrellas…», botón **Canjear** (verbo + coste ⭐). Eliminado el lenguaje de compra:
  «comprado»→«canjeado», «Comprar · ⭐»→«Canjear · ⭐»; icono 🛒→♻️ en menú/pausa/tienda.

### Ayuda (P5)
- Reescrita como **5 pasos** numerados, visuales y cortos + una línea de controles.

### Ajustes (P6)
- Añadido grupo **Pantalla**: idioma (ES/EN) y **pantalla completa**, junto a audio y datos.
  Sin promesas de nube/cuenta; «Guardado local» (veraz).

### Técnico
- i18n ES/EN con **paridad** (nuevas claves `over.*`, `levels.progress`, `shop.redeem`,
  `howto.s1..s5`, `set.display/fullscreen`). Mono estático vía `renderMonkeyInto()`.
- `ui-runtime-check` ampliado (niveles, canje, revive-box). **Sin permisos nuevos.**
- Validado: `npm test` (225), `test:graph` (22), `test:visual` (127), `test:ui` (22),
  `npm run build`, `npm run cap:sync`: **verde**. Sin nuevo AAB.

## [0.24.5] — 2026-06-27 — Auditoría de cumplimiento de Google Play + correcciones v1

> Auditoría completa de políticas de Google Play antes de la prueba interna. **Sin riesgos
> bloqueantes** legales/de política ni de seguridad. Se aplican 2 correcciones de cumplimiento.

### Corregido (cumplimiento Play Store v1)
- **Login federado oculto**: los botones Google/Apple/Samsung eran placeholders no funcionales
  → ocultados en la app (evita "Deceptive Behavior" y uso de marcas de terceros en botones
  inoperativos). Queda «Continuar como invitado» + perfil **local**.
- **Monetización simulada oculta**: «📺 Ver vídeo» (anuncio recompensado simulado) y
  «🛒 Comprar vidas» / «Paquetes de vidas» con precios en € (sin pago real) → ocultados
  (evita apariencia de IAP fuera de Google Play Billing y de anuncios inexistentes). El cuadro
  «¿Seguir jugando?» del game over solo aparece si hay vidas en el banco (recurso interno).
- Reversible: bloque "Cumplimiento Play Store v1" en `styles/main.css`; reactivar al integrar
  OAuth/IAP/anuncios reales (actualizando antes política y Data Safety).

### Añadido (documentación)
- `docs/play-store-policy-audit.md`: auditoría con tabla de cumplimiento (20 áreas), resultados
  de búsquedas (secretos/permisos/IP), correcciones y pendientes de cuenta.
- `playstore/data-safety-draft.md` y `playstore/content-rating-draft.md`: borradores para los
  formularios de Play Console (todo "No recopila"; violencia cartoon leve; PEGI 3 esperado).

### Verificado (sin cambios)
- **Permisos**: manifest fusionado solo `INTERNET` (+ permiso de firma propio AndroidX). Cero
  permisos sensibles. **Secretos**: ninguno; sin keystore/`.env`/claves en el repo; `android/`
  y AAB ignorados. **IP**: arte 100% procedural/original (LICENSE MIT). **Privacidad/ficha**:
  veraces, sin prometer nube/login/ads/compras.

### Validado
- `npm test` (225), `test:graph`, `test:visual` (127), `test:ui`, `npm run build`,
  `npm run cap:sync`: **verde**. Auth (invitado/local) y game over (reintentar/menú) intactos.

## [0.24.4] — 2026-06-25 — Modal de victoria compacto y premium (cabe en horizontal)

> En Android horizontal el modal de victoria se salía/cortaba: apilaba ~10 líneas de texto.
> Rediseñado como un **popup compacto de juego mobile premium** que cabe completo en
> vertical y horizontal. **Sin desplegar.**

### Corregido
- **Causa del desborde**: demasiadas líneas (título + récord + puntos + desbloqueo + extra +
  detalle + recompensas + tiempo + progreso). Reducidas a **4 stats + 1 línea de bonus**.
- En **landscape** el modal **cabe completo**, con los **3 botones siempre visibles** (sin
  scroll ni recortes), mediante `max-height` seguro y reglas compactas por orientación/alto.

### Cambiado
- **Layout**: trofeo dorado, **título corto** («¡Nivel superado!»), **estrellas grandes**
  (ganadas doradas con glow, no ganadas apagadas), **4 filas** icono·etiqueta·valor
  (Puntos · Recompensa · Tiempo `m:ss.s` · Progreso `★/150`) y **bonus en UNA línea** (máx 2
  chips; el resto se guarda en silencio).
- **Botones**: CTA principal verde grande **«Siguiente nivel»** a lo ancho + fila
  **[Repetir] [Menú]**.
- **Textos cortos** ES/EN (labels, bonus, «Repetir», EN «Level complete!»); eliminadas las
  líneas largas tipo «Mejoraste a 3★/Skin desbloqueada/+100 nivel».
- **Premium**: panel glass verde + borde dorado + glow; el **tablero/celebración se ve detrás
  oscurecido** (el bucle sigue renderizando la escena con un flag; `#screen-win` pasa a
  overlay translúcido en vez de fondo opaco).
- **Responsive**: vertical centrado; horizontal compacto (a alto muy bajo, stats en 2
  columnas); desktop elegante. Respeta `prefers-reduced-motion`.

### Validado
- `npm test` (225), `test:graph`, `test:visual` (127), `test:ui`, `npm run build`,
  `npm run cap:sync`: **verde**. QA visual con capturas (desktop/vertical/horizontal): cabe
  completo, sin recortes ni scroll. Flujo de victoria, estrellas, recompensas, dino y resto
  de pantallas intactos.

## [0.24.3] — 2026-06-24 — Rediseño premium de la pantalla de Skins

> La colección de skins se ve ahora como una **tienda de juego mobile profesional**:
> panel glass jurásico, tarjetas grandes con orbe de bola, rareza, estados claros y glow en
> la equipada. Funcionalidad intacta (equipar/comprar/desbloquear). **Sin desplegar.**

### Cambiado
- **Panel premium** (`.skins-panel`): glassmorphism verde oscuro, borde dorado, glow sutil,
  más ancho y elegante, integrado con el fondo jurásico.
- **Header**: emblema 🦴, **título dorado grande** con sombra, subtítulo y **badge ⭐
  «Disponibles: X»**.
- **Tarjetas** rediseñadas: orbe con la bola (más grande), **chip de rareza** (Común/Rara/
  Épica/Legendaria) + icono de tipo, nombre y estado; hover/tap, glint premium.
- **Bolas** (`makeBallThumbnail`): más **volumen** (degradado + sombra esférica + aro) y
  **brillo** (especular + punto glossy); **glow** para skins emisivas (dorada/volcánica/hielo/
  ámbar). Mejora también el menú/preparación/HUD/selector.
- **Equipada**: borde verde + **glow pulsante** + anillo + etiqueta «Equipada». **Bloqueadas**:
  elegantes (no apagadas), candado claro y requisito legible; **sacudida** al intentar equipar.
- **Botón Volver** premium (borde dorado). **Responsive**: 4 col (desktop/horizontal), 2 col
  (móvil vertical); táctil ≥44–46px; respeta `prefers-reduced-motion`.

### Corregido
- Texto confuso de requisito (antes «72/6 ⭐ de nivel») → ahora **«🔒 Requiere ⭐ N»**, y la
  pantalla **auto-desbloquea** las skins de estrellas ya ganadas al abrirse (no muestra como
  bloqueada una skin que ya mereces). Añadido sistema de **rareza** por skin.

### Validado
- `npm test` (225), `test:graph`, `test:visual` (127), `test:ui`, `npm run build`,
  `npm run cap:sync`: **verde**. QA visual con capturas reales (desktop 4×2, móvil vertical
  2×4, móvil horizontal 4×2): premium, sin recortes ni scroll raro. Resto de pantallas intactas.

## [0.24.2] — 2026-06-24 — Ajuste fino: tablero aún más grande en móvil horizontal

> Tras probar en el emulador Android, el tablero en horizontal admitía un acercamiento extra
> seguro: el encaje por inclinación máxima dejaba ~19% de pantalla sin usar.

### Cambiado
- **Zoom específico de móvil horizontal** (`LANDSCAPE_MOBILE_ZOOM = 1.13`) + menos margen en
  el perfil `landscapeMobile` (0.04 → 0.02): la cámara se acerca **~13–15%** → el tablero se
  ve **~15% más grande** que en v0.24.1, **sin recortar** (verificado contra la geometría real
  en los 50 niveles: el footprint del tablero nunca se corta —cobertura máx 0.85— y la
  decoración queda dentro de la tolerancia 1.05).
- **Solo afecta a móvil horizontal**: vertical (portrait) y landscape de escritorio sin cambios.

### Técnico
- `scene/SceneManager.js`: nuevo `LANDSCAPE_MOBILE_ZOOM`; `computeAxisFrame` aplica el zoom y
  el margen reducido solo si `fit.landscapeMobile`. `tools/canvas-smoke.mjs`: aserciones
  separadas para TABLERO (footprint ≤ 1.0, estricto) vs DECORACIÓN (≤ 1.05) y comprobación de
  que el ajuste fino acerca un 10–18% (niveles 1, 2, 9, 13, 25).

### Validado
- `npm test` (225), `test:graph`, `test:visual` (127, incl. cámara), `test:ui`, `npm run build`,
  `npm run cap:sync` (copiado a `android/`): **todo verde**. Vertical, controles y web intactos.

## [0.24.1] — 2026-06-24 — Encuadre de cámara en horizontal: tablero mucho más grande

> El tablero se veía pequeño en **horizontal/landscape** (móvil Android y web): la cámara
> usaba un encaje por **esfera** cuyo radio lo dominaba el **ANCHO** del tablero, así que en
> horizontal alejaba la cámara y el escenario perdía protagonismo.

### Corregido
- Nuevo **encuadre por eje** en horizontal (`computeAxisFrame`): ajusta las 8 esquinas reales
  del tablero a AMBOS FOV (ancho → FOV horizontal amplio, alto → vertical) → la cámara se
  acerca y el tablero se ve **~1.2–1.4× más grande** (p. ej. "Sendero Largo" 24×8: +41%),
  aprovechando el ancho. El grosor vertical absorbe el balanceo de la inclinación máxima →
  **no se recorta** ninguna esquina al inclinar.
- El modo **vertical (portrait) queda intacto** (rama de esfera separada, sin regresión).

### Técnico
- `scene/SceneManager.js`: `_frame` delega en funciones PURAS exportadas `computeSphereFrame`
  (vertical) y `computeAxisFrame` (horizontal). Sin cambios en `resize`/`setViewportFit`/HUD/
  controles (el HUD superior y los controles en las esquinas no se solapan con el tablero).
- `tools/canvas-smoke.mjs`: verificación determinista con Three real — en los 5 tableros de
  muestra comprueba que en horizontal **no recorta** al inclinar, **no aleja** la cámara
  respecto al método previo, los tableros anchos quedan **mucho más grandes** y la cobertura
  de pantalla ≥ 0.78. (121 checks visuales, verde.)

### Validado
- `npm test` (225), `test:graph`, `test:visual` (121, incl. cámara), `test:ui`: **verde**.
  Vertical, controles, música, niveles y web/GitHub Pages intactos.

## [0.24.0] — 2026-06-23 — Android-ready: Capacitor + ficha de Play Store (sin publicar)

> Prepara TREXoRoll para **Google Play** como app Android con **Capacitor**, manteniendo la
> **web/GitHub Pages intacta** y el modo invitado/local. Sin claves reales, sin Analytics,
> sin anuncios, sin compras, sin permisos sensibles. **No se publica nada.**

### Estrategia
- Capacitor con **carpeta `www/` curada** (el juego es estático sin bundler → "build" = copiar
  runtime). `webDir: www`, `appId: com.st885.trexoroll`, `appName: TREXoRoll`.

### Añadido
- `capacitor.config.json` + dependencias de Capacitor en `package.json` + scripts
  `build`, `build:android`, `cap:add/sync/open`. `tools/build-web.mjs` (genera `www/`).
- **Ficha de Play Store** en `playstore/`: icono **512×512** y gráfico destacado **1024×500**
  (generados desde el arte del juego), descripciones (corta/larga/título), notas de versión,
  guías de capturas e icono, y copia de privacidad/Data Safety.
- **Política de privacidad pública** `privacy.html` (URL para Play:
  `https://st885.github.io/trexo-roll/privacy.html`) + `docs/privacy-policy.md` y `docs/terms.md`.
- Docs: `docs/android-build.md`, `docs/release-process.md` (firma/keystore/AAB),
  `docs/play-store-checklist.md` (Play Console + Data Safety + pruebas en móvil).

### Cambiado
- **Acceso para Play Store**: Google/Apple/Samsung pasan a **«Próximamente»** (no parecen
  login funcional); "Crear cuenta" → "Crear perfil local"; mensaje **«Modo local: tu progreso
  se guarda en este dispositivo»**. Sin prometer nube.
- `.gitignore`: ignora `www/`, artefactos de `android/`, keystores y `key.properties`.

### Seguridad / privacidad (esta fase)
- Sin Analytics activo · sin anuncios · sin compras · sin login real obligatorio · sin
  ubicación/GPS · sin permisos sensibles (solo `INTERNET` técnico). Sin claves reales.

### Validado
- `npm test` (225 asserts), `test:graph/visual/ui`: **verde**. `npm run build` genera `www/`;
  servido como en la app (rutas relativas, mismo origen): **HTTP 200** en todo. Web/Pages y
  modo invitado intactos.

## [0.23.0] — 2026-06-23 — Firebase: SDK vendorizado + CSP preparada (sin claves reales)

> Prepara la parte técnica para activar Firebase: **SDK vendorizado** en `libs/firebase/` y
> **CSP** lista para Auth + Firestore, manteniendo el modo demo intacto y **sin** claves,
> tokens ni proyecto real. **Sin desplegar.**

### Estrategia
- **Vendorizado (SDK local)** elegido sobre CDN: más seguro (todo el código ejecutable es de
  mismo origen → `script-src 'self'`, sin confiar en terceros), más estable y mejor para
  GitHub Pages. Analytics (que inyecta `gtag.js`) queda como **opt-in** documentado.

### Añadido
- `libs/firebase/` con **placeholders** ESM (`firebase-app/auth/firestore/analytics.js`) +
  `README.md` (versión 10.12.2, origen oficial, cómo poblar/actualizar, seguridad). Los
  placeholders exportan `__PLACEHOLDER__` → el juego se queda en demo hasta vendorizar.
- `tools/fetch-firebase.mjs` + script `npm run fetch:firebase`: descarga el SDK real a
  `libs/firebase/` (lo ejecuta el usuario, con red; no descarga nada sensible).
- `docs/firebase-sdk-vendor.md` y `docs/csp-firebase.md` (estrategia, archivos, versión,
  actualización, directivas CSP exactas y por qué).

### Cambiado
- `index.html`: **CSP** ahora abre `connect-src` solo a dominios concretos de Google
  (`identitytoolkit`, `securetoken`, `firestore`, `firebaseinstallations` `.googleapis.com`)
  para Auth + Firestore. `script-src` sigue `'self'` (SDK vendorizado). Sin comodines.
- `src/config/firebaseConfig.js` y `.example.js`: `sdkUrls` apunta por defecto a
  `./libs/firebase/` (vendorizado); alternativa CDN comentada.
- `src/services/firebaseClient.js`: detecta placeholders (`__PLACEHOLDER__`) y degrada a
  demo; **aviso de consola solo en desarrollo**, genérico (sin exponer config ni claves).

### Seguridad
- Sin claves reales, sin tokens, sin contraseñas (grep `AIza`/`apiKey`/`token`/`secret` →
  solo placeholders y documentación). `.gitignore` bloquea `serviceAccount*.json` y `.env`.

### Validado
- `npm test` (225 asserts), `test:graph`, `test:visual`, `test:ui`: **verde**. Carga HTTP de
  los nuevos `libs/firebase/*.js` (200). Modo invitado, demo y web/GitHub Pages intactos.

## [0.22.0] — 2026-06-23 — Arquitectura de cuenta y nube (Firebase-ready, segura)

> Prepara TREXoRoll para producción con **autenticación, progreso en la nube y analítica**
> mediante Firebase, **sin** SDK real, sin claves reales y **sin romper** el modo invitado,
> la web ni GitHub Pages. Inerte (modo demo) hasta configurar Firebase. **Sin desplegar.**

### Auditoría (estado anterior)
- El "registro" era **demo local**: la contraseña se validaba en memoria y se **descartaba**
  (no se guardaba ni se transmitía). Sesión en `trexoroll.session.v1` (solo modo/nombre/
  idioma/términos), progreso en `trexoroll.save.v1`. **No había contraseñas almacenadas.**

### Añadido (capa de servicios, Firebase-ready)
- `services/authService.js`: registro/login/logout/recuperación con Firebase Auth
  (correo/contraseña), observador de sesión, modo invitado y placeholders de proveedores.
- `services/playerProfileService.js`: documento `players/{uid}` en Firestore + **mapeo
  puro** local↔nube (correo **enmascarado**, nunca contraseña).
- `services/progressSyncService.js`: migración local→nube y **resolución de conflictos**
  (gana el más avanzado: nivel desbloqueado → estrellas → bestScore) + estados de sync.
- `services/analyticsService.js`: 12 eventos GA4 (`login`, `level_complete`, `chest_opened`…)
  con **filtrado de datos sensibles**; país por reportes **agregados** de GA4 (sin GPS).
- `services/firebaseClient.js`: carga **perezosa** del SDK (sin import estático) → el grafo
  carga sin Firebase; se intenta el SDK solo con config real.
- `config/firebaseConfig.js` (placeholders → modo demo) + `firebaseConfig.example.js`.

### Seguridad / privacidad
- ❌ contraseña en localStorage · ❌ en Firestore · ❌ contraseña/token en consola/analítica.
- Errores **genéricos** al usuario; validación de correo y contraseña (≥6). Logout y
  recuperación preparados. **Sin permisos de ubicación / GPS.**
- `.gitignore`: bloquea claves del Admin SDK / `.env`; nota para mantener privada la config.

### UI
- Pantalla de acceso: mensaje de modo (**demo** vs **nube**), campos de **correo**
  (solo nube) y nombre (solo demo), enlace **¿Olvidaste tu contraseña?**.
- Ajustes → **Cuenta**: estado de la cuenta + estado de sincronización
  (Guardado local / Sincronizado / Sin conexión / Pendiente).

### Documentación
- `docs/firebase-setup.md` (guía 1–13 + **CSP** obligatoria), `docs/auth-architecture.md`
  (auditoría, capas, modelo, sync, reglas Firestore, analítica, seguridad).

### Validado
- `npm test` (incl. nuevo `auth-smoke`: 225 asserts), `test:graph`, `test:visual`,
  `test:ui`: **verde**. Módulos nuevos sirven HTTP 200; modo invitado y web intactos.

## [0.21.0] — 2026-06-23 — Rediseño visual del menú principal (premium / mobile-first)

> Rediseño del **menú principal** para recuperar limpieza, compacidad y jerarquía tras la
> ampliación de la v0.20, **sin perder ninguna función**. **Sin desplegar.**

### Cambiado
- **Jerarquía clara en 5 zonas**: cabecera compacta (avatar + título + saludo) → tarjeta de
  stats (pills ⭐/🔓/🏆 + barra de progreso con %) → CTAs principales → grid de tiles → fila
  utilitaria. Adiós a los 11 botones apilados (panel largo y con scroll).
- **CTAs diferenciados y protagonistas**: `Continuar` en ámbar ("reanudar") y `Jugar` en
  verde **héroe** (mayor, con brillo animado). Ambos destacan sobre el resto.
- **Acciones secundarias como tiles** (icono + etiqueta corta) en rejilla 3×2: Diario, Dino,
  Skins, Cofre, Canje, Niveles. Diario/Cofre con **badge + glow** cuando hay algo listo;
  Canje muestra las ⭐ disponibles.
- **Utilitarios** (Ayuda/Ajustes/Pantalla + idioma) con menos peso visual, separados por una
  línea fina.
- **Look premium**: panel glass (`blur+saturate`), borde dorado fino, glow sutil, sombras
  elegantes, sub-tarjeta de stats con profundidad, hover/tap pulidos.
- **Responsive real**: vertical 3×2 sin scroll; **paisaje** con CTAs en par y tiles en una
  fila de 6; tablet/desktop con panel algo mayor. Objetivos táctiles correctos; respeta
  `prefers-reduced-motion`.

### Técnico
- `index.html`: nuevo marcado del `#screen-menu` (cabecera/stats/cta/tiles/util) conservando
  **todos los `id`** de botones (navegación intacta).
- `Game.js`: `_updateMenuProgress()` rellena pills, barra y **badges** de tiles sin
  sobrescribir icono/etiqueta (helpers `_setTileBadge`/`_markTileReady`).
- `styles/main.css`: sistema de menú premium (panel, head, stats, pills, cta, tiles, badges,
  util) + media queries (≤560, ≤380, paisaje, táctil).
- i18n: etiquetas cortas `menu.t.*` / `menu.u.*` (ES/EN). `docs/menu.md` + `docs/menu-preview.html`.

### Validado
- Capturas reales (Edge headless) a 360/390/820 px: sin cortes/desbordes/scroll, jerarquía y
  badges correctos. `npm test`, `test:graph`, `test:visual`, `test:ui`: **verde**.
  Navegación del menú verificada (todos los `id` presentes).

## [0.20.0] — 2026-06-23 — Evolución de progresión: estrellas, cofre, skins, habilidades, jefes, clima, diario y contrarreloj

> Gran ampliación de **progresión, recompensas y rejugabilidad** manteniendo intactos
> todos los sistemas existentes (50 niveles, controles, audio, acceso, economía, eventos).
> **Sin desplegar** — pendiente de revisión de Stefano. No hay *git push* ni deploy.
>
> **Decisión de producto (a petición):** NO se implementan objetivos/misiones por nivel
> ni un mapa visual de mundos. El selector de niveles actual se conserva y se mejora.

### Añadido
- **Estrellas de nivel 1/2/3 refinadas** (reglas automáticas y justas, sin objetivos por
  nivel): 3★ = sin perder vidas **y** bajo el tiempo objetivo; 2★ = cumplir **una** de
  {sin perder vidas, bajo tiempo, monedas suficientes}; 1★ = completar. Se guarda el mejor
  resultado por nivel y se muestra en selector, victoria y progreso. (Las monedas ahora dan
  un camino claro a 2★.)
- **Cofre jurásico**: 1 cofre cada **15 ⭐ de nivel** acumuladas. Pantalla con cofre
  animado (madera, ámbar, brillos, partículas), recompensas ponderadas (estrellas de canje,
  vida extra, bloqueo de trampa, escudo de caída, banco de vidas, **skin** o pequeño
  jackpot) y persistencia. Acceso desde **menú** y **tienda de canje**; indicador "listo".
- **Skins de bola (8)**: Clásica, Fósil, Huevo, Hielo, Ámbar, Volcánica, Meteorito, Dorada.
  Cambian color y material (brillo/emisivo/metalizado) **sin** alterar la especie ni su
  habilidad. Pantalla de colección: equipar, comprar con ⭐ de canje, desbloqueo automático
  por estrellas, y la **Meteorito solo por cofre**. Se aplican en gameplay y miniaturas.
- **Habilidades por bola (pasivas, balanceadas)**: Blanca→🛡️ *Resistencia Rex* (resiste la
  1ª pérdida del nivel); Verde→💨 *Impulso Raptor* (rueda algo más ágil); Rosa→🧲 *Atracción
  Alegre* (imán suave de monedas); Amarilla→🧱 *Estabilidad Tricera* (menos rebote/desliz);
  Azul→⚓ *Peso Bronto* (rodada lenta y controlada). Se explican en el selector y se ven en
  el HUD de poderes.
- **Jefes cada 10 niveles** (10/20/30/40/50): banner de intro, ambiente (temblores leves,
  rugidos y pterodáctilos en T-Rex/Final), y clima asociado (ceniza/tormenta). No tocan la
  física base ni el flujo de victoria/derrota.
- **Eventos climáticos** (capa overlay propia `#weather-layer`, `pointer-events:none`, por
  debajo del HUD): lluvia, niebla, viento, ceniza, tormenta, calor. Distribución por nivel.
  El **viento** aplica un empuje lateral **muy leve** solo en niveles avanzados; el resto es
  visual. Respeta `prefers-reduced-motion` y es ligero en móvil.
- **Recompensa diaria**: 1 reclamo por día, racha consecutiva (se reinicia si faltas), tabla
  de 7 días (⭐, vidas, bloqueos, escudos, banco) con calendario visual e indicador en el menú.
- **Modo contrarreloj cada 11 niveles** (11/22/33/44): cronómetro destacado en el HUD; si
  llega a 0 pierdes un intento (y reinicia la ventana); completar a tiempo da **+2 ⭐ de canje**.

### Técnico
- Nuevos módulos: `data/skins.js`, `levels/levelEvents.js`, `effects/weather.js`,
  `systems/chest.js`, `systems/daily.js`. Habilidad añadida a `data/balls.js`.
- `physics/BallPhysics.js`: modificadores de habilidad (escala de aceleración, fricción y
  rebote) y empuje de viento, **neutros por defecto** → física base y solvencia intactas.
- `utils/storage.js`: `chestsOpened`, `ownedSkins`/`activeSkin`, `daily`, helpers de cofre/
  skins/diario y `addPowerup`. Tolerante a saves antiguos.
- Nuevas pantallas (skins, cofre, diario), chips de evento en preparación, HUD de
  contrarreloj y banner de jefe. i18n ES/EN completo (paridad verificada).

### Validado
- `npm test` (física, **50 niveles superables**, input, coleccionables, imports, i18n,
  eventos, **sistemas nuevos**): **verde**. `npm run test:graph` y `test:visual`: **verde**.
  Nuevo `npm run test:ui` (runtime de pantallas nuevas con DOM simulado): **verde**.
- Sistemas existentes intactos: controles desktop/móvil, audio, acceso/registro, economía/
  tienda, portales, cavernícola, cohetes, pterodáctilo del cohete rojo, diplodocus, familia
  triceratops, dinos de victoria, mono burlón, ptero-rescate, progreso/localStorage.

## [0.19.1] — 2026-06-23 — Cohete rojo: evento del pterodáctilo más lento y coreografiado

> Mejora de timing/VFX del evento del cohete con raya roja. **Sin desplegar.**

### Cambiado
- **Despegue más lento y claro**: el cohete rojo ahora hace **ignición en la rampa**
  (retardo ~0,5 s con llama y temblor) y luego **asciende lento** (curva *ease-in* en 1,5 s),
  en vez de salir disparado al instante.
- **Impacto sincronizado de verdad**: el pterodáctilo entra antes, cruza el cielo a velocidad
  calculada para llegar a la **x del cohete EXACTAMENTE** cuando este alcanza la altura del
  encuentro (≈2 s). Antes el cohete podía "impactar" antes de que el ptero llegara; ahora
  el golpe se ve claramente (verificado por simulación: cohete y ptero coinciden en (x,y)).
- El pterodáctilo se mantiene a **altura fija** mientras cruza (impacto preciso) y, tras el
  golpe, **cae** dando tumbos cartoon y sale por debajo. Rebote del golpe un poco más marcado.
- Sonidos resincronizados: lanzamiento al despegar (~0,5 s), *bonk* del impacto (~2 s),
  silbido de caída (~2,15 s).

### Validado
- `npm test`, `npm run test:graph`, `npm run test:visual`: **verde**. Simulación offline de
  la coreografía: **impacto sincronizado** (separación 0,00). Cohete de colores y resto del
  juego, intactos.

## [0.19.0] — 2026-06-22 — Cohetes: de colores (fuegos) y con raya roja (evento pterodáctilo)

> Dos ítems-cohete recogibles en el tablero (puramente visuales, sin daño). **Sin desplegar.**

### Añadido
- **Cohete de colores** (niveles 3, 8, 13, 18, 23, 28, 33, 38, 43, 48): al pasar la bola por
  encima, sale **disparado hacia arriba** con estela, **explota en fuegos artificiales**
  multicolor y desaparece. Corto y satisfactorio.
- **Cohete con raya roja** (niveles 7, 17, 27, 37, 47): al pasar la bola, **se lanza** y
  aparece un **pterodáctilo del evento** (3D, distinto de los ambientales) que **vuela de
  lado a lado por el cielo**; el cohete lo **alcanza en el aire** (impacto **cartoon**:
  destello + chispas, **sin sangre ni violencia**), el pterodáctilo **cae** dando tumbos
  y **desaparece por debajo** de la pantalla.
- Arte premium (`RocketArt.js`): cuerpo colorido, punta, aletas, ventanilla y **raya roja**
  bien marcada; estela de propulsión, **fuegos artificiales radiales** y destellos.
- Sonidos sintetizados nuevos: `rocketLaunch`, `firework`, `bonk` (impacto), `whoosh` (caída).
- Colocación **procedural determinista y validada**: nunca sobre **hoyos, trampas, portales,
  monedas/estrella, inicio o meta**; dentro del tablero, con margen de borde y alcanzable.

### Diseño / seguridad de integración
- Los cohetes y sus animaciones son **VISUALES**: corren en `scene.update` **sin tocar la
  física, el `ballState`, el input ni el flujo de victoria/derrota**. La **victoria tiene
  prioridad** (la animación se completa en segundo plano o se limpia al cambiar de nivel);
  en una pérdida de vida no se cuelgan estados ni se bloquea el reinicio.
- **Sin reactivación**: al lanzarse, el cohete desactiva su hitbox y se retira del tablero.
- **Disjuntos del cavernícola**: los niveles de cohete **no** son múltiplos de 5, así que
  cohete y cavernícola **nunca coinciden** (sistemas separados garantizados por la distribución).
- No tapan HUD ni controles (vuelan en el cielo, por encima del tablero).

### Validado
- `npm test`, `npm run test:graph` (carga `rockets.js`/`RocketArt.js`), `npm run test:visual`
  (**construye ambos cohetes + fuegos** sin errores): **verde**. Verificación offline:
  colocación válida en los 15 niveles configurados (holgura ≥1.4 a cualquier hoyo, disjuntos
  del cavernícola). i18n ES/EN OK.

## [0.18.1] — 2026-06-22 — Ajuste: el cavernícola sale más lejos del hoyo y no toca hoyos

> Posición y zona de patrulla del cavernícola. **Sin desplegar.**

### Cambiado
- **Separación mínima clara del hoyo verde**: el cavernícola aparece y patrulla en una
  banda a `goalMin … goalMin+1.4` del hoyo (`goalMin = max(2.4, goal.r + cuerpo + 1.1)`,
  ~2.6–2.75), en vez de poder pegarse a él (antes ~1.0). Ya **no bloquea la entrada** al hoyo.
- **No toca NINGÚN hoyo**: la zona transitable excluye, con holgura del cuerpo, el **hoyo
  verde**, las **trampas** y los **portales** (se pasan `goal`, `traps` y `portals` al
  cavernícola). Además el **camino** entre destinos se valida por muestreo para que tampoco
  cruce un hoyo al desplazarse.
- Pequeña pausa al re-elegir destino (evita recálculos en bucle si una zona está saturada).

### Validado
- Verificación offline en los 10 niveles ×5: posición válida garantizada, **~4 de distancia
  al hoyo verde** y **holgura ≥1.35 a cualquier hoyo** (el cuerpo nunca lo toca).
- `npm test`, `npm run test:graph`, `npm run test:visual`: **verde**.

## [0.18.0] — 2026-06-22 — Cavernícola con lanza (enemigo dinámico desde el nivel 5)

> Nueva mecánica de obstáculo/enemigo en el tablero. **Sin desplegar.**

### Añadido
- **Cavernícola con lanza** (personaje 3D, `src/scene/Caveman.js`) que aparece en los
  niveles **5, 10, 15, 20, 25, 30, 35, 40, 45 y 50** y **patrulla** aleatoriamente cerca
  del **hoyo verde** (destinos validados contra la huella; no pisa el hoyo ni se sale).
- **Estilo "caricatura premium"**: chunky/cartoon, cabezón expresivo con **pelo y barba**
  prehistóricos, **nariz grande** y ceño marcado, **piel (pelt) al hombro** y taparrabos
  con flecos, **manos y pies** con dedos, y una **lanza** con asta de madera, atadura y
  **punta de piedra**. Materiales con volumen (piel, sombra, pieles, marfil, piedra).
- **Secuencia de ataque** al tocar la bola: el cavernícola se **detiene**, **patea** la
  bola hacia fuera (con arco), **se gira hacia el jugador** y **lanza su lanza** (proyectil
  3D que vuela hacia la cámara + destello) → el jugador **pierde una vida** por el flujo
  existente (reinicio de bola o Game Over). Tras el golpe, el cavernícola **vuelve a
  patrullar** lejos del reinicio, con una breve **gracia** anti-repetición.
- Animaciones: caminar (piernas/brazos alternados + rebote), patada, giro y lanzamiento.
- Mensajes ES/EN (`msg.cavemanHit`, `msg.caveman`).

### Mantiene intacto
- 50 niveles, portales, monedas, estrellas, tienda/canje, pterodáctilos, Diplodocus,
  familia Triceratops, dinos de victoria, mono al perder, ptero-rescate, música, controles,
  responsive, progreso/localStorage y la pantalla de acceso/registro.

### Notas de diseño (mobile-first / justo)
- Solo una instancia, breve animación de ataque (~1,5 s), colisión por distancia clara,
  el enemigo patrulla cerca del hoyo (obstáculo evitable, no injusto), no tapa HUD/controles.

### Validado
- `npm test`, `npm run test:graph` (carga `Caveman.js`), `npm run test:visual`
  (**construye el cavernícola y la lanza** sin errores): **verde**. i18n ES/EN OK.

## [0.17.0] — 2026-06-22 — Pantalla de acceso/registro (simulada, mobile-first)

> Nueva puerta de entrada jurásica con acceso/registro **local y simulado** (sin backend,
> sin APIs externas, sin contraseñas guardadas). **Sin desplegar.**

### Añadido
- **Pantalla de acceso** (`screen-auth`) que aparece al abrir el juego si no hay sesión:
  - **Continuar como invitado** (CTA principal).
  - **Ingresar** y **Crear cuenta**: formularios **locales simulados** (nombre + contraseña;
    la **contraseña no se guarda** en ningún sitio; el registro pide aceptar términos).
  - **Continuar con Google / Apple / Samsung**: **placeholder seguro** ("Función preparada
    para futura integración") con opción de continuar como invitado o volver.
  - **Selector de idioma ES/EN** y enlaces a **Política de privacidad** y **Términos**.
- **Pantalla legal** (`screen-legal`) con la política de privacidad y los términos (textos
  ES/EN), enfatizando que el juego es 100% local y sin recopilación de datos.
- **Sesión local** (`src/utils/session.js`, clave `trexoroll.session.v1`): guarda solo
  `authMode`, `playerName` (saneado), `acceptedTerms` y `language`. **Nunca** credenciales.
- **Saludo** "¡Hola, X!" en el menú y **Cerrar sesión** en Ajustes (no borra el progreso).
- `applyTranslations` ahora traduce **placeholders** de inputs (`data-i18n-ph`).

### Privacidad / seguridad
- Sin red, sin APIs externas, sin auth real, sin contraseñas ni emails almacenados. Nombres
  de jugador **saneados** (sin `<>`, longitud acotada). `innerHTML` solo con contenido propio
  (textos legales); el resto por `textContent`. La sesión es independiente del **progreso de
  juego** (al cerrar sesión no se pierde el avance).

### Validado
- `npm test` (incl. **i18n ES/EN** con las nuevas cadenas), `npm run test:graph`,
  `npm run test:visual`, **cross-check de IDs DOM** (159/69) y llaves CSS (508/508): **verde**.
  Menú, juego, controles, música, niveles, monedas, estrellas, tienda, portales, eventos
  jurásicos y dinos de victoria **intactos**.

## [0.16.0] — 2026-06-21 — Dinos de victoria premium (5 especies) + animación mejorada

> Subida de calidad de los 5 dinosaurios 3D que salen del hoyo verde al ganar.
> **Sin desplegar** (a la espera de tu visto bueno).

### Cambiado
- **Materiales** (`CelebrationDino.makeMats`): añadidos **tono medio** (volumen/sombra),
  **marfil** (cuernos/garras/dientes/pico), **interior de boca** y mantenido vientre claro;
  piel con realce de color más vivo bajo el tone mapping.
- **Helpers**: patas con **muslo + espinilla + pie + garras** (y **garra falciforme**
  opcional), **ojos con párpado** (expresión: fiera/serena), filas de **dientes**, y
  **espinas/placas dorsales**.
- **5 modelos rehechos con personalidad propia** (no recoloreados):
  - **T-Rex (feroz)**: cabezón con **mandíbula articulada que abre al rugir**, dos filas de
    dientes + interior de boca, ceño/párpados, espinas dorsales, bracitos con garras.
  - **Velociraptor (ágil)**: esbelto y horizontal, **garra falciforme** en cada pie, cresta
    de espinas (plumaje sugerido), cola larga rígida, manos con garras.
  - **Parasaurio (tierno/elegante)**: **pico de pato** + **cresta tubular curva** en dos
    tonos, mirada de párpados caídos.
  - **Triceratops (robusto)**: **gola con epoccipitales** de marfil + interior, **3 cuernos
    sólidos** + **pico**, cuádrupedo bajo.
  - **Braquiosaurio (sereno)**: **cuello largo** en dos tramos afinados, cabeza pequeña
    arriba con cresta nasal, patas columnares, mirada serena.
- **Animación de celebración** (`SceneManager`): **estiramiento (squash&stretch) al emerger**
  del hoyo; **mandíbula que abre** en el rugido del T-Rex; **cabeceo de cresta** del
  Parasaurio; se conservan giro/salto, embestida del Triceratops y mecido del cuello del
  Braquiosaurio. Confeti un poco más rico (54 partículas, paleta cálida).

### Mantiene intacto
- Selector de bolas, **asociación bola → especie**, flujo de victoria y transición de nivel,
  HUD, controles, música, monedas, estrellas, tienda, portales, Triceratops/Diplodocus/
  pterodáctilos ambientales, mono al fallar, responsive y 50 niveles.

### Validado
- `npm test`, `npm run test:graph`, `npm run test:visual` (**construye los 5 dinos** +
  confeti sin errores): **verde**. Sin dependencias nuevas; una sola instancia breve por
  victoria (rendimiento móvil sin cambios).

## [0.15.2] — 2026-06-21 — Triceratops v2: más detalle, volumen y anatomía (3 monedas)

> Segunda pasada de calidad sobre la familia Triceratops. **Comportamiento intacto**
> (aparece al recoger 3 monedas, camina por abajo y se va). **Sin desplegar.**

### Cambiado
- **Familia Triceratops mucho más trabajada** (overlay SVG, mismo activador y capa):
  - **Volumen y sombreado**: luz superior en el lomo (`tri-hi`), sombra de oclusión en
    vientre y mejilla (`tri-ao`), vientre crema y gradiente de cuerpo más vivo (4 paradas).
  - **Cabeza/anatomía**: hocico con **pico** y **línea de boca**, **ojo con anillo** cálido
    (mirada amable), mejor silueta de cráneo.
  - **3 cuernos sólidos**: 2 frontales gruesos + 1 **trasero sombreado** (`tri-horn-bk`)
    para dar profundidad, mejor colocados; **cuerno nasal** claro.
  - **Gola ancha y reconocible**: interior más claro (`tri-frill-in`), **nervios**
    radiales (`tri-frill-lines`) y **epoccipitales** de marfil en el borde.
  - **Cuerpo robusto y bajo** con **4 patas gruesas** (columnares, traseras sombreadas)
    y dedos; **cola** proporcionada.
  - **Bebés** rehechos con la misma anatomía (4 patas, cola, gola, 3 cuernos incipientes,
    ojo con anillo): claramente la misma especie, más coherentes y tiernos.
- **Animación**: caminata de **4 patas en diagonal** con **bote de peso** (ligera rotación),
  vaivén de cabeza/cola y **meneo** desfasado de los bebés.
- **Composición**: lienzo más amplio (viewBox 460×185) y grupo algo mayor
  (`clamp(84px, 15vh, 152px)`) para más presencia; sigue por debajo del HUD/controles.

### Validado
- `npm test` (SVG Triceratops bien formado + 2 bebés + partes), `test:graph`, `test:visual`,
  llaves CSS (469/469), sin huérfanos y smoke de servidor: **verde**. Activación por 3
  monedas, conteo, puntos, estrellas, diplodocus, pteros, portales, dino de victoria, mono,
  ptero-rescate, música, controles y responsive **intactos**.

## [0.15.1] — 2026-06-21 — Rediseño visual de la familia Triceratops (3 monedas)

> Mejora visual del evento de la familia Triceratops. **Comportamiento intacto**
> (aparece al recoger 3 monedas, camina por abajo y se va). **Sin desplegar.**

### Cambiado
- **Familia Triceratops rehecha** (overlay SVG, misma capa `#critter-layer`, mismo activador):
  - **Paleta amarillo dorado + marrón anaranjado + marfil** (gradientes de volumen),
    sustituye al verde oliváceo anterior.
  - **Adulto** más robusto: **gola trabajada** (epoccipitales de marfil en el borde +
    patrón interno), **3 cuernos** de marfil bien definidos, cabeza con **pico** y **ojo
    con brillo**, cuerpo con vientre crema y patrón dorsal, **4 patas** con profundidad
    (traseras más oscuras) y dedos, cola proporcionada.
  - **Bebés** rehechos con el mismo esquema cromático, tiernos y coherentes (cabeza/ojo
    grandes), no simplones.
- **Animación de caminata** mejorada: **4 patas en diagonal** (alternancia natural), bote
  corporal, vaivén de cabeza y cola, y **meneo (waddle)** de los bebés desfasado.
- **Más presencia**: tamaño algo mayor (`clamp(78px, 14vh, 142px)`) y un pelín más alto
  del borde; entrada/salida **totalmente fuera de pantalla** (recorrido más limpio, ~8 s).
  Sigue con `pointer-events:none` y z-index **bajo el HUD/controles** (pasa por detrás).

### Validado
- `npm test` (SVG Triceratops bien formado + 2 bebés + partes + responsive), `test:graph`,
  `test:visual`, llaves CSS (461/461) y smoke de servidor: **verde**. Activación por 3
  monedas, conteo, puntos, estrellas, diplodocus, pteros, portales, dino de victoria, mono,
  ptero-rescate, música y controles **intactos**.

## [0.15.0] — 2026-06-21 — Responsive real para celulares + familia Triceratops (3 monedas)

> Adaptación a tamaños de celular reales y nuevo evento visual. **Sin desplegar.**

### Añadido — Responsive móvil
- **Perfil de viewport en JS** (`getViewportProfile`, `isSmallPhone`, `isTallPhone`,
  `isLandscapeMobile`) que pone **clases en `<body>`** (`is-portrait`/`is-landscape`/
  `is-small-phone`/`is-tall-phone`/`is-landscape-mobile`/`is-short`) y se recalcula en
  `resize`, `orientationchange` y **`visualViewport.resize`** (barra del navegador móvil).
- **Encuadre de cámara por dispositivo** (`SceneManager.setViewportFit`): en **teléfono
  pequeño vertical** el tablero se ve **más grande** y un poco **más elevado** (sitio para
  HUD arriba y controles abajo); en **móvil horizontal** se aprovecha el ancho. El encaje
  por esfera sigue garantizando que el tablero entra completo a cualquier inclinación.
- Afinado responsive: paneles con **viewport dinámico** (`dvh`) para respetar la barra del
  navegador; HUD y controles **más compactos en teléfonos pequeños**; HUD que **no recorta
  la pausa** en horizontal. El selector de **50 niveles** ya hace scroll interno.

### Añadido — Evento Triceratops (3 monedas)
- Al recoger la **3.ª moneda** de un nivel, una **familia Triceratops** (1 adulto con gola,
  3 cuernos, cuerpo robusto, patas y cola + **2 bebés**) **camina por el borde inferior**
  y desaparece por el otro lado (~7 s, dirección alterna por nivel). Caminata animada
  (patas alternando, vaivén de cabeza/cola, bote de los bebés).
- **Una sola vez por nivel** (bandera `_triceratopsPlayed`, rearmada en cada nivel).
- Vive en la capa `#critter-layer` (`pointer-events:none`, z-index **bajo el HUD/controles**)
  → **no** cambia la física, **no** bloquea el input, **no** tapa HUD ni controles, y pasa
  **detrás** de los controles de las esquinas. Respeta `prefers-reduced-motion` y safe-area.

### Validado
- `npm test` añade checks de **Triceratops** (SVG bien formado, 2 bebés, partes) y
  **responsive** (viewport meta, `overflow:hidden`/`touch-action:none`, `critter-layer`
  sin captura de puntero). Verde junto a `test:graph`, `test:visual`, IDs (122/63),
  llaves CSS (457/457) y smoke de servidor. Economía, portales, pteros, diplodocus, dino
  de victoria, mono y ptero-rescate **intactos**.

## [0.14.1] — 2026-06-21 — Rediseño del Diplodocus (estrella)

> Mejora visual del evento del **diplodocus** que aparece al recoger una estrella.
> **Sin desplegar** (pendiente de revisión).

### Cambiado
- **Diplodocus rehecho por completo** (overlay SVG, misma capa `#critter-layer`,
  mismo activador: recoger estrella). Antes era una silueta plana sin patas ni cola.
  Ahora tiene **silueta de saurópodo** real: cuello largo elegante, **cabeza de saurópodo**
  con cara amable (ojo con brillo, fosa nasal, boca), **cuerpo robusto con volumen**
  (gradientes de sombreado), **patas columnares** (delanteras + traseras con dedos),
  **cola armoniosa** con vaivén, manchas dorsales y sombra de contacto.
- **Hoja tropical** mejorada (fronda con nervadura) en lugar del blob genérico.
- **Animación pulida y sincronizada**: entrada con asentamiento → levanta el cuello hacia
  la hoja → **dos mordiscos** mientras la hoja se encoge y desaparece → salida suave.
- Tamaño ligeramente reducido (`clamp(150px, 31vh, 280px)`) para **tapar menos el tablero**.
  Sigue con `pointer-events:none` y z-index **por debajo del HUD/controles**.

### Validado
- `npm test` ahora verifica que los **SVG de critters están bien formados** (etiquetas
  balanceadas) y que el diplodocus incluye todas sus partes. `test:graph`, `test:visual`,
  llaves CSS (405/405) y smoke de servidor: **verde**. Sin dependencias nuevas, mismo
  rendimiento (vector ligero animado por compositor). El resto del juego, intacto.

## [0.14.0] — 2026-06-21 — 50 niveles, portales naranjas y eventos jurásicos

> Gran expansión de contenido y mecánicas. **Sin desplegar** (pendiente de revisión).

### Añadido
- **25 niveles nuevos (26–50)** → **50 niveles** en total, con dificultad creciente
  (media-alta → experto/final) y mucha variedad de formas (cañones, puentes, círculos,
  hexágonos, rombos, islas, laberintos y campos de columnas).
- **5 mundos nuevos** (6–10) → **10 mundos** de 5 niveles:
  Cañón del Pterodáctilo 🦅 · Selva Perdida 🌴 · Cavernas de Ámbar 💎 ·
  Pantano de Sombras 🌑 · Corona del T-Rex 👑.
- **Mecánica de portales naranjas** (2 por nivel, enlazados): entrar en uno saca la bola
  por el otro. **No mata ni gana**; conserva la dirección (amortiguada, con mínimo de
  salida y colocación segura validada), tiene **cooldown anti-loop** (0,55 s) y **efecto
  de invocación** (vórtice naranja giratorio + aro de luz que se expande + chispas + sonido
  de teletransporte). Se resuelve **dentro de la física** (no rompe la semántica de eventos).
- **Pterodáctilos ambientales**: 2 vuelos por nivel (ida y vuelta) cruzando el cielo.
- **Diplodocus**: al recoger una **estrella**, un diplodocus se asoma desde un lateral,
  come una hoja y se va. Ambos eventos viven en una **capa overlay DOM/SVG** con
  `pointer-events:none` y **por debajo del HUD/controles** → no tapan la interfaz, no
  bloquean el input, no tocan la física y son ligeros en móvil.
- HUD ahora muestra **Nivel X/50**; selector de niveles, progresión y desbloqueos cubren
  los 50 niveles y 10 mundos automáticamente. Textos nuevos en **ES e inglés**.

### Cambiado
- `BallPhysics`: nuevo soporte de `portals` con `consumePortalFx()` (la capa visual
  lanza el efecto sin acoplar física y render).
- `level-validator`: ahora es **portal-aware** (modela el teletransporte en la BFS de
  solvencia, así los niveles de islas requieren portal y aun así se validan) y comprueba
  que 26–50 tengan exactamente 2 portales bien colocados.
- **Economía intacta**: monedas = 1 punto, estrellas acumulables para canje, tienda y
  potenciadores sin cambios. Los coleccionables nunca se colocan sobre un portal.

### Validado
- `npm test` ahora incluye **test de física de portales** (entra→sale por el hermano, no
  mata/gana, salida controlada, sin ping-pong) y **events-smoke** (critters no-op sin DOM,
  tiempos de vuelo, 2 portales en 26–50 / 0 en 1–25, 50 niveles). Todo **verde**, junto a
  `test:graph`, `test:visual` (construye los 50 tableros), cross-check de IDs (122/63),
  llaves CSS balanceadas y smoke de servidor.

### Notas
- Sin dependencias nuevas. CSP intacta (todo mismo origen). **Sin push/deploy.**

## [0.13.0] — 2026-06-21 — Juego completo: Ajustes, Créditos, PWA y cierre de campaña

> Revisión integral de **todas las pantallas** para dejar el juego "terminado".
> **Sin desplegar** (pendiente de revisión de Stefano).

### Añadido
- **Pantalla de Ajustes** (⚙️, accesible desde el menú) con:
  - **Música** y **Efectos** como interruptores **independientes** (antes era un único
    silencio global). Se **persisten** en `localStorage` y se aplican al instante.
  - **Reiniciar progreso** con **diálogo de confirmación** (borra estrellas, niveles,
    récords e inventario; conserva idioma, ajustes de audio y dino elegido).
  - Acceso a **Créditos**.
- **Pantalla de Créditos** (autoría, tecnología, "100% procedural y original").
- **Mensaje de campaña completada**: al superar el **nivel 25**, la pantalla de victoria
  muestra ⭐ totales / máximo y la mejor puntuación ("¡Has completado los 25 niveles!").
- **Instalable como app (PWA)**: `manifest.webmanifest` + **favicon SVG original**
  (`assets/icon.svg`, arte jurásico vectorial) enlazados en `index.html`.
- Textos nuevos en **ES e inglés** (paridad i18n completa).

### Cambiado
- **Audio** refactorizado: `this.muted` global → `sfxOn`/`musicOn` separados; nuevos
  métodos `_applyAudio` / `_toggleMusic` / `_toggleSfx` / `_toggleMasterSound`. El botón
  de sonido en **Pausa** ahora es un **silencio maestro** (apaga/enciende todo).
- El botón **🛒 Canje** del menú ahora se traduce (faltaba `data-i18n`).

### Validado
- `npm test` (física · 25 niveles · controles · coleccionables · imports · **i18n ES/EN**),
  `test:graph`, `test:visual`: **verde**. Cross-check de **IDs DOM** (121 en HTML / 62 en JS):
  todos existen. Llaves CSS balanceadas (342/342). `manifest` JSON e `icon.svg` válidos.
  Smoke de servidor: index/manifest/icono/CSS/JS sirven con MIME correcto.

### Notas
- Sin dependencias nuevas. CSP intacta (todo mismo origen). **Sin push/deploy.**
- Limitación menor conocida: iOS no usa SVG para `apple-touch-icon` (se podría añadir un
  PNG si se quiere icono perfecto al "Añadir a pantalla de inicio" en iPhone).

## [0.12.1] — 2026-06-21 — Revisión y endurecimiento de seguridad

### Auditoría (sin hallazgos críticos)
- Juego **100% cliente, sin backend, sin login, sin PII, sin pagos reales, sin red**.
  Escaneo: **sin** `eval`/`Function`/`document.write`, **sin** llamadas de red, **sin** URLs
  externas (Three.js vendorizado), **sin** entradas de usuario (→ sin vector de XSS),
  **sin** secretos. Los `innerHTML` solo interpolan contenido propio/números saneados.
  `localStorage` se **sanea** al leer (tipos/Number; idioma validado a es/en).

### Endurecido
- **Content-Security-Policy** (meta): `default-src 'self'`; bloquea scripts/recursos
  externos, **conexiones salientes (exfiltración)**, objetos/plugins, `<base>`, formularios
  e **iframes** (`frame-ancestors 'none'`). `'unsafe-inline'` se mantiene solo para el
  `<importmap>` y los `style=""` (sin impacto: no hay XSS posible).
- **`<meta name="referrer" content="no-referrer">`**.
- Documentación completa en **`docs/seguridad.md`** (modelo de amenazas, hallazgos, riesgos
  residuales y requisitos para el futuro si se añade backend/monetización real).

### Validado
- `npm test`, `test:graph`: verde. CSP diseñada para **no romper** el juego (todo es mismo
  origen + inline permitido); servidor local OK.

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.12.0] — 2026-06-21 — Selector de idioma (Español / Inglés)

### Añadido
- **Sistema de i18n** (`src/utils/i18n.js`): por defecto **Español**; el jugador puede
  cambiar a **Inglés** desde un **selector en el menú** y **todo el juego** se traduce.
  El idioma se **guarda en `localStorage`** (`getLang/setLang`).
- **Cobertura completa**: textos estáticos (vía `data-i18n` / `data-i18n-html`) y dinámicos
  (vía `t()/tf()`): menús, cómo jugar, preparación, HUD, pausa, tienda/canje, victoria,
  pantalla "sin vidas" + monetización, vídeo y packs, mensajes/toasts, y **contenido**
  (25 niveles: nombre + pista, 5 mundos, 5 bolas: nombre/etiqueta/personalidad, especies de
  dino, dificultades, ítems de tienda) y las frases del **mono burlón**.
- Cambio de idioma **en caliente**: re-traduce el DOM (`applyTranslations`) y refresca lo
  dinámico de la pantalla activa sin recargar.

### Arquitectura
- Para el **contenido**, EN usa el diccionario y **ES cae al texto original** de los datos
  (`t(key, fallback)`), evitando duplicar el español. La **UI** tiene ES+EN en el diccionario.
- Nuevo check `tools/i18n-check.mjs` (en `npm test`): valida que cada clave `data-i18n`
  exista como cadena en ES y EN, y la **paridad** ES→EN.

### Validado
- `npm test` (física + niveles + control + coleccionables + imports + **i18n**), `test:graph`
  (incl. `i18n.js`), `test:visual`, cross-check de IDs (60) y CSS: verde. Prueba funcional de
  cambio ES↔EN correcta. **Controles, música, tienda, progresión e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.11.3] — 2026-06-20 — Imagen jurásica también de fondo en el GAMEPLAY

### Cambiado — fondo de la pantalla de juego
- Ahora el **paisaje jurásico** (`jurassic-world-bg.png`) se ve **durante la partida**,
  detrás del tablero 3D (antes se veía el cielo procedural + suelo verde plano).
- **Cómo (Opción A — fondo CSS detrás del lienzo):**
  - Renderer Three.js **transparente** (`alpha: true` + `setClearColor(…, 0)`).
  - `scene.background = null` (la escena ya no pinta cielo propio).
  - Se **retira el plano de suelo verde** dominante (era lo que tapaba el fondo); el
    tablero queda como **plataforma flotante** sobre el paisaje, anclado por su
    **sombra** proyectada (blob suave) y la sombra de contacto de la bola.
  - La imagen se aplica como `background-image` de `#game-canvas` (cover/center/no-repeat)
    con un **overlay suave** (más claro que en menús) para que el paisaje luzca sin restar
    legibilidad al tablero; la **viñeta** existente refuerza el foco central.
- `applyTheme()` ahora solo ajusta la **niebla** por bioma (ya no pinta cielo ni suelo 3D).

### Notas
- El tablero sigue recibiendo la **sombra real** de la bola en su superficie.
- Se mantiene el mismo asset que en menús → coherencia visual y **una sola descarga**
  (cacheada). Sigue pendiente optimizar el PNG (~2,1 MB → WebP/JPG) en una pasada de
  rendimiento. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.11.2] — 2026-06-20 — Imagen de fondo jurásica en menús

### Añadido
- **Imagen de fondo** `assets/images/backgrounds/jurassic-world-bg.png` (1672×941) aplicada
  a las **pantallas de menú/overlay**: landing, menú, selección de bola, canje, niveles,
  cómo jugar, preparación, victoria, game over, vídeo y packs de vidas.
- Integración **mobile-first**: `cover` (sin deformar) + `center` + `no-repeat`, con
  **overlay oscuro** (gradiente 0.5→0.84) para mantener legibilidad de textos/botones, y
  **color de fallback** si la imagen no cargara. Ruta **centralizada** en la variable CSS
  `--bg-jurassic`.

### Decisión de diseño
- El **gameplay** (`#screen-game`) **no** usa la imagen: conserva su **cielo 3D por bioma**
  (la imagen quedaría oculta tras el lienzo WebGL y restaría claridad al tablero). El menú
  de **pausa** mantiene su fondo translúcido para ver el tablero detrás.

### Nota
- La imagen pesa **~2,1 MB (PNG)**; candidata a optimizar (WebP/JPG ~300–500 KB) en una
  pasada futura de rendimiento. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.11.1] — 2026-06-20 — Fix crítico: la victoria se congelaba

### Corregido
- **Causa raíz:** en v0.11.0 se añadió un *aura de victoria* en `SceneManager.spawnCelebration`
  usando `makeGlowTexture`, pero **no se importó** esa función en `SceneManager.js`. Al ganar,
  `spawnCelebration` lanzaba `ReferenceError: makeGlowTexture is not defined` → la excepción
  **mataba el bucle `requestAnimationFrame`** → el juego se quedaba congelado, sin dino de
  celebración ni pantalla de victoria. (La derrota no usa esa función → el mono seguía bien.)
  Los smoke-tests no lo detectaban porque no instancian WebGL/celebración.
- **Solución:** importar `makeGlowTexture` en `SceneManager.js`.
- **Blindaje (tolerancia a fallos):**
  - `Game._startCelebration` envuelve la celebración en `try/catch`: aunque el visual falle,
    el estado pasa a `celebrating` y se llega a la pantalla de victoria igualmente.
  - `Game._loop` envuelve el frame en `try/catch`: un error puntual **ya no detiene** el
    render loop (se registra y continúa).
- **Regresión:** nuevo `tools/imports-check.mjs` (en `npm test`) verifica que toda función
  de `textures.js` **usada** en un módulo esté **importada** → caza esta clase de error.

### Verificado
- Flujo de victoria: meta → física controlada → celebración → overlay → recompensas →
  desbloqueo → continuar. `npm test` (con imports-check), `test:graph`, `test:visual`: verde.
  **Mono de derrota, controles, música, tienda y progresión intactos.**

## [0.11.0] — 2026-06-20 — Economía, mono burlón, dino de victoria y monetización mobile

Iteración (5 ciclos internos) con foco **mobile-first**. Sin romper controles, música,
tienda/canje, progresión ni inventario.

### Economía (monedas = 1 punto · estrellas acumulables)
- **Moneda: 100 → 1 punto.** Deja de inflar la puntuación.
- **Estrella: ya no da puntos**; suma **+1 estrella de canje** (recurso acumulable para la
  tienda). HUD y mensajes clarificados ("⭐ +1 de canje" vs "Puntos"). Ver `docs/economia.md`.
- Costes de tienda revisados (2/3/4 ⭐) — equilibrados con ~12 ⭐ por recorrido; sin cambios.

### Dino de victoria (más impacto)
- **Emergencia con impacto**: overshoot al salir del hoyo, **polvo** al emerger, **primer
  salto más alto** y **aura de victoria** brillante bajo el dino (late y se desvanece).
- (Sobre las mejoras de v0.10.0: ojos con brillo, garras, cejas, fosas, materiales.)

### Mono prehistórico burlón (al fallar)
- Nuevo `src/effects/tauntMonkey.js`: al caer en **trampa** o salirte del tablero **sin
  escudo**, aparece un instante un **simio primitivo** (dibujado en Canvas 2D) que se ríe
  y se burla (bocadillo + meneo), con **risita** sintetizada, y desaparece solo (~1,5 s).
  Es un overlay ligero: **no bloquea** el juego ni la pérdida de vida.

### Monetización mobile (MVP conceptual, flujos SIMULADOS)
- **Pantalla "¡Sin vidas!"** con opciones para seguir jugando:
  **📺 Ver vídeo (+3 vidas)**, **🛒 Comprar vidas**, **⏩ Continuar (banco)**, Reintentar, Menú.
- **Vídeo recompensado** placeholder (`screen-adview`): cuenta atrás → concede vidas →
  continúa. Etiquetado "simulación · sin anuncios reales" (con opción Saltar).
- **Tienda de packs de vidas** (`screen-lifepacks`): 5/15/50 con precios de muestra; compra
  **simulada** que llena el **banco de vidas** (`localStorage.livesBank`).
- Documentación completa en **`docs/monetizacion.md`** (modelo, arquitectura, integración
  futura de ads/IAP y otras vías: cosméticos, retención/diario, pase jurásico).

### Validado
- `npm test`, `test:graph` (incl. `tauntMonkey.js`), `test:visual`, cross-check de IDs (60)
  y CSS: verde. **Controles móviles, música, tienda, progresión e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.10.0] — 2026-06-20 — Calidad visual: dinos, monedas, estrella, FX y sonido

Iteración de calidad visual/audio centrada en el gameplay, **sin tocar** controles,
música de fondo, tienda/inventario, progresión ni física.

### Dinosaurios (modelos 3D de celebración y ptero)
- **Más carácter y forma de dinosaurio**: ojos con **brillo especular**, **garras** en los
  pies (3 uñas por pata), **cejas** y **fosas nasales** en T-Rex y Velociraptor, materiales
  con leve *sheen* y realce de color (emisivo suave) bajo el tone mapping. Mantiene la
  identidad por especie (no son el mismo recoloreado).
- **Pterosaurio del rescate** rehecho: **alas membranosas** con hueso de borde, **cresta**
  larga, **ojos** y cuerpo de dos tonos (lomo/vientre).

### Monedas
- Disco grueso con **relieve central** y **borde**, ligeramente inclinado para que **destelle
  al girar**; **material dorado** mejor (metálico + emisivo cálido) y **aura** dorada en el
  suelo. Animación idle de giro + flote + leve respiración del aura.

### Estrella especial
- Estrella de 5 puntas **extruida con bisel**, **emisivo intenso** y **aura** más grande y
  brillante que la moneda; giro elegante. Se lee claramente como "más especial".

### Efectos de recolección (FX)
- **Popup de puntos flotante** "+100" / "+500" en la posición del coleccionable (proyección
  3D→pantalla respetando la inclinación del tablero) en una nueva capa `#fx-layer`.
- **Partículas**: ráfaga dorada al recoger la estrella (ya existía) + destello/aura.

### Sonido (Web Audio sintetizado, sin copyright)
- **Moneda**: "¡ding!" arcade **original** — dos notas ascendentes (Do6→Sol6) con leve *bend*
  al alza; corto y satisfactorio. **No** reproduce el sonido protegido de ningún juego.
- **Estrella**: arpegio ascendente de 4 notas + **chispa** final (más brillante y especial
  que la moneda). Volumen balanceado, suena junto a la música; cada recogida crea sus
  osciladores (sin duplicación); respeta el autoplay del navegador (suena tras gesto).

### Sistema de pickups/FX/audio (breve)
- `src/levels/collectibles.js` coloca monedas/estrella; `src/scene/collectibleArt.js` los
  modela en 3D; `SceneManager` los anima, recoge (pop), proyecta a pantalla (`projectBoardPoint`)
  y lanza partículas (`spawnBurst`); `Game._checkPickups` detecta la recogida, suma puntos,
  persiste estrellas-token, muestra el popup (`_popPoints`) y dispara el sonido (`sfx.coin/starGet`).
  Para **cambiar un sonido**: editar `src/effects/sfx.js`. Para el **aspecto** de moneda/estrella:
  `src/scene/collectibleArt.js` + `makeGlowTexture` en `src/scene/textures.js`.

### Rendimiento
- Materiales emisivos y auras (planos con blending aditivo) son ligeros; las texturas de
  brillo se **liberan** al cambiar de nivel (sin fugas). Apto para móvil.

### Validado
- `npm test`, `test:graph`, `test:visual` (incl. `makeGlowTexture` + construcción de
  monedas/estrella/ptero/dinos), cross-check de IDs (56) y CSS: verde. **Controles móviles,
  música, tienda, progresión e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.9.0] — 2026-06-20 — Pulido profundo de pantallas (3 ciclos)

Iteración de UX/visual en todas las pantallas, **sin tocar** controles móviles, música,
progresión, tienda/inventario ni física.

### Ciclo 1 — alto impacto
- **Selector de niveles por MUNDOS**: 25 niveles agrupados en 5 mundos (Valle Jurásico,
  Pantano Raptor, Cráter Volcánico, Ruinas Fósiles, Isla TREXo) con cabecera, estrellas por
  mundo y candado; tarjetas con ✓ de completado.
- **Preparación enriquecida**: muestra el **mundo**, las **monedas** del nivel y avisa si hay
  **estrella especial** aquí.
- **Selector de bola** con **personalidad** (frase breve por dino).
- **Victoria**: recap de lo recogido (🪙 monedas, ⭐ estrella) y **mensaje de desbloqueo**
  ("🔓 ¡Nivel X desbloqueado!").
- **Game Over**: sugerencia de canje + botón **🛒 Ir a Canje**.
- **Pausa**: resumen de **poderes activos** + botón **🛒 Canje**.
- **HUD**: chip de **poderes activos** (🪨/🦅) cuando aplican.

### Ciclo 2 — animaciones y feedback
- **Feedback de compra** en la tienda animado (éxito en verde / falta en rojo) — corregido
  un caso en que el mensaje se borraba al re-render.
- **Partículas**: ráfaga dorada al recoger la **estrella** y al **ptero-rescate** (aterrizaje).
- Hover con relieve en tarjetas de tienda, ✓ de nivel completado, realces al pulsar.

### Ciclo 3 — QA visual / mobile
- **HUD anti-saturación**: nombre de nivel truncado, gaps compactos; en pantallas muy
  estrechas (<380px) se prioriza nivel/vidas/puntos/monedas (se oculta el tiempo).
- **Anti-overflow**: nombres de mundo con elipsis; pantalla de niveles con scroll cómodo.
- Objetivos táctiles ≥44px mantenidos; sin solapes con el tablero ni los controles.

### Validado
- `npm test`, `test:graph`, `test:visual`, cross-check de IDs (55) y balance CSS: verde.
  **Controles móviles, música, progresión, tienda e inventario intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.8.0] — 2026-06-19 — Recompensas: monedas, estrellas-token y Tienda de Canje

### Añadido — recompensas en el tablero
- **Monedas** (`🪙 +100`) colocadas de forma **procedural y determinista** en cada nivel,
  validadas contra huella/hoyos/trampas/inicio (nunca bloquean ni hacen imposible el nivel).
  Dificultad creciente: iniciales fáciles, medios en rutas secundarias, avanzados cerca de
  zonas de riesgo. Monedas 3D doradas que giran y flotan; **VFX "pop"** + sonido al recoger.
- **Estrella especial** (`⭐ +500`) **cada 2 niveles** (2, 4, 6…): suma puntos y **+1
  estrella-token**, con efecto y sonido más vistosos. Se guarda en `localStorage` al recogerla.
- **HUD**: chip de **monedas** del nivel (con animación al sumar).

### Añadido — inventario y Tienda de Canje
- **Inventario** persistente (`localStorage`): `starTokens`, `extraLives`, `trapBlocks`,
  `fallShields`. *(Las estrellas-token son distintas de las ★ de valoración por nivel.)*
- **Tienda de Canje** (menú → 🛒 Canje): muestra estrellas disponibles, las 3 recompensas
  con coste y cantidad poseída, botón de compra y feedback (éxito / faltan estrellas).

### Añadido — 3 potenciadores
- **Vida extra** (2★): si llegas a 0 vidas, se **consume automáticamente** y recuperas 1.
- **Bloqueo de trampa** (3★): se activa en preparación; **tapa la trampa más peligrosa**
  (la más cercana a la línea inicio→meta) — se ve gris/apagada y deja de contar.
- **Escudo de caída** (4★): si caes del tablero, **un pterosaurio te rescata** (animación) y
  te deja en zona segura; se consume. Mensaje "¡Rescate jurásico!".
- Activación por nivel desde **preparación** (toggles que aparecen solo si tienes stock).

### Validado
- `npm test` ampliado con **colocación de coleccionables** (105 monedas y 12 estrellas en
  los 25 niveles: válidas, deterministas, estrella en pares). `test:visual` cubre los modelos
  3D (moneda/estrella/ptero/tapa). `test:graph` incluye los módulos nuevos. Cross-check de
  IDs (48) y CSS: verde. **Controles móviles y música intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.7.1] — 2026-06-19 — Música de fondo desde archivo (pista de aventura)

### Cambiado — música de fondo
- La música ahora es una **pista de archivo**: `assets/audio/trexo-roll-adventure-bg.mp3`
  (copiada con permiso desde `04_recursos_compartidos/musica-de-fondo/aventura/`
  `nastelbom-adventure-471461(trexob).mp3`; original intacto). MP3 válido, 4.6 MB.
- `music.js` reescrito para reproducir el archivo con `HTMLAudioElement`:
  **bucle**, **volumen moderado** (0.4), **instancia única** (no se duplica al cambiar de
  pantalla), **autoplay-safe** (suena tras pulsar "Entrar"; reintenta en el siguiente gesto
  si el navegador lo bloquea). Silenciable desde el botón de sonido del **menú** y la **pausa**.
- La implementación **procedural anterior** se conserva como respaldo en
  `src/effects/music-procedural.js.bak` (no se borró nada).
- Ruta **relativa** (`assets/audio/…`) → funciona en local y en GitHub Pages (`/trexo-roll/`).

### Notas
- Sin dependencias nuevas. Los ajustes visuales de v0.7.0 (tablero más grande/elevado,
  fondo jungla) siguen aplicados. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.7.0] — 2026-06-19 — Tablero protagonista: más grande, elevado, jungla y nueva música

### Tablero más grande (sin recortes)
- **Encuadre simplificado y correcto** (`SceneManager._frame`): como la rotación conserva
  la distancia al pivote, una **esfera de radio `flat`** (diagonal del tablero + banda de
  decoración) lo contiene COMPLETO a cualquier inclinación. Se eliminó el término extra de
  "balanceo" (sobre-conservador) y se redujeron los márgenes → la cámara se **acerca** y el
  tablero ocupa bastante más viewport, **sin reintroducir recortes de esquinas/objetos**.

### Tablero elevado (no hundido)
- **Grosor real** del tablero (THICKNESS 0.5 → 1.4) con **cantos oscuros** (material por
  cara en cajas y cilindros) → parece una **plataforma con cuerpo**, no una lámina.
- **Suelo más abajo** (−3.2 → −4.2) y **sombra grande proyectada** bajo el tablero → lo
  ancla y separa del fondo; el tablero "flota" como plataforma, deja de verse hundido.

### Fondo de jungla
- **Capas de profundidad** en el cielo de cada bioma: **bruma atmosférica** sobre el
  horizonte + **canopy de jungla** (copas frondosas en 2 capas, color del bioma) sobre las
  siluetas existentes → sensación de selva con profundidad en todos los mundos.
- **Niebla 3D más lejana** (near 42→80): el tablero y la decoración cercana quedan
  **nítidos** y solo se difumina el suelo/horizonte (antes la niebla "empañaba" el tablero).

### Música nueva (mejor que la anterior)
- `music.js` rehecho: **música generativa** con progresión **I–V–vi–IV** (Do–Sol–Lam–Fa),
  pad cálido + bajo + **melodía pentatónica que varía** (silencios y saltos de octava → no
  suena "en bucle") y **eco** corto para dar espacio. Épico-suave, amigable. Volumen
  moderado, **autoplay-safe**, silenciable desde menú y pausa.
- **Cómo cambiar a una pista de archivo** (CC0/libre): documentado en la cabecera de
  `music.js` (copiar mp3 a `assets/music/` y usar un `HTMLAudioElement`).

### Validado
- `npm test`, `test:graph` (incl. `music.js`), `test:visual` **ampliado** (construye los
  **25 tableros** con la geometría nueva + `makeGroundTexture`/canopy en 8 biomas): verde.
  **Controles móviles y de escritorio intactos** (sin tocar `InputController`).

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.6.0] — 2026-06-19 — Mapa: cámara robusta, fondo jurásico y música

### Corregido — objetos y esquinas desaparecían al inclinar el tablero
- **Causa raíz:** el encuadre de cámara se calculaba para el tablero **plano** y demasiado
  ajustado: usaba el lado mayor (no la **diagonal** real de las esquinas) y no tenía en
  cuenta el **balanceo** que la inclinación provoca; además la decoración (hija del grupo
  del tablero) quedaba en el borde del frame y, al rotar, se salía. Algunos objetos podían
  además **culearse** por una esfera de recorte desfasada al girar.
- **Solución:**
  - **Encuadre robusto** (`SceneManager._frame`): el radio a encuadrar cubre la **diagonal**
    del tablero, la **banda de decoración** y el **balanceo por inclinación máxima**; encaje
    por esfera (`sin`) en lugar de plano (`tan`). Resultado: el tablero entra completo aun
    inclinado, en vertical y horizontal.
  - **`frustumCulled = false`** en todo lo que cuelga del tablero (superficie, paredes,
    hoyos, anillos, decoración, banner) y en el dino de celebración + confeti → nada
    "desaparece" por culling al rotar.
  - **Volumen de sombra ampliado** (±34, far 100) y `far` de cámara a 260: las sombras no se
    cortan al inclinar.

### Mejorado — fondo y escenario
- **Suelo jurásico trabajado** (`makeGroundTexture`): reemplaza el verde plano por tierra
  del bioma con vetas, matas de follaje y piedrecitas; tinte por bioma. Más vivo sin
  distraer (la niebla + viñeta enfocan el tablero). Se mantiene HUD legible.
- **Decoración por bioma**: mezcla de props según el mundo (volcán=rocas, pantano/isla=
  helechos, huevos=nidos, ruinas=fósiles…), en una banda controlada (no invade el área
  jugable ni se corta) con leve jitter para que no se vea "en rejilla".

### Añadido — música de fondo
- **`music.js`**: música procedural (Web Audio) estilo aventura jurásica — pad grave suave +
  melodía pentatónica amable en bucle. **Sin archivos ni copyright.** Volumen moderado.
  **Autoplay-safe**: arranca tras el primer gesto (pulsar "Entrar"). Silenciable desde el
  botón de sonido del **menú** y del **menú de pausa** (etiquetas sincronizadas).

### Validado
- `npm test` (física + 25 niveles + **controles móviles**), `test:graph` (incl. `music.js`),
  `test:visual` (incl. `makeGroundTexture` en los 8 biomas), cross-check de IDs y CSS: verde.
  **Controles móviles y de escritorio intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.5.0] — 2026-06-19 — Pase de pulido visual y UX (todas las pantallas)

Iteración de polish sobre **todas** las pantallas, mobile-first y coherente, **sin tocar
la lógica de los controles táctiles** (D-pad/joystick siguen validados por `npm test`).

### Añadido
- **Sistema de diseño**: tokens de color jurásicos ampliados, sombras en capas, jerarquía
  tipográfica, filo dorado en paneles y **animaciones de entrada** de pantalla/panel.
- **Landing** rediseñada: etiqueta de marca, bola 🦖 con rebote, fondo con decoración
  jurásica flotante (hojas/huesos/huevos), CTA claro ("Entrar a la aventura").
- **Menú**: **barra de progreso** (estrellas totales + nivel desbloqueado) y botón
  **"⏩ Continuar"** (aparece solo si hay progreso; retoma el último nivel jugado).
- **Selección de dino**: nombres de personaje (**Rex Blanco, Raptor Verde, Dino Rosa,
  Tricera Amarillo, Bronto Azul**), tarjetas con check de selección y mejor contraste.
- **Selector de niveles**: franja de color por dificultad (Fácil/Media/Difícil/Experto).
- **Victoria**: emoji 🏆, **destellos** cayendo, y botón **"↻ Repetir nivel"**.
- **Game Over**: emoji, mensaje motivador y **nivel alcanzado**.
- **Pausa**: mini-resumen (vidas + puntos).
- **Cómo jugar**: ítems en tarjetas legibles; controles móviles explicados (D-pad/joystick).

### Mejorado
- Botones (variantes primary/amber/ghost), paneles, sombras, contraste y espaciados.
- HUD: chips más legibles y mejor distribución; respeto de *safe areas* en ambos lados.
- Responsive: revisados vertical/horizontal/tablet/desktop; compactaciones en paisaje bajo;
  decoración desactivada donde estorbaba; `prefers-reduced-motion` respetado.

### Calidad
- Limpieza de CSS sin uso (`.decor-line`).
- Cross-check de IDs DOM: los 41 IDs referenciados por JS existen en `index.html`
  (se detectó y corrigió la pérdida accidental de `over-record`).

### Validado
- `npm test` (física + 25 niveles + pipeline de control), `test:graph`, `test:visual`,
  balance de CSS y cross-check de IDs: todo en verde. **Controles móviles intactos.**

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.4.2] — 2026-06-19 — Control móvil definitivo: D-pad robusto

### Corregido (el D-pad "dejaba de responder" al jugar en móvil real)
- **Causa raíz:** el **arrastre sobre el lienzo** tenía prioridad sobre el D-pad. En
  cuanto el dedo (o la palma) rozaba el tablero, el arrastre tomaba el control y el
  D-pad quedaba anulado → sensación de "los controles no funcionan".
- **Solución:**
  - **Nueva prioridad** `joystick > D-pad/teclas > arrastre`. El D-pad pulsado **siempre**
    manda sobre un arrastre accidental, y pulsarlo **cancela** cualquier arrastre activo.
  - **Arrastre del lienzo desactivado en dispositivos táctiles** (era el origen del
    conflicto): en móvil el control es el **D-pad** + **joystick**; el arrastre con ratón
    se mantiene en desktop.

### Mejorado
- **D-pad principal**, grande (168px) y de **alto contraste** (verde al pulsar), siempre
  visible; **diagonales** pulsando dos botones (multitouch). Joystick analógico queda como
  **complemento** secundario (un poco más pequeño y discreto).
- **Reset robusto del input**: al perder el foco (`blur`) o cambiar de pestaña
  (`visibilitychange`) se sueltan todas las direcciones → ninguna tecla se queda "pegada".
- API de control clara: `pressDirection`, `releaseDirection`, `resetTouchControls`,
  `getTiltInput`.
- "Cómo jugar" y la pista en partida actualizadas (D-pad como control móvil principal).

### Validado
- `npm test` ampliado: además de joystick/D-pad, ahora cubre **diagonales**, **prioridad
  D-pad > arrastre** y **reset sin teclas pegadas**. Todo en verde.

### Notas
- Sin dependencias nuevas. Sin push/deploy (pendiente de confirmación de Stefano).

## [0.4.1] — 2026-06-19 — Controles móviles funcionales

### Corregido (el control táctil no inclinaba el tablero)
- **Causa raíz:** el lienzo y contenedores no tenían `touch-action: none`, así que el
  navegador interpretaba el gesto como scroll y **cancelaba el puntero**; además el
  joystick escuchaba `pointermove` en `window` y **sin `preventDefault`**.
- **Solución (patrón de legendary-adventures):** cada control escucha **sus propios**
  eventos de puntero con `setPointerCapture` + `{ passive: false }` + `preventDefault`;
  `touch-action: none` en `#game-canvas`, su `<canvas>`, `#ui` y `.screen`.

### Añadido
- **D-pad** de 4 botones (abajo-izquierda) como control robusto que alimenta el sistema
  de teclas — funciona aunque el joystick no responda perfecto. Joystick analógico
  reubicado abajo-derecha (pulgar derecho).
- Controles táctiles **solo en dispositivos táctiles** (`body.is-touch`); desktop queda limpio.
- **Botón “⛶ Pantalla completa”** en el menú y **metas PWA** (`apple-mobile-web-app-capable`,
  `mobile-web-app-capable`, `status-bar-style`) para mejor experiencia en móvil.
- Smoke-test del pipeline de control (`tools/input-smoke.mjs`, en `npm test`): valida que
  joystick y D-pad **modifican la inclinación** y resetean al soltar.

### Mejorado
- **Cámara móvil vertical:** menos margen → **tablero más grande**, y un leve desplazamiento
  para dejar sitio a los controles de abajo.

## [0.4.0] — 2026-06-19 — Mobile & responsive

### Añadido
- **Joystick táctil virtual** como control móvil principal: inclina en 8 direcciones,
  vuelve suave al centro al soltar, indicador visual activo. Convive con arrastre
  (ratón/táctil) y teclado; prioridad joystick > arrastre > teclado. El knob refleja
  siempre la inclinación actual.
- **Sensibilidad separada** móvil vs. desktop para el arrastre (`PHYS.DRAG_FULL_PX_*`).
- **Pista contextual** al iniciar nivel (“Arrastra el joystick…” en táctil) que se desvanece.
- Manejo de **`orientationchange`** además de `resize` (cámara y joystick se reajustan).

### Mejorado
- **HUD responsive**: chips compactos en pantallas estrechas, botón de pausa con área
  táctil ≥44px, joystick reubicado a un lado en paisaje (alcance del pulgar).
- **Canvas/cámara**: más margen de encuadre en vertical (tablero completo + aire para el joystick).
- **Pantallas**: objetivos táctiles grandes (`pointer: coarse`), grids más compactas en móvil,
  paneles compactos en paisaje bajo.
- **Anti-fricción táctil**: `touch-action: none`, `overscroll-behavior: none`,
  `-webkit-touch-callout: none`, sin zoom por doble toque; respeto de *safe areas* (notch).

### Notas
- Controles desktop (flechas/WASD + arrastre con ratón) intactos.
- Sin dependencias nuevas; sin push/deploy (pendiente de confirmación de Stefano).

## [0.3.1] — 2026-06-19 — Una especie de dino por bola

### Corregido
- **Cada bola es ahora una especie de dinosaurio DISTINTA** (no el mismo dino
  recoloreado): Blanca→**T-Rex**, Verde→**Velociraptor**, Rosada→**Parasaurio**,
  Amarilla→**Triceratops**, Azul→**Braquiosaurio**.
- **La criatura de victoria ya se lee claramente como dinosaurio** (antes parecía un
  patito): modelos 3D rehechos con rasgos inequívocos — T-Rex (cabezón con mandíbula y
  dientes, brazos diminutos), raptor (esbelto, cola larga), parasaurio (cresta tubular,
  pico), triceratops (gola + 3 cuernos), braquiosaurio (cuello larguísimo).
- La celebración instancia **el dinosaurio correcto según la bola elegida**.

### Añadido
- **Emblema de bola por especie**: silueta de perfil del dinosaurio (`scene/dinoArt.js`),
  claramente diferente entre bolas.
- **Animación de celebración por especie**: T-Rex cabezazo/rugido, raptor giro veloz,
  parasaurio baile, triceratops mini-embestida, braquiosaurio mecer el cuello.
- Arquitectura `data/dinos.js` (perfiles) + `data/balls.js` (mapeo bola→especie).
- Las tarjetas de selección y la preparación muestran el **nombre del dinosaurio**.

### Notas
- (Nota: la `version` del `package.json` no se había subido en 0.3.0; queda en 0.3.1.)

## [0.3.0] — 2026-06-19 — Bolas, mundos y celebración

### Añadido
- **Selección de bola**: 5 bolas (Blanca, Verde, Rosada, Amarilla, Azul), cada una con
  **cara de dinosaurio** procedural propia. Pantalla de selección, cambio rápido desde
  preparación, y **persistencia** en `localStorage`. Preview en menú, preparación y HUD.
- **Efecto especial de victoria**: el **dinosaurio de la bola elegida sale del hoyo,
  salta y baila** (mueve brazos y cola) con **confeti** y **rugido** procedural. El color
  del dino corresponde a la bola elegida.
- **Fondos jurásicos por bioma** (8 ambientaciones: valle, bosque, volcán, pantano,
  meseta, ruinas, isla, huevos): cielo en degradado + siluetas de horizonte (montañas,
  volcán con lava, palmeras, mesetas, columnas), color de suelo y niebla por bioma.
  Todo pintado por código (Canvas 2D), ligero.
- **10 niveles nuevos** (16–25) → **25 niveles** en total, con dificultad creciente:
  Valle de las Huellas, Pantano del Raptor, Cañón de Huesos, Cúpula Volcánica,
  Sendero del Triceratops, Isla del Huevo Dorado, Laberinto del Carnotauro,
  Fósiles Perdidos, Ruinas del T-Rex y Gran Final Jurásico.
- **HUD**: mini-icono de la bola elegida; animación "pop" en puntuación/estrellas.
- **Persistencia** ampliada: bola elegida y último nivel alcanzado.

### Mejorado
- Render con **tone mapping** y luces (de v0.2.0) ahora sobre mundos temáticos:
  cada bioma se siente como una región distinta.
- Smoke-test de dibujo/3D (`npm run test:visual`) que ejerce caras de bola, biomas y
  dino de celebración sin navegador.

### Notas
- Sigue sin dependencias externas en runtime ni assets con copyright.
- Pendiente: verificación visual y de sensación en navegador.

## [0.2.0] — 2026-06-19 — Iteración profesional

### Añadido
- **15 niveles** (antes 5): + Doble Recodo (L), Puente Colgante, Cruce, Serpiente,
  Foso Doble, Anillo, Diamante, Embudo, Laberinto II y Cima Final, con curva de
  dificultad (Fácil → Experto) y formas/uniones nuevas.
- **Validador de niveles** automático (`tools/level-validator.mjs`, en `npm test`):
  comprueba que ningún nivel sea imposible (BFS de start→meta evitando muros/trampas).
- **Sistema de estrellas** (1–3 por nivel) según vidas perdidas y tiempo vs. par;
  total de estrellas y **mejores tiempos** por nivel persistidos.
- **Récord**: feedback "¡Nuevo récord!" + sonido al batir la mejor puntuación.
- **Pausa** (botón ⏸ / tecla P / Esc) con Continuar, Reiniciar nivel y Menú.
- **Cronómetro** en el HUD; **indicador de inclinación** (ayuda táctil en móvil).
- **Feedback**: flash de pantalla (rojo al fallar, dorado al ganar), sacudida de cámara,
  sonidos de inicio y récord.

### Mejorado
- **Game feel**: gravedad, fricción ("peso"), suavizado de inclinación y rebote
  reajustados; **margen de perdón** al teetear en el borde antes de caer (`FALL_GRACE`).
- **Visual 3D**: tone mapping ACES + exposición, sombras 2048 + normalBias, luz de
  relleno fría (rim), y **sombra de contacto** bajo la bola. Viñeta cinematográfica.
- **UI**: transiciones de pantalla, chip de dificultad, marca consistente, panel de
  victoria con estrellas/tiempo/récord, selector de niveles con estrellas.

### Notas
- Sigue sin dependencias externas en runtime ni assets con copyright.
- Pendiente: verificación visual y de sensación de control en navegador.

## [0.1.0] — 2026-06-19 — MVP inicial

### Añadido
- Núcleo de física propia: gravedad por inclinación, integración con paso fijo,
  fricción, límite de velocidad, rebote círculo-vs-AABB, caída y detección de hoyos.
- Huella de tablero data-driven: formas `rect`, `circle` y `poly` (unión).
- Capa 3D con Three.js r160 (vendorizado): renderer con sombras, cámara con encuadre
  automático, cielo, niebla, suelo e iluminación.
- Bola blanca con emblema de T-Rex (procedural) y giro de rodadura.
- Tablero con superficie, muros, hoyo objetivo (anillo verde pulsante), hoyos trampa
  (anillo rojo) y decoración jurásica original (rocas, huevos, helechos, fósiles, huellas).
- 5 niveles: Valle Inicial, Sendero Largo, Cresta Triangular, Cráter Circular,
  Laberinto Jurásico.
- Bucle de juego: 3 vidas, reinicio de bola, puntuación (base + vidas + tiempo),
  progresión con desbloqueo persistente.
- 8 pantallas: landing, menú, niveles, cómo jugar, preparación, juego, victoria, game over.
- Controles desktop (flechas/WASD + arrastre) y móvil (arrastre táctil); UI responsive.
- Audio sintetizado (Web Audio API) silenciable.
- Smoke-test de física en Node (`npm test`).

### Notas
- Sin dependencias externas en runtime (Three.js en `libs/`).
- Pendiente de verificación manual en navegador (visual y sensación de control).
