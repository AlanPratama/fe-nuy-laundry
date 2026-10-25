# Developer & AI Agent Handover Guide: Nuy Laundry Ecosystem

Dokumen ini disusun sebagai panduan menyeluruh (*comprehensive handover guide*) bagi **Developer** maupun **AI Agent** yang akan melanjutkan pemeliharaan, pengembangan fitur, atau investigasi bug pada ekosistem **Nuy Laundry (Backend & Frontend Monorepo)**.

---

## 🏛️ 1. Ikhtisar Arsitektur Sistem

Ekosistem Nuy Laundry terdiri dari dua komponen utama:
1. **`be-nuy-laundry`** (Backend REST API):
   - **Teknologi**: Java 17, Spring Boot 3.2.5, Spring Data JPA, PostgreSQL 16, Redis 7 (Cache), MinIO (S3 Object Storage), Liquibase (Database Migration), JJWT.
   - **Pola Arsitektur**: **Hexagonal Architecture (Ports and Adapters)**.
   - **Standar Format Response**:
     ```json
     {
       "code": 200,
       "status": true,
       "message": "SUCCESS",
       "data": { ... }
     }
     ```
2. **`fe-nuy-laundry`** (Frontend Monorepo - pnpm workspace):
   - **`apps/admin-dashboard`**: React 18, Vite 6, Tailwind CSS, Zustand, React Router DOM v7, Tiptap v3.
   - **`apps/web-customer`**: Nuxt 3 (Vue 3), Vue Router, Tailwind CSS.
   - **`packages/shared-types`**: TypeScript interfaces & shared DTOs.
   - **Pola Desain UI**: Standar visual BuildWithAngga (BWA) — `#4343E6` (Brand), `#0F0F3D` (Ink), `rounded-2xl`, `rounded-3xl`, `shadow-card`, soft animations.

---

## 🚀 2. Ringkasan Fitur-Fitur Kritis & Perubahan Terakhir

### A. Fitur Manajemen Artikel & Edukasi (CMS) — [ISSUE-13](./issues/ISSUE-13-MANAJEMEN-ARTIKEL-DAN-TIPS-LAUNDRY.md)
Fitur CMS ini memungkinkan outlet mempublikasikan tips mencuci, panduan bahan pakaian, dan promo laundry ke portal pelanggan.

1. **Halaman Editor Terpisah (`ArticleEditorPage.tsx`)**:
   - Rute: `/articles/create` (buat baru) dan `/articles/edit/:id` (sunting draf).
   - Kanvas penulisan fokus & bersih ala platform Medium.
   - Input judul besar *auto-growing* tanpa border, kolom ringkasan/kutipan (*excerpt*), dan upload banner foto sampul (16:9).
   - Metrik langsung: Penghitung kata (*words*), karakter (*chars*), dan estimasi waktu baca (*reading time*) otomatis.
   - Pilihan simpan ganda: **Simpan Draf** (offline) dan **Publikasikan** (online).
   - **Proteksi Akses**: Hanya `SUPER_ADMIN` dan `ADMIN` yang diizinkan mengakses halaman editor. Role `STAFF` otomatis dialihkan.

