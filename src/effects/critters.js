// critters.js — Eventos visuales AMBIENTALES, en una capa DOM/SVG independiente del
// juego (#critter-layer). Por diseño NO interfieren con la jugabilidad:
//   · pointer-events: none  → nunca bloquean el input (D-pad, joystick, arrastre).
//   · z-index por DEBAJO del HUD y los controles → nunca los tapan.
//   · no tocan la física ni la escena 3D.
// Mobile-first: SVG ligero animado por compositor (transform/opacity). Sin
// dependencias. Fuera del navegador (tests en Node) todas las funciones son no-op.
//
// Eventos:
//   · flyPtero(dir)     → un pterodáctilo cruza el cielo (2 veces por nivel: ida y vuelta).
//   · diplodocus()      → al recoger una estrella, un diplodocus se asoma, come una hoja y se va.
//   · triceratops(dir)  → al recoger 3 monedas, una familia Triceratops (adulto + 2 bebés)
//                          camina por el borde inferior y desaparece por el otro lado.

const hasDOM = typeof document !== 'undefined' && !!document.getElementById;

function layer() {
  return hasDOM ? document.getElementById('critter-layer') : null;
}

const reduceMotion = () =>
  hasDOM && typeof window !== 'undefined' && window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Arte procedural (siluetas originales, sin IP de terceros) ----------------

const PTERO_SVG = `
<svg class="ptero-svg" viewBox="0 0 140 80" aria-hidden="true">
  <g class="pw pw-l"><path d="M70 42 C50 18 28 12 8 22 C30 28 50 36 66 46 Z"/></g>
  <g class="pw pw-r"><path d="M70 42 C90 18 112 12 132 22 C110 28 90 36 74 46 Z"/></g>
  <ellipse class="pt-body" cx="70" cy="48" rx="15" ry="6.5"/>
  <path class="pt-body" d="M58 46 L36 41 L36 49 L58 52 Z"/>
  <path class="pt-body" d="M63 42 L77 35 L72 47 Z"/>
  <circle class="pt-eye" cx="47" cy="45" r="1.7"/>
</svg>`;

// Diplodocus: saurópodo estilizado "polished low-poly/cartoon premium". Silueta de
// cuello largo, cuerpo robusto con volumen (gradientes), patas columnares, cola
// armoniosa, cabeza de saurópodo con cara amable y una hoja tropical para comer.
const DIPLO_SVG = `
<svg class="diplo-svg" viewBox="0 0 220 280" aria-hidden="true">
  <defs>
    <linearGradient id="dpBody" x1="0" y1="0" x2="0.22" y2="1">
      <stop offset="0" stop-color="#79bb86"/>
      <stop offset="0.55" stop-color="#4f9866"/>
      <stop offset="1" stop-color="#387150"/>
    </linearGradient>
    <linearGradient id="dpLeg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4c8c62"/>
      <stop offset="1" stop-color="#2f6244"/>
    </linearGradient>
    <linearGradient id="dpLeaf" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#a6e463"/>
      <stop offset="1" stop-color="#4ea33a"/>
    </linearGradient>
  </defs>

  <ellipse class="dp-shadow" cx="106" cy="273" rx="86" ry="13"/>

  <path class="dp-tail dp-fill" d="M64 206 C40 196 16 200 5 222 C0 231 5 238 13 233 C26 226 44 220 64 217 C72 216 73 209 64 206 Z"/>

  <path class="dp-leg-back" d="M78 226 C72 248 72 262 75 272 L94 272 C96 258 95 242 92 224 Z"/>
  <path class="dp-leg-back" d="M130 226 C126 248 126 262 129 272 L148 272 C150 258 148 242 144 224 Z"/>

  <path class="dp-body dp-fill" d="M40 198 C40 160 68 138 106 138 C150 138 176 164 176 200 C176 238 144 256 104 256 C64 256 40 236 40 198 Z"/>
  <ellipse class="dp-belly" cx="100" cy="214" rx="50" ry="30"/>
  <g class="dp-spots">
    <ellipse cx="84" cy="156" rx="7" ry="5"/>
    <ellipse cx="106" cy="150" rx="8" ry="5.5"/>
    <ellipse cx="128" cy="157" rx="7" ry="5"/>
    <ellipse cx="148" cy="170" rx="6" ry="4.5"/>
  </g>

  <path class="dp-leg dp-fill" d="M86 236 C82 256 82 270 85 278 L106 278 C108 266 107 250 102 232 Z"/>
  <path class="dp-leg dp-fill" d="M132 234 C129 254 129 270 132 278 L153 278 C155 264 153 248 148 230 Z"/>
  <g class="dp-toes">
    <path d="M90 278 v-7 M98 278 v-7 M137 278 v-7 M145 278 v-7"/>
  </g>

  <g class="dp-neck">
    <path class="dp-neck-fill dp-fill" d="M140 174 C164 146 176 110 182 80 C184 71 175 67 168 73 C158 104 140 140 118 168 C122 176 132 180 140 174 Z"/>
    <g class="dp-head">
      <path class="dp-head-fill dp-fill" d="M150 82 C148 68 158 60 174 60 C192 60 202 67 202 75 C202 82 195 86 185 86 C172 88 156 88 150 84 Z"/>
      <path class="dp-head-fill dp-fill" d="M156 66 C160 59 170 59 174 64 C168 63 161 64 156 68 Z"/>
      <ellipse class="dp-eye" cx="170" cy="72" rx="3.8" ry="4.2"/>
      <circle class="dp-eyeshine" cx="171.4" cy="70.3" r="1.3"/>
      <ellipse class="dp-nostril" cx="195" cy="71" rx="2.2" ry="1.6"/>
      <path class="dp-mouth" d="M176 84 C186 86 194 83 200 78"/>
    </g>
  </g>

  <g class="dp-leaf">
    <path class="dp-leaf-blade" d="M201 70 C198 54 206 38 222 28 C227 42 222 60 208 70 C206 72 203 72 201 70 Z"/>
    <path class="dp-leaf-vein" d="M202 69 C205 56 211 44 221 30"/>
    <path class="dp-leaf-vein" d="M206 60 l9 -4 M209 51 l9 -4 M213 43 l8 -4"/>
  </g>
</svg>`;

