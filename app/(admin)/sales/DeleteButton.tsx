'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

// Small inline delete with a confirm step. Used for unassigning accounts and
// removing payout records. After success it refreshes the server component.
export default function DeleteButton({
  url,
  confirmLabel = 'Remove?',
  redirectTo,
}: {
  url: string
  confirmLabel?: string
  redirectTo?: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function doDelete() {
    setLoading(true)
    const res = await fetch(url, { method: 'DELETE' })
    setLoading(false)
    if (!res.ok) {
      setConfirming(false)
      return
    }
    if (redirectTo) router.push(redirectTo)
    else router.refresh()
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <button onClick={doDelete} disabled={loading} className="text-red-600 font-medium hover:underline disabled:opacity-50">
          {loading ? '…' : confirmLabel}
        </button>
        <button onClick={() => setConfirming(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
      </span>
    )
  }
  return (
    <button onClick={() => setConfirming(true)} className="text-gray-400 hover:text-red-600 transition-colors" title="Remove">
      <Trash2 size={14} />
    </button>
  )
}
