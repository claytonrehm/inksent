import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Building2, Mail, Phone } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Partner Leads — Inksent Admin' }

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase
    .from('partner_applications')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Building2 size={20} className="text-violet-600" /> Title Partner Leads</h1>
        <p className="text-gray-500 text-sm mt-1">Title companies who asked to partner with you. Reach out within a business day.</p>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">Apply the <code>partner_applications</code> migration to see leads here.</div>
      ) : !leads || leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          No partner inquiries yet. Share <span className="font-mono text-violet-600">inksent.co/partners/apply</span> with title companies.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{l.company}</h3>
                  <p className="text-sm text-gray-600">{l.contact_name}{l.role ? ` · ${l.role}` : ''}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-violet-600"><Mail size={13} /> {l.email}</a>
                    {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 hover:text-violet-600"><Phone size={13} /> {l.phone}</a>}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {format(new Date(l.created_at), 'MMM d, h:mm a')}
                  <div className="mt-1 flex flex-wrap gap-1 justify-end">
                    {l.monthly_volume && <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded">{l.monthly_volume}/mo</span>}
                    {l.billing_preference && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{l.billing_preference === 'net_30' ? 'Net 30' : 'Per signing'}</span>}
                  </div>
                </div>
              </div>
              {l.message && <p className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{l.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
