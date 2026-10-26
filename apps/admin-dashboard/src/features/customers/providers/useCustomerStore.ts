import { create } from 'zustand'
import type { CustomerItem, CustomerStats, CustomerPayload } from '../models/CustomerModel'
import { CustomerRepository, CustomerMetrics } from '../repositories/CustomerRepository'

interface CustomerStore {
  customers: CustomerItem[]
  stats: CustomerStats | null
  metrics: CustomerMetrics | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  phoneQuery: string
  addressQuery: string
  sortBy: 'lastOrderDate' | 'totalOrders' | 'totalSpent' | 'name'
  direction: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  selectedCustomer: CustomerItem | null
  fetchCustomers: (token?: string) => Promise<void>
  fetchMetrics: (token?: string) => Promise<void>
  addCustomer: (token: string | undefined, payload: CustomerPayload) => Promise<void>
  updateCustomer: (token: string | undefined, id: string, payload: CustomerPayload) => Promise<void>
  deleteCustomer: (token: string | undefined, id: string) => Promise<void>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSearchQuery: (query: string) => void
  setPhoneQuery: (phone: string) => void
  setAddressQuery: (address: string) => void
  setSort: (sortBy: 'lastOrderDate' | 'totalOrders' | 'totalSpent' | 'name', direction: 'asc' | 'desc') => void
  setSelectedCustomer: (customer: CustomerItem | null) => void
  initFilters: (filters: {
    searchQuery?: string
    phoneQuery?: string
    addressQuery?: string
    sortBy?: 'lastOrderDate' | 'totalOrders' | 'totalSpent' | 'name'
    direction?: 'asc' | 'desc'
    currentPage?: number
    pageSize?: number
  }) => void
  resetFilters: () => void
}

const customerRepo = new CustomerRepository()

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  stats: null,
  metrics: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  phoneQuery: '',
  addressQuery: '',
  sortBy: 'lastOrderDate',
  direction: 'desc',
  currentPage: 1,
  pageSize: 10,
  totalElements: 0,
  totalPages: 1,
  selectedCustomer: null,

  fetchMetrics: async (token?: string) => {
    try {
      const metrics = await customerRepo.getMetrics(token)
      set({ metrics })
    } catch (err: any) {
      console.error('Failed to fetch customer metrics:', err)
    }
  },

  fetchCustomers: async (token?: string) => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, phoneQuery, addressQuery, sortBy, direction, currentPage, pageSize } = get()
      const result = await customerRepo.getAll(token, {
        page: currentPage - 1,
        size: pageSize,
        name: searchQuery,
        phone: phoneQuery,
        address: addressQuery,
        sortBy,
        direction
      })
      set({
        customers: result.customers,
        stats: result.stats,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        isLoading: false
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memuat pelanggan', isLoading: false })
    }
  },

  addCustomer: async (token: string | undefined, payload: CustomerPayload) => {
    set({ isLoading: true, error: null })
    try {
      await customerRepo.create(token, payload)
      await get().fetchCustomers(token)
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menambah pelanggan baru', isLoading: false })
      throw err
    }
  },

  updateCustomer: async (token: string | undefined, id: string, payload: CustomerPayload) => {
    set({ isLoading: true, error: null })
    try {
      await customerRepo.update(token, id, payload)
      await get().fetchCustomers(token)
    } catch (err: any) {
      set({ error: err?.message || 'Gagal memperbarui data pelanggan', isLoading: false })
      throw err
    }
  },

  deleteCustomer: async (token: string | undefined, id: string) => {
    set({ isLoading: true, error: null })
    try {
      await customerRepo.delete(token, id)
      await get().fetchCustomers(token)
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menghapus pelanggan', isLoading: false })
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
  setPhoneQuery: (phoneQuery) => set({ phoneQuery, currentPage: 1 }),
  setAddressQuery: (addressQuery) => set({ addressQuery, currentPage: 1 }),
  setSort: (sortBy, direction) => set({ sortBy, direction, currentPage: 1 }),
  setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
  initFilters: (filters) => {
    set({
      ...(filters.searchQuery !== undefined && { searchQuery: filters.searchQuery }),
      ...(filters.phoneQuery !== undefined && { phoneQuery: filters.phoneQuery }),
      ...(filters.addressQuery !== undefined && { addressQuery: filters.addressQuery }),
      ...(filters.sortBy !== undefined && { sortBy: filters.sortBy }),
      ...(filters.direction !== undefined && { direction: filters.direction }),
      ...(filters.currentPage !== undefined && { currentPage: filters.currentPage }),
      ...(filters.pageSize !== undefined && { pageSize: filters.pageSize })
    })
  },
  resetFilters: () => set({
    searchQuery: '',
    phoneQuery: '',
    addressQuery: '',
    sortBy: 'lastOrderDate',
    direction: 'desc',
    currentPage: 1
  })
}))
