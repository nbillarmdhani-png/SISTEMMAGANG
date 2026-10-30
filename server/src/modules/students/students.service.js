import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

async function getMahasiswaId(userId) {
  const mhs = await prisma.mahasiswa.findUnique({ where: { user_id: userId } });
  if (!mhs) throw new AppError('Profil mahasiswa tidak ditemukan.', 404);
  return mhs.id;
}

export async function getProfile(userId) {
  const mhs = await prisma.mahasiswa.findUnique({
    where: { user_id: userId },
    include: { program_studi: true },
  });
  if (!mhs) throw new AppError('Profil mahasiswa tidak ditemukan.', 404);
  return mhs;
}

export async function updateProfile(userId, data) {
  const mhsId = await getMahasiswaId(userId);
  return prisma.mahasiswa.update({
    where: { id: mhsId },
    data,
  });
}

export async function updateFiles(userId, { cv_path, foto }) {
  const mhsId = await getMahasiswaId(userId);
  const data = {};
  if (cv_path) data.cv_path = cv_path;
  if (foto) data.foto = foto;
  
  if (Object.keys(data).length === 0) return null;
  
  return prisma.mahasiswa.update({
    where: { id: mhsId },
    data,
  });
}

export async function getCompetencies(userId) {
  const mhsId = await getMahasiswaId(userId);
  return prisma.mahasiswa_kompetensi.findMany({
    where: { mahasiswa_id: mhsId },
    include: {
      kompetensi: { include: { kategori_kompetensi: true } },
    },
  });
}

export async function addCompetency(userId, { kompetensi_id, level, bukti_url }) {
  const mhsId = await getMahasiswaId(userId);
  
  // Upsert to handle conflict (composite unique constraint on mahasiswa_id, kompetensi_id)
  // But wait, the schema says: "Unik: (mahasiswa_id, kompetensi_id)". 
  // Let's check if it exists first to decide whether to update or create
  const existing = await prisma.mahasiswa_kompetensi.findFirst({
    where: { mahasiswa_id: mhsId, kompetensi_id }
  });

  if (existing) {
    return prisma.mahasiswa_kompetensi.update({
      where: { id: existing.id },
      data: { level, bukti_url, sumber: 'manual' }
    });
  } else {
    return prisma.mahasiswa_kompetensi.create({
      data: {
        mahasiswa_id: mhsId,
        kompetensi_id,
        level,
        bukti_url,
        sumber: 'manual'
      }
    });
  }
}

export async function deleteCompetency(userId, kompetensiId) {
  const mhsId = await getMahasiswaId(userId);
  
  const existing = await prisma.mahasiswa_kompetensi.findFirst({
    where: { mahasiswa_id: mhsId, kompetensi_id: kompetensiId }
  });

  if (!existing) throw new AppError('Kompetensi tidak ditemukan di profil Anda.', 404);

  await prisma.mahasiswa_kompetensi.delete({
    where: { id: existing.id }
  });
}
