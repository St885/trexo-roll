# Data Safety (Seguridad de los datos) — borrador para Play Console

> Estado a partir de **v0.26.0**: se añade **inicio de sesión real (Firebase Authentication)**
> con **Google** y **correo/contraseña**, más **modo invitado**. **⚠️ La declaración anterior
> «No se recopilan datos» YA NO ES VÁLIDA** en cuanto Firebase Auth esté configurado y activo.
> Verificar todo en Play Console antes de enviar.

## Matiz importante (qué recopila realmente esta build)
- **Modo invitado** (sin iniciar sesión): **no se recopila NADA** — todo es local en el dispositivo.
- **Si el usuario inicia sesión** (Google o correo): se recopilan datos de cuenta (abajo). El
  inicio de sesión es **OPCIONAL** (el juego es 100% jugable como invitado, sin cuenta).
- La **sincronización de progreso en la nube (Firestore)** está **DESACTIVADA** en esta versión
  (`ENABLE_CLOUD_SYNC=false`) → el progreso **no** se sube. **Analytics DESACTIVADO**
  (`ENABLE_ANALYTICS=false`) → **no** se recopila analítica.
- Si la app se publica **aún en modo demo** (Firebase sin configurar), no se recopila nada; pero
  **en cuanto se active Auth**, aplica esta declaración → **déjala ya declarada** para la versión que active login.

## Resumen para Play Console
- **¿La app recopila datos del usuario?** → **Sí** (solo si el usuario inicia sesión).
- **¿La app comparte datos con terceros?** → **Sí**, con **Google/Firebase** como **proveedor de
  autenticación** (procesador). No se venden datos ni se comparten para publicidad.
- **¿Cifrado en tránsito?** → **Sí** (Firebase Auth usa HTTPS/TLS).
- **¿El usuario puede solicitar la eliminación de sus datos?** → **Sí** (ver Política de
  privacidad → «Eliminar cuenta y datos»; correo `stefano.luisf@gmail.com`; y *Ajustes → Solicitar
  eliminación de cuenta*).

## Tipos de datos a DECLARAR (cuando Auth está activo)
| Tipo de dato | ¿Recopilado? | ¿Compartido? | Obligatorio/Opcional | Finalidad |
|---|---|---|---|---|
| **Dirección de correo** | Sí (si login por correo o Google) | Sí (Firebase/Google) | **Opcional** (solo si inicia sesión) | Gestión de cuentas; funcionalidad de la app |
| **Nombre** (displayName) | Sí (si Google lo entrega o el usuario lo pone) | Sí (Firebase/Google) | Opcional | Gestión de cuentas; identificar al jugador |
| **Foto de perfil** (photoURL) | Sí (si Google la entrega) | Sí (Firebase/Google) | Opcional | Mostrar avatar de la cuenta |
| **IDs de usuario** (Firebase UID) | Sí (al iniciar sesión) | Sí (Firebase/Google) | Opcional | Identificar al jugador; mantener sesión; futura sync |
| **Actividad en la app** (progreso/estrellas) | **No** (se guarda **solo en el dispositivo**; sync desactivada) | No | — | — |

### Tipos que siguen siendo **NO recopilados**
- **Ubicación** (aprox./precisa): No · **Contactos / calendario**: No · **Fotos/vídeos/audio/
  archivos del dispositivo**: No · **Mensajes/SMS**: No · **Información financiera/pago**: No
  (sin compras) · **IDs de publicidad / AD_ID**: No (sin ads/analytics) · **Diagnóstico/fallos**:
  No (sin SDK de crash) · **Navegación web**: No.

## Prácticas de seguridad a declarar
- **Cifrado en tránsito**: Sí (TLS, Firebase Auth).
- **El usuario puede solicitar eliminación de datos**: Sí (correo de soporte + sección en la política).
- **Datos gestionados por un procesador** (Google/Firebase Authentication): Sí.

## Qué marcar EXACTO en el asistente de Play Console
1. **Data safety → «¿Recopila o comparte...?»** → **Sí**.
2. **Personal info → Email address**: recopilado + compartido · opcional · finalidad *Account
   management* + *App functionality*.
3. **Personal info → Name**: igual (opcional).
4. **Photos/User IDs → User IDs** (Firebase UID): recopilado + compartido · finalidad *Account
   management* / *App functionality*.
5. (Foto de perfil) si se usa `photoURL`: declarar como *User account info* / imagen de perfil.
6. **Security practices**: cifrado en tránsito = **Sí**; solicitud de borrado = **Sí**.
7. **NO** marcar: ubicación, contactos, financieros, ads/AD_ID, analítica, salud, mensajes.

## Notas
- **Permiso Android**: solo `INTERNET` (necesario para Firebase Auth por HTTPS). Sin `GET_ACCOUNTS`,
  `READ_CONTACTS`, `AD_ID`, ubicación, cámara ni micrófono.
- **Formulario de inicio de sesión (App content → Login credentials)**: si Play pide credenciales
  de prueba para revisar la app con login, aporta una **cuenta de correo de prueba** (o indica
  que se puede revisar como **invitado** sin iniciar sesión).
- Mantener este borrador sincronizado con `privacy.html` / `docs/privacy-policy.md`.

> ⚠️ **Verificar en Play Console antes de enviar.**
