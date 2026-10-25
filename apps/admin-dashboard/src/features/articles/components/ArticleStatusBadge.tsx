import React from 'react'
import { CheckCircle2, FileEdit } from 'lucide-react'

interface Props {
  isPublished: boolean
  className?: string
}

export const ArticleStatusBadge: React.FC<Props> = ({ isPublished, className = '' }) => {
  if (isPublished) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 ${className}`}
      >
        <CheckCircle2 className="w-3 h-3" />
        <span>Diterbitkan</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ${className}`}
    >
      <FileEdit className="w-3 h-3" />
      <span>Draf</span>
    </span>
  )
}
