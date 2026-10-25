import React from 'react'
import type { CustomerItem } from '../models/CustomerModel'
import { Phone, MapPin, History, Send, Edit3, Trash2, Calendar, ShoppingBag, Weight } from 'lucide-react'

interface CustomerCardProps {
  customer: CustomerItem
  canManage: boolean
  onOpenHistory: (customer: CustomerItem) => void
  onEdit: (customer: CustomerItem) => void
  onDelete: (customer: CustomerItem) => void
  onOpenWhatsApp: (e: React.MouseEvent, customer: CustomerItem) => void
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  canManage,
  onOpenHistory,
  onEdit,
  onDelete,
  onOpenWhatsApp
}) => {
  return (
    <div 
      onClick={() => onOpenHistory(customer)}
      className="bg-white rounded-3xl border border-brand-50 p-5 shadow-card hover:shadow-soft hover:border-brand-200 transition duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Header: Avatar + Name + WhatsApp */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-base grid place-items-center shadow-soft shrink-0 group-hover:scale-105 transition">
              {customer.name ? customer.name[0].toUpperCase() : 'C'}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-ink text-base truncate group-hover:text-brand-600 transition" title={customer.name}>
                {customer.name}
              </h3>
              <p className="text-xs text-ink-soft flex items-center gap-1.5 mt-0.5 truncate font-mono">
                <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{customer.phone || '-'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => onOpenWhatsApp(e, customer)}
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white grid place-items-center transition shrink-0 shadow-xs"
            title="Chat WhatsApp"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address */}
        <div className="mt-3.5 flex items-start gap-1.5 text-xs text-ink-soft">
          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed" title={customer.address}>
            {customer.address && customer.address !== '-' ? customer.address : 'Alamat belum diisi'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-brand-50/40 border border-brand-50/80 text-center">
          <div>
            <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block">Order</span>
            <span className="text-sm font-extrabold text-ink">{customer.totalOrders}x</span>
          </div>
          <div className="border-x border-brand-100/60">
            <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block">Cucian</span>
            <span className="text-sm font-extrabold text-brand-600">{customer.totalWeightKg} kg</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block">Belanja</span>
            <span className="text-sm font-extrabold text-ink">
              Rp{customer.totalSpent >= 1000000 
                ? `${(customer.totalSpent / 1000000).toFixed(1)}jt` 
                : `${(customer.totalSpent / 1000).toFixed(0)}rb`}
            </span>
          </div>
        </div>

        {/* Last Order Date */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-ink-soft px-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-ink-soft/70" />
            Order Terakhir:
          </span>
          <span className="font-semibold text-ink">
            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div 
        className="mt-4 pt-3.5 border-t border-brand-50 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenHistory(customer)}
          className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition inline-flex items-center gap-1.5 shadow-xs"
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat ({customer.totalOrders})</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(customer)}
            className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white grid place-items-center transition shrink-0"
            title="Edit data pelanggan"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => onDelete(customer)}
              className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition shrink-0"
              title="Hapus pelanggan"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
