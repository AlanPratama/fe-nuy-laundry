import React from 'react'
import type { TransactionResponseDTO } from '@nuy-laundry/shared-types'
import { useSettingsStore } from '../../settings/providers/useSettingsStore'
import { Printer, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  transaction: TransactionResponseDTO
}

export const ReceiptPrintModal: React.FC<Props> = ({ isOpen, onClose, transaction }) => {
  const { profile } = useSettingsStore()

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const outletName = profile?.outletName || 'Nuy Laundry'
  const outletAddress = profile?.address || ''
  const outletPhone = profile?.phone ? `WA: ${profile.phone}` : ''
  const footerNote = profile?.receiptFooterNote || '1 Mesin 1 Pelanggan • Higienis & Wangi'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:static">
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity print:hidden" 
        onClick={onClose} 
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center print:p-0">
        <div 
          className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-card border border-brand-50 relative text-left my-6 print:my-0 print:shadow-none print:border-none print:w-full print:max-w-none animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-50 print:hidden">
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Cetak Struk Nota</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="mt-4 font-mono text-xs text-ink space-y-4">
          {/* Brand & Outlet Header */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold font-sans tracking-tight">{outletName}</h2>
            {outletAddress && <p className="text-[11px] text-ink-soft">{outletAddress}</p>}
            {outletPhone && <p className="text-[11px] text-ink-soft">{outletPhone}</p>}
            <div className="border-b border-dashed border-ink/20 my-2"></div>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-bold">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(transaction.createdAt).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-semibold">{transaction.customerName}</span>
            </div>
            {transaction.customerPhone && (
              <div className="flex justify-between">
                <span>Telepon:</span>
                <span>{transaction.customerPhone}</span>
              </div>
            )}
            <div className="border-b border-dashed border-ink/20 my-2"></div>
          </div>

          {/* Item details */}
          <div className="space-y-2">
            {transaction.items && transaction.items.length > 0 ? (
              transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold">{item.packageName}</div>
                  <div className="flex justify-between text-ink-soft">
                    <span>
                      {item.quantity} {item.packageType === 'WEIGHT' ? 'Kg' : 'Pcs'} × Rp{item.pricePerUnit.toLocaleString('id-ID')}
                    </span>
                    <span className="text-ink font-semibold">
                      Rp{item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span>Paket Layanan</span>
                <span>Rp{transaction.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="border-b border-dashed border-ink/20 my-2"></div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between font-extrabold text-base">
              <span>TOTAL BIAYA</span>
              <span>Rp{transaction.totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-ink-soft">
              <span>Sudah Dibayar (DP):</span>
              <span className="font-semibold text-ink">
                Rp{(transaction.downPayment || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-ink-soft">
              <span>Sisa Tagihan:</span>
              <span className={`font-bold ${
                (transaction.remainingBalance ?? Math.max(0, transaction.totalAmount - (transaction.downPayment || 0))) > 0
                  ? 'text-rose-600'
                  : 'text-emerald-700'
              }`}>
                Rp{(transaction.remainingBalance ?? Math.max(0, transaction.totalAmount - (transaction.downPayment || 0))).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-ink-soft">
              <span>Status Bayar:</span>
              <span className="font-bold text-ink uppercase">
                {transaction.paymentStatus === 'PAID' ? 'LUNAS' : transaction.paymentStatus === 'DOWN_PAYMENT' ? 'UANG MUKA (DP)' : 'BELUM BAYAR'}
              </span>
            </div>
            <div className="flex justify-between text-xs text-ink-soft">
              <span>Status Cucian:</span>
              <span className="font-bold text-ink uppercase">{transaction.status}</span>
            </div>
            <div className="border-b border-dashed border-ink/20 my-3"></div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-ink-soft space-y-1">
            <p>{footerNote}</p>
            <p>Simpan nota ini untuk pengambilan pakaian.</p>
            <p className="pt-2 font-bold text-ink">Terima Kasih atas Kepercayaan Anda!</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 pt-4 border-t border-brand-50 flex gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-brand-100 text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 rounded-full bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Nota</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}

