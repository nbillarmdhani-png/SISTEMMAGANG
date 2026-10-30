// src/modules/chatbot/fallbackQuestionnaire.js
import prisma from '../../config/prisma.js';

/**
 * Mengembalikan pertanyaan berikutnya untuk kompetensi yang belum terdeteksi di sesi ini.
 * @param {number} sesiId
 * @param {Array<{id: number, nama_kompetensi: string}>} master - seluruh kompetensi dari DB
 * @returns {Promise<{reply: string, intent: string, skills: [], selesai: boolean}>}
 */
export async function nextFallbackQuestion(sesiId, master) {
  // Ambil kompetensi yang sudah terdeteksi di sesi ini
  const terdeteksi = await prisma.chatbot_kompetensi_terdeteksi.findMany({
    where: { sesi_id: sesiId },
    select: { kompetensi_id: true },
  });
  const sudahAdaIds = new Set(terdeteksi.map((t) => t.kompetensi_id));

  // Cari kompetensi berikutnya yang belum ditanyakan
  const berikutnya = master.find((k) => !sudahAdaIds.has(k.id));

  if (!berikutnya) {
    // Semua kompetensi sudah ditanyakan
    return {
      reply: 'Baik, sesi pemetaan selesai. Silakan tinjau hasilnya.',
      intent: 'selesai',
      skills: [],
      selesai: true,
    };
  }

  return {
    reply: `Apakah kamu memiliki kompetensi "${berikutnya.nama_kompetensi}"? Jika ya, di tingkat apa (pemula, menengah, atau mahir)?`,
    intent: 'tanya_kompetensi',
    skills: [],
    selesai: false,
  };
}
