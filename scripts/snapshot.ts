import fs from 'node:fs';
import path from 'node:path';
import { ALL_ASSETS, activeCategories, categoryCounts, computeStats } from '../src/data/catalog';
import { loadGenerated } from '../src/server/store';

/**
 * Bakes the full catalog into static JSON so the app works on pure static
 * hosting (Cloudflare Pages) and as a fallback wherever /api is unavailable.
 * Run before `vite build`; Vite copies public/ into dist/.
 */
function main() {
  const assets = [...ALL_ASSETS, ...loadGenerated()];
  const counts = categoryCounts(assets);
  const out = path.join(process.cwd(), 'public');
  fs.mkdirSync(out, { recursive: true });

  const write = (name: string, data: unknown) =>
    fs.writeFileSync(path.join(out, name), JSON.stringify(data), 'utf8');

  write('catalog.json', assets);
  write('stats.json', computeStats(assets));
  write(
    'categories.json',
    activeCategories(assets).map((id) => ({ id, count: counts[id] ?? 0 })),
  );

  console.log(`[snapshot] wrote ${assets.length} assets to public/ (catalog, stats, categories)`);
}

main();
