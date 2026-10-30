// src/config/env.js
// Validasi dan ekspor semua environment variable yang diperlukan
import 'dotenv/config';

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'LLM_API_KEY',
  'LLM_MODEL',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[env] Variabel lingkungan wajib tidak ditemukan: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  LLM_API_KEY: process.env.LLM_API_KEY,
  LLM_MODEL: process.env.LLM_MODEL,
};
