import React, { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../providers/useAuthStore'
import { apiClient } from '../../../shared/api/apiClient'
import { useToast } from '../../../components/ui/Toast'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { PhoneInput } from '../../../components/ui/PhoneInput'
import { X, Camera, Lock, User, Shield, Check, Save, Eye, EyeOff, Trash2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const UserProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Password update
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '')
      setUsername(user.username || '')
      setPhone(user.phone || '')
      setAddress(user.address || '')
      setPreviewImage(user.profilePicture ? resolveImageUrl(user.profilePicture) : null)
      setSelectedFile(null)
      setIsChangingPassword(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewImage(ev.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toastError('Nama lengkap tidak boleh kosong')
      return
    }
    if (!username.trim()) {
      toastError('Username tidak boleh kosong')
      return
    }

    if (isChangingPassword) {
      if (!oldPassword) {
        toastError('Password lama wajib diisi untuk mengganti password')
        return
      }
      if (newPassword.length < 8) {
        toastError('Password baru minimal 8 karakter')
        return
      }
      if (newPassword !== confirmPassword) {
        toastError('Konfirmasi password baru tidak cocok')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const removeProfilePicture = !previewImage && !selectedFile && Boolean(user.profilePicture)
      const requestPayload = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        role: user.role,
        removeProfilePicture
      }

      const formData = new FormData()
      formData.append(
        'request',
        new Blob([JSON.stringify(requestPayload)], { type: 'application/json' })
      )
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const updateRes = await apiClient.put(`/api/v1/users/${user.id}`, formData)
      let updatedUser = updateRes.data?.data || {
        ...user,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined
      }

      if (isChangingPassword && oldPassword && newPassword) {
        await apiClient.patch(`/api/v1/users/${user.id}`, {
          oldPassword,
          newPassword
        })
      }

      const finalProfilePicture = removeProfilePicture 
        ? undefined 
        : (updatedUser.profilePicture || (!selectedFile ? user.profilePicture : undefined))

      const newUserData = {
        ...user,
        name: updatedUser.name || name.trim(),
        username: updatedUser.username || username.trim().toLowerCase(),
        phone: updatedUser.phone !== undefined ? updatedUser.phone : phone.trim(),
        address: updatedUser.address !== undefined ? updatedUser.address : address.trim(),
        profilePicture: finalProfilePicture
      }

      localStorage.setItem('nuy_user', JSON.stringify(newUserData))
      useAuthStore.setState({ user: newUserData })

      success('Profil akun berhasil diperbarui!')
      onClose()
    } catch (err: any) {
      toastError(err?.response?.data?.message || err?.message || 'Gagal memperbarui profil akun')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-ink tracking-tight">Edit Profil Akun</h3>
                <p className="text-xs text-ink-soft">Perbarui informasi profil dan kata sandi Anda</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Avatar & Role */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-100 border-2 border-white shadow-soft grid place-items-center">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-brand-600">
                      {name ? name[0].toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-ink/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className="text-xs text-ink-soft font-mono">@{username || 'user'}</span>
                </div>
                <p className="text-xs text-ink-soft mt-1">
                  Klik foto profil untuk mengganti foto avatar (1:1 Aspect Ratio).
                </p>
                {previewImage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage(null)
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="mt-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Foto Profil
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-50/40 border border-brand-100 text-ink text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Username login..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-brand-50/40 border border-brand-100 text-ink text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="0812-xxxx-xxxx"
                    className="!py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Alamat domisili atau catatan staff..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-brand-50/40 border border-brand-100 text-ink text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition resize-none"
                />
              </div>
            </div>

            {/* Change Password Toggle */}
            <div className="pt-2 border-t border-brand-50">
              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center justify-between w-full py-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  {isChangingPassword ? 'Batalkan Ubah Password' : 'Ubah Password Akun'}
                </span>
                <span className="text-[11px] font-semibold text-ink-soft">
                  {isChangingPassword ? 'Tutup' : 'Ganti Password'}
                </span>
              </button>

              {isChangingPassword && (
                <div className="mt-3 p-4 rounded-2xl bg-brand-50/40 border border-brand-100 space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      Password Lama <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Masukkan password saat ini..."
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink transition rounded-md"
                        title={showOldPassword ? 'Sembunyikan' : 'Lihat'}
                      >
                        {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        Password Baru <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter..."
                          className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink transition rounded-md"
                          title={showNewPassword ? 'Sembunyikan' : 'Lihat'}
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        Konfirmasi Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru..."
                          className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink transition rounded-md"
                          title={showConfirmPassword ? 'Sembunyikan' : 'Lihat'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-brand-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
