import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50]
}) => {
  if (totalElements === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalElements)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-white border-t border-brand-50 text-xs">
      <div className="flex items-center gap-3 text-ink-soft">
        <span>
          Menampilkan <span className="font-bold text-ink">{startItem.toLocaleString('id-ID')}-{endItem.toLocaleString('id-ID')}</span> dari{' '}
          <span className="font-bold text-ink">{totalElements.toLocaleString('id-ID')}</span> data
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-brand-100 pl-3">
            <span className="text-[11px]">Per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-brand-50/60 border border-brand-100 rounded-lg px-2 py-1 text-ink font-semibold focus:outline-none focus:border-brand-600 transition cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 rounded-xl border border-brand-100 text-ink-soft hover:bg-brand-50 hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed grid place-items-center transition"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) => (
          <React.Fragment key={idx}>
            {typeof p === 'number' ? (
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                  currentPage === p
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'text-ink-soft hover:bg-brand-50 hover:text-ink'
                }`}
              >
                {p}
              </button>
            ) : (
              <span className="w-8 h-8 grid place-items-center text-ink-soft/60 font-semibold select-none">
                {p}
              </span>
            )}
          </React.Fragment>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded-xl border border-brand-100 text-ink-soft hover:bg-brand-50 hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed grid place-items-center transition"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
