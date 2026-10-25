import React, { useState, useEffect, useRef } from 'react'
import type { PackageItem, CreatePackagePayload, PackageType } from '../models/PackageModel'
import type { BenefitItem } from '../models/BenefitModel'
import { BenefitRepository } from '../repositories/BenefitRepository'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { FormField } from '../../../components/ui/FormField'
import { validators } from '../../../shared/utils/validators'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { apiClient } from '../../../shared/api/apiClient'
import type { ApiResponse } from '@nuy-laundry/shared-types'
import { X, Check, UploadCloud, Sparkles, Image as ImageIcon } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  editingPackage: PackageItem | null
  onSubmit: (payload: CreatePackagePayload) => Promise<void>
}

const benefitRepo = new BenefitRepository()

export const PackageFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingPackage,
  onSubmit
}) => {
  const [name, setName] = useState('')
  const [type, setType] = useState<PackageType>('WEIGHT')
  const [price, setPrice] = useState(8000)
  const [estimateDays, setEstimateDays] = useState(1)
  const [description, setDescription] = useState('')
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<string[]>([])
  const [availableBenefits, setAvailableBenefits] = useState<BenefitItem[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      benefitRepo.getAll().then((list) => {
        setAvailableBenefits(list)
        if (!editingPackage && list.length > 0 && selectedBenefitIds.length === 0) {
          setSelectedBenefitIds([list[0].id])
        }
      }).catch(() => {})
    }
  }, [isOpen])

  useEffect(() => {
    if (editingPackage) {
      setName(editingPackage.name)
      setType(editingPackage.type)
      setPrice(editingPackage.price)
      setEstimateDays(editingPackage.daysEstimation || Math.max(1, Math.round(editingPackage.estimateHours / 24)))
      setDescription(editingPackage.description || '')
      const initialBenefitIds = Array.from(new Set(
        (editingPackage.benefitIds && editingPackage.benefitIds.length > 0)
          ? editingPackage.benefitIds
          : (editingPackage.benefits ? editingPackage.benefits.map((b: any) => b.id || b.benefitId || b.benefit?.id).filter(Boolean) : [])
      )) as string[]
      setSelectedBenefitIds(initialBenefitIds)

      if (editingPackage.id) {
        apiClient.get<ApiResponse<any>>(`/api/v1/packages/${editingPackage.id}`)
          .then((res) => {
            const data = res.data?.data
            if (data) {
              const freshIds = Array.from(new Set(
                (data.benefitIds && data.benefitIds.length > 0)
                  ? data.benefitIds
                  : (data.benefits ? data.benefits.map((b: any) => b.id || b.benefitId || b.benefit?.id).filter(Boolean) : [])
              )) as string[]
              if (freshIds && freshIds.length > 0) {
                setSelectedBenefitIds(freshIds)
              }
            }
          })
          .catch(() => {})
      }
      setPhotoPreview(editingPackage.photo ? resolveImageUrl(editingPackage.photo) : '')
      setPhotoFile(null)
    } else {
      setName('')
      setType('WEIGHT')
      setPrice(8000)
      setEstimateDays(1)
      setDescription('')
      setPhotoPreview('')
      setPhotoFile(null)
    }
    setErrors({})
    setTouched({})
  }, [editingPackage, isOpen])

  if (!isOpen) return null

  const handleTypeChange = (newTypeStr: string) => {
    setType(newTypeStr as PackageType)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotoPreview(ev.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleBenefit = (id: string) => {
    setSelectedBenefitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    if (touched.benefits) validate()
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!validators.isNotEmpty(name)) {
      errs.name = 'Nama paket layanan wajib diisi.'
    } else if (!validators.minLength(name, 3)) {
      errs.name = 'Nama paket minimal 3 karakter.'
    }

    if (!validators.isMinNumber(price, 500)) {
      errs.price = 'Harga paket minimal Rp500.'
    }

    if (!validators.isMinNumber(estimateDays, 1)) {
      errs.estimateDays = 'Estimasi minimal 1 hari.'
    }

    if (selectedBenefitIds.length === 0) {
      errs.benefits = 'Minimal pilih 1 benefit untuk paket ini.'
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
      price: true,
      estimateDays: true,
      benefits: true
    })

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const autoUnit = type === 'WEIGHT' ? 'kg' : 'pcs'
      await onSubmit({
        name: name.trim(),
        type,
        price: Number(price),
        unit: autoUnit,
        daysEstimation: Number(estimateDays),
        estimateHours: Number(estimateDays) * 24,
        description: description.trim(),
        benefitIds: Array.from(new Set(selectedBenefitIds)),
        file: photoFile || undefined,
        removePhoto: !photoPreview && !photoFile && Boolean(editingPackage?.photo),
        isPopular: false
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Full Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Centering wrapper */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b border-brand-50">
            <div>
              <h3 className="text-xl font-bold text-ink">
                {editingPackage ? 'Edit Paket Layanan' : 'Tambah Paket Baru'}
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Kelola foto, harga, estimasi hari, dan benefit layanan
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
            {/* Package Photo Upload */}
            <FormField label="Foto / Ikon Paket Layanan" sublabel="JPG, PNG, atau WebP (Maks 5MB)">
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-brand-100 bg-brand-50 shrink-0 group">
                    <img
                      src={photoPreview}
                      alt="Preview Paket"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute inset-0 bg-ink/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Hapus foto"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center shrink-0">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl border border-brand-200 hover:border-brand-600 hover:bg-brand-50/50 text-xs font-bold text-ink transition inline-flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4 text-brand-600" />
                    <span>{photoPreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                  </button>
                  <p className="text-[11px] text-ink-soft mt-1">
                    Format gambar rasio 1:1 atau 4:3 disarankan
                  </p>
                </div>
              </div>
            </FormField>

            {/* Package Name */}
            <FormField
              label="Nama Paket Layanan"
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
                placeholder="Contoh: Cuci Setrika Uap Premium"
                className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none ${
                  touched.name && errors.name
                    ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                    : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
                }`}
              />
            </FormField>

            <FormField label="Kategori Layanan" required>
              <CustomSelect
                value={type}
                onChange={handleTypeChange}
                options={[
                  { value: 'WEIGHT', label: 'Kiloan (WEIGHT / per kg)' },
                  { value: 'PCS', label: 'Satuan (PCS / per potong)' }
                ]}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Harga Paket (Rp)"
                required
                error={touched.price ? errors.price : null}
              >
                <CurrencyInput
                  value={price}
                  onChange={(val) => {
                    setPrice(val)
                    if (touched.price) validate()
                  }}
                  onBlur={() => handleBlur('price')}
                  placeholder="8.000"
                  error={!!(touched.price && errors.price)}
                />
              </FormField>

              <FormField
                label="Estimasi Durasi (Hari)"
                required
                error={touched.estimateDays ? errors.estimateDays : null}
              >
                <input 
                  type="number"
                  min="1"
                  value={estimateDays || ''}
                  onChange={(e) => {
                    setEstimateDays(parseInt(e.target.value, 10) || 1)
                    if (touched.estimateDays) validate()
                  }}
                  onBlur={() => handleBlur('estimateDays')}
                  placeholder="1"
                  className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none ${
                    touched.estimateDays && errors.estimateDays
                      ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                      : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
                  }`}
                />
              </FormField>
            </div>

            {/* Benefits Selection (Multi-select) */}
            <FormField
              label="Pilih Benefit Layanan"
              sublabel="Minimal pilih 1 benefit untuk paket ini"
              required
              error={touched.benefits ? errors.benefits : null}
            >
              <div className="space-y-2 mt-1">
                {availableBenefits.length === 0 ? (
                  <p className="text-xs text-ink-soft">Memuat daftar benefit...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                    {availableBenefits.map((ben) => {
                      const isSelected = selectedBenefitIds.includes(ben.id)
                      return (
                        <div
                          key={ben.id}
                          onClick={() => toggleBenefit(ben.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition select-none text-xs ${
                            isSelected
                              ? 'bg-brand-50/80 border-brand-600 text-brand-900 font-bold'
                              : 'bg-white border-brand-100 text-ink hover:border-brand-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-brand-600' : 'text-ink-soft'}`} />
                            <span className="truncate">{ben.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-md grid place-items-center transition shrink-0 ${
                            isSelected ? 'bg-brand-600 text-white' : 'border border-brand-200'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="Deskripsi Singkat">
              <textarea 
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Keterangan proses atau pakaian yang cocok..."
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
                <span>{isSubmitting ? 'Menyimpan...' : editingPackage ? 'Perbarui Paket' : 'Tambah Paket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
