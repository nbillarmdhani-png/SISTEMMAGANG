-- =============================================================
-- db_magang_full.sql
-- Sistem Rekomendasi Magang — Schema + Data Dummy
-- Import ke phpMyAdmin: pilih database > tab Import > pilih file ini
--
-- Akun Default:
--   Admin     : admin@magang.com     | AdminPassword123!
--   Mahasiswa : mahasiswa@magang.com | MahasiswaPassword123!
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS `db_magang`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_magang`;

-- ----------------------------
-- 1. TABEL users
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','mahasiswa','dosen','perusahaan') NOT NULL DEFAULT 'mahasiswa',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 2. TABEL program_studi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `program_studi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kode_prodi` VARCHAR(10) NOT NULL,
  `nama_prodi` VARCHAR(100) NOT NULL,
  `fakultas` VARCHAR(100) NOT NULL,
  `jenjang` ENUM('D3','S1','S2') NOT NULL DEFAULT 'S1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prodi_kode` (`kode_prodi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 3. TABEL mahasiswa
-- ----------------------------
CREATE TABLE IF NOT EXISTS `mahasiswa` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `prodi_id` INT NOT NULL,
  `nim` VARCHAR(20) NOT NULL,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `semester` TINYINT NOT NULL DEFAULT 1,
  `ipk` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `foto` VARCHAR(255) DEFAULT NULL,
  `no_telp` VARCHAR(20) DEFAULT NULL,
  `alamat` TEXT DEFAULT NULL,
  `cv_path` VARCHAR(255) DEFAULT NULL,
  `porto_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mahasiswa_nim` (`nim`),
  UNIQUE KEY `uq_mahasiswa_user` (`user_id`),
  INDEX `idx_mahasiswa_prodi` (`prodi_id`),
  CONSTRAINT `fk_mahasiswa_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mahasiswa_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 4. TABEL kategori_kompetensi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `kategori_kompetensi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama_kategori` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kategori_nama` (`nama_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 5. TABEL kompetensi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `kompetensi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `kategori_id` INT NOT NULL,
  `nama_kompetensi` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kompetensi_nama` (`nama_kompetensi`),
  INDEX `idx_kompetensi_kategori` (`kategori_id`),
  CONSTRAINT `fk_kompetensi_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_kompetensi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 6. TABEL mahasiswa_kompetensi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `mahasiswa_kompetensi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` INT NOT NULL,
  `kompetensi_id` INT NOT NULL,
  `level` ENUM('pemula','menengah','mahir') NOT NULL DEFAULT 'pemula',
  `sumber` ENUM('manual','chatbot','import') NOT NULL DEFAULT 'manual',
  `bukti_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mahasiswa_kompetensi` (`mahasiswa_id`,`kompetensi_id`),
  INDEX `idx_mk_kompetensi` (`kompetensi_id`),
  CONSTRAINT `fk_mk_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mk_kompetensi` FOREIGN KEY (`kompetensi_id`) REFERENCES `kompetensi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 7. TABEL perusahaan
-- ----------------------------
CREATE TABLE IF NOT EXISTS `perusahaan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `nama_perusahaan` VARCHAR(150) NOT NULL,
  `bidang_usaha` VARCHAR(100) DEFAULT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `alamat` TEXT DEFAULT NULL,
  `kota` VARCHAR(100) DEFAULT NULL,
  `provinsi` VARCHAR(100) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `logo` VARCHAR(255) DEFAULT NULL,
  `email_kontak` VARCHAR(150) DEFAULT NULL,
  `no_telp` VARCHAR(20) DEFAULT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_perusahaan_kota` (`kota`),
  INDEX `idx_perusahaan_verified` (`verified`),
  CONSTRAINT `fk_perusahaan_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 8. TABEL lowongan_magang
-- ----------------------------
CREATE TABLE IF NOT EXISTS `lowongan_magang` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `perusahaan_id` INT NOT NULL,
  `judul_posisi` VARCHAR(150) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `kuota` INT NOT NULL DEFAULT 1,
  `durasi_bulan` TINYINT NOT NULL DEFAULT 3,
  `tgl_buka` DATE NOT NULL,
  `tgl_tutup` DATE NOT NULL,
  `min_semester` TINYINT DEFAULT NULL,
  `min_ipk` DECIMAL(3,2) DEFAULT NULL,
  `is_remote` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft','aktif','ditutup') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lowongan_perusahaan` (`perusahaan_id`),
  INDEX `idx_lowongan_status` (`status`),
  INDEX `idx_lowongan_tgl_tutup` (`tgl_tutup`),
  CONSTRAINT `fk_lowongan_perusahaan` FOREIGN KEY (`perusahaan_id`) REFERENCES `perusahaan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 9. TABEL lowongan_kompetensi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `lowongan_kompetensi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lowongan_id` INT NOT NULL,
  `kompetensi_id` INT NOT NULL,
  `bobot` DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  `wajib` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lowongan_kompetensi` (`lowongan_id`,`kompetensi_id`),
  INDEX `idx_lk_kompetensi` (`kompetensi_id`),
  CONSTRAINT `fk_lk_lowongan` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lk_kompetensi` FOREIGN KEY (`kompetensi_id`) REFERENCES `kompetensi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 10. TABEL rekomendasi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `rekomendasi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` INT NOT NULL,
  `lowongan_id` INT NOT NULL,
  `skor_kecocokan` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `metode` VARCHAR(50) NOT NULL DEFAULT 'SAW',
  `detail_perhitungan` JSON DEFAULT NULL,
  `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_rek_mahasiswa` (`mahasiswa_id`),
  INDEX `idx_rek_lowongan` (`lowongan_id`),
  INDEX `idx_rek_skor` (`skor_kecocokan` DESC),
  INDEX `idx_rek_generated` (`generated_at`),
  CONSTRAINT `fk_rek_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rek_lowongan` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 11. TABEL chatbot_sesi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `chatbot_sesi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` INT NOT NULL,
  `judul_sesi` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('aktif','selesai','dibatalkan') NOT NULL DEFAULT 'aktif',
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_sesi_mahasiswa` (`mahasiswa_id`),
  INDEX `idx_sesi_status` (`status`),
  CONSTRAINT `fk_sesi_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 12. TABEL chatbot_pesan
-- ----------------------------
CREATE TABLE IF NOT EXISTS `chatbot_pesan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sesi_id` INT NOT NULL,
  `peran` ENUM('user','bot') NOT NULL,
  `isi_pesan` TEXT NOT NULL,
  `intent` VARCHAR(100) DEFAULT NULL,
  `entitas` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pesan_sesi` (`sesi_id`),
  INDEX `idx_pesan_created` (`created_at`),
  CONSTRAINT `fk_pesan_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `chatbot_sesi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 13. TABEL chatbot_kompetensi_terdeteksi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `chatbot_kompetensi_terdeteksi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sesi_id` INT NOT NULL,
  `kompetensi_id` INT NOT NULL,
  `level` ENUM('pemula','menengah','mahir') NOT NULL DEFAULT 'pemula',
  `confidence` DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  `dikonfirmasi` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ckt_sesi` (`sesi_id`),
  INDEX `idx_ckt_kompetensi` (`kompetensi_id`),
  CONSTRAINT `fk_ckt_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `chatbot_sesi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ckt_kompetensi` FOREIGN KEY (`kompetensi_id`) REFERENCES `kompetensi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 14. TABEL lamaran
-- ----------------------------
CREATE TABLE IF NOT EXISTS `lamaran` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` INT NOT NULL,
  `lowongan_id` INT NOT NULL,
  `sumber_rekomendasi` TINYINT(1) NOT NULL DEFAULT 0,
  `surat_pengantar` TEXT DEFAULT NULL,
  `status` ENUM('menunggu','diterima','ditolak','dibatalkan') NOT NULL DEFAULT 'menunggu',
  `tgl_lamar` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tgl_respons` TIMESTAMP NULL DEFAULT NULL,
  `catatan_perusahaan` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lamaran` (`mahasiswa_id`,`lowongan_id`),
  INDEX `idx_lamaran_lowongan` (`lowongan_id`),
  INDEX `idx_lamaran_status` (`status`),
  CONSTRAINT `fk_lamaran_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lamaran_lowongan` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 15. TABEL notifikasi
-- ----------------------------
CREATE TABLE IF NOT EXISTS `notifikasi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `judul` VARCHAR(200) NOT NULL,
  `pesan` TEXT NOT NULL,
  `tipe` VARCHAR(50) DEFAULT NULL,
  `referensi_id` INT DEFAULT NULL,
  `dibaca` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_dibaca` (`dibaca`),
  INDEX `idx_notif_created` (`created_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- INSERT DATA
-- Catatan Password:
--   AdminPassword123!     → hash bcrypt cost 12
--   MahasiswaPassword123! → hash bcrypt cost 12
-- ============================================================

-- Users (password di-hash menggunakan bcrypt cost 12)
-- Untuk generate ulang hash: jalankan node create_admin.js & create_mahasiswa.js
-- Password admin: AdminPassword123!
-- Password mahasiswa: MahasiswaPassword123!
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `role`, `is_active`) VALUES
(1, 'admin@magang.com',     '$2b$12$gXvmlXqDw7DTsLr4N.QK8enHcIBz9XUCADr7Ym8hojikB7uQ9FlfC', 'admin',     1),
(2, 'mahasiswa@magang.com', '$2b$12$ppy8TKjh4K697HZjF7xAEe24/oME0xrxV7BhM1AUY9K9CLX9yKLNG', 'mahasiswa', 1);