/**
 * Tiempos (en s desde el inicio del nivel) de los DOS vuelos de pterodáctilo:
 * uno pronto (ida) y otro más tarde (vuelta), escalado con el "par" del nivel.
 * Función PURA (testeable sin navegador).
 * @returns {[number, number]}
 */
export function pteroFlightTimes(par = 60) {
  const second = Math.min(13, Math.max(6, par * 0.45));
  return [1.6, second];
}

/** Lanza un pterodáctilo cruzando la pantalla. dir: 'ltr' (izq→der) | 'rtl'. */
export function flyPtero(dir = 'ltr') {
  const root = layer();
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'critter ptero ' + (dir === 'rtl' ? 'rtl' : 'ltr');
  el.innerHTML = PTERO_SVG;
  root.appendChild(el);

  const fromX = dir === 'rtl' ? '120vw' : '-24vw';
  const midX = dir === 'rtl' ? '50vw' : '50vw';
  const toX = dir === 'rtl' ? '-24vw' : '120vw';
  const remove = () => el.remove();
  if (el.animate && !reduceMotion()) {
    const a = el.animate([
      { transform: `translate(${fromX}, 0)` },
      { transform: `translate(${midX}, -4vh)`, offset: 0.5 },
      { transform: `translate(${toX}, 0)` },
    ], { duration: 4600, easing: 'linear' });
    a.onfinish = remove;
    a.oncancel = remove;
  } else {
    // Sin Web Animations (o movimiento reducido): aparición discreta y breve.
    el.style.left = '50vw';
    setTimeout(remove, 1800);
  }
}

