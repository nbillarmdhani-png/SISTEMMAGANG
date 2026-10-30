# 02 - Backend

REST API berbasis Node.js dan Express dengan MySQL (`db_magang`) dan Prisma sebagai ORM. Skema database lengkap ada di `05-DATABASE.md`; dokumen ini membahas kode, endpoint, chatbot, dan rekomendasi yang mengikuti skema tersebut.

## 1. Tech Stack Backend

| Kebutuhan                | Teknologi                                                                        |
| ------------------------ | -------------------------------------------------------------------------------- |
| Runtime dan framework    | Node.js (LTS), Express.js, ES Modules                                            |
| ORM dan database         | Prisma (introspeksi dari DDL), MySQL 8.0+                                        |
| Autentikasi              | jsonwebtoken, bcrypt                                                             |
| Validasi                 | Zod                                                                              |
| Keamanan                 | helmet, cors, express-rate-limit                                                 |
| LLM                      | SDK resmi penyedia: `@google/generative-ai` (Gemini) atau `openai` (OpenAI); kunci di `.env` |
| Upload berkas (CV, foto) | multer; disimpan ke `server/uploads/` (dibuat otomatis, tidak di-commit)        |
| Logging                  | morgan (format `dev` saat development, `combined` saat production)              |
| Pengujian                | Vitest atau Jest, Supertest                                                      |
| Dokumentasi API          | Swagger (`swagger-jsdoc`, `swagger-ui-express`) **wajib diperbarui** setiap endpoint baru ditambah |
| Dev tools                | nodemon, ESLint, Prettier                                                        |

## 2. Struktur Folder `server/`

```
server/
├── sql/
│   ├── schema.sql                 # DDL db_magang (lihat 05-DATABASE.md)
│   ├── seed.sql                   # data dummy (opsional)
│   └── migrations/                # perubahan skema berikutnya
├── prisma/
│   ├── schema.prisma              # dihasilkan oleh `prisma db pull`
│   └── seed.js                    # seed dengan hash bcrypt asli
├── src/
│   ├── config/
│   │   ├── env.js
│   │   ├── prisma.js
│   │   └── llm.js
│   ├── middlewares/
│   │   ├── auth.js                # verifikasi JWT + cek users.is_active
│   │   ├── role.js                # otorisasi per peran
│   │   ├── validate.js            # Zod untuk body/query
│   │   ├── rateLimit.js
│   │   ├── upload.js              # multer untuk CV dan foto
│   │   └── errorHandler.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── students/              # tabel mahasiswa, mahasiswa_kompetensi
│   │   ├── master/                # program_studi, kategori_kompetensi, kompetensi
│   │   ├── positions/             # lowongan_magang, lowongan_kompetensi, perusahaan
│   │   ├── chatbot/               # chatbot_sesi, chatbot_pesan, chatbot_kompetensi_terdeteksi
│   │   ├── recommendations/       # rekomendasi
│   │   ├── applications/          # lamaran
│   │   ├── notifications/         # notifikasi
│   │   └── admin/
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── AppError.js
│   ├── app.js
│   └── server.js
├── tests/
├── .env.example
└── package.json
```

Pola modul: `*.routes.js`, `*.controller.js`, `*.service.js`, `*.schema.js` (Zod).

## 3. Environment (`.env.example`)

```
NODE_ENV=development
PORT=5000
DATABASE_URL="mysql://user:password@localhost:3306/db_magang"
JWT_SECRET=ganti_dengan_string_acak_panjang
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
LLM_PROVIDER=gemini
LLM_API_KEY=isi_kunci_api
LLM_MODEL=isi_nama_model
```

## 4. Database

Skema 15 tabel (`users`, `program_studi`, `mahasiswa`, `kategori_kompetensi`, `kompetensi`, `mahasiswa_kompetensi`, `perusahaan`, `lowongan_magang`, `lowongan_kompetensi`, `rekomendasi`, `chatbot_sesi`, `chatbot_pesan`, `chatbot_kompetensi_terdeteksi`, `lamaran`, `notifikasi`) didefinisikan di `05-DATABASE.md`. Alurnya:

