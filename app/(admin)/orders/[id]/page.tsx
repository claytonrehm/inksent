import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { STATUS_COLORS, STATUS_LABELS, formatCurrency } from '@/lib/utils'
import OrderActions from './OrderActions'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [orderResult, notariesResult] = await Promise.all([
    supabase.from('orders').select('*, notaries(name, phone, email)').eq('id', id).single(),
    supabase.from('notaries').select('id, name, phone, zip_codes').eq('active', true).order('name'),
  ])

  if (orderResult.error || !orderResult.data) notFound()

  const order = orderResult.data
  const notaries = notariesResult.data ?? []

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.signer_name}</h1>
          <p className="text-gray-500 font-mono text-sm mt-1">{order.confirmation_number}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Signing Info */}
        <Card title="Signing Details">
          <Field label="Type" value={order.signing_type.replace('_', ' ')} capitalize />
          <Field label="Date" value={format(new Date(order.signing_date), 'EEEE, MMMM d, yyyy')} />
          <Field label="Time" value={formatTime(order.signing_time)} />
          <Field label="Address" value={`${order.property_address}, ${order.property_city}, ${order.property_state} ${order.property_zip}`} />
        </Card>

        {/* Signer */}
        <Card title="Signer / Borrower">
          <Field label="Name" value={order.signer_name} />
          <Field label="Phone" value={order.signer_phone} />
          {order.signer_email && <Field label="Email" value={order.signer_email} />}
        </Card>

        {/* Client */}
        <Card title="Client">
          <Field label="Company" value={order.client_company} />
          <Field label="Contact" value={order.client_name} />
          <Field label="Email" value={order.client_email} />
          <Field label="Phone" value={order.client_phone} />
        </Card>

        {/* Financials */}
        <Card title="Financials">
          <Field label="Client Fee" value={formatCurrency(order.client_fee)} />
          <Field label="Notary Fee" value={formatCurrency(order.notary_fee)} />
          <div className="border-t border-gray-100 mt-3 pt-3">
            <Field label="Your Spread" value={formatCurrency(order.client_fee - order.notary_fee)} bold />
          </div>
        </Card>
      </div>

      {/* Invoice */}
      {order.invoice_id && (
        <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Invoice Generated</p>
            <p className="text-sm text-green-900 font-mono mt-0.5">{order.invoice_id}</p>
          </div>
          <Link
            href={`/invoices/${order.id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:underline"
          >
            <FileText size={15} /> View / Print
          </Link>
        </div>
      )}

      {/* Special instructions */}
      {order.special_instructions && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Special Instructions</p>
          <p className="text-sm text-yellow-900">{order.special_instructions}</p>
        </div>
      )}

      {/* Dispatch / Actions */}
      <OrderActions order={order} notaries={notaries} />
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, value, capitalize, bold }: { label: string; value: string; capitalize?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-900 text-right ${capitalize ? 'capitalize' : ''} ${bold ? 'font-semibold text-green-700' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
