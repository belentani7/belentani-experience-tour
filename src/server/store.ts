import fs from 'node:fs';
import path from 'node:path';
import type { Asset } from '../types';
import { findProjectRoot } from './paths';

/**
 * Append-only store of daily-generated assets (one JSON object per line).
 * This module only ever READS it — writing is the job of generator/daily.py.
 */

export function resolveStorePath(): string | null {
  const override = process.env.BELENTANI_STORE;
  const candidates = [
    override,
    path.join(process.cwd(), 'data', 'generated.jsonl'),
    path.join(findProjectRoot(), 'data', 'generated.jsonl'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Read every valid entry. Corrupt lines are skipped, never deleted. */
export function loadGenerated(): Asset[] {
  const storePath = resolveStorePath();
  if (!storePath) return [];

  let raw: string;
  try {
    raw = fs.readFileSync(storePath, 'utf8');
  } catch {
    return [];
  }

  // Last occurrence wins, so a forced regeneration supersedes the old line
  // without anything ever being deleted from the file.
  const byId = new Map<string, Asset>();
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Asset;
      if (!parsed || typeof parsed.id !== 'string') continue;
      byId.set(parsed.id, parsed);
    } catch {
      // Malformed line: ignore on read. The store stays append-only.
      continue;
    }
  }
  return Array.from(byId.values());
}

/** True when an asset with the given seed already exists in the store. */
export function hasSeed(seed: number): boolean {
  return loadGenerated().some((asset) => asset.seed === seed);
}
