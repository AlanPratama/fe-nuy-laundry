# Issue #11: Perbaikan Overlay Modal Detail Transaksi & Pembuatan Custom Confirmation Modal

## Deskripsi Tugas (High-Level)
Issue ini berfokus pada penyempurnaan pengalaman pengguna (*UX*) dan kerapihan visual antarmuka modal:
1. **Perbaikan Overlay Modal Detail Transaksi**:
   Pada modal detail transaksi (`TransactionDetailModal.tsx`), terdapat celah/strip putih di bagian paling atas layar saat modal dibuka. Hal ini disebabkan oleh penempatan pembungkus overlay `fixed inset-0` yang terpengaruh oleh margin/padding kontainer induk (*parent stacking context*), atau padding wrapper modal yang kurang tepat. Latar belakang gelap semi-transparan harus menutupi seluruh jendela browser dari ujung atas (`top: 0`) hingga bawah (`bottom: 0`) tanpa ada celah bocor.
2. **Pembuatan Custom Confirmation Modal**:
   Saat ini konfirmasi tindakan krusial (seperti menghapus paket layanan di `PackagesPage`, membatalkan cucian, atau menonaktifkan staff kasir) masih menggunakan `window.confirm()` bawaan browser. Dialog bawaan ini tampak kuno, tidak selaras dengan tema modern BWA, dan tidak mendukung kustomisasi teks aksi.

---

## Kebutuhan Tampilan & Spesifikasi Komponen

### 1. Perbaikan Overlay Modal Detail Transaksi
- Pastikan backdrop modal menggunakan kelas `fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto`.
- Cek dan pastikan tidak ada kontainer parent berposisi `relative` dengan `overflow-hidden` yang memotong batas koordinat overlay di bagian atas layar.
- Kartu modal harus berada di tengah layar (*perfect centering*) dengan animasi buka yang halus (`animate-in fade-in zoom-in-95 duration-200`).

### 2. Komponen Custom Confirmation Modal (`ConfirmationModal.tsx`)
Buat komponen modal konfirmasi yang estetik dan dapat digunakan ulang di seluruh aplikasi dengan spesifikasi:
- **Latar Belakang & Kartu**:
  - Backdrop gelap blur (`bg-ink/60 backdrop-blur-sm`).
  - Kartu modal putih kompak (`max-w-md w-full rounded-3xl p-6 sm:p-8 bg-white shadow-card border border-brand-50 text-center`).
- **Ikon Status Bundar**:
  - Diletakkan di tengah atas modal:
    - **Varian Bahaya (`danger`)**: Ikon tong sampah atau peringatan (`AlertTriangle` / `Trash2`) dengan lingkaran latar merah muda lembut (`w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto grid place-items-center mb-4`).
    - **Varian Peringatan (`warning`)**: Lingkaran latar kuning lembut (`bg-sun/20 text-amber-600`).
    - **Varian Konfirmasi Biasa (`info` / `primary`)**: Lingkaran latar biru brand (`bg-brand-50 text-brand-600`).
- **Tipografi**:
  - Judul tegas: Contoh *"Hapus Paket Layanan?"* (`text-lg font-extrabold text-ink`).
  - Deskripsi/Penjelasan: Contoh *"Tindakan ini tidak dapat dibatalkan. Paket yang dihapus tidak akan muncul lagi di formulir transaksi kasir."* (`text-xs text-ink-soft mt-2 leading-relaxed`).
- **Tombol Aksi (Dual Pill Buttons)**:
  - Tombol **"Batal"**: Pill button abu-abu/putih (`flex-1 py-3 rounded-full text-xs font-bold text-ink-soft hover:bg-brand-50 transition`).
  - Tombol **"Konfirmasi"**: 
    - Untuk varian `danger`: Pill button merah (`flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft transition`).
    - Untuk varian `primary`: Pill button biru brand (`bg-brand-600 hover:bg-brand-700 text-white`).

---

## Implementasi Penggunaan Komponen

Gantikan seluruh pemanggilan `window.confirm()` dengan `ConfirmationModal`:
1. **Hapus Paket Laundry** pada `features/packages/pages/PackagesPage.tsx`.
2. **Batalkan Transaksi Cucian** pada `features/transactions/components/TransactionDetailModal.tsx`.
3. **Nonaktifkan Akun Staff Kasir** pada `features/settings/components/StaffTable.tsx`.

---

## Struktur File yang Dibuat / Dimodifikasi

```
apps/admin-dashboard/src/
├── components/ui/
│   └── ConfirmationModal.tsx          # Komponen pop-up konfirmasi aksi BWA
├── features/transactions/components/
│   └── TransactionDetailModal.tsx     # Perbaikan celah putih overlay atas & konfirmasi batal
├── features/packages/pages/
│   └── PackagesPage.tsx               # Integrasi ConfirmationModal untuk hapus paket
└── features/settings/components/
    └── StaffTable.tsx                 # Integrasi ConfirmationModal untuk aksi staff
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Latar overlay pada modal detail transaksi menutupi seluruh layar secara penuh tanpa ada celah/strip putih di bagian atas.
- [ ] Tidak ada lagi penggunaan dialog bawaan `window.confirm()` browser di seluruh dashboard admin.
- [ ] Saat menekan tombol hapus paket, muncul custom pop-up konfirmasi berdesain BWA dengan ikon, judul jelas, dan penjelasan aksi.
- [ ] Menekan tombol "Batal" atau mengklik area luar modal menutup dialog konfirmasi tanpa menjalankan aksi.
- [ ] Menekan tombol "Ya, Lanjutkan" mengeksekusi fungsi hapus/batal dengan benar.
- [ ] Desain dan animasi konsisten dengan estetika BuildWithAngga.
- [ ] Kode terbebas dari error TypeScript dan styling terkompilasi bersih.
