/* kit.js — Brand kit procedural de TREXoRoll para los recursos de Play Store.
   TODO el arte se dibuja con Canvas 2D (original, sin imágenes de terceros). Paleta = juego. */
(function (global) {
  const PAL = {
    ink: '#06140d', jungle0: '#091b12', jungle1: '#102a1c', jungle2: '#18452c', jungle3: '#226039',
    amber: '#f2c14e', amber2: '#f4a261', amberDeep: '#b5791f',
    green: '#34d27b', greenDeep: '#1ea355', greenInk: '#06351c',
    red: '#f0584a', redDeep: '#6b1d16', orange: '#ff8a2a',
    cream: '#f6f1e3', bone: '#e7e1cd',
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- Fondo: cielo jurásico cálido (amanecer) + sol suave ----
  function sky(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0c2a1d');
    g.addColorStop(0.42, '#164630');
    g.addColorStop(0.7, '#2c6440');
    g.addColorStop(0.86, '#5c7e44');
    g.addColorStop(1, '#7d8a45');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Sol/halo cálido
    const sx = w * 0.74, sy = h * 0.3, sr = Math.max(w, h) * 0.42;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(0, 'rgba(255,228,160,0.55)');
    sg.addColorStop(0.3, 'rgba(247,210,140,0.22)');
    sg.addColorStop(1, 'rgba(247,210,140,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
    // Bruma horizontal
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(220,235,210,${0.05 + i * 0.015})`;
      ctx.beginPath();
      ctx.ellipse(w * (0.3 + i * 0.2), h * (0.45 + i * 0.08), w * 0.5, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Colinas lejanas
  function hills(ctx, w, h) {
    const base = h * 0.62;
    ctx.fillStyle = 'rgba(12,38,26,0.55)';
    ctx.beginPath(); ctx.moveTo(0, base);
    for (let x = 0; x <= w; x += w / 6) ctx.quadraticCurveTo(x + w / 12, base - h * 0.12, x + w / 6, base);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
  }

  // Helecho/hoja simple (silueta)
  function fern(ctx, x, y, len, ang, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(2, len * 0.03); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();
    const leaves = 7;
    for (let i = 1; i <= leaves; i++) {
      const t = i / leaves, ly = -len * t, ll = len * 0.34 * (1 - t * 0.7);
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(0, ly);
        ctx.quadraticCurveTo(s * ll * 0.6, ly - ll * 0.25, s * ll, ly - ll * 0.5);
        ctx.quadraticCurveTo(s * ll * 0.5, ly + ll * 0.1, 0, ly); ctx.fill();
      }
    }
    ctx.restore();
  }

  // Palmera/cica de fondo
  function palm(ctx, x, y, scale, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.strokeStyle = '#0b2417'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-12, -90, 6, -180); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = (-Math.PI / 2) + (i - 3) * 0.55;
      ctx.fillStyle = col;
      ctx.save(); ctx.translate(6, -180); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(60, -16, 150, 4); ctx.quadraticCurveTo(60, 14, 0, 0); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // Frondas de selva en primer plano (silueta a ambos lados)
  function jungle(ctx, w, h, opts = {}) {
    hills(ctx, w, h);
    const dark = '#0a2014';
    // izquierda
    palm(ctx, w * 0.06, h, 0.5 + (opts.tall || 0), dark);
    fern(ctx, w * 0.02, h * 1.02, h * 0.5, 0.15, '#0c2417');
    fern(ctx, w * 0.13, h * 1.04, h * 0.42, 0.05, '#0e2a1a');
    // derecha
    palm(ctx, w * 0.95, h, 0.55 + (opts.tall || 0), dark);
    fern(ctx, w * 0.985, h * 1.02, h * 0.52, -0.16, '#0c2417');
    fern(ctx, w * 0.9, h * 1.05, h * 0.4, -0.04, '#0e2a1a');
    // suelo
    const gg = ctx.createLinearGradient(0, h * 0.8, 0, h);
    gg.addColorStop(0, 'rgba(8,24,14,0)'); gg.addColorStop(1, 'rgba(6,18,11,0.85)');
    ctx.fillStyle = gg; ctx.fillRect(0, h * 0.8, w, h * 0.2);
    // esporas flotantes
    for (let i = 0; i < (opts.spores || 26); i++) {
      const sx = (i * 97.13 % w), sy = (i * 53.7 % (h * 0.7)) + h * 0.1, r = (i % 3) + 1.2;
      ctx.fillStyle = `rgba(255,238,180,${0.08 + (i % 4) * 0.04})`;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function vignette(ctx, w, h, strength = 0.5) {
    const g = ctx.createRadialGradient(w / 2, h * 0.46, Math.min(w, h) * 0.3, w / 2, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(4,14,9,${strength})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // ---- Bola-dino (esfera blanca brillante + cara de T-Rex amistosa) ----
  function dinoBall(ctx, x, y, r) {
    // sombra de contacto
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.96, r * 0.92, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // esfera
    const g = ctx.createRadialGradient(x - r * 0.34, y - r * 0.4, r * 0.15, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#f3efe2'); g.addColorStop(0.85, '#d9d2bf'); g.addColorStop(1, '#b9b29a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    // borde sutil
    ctx.lineWidth = r * 0.045; ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(x, y, r * 0.98, 0, Math.PI * 2); ctx.stroke();
    // cara T-Rex (clip a la esfera)
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    // hocico
    ctx.fillStyle = '#bfe3b0';
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.34, r * 0.5, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    // boca/dientes
    ctx.fillStyle = '#2d3a26';
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.42, r * 0.4, r * 0.16, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * r * 0.16, y + r * 0.30); ctx.lineTo(x + i * r * 0.16 + r * 0.06, y + r * 0.42); ctx.lineTo(x + i * r * 0.16 - r * 0.06, y + r * 0.42); ctx.closePath(); ctx.fill(); }
    // ceja/cresta verde
    ctx.fillStyle = '#3fbf6e';
    ctx.beginPath(); ctx.ellipse(x, y - r * 0.18, r * 0.62, r * 0.4, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#34d27b';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * r * 0.2, y - r * 0.52); ctx.lineTo(x + s * r * 0.34, y - r * 0.74); ctx.lineTo(x + s * r * 0.46, y - r * 0.5); ctx.closePath(); ctx.fill(); }
    // ojos
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x + s * r * 0.30, y - r * 0.08, r * 0.18, r * 0.21, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#14210f'; ctx.beginPath(); ctx.arc(x + s * r * 0.34, y - r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + s * r * 0.31, y - r * 0.10, r * 0.035, 0, Math.PI * 2); ctx.fill();
    }
    // fosas nasales
    ctx.fillStyle = '#2d3a26';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * r * 0.12, y + r * 0.18, r * 0.04, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // brillo especular
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.36, y - r * 0.42, r * 0.18, r * 0.1, -0.5, 0, Math.PI * 2); ctx.fill();
  }

  // ---- Hoyos (meta verde / trampa roja / portal naranja) en perspectiva (elipse) ----
  function hole(ctx, x, y, rx, kind, t = 0) {
    const ry = rx * 0.5;
    const col = kind === 'goal' ? PAL.green : kind === 'portal' ? PAL.orange : PAL.red;
    // pozo oscuro
    const g = ctx.createRadialGradient(x, y, rx * 0.1, x, y, rx);
    g.addColorStop(0, '#02060400'); g.addColorStop(0.2, '#040a06'); g.addColorStop(1, '#0a1a10');
    ctx.fillStyle = '#06120b'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    // anillo brillante
    const pulse = 0.7 + 0.3 * Math.sin(t);
    ctx.lineWidth = rx * 0.16; ctx.strokeStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = rx * 0.9 * pulse;
    ctx.beginPath(); ctx.ellipse(x, y, rx * 1.02, ry * 1.02, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    if (kind === 'goal') { // banderín
      ctx.strokeStyle = '#0b2417'; ctx.lineWidth = rx * 0.08;
      ctx.beginPath(); ctx.moveTo(x, y - ry); ctx.lineTo(x, y - rx * 1.5); ctx.stroke();
      ctx.fillStyle = PAL.green; ctx.beginPath(); ctx.moveTo(x, y - rx * 1.5); ctx.lineTo(x + rx * 0.7, y - rx * 1.3); ctx.lineTo(x, y - rx * 1.05); ctx.closePath(); ctx.fill();
    }
  }

  function coin(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.7, r * 0.8, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffe89a'); g.addColorStop(0.6, '#f2c14e'); g.addColorStop(1, '#b5791f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 0.78, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.ellipse(x, y, r * 0.5, r * 0.66, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function star(ctx, x, y, r) {
    ctx.save(); ctx.translate(x, y);
    ctx.shadowColor = PAL.amber; ctx.shadowBlur = r * 1.2;
    ctx.fillStyle = PAL.amber; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2; const rad = i % 2 ? r * 0.45 : r; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rad, Math.sin(a) * rad); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // ---- Tablero 2.5D inclinado con hoyos/monedas/bola ----
  // opts: { cx, cy, halfW, depth, tiltDeg, holes:[{u,row,kind}], coins:[{u,row}], star:{u,row},
  //         ball:{u,row}, surface:'#..' }
  function board(ctx, w, h, opts) {
    const cx = opts.cx, cy = opts.cy, HW = opts.halfW, DEP = opts.depth;
    const TOPY = cy - DEP / 2, THICK = HW * 0.13;
    const tilt = (opts.tiltDeg || 0) * Math.PI / 180;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.translate(-cx, -cy);

    const P = (u, row) => { const rs = lerp(0.66, 1.0, row); return [cx + u * HW * rs, TOPY + row * DEP]; };
    const surf = opts.surface || '#5f8a52';

    // sombra al suelo
    ctx.fillStyle = 'rgba(0,0,0,0.33)';
    ctx.beginPath(); ctx.ellipse(cx, TOPY + DEP + THICK * 1.4, HW * 1.06, HW * 0.34, 0, 0, Math.PI * 2); ctx.fill();

    const outline = (off) => {
      const c0 = P(-1, 0), c1 = P(1, 0), c2 = P(1, 1), c3 = P(-1, 1);
      ctx.beginPath();
      ctx.moveTo(c0[0], c0[1] + off); ctx.lineTo(c1[0], c1[1] + off);
      ctx.lineTo(c2[0], c2[1] + off); ctx.lineTo(c3[0], c3[1] + off); ctx.closePath();
    };
    // canto (extrude)
    ctx.fillStyle = '#274b30'; outline(THICK); ctx.fill();
    const c2 = P(1, 1), c3 = P(-1, 1), c2t = P(1, 1), c3t = P(-1, 1);
    ctx.fillStyle = '#1d3a25';
    ctx.beginPath(); ctx.moveTo(c3t[0], c3t[1]); ctx.lineTo(c2t[0], c2t[1]); ctx.lineTo(c2[0], c2[1] + THICK); ctx.lineTo(c3[0], c3[1] + THICK); ctx.closePath(); ctx.fill();

    // cara superior
    const tg = ctx.createLinearGradient(0, TOPY, 0, TOPY + DEP);
    tg.addColorStop(0, shade(surf, -18)); tg.addColorStop(0.5, surf); tg.addColorStop(1, shade(surf, 12));
    ctx.fillStyle = tg; outline(0); ctx.fill();
    // textura sutil (parches)
    ctx.save(); outline(0); ctx.clip();
    for (let i = 0; i < 40; i++) {
      const u = ((i * 0.137) % 2) - 1, row = (i * 0.071) % 1; const [px, py] = P(u, row);
      ctx.fillStyle = `rgba(${i % 2 ? '40,80,45' : '120,150,90'},0.12)`;
      ctx.beginPath(); ctx.ellipse(px, py, HW * 0.06, HW * 0.03, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // borde dorado del tablero
    ctx.lineWidth = HW * 0.025; ctx.strokeStyle = 'rgba(242,193,78,0.55)'; outline(0); ctx.stroke();

    // helechos decorativos en esquinas del tablero
    for (const [u, row, a] of [[-0.92, 0.12, 0.2], [0.92, 0.12, -0.2]]) { const [px, py] = P(u, row); fern(ctx, px, py, HW * 0.4, a, 'rgba(20,60,32,0.85)'); }

    // elementos (ordenados por row para overlap correcto)
    const items = [];
    (opts.holes || []).forEach((o) => items.push({ ...o, type: 'hole' }));
    (opts.coins || []).forEach((o) => items.push({ ...o, type: 'coin' }));
    if (opts.star) items.push({ ...opts.star, type: 'star' });
    if (opts.ball) items.push({ ...opts.ball, type: 'ball' });
    items.sort((a, b) => a.row - b.row);
    for (const it of items) {
      const rs = lerp(0.66, 1.0, it.row); const [px, py] = P(it.u, it.row);
      if (it.type === 'hole') hole(ctx, px, py, HW * 0.16 * rs * (it.scale || 1), it.kind, it.t || 0);
      else if (it.type === 'coin') coin(ctx, px, py - HW * 0.05, HW * 0.07 * rs);
      else if (it.type === 'star') star(ctx, px, py - HW * 0.08, HW * 0.1 * rs);
      else if (it.type === 'ball') dinoBall(ctx, px, py - HW * 0.13 * rs, HW * 0.15 * rs);
    }
    ctx.restore();
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16); let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = clamp(r, 0, 255); g = clamp(g, 0, 255); b = clamp(b, 0, 255);
    return `rgb(${r},${g},${b})`;
  }

  global.KIT = { PAL, rr, sky, jungle, vignette, dinoBall, hole, coin, star, board, lerp };
})(window);
