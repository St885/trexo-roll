# Auditoría de cumplimiento de Google Play — TREXoRoll

- **App / package**: TREXoRoll · `com.st885.trexoroll`
- **Tipo**: juego gratuito, sin monetización real, sin anuncios, sin cuentas en la nube activas.
- **Web / privacidad**: https://st885.github.io/trexo-roll/ · https://st885.github.io/trexo-roll/privacy.html
- **Fecha**: 2026-06-27 · **Versión auditada**: 0.24.5
- **Referencias oficiales** (sin acceso a internet en la auditoría; usar como guía):
  Acuerdo de Distribución para Desarrolladores, Verificación de identidad del desarrollador
  (support.google.com/.../10841920), y Políticas del Programa para Desarrolladores
  (play.google/developer-content-policy).

> **Veredicto: CUMPLE CON PENDIENTES (menores, de cuenta).** No se detectan riesgos
> bloqueantes legales/de política ni de seguridad. Los pendientes son acciones de cuenta en
> Play Console que solo puede hacer el titular (identidad, formularios, subir capturas).

---

## 1. Resumen ejecutivo

- **Sin riesgos bloqueantes** (legales, de política o de seguridad).
- **Riesgos medios → CORREGIDOS** en esta auditoría:
  - Botones de login **Google/Apple/Samsung** no funcionales (placeholder) → **ocultados** en
    la app (evita "Deceptive Behavior" y uso de marcas de terceros en botones inoperativos).
  - **Monetización simulada** con precios en € ("Comprar vidas", "Paquetes de vidas") y
    **anuncio recompensado simulado** ("Ver vídeo") → **ocultados** (evita apariencia de IAP
    fuera de Google Play Billing y de anuncios reales que no existen).
- **Riesgos bajos**: violencia **cartoon** muy leve (cavernícola con lanza, cohete que "derriba"
  un pterodáctilo) — sin sangre/gore; se declara honestamente en la clasificación de contenido.
- **Recomendación**: **Listo para subir a prueba interna** tras completar los pendientes de
  cuenta en Play Console (identidad, Data Safety, clasificación, capturas, política).

---

## 2. Tabla de cumplimiento

| # | Área | Estado | Riesgo | Evidencia | Acción tomada | Pendiente (usuario) |
|---|------|--------|--------|-----------|---------------|---------------------|
| 1 | Acuerdo de Distribución | Cumple | Bajo | App gratuita, sin pagos/ads reales; info veraz | Ficha y textos veraces | Aceptar acuerdos en Console |
| 2 | Identidad del desarrollador | Pendiente | — | N/A en código | — | Verificar identidad + nombre público |
| 3 | Privacidad | Cumple | Bajo | `privacy.html`, `docs/privacy-policy.md` coinciden con la realidad | Política veraz, URL pública | Pegar URL en Console |
| 4 | Data Safety | Pendiente | Bajo | Todo local, sin envío externo | `playstore/data-safety-draft.md` | Rellenar formulario |
| 5 | Permisos Android | Cumple | Bajo | Manifest fusionado: solo `INTERNET` (+ permiso de firma propio AndroidX) | — | — |
| 6 | Contenido | Cumple | Bajo | Sin sexo/odio/drogas/azar/dinero real | — | — |
| 7 | Violencia / cartoon | Cumple | Bajo | Cavernícola/cohete/ptero **cartoon**, sin sangre | Declarar "cartoon leve" | Cuestionario IARC |
| 8 | Propiedad intelectual | Cumple | Bajo | Arte 100% procedural/original; LICENSE MIT (Stefano Luis) | — | — |
| 9 | Música / sonidos | Cumple | Bajo | Web Audio **procedural**, sin samples de terceros | — | — |
| 10 | Imágenes / assets | Cumple | Bajo | Iconos/fondos propios; sin assets con copyright | — | — |
| 11 | Login / cuentas | Cumple | Medio→OK | Login federado placeholder → **oculto**; modo **local/invitado** claro; sin guardar contraseñas | Ocultados Google/Apple/Samsung | — |
| 12 | Monetización | Cumple | Medio→OK | € y "Ver vídeo" simulados → **ocultos**; economía interna = estrellas virtuales (gratis) | Ocultados packs €/vídeo | Declarar "sin compras/ads" |
| 13 | Ficha Play Store | Cumple | Bajo | `playstore/descriptions/*` veraces, sin marcas ajenas | Revisada | Subir textos/imágenes |
| 14 | Clasificación por edad | Pendiente | Bajo | Sin gore/azar/chat | `playstore/content-rating-draft.md` | Cuestionario IARC |
| 15 | Público objetivo | Pendiente | Bajo | Apto para todos; **no dirigido a niños** (recomendado) | Recomendación abajo | Elegir público |
| 16 | Seguridad técnica | Cumple | Bajo | CSP estricta, sin secretos, sin logs sensibles | — | — |
| 17 | Keystore / secrets | Cumple | Bajo | Sin keystore/`.env`/claves en el repo; `android/` ignorado | `.gitignore` reforzado | Custodiar keystore fuera del repo |
| 18 | Firebase-ready | Cumple | Bajo | Solo placeholders (`REEMPLAZAR`/`__PLACEHOLDER__`), inerte | — | — |
| 19 | GitHub Pages / privacy URL | Cumple | Bajo | `privacy.html` sirve 200; rutas relativas | — | Confirmar deploy |
| 20 | AAB / release | Cumple | Bajo | `app-release.aab` existe, ignorado por git | — | Firmar con keystore propia / Play App Signing |

