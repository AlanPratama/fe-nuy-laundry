# Product Requirements Document (PRD)
## Nuy Laundry — Web Customer & Admin Dashboard

---

### 1. Ringkasan Produk

Aplikasi antarmuka Nuy Laundry terdiri dari dua modul terpadu dalam satu monorepo:
1. **Web Customer (`apps/web-customer`)**: Dibangun dengan **Nuxt 3**, mengedepankan performa SEO, loading instan, dan desain visual standar **BuildWithAngga (BWA)** yang estetik, bersih, dan modern.
2. **Admin Dashboard (`apps/admin-dashboard`)**: Dibangun dengan **React (Vite)**, cepat, interaktif, dan ringan untuk kebutuhan operasional kasir dan pemilik outlet.

---

### 2. Standar Desain Visual (BWA Design Guidelines)

Semua halaman pada web customer dan admin dashboard **WAJIB** mematuhi token desain yang telah ditentukan pada acuan file `index.html`:

#### A. Tipografi
- **Font Utama**: `Poppins`, sans-serif (Google Fonts).
- **Bobot Font**:
  - Regular (400) untuk teks paragraf/keterangan.
  - Medium (500) untuk label menu dan tombol sekunder.
  - SemiBold (600) untuk subjudul dan tombol aksi utama.
  - Bold (700) & ExtraBold (800) untuk headline dan angka statistik.

#### B. Palet Warna (Color Tokens)
| Token Tailwind | Kode Hex | Penggunaan Utama |
|---|---|---|
| `brand-50` | `#EFEFFF` | Background lembut, badge lembut, card hover |
| `brand-100` | `#E1E1FF` | Garis pembatas (border) halus |
| `brand-500` | `#5B5BF7` | Aksen warna, bubble air, hover interaktif |
| `brand-600` | `#4343E6` | **Warna Brand Primer**: Tombol CTA utama, logo, active state |
| `brand-700` | `#3434C2` | Tombol CTA saat hover/ditekan |
| `ink` | `#0F0F3D` | Warna teks utama, heading tebal, background section gelap |
| `ink-soft` | `#6B6B8D` | Warna teks sekunder, paragraf deskriptif, subtitle |
| `sun` | `#FFC93C` | **Warna Aksen Kuning**: Badge "BARU", "Favorit", bintang review |
| `mint` | `#3DDC97` | **Warna Sukses/Fresh**: Indikator status mesin, pesanan selesai |

#### C. Radius Sudut & Bayangan (Border Radius & Elevation)
- `rounded-2xl` (16px): Untuk kartu kecil, input box, tombol menu.
- `rounded-3xl` (24px): Untuk kartu layanan, container utama, kartu ulasan.
- `rounded-full` (9999px): Untuk tombol aksi utama (Pills CTA) dan tag/badge status.
- `shadow-card`: `0 10px 40px -15px rgba(15, 15, 61, 0.15)` — Efek kartu mengambang halus.
- `shadow-soft`: `0 20px 50px -20px rgba(67, 67, 230, 0.35)` — Efek pendaran biru pada tombol brand.

---

### 3. Spesifikasi Fitur Web Customer

#### Fitur 1: Landing Page (BWA Modern)
Sesuai rancangan pada `index.html`, halaman beranda memiliki komponen modular:
1. **Header & Navbar**:
   - Logo Nuy Laundry dengan ikon mesin cuci bundar.
   - Menu navigasi: *Layanan, Cara Kerja, Harga, Testimoni, FAQ, Tracking, Artikel*.
   - Tombol "Pesan Sekarang" (Pill Button warna `brand-600` mengarah ke WhatsApp).
   - Efek Glassmorphism saat discroll ke bawah (`backdrop-blur-md bg-white/85`).
2. **Hero Section**:
   - Badge pill: *"BARU - Gratis antar jemput radius 5 km"*.
   - Headline tajam dengan aksen garis kurva kuning (`sun`).
   - Tombol ganda: *"Jadwalkan Penjemputan"* dan *"Lihat Daftar Harga"*.
   - Counter statistik dinamis: 12K+ Pelanggan, 85K+ Kg tercuci, 4.9 Rating Google.
   - **Ilustrasi Mesin Cuci Animatif**: Mesin cuci SVG interaktif dengan drum berputar, air bergelombang, lampu kedip, dan floating badge "Pesanan Selesai" & "Rp6.000/kg".
