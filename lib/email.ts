import { Resend } from 'resend'
import { format } from 'date-fns'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'

// Email-safe two-column row (label left, value right) — uses a table, not flexbox
function detailRow(label: string, value: string, opts: { last?: boolean; bold?: boolean } = {}) {
  const border = opts.last ? '' : 'border-bottom:1px solid #eee;'
  return `<tr>
    <td style="padding:8px 0;${border}font-size:14px;color:#888888;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;${border}font-size:14px;color:#111111;text-align:right;vertical-align:top;${opts.bold ? 'font-weight:600;' : ''}">${value}</td>
  </tr>`
}

const META = `<meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-schemes" content="light"/>`

// ─── Admin New Order Alert ────────────────────────────────────────────────────

export async function sendAdminOrderAlert(data: {
  confirmationNumber: string
  signingType: string
  signingDate: string
  signingTime: string
  signerName: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  clientCompany: string
  clientName: string
  clientPhone: string
  clientEmail: string
  blastInfo: string
}) {
  const typeLabel = data.signingType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9f9f9;margin:0;padding:24px;">
    <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <div style="background:#5B4FCF;padding:18px 28px;color:white;">
        <div style="font-size:13px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">New Signing Order</div>
        <div style="font-size:20px;font-weight:800;margin-top:2px;font-family:monospace;">${data.confirmationNumber}</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-size:13px;color:#166534;margin-bottom:20px;">
          ${data.blastInfo}
        </div>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="color:#888;padding:6px 0;">Type</td><td style="text-align:right;font-weight:600;">${typeLabel}</td></tr>
          <tr><td style="color:#888;padding:6px 0;">Date</td><td style="text-align:right;font-weight:600;">${data.signingDate} at ${data.signingTime}</td></tr>
          <tr><td style="color:#888;padding:6px 0;">Signer</td><td style="text-align:right;">${data.signerName}</td></tr>
          <tr><td style="color:#888;padding:6px 0;">Address</td><td style="text-align:right;">${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}</td></tr>
          <tr><td style="color:#888;padding:6px 0;border-top:1px solid #eee;">Client</td><td style="text-align:right;border-top:1px solid #eee;font-weight:600;">${data.clientCompany}</td></tr>
          <tr><td style="color:#888;padding:6px 0;">Contact</td><td style="text-align:right;">${data.clientName}</td></tr>
          <tr><td style="color:#888;padding:6px 0;">Phone</td><td style="text-align:right;"><a href="tel:${data.clientPhone}" style="color:#5B4FCF;">${data.clientPhone}</a></td></tr>
        </table>
        <a href="https://inksent.co/orders/" style="display:block;text-align:center;background:#5B4FCF;color:white;text-decoration:none;font-weight:700;padding:12px;border-radius:8px;margin-top:20px;">Manage Order →</a>
      </div>
    </div>
  </body></html>`

  return getResend().emails.send({
    from: 'Inksent Orders <orders@inksent.co>',
    to: ADMIN_EMAIL,
    subject: `📋 New order: ${typeLabel} in ${data.propertyCity} — ${data.signingDate}`,
    html,
  })
}

// ─── Notary Assignment Confirmation ───────────────────────────────────────────

export async function sendNotaryAssignmentEmail(data: {
  notaryName: string
  notaryEmail: string
  signerName: string
  signerPhone: string
  signingType: string
  signingDate: string
  signingTime: string
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  specialInstructions?: string
  confirmationNumber: string
  fee: number
}) {
  const firstName = data.notaryName.split(' ')[0]
  const typeLabel = data.signingType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <div style="display:inline-block;background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">&#10003; Signing Confirmed</div>
      <p style="font-size:16px;font-weight:700;color:#111111;margin:0 0 4px">You&rsquo;re locked in, ${firstName}.</p>
      <p style="font-size:14px;color:#555555;margin:0 0 4px;line-height:1.6;">Here are the full details for your upcoming signing. Save this email.</p>

      <div style="background:#f8f8f8;border-radius:10px;padding:8px 20px;margin:20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow('Signing Type', typeLabel)}
          ${detailRow('Date', data.signingDate)}
          ${detailRow('Time', data.signingTime)}
          ${detailRow('Address', `${data.propertyAddress}<br/>${data.propertyCity}, ${data.propertyState} ${data.propertyZip}`)}
          ${detailRow('Signer', data.signerName)}
          ${detailRow('Signer Phone', `<a href="tel:${data.signerPhone}" style="color:#7c3aed;text-decoration:none;">${data.signerPhone}</a>`)}
          ${detailRow('Confirmation #', `<span style="font-family:monospace;">${data.confirmationNumber}</span>`, { last: true })}
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f3ff;border-radius:8px;margin-top:16px;">
        <tr>
          <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#111111;">Your Fee</td>
          <td style="padding:14px 16px;font-size:22px;font-weight:800;color:#5b21b6;text-align:right;">$${(data.fee / 100).toFixed(0)}</td>
        </tr>
      </table>

      ${data.specialInstructions ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-top:16px;line-height:1.5;"><strong>Special Instructions:</strong> ${data.specialInstructions}</div>` : ''}

      <p style="font-size:13px;color:#555555;margin-top:20px;line-height:1.6;">
        Please arrive a few minutes early and bring all required supplies. When the signing is complete, let us know and we&rsquo;ll process your payment.
      </p>
      <p style="font-size:13px;color:#777777;margin:12px 0 0">
        Questions? Call or text <a href="tel:+16199493361" style="color:#7c3aed;text-decoration:none;">(619) 949-3361</a> — Clayton, Inksent
      </p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Clayton at Inksent <orders@inksent.co>',
    to: data.notaryEmail,
    subject: `Signing confirmed — ${typeLabel} on ${data.signingDate} at ${data.signingTime}`,
    html,
  })
}

