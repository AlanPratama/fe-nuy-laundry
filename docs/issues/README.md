# Backlog Task & Issues — UI Admin Dashboard Nuy Laundry

Dokumen ini berisi daftar instruksi tugas (*task issues*) terstruktur dalam bahasa *high-level* untuk memandu **Junior Developer** atau **AI Model** dalam melanjutkan pengembangan antarmuka (UI) pada **Admin Dashboard (`apps/admin-dashboard`)**.

---

## Prinsip Pengembangan yang Wajib Dipatuhi

1. **Clean Architecture + Feature-Based**:
   Setiap fitur baru harus dibuat dalam folder `apps/admin-dashboard/src/features/<feature-name>/`:
   ```
   features/<nama-fitur>/
   ├── models/        # Definisi interface TypeScript & DTO
   ├── repositories/  # Pemanggilan API (fetch) + fallback mock data jika offline
   ├── providers/     # State management menggunakan Zustand
   ├── components/    # Komponen visual (tabel, modal, badge, kartu)
   └── pages/         # Halaman entrypoint
   ```
2. **Standar Desain BWA (BuildWithAngga)**:
   - Warna Brand: `bg-brand-600` (`#4343E6`), `text-brand-600`, hover `bg-brand-700`.
   - Warna Teks: `text-ink` (`#0F0F3D`) untuk judul, `text-ink-soft` (`#6B6B8D`) untuk keterangan.
   - Warna Aksen: `bg-sun` (`#FFC93C`) untuk badge penting/warning, `bg-mint` (`#3DDC97`) untuk status sukses.
   - Bentuk & Bayangan: `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full` (tombol pill), dan `shadow-card`.
   - Tipografi: Font `Poppins`.
3. **State Management Ringan**:
   - Gunakan **Zustand** (jangan gunakan Redux atau library state yang kompleks).
4. **Respon API Backend Java Spring Boot**:
   - Selalu tangani amplop standar: `{ status: "SUCCESS" | "FAILED", message: string, timestamp: string, data: T }`.

---

## Daftar Urutan Issue (Roadmap Pengembangan)

