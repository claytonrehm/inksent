import { Fragment } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WINDOWS = [
  { key: 'day', label: 'Daytime', sub: '9a–5p' },
  { key: 'eve', label: 'Evening', sub: '5p–9p' },
] as const

function cell(count: number) {
  if (count === 0) return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }   // gap
  if (count <= 2) return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }     // thin
  return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' }                     // covered
}

// Network time-coverage heatmap. Rows = time window, columns = day of week,
// each cell = how many active agents are available then. Built from the coarse
// availability windows captured at apply (weekday day/evening, weekends).
export default function TimeCoverage({ notaries }: { notaries: { availability?: string[] | null }[] }) {
  const grid: Record<string, number[]> = { day: Array(7).fill(0), eve: Array(7).fill(0) }
  let sameDay = 0
  let noAvail = 0

  for (const n of notaries) {
    const a = n.availability ?? []
    if (a.length === 0) { noAvail++; continue }
    if (a.includes('same_day')) sameDay++
    for (let d = 0; d < 7; d++) {
      const weekday = d < 5
      if (weekday && a.includes('weekday_day')) grid.day[d]++
      if (weekday && a.includes('weekday_evening')) grid.eve[d]++
      if (!weekday && a.includes('weekends')) { grid.day[d]++; grid.eve[d]++ }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: '78px repeat(7, minmax(0,1fr))' }}>
        <div />
        {DAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold pb-1 ${i >= 5 ? 'text-violet-500' : 'text-gray-500'}`}>{d}</div>
        ))}
        {WINDOWS.map((w) => (
          <Fragment key={w.key}>
            <div className="flex flex-col justify-center text-right pr-2">
              <span className="text-xs font-semibold text-gray-700">{w.label}</span>
              <span className="text-[10px] text-gray-400">{w.sub}</span>
            </div>
            {grid[w.key].map((c, i) => {
              const col = cell(c)
              return (
                <div key={i} className="rounded-lg flex items-center justify-center h-12 text-base font-bold"
                  style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
                  title={`${c} agent${c === 1 ? '' : 's'} — ${DAYS[i]} ${w.label.toLowerCase()}`}>
                  {c}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#fef2f2', border: '1px solid #fecaca' }} /> <span className="text-gray-500">0 — gap</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#fffbeb', border: '1px solid #fde68a' }} /> <span className="text-gray-500">1–2 — thin</span></span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }} /> <span className="text-gray-500">3+ — covered</span></span>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 pt-3 border-t border-gray-100 text-sm">
        <span className="text-gray-600">🔆 <strong>{sameDay}</strong> agent{sameDay === 1 ? '' : 's'} take same-day / last-minute</span>
        {noAvail > 0 && <span className="text-amber-700">⚠️ <strong>{noAvail}</strong> haven&apos;t set availability yet</span>}
      </div>
    </div>
  )
}
