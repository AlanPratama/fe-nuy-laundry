# Issue #06: Migrasi Navigasi & Routing Menggunakan `react-router-dom`

## Deskripsi Tugas (High-Level)
Saat ini perpindahan antar halaman pada Admin Dashboard (`apps/admin-dashboard`) masih menggunakan state lokal `useState('dashboard')` di dalam `App.tsx`. Hal ini menyebabkan beberapa masalah operasional:
1. Ketika halaman di-refresh oleh kasir/admin, aplikasi selalu kembali ke tab awal (Dashboard), sehingga pekerjaan yang sedang dibuka hilang.
2. URL di *address bar* browser tidak berubah (selalu `localhost:5173/`), sehingga kasir tidak dapat melakukan *bookmark* atau membuka halaman tertentu secara langsung (contoh: langsung buka `/transactions` atau `/packages`).
3. Tombol *Back* dan *Forward* di browser tidak dapat digunakan.

Tugas pada issue ini adalah melakukan migrasi sistem routing menggunakan library standar **`react-router-dom` (v6)** dengan rute yang bersih, persisten, dan dilengkapi proteksi hak akses (*Protected Route*).

---

## Kebutuhan Fungsional & Teknis

1. **Instalasi Paket**:
   - Tambahkan `react-router-dom` pada `apps/admin-dashboard`.

2. **Daftar Rute Aplikasi**:
   - `/login` : Halaman login kasir/admin (`LoginPage`). Jika sudah memiliki sesi login, diarahkan otomatis ke `/dashboard`.
   - `/` : Redirect otomatis ke `/dashboard`.
   - `/dashboard` : Halaman Overview & Analytics (`DashboardOverviewPage`).
   - `/transactions` : Halaman Manajemen POS & Transaksi (`TransactionsPage`).
   - `/packages` : Halaman Master Data Paket Layanan (`PackagesPage`).
   - `/customers` : Halaman Direktori Pelanggan (`CustomersPage`).
   - `/settings` : Halaman Pengaturan Toko & Staff (`SettingsPage`).
   - `*` : Halaman 404 Not Found sederhana dengan tombol kembali ke Dashboard.

3. **Proteksi Rute (Route Guard)**:
   - Buat komponen `ProtectedRoute` yang memeriksa status `isAuthenticated` dari `useAuthStore`.
   - Jika pengguna belum login dan mencoba membuka halaman `/transactions`, otomatis diarahkan ke `/login`.
   - Jika proses autentikasi berhasil, pengguna diarahkan ke halaman yang sebelumnya ingin dituju.

4. **Integrasi Sidebar Navigasi**:
   - Ubah elemen menu pada `AdminLayout.tsx` menjadi komponen `<NavLink>` dari `react-router-dom`.
   - Manfaatkan prop `isActive` dari `NavLink` untuk memberikan styling tombol aktif secara otomatis sesuai URL browser saat ini.

---

## Struktur File yang Harus Dibuat / Dimodifikasi

```
apps/admin-dashboard/src/
├── routes/
│   ├── index.tsx              # Definisi router (createBrowserRouter atau BrowserRouter)
│   └── ProtectedRoute.tsx     # Komponen guard autentikasi
├── components/layout/
│   └── AdminLayout.tsx        # Update menu menggunakan <NavLink to="...">
├── App.tsx                    # Menggunakan <RouterProvider> atau <BrowserRouter>
└── package.json               # Dependensi react-router-dom
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Paket `react-router-dom` terpasang di `apps/admin-dashboard`.
- [ ] Navigasi halaman mengubah URL di browser secara tepat (`/dashboard`, `/transactions`, `/packages`, `/customers`, `/settings`).
- [ ] Ketika halaman di-refresh (F5), aplikasi tetap berada di halaman aktif saat itu dan tidak ter-reset ke dashboard.
- [ ] Tombol Back dan Forward browser berfungsi sebagaimana mestinya.
- [ ] Pengguna yang belum login otomatis ditolak saat mengakses rute selain `/login`.
- [ ] Menu sidebar yang aktif menyala sesuai dengan URL yang sedang dikunjungi.
- [ ] Kode bebas dari error TypeScript dan build lolos (`pnpm --filter admin-dashboard build`).