```bash
mysql -u root -p < sql/schema.sql   # buat database dan tabel
npx prisma db pull                  # schema.prisma dari database
npx prisma generate
```

Kode di bawah memakai nama model hasil introspeksi (`prisma.mahasiswa`, `prisma.lowongan_magang`, dan seterusnya). Periksa nama model, field relasi, dan enum pada `schema.prisma` hasil pull; sesuaikan bila berbeda.

Pemetaan level kompetensi (ENUM `pemula`, `menengah`, `mahir`) ke angka:

```js
// src/utils/constants.js
export const LEVEL_NILAI = { pemula: 1, menengah: 2, mahir: 3 };
export const LEVEL_MAKS = 3;
```

## 5. Daftar Endpoint

Semua endpoint berawalan `/api`. Selain yang bertanda Publik, wajib header `Authorization: Bearer <token>`.

| Metode     | Endpoint                                                                       | Fungsi                                                                         | Tabel                                               | Akses     |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------- | --------- |
| POST       | `/auth/register`                                                               | Buat akun `users` (role mahasiswa) dan profil `mahasiswa` dalam satu transaksi | users, mahasiswa                                    | Publik    |
| POST       | `/auth/login`                                                                  | Login, tolak bila `is_active = 0`                                              | users                                               | Publik    |
| GET        | `/auth/me`                                                                     | Akun dan profil yang login                                                     | users, mahasiswa                                    | Semua     |
| PATCH      | `/auth/change-password`                                                        | Ubah kata sandi (`{currentPassword, newPassword}`); verifikasi bcrypt dulu     | users                                               | Semua     |
| GET        | `/study-programs`                                                              | Daftar program studi (untuk form registrasi)                                   | program_studi                                       | Publik    |
| GET        | `/competencies`                                                                | Master kompetensi beserta kategori                                             | kompetensi, kategori_kompetensi                     | Semua     |
| GET        | `/students/me`                                                                 | Lihat profil mahasiswa yang login                                              | mahasiswa                                           | Mahasiswa |
| PUT        | `/students/me`                                                                 | Ubah profil: `nama_lengkap`, `semester`, `ipk`, `no_telp`, `alamat`, `porto_url` | mahasiswa                                         | Mahasiswa |
| POST       | `/students/me/cv`, `/students/me/photo`                                        | Unggah CV dan foto (simpan path ke `cv_path` / `foto`)                         | mahasiswa                                           | Mahasiswa |
| GET        | `/students/me/competencies`                                                    | Kompetensi profil                                                              | mahasiswa_kompetensi                                | Mahasiswa |
| POST       | `/students/me/competencies`                                                    | Tambah atau ubah kompetensi manual `{kompetensi_id, level, bukti_url?}`        | mahasiswa_kompetensi                                | Mahasiswa |
| DELETE     | `/students/me/competencies/:kompetensiId`                                      | Hapus kompetensi dari profil                                                   | mahasiswa_kompetensi                                | Mahasiswa |
| GET        | `/positions`                                                                   | Daftar lowongan layak/aktif (filter: q, kota, is_remote, bidang_usaha, page)   | lowongan_magang, perusahaan                         | Mahasiswa |
| GET        | `/positions/:id`                                                               | Detail lowongan dan kompetensi yang dibutuhkan                                 | lowongan_magang, lowongan_kompetensi                | Mahasiswa |
| POST       | `/chat/sessions`                                                               | Mulai sesi chatbot                                                             | chatbot_sesi                                        | Mahasiswa |
| GET        | `/chat/sessions/:id`                                                           | Pesan dan kompetensi terdeteksi                                                | chatbot_pesan, chatbot_kompetensi_terdeteksi        | Mahasiswa |
| POST       | `/chat/sessions/:id/messages`                                                  | Kirim pesan, terima balasan bot                                                | chatbot_pesan                                       | Mahasiswa |
| POST       | `/chat/sessions/:id/confirm`                                                   | Konfirmasi hasil deteksi `{items: [{id, level}]}`, pindahkan ke profil         | chatbot_kompetensi_terdeteksi, mahasiswa_kompetensi | Mahasiswa |
| POST       | `/chat/sessions/:id/cancel`                                                    | Batalkan sesi                                                                  | chatbot_sesi                                        | Mahasiswa |
| GET        | `/recommendations`                                                             | Rekomendasi terbaru (Top-N), urut `skor_kecocokan` menurun                    | rekomendasi                                         | Mahasiswa |
| POST       | `/recommendations/refresh`                                                     | Hitung ulang rekomendasi                                                       | rekomendasi                                         | Mahasiswa |
| GET        | `/applications`                                                                | Lamaran milik mahasiswa                                                        | lamaran                                             | Mahasiswa |
| POST       | `/applications`                                                                | Ajukan lamaran `{lowongan_id, surat_pengantar?, sumber_rekomendasi}`           | lamaran                                             | Mahasiswa |
| PATCH      | `/applications/:id/cancel`                                                     | Batalkan lamaran (status `dibatalkan`)                                         | lamaran                                             | Mahasiswa |
| GET        | `/notifications`                                                               | Daftar notifikasi                                                              | notifikasi                                          | Semua     |
| PATCH      | `/notifications/:id/read`, `/notifications/read-all`                           | Tandai dibaca                                                                  | notifikasi                                          | Semua     |
| CRUD       | `/admin/companies`                                                             | Kelola perusahaan (termasuk `verified`)                                        | perusahaan                                          | Admin     |
| CRUD       | `/admin/positions`                                                             | Kelola lowongan dan kompetensi yang dibutuhkan (`bobot`, `wajib`)              | lowongan_magang, lowongan_kompetensi                | Admin     |
| CRUD       | `/admin/competencies`, `/admin/competency-categories`, `/admin/study-programs` | Kelola master                                                                  | kompetensi, kategori_kompetensi, program_studi      | Admin     |
| GET        | `/admin/users`                                                                 | Lihat semua akun pengguna                                                      | users                                               | Admin     |
| PATCH      | `/admin/users/:id`                                                             | Ubah `is_active` akun tertentu                                                 | users                                               | Admin     |
| GET        | `/admin/applications`                                                          | Lihat semua lamaran                                                            | lamaran                                             | Admin     |
| PATCH      | `/admin/applications/:id`                                                      | Ubah status lamaran dan `catatan_perusahaan`; status `diterima` dicek kuota   | lamaran                                             | Admin     |
| GET        | `/admin/stats`                                                                 | Statistik dashboard                                                            | beberapa tabel                                      | Admin     |
| GET        | `/admin/applications/export`                                                   | Ekspor CSV lamaran                                                             | lamaran                                             | Admin     |

