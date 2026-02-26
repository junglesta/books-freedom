import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import booksRouter from './routes/books';
import scanRouter from './routes/scan';
import exportRouter from './routes/export';

const app = new Hono();

app.use('/api/*', cors());

// API routes
app.route('/api/books', booksRouter);
app.route('/api/scan', scanRouter);
app.route('/api/export', exportRouter);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// In production, serve the built Svelte SPA
if (process.env.NODE_ENV === 'production') {
  const clientDir = join(import.meta.dir, '../../dist/client');

  app.use('/*', serveStatic({ root: clientDir }));
  // SPA fallback
  app.get('*', serveStatic({ root: clientDir, path: '/index.html' }));
}

const port = parseInt(process.env.PORT || '3000', 10);

// Load TLS certs if available
const certDir = join(import.meta.dir, '../../certs');
const hasCerts = existsSync(join(certDir, 'cert.pem')) && existsSync(join(certDir, 'key.pem'));

const tls = hasCerts
  ? {
      cert: readFileSync(join(certDir, 'cert.pem')),
      key: readFileSync(join(certDir, 'key.pem')),
    }
  : undefined;

const protocol = tls ? 'https' : 'http';
console.log(`Bukubuku running on ${protocol}://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
  tls,
};
