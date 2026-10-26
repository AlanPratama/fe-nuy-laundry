# Issue #16: Perbaikan Transaksi POS, Validasi Input Satuan/DP, Penanganan Unggah Gambar, dan Pengambilan Parsial (Partial Pickup) - [RESOLVED]

> **Status:** ✅ **RESOLVED** (Selesai diimplementasikan dan diverifikasi)

## 📌 Deskripsi Masalah (High-Level)
Terdapat beberapa bug dan kebutuhan bisnis baru pada alur Transaksi (POS):
1. **Input Desimal pada Paket Satuan (PCS)**: Kuantitas paket tipe satuan (`PCS`) saat ini masih mengizinkan angka desimal (contoh: 1.5 pcs jas/karpet), yang seharusnya berupa bilangan bulat murni (integer).
2. **Input Uang Muka (Down Payment) Belum Terformat**: Input nominal DP masih menggunakan `<input type="number">` standar tanpa pemisah ribuan Rupiah.
3. **Bug Pembatalan & Hapus Gambar Dokumentasi**:
   - Jika pengguna memilih foto untuk diunggah tetapi kemudian membatalkannya (klik ikon silang pada pratinjau), berkas `File` masih tersimpan di dalam array state `newBeforeFiles`/`newAfterFiles` sehingga foto tersebut tetap terunggah saat tombol simpan ditekan.
   - Penghapusan foto lama yang sudah ada di database tidak berefek permanen pada backend storage.
4. **Ringkasan Layanan pada Kartu Transaksi**: Kartu transaksi hanya memuat detail paket pertama tanpa indikasi jika transaksi memiliki multi-paket.
5. **Kebutuhan Pengambilan Pakaian Bertahap (Partial Pickup)**:
   - Pelanggan kerap mengambil sebagian pakaian terlebih dahulu (misal: pakaian harian sudah diambil, bedcover masih belum diambil).
   - Sistem membutuhkan pencatatan `deliveredDate` di level **detail item transaksi**, bukan hanya di level header transaksi.

---

## 🎯 Spesifikasi Kebutuhan & Solusi

### 1. Validasi Kuantitas Paket Satuan vs Kiloan (`NewTransactionModal.tsx`)
- Deteksi `item.packageType`:
  - Jika `packageType === 'PCS'`:
    - Atribut input: `step="1"`, `min="1"`.
    - Event `onChange`: Lakukan sanitasi `Math.max(1, Math.floor(Number(val) || 1))` dan tolak karakter desimal (titik/koma).
    - Tombol tambah/kurang kuantitas menggunakan penambahan kelipatan `1`.
  - Jika `packageType === 'WEIGHT'`:
    - Atribut input: `step="0.1"`, `min="0.1"`.
    - Tombol tambah/kurang menggunakan kelipatan `0.5` atau `0.1`.

### 2. Format Rupiah pada Input Uang Muka (Down Payment)
- Ganti input teks angka biasa pada bagian nominal DP dengan komponen `CurrencyInput` (`apps/admin-dashboard/src/components/ui/CurrencyInput.tsx`).
- Tampilkan pemisah ribuan otomatis saat pengguna mengetik (contoh: `Rp 50.000`).
- Validasi: Nominal DP tidak boleh melebihi total tagihan transaksi (`downPayment <= totalAmount`).

### 3. Perbaikan Siklus Hidup Berkas Foto (`ImageUploader.tsx` & `TransactionDetailModal.tsx`)
- Sinkronkan penghapusan pratinjau gambar baru dengan berkas biner `File`:
  - Bedakan antara **foto yang sudah tersimpan di server** (berupa URL path) dan **foto baru yang masih di-staging** (berupa blob/base64 lokal dan objek `File`).
  - Saat `onRemoveImage(index)` dipanggil pada foto baru yang belum disimpan, hapus elemen pada indeks yang sama dari state array `newBeforeFiles` / `newAfterFiles`.
- Pastikan hanya berkas yang benar-benar ada di pratinjau yang dikirimkan ke endpoint `POST /api/v1/transaction-files`.
- Sediakan integrasi penghapusan foto lama ke backend saat pengguna menghapus foto yang sudah ada di server.

### 4. Indikator Sisa Layanan pada Kartu Transaksi (`TransactionCard.tsx`)
- Jika transaksi memiliki lebih dari 1 item (`transaction.items.length > 1`):
  - Tampilkan nama paket pertama beserta kuantitasnya.
  - Tampilkan badge indikator: `+{transaction.items.length - 1} layanan lainnya` dengan gaya pill lembut (`bg-brand-50 text-brand-700 font-bold text-[10px] px-2 py-0.5 rounded-full`).
  - Berikan tooltip saat badge di-hover yang menampilkan daftar ringkas nama paket lainnya.

### 5. Fitur Pengambilan Cucian Parsial & Tanggal Serah (`deliveredDate`)
Pada `TransactionDetailModal.tsx`:
- Di setiap baris item paket cucian (`transaction.items`), tambahkan status penyerahan:
  - Jika `item.deliveredDate` sudah terisi: Tampilkan badge sukses *"Sudah Diambil: [Tanggal & Jam]"*.
  - Jika `item.deliveredDate` masih kosong:
    - Tampilkan tombol aksi **"Ambil Item Ini"** (`CheckCircle` icon). Saat diklik, perbarui `deliveredDate` hanya untuk detail item tersebut.
- Di bagian footer modal transaksi:
  - Sediakan tombol utama **"Ambil Semua Barang (Selesai)"**: Mengisi `deliveredDate` untuk seluruh item yang belum diambil sekaligus, dan mengubah status transaksi menjadi `DONE`.

---

## 📁 Berkas Terkait
- `apps/admin-dashboard/src/features/transactions/components/NewTransactionModal.tsx`
- `apps/admin-dashboard/src/features/transactions/components/TransactionDetailModal.tsx`
- `apps/admin-dashboard/src/features/transactions/components/TransactionCard.tsx`
- `apps/admin-dashboard/src/features/transactions/components/ImageUploader.tsx`
- `apps/admin-dashboard/src/components/ui/CurrencyInput.tsx`

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)
- [ ] Kuantitas pada paket satuan (`PCS`) tidak dapat diisi angka berkoma atau desimal; tombol plus/minus bertambah/berkurang per 1 unit.
- [ ] Input uang muka pada pembuatan transaksi menggunakan format Rupiah berpemisah ribuan (`CurrencyInput`).
- [ ] Menghapus foto yang baru dipilih di form tidak akan mengunggah file tersebut saat transaksi disimpan.
- [ ] Kartu transaksi yang memiliki lebih dari satu paket menampilkan label `+X layanan lainnya`.
- [ ] Staf kasir dapat mencatat penyerahan cucian per item detail pakaian (`deliveredDate` parsial) maupun serentak untuk seluruh item yang tersisa.
