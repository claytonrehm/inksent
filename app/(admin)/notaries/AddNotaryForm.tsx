'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils'

export default function AddNotaryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [nna, setNna] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/notaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone,
        base_zip: form.get('base_zip'),
        coverage_radius: parseInt(form.get('coverage_radius') as string) || 25,
        nna_certified: nna,
        active: true,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Could not add notary')
      return
    }
    setPhone('')
    setNna(false)
    ;(e.target as HTMLFormElement).reset()
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-1">Add Notary Manually</h3>
      <p className="text-xs text-gray-400 mb-4">Adds an active notary directly to your bench.</p>
      <form onSubmit={submit} className="space-y-3">
        <Input id="name" name="name" label="Full Name *" placeholder="Jane Notary" required />
        <Input id="email" name="email" type="email" label="Email *" placeholder="jane@email.com" required />
        <Input
          id="phone"
          label="Phone *"
          placeholder="(619) 555-0100"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input id="base_zip" name="base_zip" label="Home ZIP *" placeholder="92101" maxLength={5} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Radius</label>
            <select name="coverage_radius" defaultValue="20"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="10">10 mi</option>
              <option value="20">20 mi</option>
              <option value="30">30 mi</option>
              <option value="50">50 mi</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={nna} onChange={(e) => setNna(e.target.checked)} className="rounded" />
          NNA Certified
        </label>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Add to Bench
        </Button>
      </form>
    </div>
  )
}
