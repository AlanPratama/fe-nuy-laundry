import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePackageStore } from '../providers/usePackageStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useToast } from '../../../components/ui/Toast'
import { PackageCard } from '../components/PackageCard'
import { PackageDetailModal } from '../components/PackageDetailModal'
import { PackageFormModal } from '../components/PackageFormModal'
import { BenefitManagementModal } from '../components/BenefitManagementModal'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { FilterModal } from '../../../components/ui/FilterModal'
import { Pagination } from '../../../components/ui/Pagination'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import type { PackageItem, CreatePackagePayload } from '../models/PackageModel'
import { Plus, Search, Filter, RotateCcw, LayoutGrid, List, Pencil, Trash2, Clock, CheckCircle2, Sparkles, Check, Layers, PackageCheck, Scale, Shirt, Eye } from 'lucide-react'

export const PackagesPage: React.FC = () => {
  const { user, token } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const { 
    packages, 
    metrics,
    isLoading, 
    activeFilter, 
    statusFilter, 
    searchQuery,
    sortBy,
    direction,
    fetchPackages, 
    fetchMetrics,
    addPackage, 
    updatePackage, 
    deletePackage, 
    setActiveFilter,
    setStatusFilter,
    setSearchQuery,
    setSort,
    initFilters,
    resetFilters
  } = usePackageStore()

  // 1. Initial State from URL params
  const urlQ = searchParams.get('q') || ''
  const urlType = (searchParams.get('type') as any) || 'ALL'
  const urlStatus = (searchParams.get('status') as any) || 'ALL'
  const urlSortParam = searchParams.get('sort') || 'createdAt:desc'
  const [urlSortField, urlSortDir] = (urlSortParam.includes(':') ? urlSortParam.split(':') : ['createdAt', 'desc']) as ['createdAt' | 'price' | 'estimateHours', 'asc' | 'desc']
  const urlPage = parseInt(searchParams.get('page') || '1', 10) || 1
  const urlSize = parseInt(searchParams.get('size') || '9', 10) || 9
  const urlView = (searchParams.get('view') as 'card' | 'table') || 'card'

  const [searchInput, setSearchInput] = useState(urlQ)
  const debouncedSearch = useDebounce(searchInput, 350)

  const [viewMode, setViewMode] = useState<'card' | 'table'>(urlView)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<PackageItem | null>(null)
  const [selectedDetailPackage, setSelectedDetailPackage] = useState<PackageItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false)

  const [tempType, setTempType] = useState(activeFilter)
  const [tempStatus, setTempStatus] = useState(statusFilter)
  const [tempSort, setTempSort] = useState(`${sortBy}:${direction}`)

  const [currentPage, setCurrentPage] = useState(urlPage)
  const [pageSize, setPageSize] = useState(urlSize)

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // Initialize store from URL on first mount in a single batch
  useEffect(() => {
    initFilters({
      searchQuery: urlQ,
      activeFilter: urlType,
      statusFilter: urlStatus,
      sortBy: urlSortField,
      direction: urlSortDir
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
        setCurrentPage(1)
      }
      return next
    }, { replace: true })
  }, [debouncedSearch])

  // View mode sync
  const handleViewModeChange = (mode: 'card' | 'table') => {
    setViewMode(mode)
    updateUrlParams((p) => {
      if (mode !== 'card') p.set('view', mode)
      else p.delete('view')
    })
  }

  // Pagination sync
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    updateUrlParams((p) => p.set('page', String(newPage)))
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    updateUrlParams((p) => {
      p.set('size', String(newSize))
      p.set('page', '1')
    })
  }

  useEffect(() => {
    if (token) {
      fetchPackages(token)
      fetchMetrics(token)
    }
  }, [token, fetchPackages, fetchMetrics, searchQuery, activeFilter, statusFilter, sortBy, direction])

  const activeFilterCount = (activeFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0) + (sortBy !== 'createdAt' || direction !== 'desc' ? 1 : 0)

  const handleOpenFilterModal = () => {
    setTempType(activeFilter)
    setTempStatus(statusFilter)
    setTempSort(`${sortBy}:${direction}`)
    setIsFilterModalOpen(true)
  }

  const handleApplyFilter = () => {
    setActiveFilter(tempType)
    setStatusFilter(tempStatus)
    const [field, dir] = tempSort.split(':') as ['createdAt' | 'price' | 'estimateHours', 'asc' | 'desc']
    setSort(field, dir)
    setCurrentPage(1)

    updateUrlParams((p) => {
      if (tempType !== 'ALL') p.set('type', tempType)
      else p.delete('type')

      if (tempStatus !== 'ALL') p.set('status', tempStatus)
      else p.delete('status')

      if (tempSort !== 'createdAt:desc') p.set('sort', tempSort)
      else p.delete('sort')

      p.set('page', '1')
    })
  }

  const handleResetModal = () => {
    setTempType('ALL')
    setTempStatus('ALL')
    setTempSort('createdAt:desc')
    setSearchInput('')
    resetFilters()
    setCurrentPage(1)

    updateUrlParams((p) => {
      p.delete('type')
      p.delete('status')
      p.delete('sort')
      p.delete('q')
      p.delete('search')
      p.set('page', '1')
    })
  }

  const handleOpenCreate = () => {
    setEditingPackage(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (pkg: PackageItem) => {
    setEditingPackage(pkg)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (payload: CreatePackagePayload) => {
    if (!token) return
    try {
      if (editingPackage) {
        await updatePackage(token, editingPackage.id, payload)
        fetchMetrics(token)
        success('Paket layanan berhasil diperbarui!')
      } else {
        await addPackage(token, payload)
        fetchMetrics(token)
        success('Paket layanan baru berhasil ditambahkan!')
      }
    } catch (err: any) {
      toastError(err?.message || 'Gagal menyimpan paket layanan')
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    if (!packageToDelete || !token) return
    setIsDeleting(true)
    try {
      await deletePackage(token, packageToDelete.id)
      fetchMetrics(token)
      success('Paket layanan berhasil dihapus!')
      setPackageToDelete(null)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus paket layanan')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    if (!token || !canManage) return
    try {
      await updatePackage(token, id, { isActive: !current })
      fetchMetrics(token)
      success(`Status paket berhasil diubah menjadi ${!current ? 'Aktif' : 'Nonaktif'}`)
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengubah status paket')
    }
  }

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Terbaru Ditambahkan' },
    { value: 'createdAt:asc', label: 'Terlama Ditambahkan' },
    { value: 'price:asc', label: 'Harga: Termurah' },
    { value: 'price:desc', label: 'Harga: Termahal' },
    { value: 'estimateHours:asc', label: 'Durasi Paling Kilat' },
    { value: 'estimateHours:desc', label: 'Durasi Terlama' }
  ]

  const filtered = packages.filter((pkg) => {
    if (activeFilter !== 'ALL' && pkg.type !== activeFilter) return false
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE' && !pkg.isActive) return false
      if (statusFilter === 'INACTIVE' && pkg.isActive) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = pkg.name.toLowerCase().includes(q)
      const matchDesc = pkg.description?.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'price') {
      return direction === 'asc' ? a.price - b.price : b.price - a.price
    }
    if (sortBy === 'estimateHours') {
      return direction === 'asc' ? a.estimateHours - b.estimateHours : b.estimateHours - a.estimateHours
    }
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return direction === 'asc' ? tA - tB : tB - tA
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedPackages = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-8 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
              Katalog Jasa
            </span>
            {!canManage && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                Mode Hanya Lihat (Staff)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Paket Layanan & Tarif Laundry
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Atur skema harga per kg/satuan, durasi pengerjaan, dan status ketersediaan paket.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsBenefitModalOpen(true)}
              className="px-5 py-3.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-semibold text-sm hover:bg-brand-100 active:scale-95 transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Kelola Benefit</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-6 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-sm shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Paket Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Count Cards (Dedicated /api/v1/packages/metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Total Paket</p>
            <p className="text-2xl font-extrabold text-ink mt-1">
              {(metrics?.totalPackages ?? packages.length).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-brand-600 font-semibold mt-1">Layanan terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Paket Aktif</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {(metrics?.activePackages ?? packages.filter(p => p.isActive).length).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Tampil di kasir</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-emerald-700 grid place-items-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Paket Kiloan</p>
            <p className="text-2xl font-extrabold text-brand-600 mt-1">
              {(metrics?.weightPackages ?? packages.filter(p => p.type === 'WEIGHT').length).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-ink-soft mt-1">Tarif per kilogram</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Paket Satuan</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {(metrics?.piecePackages ?? packages.filter(p => p.type === 'PCS').length).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-ink-soft mt-1">Tarif per lembar/pcs</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sun/20 text-amber-700 grid place-items-center">
            <Shirt className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama paket atau deskripsi layanan..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-brand-50/70 border border-brand-100 rounded-full p-1 shadow-xs">
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
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
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

      {isLoading ? (
        <div className="py-20 text-center text-ink-soft">
          <span className="w-8 h-8 rounded-full border-3 border-brand-600 border-t-transparent animate-spin inline-block mb-3"></span>
          <p className="text-sm font-medium">Memuat katalog paket...</p>
        </div>
      ) : paginatedPackages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-brand-50 shadow-card">
          <p className="text-ink font-semibold">Tidak ada paket yang sesuai dengan kriteria pencarian.</p>
          <button
            onClick={handleResetModal}
            className="mt-4 px-5 py-2 rounded-full bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPackages.map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  canManage={canManage}
                  onEdit={handleOpenEdit} 
                  onDelete={(id) => setPackageToDelete(packages.find(p => p.id === id) || null)}
                  onToggleActive={handleToggleActive}
                  onViewDetail={(p) => {
                    setSelectedDetailPackage(p)
                    setIsDetailModalOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="border border-brand-50 rounded-2xl overflow-hidden bg-white shadow-card">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-brand-50/60 text-ink font-bold uppercase tracking-wider border-b border-brand-50">
                    <tr>
                      <th className="py-3.5 px-5 w-64">Nama Paket & Layanan</th>
                      <th className="py-3.5 px-5 w-36">Kategori</th>
                      <th className="py-3.5 px-5 w-40">Harga Satuan</th>
                      <th className="py-3.5 px-5 w-36">Estimasi Durasi</th>
                      <th className="py-3.5 px-5 w-32">Status</th>
                      <th className="py-3.5 px-5 text-right w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    {paginatedPackages.map((pkg) => {
                      const days = pkg.daysEstimation || Math.max(1, Math.round(pkg.estimateHours / 24))
                      return (
                        <tr key={pkg.id} className="hover:bg-brand-50/40 transition">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {pkg.photo ? (
                                <img
                                  src={resolveImageUrl(pkg.photo)}
                                  alt={pkg.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-brand-100 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0 font-bold text-xs">
                                  {pkg.name[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-ink text-sm truncate">{pkg.name}</p>
                                <p className="text-[11px] text-ink-soft line-clamp-1">{pkg.description || 'Layanan laundry premium'}</p>
                                {pkg.benefits && pkg.benefits.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pkg.benefits.slice(0, 2).map((b) => (
                                      <span key={b.id} className="inline-flex items-center gap-0.5 text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded font-medium">
                                        <Check className="w-2 h-2 text-brand-600" />
                                        {b.name}
                                      </span>
                                    ))}
                                    {pkg.benefits.length > 2 && (
                                      <span className="text-[9px] text-ink-soft font-medium">
                                        +{pkg.benefits.length - 2} lagi
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              pkg.type === 'WEIGHT'
                                ? 'bg-brand-50 text-brand-600 border border-brand-100'
                                : 'bg-sun/20 text-amber-900 border border-sun/30'
                            }`}>
                              {pkg.type === 'WEIGHT' ? 'Kiloan' : 'Satuan'}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <p className="font-extrabold text-ink text-sm">
                              Rp{pkg.price.toLocaleString('id-ID')}
                              <span className="text-[10px] font-medium text-ink-soft">/{pkg.type === 'WEIGHT' ? 'kg' : 'pcs'}</span>
                            </p>
                          </td>

                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-ink-soft font-medium">
                              <Clock className="w-3.5 h-3.5 text-brand-600" />
                              <span className="font-bold text-ink">{days} Hari</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-5 whitespace-nowrap">
                            {canManage ? (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 ${
                                  pkg.isActive
                                    ? 'bg-mint/20 text-emerald-800 hover:bg-rose-50 hover:text-rose-700'
                                    : 'bg-rose-50 text-rose-700 hover:bg-mint/20 hover:text-emerald-800'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${pkg.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                <span>{pkg.isActive ? 'Aktif' : 'Nonaktif'}</span>
                              </button>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                pkg.isActive ? 'bg-mint/20 text-emerald-800' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDetailPackage(pkg)
                                  setIsDetailModalOpen(true)
                                }}
                                className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white grid place-items-center transition shrink-0"
                                title="Lihat Detail & Riwayat Transaksi"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(pkg)}
                                    className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white grid place-items-center transition shrink-0"
                                    title="Edit Paket"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPackageToDelete(pkg)}
                                    className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition shrink-0"
                                    title="Hapus Paket"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white border border-brand-50 shadow-card overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={filtered.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[6, 9, 15, 30]}
            />
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onReset={handleResetModal}
        onApply={handleApplyFilter}
        title="Filter & Urutkan Paket Layanan"
        subtitle="Saring paket berdasarkan tipe unit kiloan/satuan dan status aktif."
        activeCount={activeFilterCount}
      >
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Kategori Layanan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'WEIGHT', label: 'Kiloan' },
              { id: 'PCS', label: 'Satuan' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setTempType(cat.id as any)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition text-center ${
                  tempType === cat.id
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-brand-50/70 text-ink-soft hover:bg-brand-100 hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Status Paket
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'ACTIVE', label: 'Aktif' },
              { id: 'INACTIVE', label: 'Non-Aktif' }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setTempStatus(st.id as any)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition text-center ${
                  tempStatus === st.id
                    ? 'bg-emerald-700 text-white shadow-soft'
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
            Urutkan Berdasarkan
          </label>
          <CustomSelect
            value={tempSort}
            onChange={setTempSort}
            options={sortOptions}
          />
        </div>
      </FilterModal>

      <PackageFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPackage(null)
        }}
        editingPackage={editingPackage}
        onSubmit={handleFormSubmit}
      />

      <BenefitManagementModal
        isOpen={isBenefitModalOpen}
        onClose={() => setIsBenefitModalOpen(false)}
        onBenefitsUpdated={() => {
          if (token) fetchPackages(token)
        }}
      />

      <ConfirmationModal
        isOpen={!!packageToDelete}
        onClose={() => setPackageToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Paket Layanan?"
        message={`Apakah Anda yakin ingin menghapus paket "${packageToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
      <PackageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedDetailPackage(null)
        }}
        pkg={selectedDetailPackage}
      />
    </div>
  )
}
