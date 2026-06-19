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
    case 'triceratops': drawTriceratops(ctx, color, dark); break;
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
  // Cabeza
  ctx.fillStyle = color; ellipse(ctx, 40, 2, 16, 13);
  // Pico
  ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(60, 4); ctx.lineTo(52, 9); ctx.closePath(); ctx.fill();
  // Cuernos: dos largos de la frente + uno en el morro
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.moveTo(40, -8); ctx.lineTo(46, -8); ctx.lineTo(56, -22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(34, -8); ctx.lineTo(40, -8); ctx.lineTo(44, -24); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(52, -2); ctx.lineTo(58, -2); ctx.lineTo(58, -12); ctx.closePath(); ctx.fill();
  eye(ctx, 42, -2, dark);
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
