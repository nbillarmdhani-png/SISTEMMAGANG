# 06 - Task List Proyek

Diturunkan dari `PRD`, `01-PROJECT-STRUCTURE`, `02-BACKEND`, `03-FRONTEND`, `04-STYLEGUIDE`, dan `05-DATABASE`. Jadwal mengikuti 8 sprint mingguan (asumsi; sesuaikan dengan kalender PBL).

**Kode peran:** `PM` analis/PM · `FE` frontend · `BE` backend dan database · `AI` chatbot dan rekomendasi · `ALL` seluruh tim.
**Format:** `- [ ] T-xx [peran] tugas (FR terkait)`. Centang saat sudah lolos review dan masuk `develop`.

## Ringkasan Sprint

| Sprint | Fokus                              | Hasil akhir sprint                                      |
| ------ | ---------------------------------- | ------------------------------------------------------- |
| 1      | Persiapan, desain, database        | Repo siap, wireframe, 15 tabel berjalan di MySQL        |
| 2      | Autentikasi dan profil             | Registrasi, login, profil mahasiswa berfungsi           |
| 3      | Modul admin                        | Admin dapat mengelola mitra, lowongan, kompetensi       |
| 4      | Katalog dan kompetensi manual      | Mahasiswa dapat mencari lowongan dan mengisi kompetensi |
| 5      | Chatbot                            | Pemetaan kompetensi lewat chat tersimpan ke profil      |
| 6      | Rekomendasi                        | Top-N rekomendasi dengan skor dan alasan                |
| 7      | Lamaran, notifikasi, dashboard, QA | Alur lengkap mahasiswa dan admin, bug diperbaiki        |
| 8      | Deployment dan penutupan           | Aplikasi online, UAT, dokumentasi, presentasi           |

---

## Sprint 1 - Persiapan, Desain, Database

**Repositori dan tooling**

- [ ] T-01 [BE] Buat repositori monorepo (`client/`, `server/`, `docs/`), `.gitignore`, `.editorconfig`, `README.md`
- [ ] T-02 [BE] Buat `package.json` root (script `dev`, `install:all`, `lint`, `test`) dan install `concurrently`
- [ ] T-03 [PM] Atur branch `main` dan `develop`, aturan PR, dan template PR (checklist `04-STYLEGUIDE` C3)
- [ ] T-04 [PM] Buat papan kanban GitHub Projects dan masukkan seluruh tugas ini sebagai issue
- [ ] T-05 [FE] [BE] Pasang ESLint dan Prettier di `client` dan `server` (konfigurasi sesuai styleguide)
- [ ] T-06 [PM] Pindahkan semua dokumen `.md` ke `docs/`

**Analisis dan desain**

- [ ] T-07 [PM] Putuskan hal terbuka: kardinalitas akun-perusahaan, penambahan CHECK constraint, metode dan bobot rekomendasi, kebijakan retensi data (`05-DATABASE` bagian 9)
- [ ] T-08 [PM] Kumpulkan data riil minimal 20 perusahaan, 40 lowongan, dan kompetensi yang dibutuhkan (target PRD)
- [ ] T-09 [FE] Wireframe Figma: landing, login/registrasi, dashboard, profil, daftar dan detail lowongan, chatbot, rekomendasi, lamaran, admin
- [ ] T-10 [FE] Tetapkan token desain Tailwind (warna, font, radius) sesuai `04-STYLEGUIDE` bagian B

**Database**

- [ ] T-11 [BE] Jalankan `server/sql/schema.sql` di MySQL 8; pastikan 15 tabel dan 18 FK terbentuk
- [ ] T-12 [BE] Uji skenario constraint (`05-DATABASE` bagian 12) dan catat hasilnya
- [ ] T-13 [BE] Siapkan `seed.sql` dari data dummy laporan (90 baris); lengkapi `lowongan_kompetensi` untuk Software Engineer Intern dan Frontend Engineer Intern
- [ ] T-14 [BE] `npx prisma db pull` dan `prisma generate`; periksa nama model dan enum hasil introspeksi
- [ ] T-15 [BE] Siapkan `prisma/seed.js` untuk hash bcrypt asli pada akun dummy
- [ ] T-16 [BE] Siapkan koleksi Postman atau Swagger kosong untuk dokumentasi endpoint

