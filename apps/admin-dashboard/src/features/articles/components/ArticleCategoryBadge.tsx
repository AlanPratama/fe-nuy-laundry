import React from 'react'

interface Props {
  category: string
  className?: string
}

export const ArticleCategoryBadge: React.FC<Props> = ({ category, className = '' }) => {
  const norm = (category || '').trim().toUpperCase()

  let label = category
  let badgeStyle = 'bg-brand-50 text-brand-600 border-brand-200/60'

  if (norm.includes('PERAWATAN') || norm === 'TIPS_PERAWATAN') {
    label = 'Tips Perawatan'
    badgeStyle = 'bg-brand-50 text-brand-600 border-brand-200/60'
  } else if (norm.includes('BAHAN') || norm === 'PANDUAN_BAHAN') {
    label = 'Panduan Bahan'
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/60'
  } else if (norm.includes('PROMO') || norm === 'INFO_PROMO') {
    label = 'Info & Promo'
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
  } else if (norm.includes('MENARIK') || norm === 'INFO_MENARIK') {
    label = 'Info Menarik'
    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide shrink-0 ${badgeStyle} ${className}`}
    >
      {label}
    </span>
  )
}