Portal peran `perusahaan` dan `dosen` berada di luar MVP; peran tersebut sudah ada di ENUM `users.role`, sedangkan lowongan dan penanganan lamaran sementara dikelola admin.

## 6. Format Respons API

```json
// sukses
{ "success": true, "message": "OK", "data": { }, "meta": { "page": 1, "limit": 10, "total": 42 } }

// gagal
{ "success": false, "message": "Validasi gagal", "errors": [ { "field": "email", "message": "Email tidak valid" } ] }
```

| Kode HTTP | Penggunaan                                       |
| --------- | ------------------------------------------------ |
| 200, 201  | Berhasil, berhasil dibuat                        |
| 400       | Validasi gagal                                   |
| 401       | Token tidak ada, tidak valid, atau akun nonaktif |
| 403       | Peran tidak berhak                               |
| 404       | Data tidak ditemukan                             |
| 409       | Konflik data (email, NIM, lamaran ganda)         |
| 429       | Terlalu banyak permintaan                        |
| 500       | Kesalahan server                                 |

Pelanggaran UNIQUE dari MySQL (kode Prisma `P2002`) dipetakan ke 409; pelanggaran FK RESTRICT (`P2003`) dipetakan ke 409 dengan pesan "Data masih digunakan".

## 7. Modul Chatbot

