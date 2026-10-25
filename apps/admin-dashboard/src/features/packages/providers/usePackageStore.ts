import { create } from 'zustand'
import type { PackageItem, CreatePackagePayload, UpdatePackagePayload } from '../models/PackageModel'
import { PackageRepository, PackageMetrics } from '../repositories/PackageRepository'

interface PackageStore {
  packages: PackageItem[]
  metrics: PackageMetrics | null
  isLoading: boolean
  error: string | null
  activeFilter: 'ALL' | 'WEIGHT' | 'PCS'
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE'
  searchQuery: string
  sortBy: 'createdAt' | 'price' | 'estimateHours'
  direction: 'asc' | 'desc'
  fetchPackages: (token: string) => Promise<void>
  fetchMetrics: (token?: string) => Promise<void>
  addPackage: (token: string, payload: CreatePackagePayload) => Promise<void>
  updatePackage: (token: string, id: string, payload: UpdatePackagePayload) => Promise<void>
  deletePackage: (token: string, id: string) => Promise<void>
  setActiveFilter: (filter: 'ALL' | 'WEIGHT' | 'PCS') => void
  setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void
  setSearchQuery: (query: string) => void
  setSort: (sortBy: 'createdAt' | 'price' | 'estimateHours', direction: 'asc' | 'desc') => void
  resetFilters: () => void
}

const packageRepo = new PackageRepository()

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: [],
  metrics: null,
  isLoading: false,
  error: null,
  activeFilter: 'ALL',
  statusFilter: 'ALL',
  searchQuery: '',
  sortBy: 'createdAt',
  direction: 'desc',

  fetchMetrics: async (token?: string) => {
    try {
      const metrics = await packageRepo.getMetrics(token)
      set({ metrics })
    } catch (err: any) {
      console.error('Failed to fetch package metrics:', err)
    }
  },

  fetchPackages: async (token: string) => {
    set({ isLoading: true, error: null })
    try {
      const { activeFilter, statusFilter, searchQuery, sortBy, direction } = get()
      const data = await packageRepo.getAll(token, {
        name: searchQuery,
        description: searchQuery,
        type: activeFilter !== 'ALL' ? activeFilter : undefined,
        status: statusFilter,
        sortBy,
        direction
      })
      set({ packages: data, isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memuat paket laundry', isLoading: false })
    }
  },

  addPackage: async (token: string, payload: CreatePackagePayload) => {
    set({ isLoading: true, error: null })
    try {
      const created = await packageRepo.create(token, payload)
      set({ packages: [created, ...get().packages], isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menambah paket baru', isLoading: false })
      throw err
    }
  },

  updatePackage: async (token: string, id: string, payload: UpdatePackagePayload) => {
    try {
      const updated = await packageRepo.update(token, id, payload)
      set({
        packages: get().packages.map((pkg) => (pkg.id === id ? { ...pkg, ...updated } : pkg))
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal mengupdate paket' })
    }
  },

  deletePackage: async (token: string, id: string) => {
    try {
      await packageRepo.delete(token, id)
      set({
        packages: get().packages.filter((pkg) => pkg.id !== id)
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menghapus paket' })
    }
  },

  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSort: (sortBy, direction) => set({ sortBy, direction }),
  resetFilters: () => set({
    activeFilter: 'ALL',
    statusFilter: 'ALL',
    searchQuery: '',
    sortBy: 'createdAt',
    direction: 'desc'
  })
}))
