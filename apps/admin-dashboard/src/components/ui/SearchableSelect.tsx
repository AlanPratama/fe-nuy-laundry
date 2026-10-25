import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

export interface SearchableOption {
  value: string
  label: string
  sublabel?: string
  badge?: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  searchPlaceholder?: string
  error?: boolean
  className?: string
}

export const SearchableSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih paket...',
  searchPlaceholder = 'Cari nama paket...',
  error = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const filtered = options.filter((opt) => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    )
  })

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-2xl text-left text-sm flex items-center justify-between transition focus:outline-none ${
          error
            ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
            : isOpen
            ? 'bg-white border border-brand-600 shadow-sm'
            : 'bg-brand-50/40 border border-brand-100 hover:border-brand-200'
        }`}
      >
        <span className={selectedOption ? 'text-ink font-semibold' : 'text-ink-soft'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-ink-soft transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-card border border-brand-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-brand-50 bg-brand-50/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <div className="px-4 py-4 text-xs text-ink-soft text-center">
                Tidak ada paket yang cocok
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-brand-50 text-brand-600 font-bold'
                        : 'text-ink hover:bg-brand-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{opt.label}</span>
                        {opt.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="text-xs text-ink-soft mt-0.5">{opt.sublabel}</p>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0 ml-2" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
