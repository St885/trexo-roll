// _capture.mjs — Conduce el JUEGO REAL (window.__trexoroll) vía CDP y captura pantallas reales.
// Sirve el proyecto, lanza Edge headless con SwiftShader (WebGL por software) y emula viewport.
// Uso: node _capture.mjs <ROOT> <OUT> <EDGE_PATH>
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = process.argv[2];
const OUT = process.argv[3];
const EDGE = process.argv[4];
const PORT = 8155, RDP = 9224;
const TYPES = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg' };

// --- servidor estático ---
const server = http.createServer(async (q, s) => {
  let u = decodeURIComponent((q.url || '/').split('?')[0]); if (u === '/') u = '/index.html';
  try { const d = await readFile(join(ROOT, u)); s.writeHead(200, { 'content-type': TYPES[extname(u)] || 'application/octet-stream', 'cache-control': 'no-store' }); s.end(d); }
  catch { s.writeHead(404); s.end('404'); }
}).listen(PORT);

// --- progreso sembrado (sin datos personales) ---
const stars = {}; for (let i = 1; i <= 17; i++) stars[i] = (i % 5 === 0) ? 2 : 3;
const SAVE = { highScore: 2880, unlocked: 18, stars, bestTimes: {}, selectedBall: 'blanca', lastLevel: 7,
  starTokens: 7, extraLives: 1, trapBlocks: 2, fallShields: 1, livesBank: 2, sfxOn: true, musicOn: false,
  chestsOpened: 3, ownedSkins: ['classic'], activeSkin: 'classic', daily: { lastClaimDate: '', streak: 3 } };

const udd = join(os.tmpdir(), 'trexo_cap_' + Date.now());
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + RDP, '--user-data-dir=' + udd,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', '--mute-audio', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });

let ws, msgId = 0; const pending = new Map(); const evs = {};
function send(method, params = {}) { const id = ++msgId; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pending.set(id, { res, rej })); }
function on(method, fn) { (evs[method] = evs[method] || []).push(fn); }
async function cdpUrl() { for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://localhost:${RDP}/json`); const t = await r.json(); const pg = t.find(x => x.type === 'page'); if (pg && pg.webSocketDebuggerUrl) return pg.webSocketDebuggerUrl; } catch {} await sleep(250); } throw new Error('CDP no disponible'); }
async function evaluate(expression) { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; }
async function navigate(url) { const done = new Promise(r => on('Page.loadEventFired', () => r())); await send('Page.navigate', { url }); await Promise.race([done, sleep(8000)]); await sleep(400); }
async function metrics(w, h, dsf, mobile) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dsf, mobile: !!mobile, screenWidth: w, screenHeight: h }); if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); }
async function shot(name) { const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false }); await writeFile(join(OUT, name), Buffer.from(data, 'base64')); }

(async () => {
  try {
    ws = new WebSocket(await cdpUrl());
    await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
    ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } else if (m.method) (evs[m.method] || []).forEach(fn => fn(m.params)); });
    await send('Page.enable'); await send('Runtime.enable');

    // 1) primer load → sembrar storage → recargar
    await navigate(`http://localhost:${PORT}/index.html`);
    await evaluate(`localStorage.setItem('trexoroll.save.v1', ${JSON.stringify(JSON.stringify(SAVE))}); localStorage.setItem('trexoroll.lang.v1','es'); 'ok'`);
    await navigate(`http://localhost:${PORT}/index.html`);
    await sleep(900);
    const booted = await evaluate(`!!window.__trexoroll`);
    const glok = await evaluate(`(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}})()`);
    console.log('BOOTED=' + booted + ' WEBGL=' + glok);
    if (!booted) throw new Error('el juego no arrancó (__trexoroll ausente)');

    const PUI = [540, 960, 2, true];     // teléfono vertical UI → 1080x1920
    const PLAND = [1920, 1080, 1, true]; // teléfono horizontal gameplay → 1920x1080

    // menú
    await metrics(...PUI); await evaluate(`__trexoroll._showMenu(); 'ok'`); await sleep(700); await shot('phone-01-menu-real.png');
    // gameplay inicial (N1)
    await metrics(...PLAND); await evaluate(`__trexoroll._startRunAt(0); __trexoroll._startLevel(); 'ok'`); await sleep(1500); await shot('phone-02-gameplay-real.png');
    // trampas / hoyos rojos (N16, móviles)
    await evaluate(`__trexoroll._startRunAt(15); __trexoroll._startLevel(); 'ok'`); await sleep(1500); await shot('phone-03-traps-real.png');
    // monedas + estrella (N6)
    await evaluate(`__trexoroll._startRunAt(5); __trexoroll._startLevel(); 'ok'`); await sleep(1500); await shot('phone-04b-coins-real.png');
    // victoria (sobre N1, 3 estrellas)
    await metrics(...PUI); await evaluate(`__trexoroll._startRunAt(0); __trexoroll._startLevel(); __trexoroll.score=1740; __trexoroll._completeLevel(); 'ok'`); await sleep(900); await shot('phone-04-victory-real.png');
    // skins
    await evaluate(`__trexoroll._showSkins(); 'ok'`); await sleep(700); await shot('phone-05-skins-real.png');
    // niveles
    await evaluate(`__trexoroll._showLevels(); 'ok'`); await sleep(700); await shot('phone-06-levels-real.png');

    // ---- TABLET 7" ----
    const T7UI = [700, 1120, 2, true], T7L = [2048, 1280, 1, true];
    await metrics(...T7L); await evaluate(`__trexoroll._startRunAt(0); __trexoroll._startLevel(); 'ok'`); await sleep(1500); await shot('tablet7-01-gameplay-real.png');
    await metrics(...T7UI); await evaluate(`__trexoroll._showMenu(); 'ok'`); await sleep(700); await shot('tablet7-02-menu-real.png');
    await evaluate(`__trexoroll._startRunAt(0); __trexoroll._startLevel(); __trexoroll.score=1740; __trexoroll._completeLevel(); 'ok'`); await sleep(900); await shot('tablet7-03-victory-real.png');
    await evaluate(`__trexoroll._showSkins(); 'ok'`); await sleep(700); await shot('tablet7-04-skins-real.png');

    // ---- TABLET 10" ----
    const T10UI = [800, 1280, 2, true], T10L = [2560, 1600, 1, true];
    await metrics(...T10L); await evaluate(`__trexoroll._startRunAt(0); __trexoroll._startLevel(); 'ok'`); await sleep(1500); await shot('tablet10-01-gameplay-real.png');
    await metrics(...T10UI); await evaluate(`__trexoroll._showMenu(); 'ok'`); await sleep(700); await shot('tablet10-02-menu-real.png');
    await evaluate(`__trexoroll._startRunAt(0); __trexoroll._startLevel(); __trexoroll.score=1740; __trexoroll._completeLevel(); 'ok'`); await sleep(900); await shot('tablet10-03-victory-real.png');
    await evaluate(`__trexoroll._showSkins(); 'ok'`); await sleep(700); await shot('tablet10-04-skins-real.png');

    console.log('CAPTURAS OK');
  } catch (e) { console.error('ERROR:', e.message); process.exitCode = 1; }
  finally { try { edge.kill(); } catch {} try { server.close(); } catch {} await sleep(300); process.exit(); }
})();