**Selesai bila:** repo dan kanban siap, wireframe disetujui, database berjalan dengan data seed.

---

## Sprint 2 - Autentikasi dan Profil

**Backend**

- [ ] T-17 [BE] Scaffold server: `app.js`, `server.js`, `config/env.js`, `config/prisma.js`, `AppError`, `apiResponse`, `errorHandler` (petakan `P2002` ke 409 dan `P2003` ke 409)
- [ ] T-18 [BE] Middleware `auth` (JWT + cek `users.is_active`), `role`, `validate` (Zod), `rateLimit`, `helmet`, CORS
- [ ] T-19 [BE] `GET /study-programs` (publik) (FR-01)
- [ ] T-20 [BE] `POST /auth/register`: buat `users` dan `mahasiswa` dalam satu transaksi, role dipaksa `mahasiswa`, hash bcrypt (FR-01)
- [ ] T-21 [BE] `POST /auth/login` (tolak akun nonaktif) dan `GET /auth/me` (FR-01)
- [ ] T-22 [BE] `GET/PUT /students/me` dengan validasi `semester`, `ipk`, `no_telp` (FR-03)
- [ ] T-23 [BE] Upload CV dan foto dengan multer (batas tipe dan ukuran), simpan path ke `cv_path` dan `foto` (FR-03)
- [ ] T-24 [BE] [FE] Ubah kata sandi (`PATCH /auth/change-password`: verifikasi bcrypt dulu) dan logout sisi klien (hapus token dari localStorage) (FR-02)
- [ ] T-25 [BE] Tes integrasi: registrasi (email/NIM ganda 409), login salah 401, akun nonaktif 401

**Frontend**

- [ ] T-26 [FE] Inisialisasi Vite + React, Tailwind, React Router, Axios, React Hook Form + Zod, toast
- [ ] T-27 [FE] `api/axios.js` dengan interceptor token dan penanganan 401
- [ ] T-28 [FE] `AuthContext`, `useAuth`, `ProtectedRoute` (cek login dan peran)
- [ ] T-29 [FE] Komponen UI dasar: Button, Input, Card, Badge, Modal, Spinner, Skeleton
- [ ] T-30 [FE] Layout `PublicLayout`, `StudentLayout` (navigasi bawah di mobile, sidebar di desktop), `AdminLayout`
- [ ] T-31 [FE] Halaman Landing, Login, Registrasi (dropdown program studi dari API) (FR-01)
- [ ] T-32 [FE] Halaman Profil mahasiswa: form data diri, unggah CV dan foto (FR-03)
- [ ] T-33 [FE] Kerangka Dashboard mahasiswa

**Selesai bila:** mahasiswa dapat registrasi, login, mengisi profil, dan rute terlindungi bekerja.

---

## Sprint 3 - Modul Admin

**Backend**

- [ ] T-34 [BE] Seed akun admin; `role('admin')` pada seluruh `/admin/*`
- [ ] T-35 [BE] CRUD `/admin/study-programs` dan `/admin/competency-categories` (FR-13)
- [ ] T-36 [BE] CRUD `/admin/competencies` dengan penolakan hapus bila masih dipakai (FK RESTRICT) (FR-13)
- [ ] T-37 [BE] CRUD `/admin/companies` termasuk `verified` (FR-12)
- [ ] T-38 [BE] CRUD `/admin/positions` beserta `lowongan_kompetensi` (`bobot`, `wajib`); validasi `tgl_tutup ≥ tgl_buka`, `kuota ≥ 1` (FR-12)
- [ ] T-39 [BE] `GET/PATCH /admin/users` (lihat akun, ubah `is_active`)
- [ ] T-40 [BE] Tes: token mahasiswa ke `/admin/*` mengembalikan 403; hapus kompetensi terpakai mengembalikan 409

**Frontend**

- [ ] T-41 [FE] Komponen tabel admin (header, paginasi, scroll horizontal di mobile) dan modal konfirmasi hapus
- [ ] T-42 [FE] Halaman admin Mitra (FR-12)
- [ ] T-43 [FE] Halaman admin Posisi dengan editor kompetensi yang dibutuhkan (bobot dan wajib) (FR-12)
- [ ] T-44 [FE] Halaman admin Kompetensi dan Kategori, Program Studi (FR-13)
- [ ] T-45 [FE] Halaman admin Pengguna (aktif/nonaktif)