3. **Marquee Mitra / Social Proof**:
   - Teks bergulir tanpa henti (Hotel Seruni, Kafe Senja, Gym Fitplus, Kos Mawar).
4. **6 Kartu Layanan Unggulan**:
   - Cuci Kering Lipat (Rp6.000/kg)
   - Cuci Setrika (Rp8.000/kg - Badge "Favorit" berlatar biru pekat)
   - Express 6 Jam (Rp12.000/kg)
   - Dry Clean (Mulai Rp30.000/pcs)
   - Bed Cover & Karpet (Mulai Rp25.000/pcs)
   - Cuci Sepatu & Tas (Mulai Rp35.000/pasang)
5. **Section "Kenapa Nuy Laundry?"**:
   - Visual bento grid 4 kotak: 24 Jam, Rp0 Antar Jemput, 100% Garansi, 1:1 Mesin per pelanggan.
   - 3 poin keunggulan utama dengan bullet centang bundar.
6. **Cara Kerja (4 Langkah Mudah)**:
   - Stepper horizontal dengan nomor pill dan progress line:
     1. Pesan via WhatsApp -> 2. Kurir Menjemput -> 3. Dicuci Profesional -> 4. Diantar Kembali.
7. **Daftar Harga Jujur**:
   - Toggle Tab Interaktif: **Kiloan** vs **Langganan**.
   - Kartu harga berlatar gelap (`bg-ink`) dengan kartu "Paling Laris" di tengah menonjol.
   - Grid harga satuan (Bed cover, selimut, jas, sepatu, karpet).
8. **Testimoni Pelanggan**:
   - Skor 4.9 bintang 5 dari 1.200+ ulasan.
   - Kartu testimoni bergulir otomatis (Marquee).
9. **FAQ Interaktif**:
   - Accordion buka-tutup halus (Smooth Transition).
10. **CTA Banner Diskon 20% & Footer**:
    - Banner biru besar dengan kode voucher `NUYBARU`.
    - Footer lengkap dengan tautan halaman, informasi outlet, dan copyright.
    - Floating WhatsApp button di pojok kanan bawah dengan efek radar berkedip.

---

#### Fitur 2: Cek Tracking Transaksi Publik (`/tracking`)
Halaman bagi pelanggan untuk melacak progres pakaian mereka secara mandiri:
1. **Search Bar Tracking BWA Style**:
   - Input field berukuran besar dan nyaman dengan placeholder: *"Contoh: INV-20261025-001 atau ID Transaksi..."*.
   - Tombol "Lacak Cucian" dengan ikon kaca pembesar / panah.
2. **Kondisi Tampilan (State Handling)**:
   - **Initial State**: Ilustrasi santai dengan teks panduan cara menemukan nomor invoice pada struk/chat WhatsApp.
   - **Loading State**: Skeleton loading bergaya BWA lembut dengan animasi shimmer.
   - **Not Found State**: Ilustrasi cucian tidak ditemukan beserta opsi hubungi customer service via WhatsApp.
   - **Success State**:
     - Header kartu hasil: Nomor Invoice, Tanggal Masuk, Nama Pelanggan (sensor parsial untuk privasi, contoh: `Al** Pr*****`).
     - Badge Status:
       - `IN_PROGRESS` (Kuning/Biru dengan label "Sedang Diproses").
       - `DONE` (Hijau Mint dengan label "Selesai Siap Diambil/Diantar").
       - `CANCELED` (Merah muda dengan label "Dibatalkan").
     - **Visual Timeline 3 Langkah Estetik**:
       - Stepper terstandarisasi menjadi 3 fase esensial:
         1. **Pesanan Diterima**: Verifikasi penimbangan dan pencatatan pesanan di outlet.
         2. **Proses Pencucian dan Pengemasan**: Saat berstatus `IN_PROGRESS`, bulatan timeline sebelah kiri menampilkan animasi denyut (*pulsating radar dot*) dengan label *"Sedang Berjalan"*.
         3. **Selesai**: Saat berstatus `DONE`, seluruh bulatan stepper berganti menjadi centang hijau sukses dan tidak ada animasi denyut yang aktif.
     - **Rincian Pesanan**: Tabel ringkas berisi nama paket, berat/jumlah pcs, harga per satuan, dan total tagihan.
     - **Galeri Foto Kondisi**: Preview foto pakaian sebelum dicuci (`conditionBeforeFiles`) dan sesudah dicuci (`conditionAfterFiles`) dari MinIO backend.

