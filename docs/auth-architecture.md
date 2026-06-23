# Arquitectura de cuenta y nube — TREXoRoll (v0.22)

Capa **Firebase-ready** (Authentication + Firestore + GA4) que prepara el juego para
producción **sin romper** el modo invitado, la web ni GitHub Pages. Está **inerte** hasta
que se configure Firebase (ver `docs/firebase-setup.md`).

## Auditoría del registro anterior (estado de partida)

| Qué | Dónde | ¿Sensible? |
|---|---|---|
| Sesión (modo de acceso, nombre visible, idioma, términos) | `localStorage["trexoroll.session.v1"]` (`utils/session.js`) | No |
| Progreso/inventario (estrellas, skins, cofres, tokens, vidas, niveles…) | `localStorage["trexoroll.save.v1"]` (`utils/storage.js`) | No |
| Idioma | `localStorage["trexoroll.lang.v1"]` (`utils/i18n.js`) | No |
| **Contraseña** | **NINGÚN sitio** | — |

- El "login/registro" anterior era **demo local**: validaba la contraseña en memoria y la
  **descartaba** (no se guardaba ni se transmitía). `session.js` solo persiste campos no
  sensibles. **Conclusión: no había contraseñas almacenadas → nada que borrar.**
- **Riesgos** del estado anterior: progreso solo local (se pierde con el dispositivo/
  navegador), sin multi-dispositivo, "cuentas" no verificadas, sin recuperación real.

## Capas (módulos nuevos)

```
src/config/firebaseConfig.js          # config ACTIVA (placeholders → modo demo)
src/config/firebaseConfig.example.js  # plantilla de referencia
src/services/firebaseClient.js        # carga PEREZOSA del SDK (sin import estático)
src/services/authService.js           # registro/login/logout/reset/observer/invitado
src/services/playerProfileService.js  # perfil Firestore + mapeo PURO local↔nube
src/services/progressSyncService.js   # migración + resolución de conflictos
src/services/analyticsService.js      # eventos GA4 (filtra datos sensibles)
```

Clave de diseño: **ningún módulo importa Firebase de forma estática**. El SDK se carga con
`import()` dinámico **solo si hay config real** y hay `window` (navegador). Así el grafo de
módulos carga en Node y la web sin Firebase, y los tests siguen verdes.

## Cómo se guarda el usuario real (Firebase Auth)

- Registro: `createUserWithEmailAndPassword` + `updateProfile(displayName)`.
- Login: `signInWithEmailAndPassword`. Logout: `signOut`. Reset: `sendPasswordResetEmail`.
- La **contraseña** solo viaja a Firebase Auth por HTTPS y se descarta; **nunca** se guarda
  en localStorage ni en Firestore, ni se imprime en consola, ni se loguea en analítica.
- Proveedores externos (Google/Apple/Samsung): placeholder seguro
  (`signInWithProvider` → `auth/provider-not-enabled`) hasta habilitarlos.

## Cómo se guarda el progreso (Firestore)

Documento privado por usuario: `players/{uid}`.

```js
players/{uid} = {
  playerName, emailPublicSafe /* enmascarado: "jo***@dominio" */, createdAt, lastLoginAt,
  preferredLanguage, authProvider,
  progress:   { unlockedLevel, bestScore, totalStars, levelStars, completedLevels },
  inventory:  { coins, starTokens, livesBank, extraLives, trapBlocks, fallShields, ownedSkins, activeSkin },
  rewards:    { dailyReward, jurassicChest, openedChests },
  settings:   { soundEnabled, musicEnabled, language }
}
```

- **No** se guarda contraseña ni datos sensibles innecesarios. El correo se guarda solo
  **enmascarado** (`emailPublicSafe`); el correo real lo gestiona Firebase Auth.
- `coins` se incluye por completitud del modelo, pero en este juego las monedas son
  puntuación por nivel (no moneda persistente) → siempre 0.
- Mapeo en `playerProfileService`: `localToProfile()` / `profileToLocalSave()` (puros).

## Modo invitado

- Sin Firebase configurado, o eligiendo "Continuar como invitado": el progreso vive en
  `localStorage` exactamente como hasta ahora. La UI muestra
  *"Modo demo: tu progreso se guarda en este dispositivo."*

## Migración local → nube

- Al **crear cuenta**: se crea el usuario (Auth) y el documento (`players/{uid}`), y se
  **sube el progreso local existente** (`migrateLocalToCloud`). Nada de contraseña.
- Se conserva una **copia local** del progreso (modo offline): la nube y el local se
  mantienen sincronizados; la fuente de verdad en partida sigue siendo `storage.js`.

## Sincronización e inicio en otro dispositivo (`syncOnLogin`)

1. Se lee el progreso **local** y el de la **nube**.
2. Si no hay nube → se sube el local (primera vez).
3. Si hay ambos → se elige el **más avanzado** y se aplica a los dos lados.

### Resolución de conflictos (decisión documentada)

`chooseMoreAdvanced(local, cloud)` compara, en orden:
1. **mayor nivel desbloqueado** → 2. **mayor total de estrellas** → 3. **mayor bestScore**.

Para el MVP gana automáticamente el más avanzado (sin molestar al usuario). La UI podría
ofrecer elegir manualmente (local vs nube) en el futuro; el servicio ya devuelve `choice`.

### Estados de sincronización (UI en Ajustes → Cuenta)
`Guardado local` · `Sincronizado en la nube` · `Sin conexión` · `Pendiente de sincronizar`.

## Seguridad / privacidad

- ❌ Contraseña en localStorage · ❌ contraseña en Firestore · ❌ contraseña/token en consola
  o analítica · ✅ errores **genéricos** al usuario (mapa de códigos → mensajes) · ✅ inputs
  validados (correo y contraseña ≥6) · ✅ logout y recuperación preparados.
- `analyticsService` descarta parámetros sensibles (`password`, `token`, `idToken`,
  `accessToken`, `email`, `apiKey`, `secret`…) antes de enviar.
- **País**: solo reportes **agregados** de GA4 (deriva de IP). **No** se pide GPS ni permiso
  de ubicación, ni se guarda el país manualmente.

### Reglas de Firestore recomendadas

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

> Solo documentadas; no se aplican desde el código. Se publican en la consola de Firebase.

## Eventos de analítica definidos

`login` · `sign_up` · `guest_start` · `level_start` · `level_complete` · `level_fail` ·
`skin_selected` · `chest_opened` · `daily_reward_claimed` · `rocket_activated` ·
`caveman_hit` · `boss_level_started`. Atajos en `analyticsService.track.*`. Ya se emiten
desde el juego (no-op si Analytics no está disponible).

## Fallback seguro (sin Firebase)

- El juego **funciona como invitado**, la pantalla de login **no se rompe**, no lanza
  errores críticos y muestra que el acceso en la nube **aún no está disponible**.
- Validado por `tools/auth-smoke.mjs` (degradación segura, privacidad, mapeo y conflictos).

## SDK vendorizado + CSP / GitHub Pages

El SDK de Firebase se carga **vendorizado** desde `libs/firebase/` (mismo origen) → la CSP
mantiene `script-src 'self'` y solo abre `connect-src` a dominios concretos de Google para
Auth + Firestore (ya aplicado, inofensivo en modo demo). Analytics es opt-in (una directiva
extra). Detalle: `docs/firebase-sdk-vendor.md` y `docs/csp-firebase.md`. Para poblar el SDK
real: `npm run fetch:firebase`.
