import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTransactionStore } from '../providers/useTransactionStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useToast } from '../../../components/ui/Toast'
import { TransactionStatusBadge } from '../components/TransactionStatusBadge'
import { TransactionCard } from '../components/TransactionCard'
import { NewTransactionModal } from '../components/NewTransactionModal'
import { TransactionDetailModal } from '../components/TransactionDetailModal'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { FilterModal } from '../../../components/ui/FilterModal'
import { Pagination } from '../../../components/ui/Pagination'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { SearchableSelect, type SearchableOption } from '../../../components/ui/SearchableSelect'
import { CopyButton } from '../../../components/ui/CopyButton'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { SettingsRepository } from '../../settings/repositories/SettingsRepository'
import { CustomerRepository } from '../../customers/repositories/CustomerRepository'
import { PackageRepository } from '../../packages/repositories/PackageRepository'
import type { TransactionResponseDTO } from '@nuy-laundry/shared-types'
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShoppingBag,
  TrendingUp,
  Filter,
  Eye,
  RotateCcw,
  Trash2,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react'

const settingsRepo = new SettingsRepository()
const customerRepo = new CustomerRepository()
const packageRepo = new PackageRepository()

export const TransactionsPage: React.FC = () => {
  const { user, token } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const { 
    transactions, 
    metrics,
    isLoading, 
    fetchTransactions, 
    fetchMetrics,
    createTransaction, 
    updateTransactionStatus,
    updateTransactionPayment,
    deleteTransaction,
    saveTransactionPhotos,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortBy,
    direction,
    period,
    picFilter,
    customerFilter,
    packageFilter,
    setPicFilter,
    setCustomerFilter,
    setPackageFilter,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    setPage,
    setPageSize,
    setSort,
    setPeriod,
    resetFilters
  } = useTransactionStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDTO | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const [transactionToDelete, setTransactionToDelete] = useState<TransactionResponseDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Initial State from URL params
  const urlQ = searchParams.get('q') || ''
  const urlStatus = (searchParams.get('status') as any) || 'ALL'
  const urlPeriod = (searchParams.get('period') as any) || 'ALL'
  const urlPic = searchParams.get('pic') || ''
  const urlCust = searchParams.get('customerId') || ''
  const urlPkg = searchParams.get('packageId') || ''
  const urlView = (searchParams.get('view') as 'card' | 'table') || 'table'
  const urlSortParam = searchParams.get('sort') || 'createdAt:desc'
  const [urlSortField, urlSortDir] = (urlSortParam.includes(':') ? urlSortParam.split(':') : ['createdAt', 'desc']) as ['createdAt' | 'totalAmount', 'asc' | 'desc']
  const urlPage = parseInt(searchParams.get('page') || '1', 10) || 1
  const urlSize = parseInt(searchParams.get('size') || '10', 10) || 10

  const [viewMode, setViewMode] = useState<'card' | 'table'>(urlView)
  const [searchInput, setSearchInput] = useState(urlQ)
  const debouncedSearch = useDebounce(searchInput, 350)

  // Filter Modal Temporary State
  const [tempStatus, setTempStatus] = useState(filterStatus)
  const [tempPeriod, setTempPeriod] = useState(period)
  const [tempSort, setTempSort] = useState(`${sortBy}:${direction}`)
  const [tempPic, setTempPic] = useState(picFilter)
  const [tempCust, setTempCust] = useState(customerFilter)
  const [tempPkg, setTempPkg] = useState(packageFilter)

  // Options for filter dropdowns
  const [staffOptions, setStaffOptions] = useState<SearchableOption[]>([])
  const [customerOptions, setCustomerOptions] = useState<SearchableOption[]>([])
  const [packageOptions, setPackageOptions] = useState<SearchableOption[]>([])

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // Initialize store from URL on first mount
  useEffect(() => {
    if (urlQ !== searchQuery) setSearchQuery(urlQ)
    if (urlStatus !== filterStatus) setFilterStatus(urlStatus)
    if (urlPeriod !== period) setPeriod(urlPeriod)
    if (urlPic !== picFilter) setPicFilter(urlPic)
    if (urlCust !== customerFilter) setCustomerFilter(urlCust)
    if (urlPkg !== packageFilter) setPackageFilter(urlPkg)
    if (urlSortField !== sortBy || urlSortDir !== direction) setSort(urlSortField, urlSortDir)
    if (urlPage !== currentPage) setPage(urlPage)
    if (urlSize !== pageSize) setPageSize(urlSize)
  }, [])

  // Sync debounced search to URL params and store
  useEffect(() => {
    setSearchQuery(debouncedSearch)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) {
        next.set('q', debouncedSearch)
      } else {
        next.delete('q')
        next.delete('search')
      }
      if (debouncedSearch !== urlQ) {
        next.set('page', '1')
        setPage(1)
      }
      return next
    }, { replace: true })
  }, [debouncedSearch])

  // Helper to update URL params
  const updateUrlParams = (updater: (params: URLSearchParams) => void) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      updater(next)
      return next
    }, { replace: true })
  }

  const handleViewModeChange = (mode: 'card' | 'table') => {
    setViewMode(mode)
    updateUrlParams((p) => {
      if (mode !== 'table') p.set('view', mode)
      else p.delete('view')
    })
  }

  // Handle page & size changes with URL sync
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateUrlParams((p) => p.set('page', String(newPage)))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    updateUrlParams((p) => {
      p.set('size', String(newSize))
      p.set('page', '1')
    })
  }

  // Fetch metrics once and when transactions change
  useEffect(() => {
    fetchMetrics(token || undefined)
  }, [token, fetchMetrics])

  useEffect(() => {
    fetchTransactions(token || undefined)
  }, [token, fetchTransactions, searchQuery, filterStatus, sortBy, direction, period, picFilter, customerFilter, packageFilter, currentPage, pageSize])

  // Load dropdown options for FilterModal
  useEffect(() => {
    settingsRepo.getStaffList(token || undefined, { size: 50 }).then((res) => {
      setStaffOptions([
        { value: '', label: 'Semua Staff (PIC)' },
        ...res.staffList.map((s) => ({ 
          value: s.id, 
          label: s.name,
          sublabel: `@${s.username} • ${s.role}`
        }))
      ])
    }).catch(() => {})

    customerRepo.getAll(token || undefined, { size: 100, sortBy: 'name', direction: 'asc' }).then((res) => {
      setCustomerOptions([
        { value: '', label: 'Semua Pelanggan' },
        ...res.customers.map((c) => ({ 
          value: c.id, 
          label: c.name,
          sublabel: c.phone ? `Telp: ${c.phone}` : 'Tanpa nomor telepon'
        }))
      ])
    }).catch(() => {})

    packageRepo.getAll(token || undefined).then((pkgs) => {
      setPackageOptions([
        { value: '', label: 'Semua Paket Layanan' },
        ...pkgs.map((p) => ({ 
          value: p.id, 
          label: p.name,
          sublabel: `Rp${p.price.toLocaleString('id-ID')} • Estimasi ${p.daysEstimation || 1} Hari`,
          badge: p.type === 'WEIGHT' ? 'Kiloan' : 'Satuan'
        }))
      ])
    }).catch(() => {})
  }, [token])

  const activeFilterCount = 
    (filterStatus !== 'ALL' ? 1 : 0) + 
    (period !== 'ALL' ? 1 : 0) + 
    (sortBy !== 'createdAt' || direction !== 'desc' ? 1 : 0) +
    (picFilter ? 1 : 0) +
    (customerFilter ? 1 : 0) +
    (packageFilter ? 1 : 0)

  const handleOpenFilterModal = () => {
    setTempStatus(filterStatus)
    setTempPeriod(period)
    setTempSort(`${sortBy}:${direction}`)
    setTempPic(picFilter)
    setTempCust(customerFilter)
    setTempPkg(packageFilter)
    setIsFilterModalOpen(true)
  }

  const handleApplyFilter = () => {
    setFilterStatus(tempStatus)
    setPeriod(tempPeriod)
    setPicFilter(tempPic)
    setCustomerFilter(tempCust)
    setPackageFilter(tempPkg)
    const [field, dir] = tempSort.split(':') as ['createdAt' | 'totalAmount', 'asc' | 'desc']
    setSort(field, dir)
    setPage(1)

    updateUrlParams((p) => {
      if (tempStatus !== 'ALL') p.set('status', tempStatus)
      else p.delete('status')

      if (tempPeriod !== 'ALL') p.set('period', tempPeriod)
      else p.delete('period')

      if (tempPic) p.set('pic', tempPic)
      else p.delete('pic')

      if (tempCust) p.set('customerId', tempCust)
      else p.delete('customerId')

      if (tempPkg) p.set('packageId', tempPkg)
      else p.delete('packageId')

      if (tempSort !== 'createdAt:desc') p.set('sort', tempSort)
      else p.delete('sort')

      p.set('page', '1')
    })
  }

  const handleResetModal = () => {
    setTempStatus('ALL')
    setTempPeriod('ALL')
    setTempSort('createdAt:desc')
    setTempPic('')
    setTempCust('')
    setTempPkg('')
    setSearchInput('')
    resetFilters()

    updateUrlParams((p) => {
      p.delete('status')
      p.delete('period')
      p.delete('pic')
      p.delete('customerId')
      p.delete('packageId')
      p.delete('sort')
      p.delete('q')
      p.delete('search')
      p.set('page', '1')
    })
  }

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return
    setIsDeleting(true)
    try {
      await deleteTransaction(token || undefined, transactionToDelete.id)
      fetchMetrics(token || undefined)
      success('Transaksi berhasil dihapus')
      setTransactionToDelete(null)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus transaksi')
    } finally {
      setIsDeleting(false)
    }
  }

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Waktu Order (Terbaru)' },
    { value: 'createdAt:asc', label: 'Waktu Order (Terlama)' },
    { value: 'totalAmount:desc', label: 'Nominal Tertinggi' },
    { value: 'totalAmount:asc', label: 'Nominal Terendah' }
  ]

  const handleRowClick = (trx: TransactionResponseDTO) => {
    setSelectedTransaction(trx)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="space-y-8 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
              Operasional Harian
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Transaksi & Antrean Kasir
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Monitor seluruh order masuk, timbang kiloan, dan estimasi waktu penyelesaian cucian.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-sm shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi Baru</span>
        </button>
      </div>

      {/* Metric Count Cards (Dedicated /api/v1/transactions/metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Total Transaksi</p>
            <p className="text-2xl font-extrabold text-ink mt-1">
              {(metrics?.totalTransactions ?? totalElements).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-brand-600 font-semibold mt-1">Semua order tercatat</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Sedang Diproses</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {metrics?.inProgressCount ?? 0}
            </p>
            <p className="text-xs text-amber-700 font-semibold mt-1">Antrean mesin & setrika</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sun/20 text-amber-700 grid place-items-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Selesai Diambil</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {metrics?.doneCount ?? 0}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Pakaian sudah di customer</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-emerald-700 grid place-items-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Total Pendapatan</p>
            <p className="text-2xl font-extrabold text-brand-600 mt-1">
              Rp{((metrics?.totalRevenue ?? 0)).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-brand-600 font-semibold mt-1">Akumulasi seluruh transaksi</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search, Filter Bar, and View Mode Toggle */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari no invoice, nama customer, atau telepon..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Card vs Table View Mode Switcher */}
          <div className="flex items-center bg-brand-50/70 border border-brand-100 rounded-full p-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleViewModeChange('table')}
              className={`p-2 rounded-full transition flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-ink-soft hover:text-ink'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('card')}
              className={`p-2 rounded-full transition flex items-center gap-1.5 text-xs font-bold ${
                viewMode === 'card'
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-ink-soft hover:text-ink'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenFilterModal}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              activeFilterCount > 0
                ? 'bg-brand-600 text-white shadow-soft hover:bg-brand-700'
                : 'bg-brand-50 text-ink hover:bg-brand-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-brand-600 text-[10px] grid place-items-center font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {(activeFilterCount > 0 || searchInput) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                handleResetModal()
              }}
              className="p-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Card or Table View */}
      {viewMode === 'card' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-12 text-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-card">
              <span className="w-6 h-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin inline-block mr-2"></span>
              Memuat data transaksi...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-card">
              Tidak ada transaksi yang sesuai dengan filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {transactions.map((trx) => (
                <TransactionCard
                  key={trx.id}
                  transaction={trx}
                  onDetail={handleRowClick}
                  onDelete={canManage ? setTransactionToDelete : undefined}
                  canManage={canManage}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[9, 18, 36, 90]}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-brand-50 shadow-card overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-brand-50/60 text-ink font-bold text-xs uppercase tracking-wider border-b border-brand-50">
                <tr>
                  <th className="py-4 px-6 w-52">No. Invoice</th>
                  <th className="py-4 px-6 w-52">Pelanggan</th>
                  <th className="py-4 px-6 w-44">Layanan</th>
                  <th className="py-4 px-6 w-36">Kasir (PIC)</th>
                  <th className="py-4 px-6 w-44">Estimasi Selesai</th>
                  <th className="py-4 px-6 w-36">Total Biaya</th>
                  <th className="py-4 px-6 w-44">Pembayaran</th>
                  <th className="py-4 px-6 w-32">Status Cucian</th>
                  <th className="py-4 px-6 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-ink-soft">
                      <span className="w-6 h-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin inline-block mr-2"></span>
                      Memuat data transaksi...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-ink-soft">
                      Tidak ada transaksi yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr 
                      key={trx.id} 
                      onClick={() => handleRowClick(trx)}
                      className="hover:bg-brand-50/40 transition cursor-pointer"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-brand-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span>{trx.invoiceNumber}</span>
                          <CopyButton text={trx.invoiceNumber} />
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-bold text-ink truncate" title={trx.customerName}>{trx.customerName}</p>
                          <p className="text-xs text-ink-soft truncate font-mono">{trx.customerPhone || '-'}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="min-w-0 max-w-[180px]">
                          <p className="font-medium text-ink truncate" title={trx.items?.[0]?.packageName || 'Layanan Laundry'}>
                            {trx.items?.[0]?.packageName || 'Layanan Laundry'}
                          </p>
                          <p className="text-xs text-ink-soft truncate">
                            {trx.items?.[0]?.quantity || 1} {trx.items?.[0]?.packageType === 'PCS' ? 'pcs' : 'kg'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs font-semibold text-ink px-2.5 py-1 rounded-full bg-brand-50/70 border border-brand-100">
                          {trx.picName || 'Kasir'}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {trx.targetDate ? (
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {new Date(trx.targetDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-soft">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6 font-bold text-ink whitespace-nowrap">
                        Rp{trx.totalAmount?.toLocaleString('id-ID')}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {trx.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Lunas
                          </span>
                        ) : trx.paymentStatus === 'DOWN_PAYMENT' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              DP: Rp{(trx.downPayment || 0).toLocaleString('id-ID')}
                            </span>
                            <p className="text-[11px] font-semibold text-rose-600">
                              Sisa: Rp{(trx.remainingBalance ?? Math.max(0, (trx.totalAmount || 0) - (trx.downPayment || 0))).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Belum Bayar
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <TransactionStatusBadge status={trx.status} />
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleRowClick(trx)}
                            className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition inline-flex items-center gap-1 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          {canManage && (
                            <button
                              type="button"
                              onClick={() => setTransactionToDelete(trx)}
                              className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition shrink-0"
                              title="Hapus transaksi"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Advanced Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onReset={handleResetModal}
        onApply={handleApplyFilter}
        title="Filter & Urutkan Transaksi"
        subtitle="Saring antrean transaksi berdasarkan PIC kasir, pelanggan, paket, dan status pengerjaan."
        activeCount={activeFilterCount}
      >
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Status Pengerjaan
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'IN_PROGRESS', label: 'Diproses' },
              { id: 'DONE', label: 'Selesai' },
              { id: 'CANCELED', label: 'Batal' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setTempStatus(st.id as any)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition text-center ${
                  tempStatus === st.id
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-brand-50/70 text-ink-soft hover:bg-brand-100 hover:text-ink'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Periode Waktu
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'TODAY', label: 'Hari Ini' },
              { id: 'WEEK', label: '7 Hari' },
              { id: 'MONTH', label: 'Bulan Ini' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTempPeriod(p.id as any)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition text-center ${
                  tempPeriod === p.id
                    ? 'bg-ink text-white shadow-soft'
                    : 'bg-brand-50/70 text-ink-soft hover:bg-brand-100 hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Filter PIC (Kasir)
            </label>
            <SearchableSelect
              value={tempPic}
              onChange={setTempPic}
              options={staffOptions.length > 0 ? staffOptions : [{ value: '', label: 'Semua Staff' }]}
              placeholder="Pilih Staff (PIC)..."
              searchPlaceholder="Cari nama staff..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Filter Paket Layanan
            </label>
            <SearchableSelect
              value={tempPkg}
              onChange={setTempPkg}
              options={packageOptions.length > 0 ? packageOptions : [{ value: '', label: 'Semua Paket' }]}
              placeholder="Pilih Paket Layanan..."
              searchPlaceholder="Cari nama paket layanan..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Filter Pelanggan
          </label>
          <SearchableSelect
            value={tempCust}
            onChange={setTempCust}
            options={customerOptions.length > 0 ? customerOptions : [{ value: '', label: 'Semua Pelanggan' }]}
            placeholder="Pilih Pelanggan..."
            searchPlaceholder="Cari nama atau telepon pelanggan..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Urutkan Transaksi
          </label>
          <CustomSelect
            value={tempSort}
            onChange={setTempSort}
            options={sortOptions}
          />
        </div>
      </FilterModal>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await createTransaction(token || undefined, payload)
          fetchMetrics(token || undefined)
        }}
      />

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        onUpdateStatus={async (id, newStatus) => {
          await updateTransactionStatus(token || undefined, id, newStatus)
          fetchMetrics(token || undefined)
          if (selectedTransaction && selectedTransaction.id === id) {
            setSelectedTransaction({ ...selectedTransaction, status: newStatus })
          }
        }}
        onUpdatePayment={async (id, downPayment, status) => {
          const updated = await updateTransactionPayment(token || undefined, id, downPayment, status)
          fetchMetrics(token || undefined)
          if (selectedTransaction && selectedTransaction.id === id) {
            setSelectedTransaction(updated)
          }
        }}
        onSavePhotos={async (id, beforeUrls, afterUrls, newFiles) => {
          await saveTransactionPhotos(token || undefined, id, beforeUrls, afterUrls, newFiles)
          if (selectedTransaction && selectedTransaction.id === id) {
            setSelectedTransaction({ ...selectedTransaction, conditionBeforeUrls: beforeUrls, conditionAfterUrls: afterUrls })
          }
        }}
        onDelete={canManage ? async (id) => {
          await deleteTransaction(token || undefined, id)
          fetchMetrics(token || undefined)
        } : undefined}
      />

      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteTransaction}
        title="Hapus Transaksi?"
        message={`Apakah Anda yakin ingin menghapus transaksi "${transactionToDelete?.invoiceNumber}"? Tindakan ini akan menghapus riwayat transaksi secara permanen.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
