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
  const [state, setState] = useState<'idle' | 'accepted' | 'declined' | 'taken' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)

  async function accept() {
    setLoading('accept')
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notary_id: notaryId }),
      })
      setLoading(null)
      if (res.ok) { setState('accepted'); return }
      const j = await res.json().catch(() => ({}))
      // 409 = already taken / no longer available; show the "taken" state so the
      // notary never believes they're confirmed when they aren't.
      if (res.status === 409) { setState('taken'); return }
      setErrorMsg(j.error || 'Something went wrong. Please call (619) 949-3361.')
      setState('error')
    } catch {
      setLoading(null)
      setErrorMsg('Network error. Please check your connection and try again.')
      setState('error')
    }
  }

  async function decline() {
    setLoading('decline')
    try {
      const res = await fetch(`/api/orders/${orderId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notary_id: notaryId }),
      })
      setLoading(null)
      // Decline is best-effort from the notary's view — even if it errors, treat
      // it as declined so they're not stuck, but log nothing misleading.
      setState('declined')
      void res
    } catch {
      setLoading(null)
      setState('declined')
    }
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

  if (state === 'taken') {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <XCircle className="text-amber-500 w-10 h-10" />
        <p className="font-semibold text-gray-900">Just missed it.</p>
        <p className="text-sm text-gray-500 text-center">Another agent grabbed this one first. We&apos;ll text you the next signing in your area.</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <XCircle className="text-red-500 w-10 h-10" />
        <p className="font-semibold text-gray-900">That didn&apos;t go through.</p>
        <p className="text-sm text-gray-500 text-center">{errorMsg}</p>
        <Button onClick={() => { setState('idle'); setErrorMsg('') }} size="lg" className="w-full">Try Again</Button>
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