// ─── Client Notary Assignment Notification ────────────────────────────────────

export async function sendClientAssignmentEmail(data: {
  clientName: string
  clientEmail: string
  notaryName: string
  notaryPhone: string
  signerName: string
  signingType: string
  signingDate: string
  signingTime: string
  propertyAddress: string
  propertyCity: string
  confirmationNumber: string
}) {
  const firstName = data.clientName.split(' ')[0]
  const typeLabel = data.signingType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const initials = data.notaryName.split(' ').map(w => w[0]).join('').slice(0,2)
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <p style="font-size:16px;font-weight:700;color:#111111;margin:0 0 4px">Your signing agent is confirmed, ${firstName}.</p>
      <p style="font-size:14px;color:#555555;margin:0;line-height:1.6;">Here&rsquo;s who will be at the table:</p>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin:20px 0;">
        <tr>
          <td width="64" valign="middle" style="padding:20px 0 20px 20px;width:64px;">
            <div style="width:48px;height:48px;background:#7c3aed;border-radius:24px;color:#ffffff;font-size:18px;font-weight:800;text-align:center;line-height:48px;mso-line-height-rule:exactly;">${initials}</div>
          </td>
          <td valign="middle" style="padding:20px;">
            <div style="font-size:16px;font-weight:700;color:#111111;">${data.notaryName}</div>
            <div style="font-size:13px;color:#555555;margin:2px 0;">NNA-Certified Signing Agent</div>
            <a href="tel:${data.notaryPhone}" style="font-size:13px;color:#7c3aed;font-weight:600;text-decoration:none;">${data.notaryPhone}</a>
          </td>
        </tr>
      </table>

      <div style="background:#f8f8f8;border-radius:10px;padding:8px 20px;margin:20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow('Service', `${typeLabel} Signing`, { bold: true })}
          ${detailRow('Signer / Borrower', data.signerName)}
          ${detailRow('Date', data.signingDate, { bold: true })}
          ${detailRow('Time', data.signingTime, { bold: true })}
          ${detailRow('Location', `${data.propertyAddress}, ${data.propertyCity}`)}
          ${detailRow('Confirmation #', `<span style="font-family:monospace;">${data.confirmationNumber}</span>`, { last: true })}
        </table>
      </div>

      <p style="font-size:13px;color:#777777;margin:0;line-height:1.6;">Questions? Reply to this email or call <a href="tel:+16199493361" style="color:#7c3aed;text-decoration:none;">(619) 949-3361</a>.</p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Inksent <orders@inksent.co>',
    to: data.clientEmail,
    subject: `Agent confirmed — ${data.notaryName} for your ${typeLabel} on ${data.signingDate}`,
    html,
  })
}

