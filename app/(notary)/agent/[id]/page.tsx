import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import InksentLogo from '@/components/InksentLogo'
import { Landmark, CalendarClock, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your Dashboard — Inksent', description: 'Your upcoming signings and earnings.' }

function timeLabel(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export default async function AgentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: notary } = await supabase
    .from('notaries')
    .select('id, name, payouts_enabled, onboarded_at')
    .eq('id', id)
    .single()
  if (!notary) notFound()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signer_name, property_city, property_state, notary_fee, notary_paid_at, completed_at')
    .eq('notary_id', id)
    .order('signing_date', { ascending: false })

  const all = orders ?? []
  const today = new Date().toISOString().split('T')[0]
  const upcoming = all
    .filter(o => ['assigned', 'confirmed'].includes(o.status) && o.signing_date >= today)
    .sort((a, b) => a.signing_date.localeCompare(b.signing_date))
  const completed = all.filter(o => o.status === 'completed')

  const totalEarned = completed.reduce((s, o) => s + (o.notary_fee ?? 0), 0)
  const paidOut = completed.filter(o => o.notary_paid_at).reduce((s, o) => s + (o.notary_fee ?? 0), 0)
  const pending = totalEarned - paidOut

  const firstName = (notary.name ?? '').split(' ')[0]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto"><InksentLogo size="md" /></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Welcome back, {firstName}</h1>
        <p className="text-gray-500 text-sm mb-8">Your signings and earnings at a glance.</p>

        {!notary.payouts_enabled && (
          <a href={`/onboard/${id}/connect`} className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 mb-6 hover:bg-violet-100 transition-colors">
            <Landmark className="text-violet-600 w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Connect your bank to get paid</p>
              <p className="text-xs text-gray-500">2 minutes, deposit-only. Your completed-signing pay is waiting.</p>
            </div>
          </a>
        )}

        {/* Earnings */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total earned</p>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(totalEarned)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Paid out</p>
            <p className="text-2xl font-black text-green-600">{formatCurrency(paidOut)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Pending</p>
            <p className="text-2xl font-black text-violet-600">{formatCurrency(pending)}</p>
          </div>
        </div>

        {/* Upcoming */}
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><CalendarClock size={16} className="text-violet-600" /> Upcoming signings</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md mb-8 divide-y divide-gray-50">
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">No upcoming signings right now. We&apos;ll text you when a job opens in your area.</p>
          ) : upcoming.map(o => (
            <div key={o.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{o.signer_name}</p>
                <p className="text-xs text-gray-500">{format(new Date(o.signing_date), 'EEE, MMM d')} at {timeLabel(o.signing_time)} · {o.property_city}, {o.property_state}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-violet-700">{formatCurrency(o.notary_fee ?? 0)}</p>
                <a href={`/complete/${o.id}?notary=${id}`} className="text-xs text-violet-600 hover:underline">Manage →</a>
              </div>
            </div>
          ))}
        </div>

        {/* Completed */}
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><CheckCircle2 size={16} className="text-green-600" /> Completed ({completed.length})</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md divide-y divide-gray-50">
          {completed.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">No completed signings yet.</p>
          ) : completed.slice(0, 50).map(o => (
            <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{o.signer_name}</p>
                <p className="text-xs text-gray-400">{o.completed_at ? format(new Date(o.completed_at), 'MMM d, yyyy') : format(new Date(o.signing_date), 'MMM d, yyyy')} · {o.confirmation_number}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(o.notary_fee ?? 0)}</p>
                <p className={`text-[11px] font-medium ${o.notary_paid_at ? 'text-green-600' : 'text-amber-600'}`}>{o.notary_paid_at ? 'Paid' : 'Pending'}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions about your pay? <a href="tel:+16199493361" className="underline">(619) 949-3361</a> · support@inksent.co
        </p>
      </div>
    </main>
  )
}
