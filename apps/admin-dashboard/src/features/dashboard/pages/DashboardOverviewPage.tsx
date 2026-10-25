import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardStore } from '../providers/useDashboardStore'
import { useAuthStore } from '../../auth/providers/useAuthStore'
import { RevenueBarChart } from '../components/RevenueBarChart'
import { ExpressQueueWidget } from '../components/ExpressQueueWidget'
import { 
  TrendingUp, 
  ShoppingBag, 
  Scale, 
  Clock, 
  Sparkles,
  Waves,
  Wind
} from 'lucide-react'

interface Props {
  onNavigateToPOS?: () => void
}

export const DashboardOverviewPage: React.FC<Props> = ({ onNavigateToPOS }) => {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const { metrics, isLoading, fetchMetrics } = useDashboardStore()

  useEffect(() => {
    if (token) {
      fetchMetrics(token)
    }
  }, [token, fetchMetrics])

  const greetingName = user?.name || 'Kasir Outlet'

  return (
    <div className="space-y-8">
      {/* Greeting Banner (BWA style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 text-white p-7 sm:p-9 shadow-soft">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-sun text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Outlet Aktif
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Semangat Pagi, {greetingName}! 👋
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Hari ini ada <span className="font-bold text-sun">{metrics?.activeOrdersCount || 6} pesanan aktif</span> yang sedang berjalan di mesin cuci dan setrika uap.
            </p>
          </div>

          <button
            onClick={() => {
              if (onNavigateToPOS) onNavigateToPOS()
              else navigate('/transactions')
            }}
            className="px-6 py-3.5 rounded-full bg-sun text-ink font-bold text-xs shadow-card hover:-translate-y-0.5 hover:shadow-lg transition shrink-0"
          >
            Buka POS Transaksi ↗
          </button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Omzet Hari Ini */}
        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Omzet Hari Ini</p>
          <p className="text-2xl font-extrabold text-ink mt-2">
            Rp{(metrics?.todayRevenue || 840000).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {metrics?.todayRevenueGrowth || '+18%'} vs kemarin
          </p>
        </div>

        {/* Berat Cucian Hari Ini */}
        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Volume Cucian</p>
          <p className="text-2xl font-extrabold text-brand-600 mt-2">
            {metrics?.todayWeightKg || 105} <span className="text-sm font-semibold text-ink-soft">Kg</span>
          </p>
          <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-brand-600" /> Total pakaian tercuci
          </p>
        </div>

        {/* Pesanan Aktif */}
        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Sedang Dicuci</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            {metrics?.activeOrdersCount || 6} <span className="text-sm font-semibold text-ink-soft">Nota</span>
          </p>
          <p className="text-xs text-ink-soft mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Di tabung mesin & setrika
          </p>
        </div>

        {/* Selesai Hari Ini */}
        <div className="p-6 rounded-3xl bg-white border border-brand-50 shadow-card">
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Selesai Siap Antar</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            {metrics?.doneOrdersCount || 14} <span className="text-sm font-semibold text-ink-soft">Nota</span>
          </p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" /> Siap diambil pelanggan
          </p>
        </div>
      </div>

      {/* Main Charts & Express Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch">
        <RevenueBarChart data={metrics?.weeklyRevenue || []} />
        <ExpressQueueWidget items={metrics?.expressQueue || []} />
      </div>

      {/* Machine Capacity Status */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-brand-50 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-brand-50">
          <div>
            <h3 className="text-base font-bold text-ink">Status Kapasitas Mesin Cuci & Dryer</h3>
            <p className="text-xs text-ink-soft">Pemantauan siklus mesin cuci di outlet secara realtime</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Standard 1 Mesin 1 Pelanggan
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(metrics?.machines || []).map((m) => {
            const isWashing = m.status === 'WASHING'
            const isDrying = m.status === 'DRYING'

            return (
              <div 
                key={m.id}
                className={`p-4 rounded-2xl border transition ${
                  isWashing 
                    ? 'bg-brand-50/50 border-brand-200' 
                    : isDrying 
                    ? 'bg-sun/15 border-sun/40' 
                    : 'bg-gray-50/60 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-xl grid place-items-center ${
                    isWashing ? 'bg-brand-600 text-white' : isDrying ? 'bg-sun text-ink' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isWashing ? <Waves className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isWashing 
                      ? 'bg-brand-600 text-white' 
                      : isDrying 
                      ? 'bg-sun text-ink' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isWashing ? 'Mencuci' : isDrying ? 'Mengeringkan' : 'Idle (Siap Pakai)'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-ink mt-3">{m.name}</h4>
                <p className="text-xs text-ink-soft">Kapasitas Maks: {m.capacityKg} kg</p>

                {m.remainingMinutes ? (
                  <div className="mt-3 pt-2.5 border-t border-brand-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-ink-soft">{m.currentInvoice}</span>
                    <span className="font-bold text-brand-600">Sisa {m.remainingMinutes} mnt</span>
                  </div>
                ) : (
                  <div className="mt-3 pt-2.5 border-t border-gray-200 text-xs text-emerald-700 font-semibold">
                    Mesin kosong & bersih
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
