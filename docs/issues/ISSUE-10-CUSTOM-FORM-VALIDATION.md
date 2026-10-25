# Issue #10: Sistem Validasi Form Interaktif & Pesan Error Kustom

## Deskripsi Tugas (High-Level)
Saat ini validasi form pada modal-modal di dashboard admin masih mengandalkan atribut bawaan browser seperti `required`, `min`, atau `type="number"`. Pola bawaan ini memiliki beberapa kekurangan:
1. Menghasilkan *tooltip bubble* default browser yang kaku, letaknya sering kali menghalangi input lain, dan bahasanya tergantung konfigurasi bahasa sistem operasi pengguna.
2. Tidak dapat memvalidasi aturan bisnis laundry yang spesifik (contoh: nomor telepon minimal 9 digit, berat cucian harus lebih dari 0 kg, harga paket minimal Rp1.000, panjang kata sandi staff minimal 6 karakter).
3. Pengalaman pengguna (*UX*) kurang ramah karena error tidak langsung terlihat saat mengetik.

Tugas pada issue ini adalah membuat sistem **Validasi Form Kustom yang Ringan & Interaktif** tanpa menggunakan library yang *overkill*, dengan pesan error visual yang rapi tepat di bawah masing-masing kolom input.

---

## Kebutuhan Tampilan & UX Validasi

1. **Gaya Visual Field Error (BWA Style)**:
   - Input yang sedang tidak valid memiliki border berwarna merah lembut (`border-rose-400 focus:border-rose-500 bg-rose-50/20`).
   - Teks pesan error muncul tepat di bawah input dengan ukuran kecil dan jelas:
     `text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1` (dapat ditambahkan ikon kecil peringatan bulat).

2. **Waktu Pemunculan Pesan Error (Interactive Lifecycle)**:
   - **On Blur / Touched**: Pesan error hanya muncul setelah pengguna selesai mengklik dan berpindah dari field tersebut (*touched*), agar tidak langsung mengganggu pengguna dengan warna merah saat baru membuka modal.
   - **On Submit**: Jika tombol submit/simpan ditekan sementara masih ada field yang kosong atau tidak valid, seluruh field yang bermasalah langsung disorot dan tombol submit dicegah untuk memproses data.

3. **Daftar Form yang Wajib Dimigrasi ke Validasi Kustom**:
   - **Form Tambah Transaksi Baru (`NewTransactionModal.tsx`)**:
     - Nama Pelanggan: Wajib diisi, minimal 2 karakter.
     - Nomor Telepon: Format valid, minimal 9 digit.
     - Pilihan Paket: Wajib memilih salah satu paket.
     - Jumlah / Berat: Harus lebih besar dari 0.
   - **Form Tambah/Edit Paket Laundry (`PackageFormModal.tsx`)**:
     - Nama Paket: Wajib diisi, minimal 3 karakter.
     - Harga Satuan: Minimal Rp500.
     - Estimasi Waktu: Minimal 1 jam.
   - **Form Tambah Staff Kasir (`AddStaffModal.tsx`)**:
     - Username: Minimal 4 karakter, huruf kecil dan angka saja.
     - Nama Lengkap: Wajib diisi.
     - Password: Minimal 6 karakter.
   - **Form Profil Outlet (`OutletProfileForm.tsx`)**:
     - Nama Toko & Alamat: Wajib diisi.
     - Nomor WhatsApp Toko: Minimal 10 digit.

---

## Struktur File yang Dibuat / Dimodifikasi

```
apps/admin-dashboard/src/
├── shared/
│   └── utils/
│       └── validators.ts              # Fungsi validator murni (isPhone, minLength, isPositiveNumber)
├── components/ui/
│   ├── FormField.tsx                  # Wrapper input dengan label dan pesan error kustom
│   └── InputErrorMessage.tsx          # Komponen visual teks error merah
├── features/transactions/components/NewTransactionModal.tsx
├── features/packages/components/PackageFormModal.tsx
├── features/settings/components/AddStaffModal.tsx
└── features/settings/components/OutletProfileForm.tsx
```

---

## Contoh Pola Validasi Sederhana

```typescript
// Contoh implementasi state validasi ringan di level modal
const [errors, setErrors] = useState<Record<string, string>>({})
const [touched, setTouched] = useState<Record<string, boolean>>({})

const validate = () => {
  const errs: Record<string, string> = {}
  if (!customerName.trim()) {
    errs.customerName = 'Nama pelanggan wajib diisi.'
  }
  if (!phone || phone.replace(/\D/g, '').length < 9) {
    errs.phone = 'Nomor telepon tidak valid (minimal 9 digit angka).'
  }
  if (quantity <= 0) {
    errs.quantity = 'Berat atau jumlah pakaian harus lebih dari 0.'
  }
  return errs
}
```

---

## Kriteria Penerimaan (Acceptance Criteria)

- [ ] Tidak ada lagi kemunculan tooltip bubble bawaan browser (`required`) saat form gagal divalidasi.
- [ ] Field yang tidak valid ditandai dengan border merah dan pesan penjelasan bahasa Indonesia di bawahnya.
- [ ] Tombol simpan/submit tidak dapat mengirimkan data jika ada input yang belum memenuhi kriteria validasi.
- [ ] Pesan error otomatis hilang saat pengguna mulai mengetik nilai yang valid.
- [ ] Penanganan validasi konsisten di seluruh modal input transaksi, paket, staff, dan profil outlet.
- [ ] Kode bersih, terstruktur, dan tidak menimbulkan error TypeScript.
