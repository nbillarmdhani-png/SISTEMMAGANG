// client/src/utils/constants.js
// Konstanta global frontend - satu sumber kebenaran untuk semua string status (T-UI-03)

export const STATUS_LOWONGAN = Object.freeze({
  DRAFT: 'draft',
  AKTIF: 'aktif',
  DITUTUP: 'ditutup',
});

export const STATUS_LAMARAN = Object.freeze({
  MENUNGGU: 'menunggu',
  DITERIMA: 'diterima',
  DITOLAK: 'ditolak',
  DIBATALKAN: 'dibatalkan',
});

export const STATUS_SESI = Object.freeze({
  AKTIF: 'aktif',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
});

export const LEVEL_KOMPETENSI = Object.freeze({
  PEMULA: 'pemula',
  MENENGAH: 'menengah',
  MAHIR: 'mahir',
});

export const ROLE_PENGGUNA = Object.freeze({
  ADMIN: 'admin',
  MAHASISWA: 'mahasiswa',
  DOSEN: 'dosen',
  PERUSAHAAN: 'perusahaan',
});

// Label status untuk tampilan UI
export const LABEL_STATUS_LAMARAN = Object.freeze({
  [STATUS_LAMARAN.MENUNGGU]: 'Menunggu',
  [STATUS_LAMARAN.DITERIMA]: 'Diterima',
  [STATUS_LAMARAN.DITOLAK]: 'Ditolak',
  [STATUS_LAMARAN.DIBATALKAN]: 'Dibatalkan',
});

export const LABEL_STATUS_LOWONGAN = Object.freeze({
  [STATUS_LOWONGAN.DRAFT]: 'Draft',
  [STATUS_LOWONGAN.AKTIF]: 'Aktif',
  [STATUS_LOWONGAN.DITUTUP]: 'Ditutup',
});

export const LABEL_LEVEL_KOMPETENSI = Object.freeze({
  [LEVEL_KOMPETENSI.PEMULA]: 'Pemula',
  [LEVEL_KOMPETENSI.MENENGAH]: 'Menengah',
  [LEVEL_KOMPETENSI.MAHIR]: 'Mahir',
});
