import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const T = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.json':'application/json' };
const ROOT = process.cwd();
const PORT = Number(process.argv[2] || 8131);
http.createServer(async (q, s) => {
  let u = decodeURIComponent((q.url || '/').split('?')[0]); if (u === '/') u = '/index.html';
  try { const d = await readFile(join(ROOT, u)); s.writeHead(200, { 'content-type': T[extname(u)] || 'application/octet-stream', 'cache-control': 'no-store, no-cache, must-revalidate', 'pragma': 'no-cache' }); s.end(d); }
  catch { s.writeHead(404); s.end('404'); }
}).listen(PORT, () => console.log('up ' + PORT));
