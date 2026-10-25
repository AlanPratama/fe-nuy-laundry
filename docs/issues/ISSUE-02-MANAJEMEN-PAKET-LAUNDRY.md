# Issue #02: Fitur Manajemen Paket Laundry (Master Data Layanan)

## Deskripsi Tugas (High-Level)
Saat ini paket layanan masih bersifat statis (hardcoded) di beberapa komponen. Pada issue ini, junior dev / AI diminta untuk membuat modul **Manajemen Paket Laundry** (`features/packages/`) pada dashboard admin.

Fitur ini memungkinkan Admin/Owner untuk:
1. Melihat semua paket layanan yang tersedia, baik kategori **Kiloan (`WEIGHT`)** maupun **Satuan (`PCS`)**.
2. Menambah paket baru (contoh: "Express 3 Jam Super Kilat", "Cuci Gorden Kantor").
3. Mengubah harga per satuan, estimasi waktu pengerjaan, dan status aktif/nonaktif.
4. Menghapus paket yang sudah tidak digunakan.

---

## Kebutuhan Tampilan (BWA Aesthetic Guidelines)

1. **Header Halaman**:
   - Judul: *"Daftar Paket & Layanan Laundry"*.
   - Subjudul: *"Kelola daftar harga kiloan, satuan, dan paket langganan outletmu."*.
   - Tombol CTA: `+ Tambah Paket Baru` (Pill button `bg-brand-600` dengan ikon plus).
2. **Tab Kategori**:
   - Tab switch: **Semua**, **Kiloan (Kg)**, dan **Satuan (Pcs)** dengan gaya pill BWA.
3. **Grid Kartu Paket (Package Cards)**:
   - Setiap paket ditampilkan dalam kartu berlatar putih dengan bayangan lembut (`bg-white rounded-3xl p-6 shadow-card border border-brand-50`).
   - Badge tipe paket: `WEIGHT` (Warna biru lembut) atau `PCS` (Warna kuning lembut).
   - Harga tebal berukuran besar (contoh: `Rp8.000 / kg`).
   - Estimasi jam pengerjaan (contoh: `⏱ 24 Jam`).
   - Toggle switch aktif/nonaktif dan tombol aksi Edit / Hapus.
4. **Modal Tambah / Edit Paket**:
   - Form input ramah: Nama Paket, Tipe (Dropdown: Kiloan / Satuan), Harga per Unit, Estimasi Durasi (Jam), Deskripsi singkat, dan Checkbox "Tandai sebagai Paket Terlaris (Favorit)".

---

## Struktur File yang Harus Dibuat (Clean Architecture)

```
apps/admin-dashboard/src/features/packages/
├── models/
│   └── PackageModel.ts               # Interface Package, CreatePackageDTO, UpdatePackageDTO
├── repositories/
│   └── PackageRepository.ts          # Integrasi backend /api/v1/packages + fallback mock
├── providers/
│   └── usePackageStore.ts            # Zustand store (packages, addPackage, updatePackage, deletePackage)
├── components/
│   ├── PackageCard.tsx               # Kartu visual paket layanan
│   └── PackageFormModal.tsx          # Modal tambah dan edit paket
└── pages/
    └── PackagesPage.tsx              # Halaman utama daftar paket
```

---

## Kontrak Endpoint Backend API

- **Ambil Semua Paket**:
  - `GET /api/v1/packages`
- **Tambah Paket Baru**:
  - `POST /api/v1/packages`
  - Body: `{ name, type: "WEIGHT" | "PCS", price, unit, estimateHours, description }`
- **Update Paket**:
  - `PUT /api/v1/packages/{id}`
- **Hapus Paket**:
  - `DELETE /api/v1/packages/{id}`

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Menu **"Paket Laundry"** pada sidebar `AdminLayout.tsx` terhubung dan membuka `PackagesPage`.
- [ ] Admin dapat melihat kartu-kartu paket laundry dengan filter kategori (Kiloan / Satuan).
- [ ] Modal Tambah Paket berfungsi menyimpan data paket baru dan langsung tampil di halaman tanpa reload.
- [ ] Admin dapat mengedit harga dan nama paket yang sudah ada.
- [ ] Terdapat konfirmasi sebelum menghapus paket.
- [ ] Menggunakan state management **Zustand** secara bersih dan ringan.
- [ ] Desain antarmuka mematuhi standar BWA (font Poppins, rounded-3xl, shadow-card).
