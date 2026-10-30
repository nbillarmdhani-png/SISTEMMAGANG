import prisma from '../../config/prisma.js';
import { callLLM } from '../../config/llm.js';
import { nextFallbackQuestion } from './fallbackQuestionnaire.js';
import { AppError } from '../../utils/AppError.js';
import { refreshRecommendations } from '../recommendations/recommendations.service.js';

async function getMahasiswaId(userId) {
  const mhs = await prisma.mahasiswa.findUnique({ where: { user_id: userId } });
  if (!mhs) throw new AppError('Profil tidak ditemukan.', 404);
  return mhs.id;
}

export async function createSession(userId) {
  const mhsId = await getMahasiswaId(userId);

  // Batalkan sesi yang masih aktif sebelumnya
  await prisma.chatbot_sesi.updateMany({
    where: { mahasiswa_id: mhsId, status: 'aktif' },
    data: { status: 'dibatalkan' },
  });

  const session = await prisma.chatbot_sesi.create({
    data: { mahasiswa_id: mhsId, status: 'aktif' },
  });

  return session;
}

export async function getSessionById(userId, sessionId) {
  const mhsId = await getMahasiswaId(userId);
  const session = await prisma.chatbot_sesi.findFirst({
    where: { id: sessionId, mahasiswa_id: mhsId },
    include: {
      chatbot_pesan: { orderBy: { created_at: 'asc' } },
      chatbot_kompetensi_terdeteksi: { include: { kompetensi: true } },
    },
  });

  if (!session) throw new AppError('Sesi tidak ditemukan.', 404);
  return session;
}

export async function sendMessage(userId, sessionId, userMessage) {
  const mhsId = await getMahasiswaId(userId);
  const session = await prisma.chatbot_sesi.findFirst({
    where: { id: sessionId, mahasiswa_id: mhsId, status: 'aktif' },
  });

  if (!session) throw new AppError('Sesi tidak aktif atau tidak ditemukan.', 400);

  // Simpan pesan user
  await prisma.chatbot_pesan.create({
    data: { sesi_id: sessionId, peran: 'user', isi_pesan: userMessage },
  });

  const riwayat = await prisma.chatbot_pesan.findMany({
    where: { sesi_id: sessionId },
    orderBy: { created_at: 'asc' },
  });

  const masterKompetensi = await prisma.kompetensi.findMany();
  let aiResponseObj;

  try {
    const aiResponseText = await callLLM({ riwayat, kompetensi: masterKompetensi });
    // Bersihkan karakter markdown dari LLM (biasanya membalas dengan ```json ... ```)
    const cleanedText = aiResponseText.replace(/```json|```/g, '').trim();
    aiResponseObj = JSON.parse(cleanedText);
  } catch (error) {
    console.error('LLM Error, fallback to questionnaire:', error);
    aiResponseObj = await nextFallbackQuestion(sessionId, masterKompetensi);
  }

  // Simpan respons bot
  const botPesan = await prisma.chatbot_pesan.create({
    data: { sesi_id: sessionId, peran: 'bot', isi_pesan: aiResponseObj.reply },
  });

  // Simpan skill yang terdeteksi
  const skillsToReturn = [];
  if (aiResponseObj.skills && Array.isArray(aiResponseObj.skills)) {
    for (const skill of aiResponseObj.skills) {
      const match = masterKompetensi.find(
        (m) => m.nama_kompetensi.toLowerCase() === skill.nama.toLowerCase()
      );
      if (match) {
        // Upsert deteksi
        const existingDeteksi = await prisma.chatbot_kompetensi_terdeteksi.findFirst({
          where: { sesi_id: sessionId, kompetensi_id: match.id },
        });

        let terdeteksi;
        if (existingDeteksi) {
           terdeteksi = await prisma.chatbot_kompetensi_terdeteksi.update({
             where: { id: existingDeteksi.id },
             data: { level: skill.level, confidence: skill.confidence }
           });
        } else {
           terdeteksi = await prisma.chatbot_kompetensi_terdeteksi.create({
            data: {
              sesi_id: sessionId,
              kompetensi_id: match.id,
              level: skill.level,
              confidence: skill.confidence,
            },
          });
        }
        skillsToReturn.push({ ...terdeteksi, kompetensi: match });
      }
    }
  }

  if (aiResponseObj.selesai) {
    await prisma.chatbot_sesi.update({
      where: { id: sessionId },
      data: { status: 'selesai' },
    });
  }

  return {
    reply: botPesan.isi_pesan,
    skills: skillsToReturn,
    selesai: aiResponseObj.selesai || false,
  };
}

export async function confirmSkills(userId, sessionId, items) {
  const mhsId = await getMahasiswaId(userId);
  const session = await prisma.chatbot_sesi.findFirst({
    where: { id: sessionId, mahasiswa_id: mhsId },
  });

  if (!session) throw new AppError('Sesi tidak ditemukan.', 404);

  // Lakukan konfirmasi (pindah ke mahasiswa_kompetensi) dalam satu transaksi
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const terdeteksi = await tx.chatbot_kompetensi_terdeteksi.findUnique({
        where: { id: item.id },
      });

      if (terdeteksi && terdeteksi.sesi_id === sessionId) {
        await tx.chatbot_kompetensi_terdeteksi.update({
          where: { id: terdeteksi.id },
          data: { dikonfirmasi: 1, level: item.level },
        });

        // Upsert ke profil mahasiswa
        const existingComp = await tx.mahasiswa_kompetensi.findFirst({
          where: { mahasiswa_id: mhsId, kompetensi_id: terdeteksi.kompetensi_id },
        });

        if (existingComp) {
          // Aturan: ambil level tertinggi, jangan timpa sumber 'manual' jika sudah manual
          const currVal = existingComp.level === 'mahir' ? 3 : existingComp.level === 'menengah' ? 2 : 1;
          const newVal = item.level === 'mahir' ? 3 : item.level === 'menengah' ? 2 : 1;
          
          if (newVal > currVal) {
             await tx.mahasiswa_kompetensi.update({
               where: { id: existingComp.id },
               data: { 
                 level: item.level, 
                 sumber: existingComp.sumber === 'manual' ? 'manual' : 'chatbot'
               }
             });
          }
        } else {
          await tx.mahasiswa_kompetensi.create({
            data: {
              mahasiswa_id: mhsId,
              kompetensi_id: terdeteksi.kompetensi_id,
              level: item.level,
              sumber: 'chatbot',
            },
          });
        }
      }
    }
  });

  // T-72: Otomatis hitung ulang rekomendasi setelah konfirmasi chatbot
  try {
    await refreshRecommendations(userId);
  } catch (err) {
    console.warn('[REKOMENDASI] Gagal auto-refresh rekomendasi setelah chatbot:', err.message);
  }
}

export async function cancelSession(userId, sessionId) {
  const mhsId = await getMahasiswaId(userId);
  const session = await prisma.chatbot_sesi.findFirst({
    where: { id: sessionId, mahasiswa_id: mhsId },
  });

  if (!session) throw new AppError('Sesi tidak ditemukan.', 404);

  await prisma.chatbot_sesi.update({
    where: { id: sessionId },
    data: { status: 'dibatalkan' },
  });
}
