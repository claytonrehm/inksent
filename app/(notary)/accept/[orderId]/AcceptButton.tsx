'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
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
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function accept() {
    setLoading(true)
    await fetch(`/api/orders/${orderId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notary_id: notaryId }),
    })
    setLoading(false)
    setAccepted(true)
  }

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <CheckCircle className="text-green-500 w-10 h-10" />
        <p className="font-semibold text-gray-900">Got it, {notaryName}!</p>
        <p className="text-sm text-gray-500 text-center">We&apos;ll confirm details with you shortly. Thank you!</p>
      </div>
    )
  }

  return (
    <Button onClick={accept} loading={loading} size="lg" className="w-full">
      Accept This Signing
    </Button>
  )
}
