// dinoArt.js — Siluetas 2D de perfil, una por especie de dinosaurio. Se usan como
// emblema de la bola y en las miniaturas de la interfaz. Solo Canvas 2D (sin THREE).
// Todas miran a la derecha, centradas en (0,0), escaladas por `s`.

function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function eye(ctx, x, y, dark) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.arc(x + 0.8, y, 2.2, 0, Math.PI * 2); ctx.fill();
}

// --- Bebé Triceratops (emblema de la bola AMARILLA y modelo de celebración) ------------------
// Vista FRONTAL cartoon estilo mobile: cabeza grande de bebé, FRILL redondo con bultos, cuernos
// pequeños, ojos grandes y expresivos, cuerpecito chubby, manchas suaves. Paleta AMARILLA fija
// (coherente con triceratops_baby_yellow.glb). Original, sin marcas. Centrado en (0,0), ~±54.
function drawBabyTriceratops(ctx) {
  const yellow = '#ffd24d', yellow2 = '#f2b134', outline = '#a8690f', beak = '#e6a838', horn = '#fff1cf';
  const spot = 'rgba(198,110,28,0.26)';

  // Cuerpecito chubby (asoma poco por abajo, detrás de la cabeza).
  ctx.fillStyle = yellow2;
  ellipse(ctx, 0, 34, 26, 18);
  for (const x of [-15, 15]) { ctx.beginPath(); ctx.ellipse(x, 46, 8, 7, 0, 0, Math.PI * 2); ctx.fill(); } // patitas

  // FRILL (gola) redondo detrás de la cabeza, con bultos (epoccipitales).
  ctx.fillStyle = outline;
  ellipse(ctx, 0, -6, 54, 47);                                    // borde/sombra del frill
  for (let a = -1.35; a <= 1.35; a += 0.27) {                     // bultos alrededor del arco superior
    ctx.beginPath(); ctx.arc(Math.sin(a) * 54, -6 - Math.cos(a) * 47, 6.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = yellow2;
  ellipse(ctx, 0, -4, 48, 41);                                    // relleno del frill (los bultos asoman)

  // CABEZA grande (protagonista) — estilo bebé.
  ctx.fillStyle = yellow;
  ellipse(ctx, 0, 6, 36, 33);

  // Cuernos pequeños de la frente + cuernito del morro.
  ctx.fillStyle = horn; ctx.strokeStyle = outline; ctx.lineWidth = 2;
  for (const sx of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sx * 13, -20); ctx.lineTo(sx * 23, -21); ctx.lineTo(sx * 20, -42); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-5, 16); ctx.lineTo(5, 16); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Manchas suaves marrón/naranja.
  ctx.fillStyle = spot;
  ellipse(ctx, -21, 8, 6.5, 5); ellipse(ctx, 20, 12, 5.5, 4.5); ellipse(ctx, 0, -14, 8, 5.5);

  // Hocico/pico + sonrisa amable.
  ctx.fillStyle = beak;
  ellipse(ctx, 0, 28, 13, 10);
  ctx.strokeStyle = outline; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(0, 25, 6.5, 0.18 * Math.PI, 0.82 * Math.PI); ctx.stroke();

  // Ojos GRANDES expresivos (con brillo).
  for (const sx of [-1, 1]) {
    const ex = sx * 15, ey = 3;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 10.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a10'; ctx.beginPath(); ctx.arc(ex + sx * 1.6, ey + 1.6, 5.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex - sx * 1.8, ey - 2.2, 2.6, 0, Math.PI * 2); ctx.fill();
  }
}

// Factor de ajuste del emblema de Oliver dentro de la bola: lo hace algo más pequeño que el resto
// para dejar MARGEN interno claro (objetivo ~58-68% del diámetro, máx 72%). Afinado por QA visual.
const OLIVER_FIT = 0.76;

// --- Oliver: T-Rex BEBÉ AZUL (emblema de la bola blanca principal) ---------------------------
// Perfil cartoon estilo mobile (mira a la derecha), FIEL al modelo 3D oliver_master.glb: cuerpo
// azul vivo con manchas azul oscuro, barriga amarilla, ESPINAS naranja (cabeza→lomo→cola), cabeza
// grande de bebé, ojo grande VERDE, boca sonriente con dientes, bracitos, piernas cortas con dedos
// amarillos y cola gruesa. Paleta AZUL fija (original, sin marcas). Centrado en (0,0), ~±56.
function drawOliver(ctx) {
  const blue = '#49a3e6', blue2 = '#3a86c8', spotC = 'rgba(26,74,124,0.55)', dk = '#1f4e79';
  const belly = '#ffdf8a', spike = '#f4913e', toe = '#ffd86b', tooth = '#ffffff', mouth = '#b83a2e';

  // Cola gruesa curvada hacia la izquierda.
  ctx.fillStyle = blue;
  ctx.beginPath();
  ctx.moveTo(-14, 2); ctx.quadraticCurveTo(-46, -6, -58, 8);
  ctx.quadraticCurveTo(-48, 18, -30, 16); ctx.quadraticCurveTo(-20, 14, -14, 12); ctx.closePath(); ctx.fill();

  // Piernas cortas + pies con dedos amarillos.
  ctx.fillStyle = blue2;
  ctx.beginPath(); ctx.ellipse(-10, 26, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5, 28, 8, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = toe;
  for (const [fx, fy] of [[-15, 39], [-8, 40], [1, 41], [9, 41]]) { ctx.beginPath(); ctx.ellipse(fx, fy, 5, 4, 0, 0, Math.PI * 2); ctx.fill(); }

  // Cuerpo chubby (bebé) + barriga amarilla.
  ctx.fillStyle = blue;
  ctx.beginPath(); ctx.ellipse(-6, 8, 28, 25, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath(); ctx.ellipse(7, 15, 13, 17, -0.15, 0, Math.PI * 2); ctx.fill();

  // Bracito pequeño con garra.
  ctx.fillStyle = blue2;
  ctx.beginPath(); ctx.ellipse(15, 9, 5, 9, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = toe; ctx.beginPath(); ctx.arc(19, 15, 2.2, 0, Math.PI * 2); ctx.fill();

  // Cabeza GRANDE (bebé).
  ctx.fillStyle = blue;
  ctx.beginPath(); ctx.ellipse(29, -13, 25, 22, 0, 0, Math.PI * 2); ctx.fill();
  // Hocico + boca sonriente entreabierta con dientes.
  ctx.fillStyle = blue;
  ctx.beginPath(); ctx.moveTo(40, -20); ctx.quadraticCurveTo(60, -20, 60, -9); ctx.quadraticCurveTo(52, -7, 43, -9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = mouth;
  ctx.beginPath(); ctx.moveTo(43, -8); ctx.quadraticCurveTo(53, -3, 60, -7); ctx.quadraticCurveTo(53, -1, 45, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = tooth;
  for (const tx of [46, 51, 56]) { ctx.beginPath(); ctx.moveTo(tx, -8); ctx.lineTo(tx + 3, -8); ctx.lineTo(tx + 1.5, -4); ctx.closePath(); ctx.fill(); }

  // Espinas naranja (cabeza → lomo → cola).
  ctx.fillStyle = spike;
  for (const [sx, sy] of [[18, -33], [5, -30], [-9, -19], [-24, -8], [-40, 2]]) {
    ctx.beginPath(); ctx.moveTo(sx - 5, sy + 6); ctx.lineTo(sx, sy - 7); ctx.lineTo(sx + 5, sy + 6); ctx.closePath(); ctx.fill();
  }

  // Manchas azul oscuro.
  ctx.fillStyle = spotC;
  for (const [px, py, pr] of [[-16, 10, 4.5], [-3, 20, 3.5], [-32, 12, 3.5], [-46, 8, 3]]) { ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); }

  // Ojo GRANDE verde (expresivo, con brillo).
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(27, -19, 9.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3aa03a'; ctx.beginPath(); ctx.arc(29, -18, 5.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f240c'; ctx.beginPath(); ctx.arc(30, -18, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(27, -20.5, 2.1, 0, Math.PI * 2); ctx.fill();
  // Fosa nasal.
  ctx.fillStyle = dk; ctx.beginPath(); ctx.arc(54, -15, 1.7, 0, Math.PI * 2); ctx.fill();
}

/** Dibuja la silueta de la especie indicada. */
export function drawDino(ctx, species, cx, cy, s, color, dark) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  switch (species) {
    case 'raptor': drawRaptor(ctx, color, dark); break;
    case 'parasaur': drawParasaur(ctx, color, dark); break;
    // 'triceratops' y 'babytri' comparten el emblema BEBÉ AMARILLO (bola amarilla / celebración).
    case 'triceratops':
    case 'babytri': drawBabyTriceratops(ctx); break;
    // 'oliver' = emblema del T-Rex bebé AZUL (bola blanca principal). Paleta propia (ignora color/dark).
    // Se dibuja algo MÁS COMPACTO (OLIVER_FIT) para dejar margen interno claro en la bola: el objetivo
    // es ~58-68% del diámetro (máx 72%), sin tocar el borde. Solo afecta a Oliver, no a otros emblemas.
    case 'oliver': ctx.save(); ctx.scale(OLIVER_FIT, OLIVER_FIT); drawOliver(ctx); ctx.restore(); break;
    case 'brachio': drawBrachio(ctx, color, dark); break;
    case 'trex':
    default: drawTRexProfile(ctx, color, dark); break;
  }
  ctx.restore();
}

// --- T-Rex: cabezón, brazos diminutos, cola gruesa, bípedo erguido --------
function drawTRexProfile(ctx, color, dark) {
  ctx.fillStyle = color;
  // Cola gruesa
  ctx.beginPath();
  ctx.moveTo(-6, 6); ctx.quadraticCurveTo(-42, 2, -56, 14);
  ctx.quadraticCurveTo(-40, 16, -8, 20); ctx.closePath(); ctx.fill();
  // Cuerpo y muslo
  ellipse(ctx, -6, 6, 26, 22);
  ellipse(ctx, 4, 14, 13, 17);
  // Cuello + cabeza grande
  ellipse(ctx, 24, -16, 13, 14, -0.5);
  ellipse(ctx, 40, -22, 18, 14, -0.1);
  // Mandíbula
  ctx.beginPath();
  ctx.moveTo(30, -16); ctx.lineTo(58, -18); ctx.lineTo(58, -8); ctx.lineTo(34, -6);
  ctx.closePath(); ctx.fill();
  // Dientes
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(40 + i * 5, -9); ctx.lineTo(43 + i * 5, -9); ctx.lineTo(41.5 + i * 5, -4); ctx.closePath(); ctx.fill(); }
  // Patas
  ctx.fillStyle = color;
  ctx.fillRect(-4, 22, 9, 22); ctx.fillRect(8, 24, 8, 20);
  ctx.fillStyle = dark; ctx.fillRect(-7, 42, 16, 5); ctx.fillRect(6, 42, 16, 5);
  // Bracito
  ctx.fillStyle = color; ctx.fillRect(18, 0, 10, 4);
  eye(ctx, 42, -24, dark);
}

// --- Velociraptor: esbelto, cola larga rígida, cabeza pequeña, garra ------
function drawRaptor(ctx, color, dark) {
  ctx.fillStyle = color;
  // Cola larga y fina hacia atrás-arriba
  ctx.beginPath();
  ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-40, -10, -60, -20);
  ctx.quadraticCurveTo(-40, -2, -8, 10); ctx.closePath(); ctx.fill();
  // Cuerpo esbelto
  ellipse(ctx, -6, 4, 22, 14);
  // Cuello hacia delante-arriba
  ctx.beginPath();
  ctx.moveTo(8, -2); ctx.quadraticCurveTo(24, -14, 34, -22);
  ctx.quadraticCurveTo(30, -8, 14, 4); ctx.closePath(); ctx.fill();
  // Cabeza pequeña + hocico puntiagudo
  ellipse(ctx, 38, -24, 12, 8, -0.2);
  ctx.beginPath(); ctx.moveTo(46, -28); ctx.lineTo(58, -24); ctx.lineTo(46, -20); ctx.closePath(); ctx.fill();
  // Piernas (una flexionada con garra)
  ctx.fillRect(-2, 14, 6, 16);
  ctx.beginPath(); ctx.moveTo(8, 12); ctx.lineTo(14, 22); ctx.lineTo(10, 30); ctx.lineTo(6, 22); ctx.closePath(); ctx.fill();
  // Garra falciforme
  ctx.strokeStyle = dark; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(10, 30); ctx.quadraticCurveTo(18, 30, 18, 22); ctx.stroke();
  // Bracito con mano
  ctx.fillStyle = color; ctx.fillRect(14, -2, 9, 3);
  eye(ctx, 40, -25, dark);
}

// --- Parasaurolophus: cresta tubular hacia atrás, pico de pato, lomo arqueado
function drawParasaur(ctx, color, dark) {
  ctx.fillStyle = color;
  // Cola larga
  ctx.beginPath();
  ctx.moveTo(-6, 6); ctx.quadraticCurveTo(-40, 0, -56, 16);
  ctx.quadraticCurveTo(-38, 16, -8, 18); ctx.closePath(); ctx.fill();
  // Cuerpo arqueado
  ellipse(ctx, -6, 6, 24, 18);
  // Cuello y cabeza
  ellipse(ctx, 20, -14, 11, 13, -0.5);
  ellipse(ctx, 36, -22, 12, 9, -0.2);
  // Pico de pato (hocico ancho)
  ctx.beginPath(); ctx.moveTo(42, -24); ctx.lineTo(56, -20); ctx.lineTo(54, -14); ctx.lineTo(42, -16); ctx.closePath(); ctx.fill();
  // Cresta tubular hacia atrás (rasgo distintivo)
  ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.beginPath();
  ctx.moveTo(34, -28); ctx.quadraticCurveTo(20, -44, 4, -40); ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(34, -28); ctx.quadraticCurveTo(20, -44, 4, -40); ctx.stroke();
  // Patas
  ctx.fillStyle = color; ctx.fillRect(-6, 20, 8, 20); ctx.fillRect(8, 22, 8, 18);
  ctx.fillStyle = dark; ctx.fillRect(-9, 38, 14, 5); ctx.fillRect(6, 38, 14, 5);
  eye(ctx, 38, -23, dark);
}

// --- Triceratops: gola + tres cuernos + pico, cuadrúpedo ------------------
function drawTriceratops(ctx, color, dark) {
  ctx.fillStyle = color;
  // Cuerpo robusto
  ellipse(ctx, -8, 8, 30, 20);
  // Cola corta
  ctx.beginPath(); ctx.moveTo(-30, 4); ctx.quadraticCurveTo(-48, 0, -52, 10); ctx.quadraticCurveTo(-42, 14, -30, 14); ctx.closePath(); ctx.fill();
  // Cuatro patas
  for (const x of [-22, -8, 8, 20]) ctx.fillRect(x, 24, 9, 18);
  ctx.fillStyle = dark; for (const x of [-23, -9, 7, 19]) ctx.fillRect(x, 40, 12, 5);
  // Gola (volante) detrás de la cabeza
  ctx.fillStyle = dark; ellipse(ctx, 24, -6, 18, 22);
  ctx.fillStyle = color; ellipse(ctx, 26, -4, 14, 18);
  // Cabeza (algo mayor → proporción de BEBÉ, para casar con el nuevo triceratops bebé amarillo)
  ctx.fillStyle = color; ellipse(ctx, 41, 1, 18, 15);
  // Pico
  ctx.beginPath(); ctx.moveTo(54, -1); ctx.lineTo(62, 4); ctx.lineTo(54, 10); ctx.closePath(); ctx.fill();
  // Cuernos: dos CORTOS de la frente + uno en el morro (bebé → cuernos pequeños)
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.moveTo(41, -10); ctx.lineTo(47, -10); ctx.lineTo(53, -20); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(34, -10); ctx.lineTo(40, -10); ctx.lineTo(43, -21); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(54, -3); ctx.lineTo(60, -3); ctx.lineTo(59, -11); ctx.closePath(); ctx.fill();
  // Ojo grande cartoon (bebé)
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(44, -1, 5.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(45, -1, 2.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(43.2, -2.1, 1.1, 0, Math.PI * 2); ctx.fill();
}

// --- Braquiosaurio: cuello larguísimo arriba, cabeza pequeña, cuadrúpedo --
function drawBrachio(ctx, color, dark) {
  ctx.fillStyle = color;
  // Cuerpo grande
  ellipse(ctx, -8, 10, 30, 22);
  // Cola larga hacia abajo-izquierda
  ctx.beginPath(); ctx.moveTo(-30, 6); ctx.quadraticCurveTo(-52, 14, -60, 30); ctx.quadraticCurveTo(-44, 18, -28, 16); ctx.closePath(); ctx.fill();
  // Cuello larguísimo hacia arriba-derecha (rasgo distintivo)
  ctx.beginPath();
  ctx.moveTo(8, -4); ctx.quadraticCurveTo(20, -36, 30, -54);
  ctx.quadraticCurveTo(40, -50, 34, -44); ctx.quadraticCurveTo(24, -26, 22, 4); ctx.closePath(); ctx.fill();
  // Cabeza pequeña arriba
  ellipse(ctx, 34, -56, 9, 7, -0.3);
  ctx.beginPath(); ctx.moveTo(40, -58); ctx.lineTo(48, -56); ctx.lineTo(40, -52); ctx.closePath(); ctx.fill();
  // Cuatro patas columna
  for (const x of [-24, -10, 6, 18]) ctx.fillRect(x, 26, 10, 20);
  ctx.fillStyle = dark; for (const x of [-25, -11, 5, 17]) ctx.fillRect(x, 44, 13, 5);
  eye(ctx, 35, -57, dark);
}