### 7.1 Alur per pesan

1. Pesan mahasiswa disimpan ke `chatbot_pesan` (`peran = 'user'`); sesi harus milik mahasiswa dan berstatus `aktif`.
2. Service membangun konteks: prompt sistem, 20 pesan terakhir, dan daftar nama `kompetensi` dari master.
3. LLM diminta mengembalikan JSON `{reply, intent, skills[], selesai}`.
4. Keluaran divalidasi Zod. Setiap `skills[].nama` dicocokkan ke `kompetensi.nama_kompetensi` (tanpa membedakan huruf besar-kecil); yang tidak dikenal diabaikan.
5. Kompetensi yang cocok disimpan ke `chatbot_kompetensi_terdeteksi` (`level`, `confidence`, `dikonfirmasi = 0`); bila kompetensi sudah terdeteksi di sesi yang sama, barisnya diperbarui.
6. Balasan bot disimpan ke `chatbot_pesan` (`peran = 'bot'`, `intent`, `entitas = {skill, level, confidence}`).
7. Bila LLM gagal atau keluaran tidak valid, kembalikan pertanyaan berikutnya dari kuesioner cadangan (daftar kompetensi dengan pilihan level).

Data yang dikumpulkan chatbot dibatasi pada skema yang ada: kompetensi, level, dan confidence. Preferensi lokasi atau minat tidak disimpan (lihat catatan di `05-DATABASE.md` bagian 9).

### 7.2 Skema keluaran LLM (Zod)

```js
// src/modules/chatbot/chatbot.schema.js
import { z } from "zod";

export const llmOutputSchema = z.object({
  reply: z.string().min(1),
  intent: z.string().max(100).nullable().default(null),
  skills: z
    .array(
      z.object({
        nama: z.string(),
        level: z.enum(["pemula", "menengah", "mahir"]),
        confidence: z.number().min(0).max(1),
      }),
    )
    .default([]),
  selesai: z.boolean().default(false),
});
```

### 7.3 Prompt sistem (ringkas)

```
Kamu adalah asisten pemetaan kompetensi magang untuk mahasiswa Indonesia.
Tugas: tanyakan satu hal per giliran tentang kemampuan teknis dan nonteknis mahasiswa
beserta tingkatnya (pemula, menengah, mahir). Gunakan bahasa Indonesia yang sopan dan singkat.
Hanya gunakan nama kompetensi dari daftar: {DAFTAR_KOMPETENSI}.
Beri confidence 0-1 untuk tiap kompetensi yang kamu simpulkan dari jawaban mahasiswa.
Balas HANYA dengan JSON: { "reply", "intent", "skills": [{ "nama", "level", "confidence" }], "selesai" }.
Jangan meminta data pribadi di luar kebutuhan pemetaan.
```

### 7.4 Kuesioner Cadangan (`fallbackQuestionnaire.js`)

Digunakan ketika LLM gagal dipanggil atau keluaran tidak lolos validasi Zod. Berisi daftar pertanyaan terstruktur yang mengiterasi kompetensi master satu per satu.

```js
// src/modules/chatbot/fallbackQuestionnaire.js
import prisma from '../../config/prisma.js';

/**
 * Mengembalikan pertanyaan berikutnya untuk kompetensi yang belum terdeteksi di sesi ini.
 * @param {number} sesiId
 * @param {Array<{id: number, nama_kompetensi: string}>} master - seluruh kompetensi dari DB
 * @returns {Promise<{reply: string, intent: string, skills: [], selesai: boolean}>}
 */
export async function nextFallbackQuestion(sesiId, master) {
  // Ambil kompetensi yang sudah terdeteksi di sesi ini
  const terdeteksi = await prisma.chatbot_kompetensi_terdeteksi.findMany({
    where: { sesi_id: sesiId },
    select: { kompetensi_id: true },
  });
  const sudahAdaIds = new Set(terdeteksi.map((t) => t.kompetensi_id));

  // Cari kompetensi berikutnya yang belum ditanyakan
  const berikutnya = master.find((k) => !sudahAdaIds.has(k.id));

  if (!berikutnya) {
    // Semua kompetensi sudah ditanyakan
    return {
      reply: 'Baik, sesi pemetaan selesai. Silakan tinjau hasilnya.',
      intent: 'selesai',
      skills: [],
      selesai: true,
    };
  }

  return {
    reply: `Apakah kamu memiliki kompetensi "${berikutnya.nama_kompetensi}"? Jika ya, di tingkat apa (pemula, menengah, atau mahir)?`,
    intent: 'tanya_kompetensi',
    skills: [],
    selesai: false,
  };
}
```

