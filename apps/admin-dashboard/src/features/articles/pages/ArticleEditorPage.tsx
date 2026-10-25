import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useArticleStore } from '../providers/useArticleStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useToast } from '../../../components/ui/Toast'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { MediumEditor } from '../components/MediumEditor'
import { ArticleCategoryBadge } from '../components/ArticleCategoryBadge'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { 
  ArrowLeft, 
  UploadCloud, 
  Trash2, 
  Clock, 
  Eye, 
  Send, 
  Save, 
  BookOpen, 
  User, 
  Calendar,
  Sparkles,
  CheckCircle2,
  FileEdit
} from 'lucide-react'

const CATEGORY_OPTIONS = [
  { value: 'TIPS_PERAWATAN', label: 'Tips Perawatan (Baju & Kain)' },
  { value: 'PANDUAN_BAHAN', label: 'Panduan Bahan (Katun, Sutra, Wol)' },
  { value: 'INFO_PROMO', label: 'Info & Promo (Diskon & Event)' },
  { value: 'INFO_MENARIK', label: 'Info Menarik (Edukasi & Fakta)' }
]

export const ArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()

  const { articles, createArticle, updateArticle, fetchArticles } = useArticleStore()

  const isEditMode = Boolean(id)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('TIPS_PERAWATAN')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [initialThumbnail, setInitialThumbnail] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingArticle, setIsLoadingArticle] = useState(isEditMode)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Permission check: Only SUPER_ADMIN and ADMIN
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      toastError('Hanya Super Admin dan Admin yang dapat mengelola artikel.')
      navigate('/articles')
    }
  }, [user, navigate])

  // Load article if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const existing = articles.find((a) => a.id === id)
      if (existing) {
        setTitle(existing.title || '')
        setCategory(existing.category || 'TIPS_PERAWATAN')
        setExcerpt(existing.excerpt || '')
        setContent(existing.content || '')
        setIsPublished(Boolean(existing.isPublished))
        setInitialThumbnail(existing.thumbnailUrl || '')
        setPhotoPreview(existing.thumbnailUrl ? resolveImageUrl(existing.thumbnailUrl) : '')
        setIsLoadingArticle(false)
      } else {
        // Fetch if not in memory
        setIsLoadingArticle(true)
        fetchArticles().then(() => {
          const fresh = useArticleStore.getState().articles.find((a) => a.id === id)
          if (fresh) {
            setTitle(fresh.title || '')
            setCategory(fresh.category || 'TIPS_PERAWATAN')
            setExcerpt(fresh.excerpt || '')
            setContent(fresh.content || '')
            setIsPublished(Boolean(fresh.isPublished))
            setInitialThumbnail(fresh.thumbnailUrl || '')
            setPhotoPreview(fresh.thumbnailUrl ? resolveImageUrl(fresh.thumbnailUrl) : '')
          } else {
            toastError('Artikel tidak ditemukan')
            navigate('/articles')
          }
          setIsLoadingArticle(false)
        })
      }
    }
  }, [id, isEditMode])

  // Auto-resize title textarea
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto'
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`
    }
  }, [title])

  // Word count & Reading Time Calculation
  const stats = useMemo(() => {
    const rawText = content.replace(/<[^>]*>/g, ' ')
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0
    const chars = rawText.trim().length
    const minutes = Math.max(1, Math.ceil(words / 180))
    return { words, chars, readingTime: `${minutes} menit baca` }
  }, [content])

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

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      toastError('Judul artikel wajib diisi')
      return
    }
    if (title.trim().length < 5) {
      toastError('Judul artikel minimal 5 karakter')
      return
    }
    if (!content.trim() || content === '<p></p>') {
      toastError('Konten artikel wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const removeThumbnail = !photoPreview && !photoFile && Boolean(initialThumbnail)

      if (isEditMode && id) {
        await updateArticle(id, {
          title: title.trim(),
          category,
          excerpt: excerpt.trim() || undefined,
          content,
          readingTime: stats.readingTime,
          isPublished: publish,
          file: photoFile || undefined,
          removeThumbnail
        })
        success(publish ? 'Artikel berhasil diperbarui dan diterbitkan!' : 'Draf artikel berhasil disimpan!')
      } else {
        await createArticle({
          title: title.trim(),
          category,
          excerpt: excerpt.trim() || undefined,
          content,
          readingTime: stats.readingTime,
          isPublished: publish,
          file: photoFile || undefined
        })
        success(publish ? 'Artikel baru berhasil dibuat dan diterbitkan!' : 'Draf artikel baru berhasil disimpan!')
      }

      navigate('/articles')
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan artikel')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingArticle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-ink-soft">Memuat data artikel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Top Floating Control Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-brand-50 px-4 sm:px-8 py-3.5 -mx-4 sm:-mx-8 -mt-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/articles"
            className="p-2 rounded-2xl bg-brand-50 hover:bg-brand-100 text-ink-soft hover:text-ink transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Daftar Artikel</span>
          </Link>

          <div className="h-4 w-[1px] bg-brand-100 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink truncate max-w-[200px] sm:max-w-xs">
              {title ? title : isEditMode ? 'Edit Artikel' : 'Artikel Baru'}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {isPublished ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Diterbitkan</span>
                </>
              ) : (
                <>
                  <FileEdit className="w-3 h-3" />
                  <span>Draf</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Quick Category Selector */}
          <div className="w-44 sm:w-52">
            <CustomSelect
              size="sm"
              value={category}
              onChange={(val) => setCategory(val)}
              options={CATEGORY_OPTIONS}
            />
          </div>

          {/* Reading Time Badge */}
          <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold border border-brand-100">
            <Clock className="w-3.5 h-3.5" />
            <span>{stats.readingTime}</span>
          </div>

          {/* Save as Draft */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="px-4 py-2 rounded-full border border-brand-200 text-ink-soft hover:bg-brand-50 hover:text-ink text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            title="Simpan sebagai draf (tidak tampil di publik)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Draf</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="px-5 py-2 rounded-full bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Memproses...' : 'Publikasikan'}</span>
          </button>
        </div>
      </div>

      {/* Medium Canvas Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Cover Image Banner (Medium Style) */}
        <div className="mb-8">
          {photoPreview ? (
            <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden bg-brand-50 border border-brand-100 shadow-soft group">
              <img
                src={photoPreview}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-white text-ink text-xs font-bold hover:bg-brand-50 transition shadow-sm"
                >
                  Ganti Foto Sampul
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm"
                  title="Hapus sampul"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 rounded-3xl border-2 border-dashed border-brand-200 hover:border-brand-600 hover:bg-white transition-all flex flex-col items-center justify-center cursor-pointer text-center group bg-brand-50/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-ink">Tambahkan Foto Sampul Artikel</span>
              <span className="text-xs text-ink-soft mt-0.5">Format JPG, PNG, atau WebP (Rasio 16:9 disarankan)</span>
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

        {/* Category Pill Tag */}
        <div className="mb-4">
          <ArticleCategoryBadge category={category} className="text-xs px-3 py-1" />
        </div>

        {/* Title Input (Medium Style: Big, Clean, Auto-growing) */}
        <textarea
          ref={titleTextareaRef}
          rows={1}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Artikel..."
          className="w-full text-3xl sm:text-5xl font-black text-ink placeholder:text-slate-300 border-none outline-none focus:outline-none bg-transparent resize-none leading-tight tracking-tight mb-2"
        />

        {/* Subtitle / Excerpt Input */}
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Tuliskan pengantar singkat atau ringkasan artikel di sini..."
          className="w-full text-base sm:text-lg text-ink-soft placeholder:text-slate-300 border-none outline-none focus:outline-none bg-transparent resize-none leading-relaxed mb-6"
        />

        {/* Author & Timestamp Bar */}
        <div className="flex items-center gap-4 py-3 border-y border-brand-50 mb-8 text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center font-bold text-xs uppercase shadow-xs">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div>
              <p className="font-bold text-ink">{user?.name || user?.username || 'Admin Outlet'}</p>
              <p className="text-[10px] text-ink-soft uppercase tracking-wider font-semibold">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-brand-100" />

          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium ml-auto">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>{stats.readingTime}</span>
          </div>
        </div>

        {/* Medium WYSIWYG Editor */}
        <MediumEditor
          content={content}
          onChange={setContent}
          placeholder="Tuliskan cerita, tips mencuci, atau panduan perawatan pakaian Anda di sini..."
        />

        {/* Bottom Word & Character Count Bar */}
        <div className="mt-12 pt-6 border-t border-brand-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
          <div className="flex items-center gap-3">
            <span><strong>{stats.words}</strong> kata</span>
            <span>•</span>
            <span><strong>{stats.chars}</strong> karakter</span>
            <span>•</span>
            <span>{stats.readingTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-full border border-brand-100 bg-white hover:bg-brand-50 text-ink font-bold transition shadow-xs disabled:opacity-50"
            >
              Simpan sebagai Draf
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="px-6 py-2.5 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-700 active:scale-95 transition shadow-soft disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Publikasikan Sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
