import type { 
  TransactionResponseDTO, 
  TransactionStatus, 
  PackageType,
  PaymentStatus
} from '@nuy-laundry/shared-types'

export type { TransactionResponseDTO, TransactionStatus, PackageType, PaymentStatus }

export interface CreateTransactionItem {
  packageId?: string
  packageName: string
  packageType: PackageType
  quantity: number
  pricePerUnit: number
}

export interface CreateTransactionPayload {
  customerId?: string
  customerName: string
  customerPhone?: string
  items?: CreateTransactionItem[]
  packageName?: string
  packageType?: PackageType
  quantity?: number
  pricePerUnit?: number
  downPayment?: number
  paymentStatus?: PaymentStatus
  conditionBeforeFiles?: File[]
}

export interface TransactionQueryParams {
  page?: number
  size?: number
  name?: string
  status?: string
  paymentStatus?: string
  sortBy?: 'createdAt' | 'totalAmount'
  direction?: 'asc' | 'desc'
  period?: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  picId?: string
  userId?: string
  customerId?: string
  packageId?: string
}

export interface TransactionMetrics {
  totalTransactions: number
  inProgressCount: number
  doneCount: number
  canceledCount: number
  totalRevenue: number
}

export interface TransactionPageResult {
  transactions: TransactionResponseDTO[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
