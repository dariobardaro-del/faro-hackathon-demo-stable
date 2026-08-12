import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processIncident } from './faro-runtime.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const send = (res, status, body, type='application/json; charset=utf-8') => { res.writeHead(status, {'Content-Type':type, 'Cache-Control':'no-store, no-cache, must-revalidate'}); res.end(body); };

http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/incidents') {
      let raw=''; for await (const chunk of req) raw += chunk;
      const input = JSON.parse(raw);
      if (!input.titulo || !input.detalle || !input.zona) return send(res, 400, JSON.stringify({error:'Faltan datos de la incidencia'}));
      const requestedId = String(input.incidencia_id || '');
      const incident = { incidencia_id:/^INC-10[123]$/.test(requestedId) ? requestedId : `INC-LIVE-${Date.now().toString().slice(-5)}`, titulo:String(input.titulo).slice(0,160), detalle:String(input.detalle).slice(0,600), origen:'simulador de demo', zona:String(input.zona).slice(0,60) };
      return send(res, 200, JSON.stringify(await processIncident(incident)));
    }
    const pathname = req.url === '/' ? '/index.html' : req.url;
    const target = path.resolve(root, '.' + pathname);
    if (!target.startsWith(root)) return send(res, 403, 'Prohibido', 'text/plain');
    return send(res, 200, await readFile(target), types[path.extname(target)] || 'application/octet-stream');
  } catch (error) { return send(res, 500, JSON.stringify({error:'FARO no pudo procesar la incidencia', detail:error.message})); }
}).listen(4173, '0.0.0.0', () => console.log('FARO: http://0.0.0.0:4173'));
