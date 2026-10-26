# Issue #18: Pembersihan Dummy Data, Standarisasi Render Artikel Customer, Perbaikan Cek Resi, dan Eliminasi Double Request - [RESOLVED]

> **Status:** ✅ **RESOLVED** (Selesai diimplementasikan dan diverifikasi)

## 📌 Deskripsi Masalah (High-Level)
1. **Double Request pada Halaman Admin**:
   - Saat pengguna membuka atau me-refresh halaman pada Web Admin (misal: Transaksi, Pelanggan, Staff), tab Network di browser mencatat adanya 2 kali pemanggilan API identik secara berurutan.
   - Hal ini disebabkan oleh kombinasi `React.StrictMode` pada mode pengembangan serta efek ganda (*cascading useEffect*) antara sinkronisasi URL search params dan pemanggilan *fetch* data di Zustand store.
2. **Keberadaan Dummy Data Sisa Pengujian**:
   - Masih terdapat data tiruan (*mock / dummy data*) yang ter-hardcode pada Web Customer (halaman artikel, pelacak resi) dan Web Admin jika API tidak mengembalikan data.
   - Seluruh data wajib diambil dari backend database asli atau menampilkan *empty state* yang informatif jika data kosong.
3. **Inkonsistensi Tampilan Konten Artikel di Web Customer**:
   - Di Web Admin (`MediumEditor.tsx`), artikel ditampilkan dengan tipografi kaya (H1–H6, blockquote, gambar ber-radius halus, list rapi).
   - Di Web Customer (`ArticleDetailPage.vue`), styling hanya mengandalkan beberapa selector terbatas sehingga tampilan artikel tidak presisi dan berbeda dari apa yang dibuat oleh editor admin.
4. **Detail Pelacakan Resi Customer Kurang Lengkap**:
   - Pada timeline status cucian, langkah *"Proses Pencucian dan Pengemasan"* menampilkan jam statis/dummy yang tidak relevan dan harus dihapus.
   - Tampilan rincian pelacakan resi belum memuat informasi penting seperti status pembayaran (Lunas / DP / Belum Bayar), rincian uang muka, dan sisa tagihan yang harus dibayar saat pengambilan.

---

## 🎯 Spesifikasi Kebutuhan & Solusi

### 1. Eliminasi Double Network Request pada Halaman Admin
- **Penyebab Utama**:
  - Halaman memiliki `useEffect` pertama untuk membaca `searchParams` dan mengatur state store, serta `useEffect` kedua yang mengamati perubahan state store lalu memanggil `fetch...()`. Hal ini memicu panggilan ganda saat komponen pertama kali di-mount.
- **Solusi Teknis**:
  - Gabungkan inisialisasi: Baca parameter URL langsung sebagai nilai awal (*default values*) saat memanggil `fetch...()`, atau gunakan `useRef(false)` sebagai *isMounted / initialized guard* agar tidak memicu panggilan kedua sebelum inisialisasi selesai.
  - Dokumentasikan catatan bahwa pada mode development (`npm run dev`), `<React.StrictMode>` di `main.tsx` secara sengaja mengeksekusi efek 2 kali untuk deteksi memory leak, namun pada mode produksi (`vite build` / preview) pemanggilan harus strictly 1 kali.

### 2. Pembersihan Menyeluruh Seluruh Dummy Data
- Periksa seluruh berkas repositori:
  - `apps/web-customer/features/articles/repositories/ArticleRepository.ts`
  - `apps/web-customer/features/tracking/repositories/TrackingRepository.ts`
  - `apps/admin-dashboard/src/features/transactions/repositories/TransactionRepository.ts`
  - `apps/admin-dashboard/src/features/customers/repositories/CustomerRepository.ts`
- Hapus semua array *mock data fallback* yang ter-hardcode.
- Jika API mengembalikan data kosong atau gagal, berikan pesan *empty state* yang elegan (*"Belum ada data tersedia"* atau *"Transaksi tidak ditemukan"*), jangan menampilkan data fiktif.

