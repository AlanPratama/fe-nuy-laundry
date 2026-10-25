import React from 'react'
import type { ExpressQueueItem } from '../models/DashboardModel'
import { Zap, Clock, CheckCircle2 } from 'lucide-react'

interface Props {
  items: ExpressQueueItem[]
}

export const ExpressQueueWidget: React.FC<Props> = ({ items }) => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-brand-50 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-brand-50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sun text-ink grid place-items-center shadow-sm">
              <Zap className="w-4 h-4 fill-ink" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Antrean Prioritas Express</h3>
              <p className="text-[11px] text-ink-soft">Pesanan dengan batas waktu selesai hari ini</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-sun/20 text-amber-900 font-bold text-xs">
            {items.length} Pesanan
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-xs text-ink-soft py-8 text-center">
              Tidak ada antrean express aktif saat ini. Semua pesanan lancar!
            </p>
          ) : (
            items.map((item) => {
              const isUrgent = item.remainingMinutes <= 60
              const hours = Math.floor(item.remainingMinutes / 60)
              const mins = item.remainingMinutes % 60
              const remainingText = hours > 0 ? `${hours} jam ${mins} mnt` : `${mins} menit`

              return (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isUrgent 
                      ? 'bg-rose-50/60 border-rose-200' 
                      : 'bg-brand-50/40 border-brand-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-ink">{item.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isUrgent 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-sun text-ink'
                    }`}>
                      <Clock className="w-3 h-3" />
                      Sisa {remainingText}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-ink">{item.customerName}</p>
                      <p className="text-[11px] text-ink-soft">{item.packageName} • {item.quantity} kg</p>
                    </div>

                    <span className="text-[11px] font-medium text-ink-soft">
                      Batas: <strong className="text-ink">{item.deadlineTime}</strong>
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-brand-50 text-center">
        <p className="text-[11px] text-ink-soft">
          Dahulukan pakaian pada antrean ini untuk memenuhi garansi tepat waktu.
        </p>
      </div>
    </div>
  )
}
