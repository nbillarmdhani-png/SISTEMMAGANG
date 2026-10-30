import { z } from 'zod';

// ── Existing ────────────────────────────────────────────────────────────────

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['menunggu', 'diterima', 'ditolak', 'dibatalkan']),
  catatan_perusahaan: z.string().optional(),
});

export const updateUserStatusSchema = z.object({
  is_active: z.coerce.number().int().min(0).max(1),
});

// ── Companies ────────────────────────────────────────────────────────────────

export const companySchema = z.object({
  nama_perusahaan: z.string().min(2).max(150),
  bidang_usaha: z.string().max(100).optional(),
  deskripsi: z.string().optional(),
  alamat: z.string().optional(),
  kota: z.string().max(100).optional(),
  provinsi: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.string().max(255).optional(),
  email_kontak: z.string().email().optional().or(z.literal('')),
  no_telp: z.string().max(20).optional(),
  verified: z.coerce.number().int().min(0).max(1).optional(),
});

// ── Positions ─────────────────────────────────────────────────────────────────

const kompetensiItemSchema = z.object({
  kompetensi_id: z.coerce.number().int().positive(),
  bobot: z.coerce.number().min(0.01).max(9.99).default(1),
  is_wajib: z.coerce.number().int().min(0).max(1).default(0),
});

export const positionSchemaBase = z.object({
  perusahaan_id: z.coerce.number().int().positive(),
  judul_posisi: z.string().min(2).max(150),
  deskripsi: z.string().optional(),
  kuota: z.coerce.number().int().min(1),
  durasi_bulan: z.coerce.number().int().min(1).max(24),
  tgl_buka: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format YYYY-MM-DD'),
  tgl_tutup: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Format YYYY-MM-DD'),
  min_semester: z.coerce.number().int().min(1).max(14).optional().nullable(),
  min_ipk: z.coerce.number().min(0).max(4).optional().nullable(),
  is_remote: z.coerce.number().int().min(0).max(1).default(0),
  link_pendaftaran: z.string().url('URL tidak valid').optional().or(z.literal('')).nullable(),
  status: z.enum(['draft', 'aktif', 'ditutup']).default('draft'),
  kompetensi: z.array(kompetensiItemSchema).optional(),
});

export const positionSchema = positionSchemaBase.refine((d) => d.tgl_tutup >= d.tgl_buka, {
  message: 'tgl_tutup harus >= tgl_buka',
  path: ['tgl_tutup'],
});

export const updatePositionSchema = positionSchemaBase.partial().refine((d) => {
  if (d.tgl_buka && d.tgl_tutup) return d.tgl_tutup >= d.tgl_buka;
  return true;
}, {
  message: 'tgl_tutup harus >= tgl_buka',
  path: ['tgl_tutup'],
});

// ── Competencies ──────────────────────────────────────────────────────────────

export const competencySchema = z.object({
  kategori_id: z.coerce.number().int().positive(),
  nama_kompetensi: z.string().min(2).max(100),
  deskripsi: z.string().optional(),
  icon: z.string().max(100).optional(),
});

export const categorySchema = z.object({
  nama_kategori: z.string().min(2).max(100),
  deskripsi: z.string().optional(),
});

// ── Study Programs ────────────────────────────────────────────────────────────

export const studyProgramSchema = z.object({
  kode_prodi: z.string().min(1).max(10),
  nama_prodi: z.string().min(2).max(100),
  fakultas: z.string().min(2).max(100),
  jenjang: z.enum(['D3', 'S1', 'S2']).default('S1'),
});
