import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

export async function getPositions(filters = {}) {
  const { q, kota, is_remote, bidang_usaha, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    status: 'aktif',
    tgl_buka: { lte: new Date() },
    tgl_tutup: { gte: new Date() },
  };

  if (q) {
    where.judul_posisi = { contains: q };
  }
  if (kota) {
    where.kota = { contains: kota };
  }
  if (is_remote !== undefined) {
    where.is_remote = is_remote === 'true';
  }
  if (bidang_usaha) {
    where.perusahaan = { bidang_usaha: { contains: bidang_usaha } };
  }

  const [data, total] = await Promise.all([
    prisma.lowongan_magang.findMany({
      where,
      include: {
        perusahaan: { select: { nama_perusahaan: true, logo: true, kota: true, verified: true } },
      },
      skip: Number(skip),
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.lowongan_magang.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPositionById(id) {
  const pos = await prisma.lowongan_magang.findUnique({
    where: { id },
    include: {
      perusahaan: true,
      lowongan_kompetensi: {
        include: {
          kompetensi: true,
        },
      },
    },
  });

  if (!pos) throw new AppError('Lowongan tidak ditemukan.', 404);
  return pos;
}