### 7.5 Service pesan

```js
// src/modules/chatbot/chatbot.service.js
import prisma from "../../config/prisma.js";
import { callLLM } from "../../config/llm.js";
import { llmOutputSchema } from "./chatbot.schema.js";
import { nextFallbackQuestion } from "./fallbackQuestionnaire.js";
import { AppError } from "../../utils/AppError.js";

export async function handleMessage(sesiId, mahasiswaId, text) {
  const sesi = await prisma.chatbot_sesi.findFirst({
    where: { id: sesiId, mahasiswa_id: mahasiswaId, status: "aktif" },
  });
  if (!sesi) throw new AppError("Sesi tidak ditemukan atau sudah selesai", 404);

  await prisma.chatbot_pesan.create({
    data: { sesi_id: sesiId, peran: "user", isi_pesan: text },
  });

  const [riwayat, master] = await Promise.all([
    prisma.chatbot_pesan.findMany({
      where: { sesi_id: sesiId },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
    prisma.kompetensi.findMany({ select: { id: true, nama_kompetensi: true } }),
  ]);

  let hasil;
  try {
    const raw = await callLLM({
      riwayat: riwayat.reverse(),
      kompetensi: master,
    });
    hasil = llmOutputSchema.parse(JSON.parse(raw));
  } catch {
    hasil = await nextFallbackQuestion(sesiId, master); // mode kuesioner cadangan
  }

  const byNama = new Map(
    master.map((k) => [k.nama_kompetensi.toLowerCase(), k.id]),
  );
  for (const s of hasil.skills) {
    const kompetensiId = byNama.get(s.nama.toLowerCase());
    if (!kompetensiId) continue; // abaikan nama yang tidak ada di master
    const ada = await prisma.chatbot_kompetensi_terdeteksi.findFirst({
      where: { sesi_id: sesiId, kompetensi_id: kompetensiId },
    });
    const data = { level: s.level, confidence: s.confidence };
    if (ada) {
      await prisma.chatbot_kompetensi_terdeteksi.update({
        where: { id: ada.id },
        data,
      });
    } else {
      await prisma.chatbot_kompetensi_terdeteksi.create({
        data: { sesi_id: sesiId, kompetensi_id: kompetensiId, ...data },
      });
    }
  }

  await prisma.chatbot_pesan.create({
    data: {
      sesi_id: sesiId,
      peran: "bot",
      isi_pesan: hasil.reply,
      intent: hasil.intent,
      entitas: hasil.skills,
    },
  });

  const terdeteksi = await prisma.chatbot_kompetensi_terdeteksi.findMany({
    where: { sesi_id: sesiId },
    include: { kompetensi: true },
  });
  return { reply: hasil.reply, terdeteksi, selesai: hasil.selesai };
}
```

### 7.5 Konfirmasi hasil deteksi

Skema tidak punya trigger, sehingga pemindahan ke profil dilakukan aplikasi dalam satu transaksi. Kebijakan konflik: bila kompetensi sudah ada di profil, ambil level tertinggi dan pertahankan `sumber` yang sudah ada bila `manual`.

