'use client'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ *
 * StatCard — a single KPI tile
 * ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'violet',
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  accent?: 'violet' | 'green' | 'amber' | 'slate' | 'sky'
}) {
  const accents: Record<string, string> = {
    violet: 'text-violet-600 bg-violet-50',
    green: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    slate: 'text-slate-600 bg-slate-100',
    sky: 'text-sky-600 bg-sky-50',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        {icon && (
          <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', accents[accent])}>{icon}</span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 tabular-nums leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * BarChart — trailing monthly bars with hover values
 * ------------------------------------------------------------------ */

export function BarChart({
  data,
  formatValue,
  height = 150,
  barClassName = 'bg-gradient-to-t from-violet-500 to-indigo-400',
}: {
  data: { label: string; value: number; hint?: string }[]
  formatValue: (v: number) => string
  height?: number
  barClassName?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={i} className="group flex-1 flex flex-col items-center justify-end h-full">
            <div className="relative w-full flex flex-col items-center justify-end flex-1">
              <span className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-100 whitespace-nowrap -translate-y-full pointer-events-none z-10">
                {formatValue(d.value)}
                {d.hint && <span className="text-gray-400 font-normal"> · {d.hint}</span>}
              </span>
              <div
                className={cn('w-full max-w-[40px] rounded-t-md transition-all duration-300 min-h-[2px]', barClassName)}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium mt-2">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * DonutChart — proportional ring with center total + legend
 * ------------------------------------------------------------------ */

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[]
  centerLabel: string
  centerValue: string
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 54
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
        <svg width={132} height={132} viewBox="0 0 132 132" className="-rotate-90">
          <circle cx={66} cy={66} r={r} fill="none" stroke="#f1f5f9" strokeWidth={16} />
          {total > 0 &&
            data.map((d, i) => {
              const len = (d.value / total) * c
              const seg = (
                <circle
                  key={i}
                  cx={66}
                  cy={66}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={16}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              )
              offset += len
              return seg
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-gray-900 leading-none tabular-nums">{centerValue}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1.5 min-w-0">
        {data.length === 0 && <li className="text-xs text-gray-400">No completed jobs yet.</li>}
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-gray-600 font-medium">{d.label}</span>
            <span className="text-gray-400 tabular-nums">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
