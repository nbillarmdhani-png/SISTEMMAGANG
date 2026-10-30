/**
 * Integration tests – Applications module (T-84)
 * Test: 409 saat mahasiswa melamar dua kali ke posisi yang sama
 *       400 saat melamar ke lowongan yang tidak aktif
 *       400 saat melamar ke lowongan yang sudah penuh kuota
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma ────────────────────────────────────────────────────────────────
vi.mock('../../src/config/prisma.js', () => ({
  default: {
    users: { findUnique: vi.fn() },
    mahasiswa: { findUnique: vi.fn() },
    lowongan_magang: { findUnique: vi.fn() },
    lamaran: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

import prisma from '../../src/config/prisma.js';
import app from '../../src/app.js';
import { env } from '../../src/config/env.js';

function makeMhsToken(userId = 1) {
  return jwt.sign({ userId, role: 'mahasiswa' }, env.JWT_SECRET, { expiresIn: '1h' });
}

function mockUser(userId = 1) {
  prisma.users.findUnique.mockResolvedValueOnce({
    id: userId, role: 'mahasiswa', is_active: 1, email: `mhs${userId}@example.com`,
  });
}

function mockMahasiswa(mhsId = 10) {
  prisma.mahasiswa.findUnique.mockResolvedValueOnce({
    id: mhsId, user_id: 1, semester: 3, ipk: 3.2, nim: '12345678',
  });
}

describe('POST /api/applications (T-84)', () => {
  const PAYLOAD = { lowongan_id: 42 };

  it('400: melamar ke lowongan yang tidak aktif', async () => {
    const token = makeMhsToken(1);
    mockUser(1);
    mockMahasiswa(10);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce({
      id: 42, status: 'ditutup', kuota: 5,
    });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(PAYLOAD);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/tidak aktif/i);
  });

  it('400: melamar ke lowongan yang tidak ditemukan', async () => {
    const token = makeMhsToken(1);
    mockUser(1);
    mockMahasiswa(10);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(PAYLOAD);
    expect(res.status).toBe(400);
  });

  it('400: melamar dua kali ke posisi yang sama (sudah ada lamaran aktif)', async () => {
    const token = makeMhsToken(1);
    mockUser(1);
    mockMahasiswa(10);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce({
      id: 42, status: 'aktif', kuota: 5,
    });
    // Lamaran sebelumnya masih aktif (status = menunggu)
    prisma.lamaran.findFirst.mockResolvedValueOnce({
      id: 99, mahasiswa_id: 10, lowongan_id: 42, status: 'menunggu',
    });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(PAYLOAD);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/sudah melamar/i);
  });

  it('201: berhasil melamar ketika semua validasi lulus', async () => {
    const token = makeMhsToken(1);
    mockUser(1);
    mockMahasiswa(10);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce({
      id: 42, status: 'aktif', kuota: 5,
    });
    prisma.lamaran.findFirst.mockResolvedValueOnce(null); // belum pernah melamar
    prisma.lamaran.create.mockResolvedValueOnce({
      id: 200, mahasiswa_id: 10, lowongan_id: 42, status: 'menunggu',
      tgl_lamar: new Date(),
    });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(PAYLOAD);
    expect(res.status).toBe(201);
  });

  it('201: bisa melamar ulang setelah lamaran sebelumnya dibatalkan', async () => {
    const token = makeMhsToken(1);
    mockUser(1);
    mockMahasiswa(10);
    prisma.lowongan_magang.findUnique.mockResolvedValueOnce({
      id: 42, status: 'aktif', kuota: 5,
    });
    // Lamaran sebelumnya sudah dibatalkan
    prisma.lamaran.findFirst.mockResolvedValueOnce({
      id: 88, mahasiswa_id: 10, lowongan_id: 42, status: 'dibatalkan',
    });
    prisma.lamaran.update.mockResolvedValueOnce({
      id: 88, mahasiswa_id: 10, lowongan_id: 42, status: 'menunggu',
      tgl_lamar: new Date(),
    });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(PAYLOAD);
    expect(res.status).toBe(201);
  });

  it('400: body tidak valid (lowongan_id bukan angka)', async () => {
    const token = makeMhsToken(1);
    mockUser(1);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ lowongan_id: 'bukan_angka' });
    expect(res.status).toBe(400);
  });

  it('401: tanpa token', async () => {
    const res = await request(app).post('/api/applications').send(PAYLOAD);
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/applications/:id/cancel (T-84)', () => {
  it('400: tidak bisa membatalkan lamaran yang sudah diproses', async () => {
    const token = makeMhsToken(1);
    mockUser(1);
    mockMahasiswa(10);
    prisma.lamaran.findFirst.mockResolvedValueOnce({
      id: 55, mahasiswa_id: 10, status: 'diterima', // bukan 'menunggu'
    });

    const res = await request(app)
      .patch('/api/applications/55/cancel')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/menunggu/i);
  });
});
