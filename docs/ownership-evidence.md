# Evidencias de autoría — TREXoRoll

> Documento interno de propiedad del proyecto. Fecha: 2026-06-30.
> **No es un registro de marca** ni asesoramiento legal; reúne evidencias de autoría/propiedad.

## 1. Identificación del proyecto
| Campo | Valor |
|---|---|
| **Nombre del proyecto** | TREXoRoll |
| **Publicador** | SLF Games |
| **Autor / desarrollador** | Stefano Frontado / SLF Games |
| **Paquete Android** | `com.st885.trexoroll` |
| **Repositorio** | https://github.com/St885/trexo-roll.git |
| **Producción web** | https://st885.github.io/trexo-roll/ |
| **Contacto** | stefano.luisf@gmail.com |
| **Cuenta Google Play** | SLF Games |

## 2. Línea de tiempo resumida
- **Creación del proyecto** y primeras versiones (juego base, 25→50 niveles, portales, eventos
  jurásicos, responsive, idioma ES/EN). Evidencia: commits `de28eee`, `b9dfb19`.
- **v0.16–0.20** — Acceso/registro local, dinos de victoria, progresión y recompensas
  (estrellas, cofre, skins, jefes, clima, contrarreloj, diario). Commits `64ac5fb`, `ce9f80d`.
- **v0.22–0.23** — Arquitectura Firebase-ready (inerte) + vendorizado y CSP. Commit `fb69863`.
- **v0.24.x** — Android-ready (Capacitor), seguridad reforzada, pulido de pantallas, auditoría
  de políticas de Play. Commits `14b4fa5`, `8bfc40a`, `cbfb7f3`.
- **v0.24.8** — Encuadre móvil **horizontal aprobado** visualmente (commit `8bfc40a`, publicado
  en GitHub Pages).
- **v0.24.9** — Gameplay polish (tutorial, objetivos, misiones, feedback). *(local)*
- **v0.25.0** — **Hoyos rojos dinámicos** (móviles y pulsantes). *(local)*
- **v0.25.1** — **Corrección** de hoyos rojos dinámicos (todos animan, sin solape). *(local)*
- **Actual** — Hardening legal/compliance y preparación para Google Play. *(este trabajo)*

## 3. Evidencias disponibles
- **Commits de Git** con fechas y autoría (historial del repositorio).
- **Historial de cambios**: `docs/changelog.md` (versionado semántico, fechado).
- **Estado del proyecto**: `STATUS.md`.
- **Capturas de QA**: `docs/qa-*.png` (encuadre, pantallas, gameplay).
- **Builds locales**: `www/` (build web) y `android/` (proyecto Capacitor, no versionado).
- **Publicación pública**: GitHub Pages — https://st885.github.io/trexo-roll/.
- **AAB firmado localmente**: se generará desde la versión aprobada; el keystore y el AAB se
  guardan **fuera del repositorio** (ver `.gitignore`).
- **Cuenta de desarrollador Google Play**: SLF Games.

## 4. Nota de protección
- El **copyright** protege el **código y el contenido original** desde su creación, sin
  necesidad de registro. El proyecto se publica como **«todos los derechos reservados»**
  (ver `LICENSE`), **no** como open source.
- La **marca `TREXoRoll`** podría **registrarse en el futuro** para mayor protección comercial
  (no se realiza en este trabajo; el usuario indicó **no registrar marca**).
- La **política de privacidad** protege **datos de usuario**, **no** la propiedad intelectual;
  para esto último sirven `LICENSE`, `terms.html`/`docs/terms.md` y este documento.
- Hay **assets de terceros pendientes de verificar** (música e imagen de fondo): ver
  `docs/assets-license-audit.md`. Resolver **antes** de la publicación comercial.

---

© 2026 SLF Games. Todos los derechos reservados.
