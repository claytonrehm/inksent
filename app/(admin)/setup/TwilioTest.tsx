'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle } from 'lucide-react'

export default function TwilioTest() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function test() {
    if (!phone) return
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/sms/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1') }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setResult({ ok: true, message: `SMS sent to ${phone}. Check your phone!` })
    } else {
      setResult({ ok: false, message: data.missing ? `Missing: ${data.missing.join(', ')}` : data.error })
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="tel"
          placeholder="(760) 504-5984"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <Button onClick={test} loading={loading} size="sm">Send Test</Button>
      </div>
      {result && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {result.message}
        </div>
      )}
    </div>
  )
}
