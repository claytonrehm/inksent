'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Power, Trash2 } from 'lucide-react'

export default function NotaryDetailActions({ id, active, name }: { id: string; active: boolean; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function toggle() {
    setLoading('toggle')
    await fetch(`/api/notaries/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    setLoading(null)
    router.refresh()
  }

  async function remove() {
    if (!confirm(`Permanently remove ${name} from your network? This cannot be undone.`)) return
    setLoading('remove')
    const res = await fetch(`/api/notaries/${id}`, { method: 'DELETE' })
    setLoading(null)
    if (res.ok) router.push('/notaries')
    else alert('Could not remove — this notary may have completed orders on record. Deactivate instead.')
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggle} disabled={loading !== null}
        className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
          active ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-green-600 text-white hover:bg-green-700'
        }`}>
        <Power size={14} /> {loading === 'toggle' ? '...' : active ? 'Deactivate' : 'Reactivate'}
      </button>
      <button onClick={remove} disabled={loading !== null}
        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
        <Trash2 size={14} /> {loading === 'remove' ? '...' : 'Remove'}
      </button>
    </div>
  )
}
