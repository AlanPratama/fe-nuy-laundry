# Issue #12: Admin UX Refinements, Global Toasts, URL Search Params, MinIO Photo Uploads, and User Status Toggle

## Deskripsi Tugas (High-Level)
Issue ini merangkum perbaikan komprehensif pengalaman pengguna (*UX*), konsistensi desain sistem BuildWithAngga (BWA), stabilitas navigasi, dan integrasi backend end-to-end yang mencakup 9 penyempurnaan utama:

1. **Sinkronisasi Search Query ke URL Params (`?q=...`)**:
   Pencarian teks pada tabel Transaksi, Pelanggan, Paket Laundry, dan Staff disinkronkan secara otomatis ke query parameter URL browser dengan mekanisme debounce 400ms. Hal ini memungkinkan filter pencarian tetap bertahan saat halaman direfresh atau dibagikan melalui URL.
2. **Perbaikan Bug Count Cards Halaman Transaksi**:
   Metrik ringkasan kartu di atas tabel transaksi sebelumnya hanya menghitung elemen dari halaman aktif (*client-side slice*) atau data mock statis. Kini metrik diambil langsung dari endpoint live backend `GET /api/v1/dashboard/metrics` (`activeOrdersCount`, `doneOrdersCount`, `todayRevenue`, dan `totalElements`).
3. **Harmonisasi UI Halaman Pengguna / Staff**:
   Halaman `StaffPage.tsx` dan `StaffTable.tsx` yang sebelumnya berbeda gaya kini diselaraskan sepenuhnya dengan standar halaman `CustomersPage` dan `TransactionsPage` (padding sel `py-4 px-6`, hierarki kartu berlatar putih dengan border `brand-50`, avatar bundar inisial, badge role, dan pagination).
4. **Integrasi Unggah Foto Transaksi MinIO**:
   Fungsi unggah foto kondisi pakaian sebelum dicuci (`CONDITION_BEFORE`) dan sesudah dicuci (`CONDITION_AFTER`) di `TransactionDetailModal.tsx` dihubungkan ke backend endpoint multipart `POST /api/v1/transaction-files`.
5. **Unggah Foto Kondisi Awal pada Transaksi Baru**:
   Formulir `NewTransactionModal.tsx` dilengkapi dengan masukan berkas gambar untuk memotret kondisi pakaian saat pertama kali diserahkan oleh pelanggan di kasir.
6. **Sistem Notifikasi Feedback Global (Toast)**:
   Membangun sistem notifikasi mengambang (`Toast.tsx`) dengan React Context (`ToastProvider`, `useToast()`) yang memberikan feedback instan (`success`, `error`, `info`) pada seluruh aksi mutasi (tambah transaksi, ubah status, upload foto, hapus paket, dan toggle pengguna).
7. **Penyempurnaan Timeline Tracking Web Customer & Bug Selesai**:
   Stepper pelacakan publik disederhanakan menjadi 3 langkah bersih (*Pesanan Diterima -> Proses Pencucian dan Pengemasan -> Selesai*). Memperbaiki bug status selesai: ketika transaksi telah `DONE`, seluruh bulatan berubah menjadi centang hijau sukses dan teks "Sedang Berjalan" dinonaktifkan.
8. **Perbaikan Bug Tampilan Sidebar Desktop saat Scroll**:
   Memperbaiki bug layout berantakan saat halaman admin discroll dengan mengunci sidebar desktop secara mutlak (`fixed inset-y-0 left-0 w-64 z-30`) dan memberikan offset lebar `lg:pl-64` pada kontainer konten utama.
9. **Implementasi Toggle Aktif / Non-Aktif Akun Pengguna**:
   - Backend: Menambahkan properti `isActive` pada `UserUpdateRequestDTO`, setter pada `UserServiceImpl.updateUser`, dan pemetaan pada `UserMapper`.
   - Frontend: Menambahkan komponen switch toggle interaktif pada `StaffTable.tsx` lengkap dengan proteksi deaktivasi diri sendiri (*self-deactivation protection*) agar admin aktif tidak dapat menonaktifkan akunnya sendiri.

---

## Rincian Perubahan & File yang Terlibat

### 1. Backend (`be-nuy-laundry`)
| Berkas | Perubahan yang Dilakukan |
| :--- | :--- |
| `presentation/dtos/request/user/UserUpdateRequestDTO.java` | Menambahkan field `private Boolean isActive;`. |
| `application/services/UserServiceImpl.java` | Menambahkan pengecekan `if (request.getIsActive() != null) existingUser.setIsActive(request.getIsActive());`. |
| `infrastructure/internal/database/mapper/UserMapper.java` | Memetakan `isActive` dari model domain ke response DTO. |

