# Issue #03: Direktori Pelanggan & Riwayat Transaksi Cucian

## Deskripsi Tugas (High-Level)
Pelanggan setia laundry sering kali mengulang pesanan setiap minggu. Issue ini bertujuan membuat halaman **Direktori Pelanggan (`features/customers/`)** pada web admin agar kasir dapat melihat riwayat transaksi pelanggan, total pakaian yang pernah dicuci, dan langsung menghubungi WhatsApp pelanggan jika pakaian selesai.

Fungsi utama modul ini:
1. Menyimpan data pelanggan otomatis yang di-generate dari transaksi POS masuk.
2. Menampilkan metrik pelanggan: Frekuensi order, total kg/pcs tercuci, dan total rupiah yang telah dibelanjakan.
3. Menampilkan riwayat transaksi per pelanggan dalam modal pop-up.
4. Tombol cepat *"Chat WhatsApp"* untuk follow-up pakaian siap diambil atau promo voucher.

---

## Kebutuhan Tampilan (BWA Aesthetic Guidelines)

1. **Header & Metrik**:
   - Judul: *"Direktori Pelanggan Nuy Laundry"*.
   - Kartu statistik di atas tabel:
     - Total Pelanggan Terdaftar
     - Pelanggan Aktif Bulan Ini
     - Rata-rata Kekerapan Cuci (Repeat Order)
2. **Search & Filter Bar**:
   - Kolom pencarian cepat berbasis Nama Pelanggan atau Nomor WhatsApp.
3. **Tabel Pelanggan Modern**:
   - Kolom: Avatar inisial nama bundar (`w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold`), Nama Pelanggan, Nomor WhatsApp, Total Pesanan (Nota), Total Nominal Belanja, dan Tanggal Terakhir Cuci.
   - Kolom Aksi: Tombol *"Lihat Riwayat"* dan Tombol *"Chat WhatsApp"*.
4. **Modal Riwayat Cucian Pelanggan**:
   - Pop-up bersih menampilkan riwayat invoice yang pernah dibuat oleh pelanggan terkait lengkap dengan statusnya (`IN_PROGRESS` atau `DONE`).

---

## Struktur File yang Harus Dibuat (Clean Architecture)

```
apps/admin-dashboard/src/features/customers/
├── models/
│   └── CustomerModel.ts               # Interface Customer, CustomerStats, CustomerHistoryItem
├── repositories/
│   └── CustomerRepository.ts          # Integrasi backend / fallback mock data
├── providers/
│   └── useCustomerStore.ts            # Zustand store (customers, selectedCustomer, search)
├── components/
│   ├── CustomerTable.tsx              # Tabel data pelanggan BWA
│   └── CustomerHistoryModal.tsx       # Modal riwayat transaksi per pelanggan
└── pages/
    └── CustomersPage.tsx              # Halaman utama direktori pelanggan
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Menu **"Pelanggan"** pada sidebar `AdminLayout.tsx` terhubung dan membuka `CustomersPage`.
- [ ] Terdapat input pencarian untuk menyaring pelanggan berdasarkan nama atau no WhatsApp secara instan.
- [ ] Mengklik tombol *"Lihat Riwayat"* membuka modal riwayat transaksi khusus pelanggan tersebut.
- [ ] Mengklik tombol *"Chat WhatsApp"* membuka tab baru WhatsApp Web (`https://wa.me/{phone}`) dengan salam pembuka ramah dari Nuy Laundry.
- [ ] Tabel responsif pada layar desktop maupun tablet kasir.
- [ ] Menggunakan pola Clean Architecture dan state management Zustand.