### 3. Penyeragaman Render Konten Artikel di Web Customer (`ArticleDetailPage.vue`)
- Buat styling tipografi pada container `v-html="currentArticle.content"` identik dengan `MediumEditor.tsx`:
  - **Headings**:
    - `h1`: `text-3xl font-extrabold text-ink mt-8 mb-4`
    - `h2`: `text-2xl font-bold text-ink mt-7 mb-3`
    - `h3`: `text-xl font-bold text-ink mt-6 mb-2`
    - `h4 s/d h6`: `font-semibold text-ink mt-4 mb-2`
  - **Paragraf & Teks**: `text-base text-ink-soft leading-relaxed my-3`
  - **Tautan (Links)**: `text-brand-600 underline font-medium hover:text-brand-700`
  - **Gambar Inline (`img`)**: `rounded-2xl border border-brand-100 shadow-sm max-w-full h-auto my-6`
  - **Kutipan (`blockquote`)**: `border-l-4 border-brand-500 pl-4 py-1 italic text-ink font-serif my-4 bg-brand-50/30 rounded-r-xl`
  - **Daftar (Lists)**: `ul` (bullet list-disc) dan `ol` (numbered list-decimal) dengan padding kiri `pl-6 space-y-1.5`.

### 4. Penyempurnaan Tampilan Cek Resi / Tracking Customer
- **Timeline Tahapan Cucian (`TrackingTimeline.vue` & `TrackingRepository.ts`)**:
  - Hapus penanda jam (*timestamp*) pada tahap kedua (*Proses Pencucian dan Pengemasan*). Waktu hanya ditampilkan pada tahap 1 (*Pesanan Diterima*) dan tahap 3 (*Selesai* jika sudah berstatus `DONE`).
- **Kelengkapan Rincian Kartu Hasil Tracking (`TrackingDetailCard.vue`)**:
  - Tampilkan **Badge Status Pembayaran**:
    - `PAID`: Badge hijau "Lunas".
    - `DOWN_PAYMENT`: Badge kuning "Uang Muka (DP: Rp...)" + "Sisa Tagihan: Rp...".
    - `UNPAID`: Badge merah "Belum Bayar (Total: Rp...)".
  - Tampilkan estimasi tanggal selesai (*Target Date*) dengan format tanggal yang bersahabat.
  - Tampilkan rincian daftar paket pakaian yang dicuci secara lengkap (bukan hanya 1 paket).

---

## 📁 Berkas Terkait
- `apps/web-customer/features/articles/pages/ArticleDetailPage.vue`
- `apps/web-customer/features/tracking/components/TrackingTimeline.vue`
- `apps/web-customer/features/tracking/components/TrackingDetailCard.vue`
- `apps/web-customer/features/tracking/repositories/TrackingRepository.ts`
- `apps/web-customer/features/articles/repositories/ArticleRepository.ts`
- `apps/admin-dashboard/src/features/transactions/pages/TransactionsPage.tsx`
- `apps/admin-dashboard/src/features/customers/pages/CustomersPage.tsx`
- `apps/admin-dashboard/src/main.tsx`

---

## ✅ Kriteria Penerimaan (Acceptance Criteria)
- [ ] Tab Network browser pada mode build produksi hanya melakukan 1 kali pemanggilan API per halaman saat halaman pertama kali dibuka.
- [ ] Tidak ada lagi artikel atau transaksi fiktif/dummy yang muncul di web customer maupun web admin; tampilan kosong menampilkan pesan empty state yang rapi.
- [ ] Tampilan artikel di Web Customer memiliki format tipografi, gambar, dan kutipan yang identik dengan tampilan di Web Admin.
- [ ] Pada timeline tracking cucian, langkah Proses Pencucian dan Pengemasan tidak lagi menampilkan jam statis/dummy.
- [ ] Kartu hasil cek resi di web customer menampilkan informasi status pembayaran lengkap (Lunas, DP, atau Belum Bayar beserta sisa tagihan).
