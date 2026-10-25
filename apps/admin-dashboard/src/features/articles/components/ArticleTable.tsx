import React from 'react'
import type { ArticleItem } from '../models/ArticleModel'
import { ArticleCategoryBadge } from './ArticleCategoryBadge'
import { ArticleStatusBadge } from './ArticleStatusBadge'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { Eye, Edit2, Trash2, Clock, Calendar, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  articles: ArticleItem[]
  isLoading: boolean
  canModify: boolean
  onViewDetail: (article: ArticleItem) => void
  onEdit: (article: ArticleItem) => void
  onDelete: (article: ArticleItem) => void
  onTogglePublish: (article: ArticleItem) => void
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const ArticleTable: React.FC<Props> = ({
  articles,
  isLoading,
  canModify,
  onViewDetail,
  onEdit,
  onDelete,
  onTogglePublish,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-brand-50 p-12 text-center shadow-card">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-ink-soft">Memuat daftar artikel...</p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-brand-50 p-12 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-400 grid place-items-center mx-auto mb-3">
          <BookOpen className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h4 className="text-base font-bold text-ink">Belum Ada Artikel</h4>
        <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto">
          Tidak ada artikel yang cocok dengan filter atau belum ada artikel yang dibuat.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-brand-50 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-50 text-[11px] font-bold text-ink-soft uppercase tracking-wider bg-brand-50/30">
              <th className="py-4 px-6">Artikel</th>
              <th className="py-4 px-6">Kategori</th>
              <th className="py-4 px-6">Waktu Baca</th>
              <th className="py-4 px-6">Penulis & Tanggal</th>
              <th className="py-4 px-6">Status Publikasi</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50 text-xs text-ink">
            {articles.map((article) => {
              const thumb = article.thumbnailUrl ? resolveImageUrl(article.thumbnailUrl) : null

              return (
                <tr key={article.id} className="hover:bg-brand-50/20 transition-colors group">
                  {/* Title & Thumbnail */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5 max-w-sm">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 shrink-0 grid place-items-center shadow-sm">
                        {thumb ? (
                          <img src={thumb} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-brand-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onViewDetail(article)}
                          className="font-bold text-sm text-ink hover:text-brand-600 transition text-left line-clamp-1 group-hover:underline"
                        >
                          {article.title}
                        </button>
                        <p className="text-[11px] text-ink-soft line-clamp-1 mt-0.5 font-mono">
                          /{article.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-4 px-6">
                    <ArticleCategoryBadge category={article.category} />
                  </td>

                  {/* Waktu Baca */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs text-ink-soft font-medium">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>{article.readingTime || '2 menit'}</span>
                    </span>
                  </td>

                  {/* Penulis & Tanggal */}
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-ink">{article.authorName || 'Admin'}</p>
                      <p className="text-[11px] text-ink-soft flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate(article.publishedAt || article.createdAt)}</span>
                      </p>
                    </div>
                  </td>

                  {/* Status Toggle / Badge */}
                  <td className="py-4 px-6">
                    {canModify ? (
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={article.isPublished}
                            onChange={() => onTogglePublish(article)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                        <ArticleStatusBadge isPublished={article.isPublished} />
                      </div>
                    ) : (
                      <ArticleStatusBadge isPublished={article.isPublished} />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(article)}
                        className="p-2 rounded-xl text-ink-soft hover:text-brand-600 hover:bg-brand-50 transition"
                        title="Lihat Detail Artikel"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canModify && (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(article)}
                            className="p-2 rounded-xl text-ink-soft hover:text-brand-600 hover:bg-brand-50 transition"
                            title="Edit Artikel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(article)}
                            className="p-2 rounded-xl text-ink-soft hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 sm:p-5 border-t border-brand-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
        <div className="flex items-center gap-2">
          <span>Menampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 rounded-xl border border-brand-100 bg-white hover:bg-brand-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
