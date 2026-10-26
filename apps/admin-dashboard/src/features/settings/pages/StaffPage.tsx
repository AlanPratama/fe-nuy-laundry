import React, { useEffect, useState } from 'react'
import { useSettingsStore } from '../providers/useSettingsStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { StaffTable } from '../components/StaffTable'
import { StaffDetailModal } from '../components/StaffDetailModal'
import { AddStaffModal } from '../components/AddStaffModal'
import { EditStaffModal } from '../components/EditStaffModal'
import { TransactionDetailModal } from '../../transactions/components/TransactionDetailModal'
import { TransactionRepository } from '../../transactions/repositories/TransactionRepository'
import type { CreateStaffPayload, UpdateStaffPayload, StaffUser } from '../models/SettingsModel'
import type { TransactionResponseDTO } from '@nuy-laundry/shared-types'
import { useToast } from '../../../components/ui/Toast'
import { UserPlus, Users, UserCheck, Shield } from 'lucide-react'

const trxRepo = new TransactionRepository()

export const StaffPage: React.FC = () => {
  const { user, token } = useAuthStore()
  const { success, error: toastError } = useToast()
  const {
    staffList,
    staffMetrics,
    totalElements,
    fetchStaffList,
    fetchStaffMetrics,
    addStaff,
    updateStaff,
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    direction,
    currentPage,
    pageSize
  } = useSettingsStore()

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null)
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffUser | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponseDTO | null>(null)
  const [isTrxDetailOpen, setIsTrxDetailOpen] = useState(false)

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (token) {
      fetchStaffList(token)
      fetchStaffMetrics(token)
    }
  }, [token, fetchStaffList, fetchStaffMetrics, searchQuery, roleFilter, statusFilter, sortBy, direction, currentPage, pageSize])

  const handleAddStaff = async (payload: CreateStaffPayload) => {
    if (token) {
      try {
        await addStaff(token, payload)
        fetchStaffMetrics(token)
        success('Akun staff baru berhasil ditambahkan!')
      } catch (err: any) {
        toastError(err?.message || 'Gagal menambahkan staff baru')
        throw err
      }
    }
  }

  const handleUpdateStaff = async (id: string, payload: UpdateStaffPayload) => {
    if (token) {
      try {
        await updateStaff(token, id, payload)
        fetchStaffMetrics(token)
        success('Data staff berhasil diperbarui!')
      } catch (err: any) {
        toastError(err?.message || 'Gagal memperbarui data staff')
        throw err
      }
    }
  }

  const totalStaffCount = staffMetrics?.totalStaff ?? (totalElements || staffList.length)
  const activeStaffCount = staffMetrics?.activeStaff ?? staffList.filter((s) => s.isActive).length
  const adminStaffCount = staffMetrics?.adminCount ?? staffList.filter((s) => s.role === 'ADMIN' || s.role === 'SUPER_ADMIN').length

  const handleSelectTransaction = async (transactionId: string) => {
    try {
      const trx = await trxRepo.getById(transactionId, token || undefined)
      setSelectedTransaction(trx)
      setIsTrxDetailOpen(true)
    } catch (err: any) {
      toastError(err?.message || 'Gagal memuat detail transaksi')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
              Otorisasi & Keamanan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Manajemen Akun Staff Kasir
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Kelola hak akses pengguna, peranan kasir, dan otorisasi login ke dashboard POS.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="px-6 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-sm shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Staff Baru</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Total Akun Staff</p>
            <p className="text-2xl font-extrabold text-ink mt-1">
              {totalStaffCount.toLocaleString('id-ID')} Pengguna
            </p>
            <p className="text-xs text-brand-600 font-semibold mt-1">Terdaftar di sistem outlet</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Staff Aktif</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{activeStaffCount} Akun</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Dapat login ke POS kasir</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-emerald-700 grid place-items-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Akses Administrator</p>
            <p className="text-2xl font-extrabold text-purple-700 mt-1">{adminStaffCount} Akun</p>
            <p className="text-xs text-purple-600 font-semibold mt-1">Super Admin & Admin</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 grid place-items-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      <StaffTable
        staffList={staffList}
        onOpenEditModal={(staff) => {
          setEditingStaff(staff)
          setIsEditStaffOpen(true)
        }}
        onOpenDetailModal={(staff) => {
          setSelectedStaffForDetail(staff)
          setIsDetailModalOpen(true)
        }}
      />

      <StaffDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedStaffForDetail(null)
        }}
        staff={selectedStaffForDetail}
        onSelectTransaction={handleSelectTransaction}
      />

      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={isTrxDetailOpen}
          onClose={() => {
            setIsTrxDetailOpen(false)
            setSelectedTransaction(null)
          }}
          transaction={selectedTransaction}
        />
      )}

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onSubmit={handleAddStaff}
      />

      <EditStaffModal
        isOpen={isEditStaffOpen}
        onClose={() => {
          setIsEditStaffOpen(false)
          setEditingStaff(null)
        }}
        staff={editingStaff}
        onSubmit={handleUpdateStaff}
      />
    </div>
  )
}
