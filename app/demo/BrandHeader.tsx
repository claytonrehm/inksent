'use client'

import { useState } from 'react'

// Branded header for the demo. Priority: a full logo image (?logo=) if it loads,
// else the company's site icon (?domain=) next to the name, else just the name.
// Falls back gracefully if any image fails to load.
export default function BrandHeader({ logo, favicon, company }: { logo?: string; favicon?: string; company: string }) {
  const [logoOk, setLogoOk] = useState(!!logo)
  const [favOk, setFavOk] = useState(!!favicon)

  if (logo && logoOk) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt={company} className="h-9 max-w-[200px] object-contain" onError={() => setLogoOk(false)} />
  }
  return (
    <div className="flex items-center gap-2 min-w-0">
      {favicon && favOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" className="h-7 w-7 rounded object-contain shrink-0" onError={() => setFavOk(false)} />
      )}
      <div className="font-black text-base sm:text-lg text-gray-900 truncate max-w-[150px] sm:max-w-none">{company}</div>
    </div>
  )
}
