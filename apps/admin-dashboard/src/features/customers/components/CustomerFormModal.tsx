import React, { useState, useEffect } from 'react'
import type { CustomerItem, CustomerPayload } from '../models/CustomerModel'
import { FormField } from '../../../components/ui/FormField'
import { PhoneInput } from '../../../components/ui/PhoneInput'
import { validators } from '../../../shared/utils/validators'
import { X, Check } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  editingCustomer: CustomerItem | null
  onSubmit: (payload: CustomerPayload) => Promise<void>
}

export const CustomerFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingCustomer,
  onSubmit
}) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name)
      setPhone(editingCustomer.phone !== '-' ? editingCustomer.phone : '')
      setAddress(editingCustomer.address !== '-' ? (editingCustomer.address || '') : '')
    } else {
      setName('')
      setPhone('')
      setAddress('')
    }
    setErrors({})
    setTouched({})
  }, [editingCustomer, isOpen])

  if (!isOpen) return null

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!validators.isNotEmpty(name)) {
      errs.name = 'Nama pelanggan wajib diisi.'
    } else if (!validators.minLength(name, 2)) {
      errs.name = 'Nama pelanggan minimal 2 karakter.'
    }

    if (phone.trim() && !validators.isPhone(phone)) {
      errs.phone = 'Nomor telepon tidak valid (minimal 9 digit).'
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
    setTouched({ name: true, phone: true })

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined
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
          className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-brand-50">
            <div>
              <h3 className="text-xl font-bold text-ink">
                {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Kelola kontak dan alamat pengantaran cucian
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            <FormField
              label="Nama Lengkap Pelanggan"
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

            <FormField
              label="Nomor Telepon / WhatsApp"
              sublabel="Hanya angka & -"
              error={touched.phone ? errors.phone : null}
            >
              <PhoneInput
                value={phone}
                onChange={(cleanVal) => {
                  setPhone(cleanVal)
                  if (touched.phone) validate()
                }}
                onBlur={() => handleBlur('phone')}
                placeholder="0812-xxxx-xxxx"
                error={!!(touched.phone && errors.phone)}
              />
            </FormField>

            <FormField label="Alamat Domisili / Kos">
              <textarea 
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Kos Mawar Kamar 12, Jl. Pinus No. 5"
                className="w-full px-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition"
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
                <span>{isSubmitting ? 'Menyimpan...' : editingCustomer ? 'Perbarui Pelanggan' : 'Simpan Pelanggan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
