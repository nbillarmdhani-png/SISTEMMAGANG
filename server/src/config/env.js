// src/config/env.js
// Validasi dan ekspor semua environment variable yang diperlukan
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('[env] Peringatan: DATABASE_URL belum disetel.');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'MagangConnectSuperSecretKey2026!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || '',
  UPLOAD_DIR: process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : 'uploads'),
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-1.5-flash',
};
