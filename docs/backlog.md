# Backlog — TREXoRoll

> Artefacto de **agente-product-owner**. Épicas → historias, con prioridad y estado.
> Estados: ✅ hecho · 🔄 en curso · ⏳ pendiente (post-MVP)

---

## ÉPICA 1 — Cimientos técnicos  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| T-01 | Estructura del proyecto según convención `03_juegos/` | Alta | ✅ |
| T-02 | Vendorizar Three.js local + importmap (sin red en runtime) | Alta | ✅ |
| T-03 | Config central y constantes (`utils/constants.js`) | Alta | ✅ |
| T-04 | Persistencia local (high score, niveles) con fallback | Media | ✅ |

## ÉPICA 2 — Física y control  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| F-01 | Gravedad proyectada por inclinación del tablero | Alta | ✅ |
| F-02 | Integración con paso fijo + fricción + límite de velocidad | Alta | ✅ |
| F-03 | Huella del tablero (rect/circle/poly) + detección de caída | Alta | ✅ |
| F-04 | Rebote círculo-vs-AABB contra muros | Alta | ✅ |
| F-05 | Detección de hoyo objetivo y hoyos trampa con captura | Alta | ✅ |
| F-06 | Control teclado (flechas/WASD) | Alta | ✅ |
| F-07 | Control por arrastre (ratón + táctil) | Alta | ✅ |

## ÉPICA 3 — Escena 3D  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| S-01 | Renderer, cámara, luces, cielo, niebla, suelo | Alta | ✅ |
| S-02 | Construcción del tablero desde la huella del nivel | Alta | ✅ |
| S-03 | Bola con emblema de T-Rex y giro de rodadura | Alta | ✅ |
| S-04 | Hoyo meta (anillo verde pulsante) y trampas (anillo rojo) | Alta | ✅ |
| S-05 | Decoración jurásica original (rocas, huevos, helechos, fósiles, huellas) | Media | ✅ |
| S-06 | Encuadre de cámara automático (desktop + móvil vertical) | Alta | ✅ |
| S-07 | Gestión de memoria al cambiar de nivel | Media | ✅ |

## ÉPICA 4 — Bucle de juego y progresión  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| G-01 | Máquina de estados de partida (rolling/sink/fall) | Alta | ✅ |
| G-02 | 3 vidas + reinicio de bola | Alta | ✅ |
| G-03 | Puntuación (base + vidas + tiempo) | Alta | ✅ |
| G-04 | Progresión y desbloqueo de niveles | Alta | ✅ |
| G-05 | Animaciones de hundimiento en hoyo y caída | Media | ✅ |

## ÉPICA 5 — Niveles  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| L-01 | Nivel 1 — Valle Inicial (rectángulo, tutorial) | Alta | ✅ |
| L-02 | Nivel 2 — Sendero Largo (tope + trampa) | Alta | ✅ |
| L-03 | Nivel 3 — Cresta Triangular (precisión) | Alta | ✅ |
| L-04 | Nivel 4 — Cráter Circular (trampa central) | Alta | ✅ |
| L-05 | Nivel 5 — Laberinto Jurásico (navegación + trampas) | Alta | ✅ |

## ÉPICA 6 — Interfaz y pantallas  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| U-01 | Landing moderna (título, subtítulo, bola, Entrar) | Alta | ✅ |
| U-02 | Menú principal (Jugar, Niveles, Cómo jugar, Sonido) | Alta | ✅ |
| U-03 | Selección de niveles con bloqueo | Media | ✅ |
| U-04 | Cómo jugar | Media | ✅ |
| U-05 | Preparación de partida | Alta | ✅ |
| U-06 | HUD en partida (nivel, vidas, puntos, toast) | Alta | ✅ |
| U-07 | Victoria y Game Over | Alta | ✅ |
| U-08 | Estilo jurásico responsive (desktop + móvil) | Alta | ✅ |

## ÉPICA 7 — Audio  ·  Prioridad: Media
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| A-01 | SFX sintetizados (clic, victoria, fallo, caída) + mute | Media | ✅ |

## ÉPICA 8 — QA  ·  Prioridad: Alta
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| Q-01 | Smoke-test de física en Node (`npm test`) | Alta | ✅ |
| Q-02 | Syntax-check de todos los módulos | Alta | ✅ |
| Q-03 | Prueba manual en navegador (visual + sensación) | Alta | ⏳ (requiere Stefano) |

---