/** Al recoger una estrella: el diplodocus se asoma desde un lateral, come y se va. */
export function diplodocus(side) {
  const root = layer();
  if (!root) return;
  side = side === 'right' || side === 'left' ? side : (Math.random() < 0.5 ? 'left' : 'right');
  const el = document.createElement('div');
  el.className = 'critter diplo ' + side;
  el.innerHTML = DIPLO_SVG;
  root.appendChild(el);

  const off = side === 'left' ? '-64%' : '64%';
  const remove = () => el.remove();
  if (el.animate && !reduceMotion()) {
    // Entrada con asentamiento (overshoot suave), mantenerse mientras come, y salida
    // hacia el lateral. Las sub-animaciones del SVG (cuello/cabeza/hoja/cola) están
    // sincronizadas con esta misma duración (3,2 s) por CSS.
    const a = el.animate([
      { transform: `translateX(${off}) translateY(30%)`, opacity: 0, easing: 'cubic-bezier(0.34, 1.25, 0.5, 1)' },
      { transform: 'translateX(0) translateY(0)', opacity: 1, offset: 0.22, easing: 'linear' },
      { transform: 'translateX(0) translateY(0)', opacity: 1, offset: 0.76, easing: 'cubic-bezier(0.5, 0, 0.75, 0.3)' },
      { transform: `translateX(${off}) translateY(22%)`, opacity: 0 },
    ], { duration: 3200 });
    a.onfinish = remove;
    a.oncancel = remove;
  } else {
    el.style.opacity = '1';
    setTimeout(remove, 1600);
  }
}

