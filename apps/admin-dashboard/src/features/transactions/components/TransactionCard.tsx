import React from 'react'
import type { TransactionResponseDTO } from '@nuy-laundry/shared-types'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { CopyButton } from '../../../components/ui/CopyButton'
import { Clock, User, Eye, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  transaction: TransactionResponseDTO
  onDetail: (trx: TransactionResponseDTO) => void
  onDelete?: (trx: TransactionResponseDTO) => void
  canManage?: boolean
}

export const TransactionCard: React.FC<Props> = ({
  transaction,
  onDetail,
  onDelete,
  canManage = false
}) => {
  const firstItem = transaction.items?.[0]
  const isPaid = transaction.paymentStatus === 'PAID' || (transaction.downPayment && transaction.downPayment >= transaction.totalAmount)
  const isDp = !isPaid && (transaction.paymentStatus === 'DOWN_PAYMENT' || (transaction.downPayment && transaction.downPayment > 0))
  const remaining = transaction.remainingBalance ?? Math.max(0, transaction.totalAmount - (transaction.downPayment || 0))

  return (
    <div 
      onClick={() => onDetail(transaction)}
      className="bg-white rounded-3xl p-5 border border-brand-50 shadow-card hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
    >
      <div>
        {/* Top bar: Invoice & Badges */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-50 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono font-bold text-sm text-brand-600 truncate">
              {transaction.invoiceNumber}
            </span>
            <CopyButton text={transaction.invoiceNumber} />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isPaid ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Lunas
              </span>
            ) : isDp ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" /> DP
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                Belum Bayar
              </span>
            )}
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>

        {/* Customer & Service Info */}
        <div className="mt-3.5 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 grid place-items-center shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink truncate text-sm">{transaction.customerName}</p>
              <p className="text-ink-soft font-mono text-[11px] truncate">{transaction.customerPhone || '-'}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-brand-50/50 border border-brand-100/60 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="font-semibold text-ink truncate">
                {firstItem?.packageName || 'Layanan Laundry'}
              </p>
              <p className="text-[11px] text-ink-soft">
                {firstItem?.quantity || 1} {firstItem?.packageType === 'PCS' ? 'pcs' : 'kg'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold text-sm text-brand-600">
                Rp{transaction.totalAmount?.toLocaleString('id-ID')}
              </p>
              {isDp ? (
                <p className="text-[10px] text-amber-700 font-semibold">
                  DP: Rp{(transaction.downPayment || 0).toLocaleString('id-ID')} • Sisa: Rp{remaining.toLocaleString('id-ID')}
                </p>
              ) : isPaid ? (
                <p className="text-[10px] text-emerald-600 font-semibold">
                  Sudah Lunas
                </p>
              ) : (
                <p className="text-[10px] text-rose-600 font-semibold">
                  Sisa: Rp{transaction.totalAmount?.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>

          {/* Dates & PIC */}
          <div className="space-y-1 text-[11px] text-ink-soft pt-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-ink-soft" />
                <span>Masuk:</span>
              </span>
              <span className="font-medium text-ink">
                {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {transaction.targetDate && (
              <div className="flex items-center justify-between text-amber-700 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>Estimasi:</span>
                </span>
                <span className="font-bold">
                  {new Date(transaction.targetDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-brand-50/60">
              <span className="text-[10px] text-ink-soft">Kasir (PIC):</span>
              <span className="font-semibold text-ink text-[11px]">
                {transaction.picName || 'Staff Kasir'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div 
        className="mt-4 pt-3 border-t border-brand-50 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onDetail(transaction)}
          className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition inline-flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Lihat Detail</span>
        </button>

        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition"
            title="Hapus transaksi"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
