import type { TransactionResponseDTO, CreateTransactionPayload, TransactionStatus, TransactionQueryParams, TransactionPageResult } from '../models/TransactionModel'
import type { ApiResponse, PageResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

function formatLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export interface ITransactionRepository {
  getAll(token?: string, params?: TransactionQueryParams): Promise<TransactionPageResult>
  getById(id: string, token?: string): Promise<TransactionResponseDTO>
  create(token?: string, payload?: CreateTransactionPayload): Promise<TransactionResponseDTO>
  updateStatus(token?: string, id?: string, status?: TransactionStatus): Promise<TransactionResponseDTO>
  updatePayment(token?: string, id?: string, downPayment?: number, paymentStatus?: import('../models/TransactionModel').PaymentStatus): Promise<TransactionResponseDTO>
  delete(token?: string, id?: string): Promise<void>
  uploadFiles(token?: string, transactionId?: string, files?: { conditionBeforeFiles?: File[]; conditionAfterFiles?: File[] }): Promise<void>
  getMetrics(token?: string): Promise<import('../models/TransactionModel').TransactionMetrics>
}

export class TransactionRepository implements ITransactionRepository {
  async getById(id: string, _token?: string): Promise<TransactionResponseDTO> {
    const res = await apiClient.get<ApiResponse<any>>(`/api/v1/transactions/${id}`)
    if (res.data?.data) {
      return this.normalizeTransaction(res.data.data)
    }
    throw new Error('Transaksi tidak ditemukan')
  }

  async getMetrics(_token?: string): Promise<import('../models/TransactionModel').TransactionMetrics> {
    try {
      const res = await apiClient.get<ApiResponse<import('../models/TransactionModel').TransactionMetrics>>('/api/v1/transactions/metrics')
      if (res.data?.data) return res.data.data
    } catch (e) {
      console.error('Failed to get transaction metrics', e)
    }
    return {
      totalTransactions: 0,
      inProgressCount: 0,
      doneCount: 0,
      canceledCount: 0,
      totalRevenue: 0
    }
  }

  async getAll(_token?: string, params?: TransactionQueryParams): Promise<TransactionPageResult> {
    const page = params?.page ?? 0
    const size = params?.size ?? 10

    let startDate: string | undefined
    let endDate: string | undefined

    if (params?.period && params.period !== 'ALL') {
      const now = new Date()
      endDate = formatLocalIso(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59))

      if (params.period === 'TODAY') {
        startDate = formatLocalIso(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0))
      } else if (params.period === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        startDate = formatLocalIso(new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate(), 0, 0, 0))
      } else if (params.period === 'MONTH') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        startDate = formatLocalIso(new Date(monthAgo.getFullYear(), monthAgo.getMonth(), monthAgo.getDate(), 0, 0, 0))
      }
    }

    try {
      const res = await apiClient.get<ApiResponse<PageResponse<any>>>('/api/v1/transactions', {
        params: {
          page,
          size,
          name: params?.name || undefined,
          status: (params?.status && params.status !== 'ALL') ? params.status : undefined,
          paymentStatus: (params?.paymentStatus && params.paymentStatus !== 'ALL') ? params.paymentStatus : undefined,
          startDate,
          endDate,
          picId: params?.picId || undefined,
          userId: params?.picId || undefined,
          customerId: params?.customerId || undefined,
          packageId: params?.packageId || undefined,
          sortBy: params?.sortBy === 'totalAmount' ? 'totalPrice' : 'createdAt',
          direction: params?.direction || 'desc'
        }
      })

      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        const transactions = res.data.data.content.map((raw: any) => this.normalizeTransaction(raw))
        const totalElements = res.data.data.totalElements ?? transactions.length
        const totalPages = res.data.data.totalPages ?? Math.max(1, Math.ceil(totalElements / size))

        return {
          transactions,
          totalElements,
          totalPages,
          page,
          size
        }
      }
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat transaksi')
      }
    }

    return {
      transactions: [],
      totalElements: 0,
      totalPages: 1,
      page,
      size
    }
  }

  async create(_token?: string, payload?: CreateTransactionPayload): Promise<TransactionResponseDTO> {
    if (!payload) throw new Error('Payload required')

    let customerId = payload.customerId || 'cust-default'
    if (!payload.customerId) {
      try {
        const custRes = await apiClient.get<ApiResponse<PageResponse<any>>>('/api/v1/customers', {
          params: { name: payload.customerName, size: 5 }
        })
        const found = custRes.data?.data?.content?.find((c: any) => 
          c.name?.toLowerCase() === payload.customerName.toLowerCase()
        )
        if (found?.id) {
          customerId = found.id
        } else {
          const newCustRes = await apiClient.post<ApiResponse<any>>('/api/v1/customers', {
            name: payload.customerName,
            phone: payload.customerPhone || '',
            address: 'Residensial'
          })
          if (newCustRes.data?.data?.id) {
            customerId = newCustRes.data.data.id
          }
        }
      } catch {
        // Customer lookup fallback
      }
    }

    let userId = 'user-default'
    try {
      const authUser = localStorage.getItem('nuy_user')
      if (authUser) {
        const parsed = JSON.parse(authUser)
        if (parsed.id) userId = parsed.id
      }
    } catch {
      // User profile fallback
    }

    // Add 60s buffer to prevent @FutureOrPresent validation error due to slight client/server clock skew
    const nowIso = formatLocalIso(new Date(Date.now() + 60000))

    // 1. Resolve package items
    const rawItems = (payload.items && payload.items.length > 0)
      ? payload.items
      : [{
          packageId: undefined,
          packageName: payload.packageName || 'Paket Laundry',
          packageType: payload.packageType || 'WEIGHT',
          quantity: payload.quantity || 1,
          pricePerUnit: payload.pricePerUnit || 0
        }]

    // Load available packages to resolve package IDs accurately
    let allPkgs: any[] = []
    try {
      const pkgRes = await apiClient.get<ApiResponse<PageResponse<any>>>('/api/v1/packages', {
        params: { size: 100 }
      })
      allPkgs = pkgRes.data?.data?.content || []
    } catch {
      // ignore
    }

    const transactionDetails = rawItems.map((item) => {
      let resolvedPkgId = item.packageId
      if (!resolvedPkgId) {
        const match = allPkgs.find((p: any) => p.name?.toLowerCase() === item.packageName?.toLowerCase())
        if (match) resolvedPkgId = match.id
      }
      if (!resolvedPkgId && allPkgs.length > 0) {
        resolvedPkgId = allPkgs[0].id
      }
      return {
        packageId: resolvedPkgId || 'pkg-default',
        quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
        orderDate: nowIso
      }
    })

    const totalCalc = rawItems.reduce((sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.pricePerUnit) || 0), 0)
    const dp = typeof payload.downPayment === 'number' ? payload.downPayment : 0
    let calcPaymentStatus = payload.paymentStatus
    if (!calcPaymentStatus) {
      if (dp >= totalCalc && totalCalc > 0) calcPaymentStatus = 'PAID'
      else if (dp > 0) calcPaymentStatus = 'DOWN_PAYMENT'
      else calcPaymentStatus = 'UNPAID'
    }

    const requestDTO = {
      customerId,
      userId,
      orderDate: nowIso,
      status: 'IN_PROGRESS',
      downPayment: dp,
      paymentStatus: calcPaymentStatus,
      transactionDetails
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )

    if (payload.conditionBeforeFiles && payload.conditionBeforeFiles.length > 0) {
      payload.conditionBeforeFiles.forEach((file) => {
        formData.append('conditionBeforeFiles', file)
      })
    }

    const res = await apiClient.post<ApiResponse<any>>('/api/v1/transactions', formData)
    if (res.data?.data) {
      return this.normalizeTransaction(res.data.data)
    }

    throw new Error('Gagal menyimpan transaksi ke backend')
  }

  async updateStatus(_token?: string, id?: string, status?: TransactionStatus): Promise<TransactionResponseDTO> {
    if (!id || !status) throw new Error('ID and status required')

    const res = await apiClient.patch<ApiResponse<any>>(`/api/v1/transactions/${id}/status`, {
      status
    })
    if (res.data?.data) {
      return this.normalizeTransaction(res.data.data)
    }

    throw new Error('Gagal mengubah status transaksi')
  }

  async updatePayment(_token?: string, id?: string, downPayment?: number, paymentStatus?: import('../models/TransactionModel').PaymentStatus): Promise<TransactionResponseDTO> {
    if (!id) throw new Error('ID is required')

    const res = await apiClient.patch<ApiResponse<any>>(`/api/v1/transactions/${id}/payment`, {
      downPayment,
      paymentStatus
    })
    if (res.data?.data) {
      return this.normalizeTransaction(res.data.data)
    }

    throw new Error('Gagal memperbarui status pembayaran transaksi')
  }

  async delete(_token?: string, id?: string): Promise<void> {
    if (!id) return
    await apiClient.delete(`/api/v1/transactions/${id}`)
  }

  async uploadFiles(
    _token?: string,
    transactionId?: string,
    files?: { conditionBeforeFiles?: File[]; conditionAfterFiles?: File[] }
  ): Promise<void> {
    if (!transactionId || !files) return

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify({ transactionId })], { type: 'application/json' })
    )

    if (files.conditionBeforeFiles && files.conditionBeforeFiles.length > 0) {
      files.conditionBeforeFiles.forEach((f) => formData.append('conditionBeforeFiles', f))
    }
    if (files.conditionAfterFiles && files.conditionAfterFiles.length > 0) {
      files.conditionAfterFiles.forEach((f) => formData.append('conditionAfterFiles', f))
    }

    await apiClient.post('/api/v1/transaction-files', formData)
  }

  private normalizeTransaction(raw: any): TransactionResponseDTO {
    const invoiceNumber = raw.invoiceNumber || raw.invoiceNo || raw.id || 'INV-UNKNOWN'
    const totalAmount = typeof raw.totalAmount === 'number' 
      ? raw.totalAmount 
      : Number(raw.totalPrice || 0)
    const createdAt = raw.createdAt || raw.orderDate || new Date().toISOString()

    let items = []
    if (Array.isArray(raw.items) && raw.items.length > 0) {
      items = raw.items
    } else if (Array.isArray(raw.transactionDetails) && raw.transactionDetails.length > 0) {
      items = raw.transactionDetails.map((det: any) => {
        const pkg = det.pkg || {}
        const qty = det.quantity || 1
        const price = Number(det.totalPrice ? det.totalPrice / qty : pkg.price || 8000)
        return {
          id: det.id || `item-${Math.random()}`,
          packageId: det.packageId || pkg.id || 'PKG-1',
          packageName: det.packageName || pkg.name || 'Paket Layanan',
          packageType: det.packageType || pkg.type || 'WEIGHT',
          pricePerUnit: price,
          quantity: qty,
          subtotal: Number(det.totalPrice || price * qty)
        }
      })
    } else {
      items = [
        {
          id: `item-${raw.id || '1'}`,
          packageId: 'PKG-1',
          packageName: 'Layanan Cuci Komplit',
          packageType: 'WEIGHT',
          pricePerUnit: totalAmount,
          quantity: 1,
          subtotal: totalAmount
        }
      ]
    }

    let beforeUrls: string[] = []
    let afterUrls: string[] = []
    let otherUrls: string[] = []

    if (Array.isArray(raw.conditionBeforeUrls)) beforeUrls = raw.conditionBeforeUrls
    if (Array.isArray(raw.conditionAfterUrls)) afterUrls = raw.conditionAfterUrls
    if (Array.isArray(raw.otherUrls)) otherUrls = raw.otherUrls

    if (Array.isArray(raw.transactionFiles) && raw.transactionFiles.length > 0) {
      raw.transactionFiles.forEach((f: any) => {
        const url = f.filePath || f.fileUrl
        if (url) {
          if (f.fileType === 'CONDITION_BEFORE') beforeUrls.push(url)
          else if (f.fileType === 'CONDITION_AFTER') afterUrls.push(url)
          else otherUrls.push(url)
        }
      })
    }

    return {
      id: raw.id,
      invoiceNumber,
      customerName: raw.customer?.name || raw.customerName || 'Pelanggan Walk-In',
      customerPhone: raw.customer?.phone || raw.customerPhone || '-',
      customerAddress: raw.customer?.address || raw.customerAddress || '',
      customerId: raw.customer?.id || raw.customerId,
      picName: raw.user?.name || raw.user?.username || 'Staff Kasir',
      picPhone: raw.user?.phone || '',
      targetDate: raw.targetDate,
      orderDate: raw.orderDate,
      status: raw.status || 'IN_PROGRESS',
      downPayment: typeof raw.downPayment === 'number' ? raw.downPayment : 0,
      remainingBalance: typeof raw.remainingBalance === 'number' 
        ? raw.remainingBalance 
        : Math.max(0, totalAmount - (Number(raw.downPayment) || 0)),
      paymentStatus: raw.paymentStatus || (
        (Number(raw.downPayment) || 0) >= totalAmount && totalAmount > 0 
          ? 'PAID' 
          : (Number(raw.downPayment) || 0) > 0 
            ? 'DOWN_PAYMENT' 
            : 'UNPAID'
      ),
      totalAmount,
      items,
      conditionBeforeUrls: beforeUrls,
      conditionAfterUrls: afterUrls,
      otherUrls,
      createdAt
    }
  }
}
