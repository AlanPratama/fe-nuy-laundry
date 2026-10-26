import React, { useState, useEffect } from 'react'
import type { TransactionResponseDTO, TransactionStatus, PaymentStatus } from '@nuy-laundry/shared-types'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { ImageUploader } from './ImageUploader'
import { ReceiptPrintModal } from './ReceiptPrintModal'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { CopyButton } from '../../../components/ui/CopyButton'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { useToast } from '../../../components/ui/Toast'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useTransactionStore } from '../providers/useTransactionStore'
import { 
  X, 
  Printer, 
  Send, 
  CheckCircle2, 
  Save, 
  ExternalLink,
  Clock,
  Phone,
  User,
  Trash2,
  CreditCard,
  Edit2,
  PackageCheck
} from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  transaction: TransactionResponseDTO | null
  onUpdateStatus?: (id: string, status: TransactionStatus) => Promise<void>
  onUpdatePayment?: (id: string, downPayment?: number, status?: PaymentStatus) => Promise<void>
  onSavePhotos?: (
    id: string,
    beforeUrls: string[],
    afterUrls: string[],
    newFiles?: { conditionBeforeFiles?: File[]; conditionAfterFiles?: File[] },
    deletedFileIds?: string[]
  ) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

interface PhotoItem {
  id?: string
  url: string
}

interface NewPhotoItem {
  file: File
  url: string
}

