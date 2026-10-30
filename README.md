# Rekomendasi Magang

Sistem rekomendasi lowongan magang berbasis kompetensi mahasiswa dengan chatbot AI.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma (introspeksi)
- **Database**: MySQL 8.0+ (`db_magang`)
- **AI/LLM**: Gemini / OpenAI

## Prasyarat
- Node.js LTS
- MySQL 8.0+
- Git

## Cara Setup

```bash
# 1. Clone repo
git clone <url-repo> rekomendasi-magang
cd rekomendasi-magang

# 2. Install semua dependensi
npm install
npm run install:all

# 3. Siapkan environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit server/.env: isi DATABASE_URL, JWT_SECRET, LLM_API_KEY, LLM_MODEL

# 4. Buat database dan jalankan schema
mysql -u root -p < server/sql/schema.sql

# 5. Introspeksi Prisma
cd server
npx prisma db pull
npx prisma generate
node prisma/seed.js
cd ..

# 6. Jalankan aplikasi
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# Prisma Studio (opsional): cd server && npx prisma studio → http://localhost:5555
```

## Akun Demo (setelah seed)
| Role     | Email              | Password  |
|----------|--------------------|-----------|
| Admin    | admin@demo.com     | Admin123! |
| Mahasiswa| budi@demo.com      | Mhs123!   |

## Struktur Folder
Lihat `docs/01-PROJECT-STRUCTURE.md`.

## Dokumentasi
Semua dokumen ada di folder `docs/`.
