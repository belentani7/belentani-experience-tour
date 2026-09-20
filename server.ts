import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp, getAllAssets } from './src/server/app';
import { ensureToday, todaySeed } from './src/server/generator';

async function startServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT ?? 3000);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Safety net: make sure today's asset exists even if the scheduler missed it.
    if (process.env.BELENTANI_AUTOGEN !== 'off') {
      ensureToday()
        .then(() => {
          const todays = getAllAssets().filter((a) => a.seed === todaySeed()).length;
          console.log(`[generator] today's asset present: ${todays > 0}`);
        })
        .catch(() => undefined);
    }
  });
}

startServer();
