-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: db_magang
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chatbot_kompetensi_terdeteksi`
--

DROP TABLE IF EXISTS `chatbot_kompetensi_terdeteksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_kompetensi_terdeteksi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sesi_id` int(11) NOT NULL,
  `kompetensi_id` int(11) NOT NULL,
  `level` enum('pemula','menengah','mahir') NOT NULL DEFAULT 'pemula',
  `confidence` decimal(4,3) NOT NULL DEFAULT 0.000,
  `dikonfirmasi` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ckt_sesi` (`sesi_id`),
  KEY `idx_ckt_kompetensi` (`kompetensi_id`),
  CONSTRAINT `fk_ckt_kompetensi` FOREIGN KEY (`kompetensi_id`) REFERENCES `kompetensi` (`id`),
  CONSTRAINT `fk_ckt_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `chatbot_sesi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_kompetensi_terdeteksi`
--

LOCK TABLES `chatbot_kompetensi_terdeteksi` WRITE;
/*!40000 ALTER TABLE `chatbot_kompetensi_terdeteksi` DISABLE KEYS */;
/*!40000 ALTER TABLE `chatbot_kompetensi_terdeteksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_pesan`
--

DROP TABLE IF EXISTS `chatbot_pesan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_pesan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sesi_id` int(11) NOT NULL,
  `peran` enum('user','bot') NOT NULL,
  `isi_pesan` text NOT NULL,
  `intent` varchar(100) DEFAULT NULL,
  `entitas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`entitas`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pesan_sesi` (`sesi_id`),
  KEY `idx_pesan_created` (`created_at`),
  CONSTRAINT `fk_pesan_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `chatbot_sesi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_pesan`
--

