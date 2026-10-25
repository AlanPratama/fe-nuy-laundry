# Issue #07: Sidebar Desktop Sticky & Navigasi Responsif Mobile/Tablet

## Deskripsi Tugas (High-Level)
Saat ini tata letak (*layout*) `AdminLayout.tsx` memiliki dua kendala tampilan:
1. **Desktop**: Sidebar ikut tergulung (*scroll*) ke atas saat konten tabel atau form panjang di-scroll ke bawah. Hal ini membuat kasir kehilangan akses cepat ke menu navigasi.
2. **Mobile & Tablet**: Sidebar tidak responsif dan memotong ruang layar kerja kasir, sehingga tampilan tabel menjadi sempit atau rusak pada perangkat tablet POS/iPad atau ponsel.

Tugas pada issue ini adalah merefaktor layout sidebar menjadi **Sticky & Fixed di Desktop** serta menyediakan **Drawer Navigasi Responsif (Hamburger Menu)** untuk layar tablet dan ponsel.

---

## Kebutuhan Tampilan (BWA Aesthetic Guidelines)

1. **Tata Letak Desktop (Layar $\ge$ 1024px / lg)**:
   - Sidebar harus selalu menempel di sisi kiri (*sticky* / *fixed*) dengan tinggi penuh jendela (`h-screen sticky top-0`).
   - Jika daftar menu di sidebar bertambah banyak, sidebar memiliki scrollbar internal yang halus (`overflow-y-auto`).
   - Area konten utama di sebelah kanan mengalir dan dapat di-scroll secara mandiri tanpa membuat sidebar ikut bergeser.

2. **Top Header Bar untuk Mobile & Tablet (Layar < 1024px)**:
   - Header bar ramping di bagian atas layar (`sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-brand-50 px-4 py-3 flex items-center justify-between`).
   - Tombol **Hamburger Menu** di sisi kiri dengan ikon garis tiga (`lucide-react: Menu`).
   - Logo Nuy Laundry di tengah atau samping tombol menu.
   - Avatar / profil ringkas kasir di sisi kanan.

3. **Drawer Navigasi Off-Canvas (Mobile/Tablet)**:
   - Ketika tombol hamburger ditekan, sidebar muncul meluncur dari tepi kiri (*slide-in animation*).
   - Diberikan latar belakang overlay semi-transparan gelap (`bg-ink/60 backdrop-blur-sm fixed inset-0 z-40`).
   - Terdapat tombol tutup silang (`X`) di pojok kanan atas drawer.
   - **Auto-close**: Drawer harus otomatis menutup ketika pengguna mengklik salah satu menu tautan atau ketika area gelap di luar drawer ditekan.

---

## Struktur File yang Dimodifikasi

```
apps/admin-dashboard/src/components/layout/
├── AdminLayout.tsx            # Struktur layout utama pembagi sidebar dan konten
├── Sidebar.tsx                # Komponen daftar menu navigasi (desktop & drawer)
└── MobileHeader.tsx           # Bar atas mobile dengan tombol hamburger menu
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Pada layar desktop, sidebar tetap diam di tempat saat halaman tabel transaksi di-scroll ke bawah.
- [ ] Konten halaman utama (`main`) memiliki margin atau ruang yang pas di samping sidebar desktop tanpa ada konten yang tertutup.
- [ ] Pada layar berukuran $\le$ 768px (ponsel) dan $\le$ 1024px (tablet), sidebar default tersembunyi dan muncul tombol hamburger di header atas.
- [ ] Menekan tombol hamburger membuka menu navigasi dari samping dengan animasi transisi yang halus.
- [ ] Mengklik salah satu tautan menu di mobile otomatis menutup drawer navigasi.
- [ ] Menekan area gelap di luar drawer otomatis menutup drawer.
- [ ] Desain visual mematuhi estetika BWA (sudut melengkung, font Poppins, border halus `brand-50`, warna brand `#4343E6`).
- [ ] Bebas dari error TypeScript dan styling Tailwind CSS terkompilasi sempurna.
