# Monetización — TREXoRoll (diseño mobile-first)

> Estado: **MVP conceptual con flujos SIMULADOS** (sin SDK de anuncios ni pago real).
> Objetivo: app móvil (Android / iPhone). Web es el banco de pruebas.

## 1. Economía base (contexto)

| Recurso | Cómo se gana | Para qué sirve |
|---|---|---|
| **Puntos** | +1 por moneda recogida + bonus de nivel (completar/tiempo/vidas) | Puntuación / récord |
| **⭐ Estrellas de canje** | +1 por estrella especial (cada 2 niveles) | Moneda blanda → Tienda de Canje (potenciadores) |
| **❤️ Vidas** | 3 por partida; **banco de vidas** (vídeo/packs) | Continuar tras quedarse sin vidas |

Detalle en [`economia.md`](economia.md).

## 2. Monetización principal: VIDAS

Cuando el jugador se queda **sin vidas** se muestra la pantalla **"¡Sin vidas!"**
(`screen-gameover`) con las opciones de seguir jugando:

```
Sin vidas
 ├─ 📺 Ver vídeo · +3 vidas   → vídeo recompensado (rewarded) [SIMULADO]
 ├─ 🛒 Comprar vidas          → tienda de packs de vidas      [SIMULADO]
 ├─ ⏩ Continuar · banco: N    → consume del "banco de vidas"  (si N>0)
 ├─ ↻ Reintentar (3 vidas)    → reinicia el nivel actual
 └─ 🏠 Menú
```

### 2.1 Vídeo recompensado (placeholder)
`screen-adview` — simulación interna: una pantalla con cuenta atrás (3…2…1) y, al
terminar, concede **+3 vidas** y continúa el nivel. Marcada claramente como
*"Simulación interna · sin anuncios reales"*. Botón **Saltar** disponible.

> **Integración futura (app):** sustituir `Game._watchAd()` por un SDK de rewarded
> ads (p. ej. AdMob/Unity Ads vía wrapper nativo). El callback `onReward` llama a
> `_reviveWith(REVIVE_LIVES)`. La cuenta atrás simulada se reemplaza por el ciclo real
> de carga/visionado del anuncio.

### 2.2 Tienda de packs de vidas
`screen-lifepacks` — packs **5 / 15 / 50** vidas con precios de muestra
(`0,99 € / 1,99 € / 3,99 €`). La compra es **SIMULADA** (`Game._buyLifePack`): añade
las vidas al **banco** (`localStorage.livesBank`). Luego *"Continuar con el banco"*
gasta hasta 3 del banco para retomar la partida.

> **Integración futura (app):** sustituir `_buyLifePack` por IAP (Google Play Billing /
> StoreKit). Tras la confirmación de compra → `addLivesBank(n)`.

### 2.3 Arquitectura (dónde tocar)
- **Estado**: `src/utils/storage.js` → `livesBank` + `getLivesBank/addLivesBank/takeFromLivesBank`.
- **Flujos/UI**: `src/core/Game.js` → `_noLives`, `_watchAd`, `_cancelAd`, `_showLifePacks`,
  `_buyLifePack`, `_continueFromBank`, `_reviveWith`. Constantes `LIFE_PACKS`, `REVIVE_LIVES`.
- **Pantallas**: `screen-gameover` (revive box), `screen-adview`, `screen-lifepacks` en `index.html`.

## 3. Otras vías de monetización propuestas

### A. Anuncios recompensados (rewarded ads) — *recomendado a corto plazo*
- ✅ **+vidas al quedarte sin vidas** (implementado como placeholder).
- **+escudo de caída** antes de un nivel difícil.
- **Reintento instantáneo** sin perder progreso del nivel.
- **Duplicar recompensa** (x2 estrellas/monedas) al terminar un nivel.
- *Anuncios intersticiales* cada N derrotas (con moderación; no romper el flujo).

### B. Compras (IAP)
- **Packs de vidas** (implementado, simulado).
- **Packs de estrellas de canje** (p. ej. 10 / 30 / 80 ⭐).
- **Packs de ayudas** (bundles de vida extra + bloqueo + escudo).
- **Bundle inicial** (oferta única al 2º o 3er día: vidas + estrellas + skin a buen precio).
- **Quitar anuncios** (compra única).

### C. Cosméticos (alto margen, no afectan al balance)
- **Skins de bola** extra (además de las 5 actuales).
- **Skins de dinosaurio** / variantes de celebración.
- **Temas de tablero** (texturas/colores).
- **Mundos visuales** premium (paletas/ambientación).
- **Celebraciones especiales** (confeti/efectos únicos).

### D. Progreso / retención
- **Recompensa diaria** + **racha diaria** (cofre escalado).
- **Cofre diario** gratis (con opción de abrir 2º por vídeo).
- **Pase jurásico** (light battle pass): track gratis + premium por temporada.
- **Eventos temporales** (niveles especiales con recompensas limitadas).

## 4. Prioridad recomendada (mobile-first)
1. **Rewarded ads por vidas** (ya prototipado) + **+escudo/duplicar** por vídeo.
2. **Quitar anuncios** + **packs de vidas/estrellas**.
3. **Recompensa/racha diaria** (retención).
4. **Cosméticos** (skins) cuando haya base de jugadores.
5. **Pase jurásico** / eventos (medio plazo).

## 5. Principios de diseño
- **Mobile-first**: overlays grandes, pocos botones, copy corto, feedback claro.
- **No pay-to-win agresivo**: las vidas/ayudas aceleran, pero el juego es superable sin pagar.
- **Transparencia**: todo flujo simulado está etiquetado como tal hasta integrar el real.
