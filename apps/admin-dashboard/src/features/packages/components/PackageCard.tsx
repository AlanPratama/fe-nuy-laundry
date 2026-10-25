import React from 'react'
import type { PackageItem } from '../models/PackageModel'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { Clock, Edit2, Trash2, Star, Sparkles, Check, Eye } from 'lucide-react'

interface Props {
  pkg: PackageItem
  canManage?: boolean
  onEdit: (pkg: PackageItem) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, current: boolean) => void
  onViewDetail?: (pkg: PackageItem) => void
}

export const PackageCard: React.FC<Props> = ({ 
  pkg, 
  canManage = true, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onViewDetail
}) => {
  const days = pkg.daysEstimation || Math.max(1, Math.round(pkg.estimateHours / 24))

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-white border shadow-card transition-all duration-300 relative flex flex-col justify-between ${
      pkg.isActive ? 'border-brand-50 hover:shadow-soft hover:-translate-y-1' : 'border-gray-200 opacity-60'
    }`}>
      <div>
        {/* Package Image if available (1:1 aspect ratio) */}
        {pkg.photo && (
          <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 border border-brand-100 bg-brand-50/50">
            <img
              src={resolveImageUrl(pkg.photo)}
              alt={pkg.name}
              className="w-full h-full object-cover transition duration-300 hover:scale-105"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            pkg.type === 'WEIGHT' 
              ? 'bg-brand-50 text-brand-600 border border-brand-100' 
              : 'bg-sun/20 text-amber-900 border border-sun/30'
          }`}>
            {pkg.type === 'WEIGHT' ? 'Kiloan' : 'Satuan'}
          </span>

          {pkg.isPopular && (
            <span className="px-3 py-1 rounded-full bg-sun text-ink text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-ink" />
              Favorit
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-ink">{pkg.name}</h3>
        <p className="mt-3">
          <span className="text-3xl font-extrabold text-brand-600">
            Rp{pkg.price.toLocaleString('id-ID')}
          </span>
          <span className="text-xs font-semibold text-ink-soft ml-1">
            /{pkg.unit}
          </span>
        </p>

        <p className="mt-3 text-xs text-ink-soft flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          Estimasi Pengerjaan: <span className="font-bold text-ink">{days} Hari</span>
        </p>

        {pkg.description && (
          <p className="mt-4 text-xs text-ink-soft leading-relaxed line-clamp-3">
            {pkg.description}
          </p>
        )}

        {/* Benefits List */}
        {pkg.benefits && pkg.benefits.length > 0 && (
          <div className="mt-4 pt-3 border-t border-brand-50 space-y-1.5">
            <p className="text-[10px] font-bold text-ink-soft uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" />
              Benefit Paket:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.benefits.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-brand-50/70 text-brand-800 px-2.5 py-0.5 rounded-full border border-brand-100/50"
                >
                  <Check className="w-2.5 h-2.5 text-brand-600" />
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-brand-50 flex items-center justify-between">
        {canManage ? (
          <button
            type="button"
            onClick={() => onToggleActive(pkg.id, pkg.isActive)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              pkg.isActive 
                ? 'bg-mint/20 text-emerald-800 border border-mint/40' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-mint' : 'bg-gray-400'}`}></span>
            {pkg.isActive ? 'Aktif' : 'Nonaktif'}
          </button>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            pkg.isActive ? 'bg-mint/20 text-emerald-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-mint' : 'bg-gray-400'}`}></span>
            {pkg.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        )}

        <div className="flex items-center gap-2">
          {onViewDetail && (
            <button
              type="button"
              onClick={() => onViewDetail(pkg)}
              className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
              title="Lihat Detail & Riwayat Transaksi Paket"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Detail</span>
            </button>
          )}

          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit(pkg)}
                className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white grid place-items-center transition"
                title="Edit Paket"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(pkg.id)}
                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white grid place-items-center transition"
                title="Hapus Paket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
