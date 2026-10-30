# 04 - Styleguide

Panduan gaya agar kode dan tampilan konsisten di seluruh tim. Bagian A untuk kode, bagian B untuk antarmuka (UI), bagian C untuk kolaborasi.

---

## A. Gaya Kode

### A1. Aturan Umum

- Bahasa: JavaScript (ES Modules), selalu memakai semicolon.
- Indentasi 2 spasi, tanda kutip tunggal, trailing comma pada struktur multibaris, panjang baris maksimum 100 karakter.
- Gunakan `const` secara default, `let` bila perlu; jangan pakai `var`.
- Gunakan `async/await`, hindari rantai `.then()` yang panjang.
- Satu fungsi satu tugas; fungsi lebih dari sekitar 40 baris dipecah.
- Hindari angka dan string "ajaib"; pindahkan ke konstanta (`utils/constants.js`).
- Komentar menjelaskan **mengapa**, bukan **apa**. Nama yang jelas lebih baik daripada komentar.
- Tidak ada `console.log` yang tertinggal di commit.

### A2. Penamaan

| Elemen                     | Aturan                         | Contoh                       |
| -------------------------- | ------------------------------ | ---------------------------- |
| Variabel, fungsi           | camelCase                      | `hitungSkor`, `mahasiswaId`  |
| Komponen React             | PascalCase                     | `RecommendationCard.jsx`     |
| Hook                       | `use` + camelCase              | `useAuth.js`                 |
| Konstanta                  | UPPER_SNAKE_CASE               | `MAX_RECOMMENDATIONS`        |
| File modul backend         | `<modul>.<peran>.js`           | `positions.controller.js`    |
| File non-komponen frontend | camelCase                      | `chat.api.js`, `format.js`   |
| Folder                     | kebab-case atau lowercase      | `modules`, `chat`            |
| Tabel/model Prisma         | Ikuti nama tabel DDL apa adanya (hasil `db pull`); hindari asumsi PascalCase | `mahasiswa_kompetensi`, `chatbot_sesi` |
| Kolom Prisma               | Ikuti nama kolom DDL apa adanya | `level`, `skor_kecocokan`   |
| Endpoint REST              | huruf kecil, jamak, kebab-case | `/api/chat/sessions`         |
| Variabel environment       | UPPER_SNAKE_CASE               | `JWT_SECRET`, `VITE_API_URL` |

Konsistensi bahasa: identifier kode memakai bahasa Inggris atau sesuai skema yang sudah ditetapkan (kolom domain seperti `nama`, `bidang`, `skor` mengikuti skema database); teks yang tampil ke pengguna memakai bahasa Indonesia.

### A3. ESLint dan Prettier

`.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

`.editorconfig`

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true
```

ESLint: gunakan konfigurasi bawaan `eslint:recommended`, plugin `react` dan `react-hooks` di `client`. Perbaiki semua error sebelum membuka Pull Request.

### A4. Aturan Backend

- Urutan alur: `routes` → `middleware` (auth, role, validate) → `controller` → `service` → `prisma`.
- Controller hanya mengurus request dan response; logika bisnis dan query ada di service.
- Semua input dari klien divalidasi dengan Zod sebelum diproses.
- Error dilempar dengan `AppError(message, statusCode)` dan ditangkan satu tempat di `errorHandler`.
- Respons selalu memakai format standar `{ success, message, data, meta? }`.
- Jangan pernah mengembalikan `password` (hash bcrypt) atau rahasia lain di respons.
- Query data milik mahasiswa selalu memakai `mahasiswaId` dari `mahasiswa.user_id = userId` (dari token), **bukan** dari input klien.
- Setiap `controller` menggunakan `try/catch` atau `next(error)` untuk meneruskan error ke `errorHandler` global; tidak ada error yang dibiarkan unhandled.

### A5. Aturan Frontend

- Satu komponen per file; komponen presentasi kecil, logika pemanggilan API ada di `src/api` atau hook.
- Hanya function component dan hooks.
- Props diberi nama jelas dan diberi nilai default bila opsional.
- Jangan memanggil `axios` langsung di komponen; gunakan fungsi dari `src/api`.
- Tailwind: urutkan kelas dari tata letak, ukuran, tipografi, warna, lalu efek; ekstrak ke komponen bila satu pola diulang lebih dari tiga kali.
- Setiap daftar yang dirender memakai `key` yang stabil (id, bukan indeks).

### A6. Aset dan Gambar

