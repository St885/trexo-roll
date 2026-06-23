# Skins y habilidades — TREXoRoll (v0.20)

## Concepto

Dos capas **ortogonales** para la bola:

- **Dino (especie)** → define el emblema, la celebración de victoria y la **habilidad**.
  Son las 5 bolas de siempre (Blanca/T-Rex, Verde/Raptor, Rosa/Parasaurio,
  Amarilla/Triceratops, Azul/Braquiosaurio).
- **Skin** → define **solo la apariencia** de la esfera (color del cuerpo + acabado del
  material). No cambia la especie ni la habilidad.

Así puedes combinar cualquier dino con cualquier skin desbloqueada.

## Skins (8)

| Skin | Icono | Desbloqueo | Material |
|------|-------|-----------|----------|
| Clásica TREXo | ⚪ | De serie | color del dino |
| Fósil | 🦴 | 6 ⭐ de nivel | mate |
| Huevo de Dino | 🥚 | 12 ⭐ de nivel | semimate |
| Hielo | 🧊 | 5 ⭐ de canje | brillo frío + leve emisivo |
| Ámbar | 🟧 | 8 ⭐ de canje | brillo cálido + emisivo |
| Volcánica | 🌋 | 24 ⭐ de nivel | emisivo intenso (lava) |
| Meteorito | ☄️ | **solo cofre** | rocoso metalizado |
| Dorada | 🏆 | 45 ⭐ de nivel | metalizado dorado |

- **Desbloqueo por estrellas de nivel**: automático al alcanzar el umbral (aviso en victoria).
- **Compra con estrellas de canje (⭐)**: en la pantalla de Skins.
- **Solo cofre**: la Meteorito (y cualquier skin bloqueada puede salir como premio de cofre).
- Persistencia: `ownedSkins[]` + `activeSkin` en localStorage. Equipar requiere poseerla.

## Habilidades (pasivas, balanceadas)

Diseño conservador: dan matiz y estrategia **sin** romper el balance ni los controles
(no hay botones que tapen el HUD). Se explican en el selector y se ven en el HUD de poderes.

| Bola | Habilidad | Efecto (modificador) |
|------|-----------|----------------------|
| Blanca / T-Rex | 🛡️ Resistencia Rex | Resiste la **1ª pérdida** del nivel (1 vez). No aplica al *timeout* del contrarreloj. |
| Verde / Raptor | 💨 Impulso Raptor | Aceleración ×1.13 (rueda algo más ágil). |
| Rosa / Parasaurio | 🧲 Atracción Alegre | Radio de recogida de **monedas** +0.7 (imán suave). |
| Amarilla / Triceratops | 🧱 Estabilidad Tricera | Rebote ×0.55, fricción ×1.12 (más control). |
| Azul / Braquiosaurio | ⚓ Peso Bronto | Aceleración ×0.88, fricción ×1.16 (lenta y manejable). |

Los modificadores se aplican en `BallPhysics` al iniciar el nivel y vuelven a **neutro**
por defecto, por lo que la física base y la **solvencia de los 50 niveles** no cambian
(verificado por `tools/level-validator.mjs`).

## Dónde se aplica

- Apariencia: bola 3D en gameplay, miniaturas de menú/preparación/HUD y selector.
- Habilidad: física del nivel + HUD de poderes (🛡️ disponible, 🧲 activa).
