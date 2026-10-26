# Issue #17: Optimasi Riwayat Pelanggan (Anti N+1), Drill-down Transaksi Staff, Metrik Artikel Mandiri, dan Kelola Benefit - [RESOLVED]

> **Status:** ✅ **RESOLVED** (Selesai diimplementasikan dan diverifikasi)

## 📌 Deskripsi Masalah (High-Level)
1. **Potensi Masalah N+1 Query pada Data Pelanggan**:
   - Saat ini, pengambilan daftar pelanggan (`getAll`) berisiko memuat seluruh relasi transaksi untuk menghitung riwayat.
   - Diperlukan pemisahan: data transaksi hanya di-fetch secara spesifik berdasarkan `customerId` saat modal detail/riwayat dibuka.
2. **Ketiadaan Fitur Riwayat pada Halaman Staff**:
   - Pada halaman Paket dan Pelanggan, pengguna dapat mengeklik tombol detail untuk melihat riwayat transaksi yang terkait dengan paket atau pelanggan tersebut.
   - Halaman Staff belum memiliki modal detail yang menampilkan riwayat transaksi yang dilayani oleh kasir/staff yang bersangkutan.
3. **Kartu Metrik Artikel Bergantung pada Paginasi**:
   - Kartu statistik di halaman Artikel (`/articles`) saat ini menghitung total berdasarkan respon halaman saat itu (`totalElements` / array length paginasi), bukan dari data agregat database secara menyeluruh.
4. **Kelola Benefit Paket Belum Memiliki Pencarian & Konfirmasi Hapus**:
   - Modal kelola benefit (`BenefitManagementModal.tsx`) tidak memiliki kolom pencarian untuk memfilter daftar benefit yang panjang.
   - Aksi hapus benefit langsung dieksekusi tanpa dialog konfirmasi, berisiko terjadi penghapusan tidak sengaja.

---

## 🎯 Spesifikasi Kebutuhan & Solusi

### 1. On-Demand Fetch Riwayat Transaksi Pelanggan (`CustomerHistoryModal.tsx`)
- Hapus ketergantungan modal riwayat terhadap properti `customer.history` yang dimuat dari daftar utama.
- Saat `CustomerHistoryModal` terbuka (`isOpen && customer.id`):
  - Lakukan pemanggilan API khusus: `GET /api/v1/transactions?customerId={customer.id}&size=20&sortBy=createdAt&direction=desc`.
  - Tampilkan status loading (*skeleton shimmer*) saat data transaksi sedang diambil.
  - Tampilkan daftar transaksi pelanggan dan sediakan tombol interaktif untuk membuka `TransactionDetailModal` (*drill-down*).

### 2. Modal Detail Staff & Riwayat Transaksi Kasir (`StaffDetailModal.tsx`)
- Buat komponen modal baru: `apps/admin-dashboard/src/features/settings/components/StaffDetailModal.tsx`.
- Desain konsisten dengan `PackageDetailModal` dan `CustomerHistoryModal`:
  - **Header Profil Staff**: Foto avatar, nama lengkap, username, badge role, nomor telepon, dan status aktif.
  - **Kartu Ringkasan Kinerja**: Total transaksi yang dilayani, total omzet yang dihasilkan oleh kasir tersebut.
  - **Daftar Riwayat Transaksi Kasir**: Mengambil data via `GET /api/v1/transactions?userId={staff.id}`.
  - Mengklik item transaksi membuka detail transaksi lengkap (`TransactionDetailModal`).
- Tambahkan tombol aksi mata (`Eye`) pada baris tabel staf untuk membuka modal ini.

### 3. Kartu Metrik Artikel Mandiri (Dedicated Metrics Endpoint)
- Hubungkan kartu hitungan di halaman `/articles` ke endpoint dedicated: `GET /api/v1/articles/metrics`.
- DTO Respon yang diharapkan:
  ```json
  {
    "totalArticles": 12,
    "publishedArticles": 9,
    "draftArticles": 3
  }
  ```
- Kartu metrik tetap menampilkan jumlah total yang akurat di database meskipun tabel sedang difilter atau berpindah ke halaman paginasi tertentu.

### 4. Pencarian & Dialog Konfirmasi pada Kelola Benefit (`BenefitManagementModal.tsx`)
- **Fitur Pencarian**:
  - Tambahkan input pencarian dengan ikon kaca pembesar di atas daftar benefit:
    `<input type="text" placeholder="Cari nama benefit..." value={search} ... />`.
  - Filter daftar benefit secara reaktif berdasarkan kata kunci yang diketik.
- **Konfirmasi Hapus**:
  - Integrasikan komponen `ConfirmationModal` (`apps/admin-dashboard/src/components/ui/ConfirmationModal.tsx`).
  - Saat tombol hapus diklik, munculkan modal dialog konfirmasi:
    *"Apakah Anda yakin ingin menghapus benefit [Nama Benefit]? Paket yang menggunakan benefit ini tidak akan lagi menampilkannya."*
  - Eksekusi `benefitRepo.delete(id)` hanya setelah pengguna menyetujui di dialog konfirmasi.

---

## 📁 Berkas Terkait
- `apps/admin-dashboard/src/features/customers/components/CustomerHistoryModal.tsx`
- `apps/admin-dashboard/src/features/customers/pages/CustomersPage.tsx`
- `apps/admin-dashboard/src/features/settings/components/StaffDetailModal.tsx` *(Baru)*
- `apps/admin-dashboard/src/features/settings/components/StaffTable.tsx`
- `apps/admin-dashboard/src/features/articles/pages/ArticlesPage.tsx`
- `apps/admin-dashboard/src/features/articles/providers/useArticleStore.ts`
- `apps/admin-dashboard/src/features/packages/components/BenefitManagementModal.tsx`

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)
- [ ] Buka modal riwayat pelanggan melakukan pemanggilan endpoint transaksi khusus `?customerId=...` tanpa memuat array transaksi pada query daftar seluruh pelanggan (`getAll`).
- [ ] Terdapat modal detail staff yang menampilkan informasi akun kasir beserta daftar riwayat transaksi yang pernah ditanganinya.
- [ ] Mengklik transaksi di modal detail staff membuka modal detail transaksi secara interaktif.
- [ ] Kartu metrik pada halaman artikel menampilkan angka agregat total, diterbitkan, dan draf secara mandiri tanpa terpengaruh filter pencarian atau halaman tabel.
- [ ] Modal kelola benefit memiliki input pencarian yang responsif dan dialog konfirmasi protektif sebelum menghapus benefit.
