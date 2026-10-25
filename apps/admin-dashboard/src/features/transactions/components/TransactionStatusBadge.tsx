import React from 'react'
import type { TransactionStatus } from '@nuy-laundry/shared-types'

interface Props {
  status: TransactionStatus
}

export const TransactionStatusBadge: React.FC<Props> = ({ status }) => {
  if (status === 'DONE') {
    return (
      <span className="px-3 py-1 rounded-full bg-mint/20 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 border border-mint/30">
        <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
        Selesai
      </span>
    )
  }

  if (status === 'CANCELED') {
    return (
      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold inline-flex items-center gap-1.5 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Dibatalkan
      </span>
    )
  }

  return (
    <span className="px-3 py-1 rounded-full bg-sun/25 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 border border-sun/40">
      <span className="w-1.5 h-1.5 rounded-full bg-sun animate-ping"></span>
      Sedang Diproses
    </span>
  )
}
