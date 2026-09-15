import fs from 'node:fs';
import path from 'node:path';

/**
 * Vercel catch-all for /api/* — deliberately self-contained (no relative
 * imports) because the project is ESM and Vercel resolves bare relative
 * specifiers without extensions at runtime. It serves the build-time snapshot
 * (public/catalog.json) that `npm run snapshot` writes.
 *
 * Generation is NOT available here: it needs a local Python + filesystem.
 */

interface Asset {
  id: string;
  title: string;
  category: string;
  description: string;
  source: string;
  code: string;
  author?: string;
  url?: string;
  tags?: string[];
  kind?: string;
  featured?: boolean;
  seed?: number;
}

const CANDIDATES = [
  path.join(process.cwd(), 'public', 'catalog.json'),
  path.join(process.cwd(), 'catalog.json'),
  path.join(process.cwd(), 'dist', 'catalog.json'),
];

let cached: Asset[] | null = null;

function loadAssets(): Asset[] {
  if (cached) return cached;
  for (const candidate of CANDIDATES) {
    try {
      if (!fs.existsSync(candidate)) continue;
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8')) as Asset[];
      cached = parsed;
      return parsed;
    } catch {
      // try the next candidate
    }
  }
  cached = [];
  return cached;
}

function sortAssets(assets: Asset[], sort: string): Asset[] {
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
    default:
      return list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

function filterAssets(assets: Asset[], params: URLSearchParams): Asset[] {
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const category = (params.get('category') ?? '').trim();
  const author = (params.get('author') ?? '').trim();
  const kind = (params.get('kind') ?? '').trim();
  const sort = params.get('sort') ?? 'featured';

  const filtered = assets.filter((asset) => {
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

const ORDER = [
  'Daily',
  'Heroes',
  'Pricing',
  'Buttons',
  'Testimonials',
  'Navigation',
  'AI & Auth',
  'Backgrounds & Shaders',
  'Data & Dashboards',
  'Typography & Motion',
  'Sections & Cards',
  'Libraries',
  'UI Components',
];

export default function handler(req: any, res: any) {
  const segments = req.query?.path;
  const rest = Array.isArray(segments) ? segments.join('/') : segments ?? '';
  const url: string = typeof req.url === 'string' ? req.url : '';
  const qIndex = url.indexOf('?');
  const params = new URLSearchParams(qIndex >= 0 ? url.slice(qIndex + 1) : '');
  const assets = loadAssets();

  res.setHeader('content-type', 'application/json; charset=utf-8');

  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.end(JSON.stringify(body));
  };

  if (rest === 'stats') {
    send(200, {
      total: assets.length,
      components: assets.filter((a) => a.kind === 'component').length,
      libraries: assets.filter((a) => a.kind === 'library').length,
      featured: assets.filter((a) => a.featured).length,
      generated: assets.filter((a) => a.kind === 'generated').length,
      authors: new Set(assets.map((a) => a.author).filter(Boolean)).size,
    });
    return;
  }

  if (rest === 'categories') {
    const counts: Record<string, number> = {};
    for (const asset of assets) counts[asset.category] = (counts[asset.category] ?? 0) + 1;
    const ordered = [
      ...ORDER.filter((c) => counts[c] > 0),
      ...Object.keys(counts).filter((c) => !ORDER.includes(c)),
    ];
    send(200, ordered.map((id) => ({ id, count: counts[id] })));
    return;
  }

  if (rest === 'generate') {
    send(501, {
      ok: false,
      error: 'Generation is local-only: it runs generator/daily.py with Python on your machine.',
    });
    return;
  }

  if (rest === 'assets') {
    send(200, filterAssets(assets, params));
    return;
  }

  const detail = rest.match(/^assets\/(.+)$/);
  if (detail) {
    const asset = assets.find((a) => a.id === decodeURIComponent(detail[1]));
    if (asset) send(200, asset);
    else send(404, { error: 'Asset not found' });
    return;
  }

  send(404, { error: 'Not found' });
}
