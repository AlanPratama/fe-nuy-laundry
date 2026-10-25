# Technical Specifications Document (TSD)
## Nuy Laundry — Frontend Monorepo Architecture

---

### 1. Ringkasan Arsitektur & Teknologi

Frontend Nuy Laundry diatur dalam arsitektur **Monorepo (pnpm workspaces)** untuk mempermudah pengelolaan dependensi bersama, tipe data, dan konsistensi kode:

```
fe-nuy-laundry/
├── apps/
│   ├── web-customer/      # Nuxt 3 (Vue 3, SSR/SSG, Customer Facing)
│   └── admin-dashboard/   # React (Vite, SPA, Internal Operations)
├── packages/
│   └── shared-types/      # TypeScript interfaces, DTOs & API Contracts
├── docs/                  # BRD, PRD, dan TSD panduan proyek
├── package.json           # Root monorepo scripts & dependencies
├── pnpm-workspace.yaml    # Workspaces declaration
└── tsconfig.base.json     # Base TypeScript compiler options
```

#### Komponen Stack Teknologi
- **Package Manager**: `pnpm` (Fast, disk-efficient, strict isolation).
- **Web Customer**: **Nuxt 3** (Vue 3, TypeScript). Menggunakan rendering SSR/SSG untuk optimasi SEO, metadata OpenGraph, dan loading instan.
- **Admin Dashboard**: **React 18/19 + Vite** (TypeScript). Single Page Application (SPA) yang sangat cepat untuk kasir/staff.
- **Styling**: **Tailwind CSS v3.4.17** pada kedua aplikasi dengan token desain identik turunan dari `index.html`.
- **State Management (Ringan & Zero Overkill)**:
  - Nuxt 3: Menggunakan **Vue 3 Composables & `useState`** (fitur bawaan Nuxt tanpa library eksternal berlebih).
  - React Vite: Menggunakan **Zustand** (store sederhana berbasis hook, ukuran < 2KB, tanpa boilerplate Redux).

---

### 2. Pola Arsitektur: Feature-Based + Clean Architecture

Kedua aplikasi (`web-customer` dan `admin-dashboard`) mengadopsi struktur direktori **Feature-Based** yang dipadukan dengan prinsip **Clean Architecture**:

```
features/<feature-name>/
├── models/         # 1. Definisi entitas, interface data, dan tipe DTO
├── repositories/   # 2. Layer akses data (API calls, HTTP fetchers, mock fallback)
├── providers/      # 3. Layer state management (Composables di Nuxt / Zustand hooks di React)
├── components/     # 4. Komponen presentasi UI khusus fitur ini
└── pages/          # 5. Halaman utama (atau integrasi langsung ke pages routing)
```

#### Penjelasan Tanggung Jawab Layer (Clean Architecture)
1. **`models/` (Domain Layer)**:
   - Mendefinisikan bentuk data bisnis murni tanpa ketergantungan pada UI atau framework.
   - Contoh: `TransactionModel.ts`, `PackageModel.ts`, `ArticleModel.ts`.
2. **`repositories/` (Data Source Layer)**:
   - Bertanggung jawab melakukan komunikasi HTTP ke backend API.
   - Memetakan respon backend (`ApiResponse<T>`) ke entitas model frontend.
   - Contoh: `TransactionRepository.ts` memiliki method `trackByInvoice(id: string)`, `getAll(page, size)`.
3. **`providers/` (State / Use-Case Layer)**:
   - Menyediakan state reaktif dan logic aksi (loading, error, data caching).
   - Di Nuxt: berupa Composable seperti `useTrackingProvider.ts` atau `useArticlesProvider.ts`.
   - Di React: berupa Zustand store seperti `useTransactionStore.ts` atau `useAuthStore.ts`.
4. **`components/` (Presentation Layer)**:
   - Komponen UI murni bergaya BWA yang hanya menerima props dan memancarkan events, atau membaca state dari provider.

---

### 3. Konfigurasi Desain Sistem Tailwind (BWA Tokens)