---

#### Fitur 3: Artikel Edukasi Laundry (`/articles`)
Halaman edukasi untuk meningkatkan kepercayaan pelanggan dan optimasi SEO lokal:
1. **Halaman Daftar Artikel (`/articles`)**:
   - Header bertema BWA: *"Tips & Wawasan Merawat Pakaian"*.
   - Filter Kategori Pill: *Semua, Tips Merawat Baju, Perawatan Kain Halus, Info & Promo*.
   - Grid Kartu Artikel:
     - Gambar thumbnail estetik dengan aspect ratio 16:9 (`rounded-2xl`).
     - Badge Kategori (warna `brand-50` text `brand-600`).
     - Judul artikel tebal, excerpt 2 baris, estimasi waktu baca (contoh: "3 menit baca"), dan tanggal rilis.
2. **Halaman Detail Artikel (`/articles/:slug`)**:
   - Breadcrumb ramah: *Beranda > Artikel > [Judul Artikel]*.
   - Heading berukuran besar dengan metadata penulis dan tanggal terbit.
   - Gambar cover utama beresolusi tinggi dengan sudut melengkung `rounded-3xl`.
   - Area konten tipografi yang nyaman dibaca (`prose-lg` standar BWA).
   - Kotak CTA di akhir artikel: *"Punya pakaian berbahan serupa? Serahkan pencuciannya ke Nuy Laundry!"*.
   - Bagian "Artikel Terkait" (3 kartu rekomendasi).

---

### 4. Spesifikasi Admin Dashboard (`apps/admin-dashboard`)

#### A. Autentikasi & Navigasi Tata Letak (Admin Layout)
1. **Halaman Login**:
   - Form bersih berpusat di tengah dengan logo Nuy Laundry dan branding BWA.
   - Input: Username, Password, Device Info.
   - Feedback error dinamis saat akun tidak ditemukan atau password salah.
2. **Sidebar Desktop Fixed Sticky**:
   - Struktur tata letak menggunakan `fixed inset-y-0 left-0 w-64` dengan content offset `lg:pl-64`, menjaga navigasi tetap kokoh dan stabil saat konten tabel panjang di-scroll.
   - Navigasi menu: Dashboard Overview, Transaksi (POS), Paket Laundry, Pelanggan, Staff / Pengguna, Pengaturan Outlet.
3. **Navigasi Responsif Tablet & Mobile**:
   - Tombol hamburger pada topbar mobile yang memicu drawer navigasi slide-in dengan backdrop blur.
4. **Topbar Operasional**:
   - Menampilkan status outlet, avatar profil user aktif, badge role (`SUPER_ADMIN`, `ADMIN`, `STAFF`), dan tombol Logout aman.

#### B. Dashboard Overview & Analitika Operasional (`/`)
1. **Live Metrics Integration**:
   - Terhubung langsung dengan endpoint backend `GET /api/v1/dashboard/metrics`.
   - 4 Kartu Metrik Utama:
     - **Pesanan Berjalan**: Jumlah transaksi dengan status `IN_PROGRESS`.
     - **Pesanan Selesai**: Jumlah transaksi yang telah `DONE`.
     - **Omzet Hari Ini**: Akumulasi pendapatan rupiah hari ini (`todayRevenue`).
     - **Total Transaksi**: Total histori transaksi dalam database.
2. **Quick Actions & Antrean Express**:
   - Pintasan pembuatan transaksi baru dan navigasi instan ke daftar pesanan prioritas.

