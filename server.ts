import {spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import express from 'express';
import {createServer as createViteServer} from 'vite';

const PORT = 3000;
const PYTHON_PORT = 8765;

function startPythonBackend() {
  const proc = spawn('python3', ['-m', 'backend.main'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PYTHON_PORT: String(PYTHON_PORT),
      PYTHONUNBUFFERED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
  proc.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });
  proc.on('exit', (code) => {
    console.error(`[server.ts] Python backend exited with code ${code}`);
  });

  const cleanup = () => {
    if (!proc.killed) {
      proc.kill('SIGTERM');
    }
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  return proc;
}

async function waitForPythonBackend(timeoutMs = 8000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ok = await new Promise<boolean>((resolve) => {
      const req = http.get(`http://127.0.0.1:${PYTHON_PORT}/api/health`, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(400, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) {
      return;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Python backend did not become ready in time.');
}

async function bootstrap() {
  startPythonBackend();
  await waitForPythonBackend();

  const app = express();

  app.use('/api', (req, res) => {
    const targetPath = req.originalUrl;
    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: PYTHON_PORT,
        path: targetPath,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${PYTHON_PORT}`,
        },
      },
      (proxyRes) => {
        res.status(proxyRes.statusCode ?? 502);
        for (const [key, value] of Object.entries(proxyRes.headers)) {
          if (value !== undefined) {
            res.setHeader(key, value);
          }
        }
        proxyRes.pipe(res);
      },
    );

    proxyReq.on('error', (err) => {
      console.error('[server.ts] Python proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({error: 'Python backend unavailable'});
      }
    });

    req.pipe(proxyReq);
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio running on http://0.0.0.0:${PORT} (API powered by Python on :${PYTHON_PORT})`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