// Familia Triceratops "premium": adulto (gola trabajada con epoccipitales + patrón,
// 3 cuernos de marfil, cuerpo robusto con volumen, 4 patas con profundidad, cola) y
// 2 bebés tiernos y coherentes. Paleta AMARILLO dorado + MARRÓN anaranjado + marfil.
// Estilizado, mira hacia la derecha por defecto (se voltea por CSS para 'rtl').
const TRICERATOPS_SVG = `
<svg class="tri-svg" viewBox="0 0 460 185" aria-hidden="true">
  <defs>
    <linearGradient id="triBody" x1="0" y1="0" x2="0.16" y2="1">
      <stop offset="0" stop-color="#ffda5e"/>
      <stop offset="0.45" stop-color="#efaa34"/>
      <stop offset="0.78" stop-color="#d2851f"/>
      <stop offset="1" stop-color="#b06a16"/>
    </linearGradient>
    <linearGradient id="triFrill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c47020"/>
      <stop offset="1" stop-color="#85461a"/>
    </linearGradient>
  </defs>

  <ellipse class="tri-shadow" cx="230" cy="168" rx="216" ry="11"/>

  <!-- Bebé 2 (más atrás) -->
  <g class="tri-baby-2">
    <path class="tri-leg-far" d="M48 124 l-2 18 h9 l1 -18 z"/>
    <path class="tri-leg-far" d="M76 124 l-2 18 h9 l1 -18 z"/>
    <path class="tri-fill" d="M38 110 C22 108 10 116 2 130 C11 128 16 124 24 120 C32 116 40 114 44 114 Z"/>
    <path class="tri-fill" d="M54 124 l-3 20 h11 l2 -20 z"/>
    <path class="tri-fill" d="M80 124 l-3 20 h11 l2 -20 z"/>
    <ellipse class="tri-fill" cx="64" cy="110" rx="32" ry="22"/>
    <ellipse class="tri-hi" cx="60" cy="98" rx="22" ry="8"/>
    <ellipse class="tri-belly" cx="62" cy="118" rx="22" ry="11"/>
    <g class="tri-toes"><path d="M56 144 v-6 M64 144 v-6 M82 144 v-6 M90 144 v-6"/></g>
    <path class="tri-frill" d="M82 90 C92 80 108 82 114 94 C117 102 115 112 107 116 C97 120 82 117 78 108 C74 100 76 94 82 90 Z"/>
    <path class="tri-frill-in" d="M88 94 C97 86 109 88 114 98 C116 105 114 112 107 115 C98 118 86 116 82 108 C79 101 81 98 88 94 Z"/>
    <g class="tri-frill-edge"><circle cx="107" cy="86" r="3"/><circle cx="116" cy="102" r="3"/><circle cx="104" cy="118" r="2.6"/></g>
    <path class="tri-horn-bk" d="M98 90 C95 78 99 69 103 65 C108 71 106 82 102 92 Z"/>
    <path class="tri-fill" d="M92 98 C106 90 124 94 131 104 C134 110 128 116 118 116 C104 117 92 110 89 102 C88 99 89 100 92 98 Z"/>
    <path class="tri-horn" d="M120 96 C121 89 125 85 129 85 C130 91 127 98 123 101 Z"/>
    <path class="tri-horn" d="M108 92 C105 81 110 72 116 69 C119 76 115 87 111 94 Z"/>
    <path class="tri-beak" d="M126 106 C134 103 138 109 133 114 C127 115 121 110 120 107 Z"/>
    <ellipse class="tri-eyering" cx="104" cy="104" rx="5" ry="5.4"/>
    <ellipse class="tri-eye" cx="104" cy="104" rx="3.4" ry="3.8"/>
    <circle class="tri-eyeshine" cx="105.2" cy="102.4" r="1.2"/>
  </g>

  <!-- Bebé 1 -->
  <g class="tri-baby-1">
    <path class="tri-leg-far" d="M134 124 l-2 18 h9 l1 -18 z"/>
    <path class="tri-leg-far" d="M162 124 l-2 18 h9 l1 -18 z"/>
    <path class="tri-fill" d="M124 110 C108 108 96 116 88 130 C97 128 102 124 110 120 C118 116 126 114 130 114 Z"/>
    <path class="tri-fill" d="M140 124 l-3 20 h11 l2 -20 z"/>
    <path class="tri-fill" d="M166 124 l-3 20 h11 l2 -20 z"/>
    <ellipse class="tri-fill" cx="150" cy="110" rx="32" ry="22"/>
    <ellipse class="tri-hi" cx="146" cy="98" rx="22" ry="8"/>
    <ellipse class="tri-belly" cx="148" cy="118" rx="22" ry="11"/>
    <g class="tri-toes"><path d="M142 144 v-6 M150 144 v-6 M168 144 v-6 M176 144 v-6"/></g>
    <path class="tri-frill" d="M168 90 C178 80 194 82 200 94 C203 102 201 112 193 116 C183 120 168 117 164 108 C160 100 162 94 168 90 Z"/>
    <path class="tri-frill-in" d="M174 94 C183 86 195 88 200 98 C202 105 200 112 193 115 C184 118 172 116 168 108 C165 101 167 98 174 94 Z"/>
    <g class="tri-frill-edge"><circle cx="193" cy="86" r="3"/><circle cx="202" cy="102" r="3"/><circle cx="190" cy="118" r="2.6"/></g>
    <path class="tri-horn-bk" d="M184 90 C181 78 185 69 189 65 C194 71 192 82 188 92 Z"/>
    <path class="tri-fill" d="M178 98 C192 90 210 94 217 104 C220 110 214 116 204 116 C190 117 178 110 175 102 C174 99 175 100 178 98 Z"/>
    <path class="tri-horn" d="M206 96 C207 89 211 85 215 85 C216 91 213 98 209 101 Z"/>
    <path class="tri-horn" d="M194 92 C191 81 196 72 202 69 C205 76 201 87 197 94 Z"/>
    <path class="tri-beak" d="M212 106 C220 103 224 109 219 114 C213 115 207 110 206 107 Z"/>
    <ellipse class="tri-eyering" cx="190" cy="104" rx="5" ry="5.4"/>
    <ellipse class="tri-eye" cx="190" cy="104" rx="3.4" ry="3.8"/>
    <circle class="tri-eyeshine" cx="191.2" cy="102.4" r="1.2"/>
  </g>

  <!-- Adulto (delante) -->
  <g class="tri-adult">
    <g class="tri-leg-c"><path class="tri-leg-far" d="M228 124 C226 140 226 154 228 162 L246 162 C249 152 249 138 246 122 Z"/></g>
    <g class="tri-leg-d"><path class="tri-leg-far" d="M300 124 C298 140 298 154 300 162 L318 162 C321 152 321 138 318 122 Z"/></g>
    <g class="tri-tail"><path class="tri-fill" d="M208 104 C176 102 150 114 130 140 C144 138 152 132 168 126 C186 119 202 114 214 114 C220 112 218 105 208 104 Z"/></g>
    <path class="tri-fill" d="M196 96 C196 64 228 48 270 48 C318 48 346 70 346 100 C346 132 314 150 268 150 C222 150 196 128 196 96 Z"/>
    <ellipse class="tri-hi" cx="262" cy="70" rx="60" ry="16"/>
    <ellipse class="tri-belly" cx="264" cy="118" rx="58" ry="26"/>
    <ellipse class="tri-ao" cx="270" cy="142" rx="56" ry="13"/>
    <g class="tri-spots">
      <ellipse cx="232" cy="64" rx="8" ry="4.5"/>
      <ellipse cx="258" cy="58" rx="9" ry="5"/>
      <ellipse cx="286" cy="60" rx="8" ry="4.5"/>
      <ellipse cx="308" cy="68" rx="6" ry="4"/>
    </g>
    <g class="tri-leg-a"><path class="tri-fill" d="M238 122 C235 142 235 156 238 166 L262 166 C266 154 266 138 262 120 Z"/></g>
    <g class="tri-leg-b"><path class="tri-fill" d="M300 122 C297 142 297 156 300 166 L324 166 C328 154 328 138 324 120 Z"/></g>
    <g class="tri-toes"><path d="M242 166 v-7 M250 166 v-7 M258 166 v-7 M304 166 v-7 M312 166 v-7 M320 166 v-7"/></g>
    <g class="tri-head">
      <path class="tri-frill" d="M318 50 C342 34 378 36 396 56 C406 68 404 104 390 118 C372 132 336 130 320 116 C308 104 304 64 318 50 Z"/>
      <path class="tri-frill-in" d="M328 60 C348 48 376 50 390 64 C398 74 396 102 384 112 C368 124 340 122 328 110 C318 100 316 70 328 60 Z"/>
      <g class="tri-frill-lines"><path d="M338 86 L388 62 M338 90 L394 90 M338 96 L386 116"/></g>
      <g class="tri-frill-edge">
        <circle cx="358" cy="40" r="5"/>
        <circle cx="382" cy="50" r="5.5"/>
        <circle cx="396" cy="70" r="5.5"/>
        <circle cx="398" cy="92" r="5.5"/>
        <circle cx="388" cy="112" r="5"/>
        <circle cx="364" cy="122" r="4.5"/>
      </g>
      <path class="tri-horn-bk" d="M346 64 C340 40 344 20 352 12 C361 20 363 46 356 70 Z"/>
      <path class="tri-fill" d="M330 72 C356 64 386 70 400 86 C408 96 404 110 388 112 C366 114 340 108 330 96 C326 88 326 78 330 72 Z"/>
      <ellipse class="tri-ao" cx="366" cy="100" rx="18" ry="9"/>
      <path class="tri-mouth" d="M360 104 C374 108 390 106 400 98"/>
      <path class="tri-fill" d="M344 70 C350 62 362 62 368 68 C360 66 350 67 344 72 Z"/>
      <path class="tri-horn" d="M364 66 C360 44 368 26 378 20 C386 30 382 52 372 74 Z"/>
      <path class="tri-horn" d="M388 78 C390 66 396 60 402 60 C403 70 399 80 394 86 Z"/>
      <ellipse class="tri-eyering" cx="356" cy="84" rx="6.6" ry="7"/>
      <ellipse class="tri-eye" cx="356" cy="84" rx="4.4" ry="4.8"/>
      <circle class="tri-eyeshine" cx="357.8" cy="81.8" r="1.6"/>
      <path class="tri-beak" d="M396 92 C410 88 416 98 408 106 C398 109 388 102 388 96 Z"/>
    </g>
  </g>
</svg>`;

