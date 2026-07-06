# Revisión de fidelidad — Icono y Feature graphic (TREXoRoll)

> Encargo: «Revisa si el icono y el feature graphic actuales representan bien el juego. Si no son
> fieles, propón ajustes, pero NO inventes capturas.» Aquí está el análisis comparando con el
> juego REAL (capturas en `assets/*-real.png`).

## Qué se revisó
- `icon/icon-512.png` (512×512) — generado desde `assets/icon.svg` (es el **icono real del
  juego/PWA**, no un mockup nuevo).
- `feature-graphic/feature-1024x500.png` (1024×500) — icono + wordmark + lema + píldoras.

## Veredicto rápido
| Recurso | ¿Representa el juego? | ¿Cumple Play Store? | Acción |
|---|---|---|---|
| Icono | **Parcial** (marca correcta; la **bola** no coincide con la del juego) | ✅ Sí (512×512, PNG, sin texto, fondo limpio) | Ajuste **opcional** del arte de la bola |
| Feature | **Sí** (marca + textos veraces) | ✅ Sí (1024×500, sin captura embebida) | Mismo ajuste de bola (opcional) + textos OK |

## Hallazgo principal: la BOLA no es fiel al juego
- **En el juego (real)**: la bola por defecto es una **esfera BLANCA con una silueta LATERAL de
  T-Rex VERDE** (ver `assets/phone-02-gameplay-real.png`).
- **En el icono y el feature**: la bola es **ÁMBAR con una cara FRONTAL** (un ojo + colmillos),
  estilo «monstruito».
- **Conclusión**: el icono funciona como **mascota/marca** y es reconocible, pero **no
  representa la bola real** que ve el jugador. No es un error de Play Store (un icono puede ser
  estilizado), es una decisión de **fidelidad de marca**.

### Opciones (elige una; ninguna inventa capturas)
1. **Mantener** el icono actual como marca estilizada (es el icono real de la PWA; coherente en
   icono + feature + app). Cero trabajo. Aceptable para publicar.
2. **Acercarlo al juego** (recomendado si quieres fidelidad): editar `assets/icon.svg` para que
   la bola sea **blanca con la silueta lateral verde del T-Rex** (la misma del juego) y
   reexportar a 512×512. El feature graphic reutiliza ese icono, así que se actualizan ambos.
   *(Es editar el SVG de marca, no fabricar una captura.)*

> Nota: existe una skin **«Ámbar»** en el juego; si se mantiene la bola ámbar, conviene que su
> **cara** use el mismo estilo de silueta lateral que el juego, no una cara frontal distinta.

## Feature graphic — textos verificados (veraces, coinciden con la ficha)
Comparado con `descriptions/full.txt`:
- «**50 niveles**» ✅ (50 niveles en 10 mundos).
- «**8 skins**» ✅ (8 skins coleccionables).
- «**Cofre jurásico**» ✅ (cofre con recompensas).
- «**Jefes & contrarreloj**» ✅ (eventos JEFE cada 10 niveles + niveles CONTRARRELOJ).
- Lema «Inclina, rueda y conquista cada tablero» ✅ (coincide con el título/descripción).
→ **Sin afirmaciones falsas.**

### Cumplimiento del feature graphic
- ✅ 1024×500, sin captura de pantalla embebida (regla de Play), sin marcas de terceros.
- ✅ Texto clave centrado; el fondo es un degradado verde liso (no usa el fondo «jurassic»).
- 🔎 Revisar que el wordmark «TREXoRoll» no quede **demasiado pegado al borde** superior/derecho
  (Play puede recortar). Si se ve justo, reducir ~5% y centrar más. Opcional.

## ✅ Aviso transversal — fondo resuelto (2026-07-02)
El fondo de terceros (nombre de marca) que aparecía en las capturas de gameplay se **eliminó**
del proyecto y se reemplazó por un **fondo procedural propio** (Canvas 2D, sin marcas). El icono
y el feature graphic **no** usaban ese fondo (siguen a salvo). ⚠️ **Las capturas de gameplay
`phone-*-real.png` / `tablet*-real.png` deben REGENERARSE** con la build actual antes de subir,
para que muestren el fondo procedural nuevo y no el retirado.

## Resumen de acciones propuestas
1. (Opcional, fidelidad) Editar `assets/icon.svg`: bola blanca + silueta lateral verde → reexportar icono 512×512 (y el feature lo hereda).
2. (Opcional) Verificar márgenes del wordmark en el feature graphic.
3. ✅ (Hecho) Fondo de terceros eliminado → **procedural propio**. Pendiente: **regenerar capturas** con el nuevo fondo.
4. Si no se hace nada: icono y feature **son válidos para subir** tal cual (solo pierdes algo de fidelidad de la bola).

---
© 2026 SLF Games. Todos los derechos reservados.