-- Program Studi
INSERT IGNORE INTO `program_studi` (`id`, `kode_prodi`, `nama_prodi`, `fakultas`, `jenjang`) VALUES
(1, 'TI',  'Teknik Informatika',        'Fakultas Ilmu Komputer', 'S1'),
(2, 'SI',  'Sistem Informasi',          'Fakultas Ilmu Komputer', 'S1'),
(3, 'SK',  'Sains Komputasi',           'Fakultas Ilmu Komputer', 'S1'),
(4, 'RPL', 'Rekayasa Perangkat Lunak',  'Fakultas Ilmu Komputer', 'S1');

-- Mahasiswa Dummy
INSERT IGNORE INTO `mahasiswa` (`id`, `user_id`, `prodi_id`, `nim`, `nama_lengkap`, `semester`, `ipk`) VALUES
(1, 2, 1, '1234567890', 'Budi Mahasiswa', 5, 3.75);

-- Kategori Kompetensi
INSERT IGNORE INTO `kategori_kompetensi` (`id`, `nama_kategori`, `deskripsi`) VALUES
(1, 'Bahasa Pemrograman',  'Kemampuan bahasa pemrograman'),
(2, 'Framework & Library', 'Framework dan library populer'),
(3, 'Basis Data',          'Manajemen basis data'),
(4, 'DevOps & Cloud',      'Tools deployment dan infrastruktur'),
(5, 'Soft Skills',         'Kemampuan interpersonal'),
(6, 'Mobile Development',  'Pengembangan aplikasi mobile'),
(7, 'Data Science & AI',   'Analisis data dan kecerdasan buatan');

