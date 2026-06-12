'use client'

import { useState } from 'react'

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false)
  async function open() {
    setLoading(true)
    const res = await fetch('/api/hub/portal', { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }
  return (
    <button
      onClick={open}
      disabled={loading}
      className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
    >
      {loading ? '…' : 'Manage billing'}
    </button>
  )
}
