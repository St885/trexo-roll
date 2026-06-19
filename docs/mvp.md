# MVP — TREXoRoll

> Artefacto de **agente-product-owner** + **agente-videojuegos**.
> Define el alcance mínimo jugable y sus criterios de aceptación.

---

## Objetivo del MVP

Entregar una **versión jugable de principio a fin**: el jugador entra, juega un nivel
3D inclinando el tablero, gana o pierde vidas, avanza de nivel y llega a victoria o
Game Over — todo en el navegador, en desktop y móvil.

---

## Dentro del alcance ✅

- Landing + menú principal + cómo jugar + selección de niveles.
- Pantalla de preparación por nivel.
- **Escena 3D** (Three.js) con tablero inclinable, bola con emblema de T-Rex,
  hoyo objetivo, hoyos trampa, obstáculos/paredes, cámara, iluminación.
- **Física propia** de rodadura por inclinación (sin librería externa).
- **5 niveles** con formas y dificultad distintas.
- **3 vidas**, reinicio de bola, puntuación con bonus.
- Pantallas de **victoria** y **Game Over**.
- Controles **desktop** (teclado + arrastre) y **móvil** (arrastre táctil).
- HUD responsive; persistencia local de mejor puntuación y niveles desbloqueados.
- Audio sintetizado silenciable.

## Fuera del alcance ❌ (post-MVP)

- Modelos 3D detallados (.glb), animaciones de personaje, música de fondo.
- Editor de niveles, más de 5 niveles, dificultades múltiples.
- Multijugador, ranking online, logros, monetización.
- Giroscopio del móvil (se evaluó; el arrastre es más universal para el MVP).

---

## Criterios de aceptación

Un criterio se considera cumplido solo si es verificable en el navegador.

- [ ] El proyecto carga **sin pantalla negra**.
- [ ] **Sin errores críticos** en consola.
- [ ] El jugador puede **iniciar una partida** (Entrar → Jugar → Iniciar nivel).
- [ ] La **bola aparece** y **rueda** según la inclinación.
- [ ] El **tablero se inclina** con teclado y con arrastre.
- [ ] El **hoyo objetivo** detecta la victoria.
- [ ] Los **hoyos trampa** y la **caída** detectan fallo y restan vida.
- [ ] Sistema de **3 vidas** y **puntuación** funcionando.
- [ ] Se puede **avanzar de nivel**; existen **≥ 3 niveles** (objetivo: 5 → entregados 5).
- [ ] Pantallas de **victoria** y **Game Over** operativas.
- [ ] Controles **desktop** y **móvil** usables; UI **responsive**.
- [ ] Rendimiento aceptable para una prueba inicial.

> **Validación automatizada disponible:** `npm test` ejecuta un smoke-test de la física
> (dirección de la gravedad, detección de caída/trampa/meta y jugabilidad por nivel)
> sin necesidad de navegador. La capa visual 3D requiere verificación manual en el navegador.
