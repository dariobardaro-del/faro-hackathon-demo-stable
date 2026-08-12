import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';

const execFileAsync = promisify(execFile);
const here = new URL('.', import.meta.url);

export async function processIncident(incident) {
  const [instructions, context] = await Promise.all([
    readFile(new URL('./FARO_AGENT_PROMPT.md', here), 'utf8'),
    readFile(new URL('./data/festival-context.json', here), 'utf8')
  ]);
  const prompt = `${instructions}\n\nCONTEXTO SINTÉTICO:\n${context}\n\nINCIDENCIA A PROCESAR:\n${JSON.stringify(incident)}`;
  // OpenClaw runs in the Hostinger Docker container, not on the VPS host.
  // Keeping the container name configurable also makes local verification easy.
  const container = process.env.OPENCLAW_CONTAINER || 'openclaw-1ng3-openclaw-1';
  const { stdout } = await execFileAsync('docker', ['exec', container, 'openclaw',
    'agent', '--agent', 'main', '--session-key', `agent:main:faro-${incident.incidencia_id}`,
    '--model', 'openai/gpt-5.6-terra', '--thinking', 'medium', '--message', prompt, '--json'
  ], { cwd: new URL('.', import.meta.url).pathname, timeout: 120000, maxBuffer: 1024 * 1024 });
  const start = stdout.indexOf('{');
  if (start < 0) throw new Error('OpenClaw no devolvió una salida JSON verificable');
  const outer = JSON.parse(stdout.slice(start));
  const text = outer.result.payloads?.[0]?.text;
  if (!text) throw new Error('OpenClaw devolvió una respuesta vacía');
  const result = JSON.parse(text);
  if (result.incidencia_id !== incident.incidencia_id || result.requiere_aprobacion_humana !== true) throw new Error('La respuesta del agente no pasó la validación de identidad y aprobación humana');
  return result;
}
