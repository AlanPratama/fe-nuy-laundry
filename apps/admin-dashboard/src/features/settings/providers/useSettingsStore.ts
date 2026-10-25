import { create } from 'zustand'
import type { OutletProfile, StaffUser, CreateStaffPayload, UpdateStaffPayload } from '../models/SettingsModel'
import { SettingsRepository, StaffMetrics } from '../repositories/SettingsRepository'

interface SettingsStore {
  profile: OutletProfile | null
  staffList: StaffUser[]
  staffMetrics: StaffMetrics | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  roleFilter: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE'
  sortBy: 'createdAt' | 'name'
  direction: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  fetchProfile: (token?: string) => Promise<void>
  fetchProfileAndStaff: (token?: string) => Promise<void>
  fetchStaffList: (token?: string) => Promise<void>
  fetchStaffMetrics: (token?: string) => Promise<void>
  updateProfile: (token: string | undefined, profile: OutletProfile) => Promise<void>
  addStaff: (token: string | undefined, payload: CreateStaffPayload) => Promise<void>
  updateStaff: (token: string | undefined, id: string, payload: UpdateStaffPayload) => Promise<void>
  deleteStaff: (token: string | undefined, id: string) => Promise<void>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchQuery: (query: string) => void
  setRoleFilter: (role: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'STAFF') => void
  setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void
  setSort: (sortBy: 'createdAt' | 'name', direction: 'asc' | 'desc') => void
  resetFilters: () => void
}

const settingsRepo = new SettingsRepository()

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  profile: localStorage.getItem('nuy_outlet_profile') 
    ? JSON.parse(localStorage.getItem('nuy_outlet_profile')!) 
    : null,
  staffList: [],
  staffMetrics: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  roleFilter: 'ALL',
  statusFilter: 'ALL',
  sortBy: 'createdAt',
  direction: 'desc',
  currentPage: 1,
  pageSize: 10,
  totalElements: 0,
  totalPages: 1,

  fetchProfile: async (token?: string) => {
    try {
      const profile = await settingsRepo.getProfile(token)
      if (profile) {
        localStorage.setItem('nuy_outlet_profile', JSON.stringify(profile))
        set({ profile })
      }
    } catch (err: any) {
      console.warn('Failed to fetch outlet profile:', err)
    }
  },

  fetchStaffMetrics: async (token?: string) => {
    try {
      const staffMetrics = await settingsRepo.getStaffMetrics(token)
      set({ staffMetrics })
    } catch (err: any) {
      console.error('Failed to fetch staff metrics:', err)
    }
  },

  fetchProfileAndStaff: async (token?: string) => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, roleFilter, statusFilter, sortBy, direction, currentPage, pageSize } = get()
      const [profile, staffResult] = await Promise.all([
        settingsRepo.getProfile(token),
        settingsRepo.getStaffList(token, {
          page: currentPage - 1,
          size: pageSize,
          name: searchQuery,
          role: roleFilter,
          status: statusFilter,
          sortBy,
          direction
        })
      ])
      set({ 
        profile, 
        staffList: staffResult.staffList, 
        totalElements: staffResult.totalElements,
        totalPages: staffResult.totalPages,
        isLoading: false 
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memuat pengaturan', isLoading: false })
    }
  },

  fetchStaffList: async (token?: string) => {
    try {
      const { searchQuery, roleFilter, statusFilter, sortBy, direction, currentPage, pageSize } = get()
      const staffResult = await settingsRepo.getStaffList(token, {
        page: currentPage - 1,
        size: pageSize,
        name: searchQuery,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        direction
      })
      set({ 
        staffList: staffResult.staffList, 
        totalElements: staffResult.totalElements,
        totalPages: staffResult.totalPages 
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memuat daftar staff' })
    }
  },

  updateProfile: async (token: string | undefined, profile: OutletProfile) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await settingsRepo.updateProfile(token, profile)
      set({ profile: updated, isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menyimpan profil outlet', isLoading: false })
      throw err
    }
  },

  addStaff: async (token: string | undefined, payload: CreateStaffPayload) => {
    set({ isLoading: true, error: null })
    try {
      await settingsRepo.addStaff(token, payload)
      await get().fetchStaffList(token)
      set({ isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menambahkan staff baru', isLoading: false })
      throw err
    }
  },

  updateStaff: async (token: string | undefined, id: string, payload: UpdateStaffPayload) => {
    set({ isLoading: true, error: null })
    try {
      await settingsRepo.updateStaff(token, id, payload)
      await get().fetchStaffList(token)
      set({ isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memperbarui data staff', isLoading: false })
      throw err
    }
  },

  deleteStaff: async (token: string | undefined, id: string) => {
    set({ isLoading: true, error: null })
    try {
      await settingsRepo.deleteStaff(token, id)
      await get().fetchStaffList(token)
      set({ isLoading: false })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menghapus akun staff', isLoading: false })
      throw err
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page })
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 })
  },

  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setRoleFilter: (roleFilter) => set({ roleFilter, currentPage: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
  setSort: (sortBy, direction) => set({ sortBy, direction, currentPage: 1 }),
  resetFilters: () => set({
    searchQuery: '',
    roleFilter: 'ALL',
    statusFilter: 'ALL',
    sortBy: 'createdAt',
    direction: 'desc',
    currentPage: 1
  })
}))
