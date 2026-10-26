import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCustomerStore } from '../providers/useCustomerStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useToast } from '../../../components/ui/Toast'
import { CustomerHistoryModal } from '../components/CustomerHistoryModal'
import { CustomerFormModal } from '../components/CustomerFormModal'
import { CustomerCard } from '../components/CustomerCard'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { FilterModal } from '../../../components/ui/FilterModal'
import { Pagination } from '../../../components/ui/Pagination'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { TransactionDetailModal } from '../../transactions/components/TransactionDetailModal'
import { TransactionRepository } from '../../transactions/repositories/TransactionRepository'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import type { CustomerItem, CustomerPayload } from '../models/CustomerModel'
import type { TransactionResponseDTO, TransactionStatus } from '@nuy-laundry/shared-types'
import { 
  Search, 
  Users, 
  UserCheck, 
  Repeat, 
  Send, 
  History, 
  Filter, 
  MapPin, 
  Phone, 
  RotateCcw, 
  UserPlus, 
  Edit3, 
  Trash2,
  LayoutGrid,
  List
} from 'lucide-react'

const transactionRepo = new TransactionRepository()

export const CustomersPage: React.FC = () => {
  const { user, token } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const { 
    customers, 
    stats, 
    metrics,
    isLoading, 
    searchQuery, 
    phoneQuery, 
    addressQuery,
    sortBy,
    direction,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    fetchCustomers,
    fetchMetrics,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setPage,
    setPageSize,
    setSearchQuery,
    setPhoneQuery,
    setAddressQuery,
    setSort,
    initFilters,
    resetFilters
  } = useCustomerStore()

  // 1. Initial State from URL params
  const urlQ = searchParams.get('q') || ''
  const urlPhone = searchParams.get('phone') || ''
  const urlAddress = searchParams.get('address') || ''
  const urlView = (searchParams.get('view') as 'card' | 'table') || 'table'
  const urlSortParam = searchParams.get('sort') || 'lastOrderDate:desc'
  const [urlSortField, urlSortDir] = (urlSortParam.includes(':') ? urlSortParam.split(':') : ['lastOrderDate', 'desc']) as ['lastOrderDate' | 'totalOrders' | 'totalSpent' | 'name', 'asc' | 'desc']
  const urlPage = parseInt(searchParams.get('page') || '1', 10) || 1
  const urlSize = parseInt(searchParams.get('size') || '10', 10) || 10

  const [viewMode, setViewMode] = useState<'card' | 'table'>(urlView)
  const [searchInput, setSearchInput] = useState(urlQ)
  const debouncedSearch = useDebounce(searchInput, 350)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null)

  // Transaction detail popup from customer history
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDTO | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const [customerToDelete, setCustomerToDelete] = useState<CustomerItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [tempPhone, setTempPhone] = useState(phoneQuery)
  const [tempAddress, setTempAddress] = useState(addressQuery)
  const [tempSort, setTempSort] = useState(`${sortBy}:${direction}`)

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // Initialize store from URL on first mount in a single batch
  useEffect(() => {
    initFilters({
      ...(urlQ && { searchQuery: urlQ }),
      ...(urlPhone && { phoneQuery: urlPhone }),
      ...(urlAddress && { addressQuery: urlAddress }),
      ...(urlSortField && urlSortDir && { sortBy: urlSortField, direction: urlSortDir }),
      ...(!isNaN(urlPage) && urlPage >= 1 && { currentPage: urlPage }),
      ...(!isNaN(urlSize) && urlSize > 0 && { pageSize: urlSize })
    })
  }, [])

  // Helper to update URL params
  const updateUrlParams = (updater: (params: URLSearchParams) => void) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      updater(next)
      return next
    }, { replace: true })
  }

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

  // Pagination sync
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateUrlParams((p) => p.set('page', String(newPage)))
  }

  const handleViewModeChange = (mode: 'card' | 'table') => {
    setViewMode(mode)
    updateUrlParams((p) => {
      if (mode !== 'table') p.set('view', mode)
      else p.delete('view')
    })
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    updateUrlParams((p) => {
      p.set('size', String(newSize))
      p.set('page', '1')
    })
  }

  // Fetch metrics once and when updates happen
  useEffect(() => {
    fetchMetrics(token || undefined)
  }, [token, fetchMetrics])

  useEffect(() => {
    fetchCustomers(token || undefined)
  }, [token, fetchCustomers, searchQuery, phoneQuery, addressQuery, sortBy, direction, currentPage, pageSize])

  const activeFilterCount = (phoneQuery ? 1 : 0) + (addressQuery ? 1 : 0) + (sortBy !== 'lastOrderDate' || direction !== 'desc' ? 1 : 0)

  const handleOpenFilterModal = () => {
    setTempPhone(phoneQuery)
    setTempAddress(addressQuery)
    setTempSort(`${sortBy}:${direction}`)
    setIsFilterModalOpen(true)
  }

  const handleApplyFilter = () => {
    setPhoneQuery(tempPhone)
    setAddressQuery(tempAddress)
    const [field, dir] = tempSort.split(':') as ['lastOrderDate' | 'totalOrders' | 'totalSpent' | 'name', 'asc' | 'desc']
    setSort(field, dir)
    setPage(1)

    updateUrlParams((p) => {
      if (tempPhone) p.set('phone', tempPhone)
      else p.delete('phone')

      if (tempAddress) p.set('address', tempAddress)
      else p.delete('address')

      if (tempSort !== 'lastOrderDate:desc') p.set('sort', tempSort)
      else p.delete('sort')

      p.set('page', '1')
    })
  }

  const handleResetModal = () => {
    setTempPhone('')
    setTempAddress('')
    setTempSort('lastOrderDate:desc')
    setSearchInput('')
    resetFilters()

    updateUrlParams((p) => {
      p.delete('phone')
      p.delete('address')
      p.delete('sort')
      p.delete('q')
      p.delete('search')
      p.set('page', '1')
    })
  }

  const handleCreateCustomer = async (payload: CustomerPayload) => {
    try {
      await addCustomer(token || undefined, payload)
      fetchMetrics(token || undefined)
      success('Pelanggan baru berhasil ditambahkan!')
    } catch (err: any) {
      toastError(err?.message || 'Gagal menambahkan pelanggan')
      throw err
    }
  }

  const handleUpdateCustomer = async (payload: CustomerPayload) => {
    if (!editingCustomer) return
    try {
      await updateCustomer(token || undefined, editingCustomer.id, payload)
      fetchMetrics(token || undefined)
      success('Data pelanggan berhasil diperbarui!')
    } catch (err: any) {
      toastError(err?.message || 'Gagal memperbarui data pelanggan')
      throw err
    }
  }

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return
    setIsDeleting(true)
    try {
      await deleteCustomer(token || undefined, customerToDelete.id)
      fetchMetrics(token || undefined)
      success('Data pelanggan berhasil dihapus!')
      setCustomerToDelete(null)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus data pelanggan')
    } finally {
      setIsDeleting(false)
    }
  }

  const sortOptions = [
    { value: 'lastOrderDate:desc', label: 'Order Terkini (Terbaru)' },
    { value: 'lastOrderDate:asc', label: 'Order Terlama' },
    { value: 'totalOrders:desc', label: 'Frekuensi Order Terbanyak' },
    { value: 'totalSpent:desc', label: 'Total Belanja Tertinggi' },
    { value: 'name:asc', label: 'Nama Pelanggan (A - Z)' }
  ]

  const handleOpenHistory = (cust: CustomerItem) => {
    setSelectedCustomer(cust)
    setIsHistoryModalOpen(true)
  }

  const handleOpenWhatsApp = (e: React.MouseEvent, cust: CustomerItem) => {
    e.stopPropagation()
    const raw = cust.phone.replace(/\D/g, '')
    const phone = raw.startsWith('0') ? '62' + raw.slice(1) : raw
    const text = `Halo Kak ${cust.name}, salam hangat dari Nuy Laundry! Apakah ada pakaian yang perlu kami jemput hari ini?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleSelectTransaction = async (transactionId: string) => {
    try {
      const trx = await transactionRepo.getById(transactionId, token || undefined)
      setSelectedTransaction(trx)
      setIsDetailModalOpen(true)
    } catch (err: any) {
      toastError(err?.message || 'Gagal memuat detail transaksi')
    }
  }

  return (
    <div className="space-y-8 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
              CRM & Pelanggan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Direktori Pelanggan Nuy Laundry
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Data riwayat transaksi, frekuensi cucian, dan kemudahan follow-up pelanggan setia.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null)
            setIsFormModalOpen(true)
          }}
          className="px-6 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-sm shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Metric Count Cards (Dedicated /api/v1/customers/metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Total Pelanggan</p>
            <p className="text-2xl font-extrabold text-ink mt-1">
              {(metrics?.totalCustomers ?? stats?.totalCustomers ?? totalElements).toLocaleString('id-ID')} Orang
            </p>
            <p className="text-xs text-brand-600 font-semibold mt-1">Database residensial & kos</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Aktif Bulan Ini</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {(metrics?.activeCustomers ?? stats?.activeThisMonth ?? 0).toLocaleString('id-ID')} Pelanggan
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Melakukan repeat order</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-emerald-700 grid place-items-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Pelanggan Baru</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {(metrics?.newCustomersThisMonth ?? 0).toLocaleString('id-ID')} Orang
            </p>
            <p className="text-xs text-ink-soft mt-1">Bergabung bulan ini</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sun/20 text-amber-700 grid place-items-center">
            <Repeat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search, Filter, and View Mode Toggle Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama pelanggan (otomatis cari saat mengetik)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Card vs Table View Mode Toggle */}
          <div className="flex items-center gap-1 bg-brand-50/80 p-1 rounded-full border border-brand-100/60 shrink-0">
            <button
              type="button"
              onClick={() => handleViewModeChange('table')}
              className={`p-2 rounded-full transition ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-soft font-bold'
                  : 'text-ink-soft hover:text-ink'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('card')}
              className={`p-2 rounded-full transition ${
                viewMode === 'card'
                  ? 'bg-white text-brand-600 shadow-soft font-bold'
                  : 'text-ink-soft hover:text-ink'
              }`}
              title="Tampilan Kartu (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
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

      {/* Main Customers Content: Grid Cards or Table */}
      {viewMode === 'card' ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-card">
              <span className="w-6 h-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin inline-block mr-2"></span>
              Memuat direktori pelanggan...
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-card">
              Tidak ada pelanggan yang cocok dengan pencarian / filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((cust) => (
                <CustomerCard
                  key={cust.id}
                  customer={cust}
                  canManage={canManage}
                  onOpenHistory={handleOpenHistory}
                  onEdit={(c) => {
                    setEditingCustomer(c)
                    setIsFormModalOpen(true)
                  }}
                  onDelete={(c) => setCustomerToDelete(c)}
                  onOpenWhatsApp={handleOpenWhatsApp}
                />
              ))}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-brand-50 shadow-card overflow-hidden">
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
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-brand-50 shadow-card overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[750px]">
              <thead className="bg-brand-50/60 text-ink font-bold text-xs uppercase tracking-wider border-b border-brand-50">
                <tr>
                  <th className="py-4 px-6 w-64">Pelanggan</th>
                  <th className="py-4 px-6 w-44">Kontak WA</th>
                  <th className="py-4 px-6 w-36">Total Cucian</th>
                  <th className="py-4 px-6 w-36">Total Belanja</th>
                  <th className="py-4 px-6 w-36">Order Terakhir</th>
                  <th className="py-4 px-6 text-right w-44">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-soft">
                      <span className="w-6 h-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin inline-block mr-2"></span>
                      Memuat direktori pelanggan...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-soft">
                      Tidak ada pelanggan yang cocok dengan pencarian / filter.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr 
                      key={cust.id} 
                      onClick={() => handleOpenHistory(cust)}
                      className="hover:bg-brand-50/40 transition cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-extrabold text-sm grid place-items-center shadow-soft shrink-0">
                            {cust.name[0]}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-bold text-ink truncate" title={cust.name}>{cust.name}</p>
                            <p className="text-xs text-ink-soft truncate" title={cust.address || 'Residensial'}>
                              {cust.address || 'Residensial'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono font-medium text-ink-soft whitespace-nowrap">
                        {cust.phone}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-bold text-ink">{cust.totalOrders}x</span>
                        <span className="text-xs text-ink-soft ml-1.5 px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-semibold">
                          {cust.totalWeightKg} kg
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-brand-600 whitespace-nowrap">
                        Rp{cust.totalSpent.toLocaleString('id-ID')}
                      </td>

                      <td className="py-4 px-6 text-xs text-ink-soft whitespace-nowrap">
                        {new Date(cust.lastOrderDate).toLocaleDateString('id-ID')}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenHistory(cust)}
                            className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white grid place-items-center transition shrink-0"
                            title="Riwayat Transaksi"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleOpenWhatsApp(e, cust)}
                            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white grid place-items-center transition shrink-0"
                            title="Chat WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomer(cust)
                              setIsFormModalOpen(true)
                            }}
                            className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white grid place-items-center transition shrink-0"
                            title="Edit Pelanggan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {canManage && (
                            <button
                              type="button"
                              onClick={() => setCustomerToDelete(cust)}
                              className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition shrink-0"
                              title="Hapus Pelanggan"
                            >
                              <Trash2 className="w-4 h-4" />
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onReset={handleResetModal}
        onApply={handleApplyFilter}
        title="Filter & Urutkan Pelanggan"
        subtitle="Filter pelanggan berdasarkan nomor WhatsApp, alamat area kos, dan pengurutan riwayat order."
        activeCount={activeFilterCount}
      >
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Nomor Telepon / WhatsApp
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value.replace(/[^\d-]/g, ''))}
              placeholder="Contoh: 0812..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Alamat / Area Kos
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="Cari berdasarkan nama jalan, komplek, kos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Urutkan Berdasarkan
          </label>
          <CustomSelect
            value={tempSort}
            onChange={setTempSort}
            options={sortOptions}
          />
        </div>
      </FilterModal>

      <CustomerHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customer={selectedCustomer}
        onSelectTransaction={handleSelectTransaction}
      />

      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingCustomer(null)
        }}
        editingCustomer={editingCustomer}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
      />

      {/* Transaction Detail Modal opened from Customer History */}
      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transaction={selectedTransaction}
        onUpdateStatus={async (id, newStatus) => {
          await transactionRepo.updateStatus(token || undefined, id, newStatus)
          success('Status transaksi berhasil diperbarui!')
          if (selectedTransaction && selectedTransaction.id === id) {
            setSelectedTransaction({ ...selectedTransaction, status: newStatus })
          }
          // Refresh customer list to keep stats updated
          fetchCustomers(token || undefined)
        }}
        onUpdatePayment={async (id, downPayment, status) => {
          const updated = await transactionRepo.updatePayment(token || undefined, id, downPayment, status)
          success('Status pembayaran berhasil diperbarui!')
          if (selectedTransaction && selectedTransaction.id === id) {
            setSelectedTransaction(updated)
          }
          fetchCustomers(token || undefined)
        }}
        onSavePhotos={async (id, beforeUrls, afterUrls, newFiles) => {
          await transactionRepo.uploadFiles(token || undefined, id, newFiles)
          success('Foto dokumentasi transaksi berhasil disimpan!')
          if (selectedTransaction && selectedTransaction.id === id) {
            setSelectedTransaction({ ...selectedTransaction, conditionBeforeUrls: beforeUrls, conditionAfterUrls: afterUrls })
          }
        }}
        onDelete={canManage ? async (id) => {
          await transactionRepo.delete(token || undefined, id)
          success('Transaksi berhasil dihapus!')
          fetchCustomers(token || undefined)
        } : undefined}
      />

      <ConfirmationModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteCustomer}
        title="Hapus Data Pelanggan?"
        message={`Apakah Anda yakin ingin menghapus pelanggan "${customerToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
