# Issue #05: Pengaturan Profil Outlet & Manajemen Akun Staff

## Deskripsi Tugas (High-Level)
Issue ini bertujuan mengimplementasikan halaman **Pengaturan (`features/settings/`)** pada web admin. Halaman ini digunakan oleh Owner/Super Admin untuk mengatur informasi operasional outlet dan mengelola akun kasir/staff yang memiliki akses masuk ke dashboard.

Fungsi utama modul ini:
1. **Profil Outlet Laundry**:
   - Mengubah Nama Outlet, Alamat Fisik, Jam Buka & Tutup, serta Nomor WhatsApp resmi.
   - Mengatur parameter radius antar jemput gratis (misal: radius 5 km, ongkir tambahan Rp2.000/km).
2. **Manajemen Akun Staff Kasir**:
   - Menampilkan daftar staff yang memiliki akun login (`ADMIN` atau `STAFF`).
   - Menambahkan akun kasir baru (Username, Nama Lengkap, Password baru).
   - Menonaktifkan akun kasir yang sudah resign/tidak aktif.

---

## Kebutuhan Tampilan (BWA Aesthetic Guidelines)

1. **Tab Navigasi Pengaturan**:
   - Tab switch: **Profil Outlet** dan **Akun Staff**.
2. **Form Profil Outlet**:
   - Input bersih: Nama Outlet, Nomor WhatsApp Kasir, Alamat Outlet, Jam Operasional (Buka - Tutup), Catatan Kaki Nota / Struk.
   - Tombol Simpan Perubahan (Pill button `bg-brand-600` dengan efek hover dan notifikasi tersimpan).
3. **Tabel Akun Staff Kasir**:
   - Kolom: Nama Staff, Username, Peran (`STAFF` atau `ADMIN`), Tanggal Dibuat, Status (Aktif / Nonaktif).
   - Tombol "Tambah Staff Baru" yang membuka modal input user baru.

---

## Struktur File yang Harus Dibuat (Clean Architecture)

```
apps/admin-dashboard/src/features/settings/
├── models/
│   └── SettingsModel.ts              # Interface OutletProfile, StaffUser, CreateStaffDTO
├── repositories/
│   └── SettingsRepository.ts         # Integrasi backend / fallback mock data
├── providers/
│   └── useSettingsStore.ts           # Zustand store (profile, staffList, updateProfile, addStaff)
├── components/
│   ├── OutletProfileForm.tsx         # Form profil toko & outlet
│   ├── StaffTable.tsx                # Tabel daftar akun kasir
│   └── AddStaffModal.tsx             # Modal tambah akun kasir baru
└── pages/
    └── SettingsPage.tsx              # Halaman utama pengaturan
```

---

## Kontrak Endpoint Backend API

- **Ambil Profil Pengguna Saat Ini**:
  - `GET /api/v1/users/me`
- **Ambil Daftar Staff**:
  - `GET /api/v1/users`
  - Header: `Authorization: Bearer <token>`
- **Tambah Staff Baru**:
  - `POST /api/v1/users`
  - Body: `{ username, password, name, role: "STAFF" }`

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Menu **"Pengaturan"** pada sidebar `AdminLayout.tsx` terhubung dan membuka `SettingsPage`.
- [ ] Admin dapat mengubah informasi outlet dan melihat perubahan tersimpan.
- [ ] Super Admin dapat melihat daftar akun staff kasir dan menambahkan akun baru melalui modal.
- [ ] Form memiliki validasi input dasar (nomor telepon valid, password minimal 6 karakter).
- [ ] Menggunakan pola Clean Architecture dan state management Zustand.
- [ ] Tampilan konsisten dengan standar UI BWA (font Poppins, rounded-3xl, shadow-card).