```js
import { LEVEL_NILAI } from "../../utils/constants.js";
import { generateRekomendasi } from "../recommendations/recommendation.service.js";

export async function konfirmasiSesi(sesiId, mahasiswaId, items) {
  // items: [{ id: <chatbot_kompetensi_terdeteksi.id>, level }] setelah dikoreksi mahasiswa
  const sesi = await prisma.chatbot_sesi.findFirst({
    where: { id: sesiId, mahasiswa_id: mahasiswaId, status: "aktif" },
  });
  if (!sesi) throw new AppError("Sesi tidak ditemukan atau sudah selesai", 404);

  const terdeteksi = await prisma.chatbot_kompetensi_terdeteksi.findMany({
    where: { sesi_id: sesiId, id: { in: items.map((i) => i.id) } },
  });
  const levelBaru = new Map(items.map((i) => [i.id, i.level]));

  await prisma.$transaction(async (tx) => {
    for (const t of terdeteksi) {
      const level = levelBaru.get(t.id) ?? t.level;
      const ada = await tx.mahasiswa_kompetensi.findFirst({
        where: { mahasiswa_id: mahasiswaId, kompetensi_id: t.kompetensi_id },
      });
      if (!ada) {
        await tx.mahasiswa_kompetensi.create({
          data: {
            mahasiswa_id: mahasiswaId,
            kompetensi_id: t.kompetensi_id,
            level,
            sumber: "chatbot",
          },
        });
      } else if (LEVEL_NILAI[level] > LEVEL_NILAI[ada.level]) {
        await tx.mahasiswa_kompetensi.update({
          where: { id: ada.id },
          data: { level },
        });
      }
      await tx.chatbot_kompetensi_terdeteksi.update({
        where: { id: t.id },
        data: { level, dikonfirmasi: true },
      });
    }
    await tx.chatbot_sesi.update({
      where: { id: sesiId },
      data: { status: "selesai", ended_at: new Date() },
    });
  });

  return generateRekomendasi(mahasiswaId); // hitung rekomendasi setelah profil berubah
}
```

## 8. Mesin Rekomendasi

Skema belum menetapkan satu metode final dan belum mendefinisikan konversi level maupun perlakuan kompetensi wajib. **Keputusan MVP** (dapat diubah tim, disimpan sebagai konstanta):

| Keputusan                                  | Nilai                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Metode                                     | SAW (jumlah terbobot sederhana); dicatat di `rekomendasi.metode = 'SAW'`                                          |
| Konversi level                             | pemula = 1/3, menengah = 2/3, mahir = 3/3                                                                         |
| Bobot                                      | `lowongan_kompetensi.bobot`                                                                                       |
| Kompetensi tidak dimiliki                  | Nilai 0                                                                                                           |
| Wajib tidak terpenuhi                      | Skor akhir dikali 0,5 dan ditandai pada `detail_perhitungan`                                                      |
| Kelayakan (filter)                         | `status = 'aktif'`, tanggal hari ini di antara `tgl_buka` dan `tgl_tutup`, `min_semester` dan `min_ipk` terpenuhi |
| Lowongan tanpa baris `lowongan_kompetensi` | Dilewati (belum bisa dihitung)                                                                                    |
| Jumlah hasil                               | Top 10 (`TOP_N`)                                                                                                  |

> **Catatan:** DDL `rekomendasi` memiliki `DEFAULT 'cosine_similarity'` pada kolom `metode`. Nilai default ini **tidak relevan** karena aplikasi selalu mengisi `metode: 'SAW'` secara eksplisit. Jangan mengandalkan nilai default kolom tersebut. Ubah DDL-nya lewat migrasi bila diperlukan kejelasan (lihat `05-DATABASE.md` bagian 9).

```latex
Skor = 100 \cdot \frac{\sum_i bobot_i \cdot \frac{nilai\_level_i}{3}}{\sum_i bobot_i} \cdot \text{faktor wajib}
```

