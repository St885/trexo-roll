# Play Store readiness — TREXoRoll

> Publicador: **SLF Games** · Fecha: 2026-06-30 · Estado: **preparación (sin publicar)**.
> Complementa `docs/play-store-policy-audit.md` y `docs/play-store-checklist.md`.

## Identidad de la app
| Campo | Valor |
|---|---|
| **Nombre app** | TREXoRoll |
| **Package** | `com.st885.trexoroll` |
| **Publisher** | SLF Games |
| **Precio** | Gratis |

## Checklist de estado
| Punto | Estado |
|---|---|
| **Compras dentro de la app** | ❌ No activas todavía |
| **Anuncios** | ❌ No activos todavía |
| **Login real** | ❌ No requerido (perfil local; OAuth «Próximamente» oculto) |
| **Datos personales** | ✅ No recopila |
| **Progreso** | ✅ Local (localStorage del dispositivo) |
| **Permisos** | ✅ Mínimos (solo `INTERNET`) |
| **Política de privacidad** | ✅ `privacy.html` (también `docs/privacy-policy.md`) |
| **Términos** | ✅ `terms.html` (también `docs/terms.md`) |
| **Legal / créditos** | ✅ `legal.html` + créditos in-app + copyright en Ajustes |
| **Copyright** | ✅ `© 2026 SLF Games. Todos los derechos reservados.` (LICENSE, docs, web, juego) |
| **Data Safety (borrador)** | ✅ `playstore/data-safety-draft.md` ("no recopila datos") |
| **Clasificación de contenido (IARC)** | ✅ `playstore/content-rating-draft.md` (violencia cartoon leve) |
| **Auditoría de assets/licencias** | ⚠️ `docs/assets-license-audit.md` — **pendientes**: música e imagen de fondo |
| **AAB** | ⏳ Pendiente de generar **desde la versión aprobada**, firmado con keystore local |
| **Play Console** | ✅ App creada (cuenta SLF Games) |
| **Verificación de identidad del desarrollador** | ⏳ Pendiente (requisito de Google) |
| **Prueba interna** | ⏳ Pendiente |
| **Prueba cerrada** | ⏳ Pendiente (si Google lo exige) |
| **Producción** | ⏳ Pendiente |

## URLs públicas (GitHub Pages)
- Web demo: https://st885.github.io/trexo-roll/
- Privacidad: https://st885.github.io/trexo-roll/privacy.html
- Términos: https://st885.github.io/trexo-roll/terms.html
- Legal: https://st885.github.io/trexo-roll/legal.html

## Bloqueantes a resolver ANTES de producción
1. **Licencias de assets**: la **imagen de fondo** ✅ **resuelta (2026-07-02)** — reemplazada por
   un **fondo procedural propio** (Canvas 2D), PNG eliminado, sin marcas. Pendiente aún la
   **música de fondo `.mp3`** (verificar licencia o reemplazar por CC0/propia). ⚠️ **Regenerar las
   capturas de Play Store** con el nuevo fondo. Ver `docs/assets-license-audit.md`.
2. **Verificación de identidad** del desarrollador en Play Console.
3. Rellenar en Play Console: **Data Safety**, **clasificación IARC**, ficha y **URL de
   privacidad pública**.

## Nota importante
> Cuando se activen **compras dentro de la app**, **anuncios**, **Firebase**, **Analytics** o
> **login real**, será **obligatorio** actualizar la **política de privacidad**, la **seguridad
> de datos (Data Safety)**, la **ficha de Play Store** y la **documentación legal** **antes** de
> publicar esa versión.

---

© 2026 SLF Games. Todos los derechos reservados.
