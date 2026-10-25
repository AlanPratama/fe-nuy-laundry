import React, { useState, useEffect, useRef } from 'react'
import type { ArticleItem, CreateArticlePayload, UpdateArticlePayload } from '../models/ArticleModel'
import { FormField } from '../../../components/ui/FormField'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { X, Check, UploadCloud, BookOpen, Trash2, Eye } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  editingArticle: ArticleItem | null
  onSubmit: (payload: CreateArticlePayload | UpdateArticlePayload) => Promise<void>
}

const CATEGORY_OPTIONS = [
  { value: 'TIPS_PERAWATAN', label: 'Tips Perawatan (Perawatan Baju)' },
  { value: 'PANDUAN_BAHAN', label: 'Panduan Bahan (Katun, Sutra, Wol)' },
  { value: 'INFO_PROMO', label: 'Info & Promo (Diskon & Acara)' },
  { value: 'INFO_MENARIK', label: 'Info Menarik (Fakta & Edukasi)' }
]

export const ArticleFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingArticle,
  onSubmit
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('TIPS_PERAWATAN')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [readingTime, setReadingTime] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingArticle) {
      setTitle(editingArticle.title || '')
      setCategory(editingArticle.category || 'TIPS_PERAWATAN')
      setExcerpt(editingArticle.excerpt || '')
      setContent(editingArticle.content || '')
      setReadingTime(editingArticle.readingTime || '')
      setIsPublished(Boolean(editingArticle.isPublished))
      setPhotoPreview(editingArticle.thumbnailUrl ? resolveImageUrl(editingArticle.thumbnailUrl) : '')
      setPhotoFile(null)
    } else {
      setTitle('')
      setCategory('TIPS_PERAWATAN')
      setExcerpt('')
      setContent('')
      setReadingTime('')
      setIsPublished(true)
      setPhotoPreview('')
      setPhotoFile(null)
    }
    setErrors({})
    setTouched({})
    setActiveTab('edit')
  }, [editingArticle, isOpen])

  if (!isOpen) return null

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

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!title.trim()) {
      errs.title = 'Judul artikel wajib diisi.'
    } else if (title.trim().length < 5) {
      errs.title = 'Judul artikel minimal 5 karakter.'
    }

    if (!category) {
      errs.category = 'Kategori artikel wajib dipilih.'
    }

    if (!content.trim()) {
      errs.content = 'Konten artikel wajib diisi.'
    } else if (content.trim().length < 20) {
      errs.content = 'Konten artikel minimal 20 karakter.'
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
      title: true,
      category: true,
      content: true
    })

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const removeThumbnail = !photoPreview && !photoFile && Boolean(editingArticle?.thumbnailUrl)
      await onSubmit({
        title: title.trim(),
        category,
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        readingTime: readingTime.trim() || undefined,
        isPublished,
        file: photoFile || undefined,
        removeThumbnail
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
          className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 grid place-items-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink">
                  {editingArticle ? 'Edit Artikel Laundry' : 'Tambah Artikel Baru'}
                </h3>
                <p className="text-xs text-ink-soft">
                  {editingArticle ? 'Perbarui informasi dan konten artikel' : 'Buat konten tips, panduan, atau informasi promo baru'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            {/* Thumbnail Cover Upload */}
            <FormField label="Foto Sampul Artikel" sublabel="Format JPG, PNG, atau WebP (Rasio 16:9 disarankan)">
              <div className="space-y-3">
                {photoPreview ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-brand-100 bg-brand-50 group">
                    <img
                      src={photoPreview}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-full bg-white text-ink text-xs font-bold hover:bg-brand-50 transition"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-600 hover:bg-brand-50/30 transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 grid place-items-center mb-1 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-ink">Klik untuk unggah sampul</span>
                    <span className="text-[11px] text-ink-soft">Maksimal 3MB</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </FormField>

            {/* Judul Artikel */}
            <FormField
              label="Judul Artikel"
              required
              error={touched.title ? errors.title : null}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (touched.title) validate()
                }}
                onBlur={() => handleBlur('title')}
                placeholder="Contoh: 5 Tips Merawat Baju Katun Agar Serat Kain Awet"
                className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none ${
                  touched.title && errors.title
                    ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                    : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
                }`}
              />
            </FormField>

            {/* Kategori & Estimasi Waktu Baca */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Kategori Artikel"
                required
                error={touched.category ? errors.category : null}
              >
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={CATEGORY_OPTIONS}
                />
              </FormField>

              <FormField
                label="Estimasi Waktu Baca"
                sublabel="Kosongkan untuk otomatisasi"
              >
                <input
                  type="text"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="Contoh: 4 menit baca"
                  className="w-full px-4 py-3 rounded-2xl text-sm bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white transition focus:outline-none"
                />
              </FormField>
            </div>

            {/* Excerpt / Ringkasan */}
            <FormField
              label="Ringkasan Singkat (Excerpt)"
              sublabel="Deskripsi ringkas yang tampil pada preview card"
            >
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tuliskan 1-2 kalimat pengantar artikel..."
                className="w-full px-4 py-2.5 rounded-2xl text-sm bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white transition focus:outline-none resize-none"
              />
            </FormField>

            {/* Konten Artikel dengan Tab Edit / Pratinjau */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Konten Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 bg-brand-50/80 p-0.5 rounded-full border border-brand-100/60">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      activeTab === 'edit'
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Tulis / HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                      activeTab === 'preview'
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Pratinjau</span>
                  </button>
                </div>
              </div>

              {activeTab === 'edit' ? (
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                    if (touched.content) validate()
                  }}
                  onBlur={() => handleBlur('content')}
                  placeholder="Tuliskan isi artikel lengkap di sini (mendukung format paragraf dan HTML tag)..."
                  className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none font-mono ${
                    touched.content && errors.content
                      ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                      : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
                  }`}
                />
              ) : (
                <div className="w-full min-h-[190px] max-h-60 overflow-y-auto px-4 py-3 rounded-2xl bg-brand-50/20 border border-brand-100 text-sm leading-relaxed prose prose-sm max-w-none">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <span className="text-xs text-ink-soft italic">Belum ada konten untuk dipratinjau.</span>
                  )}
                </div>
              )}

              {touched.content && errors.content && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.content}</p>
              )}
            </div>

            {/* Status Publikasi Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
              <div>
                <span className="text-sm font-bold text-ink">Publikasikan Sekarang</span>
                <p className="text-xs text-ink-soft">
                  Jika aktif, artikel langsung dapat dibaca oleh publik di portal Web Customer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 flex justify-end gap-3 border-t border-brand-50">
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
                <span>
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingArticle
                    ? 'Perbarui Artikel'
                    : 'Simpan Artikel'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