export const TransactionDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transaction: initialTransaction,
  onUpdateStatus,
  onUpdatePayment,
  onSavePhotos,
  onDelete
}) => {
  if (!isOpen || !initialTransaction) return null

  const { user, token } = useAuthStore()
  const { markDetailDelivered, deleteTransactionFiles, getTransactionById } = useTransactionStore()
  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const { success, error: toastError } = useToast()
  const [transaction, setLocalTransaction] = useState<TransactionResponseDTO>(initialTransaction)
  const [status, setStatus] = useState<TransactionStatus>(initialTransaction.status)

  // Staged Photos state (separate existing MinIO photos from newly staged File instances)
  const [existingBefore, setExistingBefore] = useState<PhotoItem[]>([])
  const [newBefore, setNewBefore] = useState<NewPhotoItem[]>([])
  const [existingAfter, setExistingAfter] = useState<PhotoItem[]>([])
  const [newAfter, setNewAfter] = useState<NewPhotoItem[]>([])
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([])

  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Partial pickup loading states
  const [deliveringItemId, setDeliveringItemId] = useState<string | null>(null)
  const [isDeliveringAll, setIsDeliveringAll] = useState(false)

  // Payment states
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [showEditPayment, setShowEditPayment] = useState(false)
  const [editDpAmount, setEditDpAmount] = useState<number>(initialTransaction.downPayment || 0)

  useEffect(() => {
    if (initialTransaction) {
      setLocalTransaction(initialTransaction)
      setStatus(initialTransaction.status)
      setEditDpAmount(initialTransaction.downPayment || 0)
      setShowEditPayment(false)

      // Initialize existing photos
      const beforeList: PhotoItem[] = (initialTransaction.conditionBeforeUrls || []).map((url) => {
        const match = initialTransaction.transactionFiles?.find((f) => f.filePath === url || f.fileUrl === url)
        return { id: match?.id, url }
      })
      const afterList: PhotoItem[] = (initialTransaction.conditionAfterUrls || []).map((url) => {
        const match = initialTransaction.transactionFiles?.find((f) => f.filePath === url || f.fileUrl === url)
        return { id: match?.id, url }
      })

      setExistingBefore(beforeList)
      setExistingAfter(afterList)
      setNewBefore([])
      setNewAfter([])
      setDeletedFileIds([])
    }
  }, [initialTransaction])

  const handleStatusChange = async (newStatus: TransactionStatus) => {
    if (newStatus === 'CANCELED') {
      setIsCancelConfirmOpen(true)
      return
    }
    setStatus(newStatus)
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(transaction.id, newStatus)
        setLocalTransaction((prev) => ({ ...prev, status: newStatus }))
        success(`Status transaksi berhasil diperbarui menjadi ${newStatus}`)
      }
    } catch (err: any) {
      toastError(err?.message || 'Gagal memperbarui status transaksi')
    }
  }

  const handleConfirmCancel = async () => {
    setStatus('CANCELED')
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(transaction.id, 'CANCELED')
        setLocalTransaction((prev) => ({ ...prev, status: 'CANCELED' }))
        success('Transaksi berhasil dibatalkan')
      }
    } catch (err: any) {
      toastError(err?.message || 'Gagal membatalkan transaksi')
    }
    setIsCancelConfirmOpen(false)
  }

  const handleSettleFullPayment = async () => {
    if (!onUpdatePayment) return
    setIsUpdatingPayment(true)
    try {
      await onUpdatePayment(transaction.id, transaction.totalAmount, 'PAID')
      setLocalTransaction((prev) => ({
        ...prev,
        downPayment: transaction.totalAmount,
        remainingBalance: 0,
        paymentStatus: 'PAID'
      }))
      success('Pembayaran transaksi berhasil dilunasi!')
    } catch (err: any) {
      toastError(err?.message || 'Gagal memperbarui status pembayaran')
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  const handleSaveCustomPayment = async () => {
    if (!onUpdatePayment) return
    setIsUpdatingPayment(true)
    try {
      const dp = Math.max(0, editDpAmount)
      const newStatus = dp >= transaction.totalAmount ? 'PAID' : dp > 0 ? 'DOWN_PAYMENT' : 'UNPAID'
      await onUpdatePayment(transaction.id, dp, newStatus)
      setLocalTransaction((prev) => ({
        ...prev,
        downPayment: dp,
        remainingBalance: Math.max(0, transaction.totalAmount - dp),
        paymentStatus: newStatus
      }))
      success('Data pembayaran / DP berhasil diperbarui!')
      setShowEditPayment(false)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan pembayaran')
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  // Handle Partial Pickup for single item
  const handleMarkItemDelivered = async (itemId: string) => {
    setDeliveringItemId(itemId)
    try {
      await markDetailDelivered(token || undefined, itemId)
      success('Item cucian berhasil ditandai telah diambil!')
      const updated = await getTransactionById(token || undefined, transaction.id)
      if (updated) {
        setLocalTransaction(updated)
        setStatus(updated.status)
      }
    } catch (err: any) {
      toastError(err?.message || 'Gagal menandai item diambil')
    } finally {
      setDeliveringItemId(null)
    }
  }

  // Handle Pickup for all remaining undelivered items
  const handleDeliverAllItems = async () => {
    const undelivered = transaction.items?.filter((it) => !it.deliveredDate) || []
    if (undelivered.length === 0) return

    setIsDeliveringAll(true)
    try {
      for (const it of undelivered) {
        await markDetailDelivered(token || undefined, it.id)
      }
      success('Seluruh item cucian berhasil ditandai telah diambil & transaksi selesai!')
      const updated = await getTransactionById(token || undefined, transaction.id)
      if (updated) {
        setLocalTransaction(updated)
        setStatus(updated.status)
      }
    } catch (err: any) {
      toastError(err?.message || 'Gagal memproses pengambilan seluruh item')
    } finally {
      setIsDeliveringAll(false)
    }
  }

  // Handle Photo Staging & Removal without leaving stale File objects
  const handleAddBeforeFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewBefore((prev) => [...prev, { file, url: e.target!.result as string }])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveBeforeImage = (idx: number) => {
    if (idx < existingBefore.length) {
      const target = existingBefore[idx]
      if (target.id) {
        setDeletedFileIds((prev) => [...prev, target.id!])
      }
      setExistingBefore((prev) => prev.filter((_, i) => i !== idx))
    } else {
      const newIdx = idx - existingBefore.length
      setNewBefore((prev) => prev.filter((_, i) => i !== newIdx))
    }
  }

  const handleAddAfterFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewAfter((prev) => [...prev, { file, url: e.target!.result as string }])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveAfterImage = (idx: number) => {
    if (idx < existingAfter.length) {
      const target = existingAfter[idx]
      if (target.id) {
        setDeletedFileIds((prev) => [...prev, target.id!])
      }
      setExistingAfter((prev) => prev.filter((_, i) => i !== idx))
    } else {
      const newIdx = idx - existingAfter.length
      setNewAfter((prev) => prev.filter((_, i) => i !== newIdx))
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const finalBeforeUrls = existingBefore.map((e) => e.url)
      const finalAfterUrls = existingAfter.map((e) => e.url)
      const newFiles = {
        conditionBeforeFiles: newBefore.map((n) => n.file),
        conditionAfterFiles: newAfter.map((n) => n.file)
      }

      if (onSavePhotos) {
        await onSavePhotos(
          transaction.id,
          finalBeforeUrls,
          finalAfterUrls,
          newFiles,
          deletedFileIds
        )
      } else {
        if (deletedFileIds.length > 0) {
          await deleteTransactionFiles(token || undefined, deletedFileIds)
        }
      }

      success('Perubahan foto dokumentasi transaksi berhasil disimpan!')
      setNewBefore([])
      setNewAfter([])
      setDeletedFileIds([])
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      // Refresh latest transaction state
      const updated = await getTransactionById(token || undefined, transaction.id)
      if (updated) {
        setLocalTransaction(updated)
      }
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan foto dokumentasi')
    } finally {
      setIsSaving(false)
    }
  }

  const beforeDisplayUrls = [...existingBefore.map((e) => e.url), ...newBefore.map((n) => n.url)]
  const afterDisplayUrls = [...existingAfter.map((e) => e.url), ...newAfter.map((n) => n.url)]
  const hasUndeliveredItems = transaction.items?.some((it) => !it.deliveredDate)

  const handleSendWhatsApp = () => {
    const phone = (transaction.customerPhone || '').replace(/\D/g, '')
    const targetPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone || '6281234567890'
    const statusText = status === 'DONE' ? 'sudah SELESAI dan siap diantar/diambil' : 'sedang dalam proses pencucian'
    const trackingLink = `http://localhost:3000/tracking?invoice=${transaction.invoiceNumber}`

    const message = `Halo Kak ${transaction.customerName}, terima kasih telah menggunakan layanan Nuy Laundry!\n\nNota: *${transaction.invoiceNumber}*\nTotal: Rp${transaction.totalAmount.toLocaleString('id-ID')}\nStatus: *${statusText}*\n\nLacak status cucian realtime di:\n${trackingLink}\n\nTerima kasih!`
    
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <>
      {/* Full-coverage fixed overlay container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Full Backdrop with zero gap at top */}
        <div 
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />

        {/* Modal centering wrapper */}
        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-brand-50 gap-4">
              <div>
                <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Detail Transaksi</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-xl font-extrabold text-ink font-mono">{transaction.invoiceNumber}</h2>
                  <CopyButton text={transaction.invoiceNumber} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft mt-1.5">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Order: {new Date(transaction.createdAt).toLocaleString('id-ID')}
                  </p>
                  {transaction.targetDate && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px] flex items-center gap-1">
                      <span>Estimasi Selesai:</span>
                      <strong>
                        {new Date(transaction.targetDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TransactionStatusBadge status={status} />
                <button 
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-brand-50/50 border border-brand-100">
                <button
                  type="button"
                  onClick={() => setIsPrintOpen(true)}
                  className="px-4 py-2 rounded-full bg-white border border-brand-200 text-ink text-xs font-bold hover:bg-brand-50 shadow-sm transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-600" />
                  <span>Cetak Nota</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WA</span>
                </button>

                <a
                  href={`http://localhost:3000/tracking?invoice=${transaction.invoiceNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-white border border-brand-200 text-brand-600 text-xs font-bold hover:bg-brand-50 shadow-sm transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cek Resi Publik</span>
                </a>

                {/* Status Switcher with CustomSelect */}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-soft hidden sm:inline">Ubah Status:</span>
                  <div className="w-36">
                    <CustomSelect
                      size="sm"
                      value={status}
                      onChange={(val) => handleStatusChange(val as TransactionStatus)}
                      options={[
                        { value: 'IN_PROGRESS', label: 'Diproses' },
                        { value: 'DONE', label: 'Selesai' },
                        { value: 'CANCELED', label: 'Batal' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Customer & PIC Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-brand-50/40 border border-brand-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold grid place-items-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-ink-soft uppercase font-bold">Pelanggan</p>
                    <p className="font-bold text-ink text-sm truncate">{transaction.customerName}</p>
                    {transaction.customerAddress && (
                      <p className="text-[11px] text-ink-soft truncate">{transaction.customerAddress}</p>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-50/40 border border-brand-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold grid place-items-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-ink-soft uppercase font-bold">Kontak / WA</p>
                    <p className="font-bold text-ink text-sm font-mono truncate">{transaction.customerPhone || '-'}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">Terkoneksi WhatsApp</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-brand-50/40 border border-brand-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold grid place-items-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-ink-soft uppercase font-bold">PIC / Kasir</p>
                    <p className="font-bold text-ink text-sm truncate">{transaction.picName || 'Staff Outlet'}</p>
                    <p className="text-[11px] text-purple-700 font-semibold">Petugas Penerima</p>
                  </div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Rincian Paket & Tagihan</h3>
                  {hasUndeliveredItems && status !== 'CANCELED' && (
                    <button
                      type="button"
                      disabled={isDeliveringAll}
                      onClick={handleDeliverAllItems}
                      className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      title="Ambil seluruh barang yang tersisa dan selesaikan pesanan"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>{isDeliveringAll ? 'Memproses...' : 'Ambil Semua Barang (Selesai)'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {transaction.items && transaction.items.length > 0 ? (
                    transaction.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-brand-50/40 border border-brand-50 text-sm gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-ink">{item.packageName}</p>
                            {item.deliveredDate ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Diambil: {new Date(item.deliveredDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                                Belum Diambil
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-soft mt-0.5">
                            {item.quantity} {item.packageType === 'WEIGHT' ? 'Kg' : 'Pcs'} × Rp{item.pricePerUnit.toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <p className="font-bold text-ink">
                            Rp{item.subtotal.toLocaleString('id-ID')}
                          </p>

                          {!item.deliveredDate && status !== 'CANCELED' && (
                            <button
                              type="button"
                              disabled={deliveringItemId === item.id}
                              onClick={() => handleMarkItemDelivered(item.id)}
                              className="px-2.5 py-1 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                              title="Tandai item ini sudah diambil pelanggan"
                            >
                              {deliveringItemId === item.id ? '...' : 'Ambil Item'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-brand-50/40 text-sm text-ink-soft">
                      Paket cucian standar
                    </div>
                  )}
                </div>

                <div className="mt-3 p-3.5 rounded-2xl bg-brand-50 flex items-center justify-between font-extrabold text-base">
                  <span className="text-ink">Total Biaya Cucian</span>
                  <span className="text-brand-600 text-lg">Rp{transaction.totalAmount.toLocaleString('id-ID')}</span>
                </div>

                {/* Status Pembayaran & Rincian DP */}
                <div className="mt-3 p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-ink uppercase tracking-wider">Status Pembayaran</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {transaction.paymentStatus === 'PAID' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lunas
                        </span>
                      ) : transaction.paymentStatus === 'DOWN_PAYMENT' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          Uang Muka (DP)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          Belum Bayar
                        </span>
                      )}

                      {onUpdatePayment && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditDpAmount(transaction.downPayment || 0)
                            setShowEditPayment(!showEditPayment)
                          }}
                          className="p-1.5 rounded-lg text-ink-soft hover:text-brand-600 hover:bg-brand-100 transition"
                          title="Ubah nominal pembayaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-brand-100">
                    <div>
                      <span className="text-ink-soft block font-medium">Sudah Dibayar (DP):</span>
                      <span className="font-bold text-ink text-sm">
                        Rp{(transaction.downPayment || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-ink-soft block font-medium">Sisa Tagihan:</span>
                      <span className={`font-extrabold text-sm ${
                        (transaction.remainingBalance ?? Math.max(0, transaction.totalAmount - (transaction.downPayment || 0))) > 0
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}>
                        Rp{(transaction.remainingBalance ?? Math.max(0, transaction.totalAmount - (transaction.downPayment || 0))).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Inline Edit DP with CurrencyInput */}
                  {showEditPayment ? (
                    <div className="pt-2 border-t border-brand-100 space-y-2 animate-in fade-in duration-150">
                      <label className="text-[11px] font-bold text-ink-soft uppercase tracking-wider block">
                        Ubah Nominal Pembayaran / DP (Rp):
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <CurrencyInput
                            value={editDpAmount}
                            onChange={(val) => setEditDpAmount(Math.min(transaction.totalAmount, Math.max(0, val)))}
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isUpdatingPayment}
                          onClick={handleSaveCustomPayment}
                          className="px-4 py-3 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition disabled:opacity-50"
                        >
                          {isUpdatingPayment ? '...' : 'Simpan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditPayment(false)}
                          className="px-3 py-3 rounded-2xl border border-brand-200 text-ink-soft text-xs font-bold hover:bg-brand-100 transition"
                        >
                          Batal
                        </button>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditDpAmount(0)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-brand-200 text-ink-soft hover:bg-brand-50"
                        >
                          Rp0 (Belum Bayar)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditDpAmount(Math.round(transaction.totalAmount / 2))}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-brand-200 text-ink-soft hover:bg-brand-50"
                        >
                          DP 50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditDpAmount(transaction.totalAmount)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white border border-brand-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          Lunas 100%
                        </button>
                      </div>
                    </div>
                  ) : (
                    onUpdatePayment && transaction.paymentStatus !== 'PAID' && (
                      <div className="pt-2 border-t border-brand-100 flex items-center justify-between">
                        <span className="text-[11px] text-ink-soft">
                          Pelanggan membayar sisa tagihan?
                        </span>
                        <button
                          type="button"
                          disabled={isUpdatingPayment}
                          onClick={handleSettleFullPayment}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pelunasan (Bayar Lunas)</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Photo Documentation Uploader */}
              <div className="pt-2 border-t border-brand-50 space-y-6">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Dokumentasi Foto Pakaian (MinIO)</h3>
                
                <ImageUploader
                  label="Foto Kondisi Sebelum Dicuci"
                  sublabel="Foto pakaian kotor atau bukti cacat/noda awal dari pelanggan"
                  images={beforeDisplayUrls}
                  onAddFiles={handleAddBeforeFiles}
                  onRemoveImage={handleRemoveBeforeImage}
                />

                <ImageUploader
                  label="Foto Kondisi Setelah Selesai"
                  sublabel="Foto pakaian rapi, terlipat wangi, atau saat siap diantar"
                  images={afterDisplayUrls}
                  onAddFiles={handleAddAfterFiles}
                  onRemoveImage={handleRemoveAfterImage}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-5 border-t border-brand-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {canManage && onDelete && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Transaksi</span>
                  </button>
                )}

                {saveSuccess && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Perubahan berhasil disimpan!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveAll}
                  className="px-6 py-2.5 rounded-full bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Foto & Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        transaction={{ ...transaction, status }}
      />

      {/* Confirmation Modal for Status Cancellation */}
      <ConfirmationModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Batalkan Pesanan Ini?"
        message={`Apakah Anda yakin ingin membatalkan transaksi ${transaction.invoiceNumber}? Status cucian akan diubah menjadi CANCELED.`}
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        variant="danger"
      />

      {/* Confirmation Modal for Delete Transaction */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={async () => {
          if (!onDelete) return
          setIsDeleting(true)
          try {
            await onDelete(transaction.id)
            setIsDeleteConfirmOpen(false)
            onClose()
          } finally {
            setIsDeleting(false)
          }
        }}
        title="Hapus Transaksi Ini?"
        message={`Apakah Anda yakin ingin menghapus transaksi "${transaction.invoiceNumber}"? Seluruh data riwayat transaksi dan detail pakaian akan dihapus secara permanen.`}
        confirmText="Ya, Hapus Transaksi"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}
