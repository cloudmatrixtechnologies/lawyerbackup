import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync } from 'node:fs';
import { request } from 'node:http';
import { join } from 'node:path';

// Local config (NG_ALLOWED_HOSTS, API_URL) — real env vars take precedence
if (existsSync('.env')) process.loadEnvFile('.env');

const browserDistFolder = join(import.meta.dirname, '../browser');
const apiUrl = process.env['API_URL'] || 'http://127.0.0.1:8080';

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Forward /api/* to the Spring Boot bookings service (lawyer/lawyer).
 * Same origin for the browser, so the admin session cookie stays SameSite=Strict
 * and no CORS is needed.
 */
app.use('/api', (req, res) => {
  const target = new URL(req.originalUrl, apiUrl);
  const proxy = request(target, {
    method: req.method,
    headers: { ...req.headers, host: target.host, 'x-forwarded-for': req.ip || '' },
  }, (upstream) => {
    res.writeHead(upstream.statusCode || 502, upstream.headers);
    upstream.pipe(res);
  });
  proxy.on('error', () => {
    if (!res.headersSent) res.status(502).json({ error: 'Booking service is not available. Please call us instead.' });
  });
  req.pipe(proxy);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
