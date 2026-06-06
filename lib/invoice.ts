import { Resend } from 'resend'
import { format } from 'date-fns'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
}

export function generateInvoiceNumber(orderId: string) {
  return `INV-${Date.now().toString(36).toUpperCase()}`
}

export function buildInvoiceHTML(order: {
  confirmation_number: string
  invoice_number: string
  created_at: string
  signing_date: string
  signing_time: string
  signing_type: string
  signer_name: string
  property_address: string
  property_city: string
  property_state: string
  property_zip: string
  client_company: string
  client_name: string
  client_email: string
  client_fee: number
  pay_url?: string | null
}) {
  const signingTypeLabel = order.signing_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const [h, m] = order.signing_time.split(':').map(Number)
  const timeStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  const fee = (order.client_fee / 100).toFixed(2)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; margin: 0; padding: 0; background: #f9f9f9; }
    .wrap { max-width: 600px; margin: 32px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #000; padding: 28px 36px; }
    .logo-text { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
    .logo-ink { color: white; }
    .logo-sent { color: #a78bfa; }
    .tagline { color: #666; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
    .body { padding: 36px; }
    .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: #111; }
    .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f3f3; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0; font-size: 17px; font-weight: 700; }
    .amount { color: #5b21b6; }
    .footer { background: #f7f7f7; padding: 20px 36px; text-align: center; font-size: 12px; color: #999; }
    .status-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo-text"><span class="logo-ink">ink</span><span class="logo-sent">sent</span></div>
      <div class="tagline">Signing Services</div>
    </div>
    <div class="body">
      <div class="invoice-meta">
        <div>
          <div class="label">Invoice</div>
          <div class="value">${order.invoice_number}</div>
        </div>
        <div style="text-align:right">
          <div class="label">Date</div>
          <div class="value">${format(new Date(order.created_at), 'MMMM d, yyyy')}</div>
          <div style="margin-top:8px"><span class="status-badge">Paid on completion</span></div>
        </div>
      </div>

      <div class="section-title">Billed To</div>
      <div style="margin-bottom:24px; font-size:14px; line-height:1.6">
        <strong>${order.client_company}</strong><br/>
        ${order.client_name}<br/>
        ${order.client_email}
      </div>

      <div class="section-title">Signing Details</div>
      <div class="row"><span style="color:#555">Confirmation #</span><span>${order.confirmation_number}</span></div>
      <div class="row"><span style="color:#555">Service</span><span>${signingTypeLabel} Signing</span></div>
      <div class="row"><span style="color:#555">Signer</span><span>${order.signer_name}</span></div>
      <div class="row"><span style="color:#555">Property</span><span>${order.property_address}, ${order.property_city}, ${order.property_state} ${order.property_zip}</span></div>
      <div class="row"><span style="color:#555">Signing Date</span><span>${format(new Date(order.signing_date), 'MMMM d, yyyy')} at ${timeStr}</span></div>

      <hr class="divider" />

      <div class="total-row">
        <span>Total Due</span>
        <span class="amount">$${fee}</span>
      </div>
      ${order.pay_url ? `<a href="${order.pay_url}" style="display:block;text-align:center;background:#5b21b6;color:#ffffff;text-decoration:none;font-weight:700;padding:14px;border-radius:10px;margin-top:20px;font-size:15px;">Pay Invoice Online →</a><p style="text-align:center;font-size:12px;color:#999;margin-top:8px;">Secure payment via Stripe. Or pay by check/ACH — net 30.</p>` : '<p style="text-align:center;font-size:13px;color:#666;margin-top:18px;">Payment due within 30 days. Pay by check or ACH — details on request.</p>'}
    </div>
    <div class="footer">
      Inksent Signing Services · orders@inksent.co · (619) 949-3361<br/>
      Thank you for your business.
    </div>
  </div>
</body>
</html>`
}

export async function sendInvoiceEmail(order: Parameters<typeof buildInvoiceHTML>[0] & { id?: string }) {
  // Create a Stripe pay-now link if configured (auto-reconciled via webhook)
  let pay_url: string | null = null
  if (order.id) {
    const { createInvoicePaymentLink } = await import('./stripe')
    pay_url = await createInvoicePaymentLink({
      id: order.id,
      confirmation_number: order.confirmation_number,
      client_fee: order.client_fee,
      client_company: order.client_company,
    })
  }
  const html = buildInvoiceHTML({ ...order, pay_url })
  return getResend().emails.send({
    from: 'Inksent <invoices@inksent.co>',
    to: order.client_email,
    subject: `Invoice ${order.invoice_number} — ${order.signing_type.replace(/_/g, ' ')} signing on ${format(new Date(order.signing_date), 'MMM d')}`,
    html,
  })
}