| No | File Issue | Fitur | Prioritas | Status |
|---|---|---|---|---|
| **#01** | [ISSUE-01-DETAIL-TRANSAKSI-DAN-UPLOAD-FOTO.md](./ISSUE-01-DETAIL-TRANSAKSI-DAN-UPLOAD-FOTO.md) | Detail Transaksi, Unggah Foto Pakaian (MinIO), dan Cetak Nota Digital | **P1 (Kritis)** | **SELESAI (Done)** |
| **#02** | [ISSUE-02-MANAJEMEN-PAKET-LAUNDRY.md](./ISSUE-02-MANAJEMEN-PAKET-LAUNDRY.md) | Master Data Paket Laundry (Kiloan & Satuan) + Modal Tambah/Edit | **P1 (Tinggi)** | **SELESAI (Done)** |
| **#03** | [ISSUE-03-DIREKTORI-PELANGGAN.md](./ISSUE-03-DIREKTORI-PELANGGAN.md) | Daftar Pelanggan, Riwayat Cucian, dan Tombol Cepat WhatsApp | **P2 (Sedang)** | **SELESAI (Done)** |
| **#04** | [ISSUE-04-DASHBOARD-OVERVIEW-ANALYTICS.md](./ISSUE-04-DASHBOARD-OVERVIEW-ANALYTICS.md) | Dashboard Metrik Harian, Rekap Omzet, dan Antrean Cucian Express | **P2 (Sedang)** | **SELESAI (Done)** |
| **#05** | [ISSUE-05-PENGATURAN-OUTLET-DAN-STAFF.md](./ISSUE-05-PENGATURAN-OUTLET-DAN-STAFF.md) | Manajemen Akun Staff Kasir & Profil Informasi Outlet | **P3 (Pelengkap)** | **SELESAI (Done)** |
| **#06** | [ISSUE-06-ROUTING-REACT-ROUTER-DOM.md](./ISSUE-06-ROUTING-REACT-ROUTER-DOM.md) | Migrasi Routing `react-router-dom`, Rute URL Persisten & Protected Route | **P1 (Kritis)** | **SELESAI (Done)** |
| **#07** | [ISSUE-07-RESPONSIVE-STICKY-SIDEBAR.md](./ISSUE-07-RESPONSIVE-STICKY-SIDEBAR.md) | Sidebar Desktop Sticky & Navigasi Responsif Drawer Mobile/Tablet | **P1 (Tinggi)** | **SELESAI (Done)** |
| **#08** | [ISSUE-08-AXIOS-API-CLIENT-MIGRATION.md](./ISSUE-08-AXIOS-API-CLIENT-MIGRATION.md) | Refaktor Lapisan API Menggunakan Axios & Centralized Interceptors | **P1 (Tinggi)** | **SELESAI (Done)** |
| **#09** | [ISSUE-09-CUSTOM-INPUTS-PHONE-CURRENCY-SELECT.md](./ISSUE-09-CUSTOM-INPUTS-PHONE-CURRENCY-SELECT.md) | Input Sanitasi Telepon, Format Rupiah, dan Custom Searchable Select | **P2 (Sedang)** | **SELESAI (Done)** |
| **#10** | [ISSUE-10-CUSTOM-FORM-VALIDATION.md](./ISSUE-10-CUSTOM-FORM-VALIDATION.md) | Sistem Validasi Form Interaktif & Pesan Error Kustom BWA | **P2 (Sedang)** | **SELESAI (Done)** |
| **#11** | [ISSUE-11-MODAL-UX-FIX-DAN-CONFIRMATION-DIALOG.md](./ISSUE-11-MODAL-UX-FIX-DAN-CONFIRMATION-DIALOG.md) | Perbaikan Overlay Modal Detail Transaksi & Custom Confirmation Modal | **P2 (Sedang)** | **SELESAI (Done)** |
| **#12** | [ISSUE-12-ADMIN-UX-TOASTS-URL-PARAMS-AND-USER-TOGGLE.md](./ISSUE-12-ADMIN-UX-TOASTS-URL-PARAMS-AND-USER-TOGGLE.md) | UX Admin Refinements, Global Toasts, URL Params, Foto MinIO, & User Status Toggle | **P1 (Tinggi)** | **SELESAI (Done)** |
| **#13** | [ISSUE-13-MANAJEMEN-ARTIKEL-DAN-TIPS-LAUNDRY.md](./ISSUE-13-MANAJEMEN-ARTIKEL-DAN-TIPS-LAUNDRY.md) | Fitur Manajemen Artikel & Tips Laundry (CRUD & Modifikasi Super Admin & Admin Saja) | **P1 (Tinggi)** | **SELESAI (Done)** |
| **#14** | [ISSUE-14-PROTEKSI-DAN-PENANGANAN-USER-LOGIN-DI-TABEL-STAFF.md](./ISSUE-14-PROTEKSI-DAN-PENANGANAN-USER-LOGIN-DI-TABEL-STAFF.md) | Proteksi & Penanganan Akun User Login pada Tabel Data Staff (Anti Self-Lockout & Self-Deletion) | **P2 (Sedang)** | **SELESAI (Done)** |
| **#15** | [ISSUE-15-STANDARISASI-UI-TABLES-ICONS-DAN-RESPONSIVE-MOBILE.md](./ISSUE-15-STANDARISASI-UI-TABLES-ICONS-DAN-RESPONSIVE-MOBILE.md) | Standarisasi UI Tabel, Tombol Aksi, Layout Responsif Mobile, dan Navigasi Sidebar | **P1 (Tinggi)** | **OPEN (Backlog)** |
| **#16** | [ISSUE-16-TRANSAKSI-POS-PARTIAL-PICKUP-DAN-IMAGE-UPLOAD-FIX.md](./ISSUE-16-TRANSAKSI-POS-PARTIAL-PICKUP-DAN-IMAGE-UPLOAD-FIX.md) | Perbaikan Transaksi POS, Validasi Input Satuan/DP, Penanganan Unggah Gambar, dan Pengambilan Parsial (Partial Pickup) | **P1 (Kritis)** | **OPEN (Backlog)** |
| **#17** | [ISSUE-17-DRILLDOWN-RIWAYAT-TRANSAKSI-DAN-PENGELOLAAN-BENEFIT.md](./ISSUE-17-DRILLDOWN-RIWAYAT-TRANSAKSI-DAN-PENGELOLAAN-BENEFIT.md) | Optimasi Riwayat Pelanggan (Anti N+1), Drill-down Transaksi Staff, Metrik Artikel Mandiri, dan Kelola Benefit | **P2 (Sedang)** | **OPEN (Backlog)** |
| **#18** | [ISSUE-18-PEMBERSIHAN-DUMMY-DATA-RENDER-ARTIKEL-DAN-OPTIMASI-FETCH.md](./ISSUE-18-PEMBERSIHAN-DUMMY-DATA-RENDER-ARTIKEL-DAN-OPTIMASI-FETCH.md) | Pembersihan Dummy Data, Standarisasi Render Artikel Customer, Perbaikan Cek Resi, dan Eliminasi Double Request | **P2 (Sedang)** | **OPEN (Backlog)** |