### 2. Frontend Admin Dashboard (`apps/admin-dashboard`)
| Berkas | Perubahan yang Dilakukan |
| :--- | :--- |
| `components/ui/Toast.tsx` | Membuat context provider notifikasi toast ringan dengan timer dismiss otomatis 3.5 detik dan animasi slide-in. |
| `App.tsx` | Membungkus seluruh aplikasi dengan `<ToastProvider>`. |
| `components/layout/AdminLayout.tsx` | Mengunci desktop sidebar dengan `fixed inset-y-0 left-0 w-64` dan menambahkan `lg:pl-64` pada konten utama. |
| `features/transactions/providers/useTransactionStore.ts` | Menambahkan action `uploadTransactionPhotos` yang memanggil `POST /api/v1/transaction-files`. |
| `features/transactions/components/TransactionDetailModal.tsx` | Mengintegrasikan input upload foto sebelum & sesudah, tombol hapus transaksi, dan trigger toast feedback. |
| `features/transactions/components/NewTransactionModal.tsx` | Menambahkan input berkas foto pakaian awal dan memicu upload foto setelah pembuatan header transaksi berhasil. |
| `features/transactions/pages/TransactionsPage.tsx` | Sinkronisasi search filter ke URL params (`useSearchParams`), pemanggilan live dashboard metrics untuk count cards, dan toast notification. |
| `features/customers/pages/CustomersPage.tsx` | Sinkronisasi search filter ke URL params dan toast notification pada aksi pelanggan. |
| `features/packages/pages/PackagesPage.tsx` | Sinkronisasi search filter ke URL params dan toast notification saat menambah/mengedit/menghapus paket. |
| `features/staff/components/StaffTable.tsx` | Harmonisasi UI dengan `CustomersPage`, penambahan switch toggle aktif/non-aktif akun staff, proteksi self-deactivation, dan pagination. |
| `features/staff/pages/StaffPage.tsx` | Sinkronisasi search filter ke URL params dan toast notification. |

### 3. Frontend Web Customer (`apps/web-customer`)
| Berkas | Perubahan yang Dilakukan |
| :--- | :--- |
| `features/tracking/repositories/TrackingRepository.ts` | Menyederhanakan mapping step status transaksi menjadi 3 fase terstandarisasi. |
| `features/tracking/components/TrackingTimeline.vue` | Menghapus bulatan kedip ganda pada label konten, menyisakan denyut radar hanya di bulatan kiri, dan memastikan seluruh langkah tercentang hijau saat transaksi `DONE`. |

---

## Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

- [x] **URL Search Query**: Mengetik di kolom pencarian transaksi, pelanggan, paket, atau staff otomatis memperbarui URL browser (`?q=...`) dengan debounce halus tanpa flickering.
- [x] **Count Cards Sinkron**: Kartu indikator ringkasan di halaman transaksi menampilkan angka agregasi live backend yang akurat.
- [x] **UI Harmonis Staff**: Halaman staff memiliki hierarki visual, padding kartu, dan tabel selaras dengan direktori pelanggan.
- [x] **Upload Foto Berfungsi**: Kasir dapat mengunggah foto pakaian di modal transaksi baru maupun modal detail transaksi yang tersimpan ke MinIO.
- [x] **Toast Notifications**: Notifikasi pop-up hijau/merah muncul mengambang di pojok kanan atas layar setiap kali formulir disimpan, status diubah, atau data dihapus.
- [x] **Timeline Tracking Selesai**: Pesanan berstatus `DONE` menampilkan semua langkah tercentang sukses tanpa ada tulisan atau lingkaran "Sedang Berjalan".
- [x] **Sidebar Fixed**: Konten halaman admin dapat discroll bebas secara vertikal tanpa merusak tata letak atau menggeser sidebar navigasi.
- [x] **Toggle User Status**: Admin dapat mengaktifkan atau menonaktifkan akun staff dengan switch interaktif, dan tidak dapat menonaktifkan akunnya sendiri.
- [x] **Build Bersih**: Kompilasi Maven backend (`./mvnw clean package -DskipTests`) serta pnpm build kedua aplikasi frontend (`admin-dashboard` dan `web-customer`) sukses tanpa error.
