import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInvoiceEmail, generateInvoiceNumber } from '@/lib/invoice'
import { sendSigningCompleteEmail } from '@/lib/email'
import { sendSMS } from '@/lib/sms'

// Notary self-reports the signing complete (+ optional scan-backs).
// Auto-generates the invoice and emails the client. Removes the admin's manual step.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id, scan_backs } = await req.json()

  const supabase = await createClient()
  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Only the assigned notary can complete it
  if (order.notary_id !== notary_id) {
    return NextResponse.json({ error: 'Not your assignment' }, { status: 403 })
  }
  if (order.status === 'completed') {
    return NextResponse.json({ ok: true, already: true })
  }

  const invoice_id = order.invoice_id || generateInvoiceNumber(id)
  await supabase.from('orders').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    invoice_id,
    scan_backs: Array.isArray(scan_backs) && scan_backs.length ? [...(order.scan_backs ?? []), ...scan_backs] : order.scan_backs,
  }).eq('id', id)

  const hasScanBacks = Array.isArray(scan_backs) && scan_backs.length > 0

  // Look up the notary for the warm messages (name for the client, phone to thank)
  const { data: notary } = order.notary_id
    ? await supabase.from('notaries').select('name, phone').eq('id', order.notary_id).single()
    : { data: null }
  const notaryName = notary?.name || 'your signing agent'

  // Invoice the client (transactional)
  if (order.client_email) {
    sendInvoiceEmail({ ...order, invoice_number: invoice_id }).catch(console.error)
  }

  // Warm "signing complete" congratulations to the title company (keep escrow happy)
  if (order.client_email) {
    sendSigningCompleteEmail({
      clientName: order.client_name,
      clientEmail: order.client_email,
      notaryName,
      signerName: order.signer_name,
      signingType: order.signing_type,
      confirmationNumber: order.confirmation_number,
      hasScanBacks,
    }).catch(console.error)
  }
  if (order.client_phone) {
    sendSMS(
      order.client_phone,
      `🎉 ${order.signer_name}'s signing is complete! Executed by ${notaryName}.${hasScanBacks ? ' Scan-backs uploaded.' : ''} Thank you for choosing Inksent. — Clayton`
    ).catch(console.error)
  }

  // Thank-you to the notary (appreciation keeps the bench engaged)
  if (notary?.phone) {
    const payout = order.notary_fee ? `$${(order.notary_fee / 100).toFixed(0)}` : 'your fee'
    sendSMS(
      notary.phone,
      `Thank you for completing ${order.signer_name}'s signing! 🙏 ${payout} will be paid out automatically once the client pays. We appreciate you — Inksent`
    ).catch(console.error)
  }

  // Nudge admin to rate the notary (quality loop)
  if (process.env.ADMIN_PHONE) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
    sendSMS(
      process.env.ADMIN_PHONE,
      `✅ Signing complete: ${order.signer_name} (${order.confirmation_number}). Invoice sent to ${order.client_company}.${Array.isArray(scan_backs) && scan_backs.length ? ` ${scan_backs.length} scan-back(s) uploaded.` : ''} Rate the notary: ${baseUrl}/orders/${id}`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
