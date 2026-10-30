import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { LEVEL_NILAI, LEVEL_MAKS, TOP_N, FAKTOR_WAJIB_GAGAL } from '../../utils/constants.js';

async function getMahasiswaId(userId) {
  const mhs = await prisma.mahasiswa.findUnique({ where: { user_id: userId } });
  if (!mhs) throw new AppError('Profil tidak ditemukan.', 404);
  return mhs;
}

export async function getRecommendations(userId) {
  const mhs = await getMahasiswaId(userId);
  return prisma.rekomendasi.findMany({
    where: { mahasiswa_id: mhs.id },
    include: {
      lowongan_magang: {
        include: { perusahaan: true },
      },
    },
    orderBy: { skor_kecocokan: 'desc' },
  });
}

export async function refreshRecommendations(userId) {
  const mhs = await getMahasiswaId(userId);

  // 1. Ambil kompetensi mahasiswa
  const mhsKompetensiRaw = await prisma.mahasiswa_kompetensi.findMany({
    where: { mahasiswa_id: mhs.id },
  });
  // Buat map ID kompetensi ke nilai level
  const mhsSkillsMap = new Map();
  for (const mk of mhsKompetensiRaw) {
    mhsSkillsMap.set(mk.kompetensi_id, LEVEL_NILAI[mk.level] || 0);
  }

  // 2. Loop batch data lowongan untuk mencegah Out of Memory (OOM)
  const hasilSkor = [];
  const BATCH_SIZE = 500;
  let hasMore = true;
  let cursorObj = undefined;

  while (hasMore) {
    const lowonganLayak = await prisma.lowongan_magang.findMany({
      take: BATCH_SIZE,
      ...(cursorObj ? { skip: 1, cursor: cursorObj } : {}),
      where: {
        status: 'aktif',
        tgl_buka: { lte: new Date() },
        tgl_tutup: { gte: new Date() },
        min_semester: { lte: mhs.semester },
        min_ipk: { lte: mhs.ipk },
      },
      include: {
        lowongan_kompetensi: {
          include: { kompetensi: true },
        },
      },
      orderBy: { id: 'asc' }, // Penting untuk konsistensi kursor
    });

    for (const lowongan of lowonganLayak) {
      if (lowongan.lowongan_kompetensi.length === 0) continue;

      let sumBobotKaliNilai = 0;
      let sumBobot = 0;
      let wajibTerpenuhi = true;
      const kompetensiKurang = [];

      for (const lk of lowongan.lowongan_kompetensi) {
        const bobot = Number(lk.bobot);
        const levelMhs = mhsSkillsMap.get(lk.kompetensi_id) || 0;
        
        sumBobot += bobot;
        sumBobotKaliNilai += bobot * (levelMhs / LEVEL_MAKS);

        if (lk.wajib && levelMhs === 0) {
          wajibTerpenuhi = false;
        }

        if (levelMhs === 0) {
          kompetensiKurang.push({
            id: lk.kompetensi_id,
            nama: lk.kompetensi?.nama_kompetensi || `Kompetensi #${lk.kompetensi_id}`,
            wajib: Boolean(lk.wajib),
          });
        }
      }

      if (sumBobot === 0) continue;

      let skorAwal = (sumBobotKaliNilai / sumBobot) * 100;
      let skorAkhir = wajibTerpenuhi ? skorAwal : skorAwal * FAKTOR_WAJIB_GAGAL;
      
      skorAkhir = Math.max(0, Math.min(100, Number(skorAkhir.toFixed(2))));

      hasilSkor.push({
        lowongan_id: lowongan.id,
        skor_kecocokan: skorAkhir,
        detail_perhitungan: {
          skor_mentah: Number(skorAwal.toFixed(2)),
          wajib_terpenuhi: wajibTerpenuhi,
          kompetensi_kurang: kompetensiKurang,
        },
      });
    }

    if (lowonganLayak.length === BATCH_SIZE) {
      cursorObj = { id: lowonganLayak[lowonganLayak.length - 1].id };
    } else {
      hasMore = false;
    }
  }

  // Urutkan dan ambil TOP_N
  hasilSkor.sort((a, b) => b.skor_kecocokan - a.skor_kecocokan);
  const topN = hasilSkor.slice(0, TOP_N);

  // 3. Simpan ke database dalam transaksi
  await prisma.$transaction(async (tx) => {
    // Hapus rekomendasi lama
    await tx.rekomendasi.deleteMany({
      where: { mahasiswa_id: mhs.id },
    });

    // Masukkan rekomendasi baru
    for (const hasil of topN) {
      await tx.rekomendasi.create({
        data: {
          mahasiswa_id: mhs.id,
          lowongan_id: hasil.lowongan_id,
          skor_kecocokan: hasil.skor_kecocokan,
          metode: 'SAW',
          detail_perhitungan: hasil.detail_perhitungan,
        },
      });
    }
  });

  return getRecommendations(userId);
}
