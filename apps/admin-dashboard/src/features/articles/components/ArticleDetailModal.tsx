import React from 'react'
import type { ArticleItem } from '../models/ArticleModel'
import { ArticleCategoryBadge } from './ArticleCategoryBadge'
import { ArticleStatusBadge } from './ArticleStatusBadge'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { X, Clock, Calendar, User, Eye, BookOpen } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  article: ArticleItem | null
}

export const ArticleDetailModal: React.FC<Props> = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null

  const resolvedThumb = article.thumbnailUrl ? resolveImageUrl(article.thumbnailUrl) : null

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
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
                <h3 className="text-base font-bold text-ink">Pratinjau Artikel</h3>
                <p className="text-xs text-ink-soft">Detail konten edukasi dan tips laundry</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Thumbnail */}
            {resolvedThumb ? (
              <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-brand-50 border border-brand-100 shadow-soft">
                <img 
                  src={resolvedThumb} 
                  alt={article.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-100 flex items-center justify-center text-brand-400">
                <BookOpen className="w-12 h-12 stroke-[1.5]" />
              </div>
            )}

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <ArticleCategoryBadge category={article.category} />
              <ArticleStatusBadge isPublished={article.isPublished} />
              {article.readingTime && (
                <span className="inline-flex items-center gap-1 text-xs text-ink-soft font-medium bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                  <Clock className="w-3 h-3 text-brand-600" />
                  {article.readingTime}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink leading-snug">
                {article.title}
              </h2>
              <p className="text-xs text-ink-soft font-mono mt-1">
                Slug: <span className="text-brand-600">/{article.slug}</span>
              </p>
            </div>

            {/* Author & Date Card */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-brand-50/40 border border-brand-100/60 text-xs text-ink-soft">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>Oleh: <strong className="text-ink">{article.authorName || 'Admin Outlet'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Rilis: <strong className="text-ink">{formattedDate(article.publishedAt || article.createdAt)}</strong></span>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-1">
                  Ringkasan / Excerpt:
                </p>
                <p className="text-sm text-amber-950/80 leading-relaxed italic">
                  "{article.excerpt}"
                </p>
              </div>
            )}

            {/* Content Body */}
            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Konten Lengkap Artikel:
              </h4>
              <div 
                className="medium-rendered-content max-w-none text-ink/90 leading-relaxed border-t border-brand-50 pt-3"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-brand-50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-brand-50 text-ink-soft font-bold text-xs hover:bg-brand-100 transition"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
