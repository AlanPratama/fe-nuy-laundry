# Issue #15: Standarisasi UI Tabel, Tombol Aksi, Layout Responsif Mobile, dan Navigasi Sidebar - [RESOLVED]

> **Status:** ✅ **RESOLVED** (Selesai diimplementasikan dan diverifikasi)

## 📌 Deskripsi Masalah (High-Level)
Saat ini terdapat beberapa inkonsistensi visual dan masalah keterbacaan antarmuka pada Web Admin (`apps/admin-dashboard`):
1. **Mode Mobile Berantakan**: Padding container terlalu sempit/lebar, header dan kartu operasional bertumpuk pada layar smartphone (< 640px).
2. **Tabel Data Terpotong & Tidak Pas (Ill-fitting Tables)**: Pada beberapa resolusi layar, tabel data di halaman Pelanggan, Transaksi, Paket, dan Staff tampak kepotong, teks meluap (*overflow*), atau scrollbar horizontal tidak memiliki indikator visual yang jelas.
3. **Inkonsistensi Tombol Aksi Tabel**:
   - Di tabel Customer, tombol "Riwayat" berbentuk pill bertulisan teks dan ikon, sementara tombol WhatsApp, Edit, dan Hapus berupa ikon bulat.
   - Di tabel Staff dan Paket, gaya tombol dan ukurannya berbeda-beda.
4. **Posisi Menu Sidebar**: Menu navigasi "Artikel & Tips" saat ini berada di atas "Pelanggan", padahal secara alur operasional harus berada di atas "Pengaturan".

---

## 🎯 Spesifikasi Kebutuhan & Solusi

### 1. Perbaikan Layout Responsif Mode Mobile
- Sesuaikan padding root wrapper pada tampilan mobile (`px-4 py-4 sm:px-6 sm:py-6 lg:px-8`).
- Pastikan kartu metrik (Count Cards) berubah menjadi grid 1 atau 2 kolom yang rapi pada layar kecil (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Header halaman (Judul, Subjudul, dan Tombol Tambah Utama) wajib disusun fleksibel (`flex flex-col sm:flex-row sm:items-center justify-between gap-3`). Tombol CTA utama harus mengambil lebar penuh (*full-width*) pada perangkat mobile agar ramah sentuhan (*touch-friendly*).

### 2. Standarisasi Tampilan Tabel Data
- Seluruh elemen tabel dibungkus dalam container kartu standar:
  `rounded-3xl bg-white border border-brand-50 shadow-card overflow-hidden`.
- Area tabel wajib memiliki wrapper scroll horizontal yang halus:
  `<div className="overflow-x-auto w-full">` dengan kelas `min-w-[700px]` agar data tidak saling berhimpit pada layar kecil.
- Padding sel selaras di seluruh halaman: `py-4 px-6` untuk sel data, font teks `text-sm`, dan warna teks `text-ink`.
- Header tabel seragam: `bg-brand-50/60 text-ink font-bold uppercase tracking-wider text-xs border-b border-brand-50`.

### 3. Standarisasi Seluruh Ikon Aksi Tabel (Action Icons)
Ubah tombol aksi di seluruh tabel (Customer, Staff, Paket, Artikel, Transaksi) menjadi format **Icon-Only Bulat Seragam**:
- **Ukuran & Bentuk**: Lingkaran `w-8 h-8 rounded-full grid place-items-center transition shrink-0`.
- **Tooltip On Hover**: Setiap tombol wajib memiliki tooltip ramah pengguna atau atribut `title` yang jelas:
  1. **Aksi Lihat Detail / Riwayat**: Gunakan ikon Mata (`Eye`), warna `bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white` (menggantikan tombol teks "Riwayat" pada tabel pelanggan).
  2. **Aksi WhatsApp (Khusus Pelanggan)**: Gunakan ikon `Send`, warna `bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white`.
  3. **Aksi Sunting (Edit)**: Gunakan ikon Pensil (`Pencil` / `Edit3`), warna `bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white`.
  4. **Aksi Hapus**: Gunakan ikon Tempat Sampah (`Trash2`), warna `bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white`.
- Kelompok aksi dibungkus rapat dengan `flex items-center justify-end gap-1.5`.

### 4. Penataan Ulang Navigasi Sidebar
Pada `apps/admin-dashboard/src/components/layout/AdminLayout.tsx`, urutkan array `allNavItems` menjadi:
1. `Dashboard` (`/dashboard`)
2. `Transaksi (POS)` (`/transactions`)
3. `Paket Laundry` (`/packages`)
4. `Pelanggan` (`/customers`)
5. `Staff Kasir` (`/staff`)
6. **`Artikel & Tips`** (`/articles`) *(Pindah ke posisi ini, tepat di atas Pengaturan)*
7. `Pengaturan` (`/settings`)

---

## 📁 Berkas Terkait
- `apps/admin-dashboard/src/components/layout/AdminLayout.tsx`
- `apps/admin-dashboard/src/features/customers/pages/CustomersPage.tsx`
- `apps/admin-dashboard/src/features/settings/components/StaffTable.tsx`
- `apps/admin-dashboard/src/features/packages/components/PackageTable.tsx`
- `apps/admin-dashboard/src/features/articles/components/ArticleTable.tsx`
- `apps/admin-dashboard/src/features/transactions/pages/TransactionsPage.tsx`

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)
- [ ] Tampilan halaman di mode mobile tidak ada elemen yang meluap (*overflow-x* di luar viewport utama).
- [ ] Tabel data di semua halaman muat dengan proporsional, tidak terpotong, dan dapat digeser mendatar (*smooth scroll*) di mobile.
- [ ] Tombol aksi di tabel Customer, Staff, Paket, Transaksi, dan Artikel seragam menggunakan bulatan ikon (`w-8 h-8 rounded-full`), dan aksi riwayat menggunakan ikon mata (`Eye`).
- [ ] Seluruh tombol aksi memunculkan tooltip keterangan saat kursor melayang (*hover*).
- [ ] Posisi navigasi "Artikel & Tips" di sidebar berada tepat di atas menu "Pengaturan".
