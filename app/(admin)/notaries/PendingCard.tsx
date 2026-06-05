'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Phone, Mail, ExternalLink, MapPin } from 'lucide-react'

interface Notary {
  id: string
  name: string
  email: string
  phone: string
  photo_url?: string
  nna_certified: boolean
  years_experience?: number
  base_zip?: string
  coverage_radius?: number
  coverage_label?: string
  notes?: string
}

export default function PendingCard({ notary }: { notary: Notary }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null)

  async function approve() {
    setLoading('approve')
    await fetch(`/api/notaries/${notary.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    })
    setLoading(null)
    router.refresh()
  }

  async function deny() {
    if (!confirm(`Deny and remove ${notary.name}'s application?`)) return
    setLoading('deny')
    await fetch(`/api/notaries/${notary.id}`, { method: 'DELETE' })
    setLoading(null)
    router.refresh()
  }

  const nnaUrl = `https://www.nationalnotary.org/find-a-notary-signing-agent`

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex gap-4">
          {/* Photo */}
          {notary.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notary.photo_url}
              alt={notary.name}
              className="rounded-xl object-cover border border-gray-200 shrink-0"
              style={{ width: 72, height: 72 }}
            />
          ) : (
            <div className="rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold shrink-0" style={{ width: 72, height: 72 }}>
              {notary.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">{notary.name}</h3>
            <div className="flex flex-col gap-0.5 mt-1 text-sm text-gray-500">
              <a href={`tel:${notary.phone}`} className="flex items-center gap-1.5 hover:text-violet-600">
                <Phone size={12} /> {notary.phone}
              </a>
              <a href={`mailto:${notary.email}`} className="flex items-center gap-1.5 hover:text-violet-600 truncate">
                <Mail size={12} /> {notary.email}
              </a>
            </div>
          </div>
        </div>

        {/* Credentials grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <Detail label="NNA Certified" value={notary.nna_certified ? 'Yes' : 'No'} highlight={notary.nna_certified} />
          <Detail label="Experience" value={notary.years_experience ? `${notary.years_experience} yrs` : '—'} />
          <Detail label="Coverage" value={notary.coverage_radius ? `${notary.coverage_radius} mi radius` : '—'} />
        </div>

        {/* Coverage area */}
        {notary.coverage_label && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-lg">
            <MapPin size={12} /> Based in {notary.coverage_label} · serves {notary.coverage_radius} mi
          </div>
        )}

        {notary.notes && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <span className="text-xs text-gray-400 block mb-0.5">Notes</span>
            {notary.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-3">
        <button
          onClick={approve}
          disabled={loading !== null}
          className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <CheckCircle size={15} /> {loading === 'approve' ? 'Approving...' : 'Approve & Add to Bench'}
        </button>
        <button
          onClick={deny}
          disabled={loading !== null}
          className="flex items-center gap-1.5 text-red-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <XCircle size={15} /> {loading === 'deny' ? 'Removing...' : 'Deny'}
        </button>
        <a
          href={nnaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
        >
          <ExternalLink size={13} /> Verify NNA
        </a>
      </div>
    </div>
  )
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-green-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}
