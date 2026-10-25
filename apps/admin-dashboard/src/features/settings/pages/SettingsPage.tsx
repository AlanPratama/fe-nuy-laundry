import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '../providers/useSettingsStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { OutletProfileForm } from '../components/OutletProfileForm'
import type { OutletProfile } from '../models/SettingsModel'
import { useToast } from '../../../components/ui/Toast'
import { Users, ArrowRight } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { user, token } = useAuthStore()
  const { profile, fetchProfileAndStaff, updateProfile } = useSettingsStore()
  const { success, error: toastError } = useToast()

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (token) {
      fetchProfileAndStaff(token)
    }
  }, [token, fetchProfileAndStaff])

  const handleSaveProfile = async (newProfile: OutletProfile) => {
    if (token) {
      try {
        await updateProfile(token, newProfile)
        success('Pengaturan profil outlet berhasil diperbarui!')
      } catch (err: any) {
        toastError(err?.message || 'Gagal menyimpan profil outlet')
        throw err
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
              Konfigurasi Sistem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            Pengaturan Toko & Outlet
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Kelola informasi toko, radius pengantaran, jam buka-tutup, dan catatan footer struk.
          </p>
        </div>

        {canManage && (
          <Link
            to="/staff"
            className="px-5 py-3 rounded-full bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition inline-flex items-center gap-2 border border-brand-100 shadow-sm self-start sm:self-auto"
          >
            <Users className="w-4 h-4" />
            <span>Kelola Akun Staff Kasir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <OutletProfileForm
        initialProfile={profile}
        canManage={canManage}
        onSave={handleSaveProfile}
      />
    </div>
  )
}
