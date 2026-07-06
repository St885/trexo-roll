/* Fondo jurásico procedural en #bg (nítido a cualquier DPR) + miniaturas de bola en .kit-thumb. */
function leaf(ctx, x, y, len, ang, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.32, -len * 0.18, len, 0);
  ctx.quadraticCurveTo(len * 0.32, len * 0.18, 0, 0); ctx.fill();
  ctx.restore();
}
function treeline(ctx, W, H, yy, col, n) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
  for (let i = 0; i <= n; i++) { const x = (i / n) * W; const r = H * (0.05 + 0.04 * ((i * 37) % 5) / 5); ctx.lineTo(x, yy - r); ctx.arc(x, yy - r, r, Math.PI, 0); }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}
function paintBg() {
  const c = document.getElementById('bg'); if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth, H = window.innerHeight;
  c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
  c.style.width = W + 'px'; c.style.height = H + 'px';
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  KIT.sky(ctx, W, H);
  // Treeline distante (da profundidad sin saturar)
  treeline(ctx, W, H, H * 0.5, 'rgba(11,34,22,0.5)', 9);
  treeline(ctx, W, H, H * 0.62, 'rgba(8,26,16,0.7)', 7);
  // Dosel superior: grandes hojas oscuras colgando de las esquinas (enmarca)
  for (let i = 0; i < 5; i++) leaf(ctx, W * (0.02 + i * 0.05), -H * 0.01, H * (0.16 + i * 0.02), 0.7 + i * 0.12, 'rgba(7,22,14,0.9)');
  for (let i = 0; i < 5; i++) leaf(ctx, W * (0.98 - i * 0.05), -H * 0.01, H * (0.16 + i * 0.02), Math.PI - 0.7 - i * 0.12, 'rgba(7,22,14,0.9)');
  // Jungla inferior (palmeras + helechos)
  KIT.jungle(ctx, W, H, { spores: 34, tall: 0.45 });
  // Glow cálido tras el centro (foco del panel)
  const gg = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(W, H) * 0.6);
  gg.addColorStop(0, 'rgba(255,228,160,0.14)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
  // overlay SUAVE para legibilidad (deja ver la escena)
  ctx.fillStyle = 'rgba(9,27,18,0.2)'; ctx.fillRect(0, 0, W, H);
  KIT.vignette(ctx, W, H, 0.5);
}
function paintThumbs() {
  const dpr = window.devicePixelRatio || 1;
  document.querySelectorAll('.kit-thumb').forEach((cv) => {
    const s = parseInt(cv.dataset.size || '96', 10);
    cv.width = Math.round(s * dpr); cv.height = Math.round(s * dpr);
    cv.style.width = s + 'px'; cv.style.height = s + 'px';
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, s, s);
    KIT.dinoBall(ctx, s / 2, s / 2 - s * 0.04, s * 0.42);
    const tint = cv.dataset.tint;
    if (tint) {
      ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.5; ctx.fillStyle = tint;
      ctx.beginPath(); ctx.arc(s / 2, s / 2 - s * 0.04, s * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  });
}
paintBg(); paintThumbs(); document.title = 'READY';
