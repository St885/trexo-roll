# Eventos y retención — TREXoRoll (v0.20)

Resumen de los sistemas de progresión/retención añadidos. Todos respetan el contrato de
seguridad de las capas overlay (`pointer-events:none`, por debajo del HUD/controles) y **no
alteran la geometría ni la solvencia** de los 50 niveles.

## Estrellas de nivel (1/2/3)

Reglas automáticas, justas y **sin objetivos por nivel**:

- **3★** — Excelente: sin perder vidas **y** tiempo ≤ par del nivel.
- **2★** — Buen rendimiento: cumple **al menos una** de
  {sin perder vidas, tiempo ≤ par, monedas ≥ 60% de las disponibles}.
- **1★** — Completar el nivel.

Se guarda el **mejor** resultado por nivel (`stars{}` en localStorage). Se muestra en el
selector de niveles, la pantalla de victoria y el progreso del menú. Repetir un nivel puede
mejorar las estrellas pero nunca empeora el registro.

## Cofre jurásico

- **1 cofre por cada 15 ⭐ de nivel** acumuladas (monótono: `floor(total/15) − abiertos`).
- Recompensas ponderadas (no rompen la economía):
  estrellas de canje (2–4, jackpot 5–7), vida extra, bloqueo de trampa, escudo de caída,
  banco de vidas (3–5) y, a veces, una **skin** bloqueada.
- Acceso: **menú** (con indicador "✨N") y **tienda de canje**. Persistencia: `chestsOpened`.
- Lógica pura y testeable en `systems/chest.js` (`rollChest(rng, lockedSkins)`).

## Jefes (cada 10 niveles)

| Nivel | Jefe | Ambiente |
|-------|------|----------|
| 10 | Cavernícola Jefe | el cavernícola (ya existente) protagoniza |
| 20 | T-Rex Colosal | temblores leves + rugidos + pterodáctilos |
| 30 | Volcán Activo | ceniza + temblores |
| 40 | Tormenta Jurásica | tormenta + viento leve |
| 50 | Gran Final TREXoRoll | tormenta + viento + rugidos |

Banner de intro al empezar. Los temblores y el clima son **ambientales**; el flujo de
victoria/derrota no cambia. Config en `levels/levelEvents.js`.

## Eventos climáticos

Capa `#weather-layer`. Tipos: lluvia, niebla, viento, ceniza, tormenta, calor. Distribución:

- Lluvia: 6, 16, 26, 36, 46 · Niebla: 9, 19, 29, 39, 49 · Viento: 14, 24, 34, 44
- Ceniza/tormenta: las marcan los jefes (30 ceniza; 40/50 tormenta) · Calor: 4, 19, 30

Casi todo es **visual**. El **viento** aplica un empuje lateral **muy leve** (≈0.8 sobre una
gravedad de 23, ~3–4%) y **solo** desde el nivel 14; es fácilmente contrarrestable inclinando
el tablero. Ligero en móvil y respeta `prefers-reduced-motion`.

## Recompensa diaria

- 1 reclamo por día; **racha** consecutiva (se reinicia si faltas un día).
- Tabla de 7 días (se repite): ⭐2 · 🥚1 · ⭐3 · 🪨1 · 🦅1 · ❤️3 · 🌟5.
- Calendario visual + indicador en el menú. Persistencia: `daily{lastClaimDate, streak}`.
- Lógica pura y testeable en `systems/daily.js` (`evaluateDaily(daily, today)`).

## Contrarreloj (cada 11 niveles)

- Niveles 11, 22, 33, 44 con límite de tiempo (22/26/30/34 s; crece con la dificultad).
- Cronómetro destacado en el HUD (parpadea en rojo bajo 5 s).
- Si llega a 0 → pierdes un intento (vida) y **se reinicia** la ventana de tiempo.
- Completar a tiempo → **+2 ⭐ de canje** de bonus (aviso en victoria).
- No es modo principal: solo estos niveles puntuales.

## Economía y balance

El jugador progresa **gratis**. Fuentes de ⭐ de canje: estrella especial cada 2 niveles,
cofres, recompensa diaria y bonus de contrarreloj. Sumideros: tienda de canje (potenciadores)
y compra de skins. Las recompensas son generosas pero acotadas (cantidades pequeñas, sin
otorgar "estrellas de nivel" falsas). **Sin compras reales** (la monetización queda para una
fase futura; los packs de vidas siguen siendo simulación).
