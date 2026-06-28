# Data Safety (Seguridad de los datos) — borrador para Play Console

Respuestas **sugeridas** según el estado REAL de TREXoRoll (todo local, sin envío externo,
sin Analytics/ads/compras/login reales). **⚠️ Verificar en Play Console antes de enviar**, y
**actualizar** si en el futuro se activa Firebase/Analytics/anuncios.

## Resumen
- **¿La app recopila o comparte datos del usuario?** → **NO.**
  Nada sale del dispositivo. El progreso y el "perfil local" (nombre visible) se guardan solo
  en el almacenamiento local del dispositivo.

## Cuestionario (respuestas sugeridas)

| Pregunta de Play | Respuesta sugerida |
|---|---|
| ¿Recopila datos del usuario? | **No** |
| ¿Comparte datos con terceros? | **No** |
| ¿Cifrado en tránsito? | **No aplica** (no hay transmisión de datos en esta versión) |
| ¿El usuario puede pedir que se eliminen sus datos? | **Sí** — desde *Ajustes → Reiniciar progreso* o borrando los datos de la app |

### Tipos de datos — todos **NO recopilados / NO compartidos**
- **Ubicación** (aprox./precisa): No
- **Información personal** (nombre real, correo, ID, dirección, teléfono): No
  - *Nota*: el "nombre de jugador" es un alias **local** elegido por el usuario, no se envía.
- **Información financiera / de pago**: No (no hay compras reales)
- **Mensajes / correo / SMS**: No
- **Fotos / vídeos / audio / archivos**: No
- **Contactos / calendario**: No
- **Actividad en la app** (interacciones, búsquedas): No se recopila/transmite
- **Navegación web**: No
- **Identificadores del dispositivo / IDs de publicidad**: No (sin SDK de ads/analytics)
- **Información de diagnóstico / fallos / rendimiento**: No (sin SDK de crash/analytics real)

## Notas / aclaraciones
- **Permiso `INTERNET`**: presente por defecto en Capacitor/WebView. En esta versión **no** se
  usa para enviar datos del usuario (no hay backend ni analítica). Se mantiene para la futura
  sincronización **opcional** (que requerirá actualizar este formulario y la política).
- **Almacenamiento**: `localStorage` del WebView — solo en el dispositivo (progreso, ajustes,
  alias local, idioma). Sin contraseñas (el acceso es un perfil local).
- **Si en el futuro** se activa **Firebase Auth/Firestore** (cuentas/nube), **Analytics (GA4)**
  o **anuncios/compras**: habrá que **rehacer** este formulario declarando los datos
  correspondientes (p. ej. correo para Auth, identificadores para Analytics) **antes** de
  publicar esa versión, y actualizar la política de privacidad.

> ⚠️ **Verificar en Play Console antes de enviar.** Si el asistente pregunta por
> "identificadores" recogidos por Google Play/servicios de la plataforma fuera de tu código,
> respóndelo según la guía de Play (lo que recoja la plataforma no es recopilación por la app).