-- Kompetensi
INSERT IGNORE INTO `kompetensi` (`id`, `kategori_id`, `nama_kompetensi`) VALUES
-- Bahasa Pemrograman
(1,  1, 'JavaScript'),
(2,  1, 'Python'),
(3,  1, 'Java'),
(4,  1, 'TypeScript'),
(5,  1, 'Go'),
(6,  1, 'PHP'),
(7,  1, 'Kotlin'),
(8,  1, 'Swift'),
-- Framework & Library
(9,  2, 'React.js'),
(10, 2, 'Node.js'),
(11, 2, 'Express.js'),
(12, 2, 'Next.js'),
(13, 2, 'Laravel'),
(14, 2, 'Spring Boot'),
(15, 2, 'Django'),
(16, 2, 'Flutter'),
-- Basis Data
(17, 3, 'MySQL'),
(18, 3, 'PostgreSQL'),
(19, 3, 'MongoDB'),
(20, 3, 'Redis'),
(21, 3, 'Prisma ORM'),
-- DevOps & Cloud
(22, 4, 'Docker'),
(23, 4, 'Git'),
(24, 4, 'Linux'),
(25, 4, 'CI/CD (GitHub Actions)'),
-- Soft Skills
(26, 5, 'Komunikasi'),
(27, 5, 'Kerja Tim'),
(28, 5, 'Problem Solving'),
-- Mobile
(29, 6, 'Android Native'),
(30, 6, 'React Native'),
-- Data Science & AI
(31, 7, 'Machine Learning'),
(32, 7, 'Data Analysis'),
(33, 7, 'TensorFlow');