#### C. Manajemen Transaksi / Point of Sale (`/transactions`)
1. **URL Search Query & Debounce**:
   - Kolom pencarian disinkronkan ke URL parameter (`?q=...`) dengan debounce 400ms, memungkinkan copy-paste link pencarian atau refresh halaman tanpa kehilangan filter.
2. **Count Cards Sinkron**:
   - Menampilkan metrik live yang selalu update saat transaksi dibuat, diubah, atau dihapus.
3. **Filter Searchable Select & Rich Package Information**:
   - Filter kasir (PIC), pelanggan, dan paket menggunakan custom search-select.
   - Pilihan paket dilengkapi informasi lengkap: Nama Paket, Estimasi Durasi, Harga, dan Badge Kategori.
4. **Dukungan Uang Muka (Down Payment / DP)**:
   - Dukungan pencatatan pembayaran DP (`down_payment`) dan status pembayaran (`payment_status`: `UNPAID`, `DOWN_PAYMENT`, `PAID`).
5. **Modal Transaksi Baru (`NewTransactionModal`)**:
   - Pencarian & pemilihan pelanggan cepat.
   - Pilihan multi-paket laundry kiloan/satuan dengan kalkulasi otomatis subtotal, uang muka, sisa tagihan, dan diskon.
   - **Upload Foto Kondisi Awal**: Dukungan unggah gambar kondisi cucian saat diterima (`CONDITION_BEFORE`) langsung ke MinIO.
6. **Modal Detail Transaksi (`TransactionDetailModal`)**:
   - Rincian item pakaian, tanggal estimasi, dan informasi pelanggan.
   - **Galeri & Upload Foto Cucian**: Input file interaktif untuk menambah foto sebelum (`CONDITION_BEFORE`) dan sesudah cuci (`CONDITION_AFTER`).
   - Ubah status pengerjaan (`IN_PROGRESS`, `DONE`, `CANCELED`) dengan proteksi validasi backend.
   - Cetak struk nota belanja fisik / thermal printer format.
   - Hapus transaksi dengan konfirmasi dialog aman.

#### D. Manajemen Master Data Paket Laundry (`/packages`)
1. **Mode Tampilan Ganda (Card & Table View)**:
   - Secara default menampilkan **Card View** yang modern dan estetik dengan thumbnail foto paket, badge tipe (Kiloan/Satuan), dan estimasi pengerjaan.
   - Opsi tombol toggle untuk beralih ke **Table View** bagi operator yang membutuhkan kepadatan data tinggi.
   - Konsistensi warna badge kategori antara Card View dan Table View.
2. **Modal Detail Paket (`PackageDetailModal`)**:
   - Menampilkan informasi lengkap paket, harga, estimasi, dan daftar transaksi terkini yang menggunakan paket tersebut.
   - Item transaksi dapat diklik untuk membuka modal rincian transaksi lengkap (*drill-down*).
3. **Modal Tambah & Edit Paket**:
   - Form ringkas: Nama paket, deskripsi, harga per kg/pcs, estimasi durasi (dalam hitungan hari), tipe paket (`WEIGHT` / `PCS`), dan foto paket.
   - Dukungan hapus foto cover yang sudah ada (`removeThumbnail`) saat proses edit.
4. **Sinkronisasi URL Params**:
   - Parameter pencarian paket terikat pada query URL (`?q=...`).

#### E. Direktori Pelanggan (`/customers`)
1. **Tabel Data Pelanggan**:
   - Tabel berpadding luas (`py-4 px-6`) dengan avatar inisial berwarna, nomor telepon, dan alamat.
   - Pagination server-side terhubung ke response backend `totalElements`.
   - Sinkronisasi URL params (`?q=...`).
2. **Interaksi Cepat**:
   - Tombol klik langsung untuk membuka WhatsApp pelanggan dengan template salam otomatis.
   - Modal Tambah dan Edit Pelanggan.

#### F. Manajemen Pengguna & Hak Akses Staff (`/staff`)
1. **Desain Tabel Harmonis**:
   - Memiliki hierarki visual, padding sel (`py-4 px-6`), dan card container yang seragam dengan halaman pelanggan dan transaksi.
