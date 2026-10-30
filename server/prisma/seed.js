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
    { nama_perusahaan: 'PT GoTo Gojek Tokopedia Tbk', bidang_usaha: 'Teknologi & E-Commerce', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', website: 'https://www.gotocompany.com', verified: 1 },
    { nama_perusahaan: 'PT Telkom Indonesia (Persero) Tbk', bidang_usaha: 'Telekomunikasi & Digital Services', kota: 'Bandung', provinsi: 'Jawa Barat', website: 'https://www.telkom.co.id', verified: 1 },
    { nama_perusahaan: 'PT Bank Central Asia Tbk', bidang_usaha: 'Perbankan & Financial Technology', kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', website: 'https://www.bca.co.id', verified: 1 },
    { nama_perusahaan: 'PT Bank Mandiri (Persero) Tbk', bidang_usaha: 'Perbankan & Digital Banking', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', website: 'https://bankmandiri.co.id', verified: 1 },
    { nama_perusahaan: 'PT Shopee International Indonesia', bidang_usaha: 'E-Commerce & Digital Services', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', website: 'https://shopee.co.id', verified: 1 },
    { nama_perusahaan: 'PT Global Tiket Network (Tiket.com)', bidang_usaha: 'Online Travel Agent (OTA)', kota: 'Jakarta Barat', provinsi: 'DKI Jakarta', website: 'https://www.tiket.com', verified: 1 },
    { nama_perusahaan: 'PT Astra International Tbk', bidang_usaha: 'Konglomerasi & Otomotif', kota: 'Jakarta Utara', provinsi: 'DKI Jakarta', website: 'https://www.astra.co.id', verified: 1 },
    { nama_perusahaan: 'PT Ruang Raya Indonesia (Ruangguru)', bidang_usaha: 'Education Technology (EdTech)', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', website: 'https://ruangguru.com', verified: 1 },
    { nama_perusahaan: 'PT Traveloka Indonesia', bidang_usaha: 'Lifestyle & Travel Tech', kota: 'Tangerang', provinsi: 'Banten', website: 'https://www.traveloka.com', verified: 1 },
    { nama_perusahaan: 'PT Global Digital Niaga Tbk (Blibli)', bidang_usaha: 'Omnichannel & E-Commerce', kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', website: 'https://www.blibli.com', verified: 1 },
    { nama_perusahaan: 'PT Dicoding Akademi Indonesia', bidang_usaha: 'Developer Platform & EdTech', kota: 'Bandung', provinsi: 'Jawa Barat', website: 'https://www.dicoding.com', verified: 1 },
    { nama_perusahaan: 'PT Midplaza Prima (Mekari)', bidang_usaha: 'Enterprise SaaS & HR Tech', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', website: 'https://mekari.com', verified: 1 },
    { nama_perusahaan: 'PT Sirclo Digital Kreasi', bidang_usaha: 'E-Commerce Enabler & Cloud Tech', kota: 'Tangerang', provinsi: 'Banten', website: 'https://sirclo.com', verified: 1 },
    { nama_perusahaan: 'PT Kalibrr Technology Indonesia', bidang_usaha: 'Talent Network & HR Tech', kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', website: 'https://www.kalibrr.com', verified: 1 },
  ];

  const perusahaans = [];
  for (const p of perusahaanData) {
    const existing = await prisma.perusahaan.findFirst({ where: { nama_perusahaan: p.nama_perusahaan } });
    let per;
    if (existing) {
      per = await prisma.perusahaan.update({
        where: { id: existing.id },
        data: p,
      });
    } else {
      per = await prisma.perusahaan.create({ data: p });
    }
    perusahaans.push(per);
  }
  console.log(`Berhasil: ${perusahaans.length} perusahaan mitra`);

  // ─── 6. Lowongan Magang ────────────────────────────────────────────
  const helper = (name) => komps.find((k) => k.nama_kompetensi === name);

  const today = new Date();
  const buka = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const tutup = (m) => new Date(today.getFullYear(), today.getMonth() + m, 0).toISOString();

  const lowonganData = [
    {
      nama_perusahaan: 'PT GoTo Gojek Tokopedia Tbk',
      judul_posisi: 'Frontend Engineer Intern',
      deskripsi: 'Mengembangkan antarmuka web modern pada ekosistem GoTo menggunakan React.js dan Next.js, berkolaborasi dengan Product Designer dan Backend Engineer.',
      kuota: 5, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://www.gotocompany.com/en/careers',
      kompetensi: [
        { nama: 'React.js', bobot: 1.5, wajib: true },
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'Git', bobot: 1.0, wajib: false },
        { nama: 'TypeScript', bobot: 1.0, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT GoTo Gojek Tokopedia Tbk',
      judul_posisi: 'Backend Engineer Intern',
      deskripsi: 'Membangun dan mengoptimasi RESTful & gRPC API berskala jutaan pengguna harian menggunakan Node.js dan MySQL di ekosistem GoTo.',
      kuota: 4, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://www.gotocompany.com/en/careers',
      kompetensi: [
        { nama: 'Node.js', bobot: 1.5, wajib: true },
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Docker', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT GoTo Gojek Tokopedia Tbk',
      judul_posisi: 'Android Developer Intern',
      deskripsi: 'Mengembangkan fitur baru pada aplikasi Android Gojek menggunakan Kotlin, Coroutines, dan clean architecture standar industri Google.',
      kuota: 3, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 6, min_ipk: 3.20, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://www.gotocompany.com/en/careers',
      kompetensi: [
        { nama: 'Kotlin', bobot: 2.0, wajib: true },
        { nama: 'Android Native', bobot: 2.0, wajib: true },
        { nama: 'Git', bobot: 0.8, wajib: false },
        { nama: 'Problem Solving', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT GoTo Gojek Tokopedia Tbk',
      judul_posisi: 'Data Analyst & BI Intern',
      deskripsi: 'Menganalisis performa bisnis, membuat dashboard analitik interaktif, dan memproses data operasional berskala besar menggunakan SQL dan Python.',
      kuota: 3, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.10, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://www.gotocompany.com/en/careers',
      kompetensi: [
        { nama: 'Python', bobot: 1.5, wajib: true },
        { nama: 'Data Analysis', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Machine Learning', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Telkom Indonesia (Persero) Tbk',
      judul_posisi: 'Digistar Software Engineer Intern',
      deskripsi: 'Program magang resmi Digistar Telkom Indonesia. Berkontribusi dalam perancangan arsitektur sistem digital dan implementasi microservices telekomunikasi.',
      kuota: 6, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://internship.telkom.co.id/',
      kompetensi: [
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'Python', bobot: 1.2, wajib: false },
        { nama: 'Docker', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: true },
      ],
    },
    {
      nama_perusahaan: 'PT Telkom Indonesia (Persero) Tbk',
      judul_posisi: 'Digistar Network & Cloud Engineer Intern',
      deskripsi: 'Mendukung tim infrastruktur Telkom dalam pengelolaan jaringan telekomunikasi nasional, administrasi Linux servers, dan otomatisasi deployment.',
      kuota: 4, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 5, min_ipk: 2.80, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://internship.telkom.co.id/',
      kompetensi: [
        { nama: 'Linux', bobot: 1.8, wajib: true },
        { nama: 'Docker', bobot: 1.2, wajib: true },
        { nama: 'CI/CD (GitHub Actions)', bobot: 1.0, wajib: false },
        { nama: 'Problem Solving', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Bank Central Asia Tbk',
      judul_posisi: 'IT Developer Trainee / Intern',
      deskripsi: 'Program pemagangan IT perbankan resmi BCA. Membantu pengembangan modul aplikasi perbankan digital menggunakan Java, Spring Boot, dan database relational.',
      kuota: 5, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 6, min_ipk: 3.25, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://karir.bca.co.id/',
      kompetensi: [
        { nama: 'Java', bobot: 2.0, wajib: true },
        { nama: 'Spring Boot', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Problem Solving', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Bank Mandiri (Persero) Tbk',
      judul_posisi: 'Digital Banking IT Intern',
      deskripsi: 'Membantu riset dan implementasi sistem perbankan digital, pengujian API keuangan modern, serta eksplorasi arsitektur perbankan masa depan di Bank Mandiri.',
      kuota: 4, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 6, min_ipk: 3.20, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://bankmandiri.co.id/karir',
      kompetensi: [
        { nama: 'Java', bobot: 1.8, wajib: true },
        { nama: 'MySQL', bobot: 1.2, wajib: true },
        { nama: 'Problem Solving', bobot: 1.0, wajib: false },
        { nama: 'Komunikasi', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Shopee International Indonesia',
      judul_posisi: 'Mobile Developer Intern (React Native)',
      deskripsi: 'Program magang Shopee Apprentice. Mengembangkan modul mobile e-commerce multi-platform menggunakan React Native dan TypeScript bersama tim engineer Shopee.',
      kuota: 3, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(4),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://careers.shopee.co.id/',
      kompetensi: [
        { nama: 'React Native', bobot: 2.0, wajib: true },
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'TypeScript', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Global Tiket Network (Tiket.com)',
      judul_posisi: 'QA & Software Development in Test Intern',
      deskripsi: 'Merancang test scenarios, mengotomasi end-to-end testing web & mobile, dan memastikan keandalan performa platform pemesanan tiket online tiket.com.',
      kuota: 3, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 2.80, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://careers.tiket.com/',
      kompetensi: [
        { nama: 'Python', bobot: 1.2, wajib: false },
        { nama: 'Problem Solving', bobot: 1.5, wajib: true },
        { nama: 'Git', bobot: 1.0, wajib: false },
        { nama: 'Komunikasi', bobot: 1.0, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Astra International Tbk',
      judul_posisi: 'IT & Digital Transformation Intern',
      deskripsi: 'Program pemagangan resmi Grup Astra untuk digitalisasi lini bisnis otomotif, integrasi sistem enterprise, dan analitik data operasional.',
      kuota: 4, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://career.astra.co.id/',
      kompetensi: [
        { nama: 'Python', bobot: 1.5, wajib: true },
        { nama: 'Data Analysis', bobot: 1.2, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Problem Solving', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Ruang Raya Indonesia (Ruangguru)',
      judul_posisi: 'Ruangguru LEAP Software Engineer Intern',
      deskripsi: 'Program akselerasi talenta Ruangguru LEAP. Membangun platform teknologi edukasi interaktif bagi jutaan siswa menggunakan React.js dan Node.js.',
      kuota: 5, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://career.ruangguru.com/',
      kompetensi: [
        { nama: 'JavaScript', bobot: 1.5, wajib: true },
        { nama: 'React.js', bobot: 1.5, wajib: true },
        { nama: 'Node.js', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: true },
      ],
    },
    {
      nama_perusahaan: 'PT Traveloka Indonesia',
      judul_posisi: 'iOS Developer Intern',
      deskripsi: 'Membantu riset dan pembuatan fitur antarmuka aplikasi Traveloka di platform iOS menggunakan Swift dan Apple Human Interface Guidelines.',
      kuota: 2, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(2),
      min_semester: 6, min_ipk: 3.30, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://www.traveloka.com/en-id/careers',
      kompetensi: [
        { nama: 'Swift', bobot: 2.0, wajib: true },
        { nama: 'Git', bobot: 1.0, wajib: false },
        { nama: 'Problem Solving', bobot: 1.0, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Global Digital Niaga Tbk (Blibli)',
      judul_posisi: 'Full Stack Developer Intern (Future Program)',
      deskripsi: 'Program magang Blibli Future Program untuk mahasiswa tingkat akhir. Terlibat langsung dalam pengembangan arsitektur e-commerce omnichannel modern.',
      kuota: 4, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(4),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://careers.blibli.com/',
      kompetensi: [
        { nama: 'React.js', bobot: 1.5, wajib: true },
        { nama: 'Java', bobot: 1.2, wajib: false },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Dicoding Akademi Indonesia',
      judul_posisi: 'Platform Engineer Intern',
      deskripsi: 'Ikut mengembangkan platform belajar coding online terbesar di Indonesia menggunakan Next.js, TypeScript, dan automasi grading sistem.',
      kuota: 4, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(4),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://www.dicoding.com/jobs',
      kompetensi: [
        { nama: 'Next.js', bobot: 1.5, wajib: true },
        { nama: 'TypeScript', bobot: 1.5, wajib: true },
        { nama: 'Node.js', bobot: 1.0, wajib: false },
        { nama: 'Docker', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Midplaza Prima (Mekari)',
      judul_posisi: 'Full Stack Web Developer Intern (Laravel)',
      deskripsi: 'Mengembangkan fitur SaaS otomasi bisnis, HR payroll, dan akuntansi berbasis web menggunakan PHP Laravel dan arsitektur REST API modern.',
      kuota: 4, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 5, min_ipk: 3.00, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://mekari.com/careers/',
      kompetensi: [
        { nama: 'PHP', bobot: 1.5, wajib: true },
        { nama: 'Laravel', bobot: 1.5, wajib: true },
        { nama: 'MySQL', bobot: 1.0, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Sirclo Digital Kreasi',
      judul_posisi: 'Cloud Infrastructure & DevOps Intern',
      deskripsi: 'Membantu pengelolaan container Docker, orkestrasi cloud, serta pipeline continuous integration (CI/CD) untuk platform e-commerce enabler.',
      kuota: 3, durasi_bulan: 3, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 6, min_ipk: 3.00, is_remote: 0, status: 'aktif',
      link_pendaftaran: 'https://sirclo.com/careers/',
      kompetensi: [
        { nama: 'Docker', bobot: 2.0, wajib: true },
        { nama: 'Linux', bobot: 1.5, wajib: true },
        { nama: 'CI/CD (GitHub Actions)', bobot: 1.2, wajib: false },
        { nama: 'Git', bobot: 0.8, wajib: false },
      ],
    },
    {
      nama_perusahaan: 'PT Kalibrr Technology Indonesia',
      judul_posisi: 'Machine Learning & AI Engineer Intern',
      deskripsi: 'Melakukan riset algoritma rekomendasi karier berbasis pemrosesan bahasa alami (NLP) dan integrasi model machine learning ke dalam sistem produksi.',
      kuota: 3, durasi_bulan: 6, tgl_buka: buka, tgl_tutup: tutup(3),
      min_semester: 6, min_ipk: 3.30, is_remote: 1, status: 'aktif',
      link_pendaftaran: 'https://www.kalibrr.com/job-board/te/internship/1',
      kompetensi: [
        { nama: 'Python', bobot: 2.0, wajib: true },
        { nama: 'Machine Learning', bobot: 2.0, wajib: true },
        { nama: 'TensorFlow', bobot: 1.2, wajib: false },
        { nama: 'Data Analysis', bobot: 1.0, wajib: false },
      ],
    },
  ];

  // Hapus semua lowongan lama agar hanya lowongan resmi terverifikasi yang tersimpan
  await prisma.lowongan_magang.deleteMany();

  let lowonganCount = 0;
  for (const l of lowonganData) {
    const { kompetensi, nama_perusahaan, ...lowonganFields } = l;
    const perus = perusahaans.find((p) => p.nama_perusahaan === nama_perusahaan);
    if (!perus) continue;

    const lowongan = await prisma.lowongan_magang.create({
      data: {
        ...lowonganFields,
        perusahaan_id: perus.id,
        tgl_buka: new Date(lowonganFields.tgl_buka),
        tgl_tutup: new Date(lowonganFields.tgl_tutup),
      },
    });

    // Tambahkan kompetensi yang dibutuhkan
    for (const k of kompetensi) {
      const komp = helper(k.nama);
      if (!komp) continue;
      await prisma.lowongan_kompetensi.create({
        data: {
          lowongan_id: lowongan.id,
          kompetensi_id: komp.id,
          bobot: k.bobot,
          wajib: k.wajib ? 1 : 0,
        },
      });
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