Setiap aplikasi mengkonfigurasi `tailwind.config.js` dengan token yang diambil persis dari `index.html`:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.vue',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './features/**/*.{vue,js,ts,jsx,tsx}',
    './app.vue',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFEFFF',
          100: '#E1E1FF',
          200: '#C6C6FF',
          300: '#9F9FFF',
          500: '#5B5BF7',
          600: '#4343E6', // Warna Utama
          700: '#3434C2',
        },
        ink: {
          DEFAULT: '#0F0F3D',
          soft: '#6B6B8D',
        },
        sun: '#FFC93C',
        mint: '#3DDC97',
      },
      boxShadow: {
        soft: '0 20px 50px -20px rgba(67, 67, 230, 0.35)',
        card: '0 10px 40px -15px rgba(15, 15, 61, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
```

---

### 4. Kontrak Integrasi Backend API (Spring Boot Ground Truths)

Junior developer atau model AI wajib mengacu pada format standar dari backend Java Spring Boot:

#### A. Amplop Respon Standar (API Response Envelope)
Semua endpoint backend membungkus data dalam format:
```typescript
export interface ApiResponse<T> {
  status: 'SUCCESS' | 'FAILED';
  message: string;
  timestamp: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

#### B. Status Transaksi & Enum
Status transaksi hanya memiliki 3 nilai:
```typescript
export type TransactionStatus = 'IN_PROGRESS' | 'DONE' | 'CANCELED';
export type PackageType = 'WEIGHT' | 'PCS';
```

#### C. Endpoint Transaksi
1. **Public Tracking (Web Customer)**:
   - Endpoint: `GET /api/v1/transactions/{id}`
   - Respon: `ApiResponse<TransactionResponseDTO>`
   - Tidak memerlukan header Authorization.
2. **Admin List Transaksi**:
   - Endpoint: `GET /api/v1/transactions?page=0&size=10&sortBy=createdAt&direction=desc&name={search}`
   - Header: `Authorization: Bearer <accessToken>`
   - Respon: `ApiResponse<PageResponse<TransactionResponseDTO>>`
3. **Admin Buat Transaksi Baru**:
   - Endpoint: `POST /api/v1/transactions` (Multipart Form Data)
   - Bagian request:
     - `request`: JSON `TransactionRequestDTO`
     - `conditionBeforeFiles`: Array file gambar kondisi awal
     - `paymentReceiptFile`: File gambar bukti pembayaran
4. **Admin Update Status Transaksi**:
   - Endpoint: `PUT /api/v1/transactions/{id}`
   - Body: `TransactionRequestDTO`

#### D. Endpoint Autentikasi (Admin)
- Endpoint: `POST /api/v1/auth/login`
- Body:
  ```json
  {
    "username": "admin",
    "password": "password123",
    "deviceInfo": "Admin-Browser-Vite"
  }
  ```
- Respon `data`:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "deviceInfo": "Admin-Browser-Vite"
  }
  ```

---

### 5. Struktur Folder Detail per Aplikasi

#### A. `apps/web-customer` (Nuxt 3)
```
apps/web-customer/
├── assets/
│   └── css/
│       └── main.css              # Font Poppins import & Tailwind directives
├── components/
│   ├── layout/
│   │   ├── Navbar.vue            # Navbar BWA dengan logo & links
│   │   └── Footer.vue            # Footer lengkap Nuy Laundry
│   └── ui/
│       ├── Button.vue            # Pill buttons
│       └── Badge.vue             # Status pills
├── features/
│   ├── landing/                  # Fitur Beranda (Diadaptasi dari index.html)
│   │   ├── components/
│   │   │   ├── HeroSection.vue   # Animasi mesin cuci interaktif
│   │   │   ├── ServicesSection.vue
│   │   │   ├── WhyUsSection.vue
│   │   │   ├── StepsSection.vue
│   │   │   ├── PricingSection.vue
│   │   │   ├── TestimonialsSection.vue
│   │   │   ├── FaqSection.vue
│   │   │   └── CtaSection.vue
│   │   └── pages/
│   │       └── LandingPage.vue
│   ├── tracking/                 # Fitur Cek Status Transaksi
│   │   ├── models/
│   │   │   └── TrackingModel.ts
│   │   ├── repositories/
│   │   │   └── TrackingRepository.ts
│   │   ├── providers/
│   │   │   └── useTrackingProvider.ts
│   │   ├── components/
│   │   │   ├── TrackingSearchBar.vue
│   │   │   ├── TrackingTimeline.vue
│   │   │   └── TrackingDetailCard.vue
│   │   └── pages/
│   │       └── TrackingPage.vue
│   └── articles/                 # Fitur Artikel & Edukasi
│       ├── models/
│       │   └── ArticleModel.ts
│       ├── repositories/
│       │   └── ArticleRepository.ts
│       ├── providers/
│       │   └── useArticlesProvider.ts
│       ├── components/
│       │   ├── ArticleCard.vue
│       │   └── ArticleDetail.vue
│       └── pages/
│           ├── ArticlesListPage.vue
│           └── ArticleDetailPage.vue
├── pages/
│   ├── index.vue                 # Menampilkan LandingPage
│   ├── tracking.vue              # Menampilkan TrackingPage
│   └── articles/
│       ├── index.vue             # Menampilkan ArticlesListPage
│       └── [slug].vue            # Menampilkan ArticleDetailPage
├── nuxt.config.ts
├── tailwind.config.js
└── package.json
```

#### B. `apps/admin-dashboard` (React Vite)
```
apps/admin-dashboard/
├── src/
│   ├── assets/
│   │   └── index.css                 # Tailwind imports, font Poppins, & BWA utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx       # Root wrapper (fixed desktop sidebar + lg:pl-64)
│   │   │   ├── AdminSidebar.tsx      # Sidebar navigasi & active route indicator
│   │   │   └── AdminTopbar.tsx       # Topbar profil, role badge & mobile hamburger
│   │   └── ui/
│   │       ├── Toast.tsx             # Global ToastProvider & useToast() hook
│   │       ├── Pagination.tsx        # Standard server-side pagination bar
│   │       ├── Modal.tsx             # Accessible backdrop & dialog container
│   │       ├── ConfirmationModal.tsx # Protective destructive action confirmation dialog
│   │       ├── SearchableSelect.tsx  # Combobox search & select dropdown
│   │       ├── PhoneInput.tsx        # Sanitized Indonesian phone input (+62 / 08xx)
│   │       ├── CurrencyInput.tsx     # Indonesian Rupiah currency masked input
│   │       ├── CustomSelect.tsx      # Custom dropdown select with BWA styling
│   │       ├── Card.tsx              # Elevated container with shadow-card
│   │       ├── Button.tsx            # BWA pill buttons with variant styling
│   │       ├── Badge.tsx             # Semantic status pills
│   │       └── Table.tsx             # Consistent table frame with py-4 px-6 cell padding
│   ├── features/
│   │   ├── auth/                     # models, repositories, providers (useAuthStore), LoginPage.tsx
│   │   ├── dashboard/                # models, repositories, providers (useDashboardStore), DashboardPage.tsx
│   │   ├── transactions/             # models, repositories, providers (useTransactionStore),
│   │   │                             # NewTransactionModal.tsx, TransactionDetailModal.tsx, TransactionsPage.tsx
│   │   ├── packages/                 # models, repositories, providers (usePackageStore),
│   │   │                             # PackageCard.tsx, PackageTable.tsx, PackageModal.tsx, PackageDetailModal.tsx, PackagesPage.tsx
│   │   ├── customers/                # models, repositories, providers (useCustomerStore),
│   │   │                             # CustomerTable.tsx, CustomerModal.tsx, CustomersPage.tsx
│   │   ├── staff/                    # models, repositories, providers (useStaffStore),
│   │   │                             # StaffTable.tsx (with active toggle switch), StaffModal.tsx, StaffPage.tsx
│   │   ├── articles/                 # models, repositories, providers (useArticleStore),
│   │   │                             # MediumEditor.tsx, ArticleEditorPage.tsx, ArticlesPage.tsx
│   │   └── settings/                 # models, repositories, providers (useSettingsStore), SettingsPage.tsx
│   ├── App.tsx                       # React Router provider wrapped in ToastProvider
│   └── main.tsx                      # Vite React entrypoint
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

### 6. Pola & Standar Implementasi Teknis Lanjutan

#### 6.1. Sistem Notifikasi Toast Global (`Toast.tsx`)
Aplikasi mengadopsi pola **React Context Provider** ringan tanpa library pihak ketiga:
```typescript
// Penggunaan di komponen fitur:
const { addToast } = useToast();

// Trigger notifikasi sukses:
addToast('success', 'Berhasil', 'Status pesanan berhasil diperbarui');

// Trigger notifikasi error:
addToast('error', 'Gagal', 'Terjadi kesalahan saat memproses data');
```
- Diletakkan di level tertinggi pada `App.tsx` (`<ToastProvider>`).
- Auto-dismiss otomatis dalam **3.5 detik** dengan opsi *manual close button*.
- Posisi mengambang (*fixed*) di `top-5 right-5 z-50` dengan efek transisi slide-in lembut.

#### 6.2. Sinkronisasi State Pencarian & Filter dengan URL Search Parameters
Seluruh halaman direktori (`TransactionsPage`, `CustomersPage`, `PackagesPage`, `StaffPage`, `ArticlesPage`) mengikat filter pencarian langsung ke query string browser via `useSearchParams` dari `react-router-dom`:
- Menggunakan hook debounce internal (**400ms**) sebelum memodifikasi URL (`setSearchParams(..., { replace: true })`).
- Pengguna dapat me-refresh browser atau membagikan link URL tanpa kehilangan filter pencarian aktif (`?q=budi&status=PUBLISHED`).
- Mengatur ulang halaman kembali ke `page=0` setiap kali query pencarian berubah.

#### 6.3. Integrasi Unggah Berkas Transaksi & Multipart Storage MinIO
Pengunggahan foto kondisi cucian (`CONDITION_BEFORE` dan `CONDITION_AFTER`) diintegrasikan langsung ke backend Spring Boot:
- Endpoint: `POST /api/v1/transaction-files`.
- Menggunakan `FormData` multipart dengan dua bagian:
  1. JSON blob `'request'`: `new Blob([JSON.stringify({ transactionId })], { type: 'application/json' })`.
  2. File array: `'conditionBeforeFiles'` dan `'conditionAfterFiles'`.
- Respon backend mengembalikan path berkas MinIO yang disimpan dalam state transaksi dan dapat dipratinjau langsung di modal detail.

#### 6.4. Tata Letak Sidebar Desktop Fixed Sticky
Untuk mengatasi bug tampilan sidebar berantakan saat konten tabel panjang di-scroll:
- Elemen `<aside>` desktop diberi kelas `fixed inset-y-0 left-0 w-64 z-30` sehingga selalu terkunci pada viewport.
- Konten utama dibungkus dalam container `<div className="lg:pl-64 flex flex-col flex-1 min-h-screen">` sehingga margin kiri tepat mengimbangi lebar sidebar tanpa risiko pergeseran layout (*layout shift*).

#### 6.5. Arsitektur Editor WYSIWYG Medium-Style & Integrasi MinIO (`MediumEditor.tsx`)
Editor konten artikel dibangun berbasis Tiptap headless core dengan ekstensi kustom:
- **Heading Dropdown**: Mendukung seleksi hirarki Paragraph, H1 hingga H6 dengan sinkronisasi reaktif posisi kursor editor.
- **Link Extension & Shortcut `Mod-k`**: Ekstensi link Tiptap diperluas untuk mendengarkan tombol keyboard `Mod-k` (`Cmd+K` di Mac, `Ctrl+K` di Windows/Linux) yang membuka modal kustom link, menghindari penggunaan `window.prompt` yang invasif.
- **Direct Clipboard Paste & Drag-and-Drop Image**:
  - `editor.view.dom.addEventListener('paste', ...)` menangani event paste file gambar langsung dari clipboard pengguna.
  - Gambar dikirim via `ArticleRepository.uploadImage(file)` ke `POST /api/v1/articles/upload-image`.
  - Jika server backend tidak dapat dihubungi, fallback otomatis menggunakan *Base64 Data URL* secara seamless.
- **Tooltip Interaktif**: Setiap tombol aksi toolbar dibungkus tooltip mengambang dengan durasi delay singkat untuk panduan hotkey bagi operator.

#### 6.6. Multi-Package per Transaksi & Uang Muka (Down Payment)
Struktur formulir transaksi kasir mengadopsi relasi one-to-many untuk paket layanan:
- Pengguna dapat menambahkan beberapa baris paket cucian sekaligus (kombinasi kiloan dan satuan).
- Kalkulasi otomatis `subtotal`, `downPayment` (uang muka), dan sisa pembayaran `remainingBalance`.
- Validasi status pembayaran: `UNPAID` (belum bayar), `DOWN_PAYMENT` (bayar panjar), `PAID` (lunas).

#### 6.7. Proteksi Self-Lockout pada Tabel Staff (ISSUE-14)
Untuk mencegah insiden operasional di mana administrator tanpa sengaja menonaktifkan akunnya sendiri:
- Komponen `StaffTable` membandingkan ID pengguna pada tiap baris dengan `currentUser.id` dari `useAuthStore`.
- Jika baris adalah akun yang sedang aktif:
  - Ditampilkan badge status **"Anda (Sedang Login)"**.
  - Toggle switch keaktifan (`isActive`) dinonaktifkan (`disabled`).
  - Tombol hapus disembunyikan.

---

### 7. Panduan Implementasi untuk Junior Dev / AI Agent

1. **Jaga Konsistensi UI BWA**: Selalu gunakan warna `brand-600` (`#4343E6`), `sun` (`#FFC93C`), font `Poppins`, sudut `rounded-2xl` / `rounded-3xl`, dan bayangan `shadow-card`. Jangan gunakan warna abu-abu default kusam atau font default browser.
2. **Kepatuhan Clean Architecture**: Jangan memanggil API secara langsung (hardcoded fetch) di dalam template komponen UI! Panggil melalui **Repository**, tampung ke dalam **Provider**, lalu konsumsi di komponen.
3. **Penanganan Error Elegan**: Setiap aksi jaringan harus memiliki state `loading`, `error`, dan `empty` yang divisualisasikan dengan ramah dan rapi.
4. **Mock Data Fallback**: Apabila server backend lokal Spring Boot belum menyala, repository harus dapat menyediakan fallback data mock realistis sehingga frontend tetap dapat didemokan secara interaktif.
5. **Umpan Balik Interaktif**: Selalu panggil `addToast('success', ...)` atau `addToast('error', ...)` pada setiap operasi mutasi data (Create, Update, Delete, Toggle Status) untuk memberikan kepastian feedback visual kepada operator.


