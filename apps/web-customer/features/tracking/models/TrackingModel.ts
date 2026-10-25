import type { TransactionStatus, PackageType } from '@nuy-laundry/shared-types'

export interface TrackingStep {
  id: string
  title: string
  description: string
  time?: string
  isCompleted: boolean
  isCurrent: boolean
}

export interface TrackingItem {
  packageName: string
  packageType: PackageType
  quantity: number
  pricePerUnit: number
  subtotal: number
}

export interface TrackingResult {
  id: string
  invoiceNumber: string
  customerNameMasked: string
  status: TransactionStatus
  statusLabel: string
  totalAmount: number
  createdAt: string
  estimatedDoneAt?: string
  completedAt?: string
  items: TrackingItem[]
  conditionBeforeUrls: string[]
  conditionAfterUrls: string[]
  steps: TrackingStep[]
}
