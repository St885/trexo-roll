# STATUS — TREXoRoll

| Campo | Valor |
|---|---|
| **Versión** | 0.3.1 — Una especie de dino por bola |
| **Estado** | 🟢 Listo para probar localmente (pendiente verificación manual en navegador) |
| **Fecha** | 2026-06-19 |
| **Ruta** | `03_juegos/trexo-roll/` |
| **Stack** | Three.js r160 (vendorizado) · JS ES6+ · CSS3 · Web Audio |
| **Dependencias runtime** | 0 (Three.js en `libs/`) |
| **Niveles** | 25 (Fácil → Experto), todos validados como superables |
| **Bolas** | 5, cada una con **especie de dino distinta** (T-Rex, Raptor, Parasaurio, Triceratops, Braquiosaurio) |
| **Biomas** | 8 ambientaciones jurásicas |
| **Git** | No inicializado todavía |
| **Deploy** | No (pendiente de confirmación de Stefano) |

---

## Novedades v0.3.0

- Selección de 5 bolas con cara de dinosaurio + persistencia (preview en menú/prep/HUD).
- Efecto de victoria: el dino de tu bola sale del hoyo y baila + confeti + rugido.
- Fondos jurásicos por bioma (cielo + horizonte + suelo + niebla por código).
- 25 niveles (10 nuevos) con dificultad creciente.
- HUD con icono de bola; persistencia de bola y último nivel.

## Validaciones realizadas

| Validación | Resultado |
|---|---|
| Syntax-check de los módulos (`node --check`) | ✅ OK |
| Grafo de módulos completo en Node (incl. Three.js) | ✅ carga |
| Smoke-test de física + **25 niveles** (`npm test`) | ✅ todos superables |
| Smoke-test de dibujo/3D (`npm run test:visual`) | ✅ caras, biomas y dino sin errores |
| Cross-check de IDs DOM (52) | ✅ todos existen |
| Servidor local sirve la versión nueva | ✅ HTTP 200 |
| Prueba manual en navegador (visual + sensación) | ⏳ Pendiente (Stefano) |

## Pendientes / próximos pasos

1. Prueba manual en navegador (desktop + móvil): bolas, celebración, biomas y dificultad.
2. (Opcional) giroscopio móvil, música CC0, modelos `.glb`, más biomas/decoración 3D.
3. Despliegue GitHub Pages — requiere confirmación de Stefano.

## Riesgos abiertos

- Sensación de control y dificultad de niveles avanzados: solo verificable jugando.
- Apariencia de las caras de dino / fondos: ajustable en `src/scene/textures.js`.
