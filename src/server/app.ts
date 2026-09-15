import express from 'express';
import type { Asset } from '../types';
import { ALL_ASSETS, activeCategories, categoryCounts, computeStats } from '../data/catalog';
import { loadGenerated } from './store';
import { runGenerator } from './generator';

/** Static catalog + everything appended by the daily generator. */
export function getAllAssets(): Asset[] {
  return [...ALL_ASSETS, ...loadGenerated()];
}

type SortKey = 'featured' | 'newest' | 'title' | 'category' | 'author';

function sortAssets(assets: Asset[], sort: SortKey): Asset[] {
  const list = [...assets];
  switch (sort) {
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case 'category':
      return list.sort(
        (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
      );
    case 'author':
      return list.sort(
        (a, b) => (a.author ?? '~').localeCompare(b.author ?? '~') || a.title.localeCompare(b.title),
      );
    case 'newest':
      return list.sort((a, b) => (b.seed ?? 0) - (a.seed ?? 0));
    case 'featured':
    default:
      return list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

export function filterAssets(query: Record<string, unknown>): Asset[] {
  const q = String(query.q ?? '').trim().toLowerCase();
  const category = String(query.category ?? '').trim();
  const author = String(query.author ?? '').trim();
  const kind = String(query.kind ?? '').trim();
  const sort = (String(query.sort ?? 'featured') as SortKey) || 'featured';

  const filtered = getAllAssets().filter((asset) => {
    if (category && category !== 'All' && asset.category !== category) return false;
    if (author && asset.author !== author) return false;
    if (kind && asset.kind !== kind) return false;
    if (q) {
      const haystack = [
        asset.title,
        asset.description,
        asset.category,
        asset.source,
        asset.author ?? '',
        ...(asset.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return sortAssets(filtered, sort);
}

/**
 * API-only Express app (no frontend, no listen). Shared by the local server
 * (server.ts) and the Vercel serverless function (api/index.ts).
 */
export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.get('/api/assets', (req, res) => {
    res.json(filterAssets(req.query as Record<string, unknown>));
  });

  app.get('/api/assets/:id', (req, res) => {
    const asset = getAllAssets().find((a) => a.id === req.params.id);
    if (asset) {
      res.json(asset);
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  });

  app.get('/api/categories', (_req, res) => {
    const assets = getAllAssets();
    const counts = categoryCounts(assets);
    res.json(activeCategories(assets).map((id) => ({ id, count: counts[id] ?? 0 })));
  });

  app.get('/api/stats', (_req, res) => {
    res.json(computeStats(getAllAssets()));
  });

  // Generation requires a local filesystem + Python, so it only works when the
  // app runs locally. Hosted environments are a read-only showcase.
  app.post('/api/generate', async (req, res) => {
    if (process.env.VERCEL || process.env.CF_PAGES) {
      res.status(501).json({
        ok: false,
        error: 'Generation is local-only: it runs generator/daily.py with Python on your machine.',
      });
      return;
    }
    const days = Math.min(Math.max(Number(req.query.days ?? 1) || 1, 1), 31);
    const force = req.query.force === 'true';
    const args = days > 1 ? ['--days', String(days)] : [];
    if (force) args.push('--force');
    const result = await runGenerator(args);
    if (!result.ok) {
      res.status(500).json({ ok: false, error: result.error });
      return;
    }
    res.json({ ok: true, output: result.output, stats: computeStats(getAllAssets()) });
  });

  return app;
}
