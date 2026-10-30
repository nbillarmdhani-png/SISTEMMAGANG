import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

async function getMahasiswaId(userId) {
  const mhs = await prisma.mahasiswa.findUnique({ where: { user_id: userId } });
  if (!mhs) throw new AppError('Profil tidak ditemukan.', 404);
  return mhs;
}

export async function getApplications(userId) {
  const mhs = await getMahasiswaId(userId);
  return prisma.lamaran.findMany({
    where: { mahasiswa_id: mhs.id },
    include: {
      lowongan_magang: {
        include: { perusahaan: true },
      },
    },
    orderBy: { tgl_lamar: 'desc' },
  });
}

export async function apply(userId, data) {
  const { lowongan_id, surat_pengantar, sumber_rekomendasi } = data;
  const mhs = await getMahasiswaId(userId);

  // Validasi lowongan aktif
  const lowongan = await prisma.lowongan_magang.findUnique({
    where: { id: lowongan_id },
  });
  if (!lowongan || lowongan.status !== 'aktif') {
    throw new AppError('Lowongan tidak aktif atau tidak ditemukan.', 400);
  }

  // Cek apakah sudah melamar sebelumnya
  const existing = await prisma.lamaran.findFirst({
    where: { mahasiswa_id: mhs.id, lowongan_id },
  });

  if (existing) {
    if (existing.status !== 'dibatalkan') {
       throw new AppError('Anda sudah melamar posisi ini.', 400);
    }
    
    // Jika sudah pernah melamar tapi dibatalkan, update statusnya
    return prisma.lamaran.update({
      where: { id: existing.id },
      data: {
        surat_pengantar,
        sumber_rekomendasi: sumber_rekomendasi ? 1 : 0,
        status: 'menunggu',
        tgl_lamar: new Date(),
      }
    });
  }

  return prisma.lamaran.create({
    data: {
      mahasiswa_id: mhs.id,
      lowongan_id,
      surat_pengantar,
      sumber_rekomendasi: sumber_rekomendasi ? 1 : 0,
      status: 'menunggu',
    },
  });
}

export async function cancelApplication(userId, id) {
  const mhs = await getMahasiswaId(userId);
  const lamaran = await prisma.lamaran.findFirst({
    where: { id, mahasiswa_id: mhs.id },
  });

  if (!lamaran) throw new AppError('Lamaran tidak ditemukan.', 404);
  if (lamaran.status !== 'menunggu') {
    throw new AppError('Hanya lamaran berstatus "menunggu" yang bisa dibatalkan.', 400);
  }

  return prisma.lamaran.update({
    where: { id },
    data: { status: 'dibatalkan' },
  });
}
