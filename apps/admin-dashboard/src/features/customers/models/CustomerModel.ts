export interface CustomerHistoryItem {
  id: string
  invoiceNumber: string
  packageName: string
  quantity: number
  unit: string
  totalAmount: number
  status: 'IN_PROGRESS' | 'DONE' | 'CANCELED'
  createdAt: string
}

export interface CustomerItem {
  id: string
  name: string
  phone: string
  address?: string
  totalOrders: number
  totalSpent: number
  totalWeightKg: number
  lastOrderDate: string
  history?: CustomerHistoryItem[]
}

export interface CustomerStats {
  totalCustomers: number
  activeThisMonth: number
  repeatOrderRate: string
}

export interface CustomerQueryParams {
  page?: number
  size?: number
  name?: string
  phone?: string
  address?: string
  sortBy?: 'lastOrderDate' | 'totalOrders' | 'totalSpent' | 'name'
  direction?: 'asc' | 'desc'
}

export interface CustomerPageResult {
  customers: CustomerItem[]
  stats: CustomerStats
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export interface CustomerPayload {
  name: string
  phone?: string
  address?: string
}