2. **Toggle Status Aktif / Non-Aktif & Proteksi Self-Lockout (ISSUE-14)**:
   - Switch interaktif untuk mengaktifkan atau menonaktifkan akses staff kasir secara instan via `PUT /api/v1/users/{id}` (`isActive: true/false`).
   - **Proteksi Akun Login Sendiri**: Baris akun pengguna yang sedang login ditandai badge **"Anda (Sedang Login)"**, tombol toggle status dinonaktifkan (*disabled*), dan tombol hapus dihilangkan demi mencegah penguncian akun admin sendiri.
3. **Sinkronisasi URL Params & Filter Role**:
   - Pencarian nama/username/nomor HP terikat URL (`?q=...`) dengan filter role dropdown (`ADMIN`, `STAFF`).
4. **Modal Tambah & Edit Pengguna**:
   - Input data lengkap: Nama, Username, Password (dengan ikon toggle sensor intip), Role, Nomor Telepon, Alamat.

#### G. Manajemen Artikel & Tips Edukasi Laundry CMS (`/articles`) (ISSUE-13)
1. **Halaman Direktori Artikel (`/articles`)**:
   - Daftar artikel dengan filter status kustom (`CustomSelect`: "Semua Status", "Diterbitkan", "Draf"), kolom pencarian dengan debounce, dan paginasi.
   - Tombol "Tulis Artikel Baru" mengarahkan ke halaman editor khusus (`/articles/create`).
   - Proteksi otorisasi: Akses manajemen artikel hanya diizinkan untuk `SUPER_ADMIN` dan `ADMIN`.
2. **Halaman Penulisan Terpisah (`ArticleEditorPage`)**:
   - Rute: `/articles/create` dan `/articles/edit/:id`.
   - Layout fokus *distraction-free* bergaya Medium.
   - Input judul besar otomatis menyesuaikan tinggi (*auto-resize textarea*), excerpt ringkasan, dan unggah cover thumbnail (16:9).
   - Metrik langsung: live word count, character count, dan perkiraan reading time otomatis.
   - Opsi simpan ganda: Simpan Draf atau Publikasikan Langsung.
3. **Editor WYSIWYG Kaya Fitur (`MediumEditor`)**:
   - Berbasis Tiptap v3 dengan toolbar floating yang elegan.
   - Dropdown selektor teks lengkap: Paragraph, Heading 1 hingga 6.
   - Modal Link kustom dengan pintasan `Ctrl+K` / `Cmd+K`, dukungan `target="_blank"`, dan tombol unlink.
   - Tooltip informatif saat tombol toolbar di-hover lengkap dengan indikator hotkey keyboard.
   - **Upload & Paste Gambar Langsung**: Pengguna dapat melakukan paste (`Ctrl+V` / `Cmd+V`) atau drag & drop file gambar langsung ke editor yang secara otomatis diunggah ke backend MinIO (`POST /api/v1/articles/upload-image`).

#### H. Pengaturan Outlet & Peta Lokasi (`/settings`)
1. **Konfigurasi Identitas Outlet**:
   - Nama outlet, deskripsi, alamat, kontak WhatsApp, email, dan akun Instagram.
   - Unggah logo outlet langsung ke MinIO dengan sinkronisasi instan ke header global tanpa perlu me-refresh halaman setting.
2. **Peta Lokasi Google Maps**:
   - Konfigurasi Latitude, Longitude, dan Google Maps URL dengan pratinjau embed peta interaktif responsif.

#### I. Sistem Notifikasi Toast Global (`ToastProvider`)
1. **Umpan Balik Instan (Interactive Feedback)**:
   - Notifikasi mengambang di pojok kanan atas layar dengan animasi slide-in halus.
   - Tipe notifikasi:
     - `success`: Aksi simpan, update status, toggle keaktifan, dan upload foto berhasil.
     - `error`: Validasi gagal, error jaringan, atau token tidak valid.
     - `info`: Informasi sistem dan proses pengunduhan berkas.
   - Durasi timeout otomatis 3.5 detik dengan tombol tutup cepat.
   - Tampilan responsif optimal pada perangkat seluler sempit.

