# Reglas de seguridad de Firestore — TREXoRoll (BORRADOR)

> ⚠️ **BORRADOR. No se activan automáticamente.** La sincronización en la nube está
> **DESACTIVADA** en esta versión (`ENABLE_CLOUD_SYNC = false`) y **Firestore no se usa en
> runtime**. Publica estas reglas **solo** cuando decidas activar la sincronización de progreso
> (ver `docs/firebase-setup.md` §9). Hasta entonces, el progreso vive **solo en el dispositivo**.

Colección: **`players/{uid}`** — un documento por jugador. Regla de oro: **cada usuario solo puede
leer/escribir SU propio documento**; nadie puede acceder al de otro.

---

## Opción A — Reglas MÍNIMAS (recomendadas para empezar)
Seguras y simples. Es lo que debes publicar primero.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Cada jugador: acceso SOLO a su propio documento players/{uid}.
    match /players/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Todo lo demás: denegado por defecto.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
- `request.auth != null` → solo usuarios autenticados (invitado NO accede a la nube).
- `request.auth.uid == userId` → el `uid` del token debe coincidir con el id del documento.
- El `match /{document=**} { allow ... if false; }` cierra el resto explícitamente.

---

## Opción B — Reglas con VALIDACIÓN BÁSICA (opcional, más estrictas)
Añade comprobaciones de forma/tipo sobre el documento **real** que escribe el juego
(`playerProfileService.localToProfile`, estructura **anidada**). Úsala si quieres endurecer.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /players/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;

      allow write: if request.auth != null
        && request.auth.uid == userId
        && validPlayer(request.resource.data);
    }

    match /{document=**} { allow read, write: if false; }
  }

  // El documento escrito por el juego (campos opcionales: se validan SOLO si están presentes).
  function validPlayer(d) {
    return (!('playerName' in d)     || (d.playerName is string     && d.playerName.size() <= 24))
        && (!('emailPublicSafe' in d)|| d.emailPublicSafe is string)
        && (!('authProvider' in d)   || d.authProvider is string)
        && (!('progress' in d)       || validProgress(d.progress))
        && (!('inventory' in d)      || validInventory(d.inventory));
  }
  function validProgress(p) {
    return p is map
        && (!('unlockedLevel' in p) || (p.unlockedLevel is int && p.unlockedLevel >= 1 && p.unlockedLevel <= 50))  // level
        && (!('totalStars' in p)    || (p.totalStars is int && p.totalStars >= 0 && p.totalStars <= 150))          // stars
        && (!('bestScore' in p)     || (p.bestScore is int && p.bestScore >= 0));
  }
  function validInventory(inv) {
    return inv is map
        && (!('starTokens' in inv) || (inv.starTokens is int && inv.starTokens >= 0))   // "coins" (moneda del juego)
        && (!('activeSkin' in inv) || inv.activeSkin is string)                          // selectedSkin
        && (!('ownedSkins' in inv) || inv.ownedSkins is list);                           // unlockedSkins
  }
}
```

> Notas: los campos son **opcionales** en la validación (el `merge:true` del juego puede escribir
> subconjuntos). `updatedAt` lo pone el **servidor** (`serverTimestamp()` → `lastLoginAt`/`createdAt`),
> así que **no** se valida contra el cliente. Ajusta los rangos (50 niveles, 150 estrellas máx.) si
> cambia el contenido del juego. Prueba las reglas en el **simulador de Firestore** antes de publicar.

---

## Estructura del documento `players/{uid}` (real, la que escribe el código)
La escribe `src/services/playerProfileService.js` (`localToProfile`). **Anidada**:

```jsonc
players/{uid} = {
  "playerName": "Stefano",            // nombre visible (displayName)
  "emailPublicSafe": "st***@gmail.com", // correo ENMASCARADO (el real lo guarda Firebase Auth, no Firestore)
  "preferredLanguage": "es",
  "authProvider": "google.com",       // o "password"
  "progress": {
    "unlockedLevel": 12,              // nivel máximo desbloqueado
    "bestScore": 4200,
    "totalStars": 27,
    "levelStars": { "1": 3, "2": 2 }, // estrellas por nivel
    "completedLevels": 9
  },
  "inventory": {
    "coins": 0,                       // (no usado como moneda; ver starTokens)
    "starTokens": 7,                  // moneda de canje del juego
    "livesBank": 2, "extraLives": 1, "trapBlocks": 0, "fallShields": 1,
    "ownedSkins": ["classic", "ambar"], // skins desbloqueadas
    "activeSkin": "ambar"             // skin equipada
  },
  "rewards": { "dailyReward": { "lastClaimDate": "2026-07-01", "streak": 4 }, "jurassicChest": null, "openedChests": 2 },
  "settings": { "soundEnabled": true, "musicEnabled": false, "language": "es" },
  "createdAt": <serverTimestamp>,     // al crear
  "lastLoginAt": <serverTimestamp>    // en cada guardado (updatedAt)
}
```

### Mapeo con los campos "conceptuales" pedidos
| Campo conceptual | Dónde vive en el documento real |
|---|---|
| `displayName` | `playerName` |
| `email` | `emailPublicSafe` (enmascarado; el real está en Firebase Auth, no en Firestore) |
| `provider` | `authProvider` |
| `level` | `progress.unlockedLevel` |
| `stars` | `progress.totalStars` (detalle en `progress.levelStars`) |
| `coins` | `inventory.starTokens` (moneda real del juego; `inventory.coins` no se usa) |
| `selectedSkin` | `inventory.activeSkin` |
| `unlockedSkins` | `inventory.ownedSkins` |
| `updatedAt` | `lastLoginAt` (y `createdAt`), puestos por el **servidor** |

> **Privacidad**: el documento **NO** contiene contraseña ni tokens; el correo va **enmascarado**.
> El correo/uid reales los gestiona **Firebase Authentication**, no Firestore.

---

## Cómo activarlas (cuando toque)
1. `docs/firebase-setup.md` §9 (crear Firestore).
2. Firestore → **Reglas** → pega la **Opción A** (o B) → **Publica**.
3. En `src/config/firebaseConfig.js`: `ENABLE_CLOUD_SYNC = true`.
4. Prueba en dos dispositivos (el progreso más avanzado gana; ver `docs/auth-architecture.md`).

**Mientras tanto**: reglas = borrador, `ENABLE_CLOUD_SYNC = false`, Firestore sin uso en runtime.
