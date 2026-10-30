# 03 - Frontend

Single Page Application dengan React dan Vite, bergaya Tailwind CSS, berkomunikasi dengan backend lewat REST API. Aturan visual lengkap ada di `04-STYLEGUIDE.md`.

## 1. Tech Stack Frontend

| Kebutuhan            | Teknologi                                              |
| -------------------- | ------------------------------------------------------ |
| Framework dan build  | React 18+, Vite                                        |
| Routing              | React Router                                           |
| Styling              | Tailwind CSS                                           |
| HTTP client          | Axios                                                  |
| State global         | Context API (AuthContext); Zustand bila state membesar |
| Form dan validasi    | React Hook Form + Zod                                  |
| Ikon                 | lucide-react                                           |
| Notifikasi           | react-hot-toast                                        |
| Pengujian (opsional) | Vitest + React Testing Library                         |
| Kualitas kode        | ESLint, Prettier                                       |

## 2. Struktur Folder `client/`

```
client/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js               # instance axios + interceptor token
│   │   ├── auth.api.js
│   │   ├── students.api.js
│   │   ├── positions.api.js
│   │   ├── chat.api.js
│   │   ├── recommendations.api.js
│   │   ├── applications.api.js
│   │   ├── notifications.api.js   # GET /notifications, PATCH tandai dibaca
│   │   └── admin.api.js
│   ├── assets/
│   ├── components/
│   │   ├── ui/                    # Button, Input, Card, Badge, Modal, Spinner, Table
│   │   ├── chat/                  # ChatWindow, MessageBubble, ChatInput, CompetencyDraft
│   │   ├── positions/             # PositionCard, PositionFilter
│   │   └── recommendations/       # RecommendationCard, ScoreBadge, SkillGapList
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js             # Mengonsumsi AuthContext; menyediakan { user, loading, login, logout }
│   │   └── useDebounce.js
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   ├── StudentLayout.jsx
│   │   └── AdminLayout.jsx
│   ├── pages/
│   │   ├── public/                # Landing, Login, Register
│   │   ├── student/               # Dashboard, Profile, Positions, PositionDetail,
│   │   │                          # Chatbot, Recommendations, Applications
│   │   └── admin/                 # Dashboard, Companies, Positions, Competencies
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── utils/
│   │   ├── format.js
│   │   └── constants.js
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

## 3. Environment (`.env.example`)

```
VITE_API_URL=http://localhost:5000/api
```

## 4. Peta Halaman dan Rute

| Rute                  | Halaman                     | Akses     | Kebutuhan                                |
| --------------------- | --------------------------- | --------- | ---------------------------------------- |
| `/`                   | Landing                     | Publik    | Pengenalan sistem dan tombol mulai       |
| `/login`, `/register` | Login, Register             | Publik    | FR-01                                    |
| `/app`                | Dashboard mahasiswa         | Mahasiswa | Ringkasan profil dan rekomendasi teratas |
| `/app/profil`         | Profil                      | Mahasiswa | FR-03                                    |
| `/app/magang`         | Daftar posisi dengan filter | Mahasiswa | FR-04                                    |
| `/app/magang/:id`     | Detail posisi               | Mahasiswa | FR-05                                    |
| `/app/chatbot`        | Chatbot pemetaan kompetensi | Mahasiswa | FR-06, FR-07, FR-08                      |
| `/app/rekomendasi`    | Hasil rekomendasi           | Mahasiswa | FR-09, FR-10                             |
| `/app/lamaran`        | Lamaran saya dan statusnya  | Mahasiswa | FR-11                                    |
| `/app/notifikasi`     | Daftar notifikasi           | Mahasiswa | Pendukung lamaran dan rekomendasi        |
| `/admin`              | Dashboard admin             | Admin     | FR-14                                    |
| `/admin/mitra`        | Kelola mitra                | Admin     | FR-12                                    |
| `/admin/posisi`       | Kelola posisi               | Admin     | FR-12                                    |
| `/admin/kompetensi`   | Kelola master kompetensi    | Admin     | FR-13                                    |
| `/admin/pengguna`     | Kelola akun pengguna        | Admin     | Aktif/nonaktif akun                      |

## 5. Alur Pengguna Utama (Mahasiswa)

1. Registrasi dan login.
2. Melengkapi profil (prodi, semester, IPK).
3. Membuka halaman Chatbot, menjawab pertanyaan hingga ringkasan profil muncul.
4. Mengonfirmasi atau mengoreksi ringkasan, lalu menyimpan.
5. Diarahkan ke halaman Rekomendasi: kartu posisi berurutan dengan skor, alasan cocok, dan skill yang kurang.
6. Mengajukan lamaran ke lowongan pilihan dan memantau statusnya.

## 6. Konfigurasi Axios dan Autentikasi

```js
// src/api/axios.js
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
```

```jsx
// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Memuat...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

### Kontrak `useAuth`

```js
// src/hooks/useAuth.js — state yang tersedia untuk semua komponen
const {
  user,      // object | null  — data dari GET /auth/me (id, email, role, mahasiswa: {...})
  loading,   // boolean        — true saat sedang verifikasi token saat pertama mount
  login,     // async (email, password) => void  — simpan token, set user
  logout,    // () => void     — hapus token dari localStorage, reset user ke null
} = useAuth();
```

