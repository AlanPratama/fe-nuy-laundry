# Issue #13: Fitur Manajemen Artikel & Tips Laundry (Role-Based Access: Super Admin & Admin Only)

## Deskripsi Tugas (High-Level)

Fitur Artikel & Edukasi Laundry bertujuan menyediakan Content Management System (CMS) terintegrasi pada Admin Dashboard (`apps/admin-dashboard`) untuk mengelola konten artikel, tips perawatan pakaian, panduan bahan, dan informasi promo. Konten yang diterbitkan akan ditampilkan secara publik pada Web Customer (`apps/web-customer`).

### Aturan Otorisasi Khusus (Role-Based Access Control / RBAC):

1. **SUPER_ADMIN & ADMIN**:
   - Memiliki wewenang penuh (CRUD): Membuat artikel baru, mengunggah thumbnail/cover artikel ke MinIO, memperbarui judul/konten/kategori, mengubah status publikasi (_Draft_ / _Published_), dan menghapus artikel.
2. **STAFF (Kasir)**:
   - Hanya memiliki izin baca (_read-only_): Dapat melihat daftar artikel dan membaca detail pratinjau (_preview_) artikel.
   - **Dilarang keras** melakukan mutasi data: Tombol "Tambah Artikel", "Edit", "Hapus", dan toggle status publikasi wajib disembunyikan atau dinonaktifkan untuk role `STAFF`.
3. **PUBLIC (Web Customer)**:
   - Hanya dapat membaca artikel yang berstatus _Published_ melalui portal publik `apps/web-customer`.

---

## Spesifikasi Teknis & Skema Data

### 1. Model Entitas & Basis Data (`be-nuy-laundry`)

Tabel baru: `articles`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) | Primary Key (UUIDv4) |
| `title` | VARCHAR(255) | Judul artikel (Wajib, unik) |
| `slug` | VARCHAR(255) | URL-friendly slug (Wajib, unik, auto-generate dari judul) |
| `category` | VARCHAR(50) | Enum / String: `'TIPS_PERAWATAN'`, `'PANDUAN_BAHAN'`, `'INFO_PROMO'`, `'INFO MENARIK'` |
| `excerpt` | VARCHAR(500) | Ringkasan singkat artikel untuk preview card |
| `content` | TEXT | Isi lengkap artikel (HTML / Markdown terformat) |
| `reading_time` | VARCHAR(50) | Estimasi waktu baca (misal: "4 menit baca") |
| `thumbnail_url` | VARCHAR(500) | URL foto sampul artikel (tersimpan di MinIO bucket `articles`) |
| `is_published` | BOOLEAN | Status rilis (`true`: Published, `false`: Draft) |
| `author_id` | VARCHAR(36) | Foreign Key ke tabel `users.id` (pencipta artikel) |
| `published_at` | TIMESTAMP | Tanggal dan waktu publikasi |
| `created_at` | TIMESTAMP | Waktu pembuatan (auto) |
| `updated_at` | TIMESTAMP | Waktu modifikasi terakhir (auto) |

---

## Rincian Perubahan & File yang Terlibat

### 1. Backend Java Spring Boot (`be-nuy-laundry`)

| Berkas / Layer                                                            | Deskripsi Implementasi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `domain/models/Article.java`                                              | Domain entity untuk Artikel dengan business logic validasi slug & kategori.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `infrastructure/internal/database/entities/ArticleEntity.java`            | JPA Entity pemetaan ke tabel PostgreSQL/H2 `articles`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `infrastructure/internal/database/repositories/ArticleJpaRepository.java` | Spring Data JPA Repository (query paging, pencarian `title`, filter `category`, dan `isPublished`).                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `presentation/dtos/request/article/ArticleCreateRequestDTO.java`          | Request DTO: `title`, `category`, `excerpt`, `content`, `isPublished`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `presentation/dtos/request/article/ArticleUpdateRequestDTO.java`          | Request DTO: `title`, `category`, `excerpt`, `content`, `isPublished`, `removeThumbnail`.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `presentation/dtos/response/article/ArticleResponseDTO.java`              | Response DTO lengkap termasuk data author dan formatted date.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `application/ports/in/ArticleUseCase.java`                                | Inbound port: `getAllArticles`, `getArticleById`, `getArticleBySlug`, `createArticle`, `updateArticle`, `deleteArticle`, `togglePublishStatus`.                                                                                                                                                                                                                                                                                                                                                                                       |
| `application/services/ArticleServiceImpl.java`                            | Implementasi use case, upload thumbnail MinIO, dan slug generation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `presentation/controllers/ArticleController.java`                         | REST Controller (`/api/v1/articles`):<br>- `GET /api/v1/articles` (PermitAll / Authenticated)<br>- `GET /api/v1/articles/{idOrSlug}` (PermitAll)<br>- `POST /api/v1/articles` (**@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")**)<br>- `PUT /api/v1/articles/{id}` (**@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")**)<br>- `DELETE /api/v1/articles/{id}` (**@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")**)<br>- `PATCH /api/v1/articles/{id}/publish` (**@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")**) |

