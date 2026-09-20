import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { hasSeed } from './store';
import { findProjectRoot } from './paths';

const PYTHON_CANDIDATES = ['python', 'python3', 'py'];

function projectRoot(): string {
  return findProjectRoot();
}

export interface GenerateResult {
  ok: boolean;
  skipped?: boolean;
  output: string;
  error?: string;
}

export function todaySeed(): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`);
}

function run(executable: string, args: string[], cwd: string): Promise<GenerateResult> {
  return new Promise((resolve) => {
    execFile(executable, args, { cwd, windowsHide: true, timeout: 60_000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, output: stdout ?? '', error: stderr || error.message });
        return;
      }
      resolve({ ok: true, output: (stdout ?? '').trim() });
    });
  });
}

/** Run generator/daily.py with the given extra args. Tries a few Python names. */
export async function runGenerator(extraArgs: string[] = []): Promise<GenerateResult> {
  const root = projectRoot();
  const script = path.join(root, 'generator', 'daily.py');
  if (!fs.existsSync(script)) {
    return { ok: false, output: '', error: `generator not found at ${script}` };
  }

  let lastError = 'no python interpreter found';
  for (const executable of PYTHON_CANDIDATES) {
    const result = await run(executable, [script, ...extraArgs], root);
    if (result.ok) return result;
    lastError = result.error ?? lastError;
  }
  return { ok: false, output: '', error: lastError };
}

/**
 * Safety net: if today's asset is missing, generate it. Never throws —
 * a missing Python interpreter must not take the server down.
 */
export async function ensureToday(): Promise<void> {
  try {
    if (hasSeed(todaySeed())) return;
    const result = await runGenerator();
    if (result.ok) {
      console.log('[generator]', result.output.split('\n').pop());
    } else {
      console.warn('[generator] skipped:', result.error);
    }
  } catch (err) {
    console.warn('[generator] unexpected error:', err);
  }
}
