'use client'

import { useEffect, useState } from 'react'

// Sticky section tabs for the title-company demo. Makes it feel like a real portal
// (jump straight to Orders, Invoices, etc.) instead of forcing a scroll. Anchor
// clicks are smooth-scrolled by the global handler in SmoothScroll (offset for the
// sticky bar); this just highlights the section currently in view.
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'tracking', label: 'Live Tracking' },
  { id: 'orders', label: 'Orders' },
  { id: 'invoices', label: 'Invoices' },
]

export default function DemoSectionNav() {
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`whitespace-nowrap px-3.5 py-3 text-sm font-medium border-b-2 transition-colors ${
                active === s.id
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
