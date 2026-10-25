# Issue #04: Halaman Dashboard Overview & Analytics Omzet

## Deskripsi Tugas (High-Level)
Saat ini setelah login, admin langsung diarahkan ke halaman tabel transaksi. Issue ini bertujuan menambahkan halaman **Dashboard Overview (`features/dashboard/`)** sebagai halaman muka utama kasir & owner.

Halaman ini berfungsi sebagai pusat komando operasional yang menyajikan:
1. **Ringkasan Keuangan**: Omzet hari ini, total transaksi, dan rata-rata nilai nota.
2. **Antrean Cucian Mendesak (Express Priority)**: Menyorot cucian paket Express 6 jam yang harus segera diselesaikan agar tidak telat.
3. **Grafik Omzet Mingguan**: Visualisasi grafik batang/garis omzet 7 hari terakhir.
4. **Indikator Kapasitas Mesin Cuci**: Berapa mesin yang sedang mencuci dan berapa yang sedang idle/siap pakai.

---

## Kebutuhan Tampilan (BWA Aesthetic Guidelines)

1. **Greeting Banner Modern**:
   - Kartu sambutan ramah: *"Selamat datang kembali, Kasir! Hari ini ada 8 pesanan aktif yang siap diproses."*
   - Tanggal hari ini dan jam operasional outlet.
2. **4 Kartu Metrik Utama (Metric Cards)**:
   - Omzet Hari Ini (contoh: `Rp850.000` dengan badge persentase hijau `+18% vs kemarin`).
   - Cucian Masuk Hari Ini (contoh: `24 Nota / 112 Kg`).
   - Selesai & Menunggu Diambil (contoh: `9 Nota`).
   - Pelanggan Baru Hari Ini (contoh: `5 Orang`).
3. **Visual Grafik Omzet (Weekly Chart)**:
   - Komponen grafik batang/line minimalis dan estetik (menggunakan SVG murni atau library lightweight seperti Recharts/Chart.js tanpa memberatkan aplikasi).
   - Warna batang utama: `bg-brand-600` dengan gradasi lembut.
4. **Widget Antrean Prioritas Express (Emergency Queue)**:
   - Menampilkan pesanan `Express 6 Jam` dengan badge countdown / waktu tersisa (contoh: `Sisa waktu: 1 jam 45 menit`).
   - Tombol cepat untuk mengubah status ke `DONE`.

---

## Struktur File yang Harus Dibuat (Clean Architecture)

```
apps/admin-dashboard/src/features/dashboard/
├── models/
│   └── DashboardModel.ts             # Interface DashboardMetrics, RevenueStat, ExpressItem
├── repositories/
│   └── DashboardRepository.ts        # Endpoint analitik atau kalkulasi dari daftar transaksi
├── providers/
│   └── useDashboardStore.ts          # Zustand store (metrics, revenueHistory, expressQueue)
├── components/
│   ├── MetricStatCard.tsx            # Kartu angka statistik
│   ├── RevenueBarChart.tsx           # Grafik omzet mingguan
│   └── ExpressQueueWidget.tsx        # Widget antrean cucian prioritas
└── pages/
    └── DashboardOverviewPage.tsx     # Halaman utama overview dashboard
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Menu **"Dashboard"** pada sidebar `AdminLayout.tsx` membuka `DashboardOverviewPage`.
- [ ] Menampilkan 4 kartu statistik utama dengan angka yang rapi dan format mata uang rupiah (`Rp`).
- [ ] Menampilkan antrean paket express dengan indikator warna kuning/merah agar staff tidak melewatkan cucian kilat.
- [ ] Desain visual bersih, modern, dan sangat konsisten dengan palet warna BWA (`brand-600`, `sun`, `mint`, `ink`, `shadow-card`).
- [ ] Memiliki fallback data mock realistis jika backend analitik belum aktif.
