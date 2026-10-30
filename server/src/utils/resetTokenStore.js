// src/utils/resetTokenStore.js
// In-memory store untuk reset token (cukup untuk skala kecil/lokal)
// Untuk produksi, simpan di database dengan kolom expires_at

import { randomBytes } from 'crypto';

const tokens = new Map(); // Map<token, { userId, expiresAt }>

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 menit

export function createResetToken(userId) {
  // Hapus token lama milik user yang sama jika ada
  for (const [key, val] of tokens.entries()) {
    if (val.userId === userId) tokens.delete(key);
  }

  const token = randomBytes(32).toString('hex');
  tokens.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

export function verifyAndConsumeToken(token) {
  const entry = tokens.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tokens.delete(token);
    return null;
  }
  tokens.delete(token); // consume - single use
  return entry.userId;
}
