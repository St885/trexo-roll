# Ficha de Producto — TREXoRoll

> Artefacto de **agente-product-owner**. Define el "qué" y el "para quién" antes de construir.

---

## Identidad

| Campo | Valor |
|---|---|
| **Nombre visible** | TREXoRoll |
| **Carpeta** | `trexo-roll` |
| **Ruta** | `03_juegos/trexo-roll/` |
| **Subtítulo** | Inclina, rueda y conquista cada tablero. |
| **Género** | Habilidad / puzzle de destreza 3D (tilt-maze tipo *labyrinth marble*) |
| **Plataforma** | Web (desktop + móvil), navegador moderno |
| **Orientación** | Responsive (horizontal y vertical) |

---

## Propuesta de valor

Un juego de destreza **fácil de entender, difícil de dominar**: inclinas un tablero y
ruedas una bola al hoyo. La temática **jurásica** y el **T-Rex de la bola** le dan una
identidad propia, original y libre de copyright.

## Público objetivo

Jugadores **casuales** de todas las edades que buscan partidas cortas en el móvil o en
el navegador, con una curva de aprendizaje suave y satisfacción inmediata.

## Experiencia objetivo (player fantasy)

> "Controlo el mundo inclinándolo. Cada hoyo evitado y cada tablero superado se siente
> como pericia mía."

---

## Métricas de éxito del MVP

- El jugador entiende el control **sin tutorial** en < 15 s (la pista en pantalla basta).
- Completa el Nivel 1 en su primer o segundo intento.
- Llega de forma natural a intentar el Nivel 5.
- Cero errores críticos en consola; carga fluida en móvil de gama media.

## Riesgos de producto

| Riesgo | Mitigación |
|---|---|
| Control de inclinación frustrante | Retorno suave a horizontal, inclinación máxima limitada, fricción ajustable |
| Cámara que no deja ver el tablero en móvil vertical | Encuadre automático según aspecto de pantalla |
| Rendimiento 3D en móvil | Geometría simple, sombras de bajo coste, `pixelRatio` limitado a 2 |
| Copyright (Jurassic Park, etc.) | Nombre, arte y silueta **originales**; cero IP de terceros |

## Decisión de alcance

MVP = **5 niveles, 3 vidas, 8 pantallas, controles desktop+móvil, audio sintetizado**,
sin dependencias externas en runtime (Three.js vendorizado). Ver `mvp.md`.