const HEADER = `
  <div style="background:#000;padding:24px 32px;">
    <div style="font-size:24px;font-weight:900;letter-spacing:-0.5px;">
      <span style="color:white;">ink</span><span style="color:#a78bfa;">sent</span>
    </div>
  </div>
`

const FOOTER = `
  <div style="background:#f7f7f7;padding:18px 32px;text-align:center;font-size:12px;color:#999;">
    Inksent Signing Services &nbsp;·&nbsp; orders@inksent.co &nbsp;·&nbsp; (619) 949-3361
  </div>
`

// ─── Notary Application Acknowledgment ────────────────────────────────────────

export async function sendNotaryApplicationEmail(notary: {
  name: string
  email: string
}) {
  const firstName = notary.name.split(' ')[0]

  const step = (num: number, title: string, body: string) => `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:22px;">
      <tr>
        <td width="40" valign="top" style="width:40px;">
          <div style="width:28px;height:28px;background:#7c3aed;border-radius:14px;color:#ffffff;font-size:13px;font-weight:800;text-align:center;line-height:28px;mso-line-height-rule:exactly;">${num}</div>
        </td>
        <td valign="top">
          <div style="font-size:15px;font-weight:700;color:#111111;margin-bottom:4px;">${title}</div>
          <div style="font-size:13px;color:#666666;line-height:1.6;">${body}</div>
        </td>
      </tr>
    </table>`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-schemes" content="light"/>
  </head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:36px;">
      <h2 style="font-size:20px;font-weight:800;color:#111111;margin:0 0 6px;">You&rsquo;re almost in, ${firstName}! 🎉</h2>
      <p style="font-size:14px;color:#555555;line-height:1.6;margin:0 0 16px;">Thanks for applying to the Inksent signing network. We review every application personally — you&rsquo;ll hear from us within 1&ndash;2 business days.</p>

      <p style="font-weight:600;color:#111111;font-size:15px;margin:0 0 20px;">Here&rsquo;s exactly how it works once you&rsquo;re approved:</p>

      ${step(1, 'You get a text with the job details', `When a signing comes up in your area, you&rsquo;ll receive a text from (619) 949-3361 that looks like this:
        <div style="background:#e9e9eb;border-radius:14px;padding:14px 16px;font-size:13px;color:#111111;line-height:1.5;margin:12px 0 0;">
          Hi Jane, signing opportunity from Inksent:<br/><br/>
          Type: Refinance<br/>
          Signer: John Smith<br/>
          Date: Monday, Jun 16<br/>
          Time: 10:00 AM<br/>
          Address: 123 Main St, San Diego 92101<br/>
          Your fee: $90<br/><br/>
          Reply YES to accept or tap:<br/>
          <span style="color:#7c3aed;font-weight:600;text-decoration:underline;">inksent.co/accept/&hellip;</span><br/><br/>
          This offer expires in 30 min.
        </div>`)}

      ${step(2, 'One tap to accept — first one wins', `We may send the same job to a few agents in your area at the same time. Tap the link or reply YES — first to respond gets the signing. If you can&rsquo;t make it, tap &ldquo;Can&rsquo;t make it&rdquo; so we know to move on quickly.`)}

      ${step(3, 'Show up, execute, confirm', `Arrive on time, complete the signing professionally, and let us know when you&rsquo;re done. We handle the client — you focus on the table.`)}

      ${step(4, 'Get paid', `Once the signing is confirmed complete, we process your payment via Zelle, Venmo, or check — whichever you selected on your application.`)}

      <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;"/>

      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#5b21b6;line-height:1.6;"><strong>Save this number:</strong> All job offers come from <strong>(619) 949-3361</strong>. Add it as &ldquo;Inksent Signing&rdquo; in your contacts so you never miss a job.</p>
      </div>

      <p style="font-size:13px;color:#888888;line-height:1.6;margin:0 0 12px;">Questions before you hear back from us? Reply to this email or text/call (619) 949-3361.</p>
      <p style="font-size:13px;color:#888888;margin:0;">— Clayton<br/>Inksent Signing Services</p>
    </div>
    ${FOOTER}
  </div>
  </body></html>`

  return getResend().emails.send({
    from: 'Clayton at Inksent <orders@inksent.co>',
    to: notary.email,
    subject: `Application received — here's how Inksent works`,
    html,
  })
}

