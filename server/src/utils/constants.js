// src/utils/constants.js

// Pemetaan level kompetensi ke nilai numerik (untuk algoritma SAW)
export const LEVEL_NILAI = { pemula: 1, menengah: 2, mahir: 3 };
export const LEVEL_MAKS = 3;

// Mesin rekomendasi
export const TOP_N = 10;
export const FAKTOR_WAJIB_GAGAL = 0.5;

// Upload
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_CV_TYPES = ['application/pdf'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// --- Enum Status (T-UI-03) ---
// Status lowongan
export const STATUS_LOWONGAN = Object.freeze({
  DRAFT: 'draft',
  AKTIF: 'aktif',
  DITUTUP: 'ditutup',
});

// Status lamaran
export const STATUS_LAMARAN = Object.freeze({
  MENUNGGU: 'menunggu',
  DITERIMA: 'diterima',
  DITOLAK: 'ditolak',
  DIBATALKAN: 'dibatalkan',
});

// Status sesi chatbot
export const STATUS_SESI = Object.freeze({
  AKTIF: 'aktif',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
});

// Level kompetensi
export const LEVEL_KOMPETENSI = Object.freeze({
  PEMULA: 'pemula',
  MENENGAH: 'menengah',
  MAHIR: 'mahir',
});

// Role pengguna
export const ROLE_PENGGUNA = Object.freeze({
  ADMIN: 'admin',
  MAHASISWA: 'mahasiswa',
  DOSEN: 'dosen',
  PERUSAHAAN: 'perusahaan',
});
