# trexo-roll — Instrucciones para Claude Code

## Propósito

TREXoRoll es un **juego 3D de habilidad** (inclina un tablero para rodar una bola hasta
el hoyo) con temática **jurásica**, para web y móvil. Vive en `03_juegos/trexo-roll/` y
sigue la convención vanilla del workspace (`index.html` + ES modules + `npx serve`).

> Documentos de diseño en [`docs/`](docs/): `ficha-producto.md`, `mvp.md`, `gdd.md`,
> `technical-design.md`, `backlog.md`, `changelog.md`, `skins.md`, `eventos-y-retencion.md`,
> `economia.md`.

---

## Reglas específicas de este proyecto

- **Aislamiento:** trabajar solo dentro de `03_juegos/trexo-roll/`. No tocar otros juegos.
- **Sin copyright / IP de terceros:** todo el arte es **procedural** (Canvas 2D, geometrías
  de Three.js, Web Audio). Nada de Jurassic Park ni assets de juegos comerciales. El T-Rex
  de la bola es una **silueta original**.
- **Sin dependencias externas en runtime:** Three.js está **vendorizado** en
  `libs/three.module.js` y se carga por `importmap`. No añadir CDNs ni `npm install`
  sin confirmación de Stefano.
- **Gates de confirmación** (heredados del agente-videojuegos): pedir permiso antes de
  `git push`, deploy a GitHub Pages, borrar archivos, instalar dependencias nuevas,
  cambiar la arquitectura de alto impacto o usar APIs externas.
- **Outputs:** no borrar `.mp4/.mp3/.png/.wav` sin permiso (este proyecto no genera ninguno).

---

## Stack

| Capa | Tecnología |
|---|---|
| Render 3D | Three.js r160 (vendorizado en `libs/`) |
| Lenguaje | JavaScript ES6+ (ES Modules, sin build step) |
| Física | Propia (sin librería) |
| UI | DOM + CSS responsive |
| Audio | Web Audio API |
| Persistencia | localStorage (con fallback) |

Mapa de módulos: ver [`docs/technical-design.md`](docs/technical-design.md) §2.

---

## Cómo ejecutar

```bash
npx serve . -p 3000     # o: npm start
# abrir http://localhost:3000
```

No requiere `npm install` (Three.js ya está en `libs/`). `npx serve` es solo un servidor
estático de desarrollo; cualquier servidor estático sirve (los ES modules necesitan
http://, no funcionan con file://).

## Cómo validar

```bash
npm test                # física (direcciones/caída/trampa/meta) + validador de niveles
npm run test:graph      # carga TODO el grafo de módulos (incl. Three.js) en Node
npm run test:visual     # ejerce el dibujo Canvas 2D y la construcción 3D (sin navegador)
```

`npm test` verifica la física y que **los 50 niveles sean superables** (BFS de solvencia,
**portal-aware**), además de la mecánica de **portales** y los **eventos** (events-smoke).
`test:visual` comprueba caras de bola, fondos de bioma y el dino de celebración.
**La capa visual 3D y la sensación de control se validan manualmente en el navegador**
(checklist en `docs/mvp.md`).

---

## Riesgos / cosas a vigilar

- **Sensación de control y tuning de física:** ajustables en `src/utils/constants.js`
  (`PHYS`). Solo verificable en navegador.
- **Móvil:** el encuadre de cámara se recalcula en `resize`; probar en vertical y horizontal.
- **Tableros poligonales:** la transformada render↔física está verificada matemáticamente,
  pero conviene confirmar el Nivel 3 visualmente.

## Próximos pasos sugeridos

1. Prueba manual en navegador (desktop + móvil) y ajuste fino de `PHYS`.
2. Más niveles y/o selector de dificultad (arquitectura ya lista: `src/levels/levels.js`).
3. Control por giroscopio en móvil (opcional).
4. Despliegue en GitHub Pages — **requiere confirmación de Stefano**.
