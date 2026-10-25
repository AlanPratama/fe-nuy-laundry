# Business Requirements Document (BRD)
## Nuy Laundry — Sistem Web Customer & Admin Dashboard

---

### 1. Pendahuluan & Latar Belakang Bisnis

**Nuy Laundry** adalah unit bisnis jasa binatu (laundry) modern yang melayani pelanggan residensial, anak kos, hingga mitra bisnis (hotel, homestay, salon, klinik). Selama ini, operasional pesanan dan pelacakan cucian masih bergantung pada pesan WhatsApp manual.

Hal ini menimbulkan beberapa kendala bisnis:
1. **Beban Chat Customer Service Tinggi**: Pelanggan berulang kali menanyakan status cucian ("Sudah selesai belum, kak?").
2. **Keterbatasan Brand Presence**: Pelanggan baru kesulitan melihat transparansi harga paket (kiloan, langganan bulanan, dan satuan) serta garansi layanan.
3. **Pencatatan & Dokumentasi Terfragmentasi**: Risiko pakaian tertukar atau komplain barang rusak tanpa bukti foto awal/akhir.

Oleh karena itu, Nuy Laundry mengembangkan **Platform Digital Terpadu** yang terdiri dari:
1. **Web Customer (Nuxt 3)**: Platform publik berestetika premium modern ala BuildWithAngga (BWA) untuk menampilkan layanan, daftar harga jujur, cek tracking status transaksi secara mandiri, serta artikel edukasi perawatan pakaian.
2. **Admin Dashboard (React Vite)**: Platform operasional kasir & staff laundry untuk mencatat transaksi (POS), mengunggah foto kondisi cucian, mengubah status cucian, dan memantau omzet harian.

---

### 2. Visi Produk & Nilai Tambah

- **Clean, Modern & Trustworthy (Standar UI BWA)**: Antarmuka yang ramah, clean, tipografi rapi (Poppins), rounded corners, dan micro-interactions yang memberikan impresi profesional.
- **Transparansi & Kemudahan Pelanggan**: Cek resi/invoice cucian dalam hitungan detik tanpa perlu login yang rumit.
- **Efisiensi Biaya Operasional**: Mengurangi 60% pertanyaan status cucian via WhatsApp dan meminimalisir risiko komplain dengan dokumentasi foto barang cucian.

---

### 3. Profil Pengguna (User Persona)

| Persona | Peran | Kebutuhan Utama |
|---|---|---|
| **Pelanggan Umum (Siti - Ibu Rumah Tangga)** | Customer | Melihat daftar harga kiloan/satuan, memesan penjemputan via WA, melacak cucian sprei/baju keluarga. |
| **Pelanggan Anak Kos (Dimas - Mahasiswa)** | Customer | Mencari paket langganan bulanan murah, melihat tips perawatan pakaian via artikel, memantau cucian express. |
| **Kasir & Staff Laundry (Budi - Kasir Outlet)** | Staff | Memasukkan data transaksi cucian masuk, menimbang pakaian, mengunggah foto kondisi pakaian, update status `IN_PROGRESS` ke `DONE`. |
| **Owner / Super Admin (Nuy - Pemilik Bisnis)** | Super Admin | Melihat laporan harian transaksi, mengelola paket harga, memantau akun staff. |

---

### 4. Ruang Lingkup Proyek (Project Scope)

#### A. Fase Saat Ini (Current In-Scope)
1. **Inisiasi Arsitektur Frontend Monorepo**:
   - `apps/web-customer`: Nuxt 3 + Tailwind CSS.
   - `apps/admin-dashboard`: React Vite + Tailwind CSS.
   - `packages/shared-types`: Kontrak tipe TypeScript bersama.
2. **Web Customer Views**:
   - **Landing Page**: Berdasarkan template acuan BWA (`index.html`), mencakup Hero Interaktif, Marquee Mitra, 6 Layanan Unggulan, Keunggulan 1:1 Mesin, 4 Langkah Cara Kerja, Toggle Harga (Kiloan vs Langganan vs Satuan), Carousel Testimoni, FAQ Accordion, Floating WhatsApp CTA, dan Footer.
   - **Cek Tracking Transaksi**: Halaman pelacakan publik berbasis Nomor Invoice / ID Transaksi yang menampilkan status timeline, berat, rincian biaya, dan dokumentasi foto cucian.
   - **Artikel & Edukasi Pakaian**: Halaman kumpulan artikel tips mencuci, merawat kain sensitif, serta detail bacaan artikel untuk content marketing & SEO.
3. **Admin Dashboard Views (Inisiasi Dasar)**:
   - Halaman Login (Username, Password, Device Info).
   - Tata letak (Layout) Admin Dashboard bergaya BWA.
   - Halaman daftar & rincian transaksi laundry terhubung dengan backend Java Spring Boot.

#### B. Fase Mendatang (Future Out-of-Scope)
- Payment Gateway otomatis (Midtrans/Xendit) — saat ini pembayaran menggunakan QRIS/Tunai saat antar.
- WhatsApp Gateway Bot otomatis (Fonnte/Twilio).
- Membership points & voucher digital.

---

### 5. Aturan Bisnis Inti (Core Business Rules)

1. **Status Transaksi**:
   - Hanya memiliki 3 status valid:
     - `IN_PROGRESS`: Cucian sedang dalam proses (dijemput, dicuci, dikeringkan, atau disetrika).
     - `DONE`: Cucian telah selesai dan siap diantar atau sudah diambil pelanggan.
     - `CANCELED`: Transaksi dibatalkan.
2. **Jenis Paket Cucian**:
   - `WEIGHT`: Berbasis kilogram (misal: Cuci Kering Lipat, Cuci Setrika, Express).
   - `PCS`: Berbasis satuan (misal: Bed cover, jas, sepatu, karpet).
3. **Dokumentasi Foto**:
   - Kasir/Staff wajib mengunggah foto `conditionBeforeFiles` untuk mencegah komplain pakaian sobek/luntur yang sudah terjadi sebelum dicuci.
4. **Keamanan Data**:
   - Halaman tracking pelanggan bersifat publik dan hanya membutuhkan Nomor Invoice / Kode Transaksi. Data sensitif seperti kredensial admin tidak boleh terekspos.
   - Dashboard admin diwajibkan menggunakan otentikasi JWT Bearer Token dengan role `SUPER_ADMIN`, `ADMIN`, atau `STAFF`.

---

### 6. Indikator Keberhasilan Bisnis (Key Success Metrics)

- **Conversion Rate Penjemputan**: Peningkatan klik tombol "Jadwalkan Penjemputan" via landing page.
- **Self-Service Tracking Adoption**: Minimal 50% pelanggan aktif melacak status cucian mereka melalui halaman Tracking web customer.
- **Kecepatan Input Transaksi**: Waktu kasir memasukkan transaksi laundry baru tidak lebih dari 1 menit per nota.
