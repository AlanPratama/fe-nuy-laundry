import type { DashboardMetrics } from '../models/DashboardModel'
import type { ApiResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

export interface IDashboardRepository {
  getMetrics(token?: string): Promise<DashboardMetrics>
}

export class DashboardRepository implements IDashboardRepository {
  async getMetrics(token?: string): Promise<DashboardMetrics> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await apiClient.get<ApiResponse<DashboardMetrics>>('/api/v1/dashboard/metrics', { headers })
      if (res.data?.data) return res.data.data
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat metrik dashboard')
      }
    }

    return {
      todayRevenue: 0,
      todayRevenueGrowth: '+0%',
      todayWeightKg: 0,
      activeOrdersCount: 0,
      doneOrdersCount: 0,
      newCustomersToday: 0,
      weeklyRevenue: [],
      expressQueue: [],
      machines: []
    }
  }
}