---

## 3. Resultado de búsquedas

| Búsqueda | Resultado |
|---|---|
| Claves Google `AIza…` | **Ninguna** |
| `apiKey` con valor | Solo `REEMPLAZAR` (placeholder) |
| `PRIVATE KEY` / JWT `eyJ…` | **Ninguno** |
| `client_secret` / `serviceAccount` (con valor) | **Ninguno** (solo en `.gitignore`/docs como aviso) |
| Archivos `.jks/.keystore/.p12/.pem/.env/google-services.json/key.properties` | **Ninguno** en el árbol |
| Keystore en repo | **No** (ningún `.keystore/.jks`); `android/` y AAB **ignorados** |
| Permisos Android (manifest fusionado release) | `INTERNET` + `…DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` (firma propia, AndroidX) |
| Permisos peligrosos (ubicación/cámara/micro/contactos/almacenamiento/SMS/teléfono/calendario) | **Ninguno** |
| Marcas de juegos de terceros (Mario/Pokémon/…) | **Ninguna** en el build; una nota **interna** en `docs/` afirma "cero IP de terceros" (docs no se incluye en `www/`/AAB) |
| Google/Apple/Samsung | Botones **placeholder** (ahora **ocultos**) + metas estándar de PWA (`apple-mobile-web-app-*`) + config técnica (Firebase/Capacitor) |
| Contraseñas en `localStorage` (`setItem`) | **Ninguna** |
| `console.*` con credenciales | **Ninguno** |

---

## 4. Correcciones aplicadas (esta auditoría)

1. **Login federado oculto** (`#auth-home .btn.provider` + `.auth-divider`): Google/Apple/Samsung
   no se muestran (eran placeholders no funcionales). Queda **«Continuar como invitado»** y el
   **perfil local** (Ingresar / Crear perfil local).
2. **Monetización simulada oculta**: `#btn-over-video` («Ver vídeo», anuncio simulado) y
   `#btn-over-buylives` («Comprar vidas», precios € sin pago real). La pantalla de
   «Paquetes de vidas» queda inaccesible. El cuadro «¿Seguir jugando?» solo aparece si hay
   vidas en el **banco** (recurso interno, sin dinero).
