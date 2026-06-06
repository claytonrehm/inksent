'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-violet-600 text-white font-semibold px-5 py-3 rounded-full shadow-xl hover:bg-violet-700 transition-colors"
    >
      <Printer size={16} /> Save as PDF
    </button>
  )
}
