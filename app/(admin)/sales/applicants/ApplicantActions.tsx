'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Approve (creates a rep) or reject a sales-rep applicant.
export default function ApplicantActions({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function act(action: 'approve' | 'reject') {
    if (action === 'reject' && !confirm('Reject this applicant?')) return
    setLoading(action)
    setError(null)
    const res = await fetch(`/api/admin/sales/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setLoading(null)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Failed')
      return
    }
    if (action === 'approve') {
      const j = await res.json().catch(() => ({}))
      if (j.repId) { router.push(`/sales/${j.repId}`); return }
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      <button onClick={() => act('reject')} disabled={!!loading}
        className="text-xs font-medium text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg px-3 py-1.5 disabled:opacity-50">
        {loading === 'reject' ? '…' : 'Reject'}
      </button>
      <button onClick={() => act('approve')} disabled={!!loading}
        className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5 disabled:opacity-50">
        {loading === 'approve' ? '…' : 'Approve → create rep'}
      </button>
    </div>
  )
}