/**
 * Familia Triceratops caminando por el borde inferior (evento de las 3 monedas).
 * dir: 'ltr' (entra por la izquierda) | 'rtl'. Lenta y tranquila; ~7 s.
 */
export function triceratops(dir = 'ltr') {
  const root = layer();
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'critter tri ' + (dir === 'rtl' ? 'rtl' : 'ltr');
  el.innerHTML = TRICERATOPS_SVG;
  root.appendChild(el);

  // Entra del todo por un lado y sale del todo por el otro (los offsets cubren el ancho
  // del grupo en cualquier pantalla). Paso lento y tranquilo.
  const fromX = dir === 'rtl' ? '118vw' : '-98vw';
  const toX = dir === 'rtl' ? '-98vw' : '118vw';
  const remove = () => el.remove();
  if (el.animate && !reduceMotion()) {
    const a = el.animate([
      { transform: `translateX(${fromX})` },
      { transform: `translateX(${toX})` },
    ], { duration: 8000, easing: 'linear' });
    a.onfinish = remove;
    a.oncancel = remove;
  } else {
    el.style.left = '14vw';
    setTimeout(remove, 2200);
  }
}

/** Quita cualquier critter en pantalla (al cambiar de nivel o salir del juego). */
export function clear() {
  const root = layer();
  if (!root) return;
  while (root.firstChild) root.firstChild.remove();
}
