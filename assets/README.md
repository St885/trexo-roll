# assets/ — TREXoRoll

TREXoRoll **no depende de imágenes, audio ni modelos externos**: todo el arte se
genera de forma procedural en runtime para evitar problemas de copyright.

- **Texturas** (emblema de T-Rex de la bola, superficie del tablero, cielo, huellas):
  dibujadas con Canvas 2D en [`src/scene/textures.js`](../src/scene/textures.js) y
  [`src/scene/decor.js`](../src/scene/decor.js).
- **Geometría** (rocas, huevos, helechos, fósiles, bola, tablero): primitivas de
  Three.js.
- **Sonido**: tonos sintetizados con Web Audio API en [`src/effects/sfx.js`](../src/effects/sfx.js).

Estas carpetas existen como convención y para futuros assets propios (modelos `.glb`,
sprites, música CC0). **No colocar aquí material con copyright.**

```
assets/
├── images/   # futuros sprites / fondos propios o CC0
├── audio/    # futura música / sfx propios o CC0
└── models/   # futuros modelos 3D propios (.glb/.gltf)
```
