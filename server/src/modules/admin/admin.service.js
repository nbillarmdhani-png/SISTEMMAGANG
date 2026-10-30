import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { createNotification } from '../notifications/notifications.service.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────────────────────────────────────

export async function getStats() {
  const [
    totalStudents,
    totalPositions,
    totalApplications,
    totalCompanies,
    totalSessions,
    applicationsByStatus,
  ] = await Promise.all([
    prisma.mahasiswa.count(),
    prisma.lowongan_magang.count(),
    prisma.lamaran.count(),
    prisma.perusahaan.count(),
    prisma.chatbot_sesi.count(),
    prisma.lamaran.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  return {
    totalStudents,
    totalPositions,
    totalApplications,
    totalCompanies,
    totalSessions,
    applicationsByStatus: applicationsByStatus.map((r) => ({
      status: r.status,
      count: r._count.id,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Users
// ─────────────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return prisma.users.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      mahasiswa: { select: { nama_lengkap: true, nim: true } },
      perusahaan: { select: { nama_perusahaan: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function updateUserStatus(id, isActive) {
  const user = await prisma.users.update({
    where: { id },
    data: { is_active: isActive },
  });
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Companies (Mitra)
// ─────────────────────────────────────────────────────────────────────────────

export async function getCompanies() {
  return prisma.perusahaan.findMany({
    orderBy: { nama_perusahaan: 'asc' },
  });
}

export async function createCompany(data) {
  return prisma.perusahaan.create({ data });
}

export async function updateCompany(id, data) {
  return prisma.perusahaan.update({ where: { id }, data });
}

export async function deleteCompany(id) {
  // Cascade – lowongan akan ikut terhapus (FK CASCADE)
  return prisma.perusahaan.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Positions (Lowongan)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPositions() {
  return prisma.lowongan_magang.findMany({
    include: {
      perusahaan: { select: { id: true, nama_perusahaan: true } },
      lowongan_kompetensi: { include: { kompetensi: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getPositionById(id) {
  const pos = await prisma.lowongan_magang.findUnique({
    where: { id },
    include: {
      perusahaan: true,
      lowongan_kompetensi: { include: { kompetensi: { include: { kategori_kompetensi: true } } } },
    },
  });
  if (!pos) throw new AppError('Lowongan tidak ditemukan.', 404);
  return pos;
}

export async function createPosition({ kompetensi = [], ...data }) {
  const tglBuka = new Date(data.tgl_buka);
  const tglTutup = new Date(data.tgl_tutup);
  if (tglTutup < tglBuka) throw new AppError('tgl_tutup harus >= tgl_buka.', 400);

  return prisma.$transaction(async (tx) => {
    const pos = await tx.lowongan_magang.create({
      data: {
        ...data,
        tgl_buka: tglBuka,
        tgl_tutup: tglTutup,
        min_ipk: data.min_ipk ?? null,
        min_semester: data.min_semester ?? null,
      },
    });

    if (kompetensi.length > 0) {
      await tx.lowongan_kompetensi.createMany({
        data: kompetensi.map((k) => ({
          lowongan_id: pos.id,
          kompetensi_id: k.kompetensi_id,
          bobot: k.bobot ?? 1,
          wajib: k.is_wajib ?? 0,
        })),
      });
    }

    return tx.lowongan_magang.findUnique({
      where: { id: pos.id },
      include: { lowongan_kompetensi: true },
    });
  });
}

export async function updatePosition(id, { kompetensi, ...data }) {
  const existing = await prisma.lowongan_magang.findUnique({ where: { id } });
  if (!existing) throw new AppError('Lowongan tidak ditemukan.', 404);

  if (data.tgl_buka && data.tgl_tutup) {
    if (new Date(data.tgl_tutup) < new Date(data.tgl_buka)) {
      throw new AppError('tgl_tutup harus >= tgl_buka.', 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    const pos = await tx.lowongan_magang.update({
      where: { id },
      data: {
        ...data,
        tgl_buka: data.tgl_buka ? new Date(data.tgl_buka) : undefined,
        tgl_tutup: data.tgl_tutup ? new Date(data.tgl_tutup) : undefined,
      },
    });

    if (kompetensi !== undefined) {
      // Replace all competencies
      await tx.lowongan_kompetensi.deleteMany({ where: { lowongan_id: id } });
      if (kompetensi.length > 0) {
        await tx.lowongan_kompetensi.createMany({
          data: kompetensi.map((k) => ({
            lowongan_id: id,
            kompetensi_id: k.kompetensi_id,
            bobot: k.bobot ?? 1,
            wajib: k.is_wajib ?? 0,
          })),
        });
      }
    }

    return tx.lowongan_magang.findUnique({
      where: { id: pos.id },
      include: { lowongan_kompetensi: true },
    });
  });
}

export async function deletePosition(id) {
  return prisma.lowongan_magang.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Competencies & Categories
// ─────────────────────────────────────────────────────────────────────────────

export async function getCompetencies() {
  return prisma.kompetensi.findMany({
    include: { kategori_kompetensi: true },
    orderBy: { nama_kompetensi: 'asc' },
  });
}

export async function createCompetency(data) {
  return prisma.kompetensi.create({ data });
}

export async function updateCompetency(id, data) {
  return prisma.kompetensi.update({ where: { id }, data });
}

export async function deleteCompetency(id) {
  // Cek apakah masih dipakai
  const count = await prisma.lowongan_kompetensi.count({ where: { kompetensi_id: id } });
  if (count > 0) throw new AppError('Kompetensi masih digunakan oleh lowongan, tidak dapat dihapus.', 409);
  return prisma.kompetensi.delete({ where: { id } });
}

export async function getCategories() {
  return prisma.kategori_kompetensi.findMany({
    include: { _count: { select: { kompetensi: true } } },
    orderBy: { nama_kategori: 'asc' },
  });
}

export async function createCategory(data) {
  return prisma.kategori_kompetensi.create({ data });
}

export async function updateCategory(id, data) {
  return prisma.kategori_kompetensi.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  const count = await prisma.kompetensi.count({ where: { kategori_id: id } });
  if (count > 0) throw new AppError('Kategori masih memiliki kompetensi, tidak dapat dihapus.', 409);
  return prisma.kategori_kompetensi.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Study Programs
// ─────────────────────────────────────────────────────────────────────────────

export async function getStudyPrograms() {
  return prisma.program_studi.findMany({ orderBy: { nama_prodi: 'asc' } });
}

export async function createStudyProgram(data) {
  return prisma.program_studi.create({ data });
}

export async function updateStudyProgram(id, data) {
  return prisma.program_studi.update({ where: { id }, data });
}

export async function deleteStudyProgram(id) {
  const count = await prisma.mahasiswa.count({ where: { prodi_id: id } });
  if (count > 0) throw new AppError('Program studi masih memiliki mahasiswa, tidak dapat dihapus.', 409);
  return prisma.program_studi.delete({ where: { id } });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Applications (Lamaran)
// ─────────────────────────────────────────────────────────────────────────────

export async function getApplications() {
  return prisma.lamaran.findMany({
    include: {
      mahasiswa: { include: { program_studi: true } },
      lowongan_magang: { include: { perusahaan: true } },
    },
    orderBy: { tgl_lamar: 'desc' },
  });
}

export async function updateApplicationStatus(id, { status, catatan_perusahaan }) {
  const lamaran = await prisma.lamaran.findUnique({
    where: { id },
    include: { lowongan_magang: true, mahasiswa: { include: { users: true } } },
  });

  if (!lamaran) throw new AppError('Lamaran tidak ditemukan.', 404);

  // Jika diterima, pastikan kuota masih ada (dalam transaksi)
  if (status === 'diterima' && lamaran.status !== 'diterima') {
    return prisma.$transaction(async (tx) => {
      const accepted = await tx.lamaran.count({
        where: { lowongan_id: lamaran.lowongan_id, status: 'diterima' },
      });

      if (accepted >= lamaran.lowongan_magang.kuota) {
        throw new AppError('Kuota lowongan sudah penuh.', 400);
      }

      const updated = await tx.lamaran.update({
        where: { id },
        data: {
          status,
          catatan_perusahaan,
          tgl_respons: new Date(),
        },
      });

      await createNotification({
        userId: lamaran.mahasiswa.user_id,
        judul: 'Selamat! Lamaran Diterima',
        pesan: `Lamaran Anda untuk ${lamaran.lowongan_magang.judul_posisi} telah diterima.`,
        tipe: 'lamaran',
        referensi_id: updated.id,
      });

      return updated;
    });
  }

  const updated = await prisma.lamaran.update({
    where: { id },
    data: {
      status,
      catatan_perusahaan,
      tgl_respons: status !== 'menunggu' ? new Date() : undefined,
    },
  });

  if (lamaran.status !== status) {
    await createNotification({
      userId: lamaran.mahasiswa.user_id,
      judul: 'Status Lamaran Diperbarui',
      pesan: `Lamaran Anda untuk ${lamaran.lowongan_magang.judul_posisi} statusnya diperbarui menjadi "${status}".`,
      tipe: 'lamaran',
      referensi_id: updated.id,
    });
  }

  return updated;
}

export async function exportApplicationsCSV() {
  const data = await prisma.lamaran.findMany({
    include: {
      mahasiswa: { include: { program_studi: true, users: { select: { email: true } } } },
      lowongan_magang: { include: { perusahaan: { select: { nama_perusahaan: true } } } },
    },
    orderBy: { tgl_lamar: 'desc' },
  });

  const rows = data.map((r) => ({
    id: r.id,
    nim: r.mahasiswa.nim,
    nama_mahasiswa: r.mahasiswa.nama_lengkap,
    email: r.mahasiswa.users.email,
    program_studi: r.mahasiswa.program_studi.nama_prodi,
    perusahaan: r.lowongan_magang.perusahaan.nama_perusahaan,
    posisi: r.lowongan_magang.judul_posisi,
    status: r.status,
    tgl_lamar: r.tgl_lamar?.toISOString().split('T')[0],
    tgl_respons: r.tgl_respons?.toISOString().split('T')[0] ?? '',
    catatan: r.catatan_perusahaan ?? '',
  }));

  const headers = [
    'id', 'nim', 'nama_mahasiswa', 'email', 'program_studi',
    'perusahaan', 'posisi', 'status', 'tgl_lamar', 'tgl_respons', 'catatan',
  ];

  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csv;
}
