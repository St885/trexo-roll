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

---

## AISLAMIENTO OBLIGATORIO DEL PROYECTO

### Identidad del proyecto

- **Nombre:** `TREXoRoll`
- **Ruta absoluta:** `/Users/stefanofrontado/Desktop/Programacion IA/03_juegos/trexo-roll`
- **Carpeta Git esperada (repositorio propio):** `/Users/stefanofrontado/Desktop/Programacion IA/03_juegos/trexo-roll`

`git rev-parse --show-toplevel` **debe** devolver exactamente `/Users/stefanofrontado/Desktop/Programacion IA/03_juegos/trexo-roll`. Si devuelve otra ruta,
un ancestro, o `fatal: not a git repository`, **detente**: el proyecto se abrió desde el sitio
equivocado. No ejecutes ningún comando Git fuera de esta carpeta.

Esta sesión debe trabajar **exclusivamente** dentro de este proyecto.

### Validación obligatoria antes de actuar

Antes de inspeccionar, editar, ejecutar pruebas o usar Git, comprueba SIEMPRE que estás en el
sitio correcto:

```bash
pwd                        # debe estar dentro de /Users/stefanofrontado/Desktop/Programacion IA/03_juegos/trexo-roll
git rev-parse --show-toplevel   # ver la regla de Git de arriba
```

Si `pwd` no está dentro de la ruta de este proyecto, **detente**: el juego no se abrió desde su
propia carpeta raíz. No adivines la ruta ni «te muevas» a ella con `cd` para forzar el arranque;
avisa de que el proyecto se abrió mal.

### Aislamiento y concurrencia (proyectos hermanos)

- `03_juegos/` contiene **varios juegos independientes**. Los cambios en CUALQUIER otro juego
  (por ejemplo en `survivors-sf`, `troll-castle-wars`, `dinocolor`…) **no son concurrencia de
  este proyecto** y **no deben interpretarse como tal**: ignóralos por completo. Solo cuentan los
  ficheros DENTRO de `/Users/stefanofrontado/Desktop/Programacion IA/03_juegos/trexo-roll`.
- **No mezcles contextos** entre juegos: documentación, decisiones, convenciones de código,
  paletas ni dependencias de un juego no aplican a otro.
- **No modifiques, leas para editar, ni ejecutes** nada en otro proyecto de `03_juegos/`, aunque
  parezca relacionado. Si un cambio necesitara tocar dos juegos, **detente y repórtalo** antes de
  actuar.
- Si detectas ediciones concurrentes **dentro de este mismo proyecto** que tú no has hecho (un
  fichero que cambia entre tus propios comandos), asume que **hay otra sesión trabajando aquí**:
  **detente, no sigas editando y avisa** — no intentes «ganar» la carrera de ediciones.

### Git y raíz del workspace

- **Nunca ejecutes Git desde la raíz general** `~/Desktop/Programacion IA` ni desde
  `03_juegos/`: no son repositorios del proyecto. Ejecuta Git solo dentro de la carpeta de este
  juego (o no lo ejecutes, si no tiene repositorio propio).
- No hagas `push`, `deploy`, ni cambios de rama/historial sin autorización explícita de Stefano.

*(Bloque de aislamiento estándar del workspace — añadido por el agente-orquestador de
mantenimiento. Documental: no cambia código, assets ni configuración de build.)*
