# Issue #09: Komponen Input Khusus: Sanitasi Telepon, Format Rupiah, dan Custom Searchable Select

## Deskripsi Tugas (High-Level)
Saat ini beberapa form input di Admin Dashboard masih menggunakan elemen bawaan HTML dasar:
1. **Nomor Telepon**: Pengguna masih bisa mengetikkan karakter alfabet atau simbol sembarang yang berpotensi merusak pengiriman pesan WhatsApp.
2. **Input Harga**: Masih berupa angka mentah tanpa pemisah ribuan (contoh: `15000`), sehingga kasir kesulitan memastikan jumlah nol saat menginput harga paket.
3. **Pilihan Dropdown (`<select>`)**: Menggunakan elemen bawaan browser yang kaku dan tidak cocok dengan desain modern BWA. Selain itu, pada modal Tambah Transaksi Baru, jika jenis paket laundry sudah banyak, kasir kesulitan memilih layanan karena belum ada fitur pencarian paket di dalam dropdown (*Searchable Select / Combobox*).

Tugas pada issue ini adalah membuat tiga komponen input kustom yang dapat digunakan kembali (*reusable*) di seluruh form dashboard.

---

## Spesifikasi Komponen & Kebutuhan UI

### 1. Komponen Sanitasi Nomor Telepon (`PhoneInput.tsx`)
- Hanya menerima karakter **angka (`0-9`)** dan tanda hubung / strip (**`-`**).
- Jika pengguna mengetik atau melakukan *paste* teks yang mengandung huruf atau simbol lain (seperti `abc`, spasi, `+`, `()`), karakter tersebut otomatis dibersihkan secara *real-time*.
- Placeholder ramah: `0812-3456-7890`.

### 2. Komponen Format Rupiah (`CurrencyInput.tsx`)
- Tampilan visual otomatis memformat angka menjadi format mata uang Rupiah saat diketik (contoh: pengguna mengetik `15000` -> terformat menjadi `Rp 15.000`).
- Memiliki prefix teks atau badge `Rp` yang rapi.
- Prop callback `onChange` tetap mengembalikan nilai numerik murni (`number`, contoh: `15000`) ke state parent, sehingga tidak perlu lagi melakukan parsing manual di level form.

### 3. Komponen Custom Select & Searchable Select (`Select.tsx` & `SearchableSelect.tsx`)
- **Custom Select**:
  - Tampilan tombol pemicu (*trigger button*) bergaya BWA: `rounded-2xl border-brand-100 bg-white py-3 px-4 shadow-sm text-sm focus:border-brand-600`.
  - Ikon Chevron yang berputar 180 derajat saat dropdown terbuka.
  - Menu melayang (*floating popover*) dengan bayangan lembut `shadow-card`, border halus, dan opsi yang memiliki efek hover biru lembut (`hover:bg-brand-50`).
- **Searchable Select (Combobox)**:
  - Digunakan khusus pada pilihan paket laundry di modal **Tambah Transaksi Baru (`NewTransactionModal.tsx`)**.
  - Terdapat kotak pencarian di bagian atas dropdown (*search input inside dropdown*).
  - Kasir dapat mengetik sebagian nama layanan (misal: "Express" atau "Bedcover") dan daftar opsi akan terfilter seketika.
  - Menampilkan informasi harga dan tipe unit di samping nama paket (contoh: `Cuci Setrika Reguler - Rp8.000/Kg`).

---

## Struktur File yang Harus Dibuat / Dimodifikasi

```
apps/admin-dashboard/src/
├── components/ui/
│   ├── PhoneInput.tsx                 # Input sanitasi angka & tanda minus
│   ├── CurrencyInput.tsx              # Input format mata uang Rupiah
│   ├── CustomSelect.tsx               # Dropdown custom BWA
│   └── SearchableSelect.tsx           # Dropdown dengan kolom pencarian live
├── features/transactions/components/
│   └── NewTransactionModal.tsx        # Integrasi PhoneInput, SearchableSelect, CurrencyInput
└── features/packages/components/
    └── PackageFormModal.tsx           # Integrasi CurrencyInput dan CustomSelect
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Kolom input nomor WhatsApp di seluruh form kasir menolak karakter selain angka dan `-`.
- [ ] Kolom input harga (pada tambah paket dan input transaksi) otomatis memformat angka dengan pemisah ribuan Rupiah saat diketik.
- [ ] Dropdown select menggunakan komponen custom dengan desain BWA (bukan dropdown default sistem operasi/browser).
- [ ] Pemilihan paket pada modal Tambah Transaksi Baru memiliki fitur pencarian interaktif (*Searchable Select*) yang mempermudah kasir menemukan paket dalam hitungan detik.
- [ ] Klik di luar dropdown (*click outside*) otomatis menutup popover pilihan.
- [ ] Komponen dapat diakses dengan navigasi keyboard dasar (Enter untuk memilih, Escape untuk menutup).
- [ ] Tidak ada error TypeScript dan styling konsisten dengan palet BWA (`brand-600`, `ink`, `brand-50`).
