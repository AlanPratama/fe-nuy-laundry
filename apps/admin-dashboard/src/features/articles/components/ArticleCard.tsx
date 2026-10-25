import React from 'react'
import type { ArticleItem } from '../models/ArticleModel'
import { ArticleCategoryBadge } from './ArticleCategoryBadge'
import { ArticleStatusBadge } from './ArticleStatusBadge'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { Eye, Edit2, Trash2, Clock, Calendar, BookOpen } from 'lucide-react'

interface Props {
  article: ArticleItem
  canModify: boolean
  onViewDetail: (article: ArticleItem) => void
  onEdit: (article: ArticleItem) => void
  onDelete: (article: ArticleItem) => void
  onTogglePublish: (article: ArticleItem) => void
}

export const ArticleCard: React.FC<Props> = ({
  article,
  canModify,
  onViewDetail,
  onEdit,
  onDelete,
  onTogglePublish
}) => {
  const thumb = article.thumbnailUrl ? resolveImageUrl(article.thumbnailUrl) : null

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

  return (
    <div className="bg-white rounded-3xl border border-brand-50 p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between group">
      <div>
        {/* Cover Thumbnail */}
        <div 
          onClick={() => onViewDetail(article)}
          className="relative w-full h-44 rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 mb-4 cursor-pointer"
        >
          {thumb ? (
            <img 
              src={thumb} 
              alt={article.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-300 bg-brand-50/50">
              <BookOpen className="w-10 h-10 stroke-[1.5]" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <ArticleCategoryBadge category={article.category} />
          </div>

          <div className="absolute top-3 right-3">
            <ArticleStatusBadge isPublished={article.isPublished} />
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onViewDetail(article)}
          className="text-base font-bold text-ink hover:text-brand-600 transition cursor-pointer line-clamp-2 leading-snug"
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-xs text-ink-soft line-clamp-2 mt-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </div>

      {/* Meta & Actions */}
      <div className="mt-5 pt-4 border-t border-brand-50">
        <div className="flex items-center justify-between text-xs text-ink-soft mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            {article.readingTime || '2 menit baca'}
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            {formattedDate(article.publishedAt || article.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {canModify ? (
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={article.isPublished}
                  onChange={() => onTogglePublish(article)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className="text-[11px] font-semibold text-ink-soft">
                {article.isPublished ? 'Rilis' : 'Draf'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-ink-soft font-semibold">
              Oleh: <strong className="text-ink">{article.authorName || 'Admin'}</strong>
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onViewDetail(article)}
              className="p-2 rounded-xl text-ink-soft hover:text-brand-600 hover:bg-brand-50 transition"
              title="Lihat Detail"
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
        </div>
      </div>
    </div>
  )
}
