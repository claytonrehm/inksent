import { Resend } from 'resend'
import { format } from 'date-fns'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
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

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;margin:0;padding:0;background:#f9f9f9;}
    .wrap{max-width:560px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
    .header{background:#000;padding:24px 32px;}
    .logo{font-size:24px;font-weight:900;letter-spacing:-0.5px;}
    .body{padding:32px;}
    .badge{display:inline-block;background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;}
    .detail-box{background:#f8f8f8;border-radius:10px;padding:20px;margin:20px 0;}
    .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:14px;}
    .row:last-child{border-bottom:none;}
    .label{color:#888;}
    .highlight-row{background:#f5f3ff;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;}
    .fee{font-size:22px;font-weight:800;color:#5b21b6;}
    .note{background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-top:16px;}
    .footer{background:#f7f7f7;padding:18px 32px;text-align:center;font-size:12px;color:#999;}
  </style></head><body>
  <div class="wrap">
    <div class="header"><div class="logo"><span style="color:white">ink</span><span style="color:#a78bfa">sent</span></div></div>
    <div class="body">
      <div class="badge">✓ Signing Confirmed</div>
      <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 4px">You're locked in, ${firstName}.</p>
      <p style="font-size:14px;color:#555;margin:0 0 4px">Here are the full details for your upcoming signing. Save this email.</p>

      <div class="detail-box">
        <div class="row"><span class="label">Signing Type</span><span style="font-weight:600">${typeLabel}</span></div>
        <div class="row"><span class="label">Date</span><span style="font-weight:600">${data.signingDate}</span></div>
        <div class="row"><span class="label">Time</span><span style="font-weight:600">${data.signingTime}</span></div>
        <div class="row"><span class="label">Address</span><span style="text-align:right">${data.propertyAddress}<br/>${data.propertyCity}, ${data.propertyState} ${data.propertyZip}</span></div>
        <div class="row"><span class="label">Signer Name</span><span style="font-weight:600">${data.signerName}</span></div>
        <div class="row"><span class="label">Signer Phone</span><span><a href="tel:${data.signerPhone}" style="color:#7c3aed">${data.signerPhone}</a></span></div>
        <div class="row"><span class="label">Confirmation #</span><span style="font-family:monospace;font-size:13px">${data.confirmationNumber}</span></div>
      </div>

      <div class="highlight-row">
        <span style="font-size:14px;font-weight:600;color:#111">Your Fee</span>
        <span class="fee">$${(data.fee / 100).toFixed(0)}</span>
      </div>

      ${data.specialInstructions ? `<div class="note"><strong>Special Instructions:</strong> ${data.specialInstructions}</div>` : ''}

      <p style="font-size:13px;color:#555;margin-top:20px;">
        Please arrive a few minutes early and bring all required supplies.<br/>
        When the signing is complete, let us know and we'll process your payment.
      </p>
      <p style="font-size:13px;color:#777;margin:12px 0 0">
        Questions? Call or text <a href="tel:+16199493361" style="color:#7c3aed">(619) 949-3361</a> — Clayton, Inksent
      </p>
    </div>
    <div class="footer">Inksent Signing Services · orders@inksent.co · (619) 949-3361</div>
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

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;margin:0;padding:0;background:#f9f9f9;}
    .wrap{max-width:560px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
    .header{background:#000;padding:24px 32px;}
    .logo{font-size:24px;font-weight:900;letter-spacing:-0.5px;}
    .body{padding:32px;}
    .agent-card{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:20px;margin:20px 0;display:flex;align-items:center;gap:16px;}
    .agent-initials{background:#7c3aed;color:white;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;flex-shrink:0;}
    .detail-box{background:#f8f8f8;border-radius:10px;padding:20px;margin:20px 0;}
    .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:14px;}
    .row:last-child{border-bottom:none;}
    .label{color:#888;}
    .footer{background:#f7f7f7;padding:18px 32px;text-align:center;font-size:12px;color:#999;}
  </style></head><body>
  <div class="wrap">
    <div class="header"><div class="logo"><span style="color:white">ink</span><span style="color:#a78bfa">sent</span></div></div>
    <div class="body">
      <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 4px">Your signing agent is confirmed, ${firstName}.</p>
      <p style="font-size:14px;color:#555;margin:0">Here's who will be at the table:</p>

      <div class="agent-card">
        <div class="agent-initials">${data.notaryName.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
        <div>
          <div style="font-size:16px;font-weight:700;color:#111">${data.notaryName}</div>
          <div style="font-size:13px;color:#555">NNA-Certified Signing Agent</div>
          <a href="tel:${data.notaryPhone}" style="font-size:13px;color:#7c3aed;font-weight:600">${data.notaryPhone}</a>
        </div>
      </div>

      <div class="detail-box">
        <div class="row"><span class="label">Service</span><span style="font-weight:600">${typeLabel} Signing</span></div>
        <div class="row"><span class="label">Signer / Borrower</span><span>${data.signerName}</span></div>
        <div class="row"><span class="label">Date</span><span style="font-weight:600">${data.signingDate}</span></div>
        <div class="row"><span class="label">Time</span><span style="font-weight:600">${data.signingTime}</span></div>
        <div class="row"><span class="label">Location</span><span>${data.propertyAddress}, ${data.propertyCity}</span></div>
        <div class="row"><span class="label">Confirmation #</span><span style="font-family:monospace">${data.confirmationNumber}</span></div>
      </div>

      <p style="font-size:13px;color:#777;margin:0">Questions? Reply to this email or call <a href="tel:+16199493361" style="color:#7c3aed">(619) 949-3361</a>.</p>
    </div>
    <div class="footer">Inksent Signing Services · orders@inksent.co · (619) 949-3361</div>
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

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;margin:0;padding:0;background:#f9f9f9;}
    .wrap{max-width:580px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
    .body{padding:36px;}
    h2{font-size:20px;font-weight:800;color:#111;margin:0 0 6px;}
    p{font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;}
    .step{display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;}
    .step-num{background:#7c3aed;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0;margin-top:2px;}
    .step-body h4{margin:0 0 4px;font-size:14px;font-weight:700;color:#111;}
    .step-body p{margin:0;font-size:13px;color:#666;}
    .sms-bubble{background:#e9e9eb;border-radius:18px;border-bottom-left-radius:4px;padding:12px 16px;font-size:13px;color:#111;line-height:1.5;margin:12px 0;max-width:340px;}
    .sms-bubble .link{color:#7c3aed;font-weight:600;text-decoration:underline;}
    .highlight{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:16px 20px;margin:24px 0;}
    .highlight p{margin:0;font-size:14px;color:#5b21b6;}
    .divider{border:none;border-top:1px solid #f0f0f0;margin:24px 0;}
  </style></head><body>
  <div class="wrap">
    ${HEADER}
    <div class="body">
      <h2>You&rsquo;re almost in, ${firstName}! 🎉</h2>
      <p>Thanks for applying to the Inksent signing network. We review every application personally — you&rsquo;ll hear from us within 1&ndash;2 business days.</p>

      <p style="font-weight:600;color:#111;font-size:15px;margin-bottom:20px;">Here&rsquo;s exactly how it works once you&rsquo;re approved:</p>

      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h4>You get a text with the job details</h4>
          <p>When a signing comes up in your area, you&rsquo;ll receive a text from (619) 949-3361 that looks like this:</p>
          <div class="sms-bubble">
            Hi Jane, signing opportunity from Inksent:<br/><br/>
            Type: Refinance<br/>
            Signer: John Smith<br/>
            Date: Monday, Jun 16<br/>
            Time: 10:00 AM<br/>
            Address: 123 Main St, San Diego 92101<br/>
            Your fee: $75<br/><br/>
            Reply YES to accept or tap:<br/>
            <span class="link">inksent.co/notary/accept/...</span><br/><br/>
            This offer expires in 30 min.
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h4>One tap to accept — first one wins</h4>
          <p>We may send the same job to a few agents in your area at the same time. Tap the link or reply YES — first to respond gets the signing. If you can&rsquo;t make it, tap &ldquo;Can&rsquo;t make it&rdquo; so we know to move on quickly.</p>
        </div>
      </div>

      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h4>Show up, execute, confirm</h4>
          <p>Arrive on time, complete the signing professionally, and let us know when you&rsquo;re done. We handle the client — you focus on the table.</p>
        </div>
      </div>

      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h4>Get paid</h4>
          <p>Once the signing is confirmed complete, we process your payment via Zelle, Venmo, or check — whichever you selected on your application.</p>
        </div>
      </div>

      <hr class="divider"/>

      <div class="highlight">
        <p><strong>Save this number:</strong> All job offers come from <strong>(619) 949-3361</strong>. Add it as &ldquo;Inksent Signing&rdquo; in your contacts so you never miss a job.</p>
      </div>

      <p style="font-size:13px;color:#888;">Questions before you hear back from us? Reply to this email or text/call (619) 949-3361.</p>
      <p style="font-size:13px;color:#888;margin:0;">— Clayton<br/>Inksent Signing Services</p>
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

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;margin:0;padding:0;background:#f9f9f9;}
    .wrap{max-width:560px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
    .body{padding:32px;}
    .conf-box{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 24px;margin:24px 0;text-align:center;}
    .conf-label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#7c3aed;font-weight:600;}
    .conf-number{font-size:28px;font-family:monospace;font-weight:800;color:#1f1f1f;margin-top:4px;letter-spacing:1px;}
    .detail-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f3f3f3;font-size:14px;}
    .detail-row:last-child{border-bottom:none;}
    .detail-label{color:#888;}
    .what-next{background:#f8f8f8;border-radius:10px;padding:16px 20px;margin:24px 0;}
    .what-next h4{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;margin:0 0 10px;}
    .next-item{display:flex;gap:10px;margin-bottom:8px;font-size:13px;color:#555;align-items:flex-start;}
    .next-item:last-child{margin-bottom:0;}
    .check{color:#7c3aed;font-weight:700;font-size:14px;}
  </style></head><body>
  <div class="wrap">
    ${HEADER}
    <div class="body">
      <p style="font-size:16px;font-weight:700;color:#111;margin:0 0 6px;">Order confirmed, ${firstName}.</p>
      <p style="font-size:14px;color:#555;margin:0;">We&rsquo;re on it. A signing agent will be confirmed and you&rsquo;ll hear from us shortly.</p>

      <div class="conf-box">
        <div class="conf-label">Confirmation Number</div>
        <div class="conf-number">${order.confirmation_number}</div>
        <div style="font-size:12px;color:#999;margin-top:6px;">Save this for your records</div>
      </div>

      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:600;margin-bottom:8px;">Signing Summary</div>
      <div class="detail-row"><span class="detail-label">Service</span><span style="font-weight:600;">${typeLabel} Signing</span></div>
      <div class="detail-row"><span class="detail-label">Signer / Borrower</span><span>${order.signer_name}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span>${dateStr}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span>${timeStr}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span>${order.property_city}</span></div>
      <div class="detail-row"><span class="detail-label">Fee</span><span style="font-weight:700;color:#5b21b6;">$150.00</span></div>

      <div class="what-next">
        <h4>What happens next</h4>
        <div class="next-item"><span class="check">✓</span><span>We&rsquo;re contacting signing agents in the area right now</span></div>
        <div class="next-item"><span class="check">✓</span><span>You&rsquo;ll receive agent confirmation details once assigned</span></div>
        <div class="next-item"><span class="check">✓</span><span>Invoice will be emailed after the signing is completed</span></div>
      </div>

      <p style="font-size:13px;color:#777;margin:0;">Need to make changes or have questions?<br/>
      Reply to this email, call <a href="tel:+16199493361" style="color:#7c3aed;">(619) 949-3361</a>, or text us anytime.</p>
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

