# Issue #08: Refaktor Pemanggilan API Menggunakan Axios & Interceptor Terpusat

## Deskripsi Tugas (High-Level)
Saat ini pemanggilan API backend di lapisan repositori (`repositories/`) masih menggunakan native browser `fetch()`. Pola ini menyebabkan banyak duplikasi kode:
1. Header `Authorization: Bearer <token>` dan `Content-Type: application/json` harus disetel manual di setiap fungsi repositori.
2. Penanganan konversi data dari respons amplop standar backend Java Spring Boot (`{ status: "SUCCESS", message: "...", data: T }`) belum terpusat.
3. Penanganan galat (*error handling*) dan autentikasi kedaluwarsa (HTTP 401 Unauthorized) belum ditangani secara global.

Tugas pada issue ini adalah memasang library **`axios`**, membuat instance HTTP Client terpusat lengkap dengan **Request & Response Interceptors**, serta merefaktor seluruh file repositori agar menggunakan instance Axios tersebut.

---

## Kebutuhan Fungsional & Arsitektur

1. **Instalasi Axios**:
   - Tambahkan paket `axios` pada `apps/admin-dashboard`.

2. **Pembuatan Centralized Axios Client (`apiClient.ts`)**:
   - Tentukan `baseURL` dari environment variable `import.meta.env.VITE_API_URL || 'http://localhost:8080'`.
   - **Request Interceptor**:
     - Membaca token autentikasi dari `localStorage.getItem('nuy_token')` atau store auth.
     - Menyematkan header `Authorization: Bearer <token>` secara otomatis pada setiap request keluar jika token tersedia.
     - Menyematkan header default `Content-Type: application/json` (otomatis disesuaikan browser jika payload berupa `FormData` untuk upload foto MinIO).
   - **Response Interceptor**:
     - Jika respons berhasil dan memiliki struktur amplop `{ data: T }`, kembalikan data langsung atau kembalikan respons terformat rapi.
     - Jika backend mengembalikan status `401 Unauthorized` (sesi login habis), bersihkan storage lokal dan arahkan pengguna ke halaman `/login`.
     - Tangani galat jaringan (*network error*) dengan pesan yang informatif.

3. **Refaktor Lapisan Repositori**:
   Gantikan seluruh penggunaan `fetch()` pada file-file berikut agar menggunakan `apiClient`:
   - `features/auth/repositories/AuthRepository.ts`
   - `features/transactions/repositories/TransactionRepository.ts`
   - `features/packages/repositories/PackageRepository.ts`
   - `features/customers/repositories/CustomerRepository.ts`
   - `features/settings/repositories/SettingsRepository.ts`
   - `features/dashboard/repositories/DashboardRepository.ts`

---

## Struktur File yang Harus Dibuat / Dimodifikasi

```
apps/admin-dashboard/src/
├── shared/
│   └── api/
│       └── apiClient.ts               # Instance Axios dengan Request/Response Interceptor
├── features/
│   ├── auth/repositories/AuthRepository.ts
│   ├── transactions/repositories/TransactionRepository.ts
│   ├── packages/repositories/PackageRepository.ts
│   ├── customers/repositories/CustomerRepository.ts
│   ├── settings/repositories/SettingsRepository.ts
│   └── dashboard/repositories/DashboardRepository.ts
```

---

## Contoh Pola Kode High-Level

```typescript
// apps/admin-dashboard/src/shared/api/apiClient.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nuy_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nuy_token')
      localStorage.removeItem('nuy_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Paket `axios` terpasang dan digunakan di seluruh repositori frontend admin.
- [ ] Tidak ada lagi pemanggilan `fetch()` mentah untuk endpoint API backend di layer repositori.
- [ ] Header Bearer token disisipkan otomatis oleh interceptor tanpa perlu ditulis berulang di setiap fungsi repositori.
- [ ] Respon 401 Unauthorized otomatis menghapus sesi login dan mengarahkan pengguna ke `/login`.
- [ ] Pengunggahan foto transaksi (`multipart/form-data`) tetap berfungsi dengan baik menggunakan Axios.
- [ ] Fallback mock data tetap aktif jika server backend Java Spring Boot offline saat pengembangan lokal.
- [ ] Build proyek lolos 100% tanpa error TypeScript (`pnpm --filter admin-dashboard build`).