- Simpan di `client/src/assets/`. Gunakan format **SVG** untuk ikon dan logo; **WebP** untuk foto dan ilustrasi; **PNG** hanya bila SVG/WebP tidak tersedia.
- Nama file: kebab-case, deskriptif (`logo-primary.svg`, `hero-illustration.webp`).
- Batas ukuran: gambar raster ≤ 200 KB sebelum dioptimasi (gunakan [Squoosh](https://squoosh.app/) atau serupa).
- Gambar bermakna wajib memiliki `alt` yang deskriptif; gambar dekoratif gunakan `alt=""`.

---

## B. Gaya Antarmuka (UI)

### B1. Prinsip Desain

1. **Jelas dahulu:** satu tujuan utama per halaman, satu tombol utama per tampilan.
2. **Ramah mahasiswa:** bahasa santai tetapi sopan, tidak berbelit.
3. **Mobile-first:** rancang untuk layar 360 px, lalu perluas.
4. **Konsisten:** komponen yang sama tampil dan berperilaku sama di semua halaman.
5. **Umpan balik cepat:** setiap aksi menghasilkan respons visual (loading, sukses, gagal).

### B2. Warna (token)

| Token         | Hex       | Penggunaan                         |
| ------------- | --------- | ---------------------------------- |
| `primary-600` | `#4F46E5` | Tombol utama, tautan, elemen aktif |
| `primary-700` | `#4338CA` | Hover tombol utama                 |
| `primary-100` | `#E0E7FF` | Latar lembut, badge, sorotan       |
| `primary-50`  | `#EEF2FF` | Latar bagian                       |
| `gray-900`    | `#111827` | Teks utama                         |
| `gray-600`    | `#4B5563` | Teks sekunder                      |
| `gray-200`    | `#E5E7EB` | Garis pembatas, border             |
| `gray-50`     | `#F9FAFB` | Latar halaman                      |
| `success-600` | `#16A34A` | Berhasil, skor tinggi              |
| `warning-500` | `#F59E0B` | Peringatan, skor sedang            |
| `danger-600`  | `#DC2626` | Error, hapus, skor rendah          |
| `white`       | `#FFFFFF` | Latar kartu                        |

Aturan: kontras teks terhadap latar minimal 4.5:1; warna tidak menjadi satu-satunya penanda status (sertakan ikon atau teks).

Warna skor rekomendasi: 75-100 hijau ("Sangat cocok"), 50-74 kuning ("Cukup cocok"), di bawah 50 merah ("Kurang cocok").

### B3. Tipografi

| Elemen             | Ukuran (Tailwind)      | Bobot                          |
| ------------------ | ---------------------- | ------------------------------ |
| Judul halaman (H1) | `text-2xl md:text-3xl` | `font-bold`                    |
| Judul bagian (H2)  | `text-xl`              | `font-semibold`                |
| Judul kartu (H3)   | `text-lg`              | `font-semibold`                |
| Teks isi           | `text-base`            | `font-normal`                  |
| Teks bantu         | `text-sm`              | `font-normal`, `text-gray-600` |
| Label form         | `text-sm`              | `font-medium`                  |

Font: Inter (fallback `system-ui, sans-serif`). Tinggi baris isi `leading-relaxed`.

### B4. Jarak, Bentuk, dan Bayangan

| Aspek              | Aturan                                            |
| ------------------ | ------------------------------------------------- |
| Skala jarak        | Kelipatan 4 px (`p-2`, `p-4`, `p-6`, `p-8`)       |
| Padding kartu      | `p-4` di mobile, `p-6` di layar besar             |
| Jarak antar bagian | `space-y-6` atau `gap-6`                          |
| Radius             | Tombol dan input `rounded-lg`; kartu `rounded-xl` |
| Bayangan           | Kartu `shadow-sm`; modal `shadow-lg`              |
| Lebar konten       | `max-w-6xl mx-auto px-4`                          |

### B5. Titik Henti Responsif

| Nama    | Lebar    | Perilaku utama              |
| ------- | -------- | --------------------------- |
| default | < 640 px | Satu kolom, navigasi bawah  |
| `sm`    | 640 px   | Kartu dua kolom bila muat   |
| `md`    | 768 px   | Sidebar muncul, tabel penuh |
| `lg`    | 1024 px  | Grid kartu tiga kolom       |

### B6. Spesifikasi Komponen

| Komponen               | Aturan                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button primer**      | `bg-primary-600 text-white hover:bg-primary-700 rounded-lg px-4 py-2 font-medium`; status `disabled` buram dan tanpa hover; tampilkan spinner saat memuat |
| **Button sekunder**    | Border `gray-200`, latar putih, teks `gray-900`                                                                                                           |
| **Button bahaya**      | `bg-danger-600 text-white`, hanya untuk hapus dan aksi tidak dapat dibatalkan, dengan dialog konfirmasi                                                   |
| **Input**              | Label di atas input, `border border-gray-200 rounded-lg px-3 py-2`, fokus `ring-2 ring-primary-500`, pesan error `text-sm text-danger-600` di bawah input |
| **Kartu**              | Latar putih, `rounded-xl shadow-sm border border-gray-200 p-4`; judul, isi, lalu aksi di bagian bawah                                                     |
| **Badge**              | `rounded-full px-2.5 py-0.5 text-xs font-medium` dengan warna lembut sesuai makna                                                                         |
| **Tabel (admin)**      | Header `bg-gray-50`, baris bergaris tipis, scroll horizontal di mobile                                                                                    |
| **Modal**              | Overlay gelap, dapat ditutup dengan tombol Esc dan klik di luar, fokus berpindah ke dalam modal                                                           |
| **Toast**              | Muncul kanan atas, hilang otomatis 3-4 detik; hijau untuk sukses, merah untuk gagal                                                                       |
| **Spinner / Skeleton** | Skeleton untuk daftar dan kartu; spinner untuk tombol dan aksi singkat                                                                                    |

### B7. Tampilan Chatbot

- Pesan pengguna: rata kanan, latar `primary-600`, teks putih, `rounded-2xl rounded-br-sm`.
- Pesan bot: rata kiri, latar `gray-100`, teks `gray-900`, `rounded-2xl rounded-bl-sm`.
- Lebar maksimum gelembung 80% dari area chat; jarak antar pesan `space-y-3`.
- Indikator mengetik (tiga titik) muncul saat menunggu balasan bot.
- Area chat auto-scroll ke pesan terbaru; input menempel di bawah dengan tombol kirim; tombol kirim nonaktif saat kosong atau sedang mengirim.
- Panel ringkasan kompetensi tampil di samping (layar besar) atau di bawah (mobile), dengan skill berupa badge berlevel yang dapat diubah.

### B8. Tampilan Kartu Rekomendasi

Urutan isi kartu: peringkat dan `ScoreBadge` (skor 0-100), judul posisi, nama perusahaan dan lokasi, daftar "Skill yang cocok" (badge hijau), daftar "Skill yang perlu ditingkatkan" (badge kuning), tombol "Lihat detail" dan ikon favorit.

### B9. Teks dan Tone (Bahasa Indonesia)

- Gunakan kalimat singkat dan aktif; sapaan "kamu" untuk mahasiswa pada chatbot, bentuk netral pada label dan tombol.
- Tombol berupa kata kerja: "Simpan profil", "Lihat rekomendasi", "Kirim".
- Pesan error menjelaskan masalah dan solusi: "Email sudah terdaftar. Coba masuk atau gunakan email lain."
- Keadaan kosong memberi ajakan: "Belum ada rekomendasi. Mulai chat untuk memetakan kompetensimu."
- Format tanggal `2 Oktober 2026`; gunakan helper di `utils/format.js` berbasis `Intl.DateTimeFormat`:

  ```js
  // utils/format.js
  export function formatTanggal(dateStr) {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(dateStr));
  }
  ```

- Angka desimal memakai koma bila ditampilkan ke pengguna (contoh: IPK `3,75`, skor `87,50`).

### B10. Aksesibilitas

- Semua input memiliki `label` terkait; ikon tombol memiliki `aria-label`.
- Elemen interaktif dapat dijangkau dan dioperasikan dengan keyboard; indikator fokus tidak dihapus.
- Gambar bermakna memiliki `alt`; gambar dekoratif memakai `alt=""`.
- Hindari informasi yang hanya dibedakan lewat warna.

---

## C. Kolaborasi dan Git

### C1. Format Commit (Conventional Commits)

```
<tipe>(<ruang-lingkup>): <deskripsi singkat>
```

| Tipe       | Penggunaan                    | Contoh                                             |
| ---------- | ----------------------------- | -------------------------------------------------- |
| `feat`     | Fitur baru                    | `feat(chatbot): tambah ekstraksi skill dari pesan` |
| `fix`      | Perbaikan bug                 | `fix(auth): perbaiki validasi token kedaluwarsa`   |
| `docs`     | Dokumentasi                   | `docs(prd): perbarui bobot rekomendasi`            |
| `style`    | Format, tanpa ubah logika     | `style(client): rapikan dengan prettier`           |
| `refactor` | Perubahan struktur kode       | `refactor(recommendations): pisahkan fungsi skor`  |
| `test`     | Menambah atau memperbaiki tes | `test(recommendations): tambah kasus syarat IPK`   |
| `chore`    | Konfigurasi dan perawatan     | `chore: tambah script dev di root`                 |

### C2. Penamaan Branch

`feature/<modul>-<deskripsi>`, `fix/<deskripsi>`, `docs/<deskripsi>`; gunakan huruf kecil dan tanda hubung.

### C3. Checklist Pull Request

- [ ] Kode berjalan lokal tanpa error dan tanpa `console.log` tertinggal
- [ ] ESLint dan Prettier lolos
- [ ] Pengujian terkait ditambah atau diperbarui dan lolos
- [ ] Tidak ada rahasia (`.env`, kunci API) dalam perubahan
- [ ] Skema Prisma yang berubah disertai file migrasi
- [ ] Tampilan dicek di layar mobile dan desktop (untuk perubahan UI)
- [ ] Deskripsi PR menjelaskan apa, mengapa, dan cara mengujinya
- [ ] Minimal satu anggota tim me-review

### C4. Definisi Selesai (Definition of Done) per Tugas

Kode sudah di-merge ke `develop`, lolos review dan pengujian, sesuai kebutuhan di PRD (ID FR terkait), dan terdokumentasi bila menambah endpoint atau komponen baru.
