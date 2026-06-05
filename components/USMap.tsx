'use client'

import { useState } from 'react'

// Canonical tile-grid layout of the 50 states (geographically arranged)
const GRID: (string | null)[][] = [
  ['AK', null, null, null, null, null, null, null, null, null, 'ME'],
  [null, null, null, null, null, null, null, null, null, 'VT', 'NH'],
  ['WA', 'ID', 'MT', 'ND', 'MN', 'IL', 'WI', 'MI', null, 'NY', 'MA'],
  ['OR', 'NV', 'WY', 'SD', 'IA', 'IN', 'OH', 'PA', 'NJ', 'CT', 'RI'],
  ['CA', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE', null],
  [null, 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', 'SC', null, null, null],
  [null, null, null, 'OK', 'LA', 'MS', 'AL', 'GA', null, null, null],
  ['HI', null, null, 'TX', null, null, null, null, 'FL', null, null],
]

// States where closings are attorney-conducted
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(11, minmax(0, 1fr))' }}>
        {GRID.flat().map((code, i) => {
          if (!code) return <div key={i} />
          const isAttorney = ATTORNEY_STATES.has(code)
          const isHovered = hovered === code
          return (
            <div key={i} className="relative aspect-square">
              <button
                onMouseEnter={() => setHovered(code)}
                onMouseLeave={() => setHovered(null)}
                className={`w-full h-full rounded-md flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-150 cursor-default
                  ${isAttorney
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-violet-500 text-white hover:bg-violet-600'}
                  ${isHovered ? 'scale-110 shadow-lg z-10' : ''}`}
              >
                {code}
              </button>
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none">
                  {NAMES[code]}
                  <span className={`ml-1.5 ${isAttorney ? 'text-slate-400' : 'text-violet-300'}`}>
                    · {isAttorney ? 'Attorney state' : 'Direct dispatch'}
                  </span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-violet-500 inline-block" />
          <span className="text-gray-600">Direct dispatch</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-700 inline-block" />
          <span className="text-gray-600">Attorney-state closings</span>
        </div>
      </div>
    </div>
  )
}
