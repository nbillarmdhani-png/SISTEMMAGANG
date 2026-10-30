import prisma from '../../config/prisma.js';

export async function getStudyPrograms() {
  return prisma.program_studi.findMany({
    orderBy: { nama_prodi: 'asc' },
  });
}

export async function getCompetencies() {
  return prisma.kategori_kompetensi.findMany({
    include: {
      kompetensi: {
        orderBy: { nama_kompetensi: 'asc' },
      },
    },
    orderBy: { nama_kategori: 'asc' },
  });
}
