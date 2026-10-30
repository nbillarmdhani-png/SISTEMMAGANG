# 01 - Struktur Proyek

Proyek memakai satu repositori (monorepo) dengan dua aplikasi terpisah: `client` (React) dan `server` (Express). Keduanya ditulis dengan JavaScript (ES Modules).

## 1. Struktur Folder Tingkat Atas

```
rekomendasi-magang/
├── client/                 # Frontend: React + Vite + Tailwind
├── server/                 # Backend: Node.js + Express + Prisma
├── docs/                   # PRD, ERD, wireframe, dokumen turunan
│   ├── PRD.md
│   ├── 01-PROJECT-STRUCTURE.md
│   ├── 02-BACKEND.md
│   ├── 03-FRONTEND.md
│   ├── 04-STYLEGUIDE.md
│   ├── 05-DATABASE.md
│   └── 06-TASKLIST.md
├── .gitignore
├── .editorconfig
├── package.json            # Script gabungan (menjalankan client + server)
└── README.md               # Cara instalasi dan menjalankan proyek
```

## 2. Gambaran Ringkas Isi `server/` dan `client/`

```
server/
├── sql/
│   ├── schema.sql          # DDL db_magang (15 tabel)
│   ├── seed.sql            # data dummy
│   └── migrations/
├── prisma/
│   ├── schema.prisma       # hasil `prisma db pull` — JANGAN diedit manual
│   └── seed.js
├── src/
│   ├── config/             # env, koneksi, konfigurasi LLM
│   ├── middlewares/        # auth, role, error handler, rate limit
│   ├── modules/            # auth, students, master, positions, chatbot,
│   │                       # recommendations, applications, notifications, admin
│   ├── utils/
│   ├── app.js
│   └── server.js
├── uploads/                # File CV dan foto (dibuat otomatis saat startup, tidak di-commit)
├── tests/
├── .env.example
└── package.json

client/
├── public/
├── src/
│   ├── api/                # axios instance dan fungsi pemanggil API
│   ├── assets/
│   ├── components/         # komponen UI dan komponen fitur
│   ├── context/            # AuthContext
│   ├── hooks/
│   ├── layouts/
│   ├── pages/              # halaman per rute
│   ├── routes/             # definisi rute dan ProtectedRoute
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

Detail lengkap: lihat `02-BACKEND.md`, `03-FRONTEND.md`, dan skema database di `05-DATABASE.md`.

## 3. Port dan Environment

| Layanan           | Port lokal | File env                                                            |
| ----------------- | ---------- | ------------------------------------------------------------------- |
| Frontend (Vite)   | 5173       | `client/.env`                                                       |
| Backend (Express) | 5000       | `server/.env`                                                       |
| MySQL             | 3306       | dipakai oleh `DATABASE_URL` di `server/.env` (database `db_magang`) |
| Prisma Studio     | 5555       | (tidak perlu env tambahan; jalankan manual saat development)        |

File `.env` tidak boleh di-commit. Hanya `.env.example` yang masuk repositori.

## 4. `package.json` di Root (opsional, memudahkan pengembangan)

```json
{
  "name": "rekomendasi-magang",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "install:all": "npm install --prefix server && npm install --prefix client",
    "lint": "npm run lint --prefix server && npm run lint --prefix client",
    "test": "npm test --prefix server"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

## 5. `.gitignore` Minimal

```
node_modules/
.env
dist/
build/
coverage/
.DS_Store
*.log
server/uploads/
```

## 6. Langkah Setup dari Nol

```bash
# 1. Clone dan masuk ke folder proyek
git clone <url-repo> rekomendasi-magang
cd rekomendasi-magang

# 2. Install dependensi root (hanya concurrently) lalu dependensi client dan server
npm install
npm run install:all   # menjalankan: npm install --prefix server && npm install --prefix client

# 3. Siapkan environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Wajib diisi di server/.env: DATABASE_URL, JWT_SECRET, LLM_API_KEY, LLM_MODEL

# 4. Siapkan database
mysql -u root -p < server/sql/schema.sql  # buat db_magang dan 15 tabel
cd server
npx prisma db pull     # hasilkan schema.prisma (JANGAN diedit manual)
npx prisma generate    # hasilkan Prisma Client
node prisma/seed.js    # seed dengan hash bcrypt asli
cd ..

# 5. Jalankan frontend dan backend bersamaan
npm run dev
# Frontend: http://localhost:5173  |  Backend: http://localhost:5000
# Prisma Studio (opsional): cd server && npx prisma studio  → http://localhost:5555
```

## 7. Alur Kerja Git Tim

| Branch                        | Fungsi                                                    |
| ----------------------------- | --------------------------------------------------------- |
| `main`                        | Kode stabil, siap demo atau deploy                        |
| `develop`                     | Integrasi pekerjaan sprint berjalan                       |
| `feature/<modul>-<deskripsi>` | Pengembangan fitur, misalnya `feature/chatbot-extraction` |
| `fix/<deskripsi>`             | Perbaikan bug                                             |

Aturan: tidak ada commit langsung ke `main`; setiap perubahan lewat Pull Request ke `develop` dan di-review minimal satu anggota lain. Format commit dan checklist PR ada di `04-STYLEGUIDE.md`.

## 8. Pembagian Tanggung Jawab Folder (saran)

| Folder                                          | Penanggung jawab utama            |
| ----------------------------------------------- | --------------------------------- |
| `server/` (auth, CRUD, database)                | Backend dan database              |
| `server/src/modules/chatbot`, `recommendations` | Integrasi chatbot dan rekomendasi |
| `client/`                                       | Frontend dan UI/UX                |
| `docs/`                                         | Analis/PM                         |
