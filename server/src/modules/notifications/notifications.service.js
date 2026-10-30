import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

export async function getNotifications(userId) {
  return prisma.notifikasi.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
}

export async function markAsRead(userId, id) {
  const notif = await prisma.notifikasi.findFirst({
    where: { id, user_id: userId },
  });

  if (!notif) throw new AppError('Notifikasi tidak ditemukan.', 404);

  return prisma.notifikasi.update({
    where: { id },
    data: { dibaca: 1 },
  });
}

export async function markAllAsRead(userId) {
  await prisma.notifikasi.updateMany({
    where: { user_id: userId, dibaca: 0 },
    data: { dibaca: 1 },
  });
}

/**
 * Fungsi utilitas untuk membuat notifikasi baru (dipanggil oleh service lain, misal admin).
 */
export async function createNotification({ userId, judul, pesan, tipe, referensi_id }) {
  return prisma.notifikasi.create({
    data: {
      user_id: userId,
      judul,
      pesan,
      tipe,
      referensi_id,
      dibaca: 0,
    },
  });
}
