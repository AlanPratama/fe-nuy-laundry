import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { StaffUser } from '../models/SettingsModel'
import { Shield, Search, Filter, RotateCcw, Trash2, Pencil, LayoutGrid, List } from 'lucide-react'
import { useSettingsStore } from '../providers/useSettingsStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { useToast } from '../../../components/ui/Toast'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { FilterModal } from '../../../components/ui/FilterModal'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { Pagination } from '../../../components/ui/Pagination'
import { StaffCard } from './StaffCard'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'

interface Props {
  staffList: StaffUser[]
  onOpenEditModal: (staff: StaffUser) => void
}

export const StaffTable: React.FC<Props> = ({ staffList, onOpenEditModal }) => {
  const { user, token } = useAuthStore()
  const { success, error: toastError } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    direction,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    setPage,
    setPageSize,
    deleteStaff,
    updateStaff,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setSort,
    resetFilters
  } = useSettingsStore()

  const urlQ = searchParams.get('q') || searchParams.get('search') || ''
  const urlRole = (searchParams.get('role') as any) || 'ALL'
  const urlStatus = (searchParams.get('status') as any) || 'ALL'
  const urlView = (searchParams.get('view') as 'card' | 'table') || 'table'
  const urlSort = searchParams.get('sort') || 'createdAt:desc'
  const [urlSortField, urlSortDir] = (urlSort.split(':') as ['createdAt' | 'name', 'asc' | 'desc'])
  const urlPage = parseInt(searchParams.get('page') || '1', 10)
  const urlSize = parseInt(searchParams.get('size') || '10', 10)

  const [viewMode, setViewMode] = useState<'card' | 'table'>(urlView)
  const [searchInput, setSearchInput] = useState(urlQ || searchQuery)
  const debouncedSearch = useDebounce(searchInput, 350)

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [tempRole, setTempRole] = useState(roleFilter)
  const [tempStatus, setTempStatus] = useState(statusFilter)
  const [tempSort, setTempSort] = useState(`${sortBy}:${direction}`)

  const [staffToDelete, setStaffToDelete] = useState<StaffUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // Initialize store from URL params on mount
  useEffect(() => {
    if (urlQ !== searchQuery) setSearchQuery(urlQ)
    if (urlRole !== roleFilter) setRoleFilter(urlRole)
    if (urlStatus !== statusFilter) setStatusFilter(urlStatus)
    if (urlSortField && urlSortDir && (urlSortField !== sortBy || urlSortDir !== direction)) {
      setSort(urlSortField, urlSortDir)
    }
    if (!isNaN(urlPage) && urlPage >= 1 && urlPage !== currentPage) {
      setPage(urlPage)
    }
    if (!isNaN(urlSize) && urlSize > 0 && urlSize !== pageSize) {
      setPageSize(urlSize)
    }
  }, [])

  // Sync debounced search with URL params
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

  // Handle page & size changes with URL sync
  const handleViewModeChange = (mode: 'card' | 'table') => {
    setViewMode(mode)
    updateUrlParams((p) => {
      if (mode !== 'table') p.set('view', mode)
      else p.delete('view')
    })
  }

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

  const activeFilterCount = (roleFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0) + (sortBy !== 'createdAt' || direction !== 'desc' ? 1 : 0)

  const handleOpenFilterModal = () => {
    setTempRole(roleFilter)
    setTempStatus(statusFilter)
    setTempSort(`${sortBy}:${direction}`)
    setIsFilterModalOpen(true)
  }

  const handleApplyFilter = () => {
    setRoleFilter(tempRole)
    setStatusFilter(tempStatus)
    const [field, dir] = tempSort.split(':') as ['createdAt' | 'name', 'asc' | 'desc']
    setSort(field, dir)
    setPage(1)

    updateUrlParams((p) => {
      if (tempRole !== 'ALL') p.set('role', tempRole)
      else p.delete('role')

      if (tempStatus !== 'ALL') p.set('status', tempStatus)
      else p.delete('status')

      if (tempSort !== 'createdAt:desc') p.set('sort', tempSort)
      else p.delete('sort')

      p.set('page', '1')
    })
  }

  const handleResetModal = () => {
    setTempRole('ALL')
    setTempStatus('ALL')
    setTempSort('createdAt:desc')
    resetFilters()
    updateUrlParams((p) => {
      p.delete('role')
      p.delete('status')
      p.delete('sort')
      p.set('page', '1')
    })
  }

  const handleToggleStatus = async (staff: StaffUser) => {
    if (!token || !canManage) return
    const nextActive = !staff.isActive
    try {
      await updateStaff(token, staff.id, {
        name: staff.name,
        username: staff.username,
        phone: staff.phone,
        role: staff.role,
        isActive: nextActive
      })
      success(`Status akun @${staff.username} berhasil diubah menjadi ${nextActive ? 'Aktif' : 'Non-Aktif'}`)
    } catch (err: any) {
      toastError(err?.message || 'Gagal mengubah status akun staff')
    }
  }

  const handleDeleteStaff = async () => {
    if (!staffToDelete || !token) return
    setIsDeleting(true)
    try {
      await deleteStaff(token, staffToDelete.id)
      success('Akun staff berhasil dihapus!')
      setStaffToDelete(null)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus staff')
    } finally {
      setIsDeleting(false)
    }
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isAdmin = user?.role === 'ADMIN'

  // Admin hanya boleh edit dan hapus data ber-role STAFF saja. Super Admin boleh semuanya.
  const canEditTarget = (targetRole: string) => {
    if (isSuperAdmin) return true
    if (isAdmin) return targetRole === 'STAFF'
    return false
  }

  const canDeleteTarget = (targetRole: string) => {
    if (isSuperAdmin) return true
    if (isAdmin) return targetRole === 'STAFF'
    return false
  }

  const ROLE_HIERARCHY: Record<string, number> = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    STAFF: 3
  }

  const sortedStaffList = [...staffList].sort((a, b) => {
    const orderA = ROLE_HIERARCHY[a.role] ?? 99
    const orderB = ROLE_HIERARCHY[b.role] ?? 99
    if (orderA !== orderB) return orderA - orderB
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Hierarki Role (Super Admin → Admin → Staff)' },
    { value: 'createdAt:asc', label: 'Terdaftar Terlama' },
    { value: 'name:asc', label: 'Nama (A - Z)' }
  ]

  return (
    <div className="space-y-6 min-w-0">
      {/* Search and Filters Bar (Consistent standalone card) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-brand-50 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama, @username, atau telepon staff..."
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

      {/* Staff View Content: Grid Cards or Table */}
      {viewMode === 'card' ? (
        <div className="space-y-6">
          {sortedStaffList.length === 0 ? (
            <div className="p-12 text-center text-ink-soft bg-white rounded-3xl border border-brand-50 shadow-card">
              Tidak ada staff yang sesuai dengan filter pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStaffList.map((u) => {
                const isSelf = user?.username === u.username
                return (
                  <StaffCard
                    key={u.id}
                    staff={u}
                    isSelf={isSelf}
                    canManage={canManage}
                    canEdit={canEditTarget(u.role)}
                    canDelete={canDeleteTarget(u.role)}
                    onEdit={onOpenEditModal}
                    onDelete={(s) => setStaffToDelete(s)}
                    onToggleStatus={handleToggleStatus}
                  />
                )
              })}
            </div>
          )}

          <div className="rounded-3xl bg-white border border-brand-50 shadow-card overflow-hidden">
            <div className="p-4 sm:p-5 bg-white">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-brand-50 shadow-card overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-brand-50/60 text-ink font-bold uppercase tracking-wider text-xs border-b border-brand-50">
                <tr>
                  <th className="py-4 px-6 w-60">Nama Pengguna</th>
                  <th className="py-4 px-6 w-48">Username & Kontak</th>
                  <th className="py-4 px-6 w-40">Role Akses</th>
                  <th className="py-4 px-6 w-44">Status Akun</th>
                  <th className="py-4 px-6 text-right w-44">Aksi / Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {sortedStaffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-ink-soft">
                      Tidak ada staff yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  sortedStaffList.map((u) => {
                    const isSelf = user?.username === u.username
                    const canEdit = canEditTarget(u.role)
                    const canDelete = canDeleteTarget(u.role)

                    return (
                      <tr key={u.id} className="hover:bg-brand-50/40 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {u.profilePicture ? (
                              <img
                                src={resolveImageUrl(u.profilePicture)}
                                alt={u.name}
                                className="w-9 h-9 rounded-2xl aspect-square object-cover shadow-soft shrink-0 border border-brand-100"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-2xl aspect-square bg-brand-600 text-white font-bold text-xs grid place-items-center shadow-soft shrink-0">
                                {u.name[0]}
                              </div>
                            )}
                            <div className="min-w-0 max-w-[200px]">
                              <p className="font-bold text-ink truncate text-sm" title={u.name}>{u.name}</p>
                              <p className="text-[10px] text-ink-soft truncate font-mono">{u.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <p className="font-mono font-medium text-ink text-xs">@{u.username}</p>
                          <p className="text-xs text-ink-soft">{u.phone || '-'}</p>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
                              ? 'bg-brand-50 text-brand-600 border border-brand-100'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Shield className="w-3.5 h-3.5" />
                            <span>{u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin Outlet' : 'Kasir / Staff'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              disabled={!canManage || isSelf || !canEdit}
                              onClick={() => handleToggleStatus(u)}
                              title={
                                isSelf
                                  ? 'Tidak dapat menonaktifkan akun sendiri'
                                  : !canManage || !canEdit
                                  ? 'Tidak memiliki izin mengubah akun ini'
                                  : `Klik untuk ${u.isActive ? 'menonaktifkan' : 'mengaktifkan'}`
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                                u.isActive ? 'bg-brand-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  u.isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive 
                                ? 'bg-mint/20 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {u.isActive ? 'Aktif' : 'Non-Aktif'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono text-xs text-ink-soft">
                              {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>

                            {canManage && canEdit && (
                              <button
                                type="button"
                                onClick={() => onOpenEditModal(u)}
                                className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white grid place-items-center transition shrink-0 ml-1"
                                title="Edit akun staff"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {canManage && canDelete && !isSelf && (
                              <button
                                type="button"
                                onClick={() => setStaffToDelete(u)}
                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition shrink-0 ml-1"
                                title="Hapus staff"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 border-t border-brand-50 bg-white">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onReset={handleResetModal}
        onApply={handleApplyFilter}
        title="Filter & Urutkan Staff"
        subtitle="Saring staf berdasarkan peranan hak akses dan status keaktifan akun."
        activeCount={activeFilterCount}
      >
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Peranan / Role Akses
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'ALL', label: 'Semua Role' },
              { id: 'SUPER_ADMIN', label: 'Super Admin' },
              { id: 'ADMIN', label: 'Admin Outlet' },
              { id: 'STAFF', label: 'Staff Kasir' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTempRole(r.id as any)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition text-center ${
                  tempRole === r.id
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-brand-50/70 text-ink-soft hover:bg-brand-100 hover:text-ink'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Status Akun
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'ACTIVE', label: 'Akun Aktif' },
              { id: 'INACTIVE', label: 'Non-Aktif' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setTempStatus(s.id as any)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition text-center ${
                  tempStatus === s.id
                    ? 'bg-emerald-700 text-white shadow-soft'
                    : 'bg-brand-50/70 text-ink-soft hover:bg-brand-100 hover:text-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            Urutkan Daftar Staff
          </label>
          <CustomSelect
            value={tempSort}
            onChange={setTempSort}
            options={sortOptions}
          />
        </div>
      </FilterModal>

      <ConfirmationModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDeleteStaff}
        title="Hapus Akun Staff?"
        message={`Apakah Anda yakin ingin menghapus akun staff "${staffToDelete?.name}" (@${staffToDelete?.username})? Akses login pengguna ini akan dicabut secara permanen.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
