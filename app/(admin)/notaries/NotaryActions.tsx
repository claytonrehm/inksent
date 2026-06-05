'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'

export default function NotaryActions({ notaryId, active }: { notaryId: string; active: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/notaries/${notaryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
        active
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {loading ? '...' : active ? <><XCircle size={12} /> Deactivate</> : <><CheckCircle size={12} /> Approve</>}
    </button>
  )
}
