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
  const { stdout } = await execFileAsync('openclaw', [
    'agent', '--agent', 'main', '--session-key', `agent:main:faro-${incident.incidencia_id}`,
    '--model', 'openai/gpt-5.6-terra', '--thinking', 'medium', '--message', prompt, '--json'
  ], { cwd: new URL('.', import.meta.url).pathname, timeout: 120000, maxBuffer: 1024 * 1024 });
  const outer = JSON.parse(stdout.slice(stdout.indexOf('{')));
  const text = outer.result.payloads?.[0]?.text;
  return JSON.parse(text);
}
