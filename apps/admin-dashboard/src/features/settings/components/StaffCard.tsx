import React from 'react'
import type { StaffUser } from '../models/SettingsModel'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { Shield, Phone, MapPin, Calendar, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'

interface StaffCardProps {
  staff: StaffUser
  isSelf: boolean
  canManage: boolean
  canEdit?: boolean
  canDelete?: boolean
  onEdit: (staff: StaffUser) => void
  onDelete: (staff: StaffUser) => void
  onToggleStatus?: (staff: StaffUser) => void
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  isSelf,
  canManage,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-xs">
            <Shield className="w-3 h-3 text-rose-600" />
            Super Admin
          </span>
        )
      case 'ADMIN':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shadow-xs">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin Outlet
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 shadow-xs">
            Staff Kasir
          </span>
        )
    }
  }

  return (
    <div className={`p-5 rounded-3xl bg-white border shadow-card transition-all duration-300 relative flex flex-col justify-between group ${
      staff.isActive ? 'border-brand-50 hover:shadow-soft hover:border-brand-200' : 'border-gray-200 opacity-60'
    }`}>
      <div>
        {/* 1:1 Aspect Ratio Photo or Initial Box */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 border border-brand-100 bg-brand-50/50 relative shadow-inner">
          {staff.profilePicture ? (
            <img
              src={resolveImageUrl(staff.profilePicture)}
              alt={staff.name}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 text-white select-none">
              <span className="text-5xl font-extrabold tracking-tight shadow-text">
                {staff.name ? staff.name[0].toUpperCase() : 'S'}
              </span>
              <span className="text-xs font-semibold opacity-80 mt-1">Nuy Staff</span>
            </div>
          )}

          {/* Floating Self Indicator */}
          {isSelf && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink/80 backdrop-blur-md text-white text-[10px] font-extrabold shadow-sm">
              Akun Anda
            </span>
          )}

          {/* Floating Status Indicator */}
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm backdrop-blur-md flex items-center gap-1 ${
            staff.isActive 
              ? 'bg-mint/90 text-emerald-950 border border-mint/40' 
              : 'bg-rose-100/90 text-rose-900 border border-rose-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`}></span>
            {staff.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>

        {/* Staff Identity & Role */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-extrabold text-ink text-base truncate group-hover:text-brand-600 transition" title={staff.name}>
              {staff.name}
            </h3>
            <p className="text-xs text-brand-600 font-mono font-medium truncate">
              @{staff.username}
            </p>
          </div>
          {getRoleBadge(staff.role)}
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 mt-3 pt-3 border-t border-brand-50/80 text-xs text-ink-soft">
          {staff.phone && (
            <div className="flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>{staff.phone}</span>
            </div>
          )}

          {staff.address && (
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-relaxed" title={staff.address}>
                {staff.address}
              </p>
            </div>
          )}

          {staff.createdAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-ink-soft/80 pt-1">
              <Calendar className="w-3 h-3 text-ink-soft/60" />
              <span>Bergabung: {new Date(staff.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3.5 border-t border-brand-50 flex items-center justify-between gap-2">
        {onToggleStatus && canManage && canEdit && !isSelf ? (
          <button
            type="button"
            onClick={() => onToggleStatus(staff)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              staff.isActive
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {staff.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        ) : (
          <span className="text-[11px] text-ink-soft font-medium">
            {staff.role === 'SUPER_ADMIN' ? 'Super Administrator' : staff.role === 'ADMIN' ? 'Admin Outlet' : 'Kasir & Front Desk'}
          </span>
        )}

        {canManage && (canEdit || canDelete) && (
          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(staff)}
                className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white grid place-items-center transition shadow-xs"
                title="Edit Staff"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {canDelete && !isSelf && (
              <button
                type="button"
                onClick={() => onDelete(staff)}
                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition shadow-xs"
                title="Hapus Akun Staff"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
