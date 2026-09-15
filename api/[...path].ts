import { createApp } from '../src/server/app';

const app = createApp();

/**
 * Vercel catch-all for /api/*. Reconstructs the original request path so the
 * Express router matches, then delegates to it. Generation returns 501 on
 * serverless (it needs a local Python + filesystem).
 */
export default function handler(req: any, res: any) {
  const segments = req.query?.path;
  const rest = Array.isArray(segments) ? segments.join('/') : segments ?? '';
  const query =
    typeof req.url === 'string' && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  req.url = `/api/${rest}${query}`;
  return app(req, res);
}
