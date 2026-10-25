import React from 'react'
import { X, Filter, RotateCcw, Check } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  onApply: () => void
  title?: string
  subtitle?: string
  activeCount?: number
  children: React.ReactNode
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onReset,
  onApply,
  title = 'Filter Data',
  subtitle = 'Atur kriteria pencarian dan urutan data agar lebih spesifik.',
  activeCount = 0,
  children
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose} 
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between pb-4 border-b border-brand-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-ink">{title}</h3>
                  {activeCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                      {activeCount} Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft mt-0.5">{subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink-soft hover:text-ink hover:bg-brand-100 grid place-items-center transition shrink-0 ml-2"
              aria-label="Tutup Filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-5 space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {children}
          </div>

          <div className="pt-4 border-t border-brand-50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 rounded-full bg-brand-50/70 text-ink-soft hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-brand-100 text-ink-soft hover:text-ink text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply()
                  onClose()
                }}
                className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
