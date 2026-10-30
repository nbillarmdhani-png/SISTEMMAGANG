/**
 * Integration tests – Positions module (T-50)
 * Test: filter lowongan (q, kota, is_remote, status)
 *       kompetensi ganda tidak duplikat
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma ────────────────────────────────────────────────────────────────
vi.mock('../../src/config/prisma.js', () => ({
  default: {
    users: { findUnique: vi.fn() },
    lowongan_magang: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn() },
    $disconnect: vi.fn(),
  },
}));

import prisma from '../../src/config/prisma.js';
import app from '../../src/app.js';
import { env } from '../../src/config/env.js';

function makeToken(role = 'mahasiswa', userId = 1) {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '1h' });
}

function mockUser(userId = 1, role = 'mahasiswa') {
  prisma.users.findUnique.mockResolvedValueOnce({
    id: userId, role, is_active: 1, email: 'user@example.com',
  });
}

const SAMPLE_POSITIONS = [
  {
    id: 1,
    judul_posisi: 'Frontend Developer Intern',
    status: 'aktif',
    is_remote: 1,
    perusahaan: { id: 10, nama_perusahaan: 'PT Alpha', kota: 'Jakarta', is_verified: 1 },
    lowongan_kompetensi: [{ id: 1, kompetensi_id: 5, bobot: 1, wajib: 1 }],
  },
  {
    id: 2,
    judul_posisi: 'Backend Engineer Intern',
    status: 'aktif',
    is_remote: 0,
    perusahaan: { id: 11, nama_perusahaan: 'PT Beta', kota: 'Bandung', is_verified: 0 },
    lowongan_kompetensi: [
      { id: 2, kompetensi_id: 6, bobot: 2, wajib: 0 },
      { id: 3, kompetensi_id: 7, bobot: 1, wajib: 1 },
    ],
  },
];

describe('GET /api/positions (T-50)', () => {
  it('200: endpoint dapat diakses', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findMany.mockResolvedValueOnce(SAMPLE_POSITIONS);
    prisma.lowongan_magang.count.mockResolvedValueOnce(2);

    const res = await request(app).get('/api/positions').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('200: filter by q (pencarian judul posisi)', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findMany.mockResolvedValueOnce([SAMPLE_POSITIONS[0]]);
    prisma.lowongan_magang.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/positions?q=Frontend').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('200: filter by is_remote=true hanya mengembalikan posisi remote', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findMany.mockResolvedValueOnce([SAMPLE_POSITIONS[0]]);
    prisma.lowongan_magang.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/positions?is_remote=true').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    // Verifikasi bahwa Prisma dipanggil dengan filter is_remote
    expect(prisma.lowongan_magang.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ is_remote: true }),
      })
    );
  });

  it('200: filter by kota', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findMany.mockResolvedValueOnce([SAMPLE_POSITIONS[1]]);
    prisma.lowongan_magang.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/positions?kota=Bandung').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('200: paginasi bekerja (limit, page)', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findMany.mockResolvedValueOnce([SAMPLE_POSITIONS[0]]);
    prisma.lowongan_magang.count.mockResolvedValueOnce(10);

    const res = await request(app).get('/api/positions?page=1&limit=1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.totalPages).toBe(10);
  });
});

describe('GET /api/positions/:id (T-50)', () => {
  it('200: mengembalikan detail posisi termasuk kompetensi', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce({
      ...SAMPLE_POSITIONS[1],
      perusahaan: SAMPLE_POSITIONS[1].perusahaan,
    });

    const res = await request(app).get('/api/positions/2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.lowongan_kompetensi).toBeDefined();
    // Verifikasi tidak ada duplikat kompetensi
    const ids = res.body.data.lowongan_kompetensi.map((lk) => lk.kompetensi_id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('404: posisi tidak ditemukan', async () => {
    const token = makeToken();
    mockUser(1);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/positions/9999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
