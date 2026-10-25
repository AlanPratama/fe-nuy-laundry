import React, { useState, useEffect, useCallback } from 'react'
import type { PackageItem } from '../models/PackageModel'
import type { TransactionResponseDTO } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { TransactionRepository } from '../../transactions/repositories/TransactionRepository'
import { TransactionStatusBadge } from '../../transactions/components/TransactionStatusBadge'
import { TransactionDetailModal } from '../../transactions/components/TransactionDetailModal'
import { 
  X, 
  Clock, 
  Sparkles, 
  Check, 
  Star, 
  ShoppingBag, 
  Eye, 
  Receipt, 
  Calendar, 
  User, 
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react'

const trxRepo = new TransactionRepository()

interface Props {
  isOpen: boolean
  onClose: () => void
  pkg: PackageItem | null
}

export const PackageDetailModal: React.FC<Props> = ({ isOpen, onClose, pkg }) => {
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([])
  const [totalTransactions, setTotalTransactions] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDTO | null>(null)
  const [isTrxDetailOpen, setIsTrxDetailOpen] = useState<boolean>(false)

  const fetchTransactions = useCallback(async (packageId: string) => {
    setIsLoading(true)
    try {
      const res = await trxRepo.getAll(undefined, {
        packageId,
        size: 30,
        direction: 'desc'
      })
      setTransactions(res.transactions)
      setTotalTransactions(res.totalElements)
    } catch (err) {
      console.error('Failed to fetch transactions for package:', err)
      setTransactions([])
      setTotalTransactions(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && pkg) {
      fetchTransactions(pkg.id)
    } else {
      setTransactions([])
      setTotalTransactions(0)
    }
  }, [isOpen, pkg, fetchTransactions])

  if (!isOpen || !pkg) return null

  const days = pkg.daysEstimation || Math.max(1, Math.round(pkg.estimateHours / 24))

  const handleOpenTrxDetail = (trx: TransactionResponseDTO) => {
    setSelectedTransaction(trx)
    setIsTrxDetailOpen(true)
  }

  const formatPaymentStatus = (status?: string) => {
    switch (status) {
      case 'PAID':
        return { label: 'Lunas', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'DOWN_PAYMENT':
        return { label: 'DP (Sebagian)', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      default:
        return { label: 'Belum Bayar', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-card overflow-hidden flex flex-col border border-brand-50">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-brand-50 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-ink">Detail Paket & Riwayat Transaksi</h3>
                <p className="text-xs text-ink-soft">Informasi spesifikasi paket serta daftar transaksi yang menggunakannya</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-brand-50/60 hover:bg-brand-100 text-ink-soft hover:text-ink flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/40">
            
            {/* Package Overview Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-100/70 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                
                {pkg.photo ? (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-brand-100 bg-brand-50 shrink-0 shadow-xs">
                    <img
                      src={resolveImageUrl(pkg.photo)}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center shrink-0">
                    <ShoppingBag className="w-10 h-10 opacity-40" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      pkg.type === 'WEIGHT'
                        ? 'bg-brand-50 text-brand-600 border border-brand-100'
                        : 'bg-sun/20 text-amber-900 border border-sun/30'
                    }`}>
                      {pkg.type === 'WEIGHT' ? 'Kiloan' : 'Satuan'}
                    </span>

                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      pkg.isActive ? 'bg-mint/20 text-emerald-800' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-mint' : 'bg-rose-500'}`} />
                      {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>

                    {pkg.isPopular && (
                      <span className="px-3 py-0.5 rounded-full bg-sun text-ink text-xs font-bold inline-flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-ink" />
                        Favorit
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-ink">{pkg.name}</h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-soft pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-brand-600">
                        Rp{pkg.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs font-semibold text-ink-soft">/{pkg.unit}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50/60 text-ink font-semibold border border-brand-100/50">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>Estimasi: <b>{days} Hari</b> ({pkg.estimateHours} jam)</span>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-xs text-ink-soft leading-relaxed pt-1">
                      {pkg.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Benefits list if available */}
              {pkg.benefits && pkg.benefits.length > 0 && (
                <div className="pt-3 border-t border-brand-50">
                  <p className="text-[11px] font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    Keunggulan & Benefit Paket:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pkg.benefits.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-50 text-brand-800 px-3 py-1 rounded-xl border border-brand-100"
                      >
                        <Check className="w-3 h-3 text-brand-600 stroke-[3]" />
                        {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transactions Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-600" />
                  <h4 className="text-sm font-bold text-ink">Daftar Transaksi Menggunakan Paket Ini</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-extrabold">
                    {totalTransactions}
                  </span>
                </div>
                <span className="text-xs text-ink-soft hidden sm:inline">
                  Klik transaksi untuk membuka rincian lengkap
                </span>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-xs">
                  <span className="w-7 h-7 rounded-full border-2 border-brand-600 border-t-transparent animate-spin inline-block mb-2"></span>
                  <p className="text-xs font-medium">Memuat transaksi...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-3xl border border-brand-50 shadow-xs px-4">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-ink">Belum Ada Transaksi</p>
                  <p className="text-[11px] text-ink-soft mt-1">Paket ini belum tercatat dalam transaksi apapun.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {transactions.map((trx) => {
                    const payBadge = formatPaymentStatus(trx.paymentStatus)
                    const dateFormatted = trx.createdAt
                      ? new Date(trx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-'

                    return (
                      <div
                        key={trx.id}
                        onClick={() => handleOpenTrxDetail(trx)}
                        className="p-4 rounded-2xl bg-white border border-brand-50 hover:border-brand-200 hover:shadow-soft transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-600">
                              #{trx.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${payBadge.bg}`}>
                              {payBadge.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-ink">
                            <span className="font-semibold flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-ink-soft" />
                              {trx.customerName || 'Pelanggan'}
                            </span>
                            <span className="text-ink-soft flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {dateFormatted}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-50">
                          <div className="text-left sm:text-right">
                            <div className="text-xs font-bold text-ink">
                              Rp{(Number(trx.totalAmount) || Number((trx as any).totalPrice) || 0).toLocaleString('id-ID')}
                            </div>
                            <div className="scale-90 origin-left sm:origin-right">
                              <TransactionStatusBadge status={trx.status} />
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition text-xs font-bold inline-flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Rincian</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-brand-50 bg-white flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-brand-50 hover:bg-brand-100 text-ink text-xs font-bold transition shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Nested Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={isTrxDetailOpen}
          onClose={() => setIsTrxDetailOpen(false)}
          transaction={selectedTransaction}
          onUpdateStatus={async (id, newStatus) => {
            if (pkg) fetchTransactions(pkg.id)
            setSelectedTransaction((prev) => prev ? { ...prev, status: newStatus } : null)
          }}
        />
      )}
    </>
  )
}
