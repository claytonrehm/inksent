'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils'

export default function AddNotaryForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [zipInput, setZipInput] = useState('')
  const [zips, setZips] = useState<string[]>([])
  const [phone, setPhone] = useState('')
  const [nna, setNna] = useState(false)

  function addZip() {
    const z = zipInput.trim()
    if (/^\d{5}$/.test(z) && !zips.includes(z)) {
      setZips([...zips, z])
      setZipInput('')
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    await fetch('/api/notaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone,
        zip_codes: zips,
        nna_certified: nna,
        commission_state: form.get('state') as string || 'CA',
      }),
    })
    setLoading(false)
    setZips([])
    setPhone('')
    setNna(false)
    ;(e.target as HTMLFormElement).reset()
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Add Notary</h3>
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

        {/* ZIP codes */}
        <div>
          <label className="text-sm font-medium text-gray-700">Coverage ZIPs</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              maxLength={5}
              placeholder="92101"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addZip())}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button type="button" onClick={addZip} className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200">
              Add
            </button>
          </div>
          {zips.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {zips.map((z) => (
                <span key={z} className="bg-violet-50 text-violet-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  {z}
                  <button type="button" onClick={() => setZips(zips.filter((x) => x !== z))} className="hover:text-blue-900">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={nna} onChange={(e) => setNna(e.target.checked)} className="rounded" />
          NNA Certified
        </label>

        <Button type="submit" loading={loading} className="w-full mt-1">
          Add to Network
        </Button>
      </form>
    </div>
  )
}