**Selesai bila:** admin dapat mengisi seluruh data master dan lowongan dari antarmuka.

---

## Sprint 4 - Katalog dan Kompetensi Manual

**Backend**

- [ ] T-46 [BE] `GET /positions` dengan filter `q`, `kota`, `is_remote`, `bidang_usaha`, paginasi; hanya lowongan `aktif` dan dalam periode buka (FR-04)
- [ ] T-47 [BE] `GET /positions/:id` beserta kompetensi dan perusahaan (FR-05)
- [ ] T-48 [BE] `GET /competencies` (dengan kategori)
- [ ] T-49 [BE] `GET/POST/DELETE /students/me/competencies` (level, `bukti_url`, `sumber = 'manual'`); UNIQUE ditangani sebagai pembaruan (FR-03)
- [ ] T-50 [BE] Tes: filter lowongan, kompetensi ganda tidak membuat baris baru

**Frontend**

- [ ] T-51 [FE] Halaman Daftar Lowongan: `PositionCard`, `PositionFilter`, pencarian dengan `useDebounce`, filter di query string (FR-04)
- [ ] T-52 [FE] Halaman Detail Lowongan: persyaratan, kompetensi wajib dan bobot, tombol Lamar (FR-05)
- [ ] T-53 [FE] Editor kompetensi di Profil: pilih kompetensi per kategori, level pemula/menengah/mahir, tautan bukti (FR-03)
- [ ] T-54 [FE] Keadaan kosong dan loading di semua daftar

**Selesai bila:** mahasiswa dapat menelusuri lowongan dan mengisi profil kompetensi secara manual.

---

## Sprint 5 - Chatbot Pemetaan Kompetensi

**Backend dan AI**

- [ ] T-55 [AI] Konfigurasi klien LLM (`config/llm.js`), kunci hanya di `.env`
- [ ] T-56 [AI] Tulis prompt sistem dan skema Zod `llmOutputSchema` (level ENUM, confidence 0-1) (FR-06)
- [ ] T-57 [AI] Kuesioner cadangan (`fallbackQuestionnaire.js`) bila LLM gagal atau keluaran tidak valid (FR-06)
- [ ] T-58 [BE] `POST /chat/sessions`, `GET /chat/sessions/:id`, `POST /chat/sessions/:id/cancel` (FR-07)
- [ ] T-59 [AI] `handleMessage`: simpan `chatbot_pesan`, cocokkan nama ke master, simpan `chatbot_kompetensi_terdeteksi` (FR-06, FR-07)
- [ ] T-60 [AI] `konfirmasiSesi` dalam satu transaksi: pindahkan ke `mahasiswa_kompetensi` (`sumber = 'chatbot'`), level hanya naik, entri manual tidak ditimpa (FR-08)
- [ ] T-61 [BE] Rate limit `/chat/*`; validasi kepemilikan sesi
- [ ] T-62 [AI] Tes: skema LLM menolak output salah, konfirmasi tidak menimpa entri manual, pesan nama kompetensi tak dikenal diabaikan
- [ ] T-63 [AI] Uji coba prompt dengan 10 percakapan contoh; sesuaikan prompt

**Frontend**

- [ ] T-64 [FE] `ChatWindow`, `MessageBubble`, `ChatInput`, indikator mengetik, auto-scroll (FR-06)
- [ ] T-65 [FE] `CompetencyDraft`: ringkasan kompetensi terdeteksi, ubah level, hapus item sebelum konfirmasi (FR-08)
- [ ] T-66 [FE] Halaman Chatbot: mulai sesi, kirim pesan, tombol "Simpan profil", arahkan ke Rekomendasi (FR-06 sampai FR-08)
- [ ] T-67 [FE] Penanganan error chatbot (toast, kirim ulang) dan tampilan mode kuesioner cadangan

**Selesai bila:** mahasiswa menyelesaikan chat dan kompetensi terkonfirmasi muncul di profil.

---

## Sprint 6 - Mesin Rekomendasi

**Backend**

