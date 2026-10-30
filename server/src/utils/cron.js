import cron from 'node-cron';
import prisma from '../config/prisma.js';

export function initCronJobs() {
  // Berjalan setiap hari pada tengah malam (00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[CRON] Menjalankan pengecekan lowongan magang kadaluwarsa...');
      const today = new Date();
      // Set to start of day
      today.setHours(0, 0, 0, 0);

      const updated = await prisma.lowongan_magang.updateMany({
        where: {
          status: 'aktif',
          tgl_tutup: {
            lt: today
          }
        },
        data: {
          status: 'ditutup'
        }
      });
      console.log(`[CRON] ${updated.count} lowongan telah ditutup karena melewati tgl_tutup.`);
    } catch (err) {
      console.error('[CRON ERROR]', err);
    }
  });
}
