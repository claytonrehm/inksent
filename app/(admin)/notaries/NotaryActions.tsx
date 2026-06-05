'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

interface Notary {
  id: string
  name: string
  email: string
  phone: string
  photo_url?: string
  nna_certified: boolean
  nna_number?: string
  commission_state_code?: string
  commission_expiry?: string
  eo_carrier?: string
  eo_expiry?: string
  bgc_provider?: string
  bgc_date?: string
  years_experience?: number
  linkedin_url?: string
  zip_codes: string[]
  availability_notes?: string
  signing_types_comfort?: string[]
  payment_method?: string
  payment_handle?: string
  active: boolean
}

export default function NotaryActions({ notary }: { notary: Notary }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/notaries/${notary.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !notary.active }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!notary.active && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            Review {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}
        <button
          onClick={toggle}
          disabled={loading}
          className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            notary.active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          }`}
        >
          {loading
            ? '...'
            : notary.active
              ? <><XCircle size={12} /> Deactivate</>
              : <><CheckCircle size={12} /> Approve</>
          }
        </button>
      </div>

      {/* Expanded review panel */}
      {expanded && !notary.active && (
        <tr>
          <td colSpan={6} className="px-4 pb-4 pt-0">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mt-1">
              <div className="flex gap-5">
                {/* Photo */}
                <div className="shrink-0">
                  {notary.photo_url ? (
                    <Image src={notary.photo_url} alt={notary.name} width={80} height={80}
                      className="w-20 h-20 rounded-xl object-cover border border-amber-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-amber-100 flex items-center justify-center text-2xl font-bold text-amber-600">
                      {notary.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Details grid */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                  <Field label="Email" value={notary.email} />
                  <Field label="Phone" value={notary.phone} />
                  <Field label="Experience" value={notary.years_experience ? `${notary.years_experience} years` : '—'} />
                  <Field label="NNA Certified" value={notary.nna_certified ? `Yes${notary.nna_number ? ` · ${notary.nna_number}` : ''}` : 'No'} />
                  <Field label="Commission" value={[notary.commission_state_code, notary.commission_expiry ? `exp ${notary.commission_expiry}` : null].filter(Boolean).join(' · ') || '—'} />
                  <Field label="Background Check" value={[notary.bgc_provider, notary.bgc_date].filter(Boolean).join(' · ') || '—'} />
                  <Field label="E&O Insurance" value={[notary.eo_carrier, notary.eo_expiry ? `exp ${notary.eo_expiry}` : null].filter(Boolean).join(' · ') || 'None'} />
                  <Field label="Payment" value={[notary.payment_method, notary.payment_handle].filter(Boolean).join(' · ') || '—'} />
                  {notary.linkedin_url && <Field label="LinkedIn" value={notary.linkedin_url} />}
                  {notary.signing_types_comfort?.length ? <Field label="Signing Types" value={notary.signing_types_comfort.join(', ')} /> : null}
                  {notary.availability_notes && <Field label="Availability" value={notary.availability_notes} />}
                  <div className="col-span-full">
                    <span className="text-gray-400 text-xs">ZIP Codes: </span>
                    <span className="text-gray-700 text-xs">{notary.zip_codes.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-200 flex gap-3">
                <button onClick={toggle} disabled={loading}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                  <CheckCircle size={14} /> Approve & Add to Bench
                </button>
                <a href={`tel:${notary.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Call to Verify
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  )
}
