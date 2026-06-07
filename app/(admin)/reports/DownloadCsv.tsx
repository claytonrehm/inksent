'use client'

import { Download } from 'lucide-react'

// Generic CSV export — turns rows into a downloadable file (for your accountant,
// 1099 prep, partner billing, etc.). All data is already on the page.
export default function DownloadCsv({
  filename, headers, rows, label,
}: { filename: string; headers: string[]; rows: (string | number)[][]; label: string }) {
  function download() {
    const esc = (v: string | number) => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button onClick={download} className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
      <Download size={13} /> {label}
    </button>
  )
}
