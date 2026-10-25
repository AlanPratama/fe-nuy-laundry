# Issue #14: Proteksi dan Penanganan User Login di Tabel Halaman Staff

## Deskripsi Tugas (High-Level)

Pada halaman manajemen staff (`apps/admin-dashboard/src/features/settings/pages/StaffPage.tsx`), seluruh akun staf dan admin ditampilkan dalam tabel. Saat ini, pengguna yang sedang login (terautentikasi) dapat melihat akunnya sendiri di dalam daftar baris tabel staf.

Terdapat kebutuhan bisnis dan keamanan (*defensive UI*) untuk memberikan proteksi dan indikator visual khusus terhadap baris akun pengguna yang sedang login saat ini (*authenticated current user*), guna mencegah kesalahan fatal seperti:
1. **Self-Lockout**: Pengguna yang sedang login menonaktifkan status keaktifan akunnya sendiri (`isActive: false`), sehingga langsung terkunci keluar (*locked out*) dari sistem.
2. **Self-Deletion**: Pengguna yang sedang login menghapus akunnya sendiri secara tidak sengaja.
3. **Self-Role Demotion**: Pengguna `SUPER_ADMIN` atau `ADMIN` menurunkan hak aksesnya sendiri menjadi `STAFF`.

---

## Spesifikasi Kebutuhan & Solusi Visual

### 1. Indikator Akun Sedang Login (*Current User Badge*)
- Pada tabel data staf, baris yang sesuai dengan `user.id` yang sedang login wajib memiliki badge penanda:
  - Label: **"Anda (Sedang Login)"** atau badge pill `bg-brand-50 text-brand-600 font-bold`.
  - Warna baris sedikit berbeda atau memiliki aksen visual halus agar mudah dikenali.

### 2. Pencegahan Non-Aktif Akun Sendiri (*Prevent Self-Deactivation*)
- Toggle switch / tombol ubah status aktif/non-aktif pada baris akun yang sedang login harus **dinonaktifkan (disabled)**.
- Saat tombol di-hover, tampilkan tooltip informatif:
  *"Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login."*

### 3. Pencegahan Penghapusan Akun Sendiri (*Prevent Self-Deletion*)
- Tombol aksi hapus (*delete button*) pada baris akun yang sedang login wajib disembunyikan (*hidden*) atau dinonaktifkan (*disabled*).
- Menampilkan pesan konfirmasi penolakan jika ada upaya penghapusan.

### 4. Sinkronisasi Profil & State Akun
- Jika pengguna mengedit data profilnya sendiri (nama, telepon, foto profil), Zustand store `useAuthStore` dan cache lokal (`localStorage`) wajib langsung tersinkronisasi secara otomatis tanpa memerlukan logout atau refresh manual.

---

## File & Komponen Terkait

| Berkas / Path | Deskripsi Implementasi |
| :--- | :--- |
| `apps/admin-dashboard/src/features/settings/pages/StaffPage.tsx` | Halaman utama data staf; menambahkan deteksi `currentUser.id === staff.id`. |
| `apps/admin-dashboard/src/features/settings/components/StaffTable.tsx` | Tabel staf dengan badge "Anda" dan disable toggle `isActive` pada akun sendiri. |
| `apps/admin-dashboard/src/features/auth/providers/useAuthStore.ts` | Sinkronisasi data user aktif saat ada pembaruan profil pengguna. |

---

## Kriteria Penerimaan (Acceptance Criteria)

- [x] **Badge Identitas**: Baris tabel staf milik akun yang sedang login menampilkan badge jelas *"Anda (Sedang Login)"* atau *"Akun Anda"*.
- [x] **Proteksi Deaktivasi**: Toggle status aktif (`isActive`) pada baris akun sendiri dinonaktifkan (*disabled*) dengan tooltip peringatan *"Tidak dapat menonaktifkan akun sendiri"*.
- [x] **Proteksi Hapus**: Tombol hapus pada baris akun sendiri dinonaktifkan atau disembunyikan (*hidden* saat `isSelf`).
- [x] **Sinkronisasi Otomatis**: Perubahan profil user yang sedang login langsung tercermin pada navbar, avatar, dan state auth tanpa perlu reload halaman.
