import React, { useState, useEffect, useRef } from 'react'
import type { StaffUser, UpdateStaffPayload } from '../models/SettingsModel'
import { PhoneInput } from '../../../components/ui/PhoneInput'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { FormField } from '../../../components/ui/FormField'
import { validators } from '../../../shared/utils/validators'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { X, Check, UploadCloud, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../../auth/providers/useAuthStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  staff: StaffUser | null
  onSubmit: (id: string, payload: UpdateStaffPayload) => Promise<void>
}

export const EditStaffModal: React.FC<Props> = ({
  isOpen,
  onClose,
  staff,
  onSubmit
}) => {
  const { user: currentUser } = useAuthStore()
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF')
  const [address, setAddress] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (staff) {
      setName(staff.name || '')
      setUsername(staff.username || '')
      setPhone(staff.phone && staff.phone !== '-' ? staff.phone : '')
      setRole(staff.role === 'ADMIN' ? 'ADMIN' : 'STAFF')
      setAddress(staff.address || '')
      setPhotoPreview(staff.profilePicture ? resolveImageUrl(staff.profilePicture) : '')
      setPhotoFile(null)
    }
    setErrors({})
    setTouched({})
  }, [staff, isOpen])

  if (!isOpen || !staff) return null

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!validators.isNotEmpty(name)) {
      errs.name = 'Nama lengkap staff wajib diisi.'
    } else if (!validators.minLength(name, 2)) {
      errs.name = 'Nama lengkap minimal 2 karakter.'
    }

    if (!validators.isNotEmpty(username)) {
      errs.username = 'Username wajib diisi.'
    } else if (!validators.minLength(username, 3)) {
      errs.username = 'Username minimal 3 karakter.'
    }

    if (phone.trim() && !validators.isPhone(phone)) {
      errs.phone = 'Nomor telepon tidak valid (minimal 9 digit angka).'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      name: true,
      username: true,
      phone: true
    })

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const removeProfilePicture = !photoPreview && !photoFile && Boolean(staff.profilePicture)
      await onSubmit(staff.id, {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role,
        address: address.trim() || undefined,
        file: photoFile || undefined,
        removeProfilePicture
      })
      onClose()
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
          <div className="flex items-center justify-between pb-4 border-b border-brand-50">
            <div>
              <h3 className="text-xl font-bold text-ink">Edit Akun Staff</h3>
              <p className="text-xs text-ink-soft mt-0.5">Perbarui profil dan wewenang pengguna</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            {/* Foto Profil */}
            <FormField label="Foto Profil" sublabel="Foto avatar staff (JPG, PNG, WebP)">
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-brand-100 bg-brand-50 shrink-0 group">
                    <img
                      src={photoPreview}
                      alt="Preview Avatar"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute inset-0 bg-ink/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center shrink-0">
                    <UserIcon className="w-7 h-7 opacity-50" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setPhotoFile(file)
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          if (ev.target?.result) setPhotoPreview(ev.target.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl border border-brand-200 hover:border-brand-600 hover:bg-brand-50 text-xs font-bold text-ink transition inline-flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-brand-600" />
                    <span>{photoPreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                  </button>
                  <p className="text-[11px] text-ink-soft mt-1">Maksimal ukuran file 5MB</p>
                </div>
              </div>
            </FormField>

            <FormField
              label="Nama Lengkap"
              required
              error={touched.name ? errors.name : null}
            >
              <input 
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (touched.name) validate()
                }}
                onBlur={() => handleBlur('name')}
                placeholder="Contoh: Budi Santoso"
                className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none ${
                  touched.name && errors.name
                    ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                    : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
                }`}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Username"
                required
                error={touched.username ? errors.username : null}
              >
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (touched.username) validate()
                  }}
                  onBlur={() => handleBlur('username')}
                  placeholder="budi_kasir"
                  className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none ${
                    touched.username && errors.username
                      ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                      : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
                  }`}
                />
              </FormField>

              <FormField
                label="No. Telepon / WhatsApp"
                error={touched.phone ? errors.phone : null}
              >
                <PhoneInput
                  value={phone}
                  onChange={(val) => {
                    setPhone(val)
                    if (touched.phone) validate()
                  }}
                  onBlur={() => handleBlur('phone')}
                  placeholder="0812-3456-7890"
                  error={!!(touched.phone && errors.phone)}
                />
              </FormField>
            </div>

            <FormField 
              label="Hak Akses Akun"
              sublabel={!isSuperAdmin ? 'Hanya Super Admin yang dapat mengubah hak akses/role akun' : undefined}
            >
              <CustomSelect
                value={role}
                onChange={(val) => setRole(val as 'ADMIN' | 'STAFF')}
                options={isSuperAdmin ? [
                  { value: 'STAFF', label: 'Kasir / Staff Operasional' },
                  { value: 'ADMIN', label: 'Admin Outlet (Kelola Master Data)' }
                ] : [
                  { value: 'STAFF', label: 'Kasir / Staff Operasional' }
                ]}
                disabled={!isSuperAdmin}
              />
            </FormField>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-full text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-full bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Perbarui Akun'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
