import React from 'react'
import type { CustomerItem } from '../models/CustomerModel'
import { X, Phone, MapPin, Send, ExternalLink, ChevronRight } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  customer: CustomerItem | null
  onSelectTransaction?: (transactionId: string) => void
}

export const CustomerHistoryModal: React.FC<Props> = ({ isOpen, onClose, customer, onSelectTransaction }) => {
  if (!isOpen || !customer) return null

  const handleOpenWhatsApp = () => {
    const raw = customer.phone.replace(/\D/g, '')
    const phone = raw.startsWith('0') ? '62' + raw.slice(1) : raw
    const text = `Halo Kak ${customer.name}, salam hangat dari Nuy Laundry! Apakah ada pakaian yang perlu kami jemput hari ini?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-brand-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-base grid place-items-center shadow-soft">
              {customer.name[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">{customer.name}</h3>
              <p className="text-xs text-ink-soft flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                {customer.phone}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Quick Stats */}
        <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-2xl bg-brand-50/40 border border-brand-50 text-center">
          <div>
            <p className="text-[11px] text-ink-soft">Total Order</p>
            <p className="text-lg font-extrabold text-ink">{customer.totalOrders}x</p>
          </div>
          <div className="border-x border-brand-100">
            <p className="text-[11px] text-ink-soft">Total Cucian</p>
            <p className="text-lg font-extrabold text-brand-600">{customer.totalWeightKg} Kg</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-soft">Total Belanja</p>
            <p className="text-lg font-extrabold text-ink">Rp{(customer.totalSpent / 1000).toFixed(0)}rb</p>
          </div>
        </div>

        {customer.address && (
          <p className="text-xs text-ink-soft flex items-center gap-1.5 mb-5 px-1">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Alamat: {customer.address}</span>
          </p>
        )}

        {/* History List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              Riwayat Nota Transaksi ({customer.history?.length || 0})
            </h4>
            <span className="text-[11px] text-ink-soft">
              Total {customer.totalOrders} order
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {customer.history && customer.history.length > 0 ? (
              customer.history.map((h) => (
                <div 
                  key={h.id}
                  onClick={() => onSelectTransaction?.(h.id)}
                  className={`p-3.5 rounded-2xl bg-brand-50/20 border border-brand-100/70 transition flex items-center justify-between text-xs ${
                    onSelectTransaction 
                      ? 'cursor-pointer hover:bg-brand-50/60 hover:border-brand-300 hover:shadow-xs group' 
                      : ''
                  }`}
                  title={onSelectTransaction ? "Klik untuk melihat detail lengkap transaksi" : undefined}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink group-hover:text-brand-600 transition">{h.invoiceNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        h.status === 'DONE' 
                          ? 'bg-mint/20 text-emerald-800' 
                          : h.status === 'CANCELED' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-sun/20 text-amber-900'
                      }`}>
                        {h.status === 'DONE' ? 'Selesai' : h.status === 'CANCELED' ? 'Batal' : 'Diproses'}
                      </span>
                    </div>
                    <p className="text-ink-soft mt-1 truncate max-w-[240px]">
                      {h.packageName} • {h.quantity} {h.unit}
                    </p>
                    <p className="text-[10px] text-ink-soft/70 mt-0.5">
                      {new Date(h.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-bold text-sm text-brand-600">
                      Rp{h.totalAmount.toLocaleString('id-ID')}
                    </p>
                    {onSelectTransaction && (
                      <ChevronRight className="w-4 h-4 text-ink-soft group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-soft text-center py-6">Belum ada riwayat transaksi.</p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-brand-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Hubungi via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-brand-100 text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}


