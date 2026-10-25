import { create } from 'zustand'
import type { DashboardMetrics } from '../models/DashboardModel'
import { DashboardRepository } from '../repositories/DashboardRepository'

interface DashboardStore {
  metrics: DashboardMetrics | null
  isLoading: boolean
  error: string | null
  fetchMetrics: (token: string) => Promise<void>
}

const dashboardRepo = new DashboardRepository()

export const useDashboardStore = create<DashboardStore>((set) => ({
  metrics: null,
  isLoading: false,
  error: null,

  fetchMetrics: async (token: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await dashboardRepo.getMetrics(token)
      set({ metrics: data, isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memuat analitik', isLoading: false })
    }
  }
}))
