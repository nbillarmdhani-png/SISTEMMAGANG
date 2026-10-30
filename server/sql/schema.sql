CREATE DATABASE IF NOT EXISTS db_magang
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE db_magang;

-- 1. users
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','mahasiswa','dosen','perusahaan') NOT NULL DEFAULT 'mahasiswa',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. program_studi
CREATE TABLE program_studi (
  id INT NOT NULL AUTO_INCREMENT,
  kode_prodi VARCHAR(10) NOT NULL,
  nama_prodi VARCHAR(100) NOT NULL,
  fakultas VARCHAR(100) NOT NULL,
  jenjang ENUM('D3','S1','S2') NOT NULL DEFAULT 'S1',
  PRIMARY KEY (id),
  UNIQUE KEY uq_prodi_kode (kode_prodi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. mahasiswa
CREATE TABLE mahasiswa (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  prodi_id INT NOT NULL,
  nim VARCHAR(20) NOT NULL,
  nama_lengkap VARCHAR(150) NOT NULL,
  semester TINYINT NOT NULL DEFAULT 1,
  ipk DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  foto VARCHAR(255) DEFAULT NULL,
  no_telp VARCHAR(20) DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  cv_path VARCHAR(255) DEFAULT NULL,
  porto_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mahasiswa_nim (nim),
  UNIQUE KEY uq_mahasiswa_user (user_id),
  INDEX idx_mahasiswa_prodi (prodi_id),
  CONSTRAINT fk_mahasiswa_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_mahasiswa_prodi FOREIGN KEY (prodi_id) REFERENCES program_studi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. kategori_kompetensi
CREATE TABLE kategori_kompetensi (
  id INT NOT NULL AUTO_INCREMENT,
  nama_kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kategori_nama (nama_kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. kompetensi
CREATE TABLE kompetensi (
  id INT NOT NULL AUTO_INCREMENT,
  kategori_id INT NOT NULL,
  nama_kompetensi VARCHAR(100) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  icon VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kompetensi_nama (nama_kompetensi),
  INDEX idx_kompetensi_kategori (kategori_id),
  CONSTRAINT fk_kompetensi_kategori FOREIGN KEY (kategori_id) REFERENCES kategori_kompetensi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. mahasiswa_kompetensi
CREATE TABLE mahasiswa_kompetensi (
  id INT NOT NULL AUTO_INCREMENT,
  mahasiswa_id INT NOT NULL,
  kompetensi_id INT NOT NULL,
  level ENUM('pemula','menengah','mahir') NOT NULL DEFAULT 'pemula',
  sumber ENUM('manual','chatbot','import') NOT NULL DEFAULT 'manual',
  bukti_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mahasiswa_kompetensi (mahasiswa_id, kompetensi_id),
  INDEX idx_mk_kompetensi (kompetensi_id),
  CONSTRAINT fk_mk_mahasiswa FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_mk_kompetensi FOREIGN KEY (kompetensi_id) REFERENCES kompetensi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. perusahaan
CREATE TABLE perusahaan (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  nama_perusahaan VARCHAR(150) NOT NULL,
  bidang_usaha VARCHAR(100) DEFAULT NULL,
  deskripsi TEXT DEFAULT NULL,
  alamat TEXT DEFAULT NULL,
  kota VARCHAR(100) DEFAULT NULL,
  provinsi VARCHAR(100) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  logo VARCHAR(255) DEFAULT NULL,
  email_kontak VARCHAR(150) DEFAULT NULL,
  no_telp VARCHAR(20) DEFAULT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_perusahaan_kota (kota),
  INDEX idx_perusahaan_verified (verified),
  CONSTRAINT fk_perusahaan_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. lowongan_magang
CREATE TABLE lowongan_magang (
  id INT NOT NULL AUTO_INCREMENT,
  perusahaan_id INT NOT NULL,
  judul_posisi VARCHAR(150) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  kuota INT NOT NULL DEFAULT 1,
  durasi_bulan TINYINT NOT NULL DEFAULT 3,
  tgl_buka DATE NOT NULL,
  tgl_tutup DATE NOT NULL,
  min_semester TINYINT DEFAULT NULL,
  min_ipk DECIMAL(3,2) DEFAULT NULL,
  is_remote TINYINT(1) NOT NULL DEFAULT 0,
  link_pendaftaran VARCHAR(500) DEFAULT NULL,
  status ENUM('draft','aktif','ditutup') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_lowongan_perusahaan (perusahaan_id),
  INDEX idx_lowongan_status (status),
  INDEX idx_lowongan_tgl_tutup (tgl_tutup),
  CONSTRAINT fk_lowongan_perusahaan FOREIGN KEY (perusahaan_id) REFERENCES perusahaan(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. lowongan_kompetensi
CREATE TABLE lowongan_kompetensi (
  id INT NOT NULL AUTO_INCREMENT,
  lowongan_id INT NOT NULL,
  kompetensi_id INT NOT NULL,
  bobot DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  wajib TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lowongan_kompetensi (lowongan_id, kompetensi_id),
  INDEX idx_lk_kompetensi (kompetensi_id),
  CONSTRAINT fk_lk_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan_magang(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lk_kompetensi FOREIGN KEY (kompetensi_id) REFERENCES kompetensi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. rekomendasi
CREATE TABLE rekomendasi (
  id INT NOT NULL AUTO_INCREMENT,
  mahasiswa_id INT NOT NULL,
  lowongan_id INT NOT NULL,
  skor_kecocokan DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  metode VARCHAR(50) NOT NULL DEFAULT 'SAW',
  detail_perhitungan JSON DEFAULT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_rek_mahasiswa (mahasiswa_id),
  INDEX idx_rek_lowongan (lowongan_id),
  INDEX idx_rek_skor (skor_kecocokan DESC),
  INDEX idx_rek_generated (generated_at),
  CONSTRAINT fk_rek_mahasiswa FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rek_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan_magang(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. chatbot_sesi
CREATE TABLE chatbot_sesi (
  id INT NOT NULL AUTO_INCREMENT,
  mahasiswa_id INT NOT NULL,
  judul_sesi VARCHAR(150) DEFAULT NULL,
  status ENUM('aktif','selesai','dibatalkan') NOT NULL DEFAULT 'aktif',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_sesi_mahasiswa (mahasiswa_id),
  INDEX idx_sesi_status (status),
  CONSTRAINT fk_sesi_mahasiswa FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. chatbot_pesan
CREATE TABLE chatbot_pesan (
  id INT NOT NULL AUTO_INCREMENT,
  sesi_id INT NOT NULL,
  peran ENUM('user','bot') NOT NULL,
  isi_pesan TEXT NOT NULL,
  intent VARCHAR(100) DEFAULT NULL,
  entitas JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_pesan_sesi (sesi_id),
  INDEX idx_pesan_created (created_at),
  CONSTRAINT fk_pesan_sesi FOREIGN KEY (sesi_id) REFERENCES chatbot_sesi(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. chatbot_kompetensi_terdeteksi
CREATE TABLE chatbot_kompetensi_terdeteksi (
  id INT NOT NULL AUTO_INCREMENT,
  sesi_id INT NOT NULL,
  kompetensi_id INT NOT NULL,
  level ENUM('pemula','menengah','mahir') NOT NULL DEFAULT 'pemula',
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  dikonfirmasi TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_ckt_sesi (sesi_id),
  INDEX idx_ckt_kompetensi (kompetensi_id),
  CONSTRAINT fk_ckt_sesi FOREIGN KEY (sesi_id) REFERENCES chatbot_sesi(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ckt_kompetensi FOREIGN KEY (kompetensi_id) REFERENCES kompetensi(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. lamaran
CREATE TABLE lamaran (
  id INT NOT NULL AUTO_INCREMENT,
  mahasiswa_id INT NOT NULL,
  lowongan_id INT NOT NULL,
  sumber_rekomendasi TINYINT(1) NOT NULL DEFAULT 0,
  surat_pengantar TEXT DEFAULT NULL,
  status ENUM('menunggu','diterima','ditolak','dibatalkan') NOT NULL DEFAULT 'menunggu',
  tgl_lamar TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tgl_respons TIMESTAMP NULL DEFAULT NULL,
  catatan_perusahaan TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lamaran (mahasiswa_id, lowongan_id),
  INDEX idx_lamaran_lowongan (lowongan_id),
  INDEX idx_lamaran_status (status),
  CONSTRAINT fk_lamaran_mahasiswa FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lamaran_lowongan FOREIGN KEY (lowongan_id) REFERENCES lowongan_magang(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. notifikasi
CREATE TABLE notifikasi (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  judul VARCHAR(200) NOT NULL,
  pesan TEXT NOT NULL,
  tipe VARCHAR(50) DEFAULT NULL,
  referensi_id INT DEFAULT NULL,
  dibaca TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_dibaca (dibaca),
  INDEX idx_notif_created (created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
