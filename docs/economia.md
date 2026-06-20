# Economía — TREXoRoll

## Recursos

| Recurso | Símbolo | Se gana | Persistente | Uso |
|---|---|---|---|---|
| **Puntos** | — | +1 por moneda + bonus de nivel | No (por partida, sí récord) | Puntuación / récord |
| **Monedas** | 🪙 | recoger en el tablero | No (contador por nivel) | Cada una = **+1 punto** |
| **Estrellas de canje** | ⭐ | recoger la estrella especial (cada 2 niveles) | **Sí** (`starTokens`) | Moneda de la **Tienda de Canje** |
| **Vidas** | ❤️ | 3 por partida; banco (vídeo/packs) | banco **Sí** (`livesBank`) | Continuar partidas |

> **Importante:** las **estrellas de canje** NO son puntos. Son un recurso **acumulable**
> que se gasta en la tienda. Los **puntos** son la puntuación del gameplay.

## Cambios de balance (v0.11.0)
- **Moneda: 100 → 1 punto.** Ya no infla la puntuación; el peso vuelve a los bonus de nivel.
- **Estrella: ya no da puntos.** Solo suma **+1 estrella de canje** (recurso premium blando).

## Tienda de Canje (potenciadores)
| Potenciador | Coste | Efecto |
|---|---|---|
| 🥚 Vida extra | **2 ⭐** | Al llegar a 0 vidas, recuperas 1 automáticamente |
| 🪨 Bloqueo de trampa | **3 ⭐** | Tapa la trampa más peligrosa del nivel |
| 🦅 Escudo de caída | **4 ⭐** | Un pterosaurio te rescata si caes |

**Disponibilidad de ⭐:** 1 por nivel par → ~**12 ⭐** por recorrido completo (25 niveles).
Permite comprar varios potenciadores por partida; balance razonable (revisado, sin cambios
de coste en v0.11.0).

## Banco de vidas (`livesBank`)
Reserva persistente para **continuar** tras quedarse sin vidas. Se llena con:
- **Vídeo recompensado** (+3, simulado) — continúa directamente.
- **Packs de vidas** (5/15/50, compra simulada) — se acumulan en el banco.
Se consume en bloques de hasta `REVIVE_LIVES` (3) al pulsar *Continuar*.

## Dónde se define
- Constantes de recompensa: `src/levels/collectibles.js` (`COIN_POINTS = 1`).
- Bonus de nivel: `src/utils/constants.js` (`SCORE`).
- Inventario/recursos: `src/utils/storage.js`.
- Costes de tienda: `src/core/Game.js` (`SHOP`).
- Packs de vidas: `src/core/Game.js` (`LIFE_PACKS`, `REVIVE_LIVES`).
