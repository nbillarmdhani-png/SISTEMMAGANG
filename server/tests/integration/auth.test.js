/**
 * Integration tests – Auth module (T-25)
 *
 * CATATAN: Tes ini menggunakan supertest + server nyata.
 * Memerlukan database test yang bersih atau mock Prisma.
 * Jalankan: npx vitest run tests/integration/auth.test.js
 *
 * Saat CI: set DATABASE_URL=test DB di .env.test
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';

// ── Mock Prisma agar test tidak butuh DB nyata ─────────────────────────────────
vi.mock('../../src/config/prisma.js', () => ({
  default: {
    users: { findUnique: vi.fn() },
    program_studi: { findUnique: vi.fn() },
    $disconnect: vi.fn(),
    $transaction: vi.fn((cb) => cb({
      users: { create: vi.fn().mockResolvedValue({ id: 1, email: 'mahasiswa.test@example.com', role: 'mahasiswa' }) },
      mahasiswa: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    })),
  },
}));

// Real bcrypt is used instead of mock

import bcrypt from 'bcrypt';
import prisma from '../../src/config/prisma.js';
import app from '../../src/app.js';

const VALID_REGISTER = {
  email: 'mahasiswa.test@example.com',
  password: 'Password123!',
  nama_lengkap: 'Test Mahasiswa',
  nim: '12345678',
  prodi_id: 1,
  semester: 3,
  ipk: 3.5,
};

describe('POST /api/auth/register', () => {
  it('201: registrasi berhasil dengan data valid', async () => {
    prisma.program_studi.findUnique.mockResolvedValueOnce({ id: 1, nama_prodi: 'Informatika' });

    const res = await request(app).post('/api/auth/register').send(VALID_REGISTER);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('409: email sudah terdaftar', async () => {
    prisma.$transaction.mockImplementationOnce(async () => {
      const err = new Error();
      err.code = 'P2002';
      throw err;
    });

    const res = await request(app).post('/api/auth/register').send(VALID_REGISTER);
    expect(res.status).toBe(409);
  });

  it('400: body tidak valid (email salah format)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER, email: 'bukan_email' });
    expect(res.status).toBe(400);
  });

  it('400: password kurang dari 6 karakter', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_REGISTER, password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('200: login berhasil, mendapat token', async () => {
    const hashedPw = await bcrypt.hash('Password123!', 10);
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 1,
      email: 'mahasiswa.test@example.com',
      password: hashedPw,
      role: 'mahasiswa',
      is_active: 1,
      mahasiswa: { nama_lengkap: 'Test', nim: '12345678', semester: 3, ipk: 3.5 },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mahasiswa.test@example.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/token=/);
  });

  it('401: password salah', async () => {
    prisma.users.findUnique.mockResolvedValueOnce({
      id: 1,
      email: 'mahasiswa.test@example.com',
      password: '$2b$10$fakehash',
      role: 'mahasiswa',
      is_active: 1,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mahasiswa.test@example.com', password: 'salah' });
    expect(res.status).toBe(401);
  });

  it('401: email tidak terdaftar', async () => {
    prisma.users.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tidakada@example.com', password: 'Password123!' });
    expect(res.status).toBe(401);
  });

  it('400: body kosong', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('401: tanpa token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('401: token tidak valid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
