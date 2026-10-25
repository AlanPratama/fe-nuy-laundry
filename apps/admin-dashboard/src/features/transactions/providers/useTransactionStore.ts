import { create } from 'zustand'
import type { TransactionResponseDTO, CreateTransactionPayload, TransactionStatus, TransactionMetrics } from '../models/TransactionModel'
import { TransactionRepository } from '../repositories/TransactionRepository'

interface TransactionStore {
  transactions: TransactionResponseDTO[]
  metrics: TransactionMetrics | null
  isLoading: boolean
  error: string | null
  filterStatus: 'ALL' | TransactionStatus
  searchQuery: string
  sortBy: 'createdAt' | 'totalAmount'
  direction: 'asc' | 'desc'
  period: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  picFilter: string
  customerFilter: string
  packageFilter: string
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  fetchTransactions: (token?: string) => Promise<void>
  fetchMetrics: (token?: string) => Promise<void>
  createTransaction: (token: string | undefined, payload: CreateTransactionPayload) => Promise<void>
  updateTransactionStatus: (token: string | undefined, id: string, status: TransactionStatus) => Promise<void>
  updateTransactionPayment: (
    token: string | undefined, 
    id: string, 
    downPayment?: number, 
    paymentStatus?: import('../models/TransactionModel').PaymentStatus
  ) => Promise<TransactionResponseDTO>
  deleteTransaction: (token: string | undefined, id: string) => Promise<void>
  saveTransactionPhotos: (
    token: string | undefined,
    id: string,
    beforeUrls: string[],
    afterUrls: string[],
    newFiles?: { conditionBeforeFiles?: File[]; conditionAfterFiles?: File[] }
  ) => Promise<void>
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setFilterStatus: (status: 'ALL' | TransactionStatus) => void
  setSearchQuery: (query: string) => void
  setSort: (sortBy: 'createdAt' | 'totalAmount', direction: 'asc' | 'desc') => void
  setPeriod: (period: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH') => void
  setPicFilter: (picId: string) => void
  setCustomerFilter: (customerId: string) => void
  setPackageFilter: (packageId: string) => void
  resetFilters: () => void
}

const trxRepo = new TransactionRepository()

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  metrics: null,
  isLoading: false,
  error: null,
  filterStatus: 'ALL',
  searchQuery: '',
  sortBy: 'createdAt',
  direction: 'desc',
  period: 'ALL',
  picFilter: '',
  customerFilter: '',
  packageFilter: '',
  currentPage: 1,
  pageSize: 10,
  totalElements: 0,
  totalPages: 1,

  fetchMetrics: async (token?: string) => {
    try {
      const data = await trxRepo.getMetrics(token)
      set({ metrics: data })
    } catch {
      // Ignore
    }
  },

  fetchTransactions: async (token?: string) => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, filterStatus, sortBy, direction, period, picFilter, customerFilter, packageFilter, currentPage, pageSize } = get()
      const result = await trxRepo.getAll(token, {
        page: currentPage - 1,
        size: pageSize,
        name: searchQuery,
        status: filterStatus,
        sortBy,
        direction,
        period,
        picId: picFilter || undefined,
        customerId: customerFilter || undefined,
        packageId: packageFilter || undefined
      })
      set({ 
        transactions: result.transactions, 
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        isLoading: false 
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal mengambil transaksi', isLoading: false })
    }
  },

  createTransaction: async (token: string | undefined, payload: CreateTransactionPayload) => {
    set({ isLoading: true, error: null })
    try {
      await trxRepo.create(token, payload)
      await get().fetchTransactions(token)
    } catch (err: any) {
      set({ error: err?.message || 'Gagal membuat transaksi baru', isLoading: false })
      throw err
    }
  },

  updateTransactionStatus: async (token: string | undefined, id: string, status: TransactionStatus) => {
    try {
      await trxRepo.updateStatus(token, id, status)
      set({
        transactions: get().transactions.map((trx) =>
          trx.id === id ? { ...trx, status } : trx
        )
      })
    } catch (err: any) {
      set({ error: err?.message || 'Gagal update status' })
    }
  },

  updateTransactionPayment: async (
    token: string | undefined, 
    id: string, 
    downPayment?: number, 
    paymentStatus?: import('../models/TransactionModel').PaymentStatus
  ) => {
    try {
      const updated = await trxRepo.updatePayment(token, id, downPayment, paymentStatus)
      set({
        transactions: get().transactions.map((trx) =>
          trx.id === id ? { ...trx, ...updated } : trx
        )
      })
      return updated
    } catch (err: any) {
      set({ error: err?.message || 'Gagal update status pembayaran' })
      throw err
    }
  },

  deleteTransaction: async (token: string | undefined, id: string) => {
    set({ isLoading: true, error: null })
    try {
      await trxRepo.delete(token, id)
      await get().fetchTransactions(token)
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menghapus transaksi', isLoading: false })
      throw err
    }
  },

  saveTransactionPhotos: async (
    token: string | undefined,
    id: string,
    beforeUrls: string[],
    afterUrls: string[],
    newFiles?: { conditionBeforeFiles?: File[]; conditionAfterFiles?: File[] }
  ) => {
    try {
      if (
        newFiles &&
        ((newFiles.conditionBeforeFiles && newFiles.conditionBeforeFiles.length > 0) ||
          (newFiles.conditionAfterFiles && newFiles.conditionAfterFiles.length > 0))
      ) {
        await trxRepo.uploadFiles(token, id, newFiles)
        await get().fetchTransactions(token)
      } else {
        set({
          transactions: get().transactions.map((trx) =>
            trx.id === id
              ? { ...trx, conditionBeforeUrls: beforeUrls, conditionAfterUrls: afterUrls }
              : trx
          )
        })
      }
    } catch (err: any) {
      set({ error: err?.message || 'Gagal menyimpan foto transaksi' })
      throw err
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page })
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, currentPage: 1 })
  },

  setFilterStatus: (filterStatus) => set({ filterStatus, currentPage: 1 }),
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setSort: (sortBy, direction) => set({ sortBy, direction, currentPage: 1 }),
  setPeriod: (period) => set({ period, currentPage: 1 }),
  setPicFilter: (picFilter) => set({ picFilter, currentPage: 1 }),
  setCustomerFilter: (customerFilter) => set({ customerFilter, currentPage: 1 }),
  setPackageFilter: (packageFilter) => set({ packageFilter, currentPage: 1 }),
  resetFilters: () => set({
    searchQuery: '',
    filterStatus: 'ALL',
    sortBy: 'createdAt',
    direction: 'desc',
    period: 'ALL',
    picFilter: '',
    customerFilter: '',
    packageFilter: '',
    currentPage: 1
  })
}))