## Iteración v0.2.0 (completada)
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| I-01 | Ampliar a 15 niveles con curva de dificultad | Alta | ✅ |
| I-02 | Validador automático de solvencia de niveles | Alta | ✅ |
| I-03 | Tuning de game feel + gracia de caída | Alta | ✅ |
| I-04 | Pausa (P/Esc/botón) + reiniciar nivel | Alta | ✅ |
| I-05 | Estrellas (1–3) + mejores tiempos + récord | Media | ✅ |
| I-06 | Cronómetro + indicador de inclinación | Media | ✅ |
| I-07 | Tone mapping ACES + sombras + rim light + sombra de contacto | Media | ✅ |
| I-08 | Flash de feedback + sacudida de cámara | Media | ✅ |
| I-09 | Sonidos de inicio y récord | Media | ✅ |
| I-10 | Transiciones de pantalla + marca consistente | Baja | ✅ |

## Iteración v0.3.0 (completada)
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| J-01 | Selección de 5 bolas con cara de dino + persistencia | Alta | ✅ |
| J-02 | Efecto de victoria: dino sale del hoyo y baila + confeti + rugido | Alta | ✅ |
| J-03 | Fondos jurásicos por bioma (8 ambientaciones) | Alta | ✅ |
| J-04 | 10 niveles nuevos (16–25) con dificultad creciente | Alta | ✅ |
| J-05 | Preview de bola en menú/preparación/HUD | Media | ✅ |
| J-06 | Persistencia de bola elegida y último nivel | Media | ✅ |
| J-07 | Polish visual (paneles, tarjetas de bola, animaciones) | Media | ✅ |
| J-08 | Smoke-test de dibujo/3D sin navegador | Media | ✅ |

## Iteración v0.14.0 (completada) — Expansión de contenido y mecánicas
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| X-01 | 25 niveles nuevos (26–50) → **50 niveles**, dificultad creciente | Alta | ✅ |
| X-02 | 5 mundos nuevos (6–10) → **10 mundos**; progresión/desbloqueos/HUD X/50 | Alta | ✅ |
| X-03 | Mecánica de **portales naranjas** (2/nivel, enlazados) con cooldown y salida segura | Alta | ✅ |
| X-04 | Efecto de **invocación** del portal (vórtice + aro + chispas + sonido) | Alta | ✅ |
| X-05 | **Pterodáctilos** ambientales (2 vuelos/nivel) sin tapar HUD/controles | Media | ✅ |
| X-06 | **Diplodocus** al recoger estrella (overlay lateral, no bloquea input) | Media | ✅ |
| X-07 | Validador **portal-aware** + checks de portales; `events-smoke`; test de física de portales | Alta | ✅ |
| X-08 | i18n ES/EN de niveles/mundos nuevos; copys "50 niveles / 10 mundos" | Media | ✅ |

## Iteración v0.15.0 (completada) — Responsive móvil + evento Triceratops
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| R-01 | Perfil de viewport en JS (clases en body) + `visualViewport` | Alta | ✅ |
| R-02 | Encuadre de cámara por dispositivo (`setViewportFit`): tablero grande en móvil | Alta | ✅ |
| R-03 | Paneles `dvh` + HUD/controles compactos en teléfonos pequeños (sin recortar pausa) | Alta | ✅ |
| R-04 | QA responsive (vertical/horizontal, iPhone/Android) sin scroll en partida | Alta | ✅ |
| X-09 | Evento **Triceratops** (adulto + 2 bebés) al recoger 3 monedas, 1 vez/nivel | Media | ✅ |
| X-10 | Triceratops no intrusivo (overlay, sin tocar física/HUD/controles/input) | Alta | ✅ |
| X-11 | Tests: SVG Triceratops bien formado + checks responsive en `events-smoke` | Media | ✅ |

## Iteración v0.19.0 (completada) — Ítems cohete
| ID | Historia | Prioridad | Estado |
|----|----------|-----------|--------|
| K-01 | **Cohete de colores** (niveles 3,8,…,48): lanzamiento + fuegos artificiales | Alta | ✅ |
| K-02 | **Cohete con raya roja** (niveles 7,17,…,47): evento del pterodáctilo (vuela/impacto/cae) | Alta | ✅ |
| K-03 | Colocación procedural validada (fuera de hoyos/trampas/portales/monedas/estrella) | Alta | ✅ |
| K-04 | Activación por contacto sin tocar física/estado; sin reactivación; limpieza al ganar/perder | Alta | ✅ |
| K-05 | Disjuntos del cavernícola (no múltiplos de 5); impacto cartoon sin sangre | Media | ✅ |
| K-06 | sfx (lanzamiento/fuegos/bonk/silbido) + checks (canvas-smoke, colocación offline) | Media | ✅ |

## Post-MVP (pendientes)
| ID | Historia | Prioridad |
|----|----------|-----------|
| P-02 | Control por giroscopio en móvil | Baja |
| P-03 | Modelos 3D (.glb) y animaciones | Baja |
| P-04 | Música de fondo (CC0 / propia) | Baja |
| P-05 | Editor de niveles | Baja |
| P-06 | Despliegue en GitHub Pages | Media (requiere confirmación de Stefano) |