-- Perusahaan Mitra (20 perusahaan)
INSERT IGNORE INTO `perusahaan` (`id`, `nama_perusahaan`, `bidang_usaha`, `kota`, `provinsi`, `website`, `verified`) VALUES
(1,  'PT Tokopedia',                   'E-Commerce',                     'Jakarta',  'DKI Jakarta', 'https://tokopedia.com',   1),
(2,  'PT Gojek Indonesia',             'Transportasi & Teknologi',        'Jakarta',  'DKI Jakarta', 'https://gojek.com',       1),
(3,  'PT Bukalapak',                   'E-Commerce',                     'Jakarta',  'DKI Jakarta', 'https://bukalapak.com',   1),
(4,  'PT Traveloka',                   'Travel & Pariwisata',            'Jakarta',  'DKI Jakarta', 'https://traveloka.com',   1),
(5,  'PT Ruangguru',                   'EdTech',                         'Jakarta',  'DKI Jakarta', 'https://ruangguru.com',   1),
(6,  'PT Telkom Indonesia',            'Telekomunikasi',                 'Bandung',  'Jawa Barat',  'https://telkom.co.id',    1),
(7,  'PT Bank BCA Tbk',                'Perbankan & Fintech',            'Jakarta',  'DKI Jakarta', 'https://bca.co.id',       1),
(8,  'PT Shopee Indonesia',            'E-Commerce',                     'Jakarta',  'DKI Jakarta', 'https://shopee.co.id',    1),
(9,  'PT Tiket.com',                   'Travel & Teknologi',             'Jakarta',  'DKI Jakarta', 'https://tiket.com',       1),
(10, 'PT Kalibrr Indonesia',           'HR Tech',                        'Jakarta',  'DKI Jakarta', 'https://kalibrr.com',     1),
(11, 'PT Blibli',                      'E-Commerce',                     'Jakarta',  'DKI Jakarta', 'https://blibli.com',      1),
(12, 'PT Xendit',                      'Fintech & Pembayaran',           'Jakarta',  'DKI Jakarta', 'https://xendit.co',       1),
(13, 'PT Kata.ai',                     'AI & NLP',                       'Jakarta',  'DKI Jakarta', 'https://kata.ai',         1),
(14, 'PT Midtrans',                    'Fintech & Payment Gateway',      'Jakarta',  'DKI Jakarta', 'https://midtrans.com',    1),
(15, 'PT Astra International',         'Otomotif & Teknologi',           'Jakarta',  'DKI Jakarta', 'https://astra.co.id',     1),
(16, 'PT Mekari',                      'SaaS & HR Tech',                 'Jakarta',  'DKI Jakarta', 'https://mekari.com',      1),
(17, 'PT Wahana Prestasi Logistik',    'Logistik & Supply Chain',        'Surabaya', 'Jawa Timur',  'https://wahana.com',      1),
(18, 'PT Dicoding Indonesia',          'EdTech & Developer Platform',    'Bandung',  'Jawa Barat',  'https://dicoding.com',    1),
(19, 'PT Pinhome',                     'PropTech',                       'Jakarta',  'DKI Jakarta', 'https://pinhome.id',      1),
(20, 'PT Sirclo Commerce',             'E-Commerce Enabler',             'Jakarta',  'DKI Jakarta', 'https://sirclo.com',      1);