### 2. Frontend Admin Dashboard (`apps/admin-dashboard`)

| Berkas / Path                                         | Deskripsi Implementasi                                                                                                                 |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `features/articles/models/ArticleModel.ts`            | Interface TypeScript: `ArticleItem`, `ArticleDetail`, `CreateArticlePayload`, `UpdateArticlePayload`, `ArticleCategory`.               |
| `features/articles/repositories/ArticleRepository.ts` | Repository integrasi Axios (`/api/v1/articles`) dengan multipart file upload.                                                          |
| `features/articles/providers/useArticleStore.ts`      | Zustand store untuk state daftar artikel, active filter (kategori, search, status publikasi), dan pagination.                          |
| `features/articles/components/ArticleTable.tsx`       | Tabel daftar artikel (judul, thumbnail, kategori badge, waktu baca, status draft/published, dan aksi).                                 |
| `features/articles/components/ArticleCard.tsx`        | Tampilan mode grid card artikel responsif.                                                                                             |
| `features/articles/components/MediumEditor.tsx`       | Medium-style WYSIWYG editor menggunakan Tiptap (headings, lists, blockquote, link, code block, toolbar mengambang).                   |
| `features/articles/pages/ArticleEditorPage.tsx`       | Halaman terpisah khusus penulisan & penyuntingan artikel ala Medium (`/articles/create` dan `/articles/edit/:id`).                      |
| `features/articles/components/ArticleDetailModal.tsx` | Pratinjau artikel (dapat diakses oleh Staff & Admin) dengan render tipografi Medium.                                                   |
| `features/articles/pages/ArticlesPage.tsx`            | Halaman utama manajemen artikel dengan sinkronisasi URL search params, filter status CustomSelect, dan navigasi ke halaman editor.      |
| `components/layout/AdminLayout.tsx`                   | Menambahkan menu "Artikel" di sidebar desktop & mobile dengan icon `BookOpen` / `FileText`.                                            |
| `App.tsx`                                             | Mendaftarkan route `/articles`, `/articles/create`, dan `/articles/edit/:id` di dalam `ProtectedRoute`.                               |

### 3. Frontend Web Customer (`apps/web-customer`)

| Berkas / Path                                         | Deskripsi Implementasi                                                                                   |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `features/articles/repositories/ArticleRepository.ts` | Mengganti mock static array dengan pemanggilan live API backend `GET /api/v1/articles?isPublished=true`. |
| `features/articles/pages/ArticlesListPage.vue`        | Menampilkan artikel terbit dengan filter kategori & search bar.                                          |
| `features/articles/pages/ArticleDetailPage.vue`       | Menampilkan konten artikel lengkap sesuai `slug`.                                                        |

---

## Kriteria Penerimaan & Verifikasi (Acceptance Criteria)

- [x] **RBAC Super Admin & Admin**: Super Admin dan Admin dapat membuat artikel baru, mengunggah thumbnail, mengubah konten, mengubah status publikasi, dan menghapus artikel.
- [x] **RBAC Staff Read-Only**: Pengguna ber-role `STAFF` dapat membuka halaman `/articles`, membaca detail artikel, namun tombol "Tambah Artikel", "Edit", "Hapus", dan toggle status disembunyikan/dilarang.
- [x] **Backend Authorization Enforcement**: Request `POST`, `PUT`, `DELETE`, `PATCH` ke `/api/v1/articles` dari token ber-role `STAFF` wajib menghasilkan status HTTP `403 Forbidden`.
- [x] **Penyimpanan Gambar MinIO**: Foto thumbnail artikel tersimpan aman di object storage MinIO dan dapat dihapus/diperbarui dengan benar.
- [x] **Integrasi Web Customer**: Halaman blog web customer (`apps/web-customer/pages/articles`) otomatis menampilkan artikel live yang dipublikasikan dari Admin Dashboard.
- [x] **Konsistensi Desain**: Komponen tabel, modal, dan badge mengikuti standar desain BWA (warna `brand-600`, font `Poppins`, `rounded-2xl`/`rounded-3xl`, soft shadows).
- [x] **Medium-Style WYSIWYG Editor di Page Terpisah**: Penulisan dan pengeditan artikel berada di halaman penuh tersendiri (`/articles/create` dan `/articles/edit/:id`) dengan kanvas bersih ala Medium, auto-resize title, cover banner upload, Tiptap formatting toolbar, estimasi waktu baca otomatis, dan live word/character count.
- [x] **CustomSelect Filter Status**: Filter status artikel pada halaman `/articles` menggunakan komponen `CustomSelect` terpadu ("Semua Status", "Diterbitkan", "Draf").

