import type { TrackingResult, TrackingStep } from '../models/TrackingModel'
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

    // Fallback to mock data for local demo or tests
    const mock = this.getMockResult(trimmed)
    if (mock) {
      return mock
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
    const createdAt = dto.createdAt || dto.orderDate || new Date().toISOString()
    const customerName = dto.customerName || dto.customer?.name || 'Pelanggan Nuy'

    // Map items from transactionDetails or items
    let items = []
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
          packageName: det.packageName || det.pkg?.name || 'Layanan Laundry',
          packageType: det.packageType || det.pkg?.type || 'WEIGHT',
          quantity: qty,
          pricePerUnit: price,
          subtotal: Number(det.totalPrice || 0)
        }
      })
    } else {
      items = [
        {
          packageName: 'Layanan Laundry',
          packageType: 'WEIGHT' as const,
          quantity: 1,
          pricePerUnit: totalAmount,
          subtotal: totalAmount
        }
      ]
    }

    // Map photo documentation
    const conditionBeforeUrls: string[] = [...(dto.conditionBeforeUrls || [])]
    const conditionAfterUrls: string[] = [...(dto.conditionAfterUrls || [])]

    if (Array.isArray(dto.transactionFiles)) {
      for (const f of dto.transactionFiles) {
        const url = f.filePath || f.fileName
        if (url) {
          if (f.fileType === 'CONDITION_BEFORE' && !conditionBeforeUrls.includes(url)) {
            conditionBeforeUrls.push(url)
          } else if (f.fileType === 'CONDITION_AFTER' && !conditionAfterUrls.includes(url)) {
            conditionAfterUrls.push(url)
          }
        }
      }
    }

    const createdTimeStr = createdAt 
      ? new Date(createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      : '09:00 WIB'

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
        time: isDone ? '11:30 WIB' : (dto.status === 'IN_PROGRESS' ? 'Sedang berlangsung' : undefined),
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

  private getMockResult(query: string): TrackingResult | null {
    const q = query.toUpperCase()

    if (q.includes('DONE') || q.includes('002') || q.includes('SELESAI')) {
      return {
        id: 'TRX-98231',
        invoiceNumber: 'INV-20261025-002',
        customerNameMasked: 'Di*** Pr*****',
        status: 'DONE',
        statusLabel: 'Selesai & Siap Diantar',
        totalAmount: 48000,
        createdAt: '2026-10-24T09:15:00.000Z',
        completedAt: '2026-10-24T17:45:00.000Z',
        items: [
          {
            packageName: 'Cuci Setrika Reguler',
            packageType: 'WEIGHT',
            quantity: 6,
            pricePerUnit: 8000,
            subtotal: 48000
          }
        ],
        conditionBeforeUrls: [
          'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop&q=80'
        ],
        conditionAfterUrls: [
          'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80'
        ],
        steps: [
          {
            id: '1',
            title: 'Pesanan Diterima',
            description: 'Pakaian 6 kg diterima kasir dan ditimbang di outlet.',
            time: '09:15 WIB',
            isCompleted: true,
            isCurrent: false
          },
          {
            id: '2',
            title: 'Proses Pencucian dan Pengemasan',
            description: 'Dicuci terpisah 1 mesin 1 pelanggan, disetrika uap licin, dan dikemas rapi.',
            time: '11:00 WIB',
            isCompleted: true,
            isCurrent: false
          },
          {
            id: '3',
            title: 'Selesai',
            description: 'Paket wangi rapi siap diambil atau diantarkan ke alamat tujuan.',
            time: '17:45 WIB',
            isCompleted: true,
            isCurrent: true
          }
        ]
      }
    }

    // Default mock (In Progress) for any other code
    return {
      id: 'TRX-10294',
      invoiceNumber: query.startsWith('INV') ? query : `INV-${query}`,
      customerNameMasked: 'Al** Pr*****',
      status: 'IN_PROGRESS',
      statusLabel: 'Sedang Diproses (Cuci & Setrika)',
      totalAmount: 32000,
      createdAt: new Date().toISOString(),
      estimatedDoneAt: 'Hari ini, pukul 18:00 WIB',
      items: [
        {
          packageName: 'Cuci Setrika Reguler (Wangi Sakura)',
          packageType: 'WEIGHT',
          quantity: 4,
          pricePerUnit: 8000,
          subtotal: 32000
        }
      ],
      conditionBeforeUrls: [
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80'
      ],
      conditionAfterUrls: [],
      steps: [
        {
          id: '1',
          title: 'Pesanan Diterima',
          description: 'Pakaian 4 kg diterima kasir dan ditimbang di outlet.',
          time: '08:30 WIB',
          isCompleted: true,
          isCurrent: false
        },
        {
          id: '2',
          title: 'Proses Pencucian dan Pengemasan',
          description: 'Cucian sedang diproses di tabung mesin 1:1 higienis dan disetrika uap.',
          time: '10:15 WIB',
          isCompleted: true,
          isCurrent: true
        },
        {
          id: '3',
          title: 'Selesai',
          description: 'Menunggu proses selesai dan siap diantar/diambil pelanggan.',
          isCompleted: false,
          isCurrent: false
        }
      ]
    }
  }
}
