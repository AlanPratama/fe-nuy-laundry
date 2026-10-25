# Issue #01: Modal Detail Transaksi, Upload Foto Pakaian (MinIO), dan Cetak Nota

## Deskripsi Tugas (High-Level)
Saat ini admin kasir sudah bisa melihat tabel transaksi dan menambahkan transaksi baru. Tugas pada issue ini adalah membuat **Modal/Tampilan Detail Transaksi** yang lengkap saat baris transaksi diklik. 

Halaman ini berfungsi agar kasir dapat:
1. Melihat rincian pakaian, berat/pcs, dan status pembayaran.
2. Mengunggah dokumentasi foto kondisi pakaian sebelum dicuci (`conditionBeforeFiles`) dan sesudah selesai (`conditionAfterFiles`).
3. Mengubah status cucian (`IN_PROGRESS` -> `DONE` atau `CANCELED`).
4. Mencetak nota digital (Print Thermal / PDF) atau mengirimkan tautan cek resi ke WhatsApp pelanggan dengan 1 klik.

---

## Kebutuhan Tampilan (BWA Aesthetic Guidelines)

1. **Header Nota**:
   - Menampilkan Nomor Invoice dengan font monospace tebal (contoh: `INV-20261025-001`).
   - Badge status berwarna cerah (Kuning untuk `IN_PROGRESS`, Hijau Mint untuk `DONE`, Merah Muda untuk `CANCELED`).
   - Tanggal & jam masuk transaksi.
2. **Area Unggah Foto (Drag & Drop)**:
   - Komponen upload foto bergaya modern dengan border putus-putus (`border-2 border-dashed border-brand-200 rounded-3xl`).
   - Preview thumbnail foto yang diunggah dengan tombol hapus kecil di pojok.
   - Dua zona foto: **Foto Sebelum Cuci** (bukti noda/sobek awal) dan **Foto Setelah Cuci** (bukti hasil rapi).
3. **Ringkasan Tagihan & Pelanggan**:
   - Nama pelanggan, nomor WhatsApp (dengan tombol ikon WhatsApp warna hijau untuk kirim nota).
   - Rincian item paket (jumlah kg/pcs x harga satuan = total).
4. **Tombol Aksi**:
   - Tombol **"Cetak Struk"** (Membuka dialog cetak browser atau tampilan thermal 58mm/80mm).
   - Tombol **"Kirim Nota ke WA"** (Membuka WhatsApp Web dengan format teks template rapih).
   - Tombol **"Selesaikan Cucian"** (Mengubah status menjadi `DONE`).

---

## Struktur File yang Harus Dibuat (Clean Architecture)

```
apps/admin-dashboard/src/features/transactions/
├── components/
│   ├── TransactionDetailModal.tsx     # Modal utama detail transaksi
│   ├── ImageUploader.tsx              # Komponen upload foto sebelum/sesudah
│   └── ReceiptPrintView.tsx           # Tampilan struk nota siap cetak
├── repositories/
│   └── TransactionRepository.ts       # Tambahkan method uploadPhotos() & getDetail()
└── providers/
    └── useTransactionStore.ts         # Tambahkan action setSelectedTransaction()
```

---

## Kontrak Endpoint Backend API

- **Ambil Detail Transaksi**:
  - `GET /api/v1/transactions/{id}`
  - Header: `Authorization: Bearer <token>`
- **Upload Foto / Update Transaksi**:
  - `PUT /api/v1/transactions/{id}` (Multipart Form Data)
  - Part: `conditionBeforeFiles`, `conditionAfterFiles`

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Kasir dapat mengklik baris transaksi di tabel untuk membuka Modal Detail Transaksi.
- [ ] Terdapat tombol untuk memilih file foto gambar (JPEG/PNG) dan menampilkannya sebagai preview.
- [ ] Tersedia tombol "Cetak Struk" yang memunculkan layout nota bersih tanpa elemen sidebar/topbar.
- [ ] Tersedia tombol "Kirim Resi ke WA" yang membuat link `https://wa.me/{phone}?text={templatePesanan}` berisi nomor invoice dan tautan cek tracking di web customer (`http://localhost:3000/tracking?invoice=...`).
- [ ] Kasir dapat mengubah status transaksi menjadi `DONE` dari dalam modal detail.
- [ ] Kode bebas dari error TypeScript dan styling konsisten dengan warna tema Nuy Laundry (`brand-600`, `ink`, `sun`, `mint`).
