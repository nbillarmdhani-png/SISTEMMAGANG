# Panduan Deployment Produksi — Sistem Rekomendasi Magang

Panduan ini menjelaskan langkah demi langkah untuk mendeploy aplikasi Sistem Rekomendasi Magang ke lingkungan produksi secara online.

---

## 🏗 Arsitektur Deployment yang Direkomendasikan

* **Database**: MySQL terkelola (Aiven / Railway / VPS MySQL)
* **Backend API**: Railway atau Render Web Service (Node.js LTS / Docker)
* **Frontend**: Vercel (Root: `client`)

---

## 1. Persiapan Database (MySQL)

Pilih salah satu penyedia database MySQL gratis/cloud:
* **Aiven (Free Tier)**: https://aiven.io (MySQL managed)
* **Railway (Database MySQL)**: https://railway.app

Setelah membuat database, catat connection string URI-nya, contoh:
```
mysql://avnadmin:PASSWORD@mysql-xxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
```

### Inisialisasi Skema & Data Awal
Dari komputer lokal, Anda dapat langsung mengarahkan `DATABASE_URL` ke database cloud tersebut untuk menjalankan skema:
```bash
cd server
# 1. Terapkan skema prisma ke database cloud
npx prisma db push

# 2. Jalankan seeder data mitra & lowongan
npm run seed
```
*(Atau import file `server/sql/db_magang_full.sql` melalui phpMyAdmin / DBeaver).*

> ⚠️ **PENTING**: Segera ganti password akun admin default (`admin@magang.com` / `AdminPassword123!`) setelah seeding selesai.

---

## 2. Deploy Backend (Railway / Render)

### Langkah di Railway / Render:
1. Hubungkan repositori GitHub Anda.
2. Atur **Root Directory** ke folder `server` (jika menggunakan monorepo setup) atau gunakan Dockerfile bawaan di `server/Dockerfile`.
3. Atur **Build Command**: `npm install && npx prisma generate`
4. Atur **Start Command**: `npm start`
5. Atur **Environment Variables** di dashboard hosting:

| Variabel | Contoh Nilai Produksi | Keterangan |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Mode produksi |
| `PORT` | `5000` *(atau biarkan host menentukan)* | Port server |
| `DATABASE_URL` | `mysql://user:pass@host:port/db` | Connection string MySQL cloud |
| `JWT_SECRET` | *(string acak 64 karakter)* | Kunci rahasia token JWT |
| `JWT_EXPIRES_IN` | `1d` | Durasi token |
| `CLIENT_URL` | `https://nama-proyek.vercel.app` | Domain frontend Anda (tanpa trailing slash) |
| `UPLOAD_DIR` | `uploads` | Direktori upload lokal |
| `LLM_PROVIDER` | `gemini` | Provider LLM |
| `LLM_API_KEY` | *(Google AI Studio API Key)* | API Key Gemini |
| `LLM_MODEL` | `gemini-1.5-flash` | Model Gemini |

Catat URL publik backend setelah selesai dideploy, misalnya:
`https://api-magang.up.railway.app`

---

## 3. Deploy Frontend (Vercel)

### Langkah di Vercel:
1. Klik **Add New Project** di Vercel dan pilih repositori GitHub proyek ini.
2. Di bagian **Root Directory**, klik **Edit** dan pilih folder `client`.
3. Framework Preset akan otomatis terdeteksi sebagai **Vite**.
4. Tambahkan **Environment Variables**:

| Variabel | Nilai | Keterangan |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://api-magang.up.railway.app/api` | URL backend Anda diikuti `/api` |

5. Klik **Deploy**.
6. Konfigurasi rewrite SPA dan header keamanan sudah otomatis ditangani oleh file `client/vercel.json`.

---

## 4. Verifikasi Akhir Pasca Deploy

1. Buka domain frontend Vercel (misal: `https://nama-proyek.vercel.app`).
2. Login menggunakan akun demo atau daftarkan akun mahasiswa baru.
3. Coba fitur utama:
   - Pencarian lowongan magang.
   - Percakapan dengan Chatbot AI (memastikan integrasi Gemini API aktif).
   - Menghasilkan rekomendasi magang.
   - Login ke akun admin (`/login` → `admin@magang.com`) dan pastikan panel admin dapat diakses.

