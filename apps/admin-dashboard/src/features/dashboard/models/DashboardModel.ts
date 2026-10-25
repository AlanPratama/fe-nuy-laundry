export interface DailyRevenue {
  day: string
  date: string
  revenue: number
  weightKg: number
}

export interface ExpressQueueItem {
  id: string
  invoiceNumber: string
  customerName: string
  packageName: string
  quantity: number
  deadlineTime: string
  remainingMinutes: number
  status: 'IN_PROGRESS' | 'DONE'
}

export interface MachineStatus {
  id: string
  name: string
  capacityKg: number
  status: 'WASHING' | 'DRYING' | 'IDLE'
  remainingMinutes?: number
  currentInvoice?: string
}

export interface DashboardMetrics {
  todayRevenue: number
  todayRevenueGrowth: string
  todayWeightKg: number
  activeOrdersCount: number
  doneOrdersCount: number
  newCustomersToday: number
  weeklyRevenue: DailyRevenue[]
  expressQueue: ExpressQueueItem[]
  machines: MachineStatus[]
}