LOCK TABLES `chatbot_pesan` WRITE;
/*!40000 ALTER TABLE `chatbot_pesan` DISABLE KEYS */;
INSERT INTO `chatbot_pesan` VALUES (1,1,'user','hai',NULL,NULL,'2026-10-03 10:32:16'),(2,1,'bot','Apakah kamu memiliki kompetensi \"JavaScript\"? Jika ya, di tingkat apa (pemula, menengah, atau mahir)?',NULL,NULL,'2026-10-03 10:32:16'),(3,3,'user','hi',NULL,NULL,'2026-10-29 22:33:39'),(4,3,'bot','Apakah kamu memiliki kompetensi \"JavaScript\"? Jika ya, di tingkat apa (pemula, menengah, atau mahir)?',NULL,NULL,'2026-10-29 22:33:39'),(5,3,'user','mahir',NULL,NULL,'2026-10-29 22:33:45'),(6,3,'bot','Apakah kamu memiliki kompetensi \"JavaScript\"? Jika ya, di tingkat apa (pemula, menengah, atau mahir)?',NULL,NULL,'2026-10-29 22:33:45'),(7,3,'user','mahir',NULL,NULL,'2026-10-29 22:33:51'),(8,3,'bot','Apakah kamu memiliki kompetensi \"JavaScript\"? Jika ya, di tingkat apa (pemula, menengah, atau mahir)?',NULL,NULL,'2026-10-29 22:33:51');
/*!40000 ALTER TABLE `chatbot_pesan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chatbot_sesi`
--

DROP TABLE IF EXISTS `chatbot_sesi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chatbot_sesi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `judul_sesi` varchar(150) DEFAULT NULL,
  `status` enum('aktif','selesai','dibatalkan') NOT NULL DEFAULT 'aktif',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sesi_mahasiswa` (`mahasiswa_id`),
  KEY `idx_sesi_status` (`status`),
  CONSTRAINT `fk_sesi_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot_sesi`
--

LOCK TABLES `chatbot_sesi` WRITE;
/*!40000 ALTER TABLE `chatbot_sesi` DISABLE KEYS */;
INSERT INTO `chatbot_sesi` VALUES (1,1,NULL,'dibatalkan','2026-10-03 10:32:10',NULL),(2,1,NULL,'dibatalkan','2026-10-29 22:29:52',NULL),(3,1,NULL,'dibatalkan','2026-10-29 22:33:35',NULL);
/*!40000 ALTER TABLE `chatbot_sesi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategori_kompetensi`
--

DROP TABLE IF EXISTS `kategori_kompetensi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kategori_kompetensi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kategori_nama` (`nama_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori_kompetensi`
--

LOCK TABLES `kategori_kompetensi` WRITE;
/*!40000 ALTER TABLE `kategori_kompetensi` DISABLE KEYS */;
INSERT INTO `kategori_kompetensi` VALUES (1,'Bahasa Pemrograman','Kemampuan bahasa pemrograman'),(2,'Framework & Library','Framework dan library populer'),(3,'Basis Data','Manajemen basis data'),(4,'DevOps & Cloud','Tools deployment dan infrastruktur'),(5,'Soft Skills','Kemampuan interpersonal'),(6,'Mobile Development','Pengembangan aplikasi mobile'),(7,'Data Science & AI','Analisis data dan kecerdasan buatan');
/*!40000 ALTER TABLE `kategori_kompetensi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kompetensi`
--

DROP TABLE IF EXISTS `kompetensi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kompetensi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kategori_id` int(11) NOT NULL,
  `nama_kompetensi` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_kompetensi_nama` (`nama_kompetensi`),
  KEY `idx_kompetensi_kategori` (`kategori_id`),
  CONSTRAINT `fk_kompetensi_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_kompetensi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kompetensi`
--

LOCK TABLES `kompetensi` WRITE;
/*!40000 ALTER TABLE `kompetensi` DISABLE KEYS */;
INSERT INTO `kompetensi` VALUES (1,1,'JavaScript',NULL,NULL),(2,1,'Python',NULL,NULL),(3,1,'Java',NULL,NULL),(4,1,'TypeScript',NULL,NULL),(5,1,'Go',NULL,NULL),(6,1,'PHP',NULL,NULL),(7,1,'Kotlin',NULL,NULL),(8,1,'Swift',NULL,NULL),(9,2,'React.js',NULL,NULL),(10,2,'Node.js',NULL,NULL),(11,2,'Express.js',NULL,NULL),(12,2,'Next.js',NULL,NULL),(13,2,'Laravel',NULL,NULL),(14,2,'Spring Boot',NULL,NULL),(15,2,'Django',NULL,NULL),(16,2,'Flutter',NULL,NULL),(17,3,'MySQL',NULL,NULL),(18,3,'PostgreSQL',NULL,NULL),(19,3,'MongoDB',NULL,NULL),(20,3,'Redis',NULL,NULL),(21,3,'Prisma ORM',NULL,NULL),(22,4,'Docker',NULL,NULL),(23,4,'Git',NULL,NULL),(24,4,'Linux',NULL,NULL),(25,4,'CI/CD (GitHub Actions)',NULL,NULL),(26,5,'Komunikasi',NULL,NULL),(27,5,'Kerja Tim',NULL,NULL),(28,5,'Problem Solving',NULL,NULL),(29,6,'Android Native',NULL,NULL),(30,6,'React Native',NULL,NULL),(31,7,'Machine Learning',NULL,NULL),(32,7,'Data Analysis',NULL,NULL),(33,7,'TensorFlow',NULL,NULL);
/*!40000 ALTER TABLE `kompetensi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lamaran`
--

DROP TABLE IF EXISTS `lamaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lamaran` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `lowongan_id` int(11) NOT NULL,
  `sumber_rekomendasi` tinyint(4) NOT NULL DEFAULT 0,
  `surat_pengantar` text DEFAULT NULL,
  `status` enum('menunggu','diterima','ditolak','dibatalkan') NOT NULL DEFAULT 'menunggu',
  `tgl_lamar` timestamp NOT NULL DEFAULT current_timestamp(),
  `tgl_respons` timestamp NULL DEFAULT NULL,
  `catatan_perusahaan` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lamaran` (`mahasiswa_id`,`lowongan_id`),
  KEY `idx_lamaran_lowongan` (`lowongan_id`),
  KEY `idx_lamaran_status` (`status`),
  CONSTRAINT `fk_lamaran_lowongan` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lamaran_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lamaran`
--

LOCK TABLES `lamaran` WRITE;
/*!40000 ALTER TABLE `lamaran` DISABLE KEYS */;
/*!40000 ALTER TABLE `lamaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lowongan_kompetensi`
--

DROP TABLE IF EXISTS `lowongan_kompetensi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lowongan_kompetensi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lowongan_id` int(11) NOT NULL,
  `kompetensi_id` int(11) NOT NULL,
  `bobot` decimal(3,2) NOT NULL DEFAULT 1.00,
  `wajib` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lowongan_kompetensi` (`lowongan_id`,`kompetensi_id`),
  KEY `idx_lk_kompetensi` (`kompetensi_id`),
  CONSTRAINT `fk_lk_kompetensi` FOREIGN KEY (`kompetensi_id`) REFERENCES `kompetensi` (`id`),
  CONSTRAINT `fk_lk_lowongan` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lowongan_kompetensi`
--

LOCK TABLES `lowongan_kompetensi` WRITE;
/*!40000 ALTER TABLE `lowongan_kompetensi` DISABLE KEYS */;
INSERT INTO `lowongan_kompetensi` VALUES (61,17,9,1.50,1),(62,17,1,1.50,1),(63,17,23,1.00,0),(64,17,4,1.00,0),(65,18,10,1.50,1),(66,18,1,1.50,1),(67,18,17,1.00,0),(68,18,22,0.80,0),(69,19,7,2.00,1),(70,19,29,2.00,1),(71,19,23,0.80,0),(72,19,28,0.80,0),(73,20,2,1.50,1),(74,20,32,1.50,1),(75,20,17,1.00,0),(76,20,31,0.80,0),(77,21,1,1.50,1),(78,21,2,1.20,0),(79,21,22,1.00,0),(80,21,23,0.80,1),(81,22,24,1.80,1),(82,22,22,1.20,1),(83,22,25,1.00,0),(84,22,28,0.80,0),(85,23,3,2.00,1),(86,23,14,1.50,1),(87,23,17,1.00,0),(88,23,28,0.80,0),(89,24,3,1.80,1),(90,24,17,1.20,1),(91,24,28,1.00,0),(92,24,26,0.80,0),(93,25,30,2.00,1),(94,25,1,1.50,1),(95,25,4,1.00,0),(96,25,23,0.80,0),(97,26,2,1.20,0),(98,26,28,1.50,1),(99,26,23,1.00,0),(100,26,26,1.00,0),(101,27,2,1.50,1),(102,27,32,1.20,1),(103,27,17,1.00,0),(104,27,28,0.80,0),(105,28,1,1.50,1),(106,28,9,1.50,1),(107,28,10,1.00,0),(108,28,23,0.80,1),(109,29,8,2.00,1),(110,29,23,1.00,0),(111,29,28,1.00,0),(112,30,9,1.50,1),(113,30,3,1.20,0),(114,30,17,1.00,0),(115,30,23,0.80,0),(116,31,12,1.50,1),(117,31,4,1.50,1),(118,31,10,1.00,0),(119,31,22,0.80,0),(120,32,6,1.50,1),(121,32,13,1.50,1),(122,32,17,1.00,0),(123,32,23,0.80,0),(124,33,22,2.00,1),(125,33,24,1.50,1),(126,33,25,1.20,0),(127,33,23,0.80,0),(128,34,2,2.00,1),(129,34,31,2.00,1),(130,34,33,1.20,0),(131,34,32,1.00,0);
/*!40000 ALTER TABLE `lowongan_kompetensi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lowongan_magang`
--

DROP TABLE IF EXISTS `lowongan_magang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lowongan_magang` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `perusahaan_id` int(11) NOT NULL,
  `judul_posisi` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `kuota` int(11) NOT NULL DEFAULT 1,
  `durasi_bulan` tinyint(4) NOT NULL DEFAULT 3,
  `tgl_buka` date NOT NULL,
  `tgl_tutup` date NOT NULL,
  `min_semester` tinyint(4) DEFAULT NULL,
  `min_ipk` decimal(3,2) DEFAULT NULL,
  `is_remote` tinyint(4) NOT NULL DEFAULT 0,
  `status` enum('draft','aktif','ditutup') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `link_pendaftaran` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lowongan_perusahaan` (`perusahaan_id`),
  KEY `idx_lowongan_status` (`status`),
  KEY `idx_lowongan_tgl_tutup` (`tgl_tutup`),
  CONSTRAINT `fk_lowongan_perusahaan` FOREIGN KEY (`perusahaan_id`) REFERENCES `perusahaan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lowongan_magang`
--

LOCK TABLES `lowongan_magang` WRITE;
/*!40000 ALTER TABLE `lowongan_magang` DISABLE KEYS */;
INSERT INTO `lowongan_magang` VALUES (17,21,'Frontend Engineer Intern','Mengembangkan antarmuka web modern pada ekosistem GoTo menggunakan React.js dan Next.js, berkolaborasi dengan Product Designer dan Backend Engineer.',5,3,'2026-08-31','2026-12-30',5,3.00,0,'aktif','2026-10-29 23:13:49','2026-10-29 23:13:49','https://www.gotocompany.com/en/careers'),(18,21,'Backend Engineer Intern','Membangun dan mengoptimasi RESTful & gRPC API berskala jutaan pengguna harian menggunakan Node.js dan MySQL di ekosistem GoTo.',4,3,'2026-08-31','2026-12-30',5,3.00,0,'aktif','2026-10-29 23:13:49','2026-10-29 23:13:49','https://www.gotocompany.com/en/careers'),(19,21,'Android Developer Intern','Mengembangkan fitur baru pada aplikasi Android Gojek menggunakan Kotlin, Coroutines, dan clean architecture standar industri Google.',3,6,'2026-08-31','2026-11-29',6,3.20,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://www.gotocompany.com/en/careers'),(20,21,'Data Analyst & BI Intern','Menganalisis performa bisnis, membuat dashboard analitik interaktif, dan memproses data operasional berskala besar menggunakan SQL dan Python.',3,3,'2026-08-31','2026-12-30',5,3.10,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://www.gotocompany.com/en/careers'),(21,22,'Digistar Software Engineer Intern','Program magang resmi Digistar Telkom Indonesia. Berkontribusi dalam perancangan arsitektur sistem digital dan implementasi microservices telekomunikasi.',6,6,'2026-08-31','2026-12-30',5,3.00,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://internship.telkom.co.id/'),(22,22,'Digistar Network & Cloud Engineer Intern','Mendukung tim infrastruktur Telkom dalam pengelolaan jaringan telekomunikasi nasional, administrasi Linux servers, dan otomatisasi deployment.',4,6,'2026-08-31','2026-11-29',5,2.80,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://internship.telkom.co.id/'),(23,23,'IT Developer Trainee / Intern','Program pemagangan IT perbankan resmi BCA. Membantu pengembangan modul aplikasi perbankan digital menggunakan Java, Spring Boot, dan database relational.',5,6,'2026-08-31','2026-12-30',6,3.25,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://karir.bca.co.id/'),(24,24,'Digital Banking IT Intern','Membantu riset dan implementasi sistem perbankan digital, pengujian API keuangan modern, serta eksplorasi arsitektur perbankan masa depan di Bank Mandiri.',4,6,'2026-08-31','2026-12-30',6,3.20,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://bankmandiri.co.id/karir'),(25,25,'Mobile Developer Intern (React Native)','Program magang Shopee Apprentice. Mengembangkan modul mobile e-commerce multi-platform menggunakan React Native dan TypeScript bersama tim engineer Shopee.',3,3,'2026-08-31','2027-01-30',5,3.00,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://careers.shopee.co.id/'),(26,26,'QA & Software Development in Test Intern','Merancang test scenarios, mengotomasi end-to-end testing web & mobile, dan memastikan keandalan performa platform pemesanan tiket online tiket.com.',3,3,'2026-08-31','2026-12-30',5,2.80,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://careers.tiket.com/'),(27,27,'IT & Digital Transformation Intern','Program pemagangan resmi Grup Astra untuk digitalisasi lini bisnis otomotif, integrasi sistem enterprise, dan analitik data operasional.',4,6,'2026-08-31','2026-12-30',5,3.00,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://career.astra.co.id/'),(28,28,'Ruangguru LEAP Software Engineer Intern','Program akselerasi talenta Ruangguru LEAP. Membangun platform teknologi edukasi interaktif bagi jutaan siswa menggunakan React.js dan Node.js.',5,3,'2026-08-31','2026-12-30',5,3.00,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://career.ruangguru.com/'),(29,29,'iOS Developer Intern','Membantu riset dan pembuatan fitur antarmuka aplikasi Traveloka di platform iOS menggunakan Swift dan Apple Human Interface Guidelines.',2,3,'2026-08-31','2026-11-29',6,3.30,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://www.traveloka.com/en-id/careers'),(30,30,'Full Stack Developer Intern (Future Program)','Program magang Blibli Future Program untuk mahasiswa tingkat akhir. Terlibat langsung dalam pengembangan arsitektur e-commerce omnichannel modern.',4,3,'2026-08-31','2027-01-30',5,3.00,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://careers.blibli.com/'),(31,31,'Platform Engineer Intern','Ikut mengembangkan platform belajar coding online terbesar di Indonesia menggunakan Next.js, TypeScript, dan automasi grading sistem.',4,3,'2026-08-31','2027-01-30',5,3.00,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://www.dicoding.com/jobs'),(32,32,'Full Stack Web Developer Intern (Laravel)','Mengembangkan fitur SaaS otomasi bisnis, HR payroll, dan akuntansi berbasis web menggunakan PHP Laravel dan arsitektur REST API modern.',4,3,'2026-08-31','2026-12-30',5,3.00,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://mekari.com/careers/'),(33,33,'Cloud Infrastructure & DevOps Intern','Membantu pengelolaan container Docker, orkestrasi cloud, serta pipeline continuous integration (CI/CD) untuk platform e-commerce enabler.',3,3,'2026-08-31','2026-12-30',6,3.00,0,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://sirclo.com/careers/'),(34,34,'Machine Learning & AI Engineer Intern','Melakukan riset algoritma rekomendasi karier berbasis pemrosesan bahasa alami (NLP) dan integrasi model machine learning ke dalam sistem produksi.',3,6,'2026-08-31','2026-12-30',6,3.30,1,'aktif','2026-10-29 23:13:50','2026-10-29 23:13:50','https://www.kalibrr.com/job-board/te/internship/1');
/*!40000 ALTER TABLE `lowongan_magang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mahasiswa`
--

DROP TABLE IF EXISTS `mahasiswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mahasiswa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `prodi_id` int(11) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `nama_lengkap` varchar(150) NOT NULL,
  `semester` tinyint(4) NOT NULL DEFAULT 1,
  `ipk` decimal(3,2) NOT NULL DEFAULT 0.00,
  `foto` varchar(255) DEFAULT NULL,
  `no_telp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `cv_path` varchar(255) DEFAULT NULL,
  `porto_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mahasiswa_nim` (`nim`),
  UNIQUE KEY `uq_mahasiswa_user` (`user_id`),
  KEY `idx_mahasiswa_prodi` (`prodi_id`),
  CONSTRAINT `fk_mahasiswa_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `program_studi` (`id`),
  CONSTRAINT `fk_mahasiswa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mahasiswa`
--

LOCK TABLES `mahasiswa` WRITE;
/*!40000 ALTER TABLE `mahasiswa` DISABLE KEYS */;
INSERT INTO `mahasiswa` VALUES (1,2,1,'1234567890','Budi Mahasiswa',5,3.75,NULL,NULL,NULL,NULL,NULL,'2026-10-03 17:19:04','2026-10-03 17:19:04');
/*!40000 ALTER TABLE `mahasiswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mahasiswa_kompetensi`
--

DROP TABLE IF EXISTS `mahasiswa_kompetensi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mahasiswa_kompetensi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `kompetensi_id` int(11) NOT NULL,
  `level` enum('pemula','menengah','mahir') NOT NULL DEFAULT 'pemula',
  `sumber` enum('manual','chatbot','import') NOT NULL DEFAULT 'manual',
  `bukti_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mahasiswa_kompetensi` (`mahasiswa_id`,`kompetensi_id`),
  KEY `idx_mk_kompetensi` (`kompetensi_id`),
  CONSTRAINT `fk_mk_kompetensi` FOREIGN KEY (`kompetensi_id`) REFERENCES `kompetensi` (`id`),
  CONSTRAINT `fk_mk_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mahasiswa_kompetensi`
--

LOCK TABLES `mahasiswa_kompetensi` WRITE;
/*!40000 ALTER TABLE `mahasiswa_kompetensi` DISABLE KEYS */;
INSERT INTO `mahasiswa_kompetensi` VALUES (1,1,1,'mahir','manual',NULL,'2026-10-03 17:19:04'),(2,1,9,'menengah','manual',NULL,'2026-10-03 17:19:04'),(3,1,10,'pemula','manual',NULL,'2026-10-03 17:19:04'),(4,1,17,'menengah','manual',NULL,'2026-10-03 17:19:04'),(5,1,23,'mahir','manual',NULL,'2026-10-03 17:19:04');
/*!40000 ALTER TABLE `mahasiswa_kompetensi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifikasi`
--

DROP TABLE IF EXISTS `notifikasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifikasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `judul` varchar(200) NOT NULL,
  `pesan` text NOT NULL,
  `tipe` varchar(50) DEFAULT NULL,
  `referensi_id` int(11) DEFAULT NULL,
  `dibaca` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_dibaca` (`dibaca`),
  KEY `idx_notif_created` (`created_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifikasi`
--

LOCK TABLES `notifikasi` WRITE;
/*!40000 ALTER TABLE `notifikasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifikasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perusahaan`
--

DROP TABLE IF EXISTS `perusahaan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `perusahaan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `nama_perusahaan` varchar(150) NOT NULL,
  `bidang_usaha` varchar(100) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `kota` varchar(100) DEFAULT NULL,
  `provinsi` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `email_kontak` varchar(150) DEFAULT NULL,
  `no_telp` varchar(20) DEFAULT NULL,
  `verified` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_perusahaan_kota` (`kota`),
  KEY `idx_perusahaan_verified` (`verified`),
  KEY `fk_perusahaan_user` (`user_id`),
  CONSTRAINT `fk_perusahaan_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perusahaan`
--

LOCK TABLES `perusahaan` WRITE;
/*!40000 ALTER TABLE `perusahaan` DISABLE KEYS */;
INSERT INTO `perusahaan` VALUES (1,NULL,'PT Tokopedia','E-Commerce',NULL,NULL,'Jakarta','DKI Jakarta','https://tokopedia.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(2,NULL,'PT Gojek Indonesia','Transportasi & Teknologi',NULL,NULL,'Jakarta','DKI Jakarta','https://gojek.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(3,NULL,'PT Bukalapak','E-Commerce',NULL,NULL,'Jakarta','DKI Jakarta','https://bukalapak.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(4,NULL,'PT Traveloka','Travel & Pariwisata',NULL,NULL,'Jakarta','DKI Jakarta','https://traveloka.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(5,NULL,'PT Ruangguru','EdTech',NULL,NULL,'Jakarta','DKI Jakarta','https://ruangguru.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(6,NULL,'PT Telkom Indonesia','Telekomunikasi',NULL,NULL,'Bandung','Jawa Barat','https://telkom.co.id',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(7,NULL,'PT Bank BCA Tbk','Perbankan & Fintech',NULL,NULL,'Jakarta','DKI Jakarta','https://bca.co.id',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(8,NULL,'PT Shopee Indonesia','E-Commerce',NULL,NULL,'Jakarta','DKI Jakarta','https://shopee.co.id',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(9,NULL,'PT Tiket.com','Travel & Teknologi',NULL,NULL,'Jakarta','DKI Jakarta','https://tiket.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(10,NULL,'PT Kalibrr Indonesia','HR Tech',NULL,NULL,'Jakarta','DKI Jakarta','https://kalibrr.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(11,NULL,'PT Blibli','E-Commerce',NULL,NULL,'Jakarta','DKI Jakarta','https://blibli.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(12,NULL,'PT Xendit','Fintech & Pembayaran',NULL,NULL,'Jakarta','DKI Jakarta','https://xendit.co',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(13,NULL,'PT Kata.ai','AI & NLP',NULL,NULL,'Jakarta','DKI Jakarta','https://kata.ai',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(14,NULL,'PT Midtrans','Fintech & Payment Gateway',NULL,NULL,'Jakarta','DKI Jakarta','https://midtrans.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(15,NULL,'PT Astra International','Otomotif & Teknologi',NULL,NULL,'Jakarta','DKI Jakarta','https://astra.co.id',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(16,NULL,'PT Mekari','SaaS & HR Tech',NULL,NULL,'Jakarta','DKI Jakarta','https://mekari.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(17,NULL,'PT Wahana Prestasi Logistik','Logistik & Supply Chain',NULL,NULL,'Surabaya','Jawa Timur','https://wahana.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(18,NULL,'PT Dicoding Indonesia','EdTech & Developer Platform',NULL,NULL,'Bandung','Jawa Barat','https://dicoding.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(19,NULL,'PT Pinhome','PropTech',NULL,NULL,'Jakarta','DKI Jakarta','https://pinhome.id',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(20,NULL,'PT Sirclo Commerce','E-Commerce Enabler',NULL,NULL,'Jakarta','DKI Jakarta','https://sirclo.com',NULL,NULL,NULL,1,'2026-10-03 17:19:04','2026-10-03 17:19:04'),(21,NULL,'PT GoTo Gojek Tokopedia Tbk','Teknologi & E-Commerce',NULL,NULL,'Jakarta Selatan','DKI Jakarta','https://www.gotocompany.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(22,NULL,'PT Telkom Indonesia (Persero) Tbk','Telekomunikasi & Digital Services',NULL,NULL,'Bandung','Jawa Barat','https://www.telkom.co.id',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(23,NULL,'PT Bank Central Asia Tbk','Perbankan & Financial Technology',NULL,NULL,'Jakarta Pusat','DKI Jakarta','https://www.bca.co.id',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(24,NULL,'PT Bank Mandiri (Persero) Tbk','Perbankan & Digital Banking',NULL,NULL,'Jakarta Selatan','DKI Jakarta','https://bankmandiri.co.id',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(25,NULL,'PT Shopee International Indonesia','E-Commerce & Digital Services',NULL,NULL,'Jakarta Selatan','DKI Jakarta','https://shopee.co.id',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(26,NULL,'PT Global Tiket Network (Tiket.com)','Online Travel Agent (OTA)',NULL,NULL,'Jakarta Barat','DKI Jakarta','https://www.tiket.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(27,NULL,'PT Astra International Tbk','Konglomerasi & Otomotif',NULL,NULL,'Jakarta Utara','DKI Jakarta','https://www.astra.co.id',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(28,NULL,'PT Ruang Raya Indonesia (Ruangguru)','Education Technology (EdTech)',NULL,NULL,'Jakarta Selatan','DKI Jakarta','https://ruangguru.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(29,NULL,'PT Traveloka Indonesia','Lifestyle & Travel Tech',NULL,NULL,'Tangerang','Banten','https://www.traveloka.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(30,NULL,'PT Global Digital Niaga Tbk (Blibli)','Omnichannel & E-Commerce',NULL,NULL,'Jakarta Pusat','DKI Jakarta','https://www.blibli.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(31,NULL,'PT Dicoding Akademi Indonesia','Developer Platform & EdTech',NULL,NULL,'Bandung','Jawa Barat','https://www.dicoding.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(32,NULL,'PT Midplaza Prima (Mekari)','Enterprise SaaS & HR Tech',NULL,NULL,'Jakarta Selatan','DKI Jakarta','https://mekari.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(33,NULL,'PT Sirclo Digital Kreasi','E-Commerce Enabler & Cloud Tech',NULL,NULL,'Tangerang','Banten','https://sirclo.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49'),(34,NULL,'PT Kalibrr Technology Indonesia','Talent Network & HR Tech',NULL,NULL,'Jakarta Selatan','DKI Jakarta','https://www.kalibrr.com',NULL,NULL,NULL,1,'2026-10-29 23:13:49','2026-10-29 23:13:49');
/*!40000 ALTER TABLE `perusahaan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_studi`
--

DROP TABLE IF EXISTS `program_studi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `program_studi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_prodi` varchar(10) NOT NULL,
  `nama_prodi` varchar(100) NOT NULL,
  `fakultas` varchar(100) NOT NULL,
  `jenjang` enum('D3','S1','S2') NOT NULL DEFAULT 'S1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prodi_kode` (`kode_prodi`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_studi`
--

LOCK TABLES `program_studi` WRITE;
/*!40000 ALTER TABLE `program_studi` DISABLE KEYS */;
INSERT INTO `program_studi` VALUES (1,'TI','Teknik Informatika','Fakultas Ilmu Komputer','S1'),(2,'SI','Sistem Informasi','Fakultas Ilmu Komputer','S1'),(3,'SK','Sains Komputasi','Fakultas Ilmu Komputer','S1'),(4,'RPL','Rekayasa Perangkat Lunak','Fakultas Ilmu Komputer','S1');
/*!40000 ALTER TABLE `program_studi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rekomendasi`
--

DROP TABLE IF EXISTS `rekomendasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rekomendasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mahasiswa_id` int(11) NOT NULL,
  `lowongan_id` int(11) NOT NULL,
  `skor_kecocokan` decimal(5,2) NOT NULL DEFAULT 0.00,
  `metode` varchar(50) NOT NULL DEFAULT 'SAW',
  `detail_perhitungan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detail_perhitungan`)),
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rek_mahasiswa` (`mahasiswa_id`),
  KEY `idx_rek_lowongan` (`lowongan_id`),
  KEY `idx_rek_generated` (`generated_at`),
  KEY `idx_rek_skor` (`skor_kecocokan`),
  CONSTRAINT `fk_rek_lowongan` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rek_mahasiswa` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rekomendasi`
--

LOCK TABLES `rekomendasi` WRITE;
/*!40000 ALTER TABLE `rekomendasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `rekomendasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','mahasiswa','dosen','perusahaan') NOT NULL DEFAULT 'mahasiswa',
  `is_active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@magang.com','$2b$12$6iLNxmywPsJMXCPwCgWC2erC.veDk8znvSxpoqis4C5yEskn3uuBO','admin',1,'2026-10-03 17:19:04','2026-10-03 17:31:42'),(2,'mahasiswa@magang.com','$2b$12$kISbpdFFrvpIb7XKK.WFjOYRmqc73PADQaucjICY.tS/AlYfRG7Ti','mahasiswa',1,'2026-10-03 17:19:04','2026-10-03 17:31:42');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-30 13:15:27
