import React from 'react'
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto grid place-items-center mb-4 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
        )
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto grid place-items-center mb-4 shadow-sm">
            <AlertCircle className="w-7 h-7" />
          </div>
        )
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto grid place-items-center mb-4 shadow-sm">
            <HelpCircle className="w-7 h-7" />
          </div>
        )
    }
  }

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-soft'
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white shadow-soft'
      default:
        return 'bg-brand-600 hover:bg-brand-700 text-white shadow-soft'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Full-coverage dark backdrop with zero gaps at top */}
      <div 
        className="fixed inset-0 w-full h-full bg-ink/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Centering wrapper */}
      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-7 shadow-card border border-brand-50 text-center relative animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {getIcon()}

          <h3 className="text-lg font-extrabold text-ink tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-ink-soft mt-2 leading-relaxed">
            {message}
          </p>

          <div className="mt-6 pt-4 border-t border-brand-50 flex gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-brand-100 text-xs font-bold text-ink-soft hover:bg-brand-50 transition disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 ${getConfirmButtonClasses()}`}
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
