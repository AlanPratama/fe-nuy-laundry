# Nuy Laundry — Frontend Monorepo

Repositori ini berisi kode antarmuka (frontend) untuk ekosistem **Nuy Laundry**, yang dibangun dengan prinsip **Clean Architecture** dan pendekatan **Feature-Based**.

## Struktur Monorepo

- **`apps/web-customer`**: Web aplikasi pelanggan publik berbasis **Nuxt 3** (Vue 3, SSR/SSG, SEO Friendly).
  - Tampilan: **Landing Page** (BWA style sesuai acuan `index.html`), **Cek Tracking Transaksi** (3-step timeline estetik), dan **Artikel Edukasi**.
- **`apps/admin-dashboard`**: Web aplikasi internal operasional kasir & owner berbasis **React + Vite** (SPA, fast loading).
  - Fitur: **Autentikasi Login**, **Dashboard Overview** (Live backend metrics), **Manajemen Transaksi (POS)** (Multi-package, foto MinIO, cetak struk), **Manajemen Paket** (Card & Table View, riwayat transaksi), **Manajemen Artikel & CMS** (Medium-style WYSIWYG editor, banner MinIO, floating toolbar, auto-growth title), **Direktori Pelanggan**, **Manajemen Staff** (Toggle status aktif/non-aktif & self-deactivation protection), **Pengaturan Outlet & Peta Maps**, serta **Sistem Toast Global** dan **Confirmation Modal**.
- **`packages/shared-types`**: Paket tipe TypeScript bersama (entitas domain, model DTO, enum status).
- **`docs/`**: Dokumentasi resmi proyek:
  - [01-BRD.md](./docs/01-BRD.md) — Business Requirements Document
  - [02-PRD.md](./docs/02-PRD.md) — Product Requirements Document
  - [03-TSD.md](./docs/03-TSD.md) — Technical Specifications Document
  - [04-DEVELOPER-AND-AI-HANDOVER-GUIDE.md](./docs/04-DEVELOPER-AND-AI-HANDOVER-GUIDE.md) — Developer & AI Handover Guide (Arsitektur, CMS Tiptap, MinIO Image Paste & Map Integration)
  - [docs/issues/](./docs/issues/README.md) — Backlog Roadmap & Task Issues (#01 s/d #13 Selesai, #14 Backlog)

---

## Standar Desain Visual (BuildWithAngga / BWA)

Semua halaman berpedoman pada token desain `index.html`:
- **Font**: `Poppins`, sans-serif
- **Warna Brand**: `#4343E6` (Brand 600), `#5B5BF7` (Brand 500), `#EFEFFF` (Brand 50)
- **Teks**: `#0F0F3D` (Ink), `#6B6B8D` (Ink Soft)
- **Aksen**: `#FFC93C` (Sun Yellow), `#3DDC97` (Mint Green)
- **Bentuk**: `rounded-2xl`, `rounded-3xl`, `rounded-full` (Pill button)
- **Bayangan**: `shadow-card`, `shadow-soft`

---

## Pola Arsitektur: Clean Architecture + Feature-Based

Setiap fitur dalam `apps/web-customer/features` dan `apps/admin-dashboard/src/features` disusun menjadi:
```
features/<feature-name>/
├── models/         # Interface data, TypeScript types, DTOs
├── repositories/   # Pemanggilan API (ofetch / axios), mapping data
├── providers/      # State management (Composables di Nuxt / Zustand di React)
├── components/     # Komponen UI spesifik fitur ini
└── pages/          # Entrypoint halaman
```

---

## Cara Menjalankan Proyek Secara Lokal

1. **Prasyarat**:
   - Node.js >= 18 (Rekomendasi v20+)
   - pnpm >= 9 (`npm install -g pnpm`)

2. **Instalasi Dependensi**:
   ```bash
   pnpm install
   ```

3. **Menjalankan Dev Server**:
   - Jalankan semua aplikasi secara bersamaan:
     ```bash
     pnpm dev
     ```
   - Hanya jalankan Web Customer (Nuxt 3):
     ```bash
     pnpm dev:customer
     # Terbuka di http://localhost:3000
     ```
   - Hanya jalankan Admin Dashboard (React Vite):
     ```bash
     pnpm dev:admin
     # Terbuka di http://localhost:5173
     ```
