import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  badge?: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: boolean
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export const CustomSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  error = false,
  disabled = false,
  className = '',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  const isSm = size === 'sm'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-left flex items-center justify-between transition focus:outline-none ${
          isSm
            ? 'px-3 py-1.5 rounded-full text-xs font-bold'
            : 'px-4 py-3 rounded-2xl text-sm'
        } ${
          disabled
            ? 'bg-slate-100/70 border border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            : error
            ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
            : isOpen
            ? 'bg-white border border-brand-600 shadow-sm'
            : 'bg-brand-50/40 border border-brand-100 hover:border-brand-200'
        }`}
      >
        <span className={selectedOption ? 'text-ink font-semibold truncate' : 'text-ink-soft truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`shrink-0 ml-1.5 transition-transform duration-200 ${
            isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'
          } ${
            isOpen ? 'rotate-180 text-brand-600' : 'text-ink-soft'
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-card border border-brand-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 min-w-[140px]">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-ink-soft text-center">
              Tidak ada opsi tersedia
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left flex items-center justify-between transition ${
                    isSm ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
                  } ${
                    isSelected
                      ? 'bg-brand-50 text-brand-600 font-bold'
                      : 'text-ink hover:bg-brand-50/50'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-medium truncate">{opt.label}</p>
                    {opt.sublabel && (
                      <p className="text-[11px] text-ink-soft truncate">{opt.sublabel}</p>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-2" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