- [ ] T-68 [PM] [AI] Finalkan keputusan metode: SAW, konversi level 1/3-3/3, faktor wajib 0,5, `TOP_N = 10`
- [ ] T-69 [AI] `hitungSkor` (murni, tanpa akses database) (FR-09)
- [ ] T-70 [AI] `generateRekomendasi`: filter kelayakan, hitung, hapus hasil lama, simpan Top-N dengan `metode = 'SAW'` dan `detail_perhitungan` (FR-09)
- [ ] T-71 [BE] `GET /recommendations` dan `POST /recommendations/refresh` (FR-09, FR-10)
- [ ] T-72 [AI] Panggil perhitungan ulang setelah konfirmasi chatbot dan perubahan kompetensi manual (FR-10)
- [ ] T-73 [AI] Tes unit `hitungSkor`: semua mahir = 100, wajib hilang = skor × 0,5, lowongan tanpa persyaratan dilewati
- [ ] T-74 [AI] Verifikasi manual dengan tiga mahasiswa dummy (Budi, Siti, Andi) dan catat skornya

**Frontend**

- [ ] T-75 [FE] `RecommendationCard`, `ScoreBadge` (hijau ≥ 75, kuning 50-74, merah < 50), `SkillGapList` (FR-09)
- [ ] T-76 [FE] Halaman Rekomendasi dengan tombol "Perbarui rekomendasi" dan keadaan kosong (FR-09, FR-10)
- [ ] T-77 [FE] Tampilkan rekomendasi teratas di Dashboard mahasiswa

**Selesai bila:** mahasiswa melihat Top-N rekomendasi lengkap dengan skor dan alasan.

---

## Sprint 7 - Lamaran, Notifikasi, Dashboard Admin, QA

**Backend**

- [ ] T-78 [BE] `POST /applications`: cek lowongan layak, UNIQUE ganda ke 409, isi `sumber_rekomendasi` (FR-11)
- [ ] T-79 [BE] `GET /applications` dan `PATCH /applications/:id/cancel` (FR-11)
- [ ] T-80 [BE] `GET/PATCH /admin/applications`: ubah status dan `catatan_perusahaan`; status `diterima` dalam transaksi dengan pengecekan `kuota` dan isi `tgl_respons`
- [ ] T-81 [BE] Notifikasi: buat baris `notifikasi` saat status lamaran berubah dan rekomendasi baru; `GET /notifications`, tandai dibaca
- [ ] T-82 [BE] `GET /admin/stats` (jumlah mahasiswa, lamaran per status, kompetensi populer, lowongan teraktif) (FR-14)
- [ ] T-83 [BE] `GET /admin/applications/export` (CSV) (FR-15)
- [ ] T-84 [BE] Tes: lamaran ganda 409, lowongan tutup ditolak, penerimaan melebihi kuota ditolak

**Frontend**

- [ ] T-85 [FE] Halaman Lamaran Saya (daftar dan status, batalkan) dan tombol Lamar di detail dan rekomendasi (FR-11)
- [ ] T-86 [FE] `notifications.api.js`: fungsi `getNotifications()`, `markRead(id)`, `markAllRead()`; gunakan di ikon lonceng dan halaman notifikasi (`/app/notifikasi`)
- [ ] T-87 [FE] Ikon lonceng notifikasi di header dengan badge jumlah belum-dibaca; halaman `/app/notifikasi`
- [ ] T-88 [FE] Dashboard admin dengan kartu statistik dan grafik sederhana (FR-14)
- [ ] T-89 [FE] Halaman admin Lamaran: ubah status, catatan, ekspor CSV (FR-15)
- [ ] T-90 [FE] Halaman admin Pengguna (`/admin/pengguna`): tabel akun, toggle aktif/nonaktif (memanggil `PATCH /admin/users/:id`)

**Kualitas**

- [ ] T-91 [ALL] Uji alur lengkap: registrasi → profil → chatbot → rekomendasi → lamaran → keputusan admin → notifikasi
- [ ] T-92 [FE] Cek responsif (360 px, 768 px, 1024 px) dan aksesibilitas dasar (label, fokus, kontras)
- [ ] T-93 [BE] Tinjau keamanan: kepemilikan data, role, rate limit, tidak ada rahasia di repo
- [ ] T-94 [FE] Tangani edge case `perusahaan.user_id = null`: UI tidak boleh error saat menampilkan detail perusahaan atau lowongan yang perusahaannya tidak punya akun
- [ ] T-95 [ALL] Perbaiki bug dari uji dan review; bekukan fitur (feature freeze)

