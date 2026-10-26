import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useArticleStore } from '../providers/useArticleStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useToast } from '../../../components/ui/Toast'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { ArticleTable } from '../components/ArticleTable'
import { ArticleCard } from '../components/ArticleCard'
import { ArticleDetailModal } from '../components/ArticleDetailModal'
import type { ArticleItem } from '../models/ArticleModel'
import { 
  Plus, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  FileEdit, 
  LayoutGrid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react'

export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    articles,
    isLoading,
    searchQuery,
    categoryFilter,
    statusFilter,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    viewMode,
    metrics,
    fetchMetrics,
    fetchArticles,
    deleteArticle,
    togglePublish,
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setPage,
    setPageSize,
    setViewMode
  } = useArticleStore()

  const [searchInput, setSearchInput] = useState(searchQuery)
  const [detailArticle, setDetailArticle] = useState<ArticleItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<ArticleItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canModify = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

  // Sync initial query params from URL
  useEffect(() => {
    const urlQ = searchParams.get('q') || ''
    const urlCat = searchParams.get('category') || 'ALL'
    const urlStatus = (searchParams.get('status') as any) || 'ALL'
    const urlView = (searchParams.get('view') as any) || 'card'

    if (urlQ) {
      setSearchInput(urlQ)
      setSearchQuery(urlQ)
    }
    if (urlCat !== 'ALL') setCategoryFilter(urlCat)
    if (urlStatus !== 'ALL') setStatusFilter(urlStatus)
    if (urlView === 'table' || urlView === 'card') setViewMode(urlView)

    fetchArticles()
    fetchMetrics()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput)
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          if (searchInput) next.set('q', searchInput)
          else next.delete('q')
          return next
        }, { replace: true })
        fetchArticles()
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (cat !== 'ALL') next.set('category', cat)
      else next.delete('category')
      return next
    }, { replace: true })
  }

  const handleStatusChange = (status: 'ALL' | 'PUBLISHED' | 'DRAFT') => {
    setStatusFilter(status)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (status !== 'ALL') next.set('status', status)
      else next.delete('status')
      return next
    }, { replace: true })
  }

  const handleViewModeToggle = (mode: 'table' | 'card') => {
    setViewMode(mode)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (mode !== 'card') next.set('view', mode)
      else next.delete('view')
      return next
    }, { replace: true })
  }

  const handleOpenCreate = () => {
    navigate('/articles/create')
  }

  const handleOpenEdit = (article: ArticleItem) => {
    navigate(`/articles/edit/${article.id}`)
  }

  const handleOpenDetail = (article: ArticleItem) => {
    setDetailArticle(article)
    setIsDetailOpen(true)
  }

  const handleTogglePublish = async (article: ArticleItem) => {
    if (!canModify) return
    try {
      const updated = await togglePublish(article.id)
      success(
        `Artikel "${article.title}" berhasil diubah menjadi ${
          updated.isPublished ? 'Diterbitkan (Online)' : 'Draf (Offline)'
        }`
      )
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengubah status publikasi')
    }
  }

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return
    setIsDeleting(true)
    try {
      await deleteArticle(articleToDelete.id)
      success(`Artikel "${articleToDelete.title}" berhasil dihapus!`)
      setArticleToDelete(null)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus artikel')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalCount = metrics?.total ?? (totalElements || articles.length)
  const publishedCount = metrics?.published ?? articles.filter((a) => a.isPublished).length
  const draftCount = metrics?.draft ?? articles.filter((a) => !a.isPublished).length

  const CATEGORY_TABS = [
    { key: 'ALL', label: 'Semua Kategori' },
    { key: 'TIPS_PERAWATAN', label: 'Tips Perawatan' },
    { key: 'PANDUAN_BAHAN', label: 'Panduan Bahan' },
    { key: 'INFO_PROMO', label: 'Info & Promo' },
    { key: 'INFO_MENARIK', label: 'Info Menarik' }
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
              Manajemen Konten & Edukasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Artikel & Tips Laundry
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Kelola panduan perawatan pakaian, tips bahan kain, dan info promo outlet untuk pelanggan.
          </p>
        </div>

        {canModify && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-6 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-sm shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Artikel Baru</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-soft font-bold uppercase tracking-wider">Total Artikel</p>
            <h3 className="text-2xl font-black text-ink mt-1">{totalCount}</h3>
            <p className="text-[11px] text-ink-soft mt-0.5">Konten artikel terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Diterbitkan (Online)</p>
            <h3 className="text-2xl font-black text-ink mt-1">{publishedCount}</h3>
            <p className="text-[11px] text-ink-soft mt-0.5">Tampil di portal pelanggan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Draf (Offline)</p>
            <h3 className="text-2xl font-black text-ink mt-1">{draftCount}</h3>
            <p className="text-[11px] text-ink-soft mt-0.5">Dalam penulisan / revisi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 grid place-items-center">
            <FileEdit className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-50 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul artikel, ringkasan, atau tips..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Filter Custom Select */}
            <div className="w-36 sm:w-44 shrink-0">
              <CustomSelect
                size="sm"
                value={statusFilter}
                onChange={(val) => handleStatusChange(val as any)}
                options={[
                  { value: 'ALL', label: 'Semua Status' },
                  { value: 'PUBLISHED', label: 'Diterbitkan' },
                  { value: 'DRAFT', label: 'Draf' }
                ]}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-brand-50/80 p-1 rounded-full border border-brand-100/60 shrink-0">
              <button
                type="button"
                onClick={() => handleViewModeToggle('card')}
                className={`p-2 rounded-full transition ${
                  viewMode === 'card'
                    ? 'bg-white text-brand-600 shadow-soft font-bold'
                    : 'text-ink-soft hover:text-ink'
                }`}
                title="Tampilan Grid Card"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeToggle('table')}
                className={`p-2 rounded-full transition ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-600 shadow-soft font-bold'
                    : 'text-ink-soft hover:text-ink'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = categoryFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleCategoryChange(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-brand-50/70 text-ink-soft hover:bg-brand-100/70 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <ArticleTable
          articles={articles}
          isLoading={isLoading}
          canModify={canModify}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={(art) => setArticleToDelete(art)}
          onTogglePublish={handleTogglePublish}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      ) : (
        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-brand-50 p-12 text-center shadow-card">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink-soft">Memuat daftar artikel...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-brand-50 p-12 text-center shadow-card">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-400 grid place-items-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h4 className="text-base font-bold text-ink">Belum Ada Artikel</h4>
              <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto">
                Tidak ada artikel yang cocok dengan filter atau belum ada artikel yang dibuat.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  canModify={canModify}
                  onViewDetail={handleOpenDetail}
                  onEdit={handleOpenEdit}
                  onDelete={(art) => setArticleToDelete(art)}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}

          {/* Grid View Pagination */}
          {articles.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
              <div className="flex items-center gap-2">
                <span>Menampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-brand-100 bg-brand-50/30 text-ink font-bold focus:outline-none"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                </select>
                <span>dari total <strong>{totalElements}</strong> artikel</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="p-2 rounded-xl border border-brand-100 bg-white hover:bg-brand-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-semibold text-ink px-2">
                  Halaman {currentPage} dari {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="p-2 rounded-xl border border-brand-100 bg-white hover:bg-brand-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}

      <ArticleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        article={detailArticle}
      />

      {/* Confirmation Dialog Delete */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
            onClick={() => setArticleToDelete(null)}
          />
          <div className="min-h-full flex items-center justify-center p-4 text-center">
            <div 
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Hapus Artikel Ini?</h3>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus artikel <strong>"{articleToDelete.title}"</strong>? Artikel yang sudah dihapus tidak dapat dipulihkan kembali.
              </p>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setArticleToDelete(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-6 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
