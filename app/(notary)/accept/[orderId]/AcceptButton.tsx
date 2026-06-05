'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AcceptButton({
  orderId,
  notaryId,
  notaryName,
}: {
  orderId: string
  notaryId: string
  notaryName: string
}) {
  const [state, setState] = useState<'idle' | 'accepted' | 'declined'>('idle')
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)

  async function accept() {
    setLoading('accept')
    await fetch(`/api/orders/${orderId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notary_id: notaryId }),
    })
    setLoading(null)
    setState('accepted')
  }

  async function decline() {
    setLoading('decline')
    await fetch(`/api/orders/${orderId}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notary_id: notaryId }),
    })
    setLoading(null)
    setState('declined')
  }

  if (state === 'accepted') {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <CheckCircle className="text-green-500 w-10 h-10" />
        <p className="font-semibold text-gray-900">Got it, {notaryName}!</p>
        <p className="text-sm text-gray-500 text-center">We&apos;ll confirm details with you shortly. Thank you!</p>
      </div>
    )
  }

  if (state === 'declined') {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <XCircle className="text-gray-400 w-10 h-10" />
        <p className="font-semibold text-gray-700">No problem, {notaryName}.</p>
        <p className="text-sm text-gray-500 text-center">We&apos;ll find another agent. Thanks for letting us know.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button onClick={accept} loading={loading === 'accept'} disabled={loading !== null} size="lg" className="w-full">
        Accept This Signing
      </Button>
      <button
        onClick={decline}
        disabled={loading !== null}
        className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors disabled:opacity-50"
      >
        {loading === 'decline' ? 'Declining...' : "Can't make it"}
      </button>
    </div>
  )
}