**Selesai bila:** seluruh kebutuhan prioritas M dan S berjalan dari ujung ke ujung.

---

## Sprint 8 - Deployment dan Penutupan

- [ ] T-96 [BE] Siapkan database produksi (MySQL terkelola atau layanan hosting), jalankan `schema.sql` dan seed data riil
- [ ] T-97 [BE] Deploy backend (Render atau Railway), isi variabel lingkungan, atur CORS ke domain frontend
- [ ] T-98 [FE] Deploy frontend (Vercel): root `client`, `VITE_API_URL` ke backend produksi, rewrite SPA ke `index.html` (tambahkan `vercel.json`)
- [ ] T-99 [BE] Atur cadangan database harian menggunakan `mysqldump` terjadwal atau fitur backup otomatis penyedia hosting; simpan ke cloud storage; uji pemulihan sekali sebelum UAT
- [ ] T-100 [PM] Susun skenario dan lembar UAT; jalankan UAT dengan minimal 5 mahasiswa
- [ ] T-101 [PM] Ukur metrik PRD: waktu registrasi sampai rekomendasi ≤ 10 menit, penyelesaian sesi chatbot ≥ 80%, survei relevansi ≥ 4 dari 5, respons halaman ≤ 2 detik
- [ ] T-102 [BE] [AI] Uji performa ringan: respons chatbot ≤ 8 detik, hitung rekomendasi ≤ 3 detik untuk 100 lowongan
- [ ] T-103 [ALL] Perbaiki temuan UAT dan performa
- [ ] T-104 [BE] Rapikan dokumentasi API (Swagger/Postman) dan `README` (instalasi, env, seed, akun demo)
- [ ] T-105 [PM] Perbarui PRD (bagian bobot skor dan database) agar sama dengan implementasi akhir
- [ ] T-106 [PM] Susun laporan proyek dan bahan presentasi; siapkan skenario demo dan akun demo
- [ ] T-107 [ALL] Latihan presentasi dan demo; rilis versi akhir ke `main` dan beri tag

**Selesai bila:** aplikasi dapat diakses publik, UAT lulus, dokumentasi lengkap, demo siap.

---

## Tugas Berulang (Setiap Sprint)

- [ ] R-01 [ALL] Daily/weekly sync singkat dipimpin `[PM]`; perbarui papan kanban setiap sesi
- [ ] R-02 [ALL] Setiap PR direview minimal satu anggota dan lolos checklist PR
- [ ] R-03 [PM] Sprint review dan retrospektif; sesuaikan prioritas bila ada risiko (data lowongan sedikit, kuota LLM, cakupan melebar)
- [ ] R-04 [BE] Pastikan perubahan skema disertai file di `server/sql/migrations/` dan `prisma db pull` ulang; **jangan mengedit `schema.prisma` manual**
- [ ] R-05 [ALL] Tidak ada `.env`, kunci API, atau `console.log` tertinggal di commit
- [ ] R-06 [BE] [FE] Perbarui dokumentasi Swagger/Postman dan `03-FRONTEND.md` setiap kali endpoint atau komponen baru ditambah (bukan hanya di akhir sprint)

## Peta Kebutuhan ke Tugas

| Kebutuhan                         | Tugas                                    |
| --------------------------------- | ---------------------------------------- |
| FR-01 Autentikasi (registrasi)    | T-19 sampai T-21, T-25, T-31             |
| FR-02 Ubah sandi dan logout       | T-24                                     |
| FR-03 Profil dan kompetensi       | T-22, T-23, T-32, T-49, T-53             |
| FR-04, FR-05 Katalog              | T-46, T-47, T-51, T-52                   |
| FR-06 sampai FR-08 Chatbot        | T-55 sampai T-67                         |
| FR-09, FR-10 Rekomendasi          | T-68 sampai T-77                         |
| FR-11 Lamaran (pengganti favorit) | T-78, T-79, T-85                         |
| FR-12, FR-13 Admin master         | T-35 sampai T-38, T-42 sampai T-44, T-90 |
| FR-14, FR-15 Statistik dan ekspor | T-82, T-83, T-88, T-89                   |
| Notifikasi                        | T-81, T-86, T-87                         |
