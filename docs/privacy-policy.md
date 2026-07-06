# Política de privacidad — TREXoRoll

> Versión pública hospedada (URL para Google Play Console):
> **https://st885.github.io/trexo-roll/privacy.html**
> (se sirve automáticamente desde GitHub Pages; ver `privacy.html` en la raíz del repo.)

Última actualización: 2026-06-30 · Juego: **TREXoRoll** · Responsable/publicador: **SLF Games** ·
Contacto: stefano.luisf@gmail.com · Web: https://st885.github.io/trexo-roll/

**TREXoRoll** (publicado por **SLF Games**) funciona **100% en tu dispositivo**. Esta política
refleja **exactamente** lo que hace la app en su versión actual de Play Store y **no recopila
datos personales**.

## Qué guardamos
- **Progreso local** (niveles, estrellas, monedas, skins, cofres, ajustes y un perfil local
  con tu nombre visible) en el **almacenamiento local** del dispositivo.
- Idioma elegido y aceptación de términos.

## Inicio de sesión y cuenta (opcional, desde v0.26.0)
Se puede **jugar como invitado** sin cuenta → **no se recopila ningún dato** (todo local). Si el
usuario **inicia sesión** con **Google** o **correo/contraseña**, se usa **Firebase
Authentication** y se pueden tratar, según el método: **correo**, **nombre de perfil**, **foto de
perfil** (si Google la entrega) e **identificador de usuario** (Firebase UID). **Finalidad**:
crear la cuenta, identificar al jugador, mantener la sesión y permitir futura sincronización.
Procesado por **Google/Firebase** (proveedor de autenticación), cifrado (HTTPS).

## Qué NO hacemos
- **No** guardamos la contraseña (viaja cifrada a Firebase; no se almacena local ni en registros).
- **No** vendemos datos ni los usamos para publicidad.
- **No** hay analítica activa (Analytics desactivado en esta versión).
- **No** hay anuncios ni compras reales.
- **No** pedimos ubicación/GPS, cámara, micrófono ni contactos.
- El **progreso** se guarda **solo en el dispositivo** (sincronización en la nube desactivada).

## Permisos
Sin permisos sensibles. El único técnico es `INTERNET` (necesario para el login con Firebase por
HTTPS). Sin `GET_ACCOUNTS`, `READ_CONTACTS`, `AD_ID`, ubicación, cámara ni micrófono.

## Eliminar cuenta y datos
Desde **Ajustes → Solicitar eliminación de cuenta** (abre el correo), o escribiendo a
**stefano.luisf@gmail.com** con el correo de acceso. También se puede borrar el **progreso local**
desde **Ajustes → Reiniciar progreso** o borrando los datos de la app en Android.

## Coincidencia con Data Safety (Play Console)
- **Invitado**: no se recopila nada. **Con login**: se recopilan correo, nombre, foto (opcional) e
  ID de usuario, **compartidos con Google/Firebase** (autenticación), para **gestión de cuentas /
  funcionalidad**. Recopilación **opcional** (solo si el usuario inicia sesión).
- Cifrado en tránsito: **sí**. Solicitud de eliminación: **sí**. Sin publicidad · sin analítica ·
  sin ubicación. Ver `playstore/data-safety-draft.md`.

## Funciones futuras (no activas todavía)
**Sincronización de progreso en la nube (Firestore)** y **analítica (GA4)** están **preparadas
pero DESACTIVADAS** (`ENABLE_CLOUD_SYNC` / `ENABLE_ANALYTICS` = false). Si se activan, se
actualizará esta política y el **Data Safety** **antes** de publicar esa versión.

---

© 2026 SLF Games. Todos los derechos reservados.
