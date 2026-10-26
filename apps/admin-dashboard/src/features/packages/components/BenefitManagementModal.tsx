import React, { useState, useEffect } from 'react'
import type { BenefitItem } from '../models/BenefitModel'
import { BenefitRepository } from '../repositories/BenefitRepository'
import { useToast } from '../../../components/ui/Toast'
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal'
import { X, Plus, Pencil, Trash2, Check, Sparkles, AlertCircle, Search } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onBenefitsUpdated?: () => void
}

const benefitRepo = new BenefitRepository()

export const BenefitManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onBenefitsUpdated
}) => {
  const { success, error: toastError } = useToast()
  const [benefits, setBenefits] = useState<BenefitItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const [searchFilter, setSearchFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [benefitToDelete, setBenefitToDelete] = useState<BenefitItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadBenefits = async () => {
    setIsLoading(true)
    try {
      const data = await benefitRepo.getAll()
      setBenefits(data)
    } catch {
      toastError('Gagal memuat daftar benefit')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadBenefits()
      setNewName('')
      setSearchFilter('')
      setEditingId(null)
      setBenefitToDelete(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    setIsAdding(true)
    try {
      await benefitRepo.create({ name: newName.trim() })
      success('Benefit berhasil ditambahkan')
      setNewName('')
      await loadBenefits()
      if (onBenefitsUpdated) onBenefitsUpdated()
    } catch (err: any) {
      toastError(err?.message || 'Gagal menambahkan benefit')
    } finally {
      setIsAdding(false)
    }
  }

  const handleStartEdit = (b: BenefitItem) => {
    setEditingId(b.id)
    setEditingName(b.name)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return
    setIsUpdating(true)
    try {
      await benefitRepo.update(id, { name: editingName.trim() })
      success('Benefit berhasil diperbarui')
      setEditingId(null)
      await loadBenefits()
      if (onBenefitsUpdated) onBenefitsUpdated()
    } catch (err: any) {
      toastError(err?.message || 'Gagal memperbarui benefit')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!benefitToDelete) return
    setIsDeleting(true)
    try {
      await benefitRepo.delete(benefitToDelete.id)
      success('Benefit berhasil dihapus')
      setBenefitToDelete(null)
      await loadBenefits()
      if (onBenefitsUpdated) onBenefitsUpdated()
    } catch (err: any) {
      toastError(err?.message || 'Gagal menghapus benefit')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredBenefits = benefits.filter((b) =>
    b.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
  )

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
          <div
            className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-brand-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shadow-soft">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink">Kelola Benefit Layanan</h3>
                  <p className="text-xs text-ink-soft mt-0.5">
                    Daftar benefit nilai tambah yang dapat dipilih untuk setiap paket
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Benefit Form */}
            <form onSubmit={handleCreate} className="mt-5 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Deterjen Hypoallergenic, Pewangi Segar 7 Hari..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-brand-50/50 border border-brand-100 text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={isAdding || !newName.trim()}
                className="px-5 py-2.5 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-soft"
              >
                <Plus className="w-4 h-4" />
                <span>{isAdding ? 'Menambah...' : 'Tambah'}</span>
              </button>
            </form>

            {/* Search Filter Input */}
            <div className="mt-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari nama benefit..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-50/40 border border-brand-100/70 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition"
              />
            </div>

            {/* List of Benefits */}
            <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-12 text-center text-ink-soft text-xs">Memuat data benefit...</div>
              ) : filteredBenefits.length === 0 ? (
                <div className="py-10 text-center rounded-2xl border border-dashed border-brand-200 text-ink-soft text-xs p-6">
                  <AlertCircle className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                  {searchFilter ? 'Tidak ada benefit yang cocok dengan pencarian.' : 'Belum ada benefit layanan. Tambahkan benefit pertama Anda di atas.'}
                </div>
              ) : (
                filteredBenefits.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-brand-50/40 border border-brand-100/80 hover:border-brand-200 transition gap-3"
                  >
                    {editingId === b.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-brand-600 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(b.id)}
                          disabled={isUpdating || !editingName.trim()}
                          className="w-7 h-7 rounded-full bg-emerald-600 text-white grid place-items-center hover:bg-emerald-700 transition shrink-0"
                          title="Simpan"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="w-7 h-7 rounded-full bg-gray-100 text-ink-soft grid place-items-center hover:bg-gray-200 transition shrink-0"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                          <span className="text-xs font-semibold text-ink truncate">{b.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(b)}
                            className="w-7 h-7 rounded-full bg-white border border-brand-100 text-amber-700 hover:bg-amber-600 hover:text-white grid place-items-center transition"
                            title="Edit Benefit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBenefitToDelete(b)}
                            className="w-7 h-7 rounded-full bg-white border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition"
                            title="Hapus Benefit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-brand-50 flex items-center justify-between text-xs text-ink-soft">
              <span>Total {filteredBenefits.length} benefit</span>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-brand-50 hover:bg-brand-100 text-ink text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!benefitToDelete}
        onClose={() => setBenefitToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Benefit Layanan"
        message={`Apakah Anda yakin ingin menghapus benefit "${benefitToDelete?.name}"? Benefit ini tidak akan lagi tersedia untuk paket laundry baru.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}