2. **Editor WYSIWYG Ala Medium (`MediumEditor.tsx`)**:
   - Berbasis **Tiptap v3** (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`).
   - **Dropdown Judul / Paragraf**: Mendukung Teks Biasa (P) serta Heading H1 s/d H6 dengan deteksi otomatis format pada kursor.
   - **Modal Tautan (Link) Kustom**: Tidak menggunakan `window.prompt`. Tersedia dialog kustom untuk input teks, URL, checkbox `target="_blank"`, dan tombol hapus link.
   - **Pintasan `Ctrl+K` / `Cmd+K`**: Seleksi teks lalu tekan `Ctrl+K` (Windows/Linux) atau `Cmd+K` (macOS) langsung memunculkan modal tautan.
   - **Tooltip Interaktif**: Setiap tombol toolbar dilengkapi tooltip mengambang instan dengan nama fungsi dan badge pintasan keyboard.
   - **Penyisipan & Paste Gambar MinIO**:
     - Pengguna dapat langsung melakukan paste tangkapan layar/gambar dari clipboard (`Ctrl+V` / `Cmd+V`) atau drag & drop ke editor.
     - Gambar otomatis diunggah ke MinIO via endpoint `POST /api/v1/articles/upload-image`.
     - Dilengkapi fallback lokal *Base64 Data URL* jika koneksi backend offline.
     - Tersedia tombol toolbar "Sisipkan Gambar" dengan tab upload file atau URL eksternal.

3. **Filter Status Kustom**:
   - Filter status artikel pada `/articles` menggunakan komponen `CustomSelect` ("Semua Status", "Diterbitkan", "Draf") yang tersinkronisasi dengan query params URL.

---

### B. Transaksi & Paket Laundry
1. **Multi-Package per Transaksi (One-to-Many)**:
   - Formulir tambah transaksi mendukung pemilihan lebih dari 1 paket cucian (misal: 1 paket Kiloan Cuci Lipat + 1 paket Satuan Jas/Bedcover).
   - Subtotal per paket dan grand total transaksi dihitung secara otomatis.
2. **Package Detail Modal & Riwayat Transaksi**:
   - Tombol "Lihat Detail" pada paket membuka modal ringkasan paket beserta riwayat transaksi yang menggunakan paket tersebut.
   - Mengklik item transaksi di modal langsung membuka detail transaksi lengkap.
   - Konsistensi warna badge kategori di mode Card dan Table.
3. **Perbaikan Hapus Foto Paket & Profil**:
   - Toggle/hapus foto paket dan avatar profil kini benar-benar menghapus file dari MinIO dan database (`removeThumbnail: true`, `removePhoto: true`).

---

### C. Pengaturan Outlet & Peta Lokasi
1. **Integrasi Koordinat Peta (Latitude & Longitude)**:
   - Halaman `SettingsPage` menyediakan input koordinat Latitude, Longitude, dan Google Maps URL.
   - Pratinjau peta interaktif (Google Maps embed) yang menyatu (*blended*) dengan tema visual BWA.
2. **Sinkronisasi Logo Outlet**:
   - Logo outlet tersimpan di MinIO dan di-cache pada state global, sehingga langsung tampil di navbar tanpa harus membuka halaman pengaturan terlebih dahulu.

---

### D. Keamanan, UI & UX Refinements
1. **Proteksi Akun Login di Tabel Staff ([ISSUE-14](./issues/ISSUE-14-PROTEKSI-DAN-PENANGANAN-USER-LOGIN-DI-TABEL-STAFF.md))**:
   - Baris akun yang sedang login diberi badge penanda **"Anda (Sedang Login)"**.
   - Toggle non-aktif (`isActive`) dan tombol hapus pada baris akun sendiri dinonaktifkan untuk mencegah *self-lockout* dan *self-deletion*.
2. **Input Password Interaktif**:
   - Seluruh input kata sandi dilengkapi ikon mata (*eye icon*) untuk menampilkan/menyembunyikan teks tanpa sensor.
3. **Optimasi Mobile & Responsive**:
   - Navbar sticky pada perangkat mobile.
   - Komponen Toast notifikasi responsif dan tidak terpotong pada layar sempit (width 320px - 350px).

---

## 🗄️ 3. Skema Basis Data Terkait Fitur Baru

### Tabel `articles` (Migrasi Liquibase: `018-create-articles.yaml`)
```sql
CREATE TABLE articles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(255),
    reading_time VARCHAR(50),
    is_published BOOLEAN NOT NULL DEFAULT false,
    author_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Ekstensi Kolom Tabel `settings` (`016-add-outlet-extra-fields.yaml`)
- `logo_url VARCHAR(255)`: Path logo outlet di MinIO.
- `instagram VARCHAR(100)`: Akun Instagram outlet.
- `latitude DECIMAL(10,8)`: Koordinat garis lintang outlet.
- `longitude DECIMAL(11,8)`: Koordinat garis bujur outlet.
- `google_maps_url TEXT`: URL tautan embed Google Maps.

### Ekstensi Kolom Tabel `transactions` (`017-add-down-payment-transactions.yaml`)
- `payment_status VARCHAR(50)`: `UNPAID`, `DOWN_PAYMENT`, `PAID`.
- `down_payment DECIMAL(19,2)`: Nominal uang muka / panjar yang dibayar pelanggan.

---

## 🔌 4. Endpoint REST API Baru / Diperbarui

| Method | Endpoint | Izin Akses | Fungsi |
|---|---|---|---|
| `GET` | `/api/v1/articles` | Authenticated | Mengambil daftar artikel (filter: `search`, `category`, `isPublished`) |
| `GET` | `/api/v1/articles/{idOrSlug}` | Authenticated | Mengambil detail artikel berdasarkan ID atau Slug |
| `POST` | `/api/v1/articles` | `ADMIN`, `SUPER_ADMIN` | Membuat artikel baru (Multipart: `request` JSON + `file` cover) |
| `PUT` | `/api/v1/articles/{id}` | `ADMIN`, `SUPER_ADMIN` | Mengupdate artikel (Multipart: `request` JSON + `file` cover) |
| `DELETE` | `/api/v1/articles/{id}` | `ADMIN`, `SUPER_ADMIN` | Menghapus artikel dan foto MinIO terkait |
| `PATCH` | `/api/v1/articles/{id}/publish` | `ADMIN`, `SUPER_ADMIN` | Toggle status terbit artikel (_Online_ / _Draft_) |
| `POST` | `/api/v1/articles/upload-image` | `ADMIN`, `SUPER_ADMIN` | Upload gambar inline konten artikel ke MinIO |
| `GET` | `/api/v1/files/**` | Authenticated | Streaming dan unduh berkas biner/gambar langsung dari MinIO Storage |

---

## 🛠️ 5. Panduan Menjalankan & Membangun Proyek

1. **Menjalankan Backend (Spring Boot)**:
   ```bash
   cd be-nuy-laundry
   ./mvnw spring-boot:run
   ```
   Backend aktif di: `http://localhost:8080`.

2. **Menjalankan Frontend (Monorepo)**:
   ```bash
   cd fe-nuy-laundry
   pnpm dev
   ```
   - Admin Dashboard: `http://localhost:5173`
   - Web Customer: `http://localhost:3000`

3. **Verifikasi Build Produksi**:
   ```bash
   # Admin Dashboard
   pnpm --filter admin-dashboard build

   # Web Customer
   pnpm --filter web-customer build
   ```

---

*Dokumen ini dibuat secara otomatis dan terverifikasi sesuai kode sumber per 26 Oktober 2026.*