// ─── Order Confirmation (Title Company) ───────────────────────────────────────

export async function sendOrderConfirmationEmail(order: {
  confirmation_number: string
  client_name: string
  client_email: string
  signing_type: string
  signing_date: string
  signing_time: string
  signer_name: string
  property_city: string
}) {
  const [h, m] = order.signing_time.split(':').map(Number)
  const timeStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  const dateStr = format(new Date(order.signing_date), 'EEEE, MMMM d, yyyy')
  const typeLabel = order.signing_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const firstName = order.client_name.split(' ')[0]

  const nextItem = (text: string) => `<tr>
    <td width="24" valign="top" style="padding:4px 0;font-size:14px;color:#7c3aed;font-weight:700;">&#10003;</td>
    <td valign="top" style="padding:4px 0;font-size:13px;color:#555555;line-height:1.5;">${text}</td>
  </tr>`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <p style="font-size:16px;font-weight:700;color:#111111;margin:0 0 6px;">Order confirmed, ${firstName}.</p>
      <p style="font-size:14px;color:#555555;margin:0;line-height:1.6;">We&rsquo;re on it. A signing agent will be confirmed and you&rsquo;ll hear from us shortly.</p>

      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 24px;margin:24px 0;text-align:center;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;font-weight:600;">Confirmation Number</div>
        <div style="font-size:28px;font-family:monospace;font-weight:800;color:#1f1f1f;margin-top:4px;letter-spacing:1px;">${order.confirmation_number}</div>
        <div style="font-size:12px;color:#999999;margin-top:6px;">Save this for your records</div>
      </div>

      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888888;font-weight:600;margin-bottom:4px;">Signing Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${detailRow('Service', `${typeLabel} Signing`, { bold: true })}
        ${detailRow('Signer / Borrower', order.signer_name)}
        ${detailRow('Date', dateStr)}
        ${detailRow('Time', timeStr)}
        ${detailRow('Location', order.property_city)}
        ${detailRow('Fee', '<span style="font-weight:700;color:#5b21b6;">$175.00</span>', { last: true })}
      </table>

      <div style="background:#f8f8f8;border-radius:10px;padding:16px 20px;margin:24px 0;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888888;font-weight:600;margin-bottom:10px;">What happens next</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${nextItem('We&rsquo;re contacting signing agents in the area right now')}
          ${nextItem('You&rsquo;ll receive agent confirmation details once assigned')}
          ${nextItem('Invoice will be emailed after the signing is completed')}
        </table>
      </div>

      <p style="font-size:13px;color:#777777;margin:0;line-height:1.6;">Need to make changes or have questions?<br/>
      Reply to this email, call <a href="tel:+16199493361" style="color:#7c3aed;text-decoration:none;">(619) 949-3361</a>, or text us anytime.</p>
    </div>
    ${FOOTER}
  </div>
  </body></html>`

  return getResend().emails.send({
    from: 'Inksent <orders@inksent.co>',
    to: order.client_email,
    subject: `Signing order confirmed — ${typeLabel} on ${format(new Date(order.signing_date), 'MMM d')} [${order.confirmation_number}]`,
    html,
  })
}

