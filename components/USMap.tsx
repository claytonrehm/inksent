'use client'

import { useState } from 'react'
import states from '@/lib/us-states-paths.json'

const ATTORNEY_STATES = new Set([
  'CT', 'DE', 'GA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MS', 'NH',
  'NJ', 'NY', 'NC', 'ND', 'OH', 'OR', 'PA', 'RI', 'SC', 'VT', 'VA', 'WV',
])

const NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

export default function USMap() {
  const [hovered, setHovered] = useState<string | null>(null)
  const isAttorney = (c: string) => ATTORNEY_STATES.has(c)

  return (
    <div className="max-w-3xl mx-auto">
      <svg viewBox="0 0 960 600" className="w-full h-auto" role="img" aria-label="US coverage map">
        {states.map((s) => {
          const attorney = isAttorney(s.code)
          const active = hovered === s.code
          const fill = attorney
            ? (active ? '#475569' : '#334155')   // slate-600 / slate-700
            : (active ? '#a78bfa' : '#7c3aed')    // violet-400 / violet-600
          return (
            <path
              key={s.code}
              d={s.d}
              fill={fill}
              stroke="#07070d"
              strokeWidth={active ? 1.5 : 0.75}
              onMouseEnter={() => setHovered(s.code)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered(s.code)}
              onTouchStart={() => setHovered(s.code)}
              style={{ transition: 'fill 120ms', cursor: 'pointer' }}
            />
          )
        })}
      </svg>

      {/* Caption + legend */}
      <div className="mt-4 text-center min-h-[24px]">
        {hovered ? (
          <p className="text-sm font-medium text-white">
            {NAMES[hovered]}
            <span className={isAttorney(hovered) ? 'text-slate-400' : 'text-violet-300'}>
              {' '}· {isAttorney(hovered) ? 'Attorney-state closing' : 'Direct dispatch'}
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">Tap any state for coverage details</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded inline-block" style={{ background: '#7c3aed' }} />
          <span className="text-slate-400">Direct dispatch</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded inline-block" style={{ background: '#334155' }} />
          <span className="text-slate-400">Attorney-state closings</span>
        </div>
      </div>
    </div>
  )
}
