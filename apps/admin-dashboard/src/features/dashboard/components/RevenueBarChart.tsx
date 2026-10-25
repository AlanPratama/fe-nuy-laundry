import React from 'react'
import type { DailyRevenue } from '../models/DashboardModel'

interface Props {
  data: DailyRevenue[]
}

export const RevenueBarChart: React.FC<Props> = ({ data }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-brand-50 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-50 gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink">Grafik Pendapatan Mingguan</h3>
          <p className="text-xs text-ink-soft">Omzet harian selama 7 hari terakhir</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-ink-soft">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
            Omzet (Rp)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-ink-soft">
            <span className="w-2.5 h-2.5 rounded-full bg-sun"></span>
            Volume Cucian (Kg)
          </span>
        </div>
      </div>

      {/* SVG Bar Chart container */}
      <div className="mt-8 h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.revenue / maxRevenue) * 100)
          const isToday = idx === data.length - 1

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ink text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg pointer-events-none whitespace-nowrap z-10">
                Rp{item.revenue.toLocaleString('id-ID')} • {item.weightKg} kg
              </div>

              {/* Bar */}
              <div className="w-full max-w-[42px] flex items-end justify-center h-44 bg-brand-50/50 rounded-2xl p-1 relative overflow-hidden">
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-xl transition-all duration-700 ease-out group-hover:brightness-110 ${
                    isToday ? 'bg-brand-600 shadow-soft' : 'bg-brand-300'
                  }`}
                ></div>
              </div>

              {/* X Axis Label */}
              <div className="mt-2 text-center">
                <p className={`text-xs font-bold ${isToday ? 'text-brand-600' : 'text-ink'}`}>
                  {item.day}
                </p>
                <p className="text-[10px] text-ink-soft">{item.date.split(' ')[0]}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