## 7. Komponen Kunci

| Komponen             | Tanggung jawab                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatWindow`         | Menampilkan daftar pesan, auto-scroll, indikator mengetik, dan kotak input                                                                  |
| `MessageBubble`      | Gelembung pesan; gaya berbeda untuk `user` dan `bot` (kolom `peran`)                                                                        |
| `CompetencyDraft`    | Panel ringkasan profil hasil ekstraksi (kompetensi dengan level pemula/menengah/mahir dan confidence) yang dapat dikoreksi sebelum disimpan |
| `PositionCard`       | Kartu posisi: judul, perusahaan, bidang, sistem kerja, tombol Lamar                                                                         |
| `RecommendationCard` | Kartu hasil: skor, badge kecocokan, daftar skill cocok dan kurang                                                                           |
| `ScoreBadge`         | Lencana skor berwarna sesuai rentang (tinggi, sedang, rendah)                                                                               |
| `ProtectedRoute`     | Penjaga rute berdasarkan login dan peran                                                                                                    |

### Kerangka halaman Chatbot

```jsx
// src/pages/student/Chatbot.jsx (kerangka)
import { useEffect, useState } from "react";
import { startSession, sendMessage, confirmSession } from "../../api/chat.api";

export default function Chatbot() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [terdeteksi, setTerdeteksi] = useState([]);
  const [sending, setSending] = useState(false);
  const [selesai, setSelesai] = useState(false);

  useEffect(() => {
    startSession().then(({ data }) => {
      setSessionId(data.data.id);
      setMessages([{ peran: "bot", isi_pesan: data.data.greeting }]);
    });
  }, []);

  async function handleSend(text) {
    setMessages((m) => [...m, { peran: "user", isi_pesan: text }]);
    setSending(true);
    try {
      const { data } = await sendMessage(sessionId, text);
      setMessages((m) => [...m, { peran: "bot", isi_pesan: data.data.reply }]);
      setTerdeteksi(data.data.terdeteksi);
      setSelesai(data.data.selesai);
    } finally {
      setSending(false);
    }
  }

  async function handleFinish() {
    await confirmSession(
      sessionId,
      terdeteksi.map((t) => ({ id: t.id, level: t.level })),
    ); // level dapat sudah dikoreksi mahasiswa
    // arahkan ke /app/rekomendasi
  }

  // render: <ChatWindow/> + <CompetencyDraft/> + tombol "Simpan profil" bila selesai
}
```

## 8. State dan Data

| Data                                 | Tempat                                      | Catatan                                                            |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------ |
| Pengguna login dan token             | `AuthContext` + `localStorage`              | Dimuat ulang lewat `/auth/me` saat aplikasi dibuka                 |
| Daftar posisi dan filter             | State halaman, filter ikut query string URL | Pencarian memakai `useDebounce`                                    |
| Pesan chat dan kompetensi terdeteksi | State halaman Chatbot                       | Riwayat dapat dimuat dari `/chat/sessions/:id`                     |
| Rekomendasi                          | Diambil saat halaman dibuka                 | Tombol "Perbarui rekomendasi" memanggil `/recommendations/refresh` |
| Notifikasi                           | Diambil saat halaman notifikasi dibuka      | Fetch ulang setiap mount; tidak ada polling/WebSocket di MVP        |

> **Kapan pakai Zustand?** Gunakan `AuthContext` (Context API) selama jumlah state global ≤ 2–3 entitas. Tambahkan Zustand bila muncul kebutuhan state global baru (misalnya daftar notifikasi belum-dibaca yang di-share antarhalaman), agar tidak terjadi prop-drilling berlebihan.

## 9. Penanganan UI

- Setiap pemanggilan API memiliki tiga keadaan: memuat (spinner atau skeleton), berhasil, gagal (toast dan pesan jelas).
- Keadaan kosong: halaman daftar dan rekomendasi menampilkan ajakan tindakan (misalnya "Mulai chat untuk mendapat rekomendasi").
- Form divalidasi di klien dengan Zod, tetapi server tetap menjadi sumber validasi akhir.
- Antarmuka mobile-first; layout utama mahasiswa memakai navigasi bawah di layar kecil dan sidebar di layar besar.
- Aksesibilitas dasar: label pada input, kontras warna memadai, fokus terlihat, teks alternatif pada gambar.

## 10. Konfigurasi Tailwind

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
```

Token warna dan tipografi lengkap ada di `04-STYLEGUIDE.md`.

## 11. Perintah Penting

```bash
npm create vite@latest client -- --template react   # inisialisasi (sekali)
npm install react-router-dom axios react-hook-form zod @hookform/resolvers lucide-react react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev        # server pengembangan (port 5173)
npm run build      # build produksi ke folder dist
```

## 12. Deployment

Frontend dideploy ke Vercel (root directory `client`, build command `npm run build`, output `dist`).

**Langkah penting sebelum deploy:**
1. Buka dashboard Vercel → Settings → Environment Variables.
2. Tambahkan `VITE_API_URL` dengan nilai URL backend produksi (contoh: `https://api.rekomendasi-magang.onrender.com/api`).
3. Tambahkan aturan rewrite di `vercel.json` agar semua rute SPA diarahkan ke `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Tanpa langkah ini, navigasi langsung ke `/app/profil` akan menghasilkan 404 di Vercel.
