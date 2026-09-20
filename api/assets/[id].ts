import fs from 'node:fs';
import path from 'node:path';

/**
 * GET /api/assets/:id — self-contained on purpose (see api/[...path].ts):
 * Vercel runs this project as ESM and cannot resolve extensionless relative
 * imports at runtime, so this route reads the build-time snapshot directly.
 */

const CANDIDATES = [
  path.join(process.cwd(), 'public', 'catalog.json'),
  path.join(process.cwd(), 'catalog.json'),
  path.join(process.cwd(), 'dist', 'catalog.json'),
];

interface Asset {
  id: string;
  [key: string]: unknown;
}

function loadAssets(): Asset[] {
  for (const candidate of CANDIDATES) {
    try {
      if (!fs.existsSync(candidate)) continue;
      return JSON.parse(fs.readFileSync(candidate, 'utf8')) as Asset[];
    } catch {
      // try the next candidate
    }
  }
  return [];
}

function getId(req: any): string {
  const param = req.query?.id;
  if (Array.isArray(param)) return String(param[0]);
  if (typeof param === 'string') return param;
  const raw: string = typeof req.url === 'string' ? req.url : '';
  const pathname = raw.split('?')[0] || '';
  const fromUrl = pathname.replace(/^\/api\/assets\/?/, '');
  try {
    return decodeURIComponent(fromUrl);
  } catch {
    return fromUrl;
  }
}

export default function handler(req: any, res: any) {
  const id = getId(req);
  const asset = loadAssets().find((a) => a.id === id);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  if (asset) {
    res.statusCode = 200;
    res.end(JSON.stringify(asset));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Asset not found' }));
  }
}
