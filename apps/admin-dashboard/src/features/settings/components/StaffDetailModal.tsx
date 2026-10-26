import React, { useEffect, useState } from 'react'
import type { StaffUser } from '../models/SettingsModel'
import type { TransactionResponseDTO } from '@nuy-laundry/shared-types'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useTransactionStore } from '../../transactions/providers/useTransactionStore'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { X, Phone, MapPin, Calendar, Shield, ChevronRight, Loader2, DollarSign, Receipt, CheckCircle2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  staff: StaffUser | null
  onSelectTransaction?: (transactionId: string) => void
}

export const StaffDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  staff,
  onSelectTransaction
}) => {
  const { token } = useAuthStore()
  const { getTransactionsByUser } = useTransactionStore()
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !staff) {
      setTransactions([])
      return
    }

    let isMounted = true
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const data = await getTransactionsByUser(token || undefined, staff.id)
        if (isMounted) {
          setTransactions(data)
        }
      } catch (err) {
        console.error('Failed to load staff transactions:', err)
        if (isMounted) {
          setTransactions([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchHistory()
    return () => {
      isMounted = false
    }
  }, [isOpen, staff?.id, token, getTransactionsByUser])

  if (!isOpen || !staff) return null

  const totalOmset = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0)
  const totalDone = transactions.filter((t) => t.status === 'DONE').length

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin'
      case 'ADMIN':
        return 'Admin Outlet'
      default:
        return 'Kasir / Staff'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-brand-50">
            <div className="flex items-center gap-3.5">
              {staff.profilePicture ? (
                <img
                  src={resolveImageUrl(staff.profilePicture)}
                  alt={staff.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-brand-100 shadow-soft shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-extrabold text-lg grid place-items-center shadow-soft shrink-0">
                  {staff.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-ink truncate">{staff.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    staff.isActive ? 'bg-mint/20 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {staff.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-xs text-brand-600 font-mono font-semibold mt-0.5">
                  @{staff.username}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-soft mt-1">
                  <Shield className="w-3 h-3 text-brand-600" />
                  <span>{getRoleLabel(staff.role)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4 p-3.5 rounded-2xl bg-brand-50/30 border border-brand-50 text-xs text-ink-soft">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>Telepon: <strong className="text-ink font-mono">{staff.phone || '-'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>Terdaftar: <strong className="text-ink">{new Date(staff.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
            </div>
            {staff.address && (
              <div className="sm:col-span-2 flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">Alamat: <strong className="text-ink">{staff.address}</strong></span>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 my-4 p-4 rounded-2xl bg-brand-50/50 border border-brand-100/60 text-center">
            <div>
              <p className="text-[11px] text-ink-soft flex items-center justify-center gap-1">
                <Receipt className="w-3 h-3 text-ink-soft" />
                Transaksi
              </p>
              <p className="text-lg font-extrabold text-ink mt-0.5">{transactions.length} Nota</p>
            </div>
            <div className="border-x border-brand-100">
              <p className="text-[11px] text-ink-soft flex items-center justify-center gap-1">
                <DollarSign className="w-3 h-3 text-brand-600" />
                Total Omset
              </p>
              <p className="text-lg font-extrabold text-brand-600 mt-0.5">
                Rp{(totalOmset / 1000).toFixed(0)}rb
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ink-soft flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Selesai
              </p>
              <p className="text-lg font-extrabold text-emerald-700 mt-0.5">{totalDone} Nota</p>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Transaksi Ditangani ({transactions.length})
              </h4>
              <span className="text-[11px] text-ink-soft">
                Riwayat kasir
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-10 text-center">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
                  <p className="text-xs text-ink-soft mt-2">Memuat data transaksi dari server...</p>
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((trx) => {
                  const firstItem = trx.items?.[0]
                  const remainingItemsCount = (trx.items?.length || 0) - 1

                  return (
                    <div
                      key={trx.id}
                      onClick={() => onSelectTransaction?.(trx.id)}
                      className={`p-3.5 rounded-2xl bg-brand-50/20 border border-brand-100/70 transition flex items-center justify-between text-xs ${
                        onSelectTransaction
                          ? 'cursor-pointer hover:bg-brand-50/60 hover:border-brand-300 hover:shadow-xs group'
                          : ''
                      }`}
                      title={onSelectTransaction ? "Klik untuk melihat detail transaksi" : undefined}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink group-hover:text-brand-600 transition">
                            {trx.invoiceNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            trx.status === 'DONE'
                              ? 'bg-mint/20 text-emerald-800'
                              : trx.status === 'CANCELED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sun/20 text-amber-900'
                          }`}>
                            {trx.status === 'DONE' ? 'Selesai' : trx.status === 'CANCELED' ? 'Batal' : 'Diproses'}
                          </span>
                        </div>
                        <p className="text-ink-soft mt-1 truncate max-w-[260px]">
                          Pelanggan: <strong className="text-ink">{trx.customerName}</strong> • {firstItem ? `${firstItem.packageName}` : 'Layanan Laundry'}
                          {remainingItemsCount > 0 && ` (+${remainingItemsCount} lainnya)`}
                        </p>
                        <p className="text-[10px] text-ink-soft/70 mt-0.5">
                          {new Date(trx.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-bold text-sm text-brand-600">
                          Rp{trx.totalAmount.toLocaleString('id-ID')}
                        </p>
                        {onSelectTransaction && (
                          <ChevronRight className="w-4 h-4 text-ink-soft group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-ink-soft text-center py-6">Belum ada transaksi yang diproses oleh staff ini.</p>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-6 pt-4 border-t border-brand-50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border border-brand-100 text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
