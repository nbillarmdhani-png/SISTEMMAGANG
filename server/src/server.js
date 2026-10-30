import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initCronJobs } from './utils/cron.js';

const server = http.createServer(app);

const PORT = env.PORT;

server.listen(PORT, '0.0.0.0', () => {
  initCronJobs();
  console.log(`[SERVER] Mendengarkan di port ${PORT} (0.0.0.0:${PORT})`);
  console.log(`[ENV] Node Environment: ${env.NODE_ENV}`);
});

// Process level error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[SERVER CRITICAL] Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM diterima. Menutup server...');
  server.close(() => {
    console.log('[SERVER] Server ditutup.');
    process.exit(0);
  });
});