3. Documentación: este informe + `playstore/data-safety-draft.md` + `playstore/content-rating-draft.md`.

> Reversible: para reactivar OAuth/IAP/anuncios **reales** en el futuro, quitar las reglas del
> bloque "Cumplimiento Play Store v1" en `styles/main.css` e integrar Google Play Billing /
> AdMob / OAuth reales, y **actualizar antes** la política de privacidad y Data Safety.

---

## 5. Notas por política

- **Economía interna (estrellas ⭐, monedas, cofre, skins)**: moneda **virtual ganada jugando**,
  **sin dinero real** → no requiere Google Play Billing. El **cofre jurásico** es un "loot box"
  **gratuito** (se gana con estrellas, no se compra con dinero) → **no** aplica la divulgación
  de probabilidades exigida solo a cajas de pago.
- **Violencia**: cartoon, sin sangre ni daño realista (cavernícola con lanza = pierdes un
  intento; el cohete "derriba" un pterodáctilo estilo dibujo animado). Declarar en IARC como
  **violencia de fantasía/cartoon leve** → esperado **Apto para todos / PEGI 3** (confirmar en
  el cuestionario).
- **Sin chat, sin contenido generado por usuarios, sin interacción entre usuarios, sin
  ubicación** → no aplican obligaciones de seguridad social/menores adicionales.
- **Firebase/Analytics/anuncios/compras**: preparados en código pero **inactivos**; la política
  ya advierte que, si se activan, se actualizará **antes** de publicar esa versión.

---

## 6. Pendientes del usuario (Play Console — fuera del código)

- [ ] **Verificar identidad de desarrollador** (Google lo exige): tipo de cuenta
      (individual/organización), nombre legal, país/dirección, teléfono y correo. *No los
      inventamos aquí.*
- [ ] Elegir **nombre público** de desarrollador (distinto del nombre legal privado).
- [ ] **Aceptar** el Acuerdo de Distribución y políticas en Console.
- [ ] **Política de privacidad**: pegar la URL pública (`/privacy.html`).
- [ ] **Data Safety**: rellenar según `playstore/data-safety-draft.md` (todo "No recopila").
- [ ] **Clasificación de contenido** (IARC): rellenar según `playstore/content-rating-draft.md`.
- [ ] **Público objetivo**: recomendado **«13+» o «todas las edades NO dirigido a niños»**
      (ver §7). Si marcas "dirigido a niños", asumes obligaciones de **Familias** (revisión más
      estricta; sin ads/datos lo facilita, pero implica el programa "Diseñado para familias").
- [ ] **Ficha**: subir icono 512, gráfico destacado 1024×500 y **capturas** (mín. 2).
- [ ] **AAB**: subir `app-release.aab` firmado; activar **Play App Signing**; custodiar la
      **upload key/keystore** fuera del repo (ya ignorado).
- [ ] Crear **prueba interna** (y **prueba cerrada** si Play lo exige para cuentas nuevas).

---

## 7. Público objetivo recomendado

| Opción | Pros | Contras |
|---|---|---|
| **Público general, apto para todos, NO "dirigido a niños"** (recomendado) | Sin obligaciones extra del programa Familias; flexibilidad futura para añadir cuentas/anuncios | Se etiqueta como apto, no aparece en secciones específicas de niños |
| Dirigido a niños (Familias) | Visibilidad en secciones infantiles | Revisión más estricta; cualquier futuro anuncio/dato debe cumplir reglas de menores; limita monetización futura |

> Recomendación: **apto para todos, sin declararlo "dirigido a niños"**. El contenido es apto,
> pero declararlo "para niños" añade obligaciones que conviene evitar mientras se planea
> monetización/cuentas futuras. (Decisión final del titular.)

---

## 8. Estado final

**Listo para subir a prueba interna** una vez completados los pendientes de cuenta de §6.
Sin bloqueos legales/de política ni de seguridad detectados en el proyecto.
