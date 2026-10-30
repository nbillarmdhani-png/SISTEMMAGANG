/**
 * Integration tests – Admin module (T-40)
 * Test: 403 saat mahasiswa akses /admin/*
 *       409 saat hapus kompetensi yang masih digunakan
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma ────────────────────────────────────────────────────────────────
vi.mock('../../src/config/prisma.js', () => ({
  default: {
    users: { findUnique: vi.fn() },
    kompetensi: { delete: vi.fn() },
    lowongan_kompetensi: { count: vi.fn() },
    mahasiswa: { findUnique: vi.fn() },
    $disconnect: vi.fn(),
  },
}));

import prisma from '../../src/config/prisma.js';
import app from '../../src/app.js';
import { env } from '../../src/config/env.js';

function makeToken(role = 'mahasiswa', userId = 1) {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Admin route access control (T-40)', () => {
  it('403: mahasiswa tidak bisa akses GET /api/admin/stats', async () => {
    const token = makeToken('mahasiswa', 1);
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 1, role: 'mahasiswa', is_active: 1, email: 'mhs@example.com',
    });

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('403: mahasiswa tidak bisa akses DELETE /api/admin/companies/:id', async () => {
    const token = makeToken('mahasiswa', 1);
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 1, role: 'mahasiswa', is_active: 1, email: 'mhs@example.com',
    });

    const res = await request(app)
      .delete('/api/admin/companies/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('403: mahasiswa tidak bisa akses GET /api/admin/users', async () => {
    const token = makeToken('mahasiswa', 1);
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 1, role: 'mahasiswa', is_active: 1, email: 'mhs@example.com',
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('401: tanpa token tidak bisa akses admin endpoints', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });
});

describe('Admin: hapus kompetensi yang masih digunakan (T-40 / T-409)', () => {
  it('409: tidak bisa hapus kompetensi yang masih dipakai lowongan', async () => {
    const token = makeToken('admin', 99);
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 99, role: 'admin', is_active: 1, email: 'admin@example.com',
    });
    prisma.lowongan_kompetensi.count.mockResolvedValueOnce(3); // masih digunakan

    const res = await request(app)
      .delete('/api/admin/competencies/5')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(409);
  });

  it('200: bisa hapus kompetensi jika tidak dipakai', async () => {
    const token = makeToken('admin', 99);
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 99, role: 'admin', is_active: 1, email: 'admin@example.com',
    });
    prisma.lowongan_kompetensi.count.mockResolvedValueOnce(0);
    prisma.kompetensi.delete.mockResolvedValueOnce({ id: 7, nama_kompetensi: 'Test' });

    const res = await request(app)
      .delete('/api/admin/competencies/7')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
