'use client'

import { useState } from 'react'
import states from '@/lib/us-states-paths.json'

// Where we actually have coverage today. Keep this honest — expand it only as we
// genuinely build a bench in new areas.
const COVERED = new Set(['CA'])

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

  return (
    <div className="max-w-3xl mx-auto">
      <svg viewBox="0 0 960 600" className="w-full h-auto" role="img" aria-label="Coverage map — currently Southern California">
        {states.map((s) => {
          const covered = COVERED.has(s.code)
          const active = hovered === s.code
          const fill = covered
            ? (active ? '#a78bfa' : '#7c3aed')   // violet — now serving
            : (active ? '#475569' : '#1e293b')   // slate — expanding
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
            <span className={COVERED.has(hovered) ? 'text-violet-300' : 'text-slate-400'}>
              {' '}· {COVERED.has(hovered) ? 'Now serving' : 'Expanding — check your ZIP'}
            </span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">Serving Southern California — tap a state to check</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded inline-block" style={{ background: '#7c3aed' }} />
          <span className="text-slate-400">Now serving</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded inline-block" style={{ background: '#1e293b' }} />
          <span className="text-slate-400">Expanding</span>
        </div>
      </div>
    </div>
  )
}