-- Lowongan Magang (16 lowongan aktif sampai akhir 2026)
INSERT IGNORE INTO `lowongan_magang` (`id`, `perusahaan_id`, `judul_posisi`, `deskripsi`, `kuota`, `durasi_bulan`, `tgl_buka`, `tgl_tutup`, `min_semester`, `min_ipk`, `is_remote`, `status`) VALUES
(1,  1,  'Frontend Engineer Intern',          'Mengembangkan antarmuka web menggunakan React.js dan berkolaborasi dengan desainer UI/UX.',                                5, 3, '2026-01-01', '2026-12-31', 5, 3.00, 0, 'aktif'),
(2,  1,  'Backend Engineer Intern',           'Membangun layanan API menggunakan Node.js dan Express.js, integrasi dengan berbagai layanan internal.',                   3, 3, '2026-01-01', '2026-12-31', 5, 3.00, 0, 'aktif'),
(3,  2,  'Android Developer Intern',          'Mengembangkan fitur baru pada aplikasi Gojek menggunakan Kotlin dan mengikuti coding standard Google.',                   4, 6, '2026-01-01', '2026-12-31', 6, 3.20, 0, 'aktif'),
(4,  2,  'Data Analyst Intern',               'Menganalisis data operasional Gojek untuk meningkatkan pengambilan keputusan bisnis.',                                     2, 3, '2026-01-01', '2026-12-31', 5, 3.10, 1, 'aktif'),
(5,  3,  'Full Stack Developer Intern',       'Mengembangkan fitur end-to-end menggunakan React.js dan Node.js pada platform Bukalapak.',                                 4, 3, '2026-01-01', '2026-12-31', 5, 3.00, 1, 'aktif'),
(6,  4,  'iOS Developer Intern',              'Membantu pengembangan fitur baru pada aplikasi iOS Traveloka menggunakan Swift.',                                           2, 3, '2026-01-01', '2026-12-31', 7, 3.30, 0, 'aktif'),
(7,  5,  'Software Engineer Intern',          'Berkontribusi pada pengembangan platform belajar Ruangguru menggunakan berbagai teknologi modern.',                        6, 3, '2026-01-01', '2026-12-31', 5, 3.00, 1, 'aktif'),
(8,  6,  'Network Engineer Intern',           'Mendukung tim jaringan Telkom dalam pengelolaan infrastruktur jaringan nasional.',                                          4, 6, '2026-01-01', '2026-12-31', 5, 2.75, 0, 'aktif'),
(9,  7,  'IT Developer Intern (Core Banking)','Membantu pengembangan modul perbankan digital BCA menggunakan Java dan Spring Boot.',                                       3, 6, '2026-01-01', '2026-12-31', 7, 3.25, 0, 'aktif'),
(10, 8,  'React Native Developer Intern',     'Mengembangkan fitur cross-platform untuk aplikasi Shopee menggunakan React Native.',                                        3, 3, '2026-01-01', '2026-12-31', 5, 3.00, 1, 'aktif'),
(11, 9,  'QA Engineer Intern',               'Melakukan pengujian manual dan otomatis pada aplikasi Tiket.com untuk memastikan kualitas produk.',                        2, 3, '2026-01-01', '2026-12-31', 5, 2.80, 0, 'aktif'),
(12, 12, 'Backend Developer Intern (Fintech)','Membangun dan memelihara API payment gateway Xendit menggunakan Go.',                                                       2, 6, '2026-01-01', '2026-12-31', 7, 3.30, 1, 'aktif'),
(13, 13, 'Machine Learning Engineer Intern',  'Riset dan implementasi model NLP untuk platform chatbot percakapan Kata.ai.',                                               2, 6, '2026-01-01', '2026-12-31', 7, 3.40, 1, 'aktif'),
(14, 16, 'Full Stack Laravel Developer Intern','Mengembangkan fitur modul HR dan payroll menggunakan Laravel di platform Mekari.',                                         4, 3, '2026-01-01', '2026-12-31', 5, 3.00, 1, 'aktif'),
(15, 18, 'Platform Engineer Intern',          'Ikut mengembangkan platform belajar coding Dicoding menggunakan Next.js dan microservices.',                               5, 3, '2026-01-01', '2026-12-31', 5, 3.00, 1, 'aktif'),
(16, 20, 'DevOps Engineer Intern',            'Membantu pengelolaan infrastruktur cloud dan pipeline CI/CD untuk layanan e-commerce Sirclo.',                             2, 3, '2026-01-01', '2026-12-31', 6, 3.00, 0, 'aktif');

