import fs from 'node:fs';
import path from 'node:path';

/**
 * Locate the project root without relying on __dirname (which does not exist
 * when the server runs as ESM under tsx). Walks up from the current working
 * directory looking for the package.json + generator/ pair.
 */
export function findProjectRoot(): string {
  let dir = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    if (
      fs.existsSync(path.join(dir, 'package.json')) &&
      fs.existsSync(path.join(dir, 'generator', 'daily.py'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}
