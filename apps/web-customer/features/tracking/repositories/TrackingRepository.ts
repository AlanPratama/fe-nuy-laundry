import type { TrackingResult, TrackingStep, TrackingItem } from '../models/TrackingModel'
import type { ApiResponse } from '@nuy-laundry/shared-types'

export interface ITrackingRepository {
  trackByInvoice(invoiceOrId: string): Promise<TrackingResult>
}

export class TrackingRepository implements ITrackingRepository {
  private apiBase: string

  constructor(apiBase = 'http://localhost:8080') {
    this.apiBase = apiBase
  }

  async trackByInvoice(invoiceOrId: string): Promise<TrackingResult> {
    const trimmed = invoiceOrId.trim()
    if (!trimmed) {
      throw new Error('Nomor resi atau invoice tidak boleh kosong')
    }

    try {
      // 1. Try direct ID lookup
      let foundData: any = null
      try {
        const directRes = await fetch(`${this.apiBase}/api/v1/transactions/${encodeURIComponent(trimmed)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        if (directRes.ok) {
          const json: ApiResponse<any> = await directRes.json()
          if (json && json.data) {
            foundData = json.data
          }
        }
      } catch {
        // ID lookup failed, continue to query search
      }

      // 2. If not found by direct ID, search via list endpoint
      if (!foundData) {
        try {
          const listRes = await fetch(`${this.apiBase}/api/v1/transactions?size=50&name=${encodeURIComponent(trimmed)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          if (listRes.ok) {
            const json = await listRes.json()
            const content: any[] = json.data?.content || []
            foundData = content.find((trx: any) => 
              (trx.invoiceNo && trx.invoiceNo.toLowerCase() === trimmed.toLowerCase()) ||
              (trx.invoiceNumber && trx.invoiceNumber.toLowerCase() === trimmed.toLowerCase()) ||
              (trx.id && trx.id.toLowerCase() === trimmed.toLowerCase())
            )
          }
        } catch {
          // List lookup failed
        }
      }

      if (foundData) {
        return this.mapDtoToTrackingResult(foundData)
      }
    } catch {
      // Backend offline or unreachable
    }

    throw new Error(`Data transaksi dengan nomor "${trimmed}" tidak ditemukan. Silakan periksa kembali atau hubungi WhatsApp admin kami.`)
  }

  private mapDtoToTrackingResult(dto: any): TrackingResult {
    const isDone = dto.status === 'DONE'
    const isCanceled = dto.status === 'CANCELED'

    const invoiceNumber = dto.invoiceNumber || dto.invoiceNo || dto.id || 'INV-UNKNOWN'
    const totalAmount = typeof dto.totalAmount === 'number' 
      ? dto.totalAmount 
      : Number(dto.totalPrice || 0)
    const downPayment = Number(dto.downPayment || 0)
    const remainingAmount = Math.max(0, totalAmount - downPayment)
    const paymentStatus = dto.paymentStatus || (dto.isPaid ? 'PAID' : (downPayment > 0 ? 'DOWN_PAYMENT' : 'UNPAID'))

    const createdAt = dto.createdAt || dto.orderDate || new Date().toISOString()
    const customerName = dto.customerName || dto.customer?.name || 'Pelanggan Nuy'

    // Map items from transactionDetails or items
    let items: TrackingItem[] = []
    if (Array.isArray(dto.items) && dto.items.length > 0) {
      items = dto.items.map((item: any) => ({
        packageName: item.packageName || 'Layanan Laundry',
        packageType: item.packageType || 'WEIGHT',
        quantity: item.quantity || 1,
        pricePerUnit: item.pricePerUnit || 0,
        subtotal: item.subtotal || 0
      }))
    } else if (Array.isArray(dto.transactionDetails) && dto.transactionDetails.length > 0) {
      items = dto.transactionDetails.map((det: any) => {
        const qty = det.quantity || 1
        const price = det.pkg?.price || (qty ? Math.round(Number(det.totalPrice || 0) / qty) : 0)
        return {
          packageName: det.pkg?.name || det.packageName || 'Layanan Laundry',
          packageType: det.pkg?.type || det.packageType || 'WEIGHT',
          quantity: qty,
          pricePerUnit: price,
          subtotal: Number(det.totalPrice || (qty * price))
        }
      })
    } else if (dto.packageName) {
      items = [
        {
          packageName: dto.packageName,
          packageType: dto.packageType || 'WEIGHT',
          quantity: dto.quantity || 1,
          pricePerUnit: dto.pricePerUnit || totalAmount,
          subtotal: totalAmount
        }
      ]
    }

    // Map photos from transactionFiles or direct URL arrays
    let conditionBeforeUrls: string[] = []
    let conditionAfterUrls: string[] = []

    if (Array.isArray(dto.transactionFiles) && dto.transactionFiles.length > 0) {
      conditionBeforeUrls = dto.transactionFiles
        .filter((f: any) => f.type === 'BEFORE' && f.fileUrl)
        .map((f: any) => f.fileUrl)
      conditionAfterUrls = dto.transactionFiles
        .filter((f: any) => f.type === 'AFTER' && f.fileUrl)
        .map((f: any) => f.fileUrl)
    } else {
      if (Array.isArray(dto.conditionBeforeUrls)) {
        conditionBeforeUrls = dto.conditionBeforeUrls
      }
      if (Array.isArray(dto.conditionAfterUrls)) {
        conditionAfterUrls = dto.conditionAfterUrls
      }
    }

    const createdTimeStr = createdAt 
      ? new Date(createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      : undefined

    const updatedTimeStr = dto.updatedAt || dto.deliveredDate
      ? new Date(dto.updatedAt || dto.deliveredDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      : undefined

    const steps: TrackingStep[] = [
      {
        id: '1',
        title: 'Pesanan Diterima',
        description: 'Pakaian telah diterima oleh kasir outlet dan nota resi digital telah diterbitkan.',
        time: createdTimeStr,
        isCompleted: true,
        isCurrent: !isDone && dto.status !== 'IN_PROGRESS'
      },
      {
        id: '2',
        title: 'Proses Pencucian dan Pengemasan',
        description: 'Pakaian dicuci 1 mesin 1 pelanggan, disetrika uap temperatur tepat, dan dikemas rapi.',
        time: undefined, // Jam/menit dihapus sesuai request
        isCompleted: isDone || dto.status === 'IN_PROGRESS',
        isCurrent: !isDone && dto.status === 'IN_PROGRESS'
      },
      {
        id: '3',
        title: 'Selesai',
        description: 'Cucian telah selesai, wangi, rapi, dan siap diambil atau diantarkan ke alamat Anda.',
        time: isDone ? updatedTimeStr : undefined,
        isCompleted: isDone,
        isCurrent: false
      }
    ]

    return {
      id: dto.id,
      invoiceNumber,
      customerNameMasked: this.maskName(customerName),
      status: dto.status || 'IN_PROGRESS',
      statusLabel: isDone ? 'Selesai & Siap Diantar' : isCanceled ? 'Dibatalkan' : 'Sedang Diproses',
      paymentStatus,
      downPayment,
      remainingAmount,
      totalAmount,
      createdAt,
      completedAt: isDone ? (dto.updatedAt || dto.deliveredDate) : undefined,
      items,
      conditionBeforeUrls,
      conditionAfterUrls,
      steps
    }
  }

  private maskName(name: string): string {
    const parts = name.split(' ')
    return parts.map(p => (p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p[0] + '*')).join(' ')
  }
}