```js
// src/modules/recommendations/recommendation.service.js
import prisma from "../../config/prisma.js";
import { LEVEL_NILAI, LEVEL_MAKS } from "../../utils/constants.js";

const TOP_N = 10;
const FAKTOR_WAJIB_GAGAL = 0.5;

export function hitungSkor(mahasiswa, lowongan) {
  const dimiliki = new Map(
    mahasiswa.mahasiswa_kompetensi.map((mk) => [mk.kompetensi_id, mk.level]),
  );
  let totalBobot = 0;
  let totalNilai = 0;
  let wajibTerpenuhi = true;
  const rincian = [];

  for (const req of lowongan.lowongan_kompetensi) {
    const bobot = Number(req.bobot);
    const level = dimiliki.get(req.kompetensi_id) ?? null;
    const nilai = level ? LEVEL_NILAI[level] / LEVEL_MAKS : 0;
    totalBobot += bobot;
    totalNilai += bobot * nilai;
    if (req.wajib && !level) wajibTerpenuhi = false;
    rincian.push({
      kompetensi: req.kompetensi.nama_kompetensi,
      bobot,
      wajib: Boolean(req.wajib),
      level,
      nilai: Math.round(nilai * 100) / 100,
    });
  }

  let skor = totalBobot > 0 ? (totalNilai / totalBobot) * 100 : 0;
  if (!wajibTerpenuhi) skor *= FAKTOR_WAJIB_GAGAL;

  return {
    skor: Math.round(skor * 100) / 100,
    detail: {
      wajib_terpenuhi: wajibTerpenuhi,
      cocok: rincian.filter((r) => r.level).map((r) => r.kompetensi),
      kurang: rincian.filter((r) => !r.level).map((r) => r.kompetensi),
      rincian,
    },
  };
}

export async function generateRekomendasi(mahasiswaId) {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: mahasiswaId },
    include: { mahasiswa_kompetensi: true },
  });

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const lowongan = await prisma.lowongan_magang.findMany({
    where: {
      status: "aktif",
      tgl_buka: { lte: hariIni },
      tgl_tutup: { gte: hariIni },
      AND: [
        {
          OR: [
            { min_semester: null },
            { min_semester: { lte: mahasiswa.semester } },
          ],
        },
        { OR: [{ min_ipk: null }, { min_ipk: { lte: mahasiswa.ipk } }] },
      ],
      lowongan_kompetensi: { some: {} },
    },
    include: { lowongan_kompetensi: { include: { kompetensi: true } } },
  });

  const hasil = lowongan
    .map((l) => ({ lowongan_id: l.id, ...hitungSkor(mahasiswa, l) }))
    .sort((a, b) => b.skor - a.skor)
    .slice(0, TOP_N);

  // Tabel tidak punya kolom batch: hasil lama dihapus agar hanya hasil terbaru yang tampil
  await prisma.$transaction([
    prisma.rekomendasi.deleteMany({ where: { mahasiswa_id: mahasiswaId } }),
    prisma.rekomendasi.createMany({
      data: hasil.map((h) => ({
        mahasiswa_id: mahasiswaId,
        lowongan_id: h.lowongan_id,
        skor_kecocokan: h.skor,
        metode: "SAW",
        detail_perhitungan: h.detail,
      })),
    }),
  ]);

  return hasil;
}
```

`GET /recommendations` membaca `rekomendasi` milik mahasiswa, urut `skor_kecocokan` menurun, dengan `include` lowongan dan perusahaan. Rekomendasi dihitung ulang setelah konfirmasi chatbot, perubahan kompetensi manual, atau saat mahasiswa menekan "Perbarui rekomendasi".

## 9. Lamaran dan Notifikasi

- `POST /applications`: pastikan lowongan layak (aktif dan dalam periode buka), lalu buat baris `lamaran`; pelanggaran UNIQUE (mahasiswa_id, lowongan_id) dikembalikan sebagai 409 "Kamu sudah melamar lowongan ini". `sumber_rekomendasi = 1` bila lowongan ada di hasil `rekomendasi` mahasiswa.
- Perubahan status ke `diterima` dilakukan dalam transaksi: hitung lamaran `diterima` pada lowongan itu, tolak bila sudah mencapai `kuota`, isi `tgl_respons`.
- Setiap perubahan status lamaran membuat baris `notifikasi` untuk akun mahasiswa (`tipe = 'lamaran'`, `referensi_id = lamaran.id`).
- Notifikasi `tipe = 'rekomendasi'` dibuat setelah rekomendasi baru dihitung (`referensi_id` boleh NULL).
- Perusahaan tanpa akun (`perusahaan.user_id` NULL) tidak mendapat notifikasi; admin menyampaikannya secara manual.

