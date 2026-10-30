// prisma/seed.js — T-PRD-01: Database Seeder Produksi
// Jalankan: node prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding...');

  // ─── 1. Program Studi ─────────────────────────────────────────────
  const prodiData = [
    { kode_prodi: 'TI', nama_prodi: 'Teknik Informatika', fakultas: 'Fakultas Ilmu Komputer', jenjang: 'S1' },
    { kode_prodi: 'SI', nama_prodi: 'Sistem Informasi', fakultas: 'Fakultas Ilmu Komputer', jenjang: 'S1' },
    { kode_prodi: 'SK', nama_prodi: 'Sains Komputasi', fakultas: 'Fakultas Ilmu Komputer', jenjang: 'S1' },
    { kode_prodi: 'RPL', nama_prodi: 'Rekayasa Perangkat Lunak', fakultas: 'Fakultas Ilmu Komputer', jenjang: 'S1' },
  ];

  const prodis = [];
  for (const p of prodiData) {
    const prodi = await prisma.program_studi.upsert({
      where: { kode_prodi: p.kode_prodi },
      update: {},
      create: p,
    });
    prodis.push(prodi);
  }
  console.log(`Berhasil: ${prodis.length} program studi`);

  // ─── 2. Kategori Kompetensi ────────────────────────────────────────
  const kategoriData = [
    { nama_kategori: 'Bahasa Pemrograman', deskripsi: 'Kemampuan bahasa pemrograman' },
    { nama_kategori: 'Framework & Library', deskripsi: 'Framework dan library populer' },
    { nama_kategori: 'Basis Data', deskripsi: 'Manajemen basis data' },
    { nama_kategori: 'DevOps & Cloud', deskripsi: 'Tools deployment dan infrastruktur' },
    { nama_kategori: 'Soft Skills', deskripsi: 'Kemampuan interpersonal' },
    { nama_kategori: 'Mobile Development', deskripsi: 'Pengembangan aplikasi mobile' },
    { nama_kategori: 'Data Science & AI', deskripsi: 'Analisis data dan kecerdasan buatan' },
  ];

  const kategoris = [];
  for (const k of kategoriData) {
    const kat = await prisma.kategori_kompetensi.upsert({
      where: { nama_kategori: k.nama_kategori },
      update: {},
      create: k,
    });
    kategoris.push(kat);
  }
  console.log(`Berhasil: ${kategoris.length} kategori kompetensi`);

  // ─── 3. Kompetensi ────────────────────────────────────────────────
  const [katBahasa, katFramework, katDB, katDevOps, katSoft, katMobile, katDS] = kategoris;

  const kompetensiData = [
    // Bahasa Pemrograman
    { kategori_id: katBahasa.id, nama_kompetensi: 'JavaScript' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'Python' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'Java' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'TypeScript' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'Go' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'PHP' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'Kotlin' },
    { kategori_id: katBahasa.id, nama_kompetensi: 'Swift' },
    // Framework & Library
    { kategori_id: katFramework.id, nama_kompetensi: 'React.js' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Node.js' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Express.js' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Next.js' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Laravel' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Spring Boot' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Django' },
    { kategori_id: katFramework.id, nama_kompetensi: 'Flutter' },
    // Basis Data
    { kategori_id: katDB.id, nama_kompetensi: 'MySQL' },
    { kategori_id: katDB.id, nama_kompetensi: 'PostgreSQL' },
    { kategori_id: katDB.id, nama_kompetensi: 'MongoDB' },
    { kategori_id: katDB.id, nama_kompetensi: 'Redis' },
    { kategori_id: katDB.id, nama_kompetensi: 'Prisma ORM' },
    // DevOps & Cloud
    { kategori_id: katDevOps.id, nama_kompetensi: 'Docker' },
    { kategori_id: katDevOps.id, nama_kompetensi: 'Git' },
    { kategori_id: katDevOps.id, nama_kompetensi: 'Linux' },
    { kategori_id: katDevOps.id, nama_kompetensi: 'CI/CD (GitHub Actions)' },
    // Soft Skills
    { kategori_id: katSoft.id, nama_kompetensi: 'Komunikasi' },
    { kategori_id: katSoft.id, nama_kompetensi: 'Kerja Tim' },
    { kategori_id: katSoft.id, nama_kompetensi: 'Problem Solving' },
    // Mobile
    { kategori_id: katMobile.id, nama_kompetensi: 'Android Native' },
    { kategori_id: katMobile.id, nama_kompetensi: 'React Native' },
    // Data Science
    { kategori_id: katDS.id, nama_kompetensi: 'Machine Learning' },
    { kategori_id: katDS.id, nama_kompetensi: 'Data Analysis' },
    { kategori_id: katDS.id, nama_kompetensi: 'TensorFlow' },
  ];

  const komps = [];
  for (const k of kompetensiData) {
    const komp = await prisma.kompetensi.upsert({
      where: { nama_kompetensi: k.nama_kompetensi },
      update: {},
      create: k,
    });
    komps.push(komp);
  }
  console.log(`Berhasil: ${komps.length} kompetensi`);

  // ─── 4. Akun Admin ────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('AdminPassword123!', 12);
  await prisma.users.upsert({
    where: { email: 'admin@magang.com' },
    update: {},
    create: { email: 'admin@magang.com', password: adminHash, role: 'admin', is_active: 1 },
  });
  console.log('Berhasil: akun admin');

  // ─── 5. Perusahaan Mitra ──────────────────────────────────────────
  const perusahaanData = [
    { nama_perusahaan: 'PT Tokopedia', bidang_usaha: 'E-Commerce', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://tokopedia.com', verified: 1 },
    { nama_perusahaan: 'PT Gojek Indonesia', bidang_usaha: 'Transportasi & Teknologi', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://gojek.com', verified: 1 },
    { nama_perusahaan: 'PT Bukalapak', bidang_usaha: 'E-Commerce', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://bukalapak.com', verified: 1 },
    { nama_perusahaan: 'PT Traveloka', bidang_usaha: 'Travel & Pariwisata', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://traveloka.com', verified: 1 },
    { nama_perusahaan: 'PT Ruangguru', bidang_usaha: 'EdTech', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://ruangguru.com', verified: 1 },
    { nama_perusahaan: 'PT Telkom Indonesia', bidang_usaha: 'Telekomunikasi', kota: 'Bandung', provinsi: 'Jawa Barat', website: 'https://telkom.co.id', verified: 1 },
    { nama_perusahaan: 'PT Bank BCA Tbk', bidang_usaha: 'Perbankan & Fintech', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://bca.co.id', verified: 1 },
    { nama_perusahaan: 'PT Shopee Indonesia', bidang_usaha: 'E-Commerce', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://shopee.co.id', verified: 1 },
    { nama_perusahaan: 'PT Tiket.com', bidang_usaha: 'Travel & Teknologi', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://tiket.com', verified: 1 },
    { nama_perusahaan: 'PT Kalibrr Indonesia', bidang_usaha: 'HR Tech', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://kalibrr.com', verified: 1 },
    { nama_perusahaan: 'PT Blibli', bidang_usaha: 'E-Commerce', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://blibli.com', verified: 1 },
    { nama_perusahaan: 'PT Xendit', bidang_usaha: 'Fintech & Pembayaran', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://xendit.co', verified: 1 },
    { nama_perusahaan: 'PT Kata.ai', bidang_usaha: 'AI & NLP', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://kata.ai', verified: 1 },
    { nama_perusahaan: 'PT Midtrans', bidang_usaha: 'Fintech & Payment Gateway', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://midtrans.com', verified: 1 },
    { nama_perusahaan: 'PT Astra International', bidang_usaha: 'Otomotif & Teknologi', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://astra.co.id', verified: 1 },
    { nama_perusahaan: 'PT Mekari', bidang_usaha: 'SaaS & HR Tech', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://mekari.com', verified: 1 },
    { nama_perusahaan: 'PT Wahana Prestasi Logistik', bidang_usaha: 'Logistik & Supply Chain', kota: 'Surabaya', provinsi: 'Jawa Timur', website: 'https://wahana.com', verified: 1 },
    { nama_perusahaan: 'PT Dicoding Indonesia', bidang_usaha: 'EdTech & Developer Platform', kota: 'Bandung', provinsi: 'Jawa Barat', website: 'https://dicoding.com', verified: 1 },
    { nama_perusahaan: 'PT Pinhome', bidang_usaha: 'PropTech', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://pinhome.id', verified: 1 },
    { nama_perusahaan: 'PT Sirclo Commerce', bidang_usaha: 'E-Commerce Enabler', kota: 'Jakarta', provinsi: 'DKI Jakarta', website: 'https://sirclo.com', verified: 1 },
  ];

  const perusahaans = [];
  for (const p of perusahaanData) {
    const existing = await prisma.perusahaan.findFirst({ where: { nama_perusahaan: p.nama_perusahaan } });
    let per;
    if (existing) {
      per = existing;
    } else {
      per = await prisma.perusahaan.create({ data: p });
    }
    perusahaans.push(per);
  }
  console.log(`Berhasil: ${perusahaans.length} perusahaan mitra`);

  // ─── 6. Lowongan Magang ────────────────────────────────────────────
  const helper = (name) => komps.find((k) => k.nama_kompetensi === name);

  const today = new Date();
  const buka = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const tutup = (m) => new Date(today.getFullYear(), today.getMonth() + m, 0).toISOString();

  const lowonganData = [
    {
      perusahaan_id: perusahaans[0].id, judul_posisi: 'Frontend Engineer Intern',
      deskripsi: 'Mengembangkan antarmuka web menggunakan React.js dan berkolaborasi dengan desainer UI/UX.',
      kuota: 5, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'React.js', bobot: 1.5, wajib: true },
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'Git', bobot: 1.0, wajib: false },
        { nama: 'TypeScript', bobot: 1.0, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[0].id, judul_posisi: 'Backend Engineer Intern',
      deskripsi: 'Membangun layanan API menggunakan Node.js dan Express.js, integrasi dengan berbagai layanan internal.',
      kuota: 3, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Node.js', bobot: 1.5, wajib: true },
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Docker', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[1].id, judul_posisi: 'Android Developer Intern',
      deskripsi: 'Mengembangkan fitur baru pada aplikasi Gojek menggunakan Kotlin dan mengikuti coding standard Google.',
      kuota: 4, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 6, min_ipk: 3.20, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Kotlin', bobot: 2.0, wajib: true },
        { nama: 'Android Native', bobot: 2.0, wajib: true },
        { nama: 'Git', bobot: 0.8, wajib: false },
        { nama: 'MySQL', bobot: 0.5, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[1].id, judul_posisi: 'Data Analyst Intern',
      deskripsi: 'Menganalisis data operasional Gojek untuk meningkatkan pengambilan keputusan bisnis.',
      kuota: 2, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.10, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'Python', bobot: 1.5, wajib: true },
        { nama: 'Data Analysis', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Machine Learning', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[2].id, judul_posisi: 'Full Stack Developer Intern',
      deskripsi: 'Mengembangkan fitur end-to-end menggunakan React.js dan Node.js pada platform Bukalapak.',
      kuota: 4, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(4),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'React.js', bobot: 1.2, wajib: true },
        { nama: 'Node.js', bobot: 1.2, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[3].id, judul_posisi: 'iOS Developer Intern',
      deskripsi: 'Membantu pengembangan fitur baru pada aplikasi iOS Traveloka menggunakan Swift.',
      kuota: 2, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 7, min_ipk: 3.30, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Swift', bobot: 2.0, wajib: true },
        { nama: 'Git', bobot: 0.8, wajib: false },
        { nama: 'Problem Solving', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[4].id, judul_posisi: 'Software Engineer Intern',
      deskripsi: 'Berkontribusi pada pengembangan platform belajar Ruangguru menggunakan berbagai teknologi modern.',
      kuota: 6, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'JavaScript', bobot: 1.2, wajib: true },
        { nama: 'React.js', bobot: 1.2, wajib: false },
        { nama: 'Python', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: true },
      ],
    },
    {
      perusahaan_id: perusahaans[5].id, judul_posisi: 'Network Engineer Intern',
      deskripsi: 'Mendukung tim jaringan Telkom dalam pengelolaan infrastruktur jaringan nasional.',
      kuota: 4, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 5, min_ipk: 2.75, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Linux', bobot: 1.5, wajib: true },
        { nama: 'Docker', bobot: 1.0, wajib: false },
        { nama: 'CI/CD (GitHub Actions)', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[6].id, judul_posisi: 'IT Developer Intern (Core Banking)',
      deskripsi: 'Membantu pengembangan modul perbankan digital BCA menggunakan Java dan Spring Boot.',
      kuota: 3, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 7, min_ipk: 3.25, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Java', bobot: 2.0, wajib: true },
        { nama: 'Spring Boot', bobot: 1.5, wajib: true },
        { nama: 'PostgreSQL', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[7].id, judul_posisi: 'React Native Developer Intern',
      deskripsi: 'Mengembangkan fitur cross-platform untuk aplikasi Shopee menggunakan React Native.',
      kuota: 3, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(4),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'React Native', bobot: 2.0, wajib: true },
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'TypeScript', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[8].id, judul_posisi: 'QA Engineer Intern',
      deskripsi: 'Melakukan pengujian manual dan otomatis pada aplikasi Tiket.com untuk memastikan kualitas produk.',
      kuota: 2, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 2.80, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Python', bobot: 1.0, wajib: false },
        { nama: 'Problem Solving', bobot: 1.5, wajib: true },
        { nama: 'Komunikasi', bobot: 1.0, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[11].id, judul_posisi: 'Backend Developer Intern (Fintech)',
      deskripsi: 'Membangun dan memelihara API payment gateway Xendit menggunakan Go.',
      kuota: 2, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 7, min_ipk: 3.30, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'Go', bobot: 2.0, wajib: true },
        { nama: 'PostgreSQL', bobot: 1.5, wajib: true },
        { nama: 'Docker', bobot: 1.0, wajib: false },
        { nama: 'Redis', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[12].id, judul_posisi: 'Machine Learning Engineer Intern',
      deskripsi: 'Riset dan implementasi model NLP untuk platform chatbot percakapan Kata.ai.',
      kuota: 2, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 7, min_ipk: 3.40, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'Python', bobot: 2.0, wajib: true },
        { nama: 'Machine Learning', bobot: 2.0, wajib: true },
        { nama: 'TensorFlow', bobot: 1.5, wajib: false },
        { nama: 'Data Analysis', bobot: 1.0, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[15].id, judul_posisi: 'Full Stack Laravel Developer Intern',
      deskripsi: 'Mengembangkan fitur modul HR dan payroll menggunakan Laravel dan Vue.js di platform Mekari.',
      kuota: 4, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'PHP', bobot: 1.5, wajib: true },
        { nama: 'Laravel', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[17].id, judul_posisi: 'Platform Engineer Intern',
      deskripsi: 'Ikut mengembangkan platform belajar coding Dicoding menggunakan Next.js dan microservices.',
      kuota: 5, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(4),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      kompetensi: [
        { nama: 'Next.js', bobot: 1.5, wajib: true },
        { nama: 'TypeScript', bobot: 1.2, wajib: false },
        { nama: 'Node.js', bobot: 1.0, wajib: false },
        { nama: 'Docker', bobot: 0.8, wajib: false },
      ],
    },
    {
      perusahaan_id: perusahaans[19].id, judul_posisi: 'DevOps Engineer Intern',
      deskripsi: 'Membantu pengelolaan infrastruktur cloud dan pipeline CI/CD untuk layanan e-commerce Sirclo.',
      kuota: 2, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 6, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      kompetensi: [
        { nama: 'Docker', bobot: 2.0, wajib: true },
        { nama: 'Linux', bobot: 1.5, wajib: true },
        { nama: 'CI/CD (GitHub Actions)', bobot: 1.5, wajib: false },
        { nama: 'Git', bobot: 1.0, wajib: false },
      ],
    },
  ];

  let lowonganCount = 0;
  for (const l of lowonganData) {
    const { kompetensi, ...lowonganFields } = l;
    const perus = perusahaans.find((p) => p.id === lowonganFields.perusahaan_id);
    const linkPendaftaran = lowonganFields.link_pendaftaran || (perus?.website ? `${perus.website}/careers` : 'https://kampusmerdeka.kemdikbud.go.id/program/magang');

    const existing = await prisma.lowongan_magang.findFirst({
      where: { judul_posisi: lowonganFields.judul_posisi, perusahaan_id: lowonganFields.perusahaan_id },
    });

    let lowongan;
    if (existing) {
      lowongan = await prisma.lowongan_magang.update({
        where: { id: existing.id },
        data: {
          ...lowonganFields,
          link_pendaftaran: linkPendaftaran,
          tgl_buka: new Date(lowonganFields.tgl_buka),
          tgl_tutup: new Date(lowonganFields.tgl_tutup),
        },
      });
    } else {
      lowongan = await prisma.lowongan_magang.create({
        data: {
          ...lowonganFields,
          link_pendaftaran: linkPendaftaran,
          tgl_buka: new Date(lowonganFields.tgl_buka),
          tgl_tutup: new Date(lowonganFields.tgl_tutup),
        },
      });
    }

    // Tambahkan kompetensi yang dibutuhkan
    for (const k of kompetensi) {
      const komp = helper(k.nama);
      if (!komp) continue;
      const existingLK = await prisma.lowongan_kompetensi.findFirst({
        where: { lowongan_id: lowongan.id, kompetensi_id: komp.id },
      });
      if (!existingLK) {
        await prisma.lowongan_kompetensi.create({
          data: {
            lowongan_id: lowongan.id,
            kompetensi_id: komp.id,
            bobot: k.bobot,
            wajib: k.wajib ? 1 : 0,
          },
        });
      }
    }

    lowonganCount++;
  }

  console.log(`Berhasil: ${lowonganCount} lowongan magang dengan kompetensi`);
  console.log('\nSeeding selesai!');
  console.log('========================================');
  console.log('Akun Admin  : admin@magang.com');
  console.log('Password    : AdminPassword123!');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('Seeding gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