-- Lowongan Kompetensi (mapping posisi ke kompetensi)
INSERT IGNORE INTO `lowongan_kompetensi` (`lowongan_id`, `kompetensi_id`, `bobot`, `wajib`) VALUES
-- Lowongan 1: Frontend Engineer (Tokopedia)
(1, 1,  1.50, 1), -- JavaScript - wajib
(1, 9,  1.50, 1), -- React.js - wajib
(1, 23, 1.00, 0), -- Git
(1, 4,  1.00, 0), -- TypeScript
-- Lowongan 2: Backend Engineer (Tokopedia)
(2, 1,  1.50, 1), -- JavaScript - wajib
(2, 10, 1.50, 1), -- Node.js - wajib
(2, 17, 1.00, 0), -- MySQL
(2, 22, 0.80, 0), -- Docker
-- Lowongan 3: Android Developer (Gojek)
(3, 7,  2.00, 1), -- Kotlin - wajib
(3, 29, 2.00, 1), -- Android Native - wajib
(3, 23, 0.80, 0), -- Git
(3, 17, 0.50, 0), -- MySQL
-- Lowongan 4: Data Analyst (Gojek)
(4, 2,  1.50, 1), -- Python - wajib
(4, 32, 1.50, 1), -- Data Analysis - wajib
(4, 17, 1.00, 0), -- MySQL
(4, 31, 0.80, 0), -- Machine Learning
-- Lowongan 5: Full Stack Developer (Bukalapak)
(5, 9,  1.20, 1), -- React.js - wajib
(5, 10, 1.20, 1), -- Node.js - wajib
(5, 17, 1.00, 0), -- MySQL
(5, 23, 0.80, 0), -- Git
-- Lowongan 6: iOS Developer (Traveloka)
(6, 8,  2.00, 1), -- Swift - wajib
(6, 23, 0.80, 0), -- Git
(6, 28, 0.80, 0), -- Problem Solving
-- Lowongan 7: Software Engineer (Ruangguru)
(7, 1,  1.20, 1), -- JavaScript - wajib
(7, 23, 0.80, 1), -- Git - wajib
(7, 9,  1.20, 0), -- React.js
(7, 2,  1.00, 0), -- Python
-- Lowongan 8: Network Engineer (Telkom)
(8, 24, 1.50, 1), -- Linux - wajib
(8, 22, 1.00, 0), -- Docker
(8, 25, 0.80, 0), -- CI/CD
-- Lowongan 9: IT Developer BCA (Core Banking)
(9, 3,  2.00, 1), -- Java - wajib
(9, 14, 1.50, 1), -- Spring Boot - wajib
(9, 18, 1.00, 0), -- PostgreSQL
(9, 23, 0.80, 0), -- Git
-- Lowongan 10: React Native (Shopee)
(10, 30, 2.00, 1), -- React Native - wajib
(10, 1,  1.50, 1), -- JavaScript - wajib
(10, 4,  0.80, 0), -- TypeScript
-- Lowongan 11: QA Engineer (Tiket.com)
(11, 28, 1.50, 1), -- Problem Solving - wajib
(11, 2,  1.00, 0), -- Python
(11, 26, 1.00, 0), -- Komunikasi
-- Lowongan 12: Backend Fintech (Xendit)
(12, 5,  2.00, 1), -- Go - wajib
(12, 18, 1.50, 1), -- PostgreSQL - wajib
(12, 22, 1.00, 0), -- Docker
(12, 20, 0.80, 0), -- Redis
-- Lowongan 13: ML Engineer (Kata.ai)
(13, 2,  2.00, 1), -- Python - wajib
(13, 31, 2.00, 1), -- Machine Learning - wajib
(13, 33, 1.50, 0), -- TensorFlow
(13, 32, 1.00, 0), -- Data Analysis
-- Lowongan 14: Laravel Developer (Mekari)
(14, 6,  1.50, 1), -- PHP - wajib
(14, 13, 1.50, 1), -- Laravel - wajib
(14, 17, 1.00, 0), -- MySQL
(14, 23, 0.80, 0), -- Git
-- Lowongan 15: Platform Engineer (Dicoding)
(15, 12, 1.50, 1), -- Next.js - wajib
(15, 4,  1.20, 0), -- TypeScript
(15, 10, 1.00, 0), -- Node.js
(15, 22, 0.80, 0), -- Docker
-- Lowongan 16: DevOps Engineer (Sirclo)
(16, 22, 2.00, 1), -- Docker - wajib
(16, 24, 1.50, 1), -- Linux - wajib
(16, 25, 1.50, 0), -- CI/CD
(16, 23, 1.00, 0); -- Git

-- Kompetensi Dummy Mahasiswa (untuk uji rekomendasi)
INSERT IGNORE INTO `mahasiswa_kompetensi` (`mahasiswa_id`, `kompetensi_id`, `level`, `sumber`) VALUES
(1, 1,  'mahir',    'manual'), -- JavaScript
(1, 9,  'menengah', 'manual'), -- React.js
(1, 10, 'pemula',   'manual'), -- Node.js
(1, 17, 'menengah', 'manual'), -- MySQL
(1, 23, 'mahir',    'manual'); -- Git

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- CATATAN PENTING - RESET PASSWORD
-- ============================================================
-- Hash di atas adalah placeholder. Setelah import, jalankan:
--   1. Pastikan server backend berjalan (npm run dev di folder server)
--   2. Jalankan: node create_admin.js
--   3. Jalankan: node create_mahasiswa.js
-- Script tersebut akan menimpa hash dengan hash bcrypt yang benar.
--
-- ATAU gunakan phpMyAdmin untuk UPDATE manual:
--   UPDATE users SET password = 'hash_baru' WHERE email = 'admin@magang.com';
-- ============================================================