## 10. Keamanan

- Kata sandi disimpan sebagai hash `bcrypt` (kolom `users.password`); tidak pernah dikembalikan di respons.
- Login menolak akun dengan `is_active = 0`; middleware `auth` memeriksanya pada setiap request.
- Token JWT memuat `userId` dan `role`; `role('admin')` melindungi seluruh `/admin`.
- Kepemilikan data: id mahasiswa selalu diambil dari `mahasiswa.user_id` = `userId` token, bukan dari input klien. Untuk tabel anak (`mahasiswa_kompetensi`, `chatbot_*`, `lamaran`, `rekomendasi`) filter lewat `mahasiswa_id` pemilik.
- Saat registrasi, role dipaksa `mahasiswa`; role lain hanya dapat diberikan admin.
- Validasi rentang yang tidak ditegakkan DDL (`ipk`, `semester`, `bobot`, `confidence`, tanggal) dilakukan dengan Zod (daftar di `05-DATABASE.md` bagian 8).
- Upload CV dan foto dibatasi tipe dan ukuran; berkas disajikan lewat rute terotorisasi, bukan folder publik.
- `helmet`, CORS dibatasi ke `CLIENT_URL`, rate limit pada `/auth/*` dan `/chat/*`.
- Kunci LLM hanya ada di server.

## 11. Data Seed

Gunakan data dummy dari laporan skema (90 baris pada sembilan tabel) sebagai dasar `sql/seed.sql`. Untuk uji login, buat `prisma/seed.js` yang:

1. memperbarui kolom `password` akun dummy dengan hash bcrypt asli (placeholder `$2y$10$hash_admin` tidak dapat dipakai login),
2. melengkapi `lowongan_kompetensi` untuk Software Engineer Intern dan Frontend Engineer Intern,
3. menambahkan beberapa baris `rekomendasi`, `lamaran`, dan `notifikasi` contoh bila diperlukan untuk demo.

## 12. Pengujian

| Target                | Jenis     | Contoh kasus                                                                                                           |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `hitungSkor`          | Unit      | Semua kompetensi mahir menghasilkan 100; wajib tak terpenuhi mengalikan skor 0,5; lowongan tanpa persyaratan dilewati  |
| `llmOutputSchema`     | Unit      | Level di luar ENUM atau confidence di luar 0-1 ditolak dan memicu mode cadangan                                        |
| `konfirmasiSesi`      | Integrasi | Kompetensi baru masuk `mahasiswa_kompetensi` dengan `sumber = 'chatbot'`; entri manual tidak ditimpa; level hanya naik |
| `POST /auth/register` | Integrasi | Email atau NIM ganda mengembalikan 409; akun dan profil dibuat atomik                                                  |
| `POST /applications`  | Integrasi | Lamaran ganda 409; lowongan tutup ditolak                                                                              |
| Penerimaan lamaran    | Integrasi | Status `diterima` melebihi kuota ditolak                                                                               |
| `/admin/*`            | Integrasi | Token mahasiswa mengembalikan 403                                                                                      |
| Skenario constraint   | Database  | Lihat `05-DATABASE.md` bagian 12                                                                                       |

## 13. Perintah Penting

```bash
npm run dev                          # nodemon src/server.js
mysql -u root -p < sql/schema.sql    # buat database dan tabel
npx prisma db pull                   # introspeksi setelah skema berubah
npx prisma generate
node prisma/seed.js                  # seed dengan hash bcrypt
npx prisma studio                    # lihat isi database
npm test
```
