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

// ─── Notary Approved (with onboarding link) ───────────────────────────────────

export async function sendNotaryApprovedEmail(data: { name: string; email: string; onboardUrl: string }) {
  const firstName = data.name.split(' ')[0]
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <div style="display:inline-block;background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">&#10003; You're Approved</div>
      <p style="font-size:18px;font-weight:700;color:#111111;margin:0 0 8px;">Welcome to the team, ${firstName}! 🎉</p>
      <p style="font-size:14px;color:#555555;line-height:1.6;margin:0 0 8px;">You&rsquo;re now part of the Inksent signing network. One quick step before your first job — we need a few details to verify your credentials and set up your payment.</p>
      <p style="font-size:14px;color:#555555;line-height:1.6;margin:0 0 24px;">It takes about 3 minutes:</p>
      <a href="${data.onboardUrl}" style="display:block;text-align:center;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;padding:14px;border-radius:10px;font-size:15px;">Complete My Profile →</a>
      <p style="font-size:13px;color:#888888;line-height:1.6;margin:20px 0 0;">Once that&rsquo;s done, you&rsquo;ll start getting signing job texts in your area. Save <strong>(619) 949-3361</strong> as &ldquo;Inksent Signing&rdquo; so you never miss one.</p>
      <p style="font-size:13px;color:#888888;margin:12px 0 0;">— Clayton<br/>Inksent Signing Services</p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Clayton at Inksent <orders@inksent.co>',
    to: data.email,
    subject: `You're approved — one quick step to finish, ${firstName}`,
    html,
  })
}

// ─── Documents Ready for Notary ───────────────────────────────────────────────

export async function sendNotaryDocsEmail(data: { notaryName: string; notaryEmail: string; signerName: string; docsUrl: string; updated?: boolean }) {
  const firstName = data.notaryName.split(' ')[0]
  const badge = data.updated ? '⚠️ Updated Documents' : '📄 Documents Ready'
  const badgeColors = data.updated ? 'background:#fef3c7;color:#92400e;' : 'background:#ede9fe;color:#5b21b6;'
  const headline = data.updated ? `Updated documents for ${firstName}` : `Your signing docs are ready, ${firstName}.`
  const body = data.updated
    ? `The document package for your <strong>${data.signerName}</strong> signing has been <strong>updated</strong>. Please <strong>discard the previous version</strong> and print only this new package — the old files have been removed.`
    : `The document package for your <strong>${data.signerName}</strong> signing is available to download. Please print everything and bring it to the appointment.`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <div style="display:inline-block;${badgeColors}font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">${badge}</div>
      <p style="font-size:16px;font-weight:700;color:#111111;margin:0 0 6px;">${headline}</p>
      <p style="font-size:14px;color:#555555;line-height:1.6;margin:0 0 22px;">${body}</p>
      <a href="${data.docsUrl}" style="display:block;text-align:center;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;padding:14px;border-radius:10px;font-size:15px;">View &amp; Download ${data.updated ? 'Updated ' : ''}Documents →</a>
      <p style="font-size:13px;color:#888888;line-height:1.6;margin:20px 0 0;">This is a private link for your assigned signing. Questions? Call or text (619) 949-3361.</p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Inksent <orders@inksent.co>',
    to: data.notaryEmail,
    subject: data.updated ? `⚠️ Updated documents — ${data.signerName} signing` : `Documents ready — ${data.signerName} signing`,
    html,
  })
}

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
  completeUrl?: string
  dashboardUrl?: string
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
          <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#111111;">Your Pay</td>
          <td style="padding:14px 16px;font-size:22px;font-weight:800;color:#5b21b6;text-align:right;">$${(data.fee / 100).toFixed(0)}</td>
        </tr>
      </table>

      ${data.specialInstructions ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#92400e;margin-top:16px;line-height:1.5;"><strong>Special Instructions:</strong> ${data.specialInstructions}</div>` : ''}

      ${data.completeUrl ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:20px;text-align:center;">
        <p style="font-size:13px;color:#166534;margin:0 0 12px;font-weight:600;">When the signing is done, tap below to finish up &amp; get paid:</p>
        <a href="${data.completeUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 22px;border-radius:8px;font-size:14px;">Mark Signing Complete →</a>
      </div>` : ''}

      <p style="font-size:13px;color:#555555;margin-top:20px;line-height:1.6;">
        Please arrive a few minutes early and bring all required supplies.
      </p>
      ${data.dashboardUrl ? `<p style="font-size:13px;color:#777777;margin:16px 0 0">See all your signings &amp; earnings on your <a href="${data.dashboardUrl}" style="color:#7c3aed;text-decoration:none;font-weight:600;">dashboard</a>.</p>` : ''}
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

// ─── Signing Complete — warm congratulations to the title company ─────────────
export async function sendSigningCompleteEmail(data: {
  clientName: string
  clientEmail: string
  notaryName: string
  signerName: string
  signingType: string
  confirmationNumber: string
  hasScanBacks?: boolean
}) {
  const firstName = data.clientName?.split(' ')[0] || 'there'
  const typeLabel = data.signingType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;text-align:center;">
      <div style="font-size:40px;line-height:1;margin-bottom:8px;">🎉</div>
      <p style="font-size:18px;font-weight:800;color:#111111;margin:0 0 6px;">Signing complete!</p>
      <p style="font-size:14px;color:#555555;margin:0;line-height:1.6;">Nice work, ${firstName} — ${data.signerName}&rsquo;s ${typeLabel.toLowerCase()} signing was executed by <strong>${data.notaryName}</strong> and is officially done.</p>
    </div>
    <div style="padding:0 32px 28px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:8px 20px;margin:0 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow('Signer', data.signerName, { bold: true })}
          ${detailRow('Service', `${typeLabel} Signing`)}
          ${detailRow('Signing agent', data.notaryName)}
          ${detailRow('Confirmation #', `<span style="font-family:monospace;">${data.confirmationNumber}</span>`, { last: true })}
        </table>
      </div>
      <p style="font-size:14px;color:#555555;margin:0 0 4px;line-height:1.6;">${data.hasScanBacks ? 'Scan-backs are uploaded and your invoice is on its way.' : 'Your invoice is on its way separately.'}</p>
      <p style="font-size:13px;color:#777777;margin:14px 0 0;line-height:1.6;">Thank you for trusting Inksent with your closing. We&rsquo;d love to handle the next one — just reply here or call <a href="tel:+16199493361" style="color:#7c3aed;text-decoration:none;">(619) 949-3361</a>.</p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Clayton at Inksent <orders@inksent.co>',
    to: data.clientEmail,
    subject: `🎉 Signing complete — ${data.signerName}'s ${typeLabel}`,
    html,
  })
}

// ─── Notary Application — not moving forward (kept on file) ───────────────────
export async function sendNotaryDeniedEmail(data: { name: string; email: string }) {
  const firstName = data.name.split(' ')[0]
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <p style="font-size:16px;font-weight:700;color:#111111;margin:0 0 12px;">Thank you for applying, ${firstName}.</p>
      <p style="font-size:14px;color:#555555;margin:0 0 14px;line-height:1.7;">
        We truly appreciate your interest in joining the Inksent signing network. For now, we&rsquo;ve decided to move forward with other applicants in your area.
      </p>
      <p style="font-size:14px;color:#555555;margin:0 0 14px;line-height:1.7;">
        Please don&rsquo;t take this as a no for good — we&rsquo;re a growing company and we expand our network regularly as demand increases. <strong>We&rsquo;ll keep your application on file</strong> and reach out the moment we open more spots in your area.
      </p>
      <p style="font-size:14px;color:#555555;margin:0;line-height:1.7;">
        Thank you again, and we hope to work together soon.
      </p>
      <p style="font-size:14px;color:#555555;margin:18px 0 0;line-height:1.6;">— The Inksent Team</p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Clayton at Inksent <orders@inksent.co>',
    to: data.email,
    subject: 'Your Inksent application',
    html,
  })
}

// ─── Job Offer to a Notary (email channel — works with or without SMS) ────────
export async function sendNotaryJobOfferEmail(data: {
  notaryName: string
  notaryEmail: string
  signerName: string
  signingType: string
  signingDate: string
  signingTime: string
  propertyAddress: string
  propertyCity: string
  propertyZip: string
  fee: number
  acceptUrl: string
}) {
  const typeLabel = data.signingType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const feeStr = `$${(data.fee / 100).toFixed(0)}`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>${META}</head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111111;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${HEADER}
    <div style="padding:32px;">
      <p style="font-size:16px;font-weight:700;color:#111111;margin:0 0 4px;">New signing opportunity — ${feeStr}</p>
      <p style="font-size:14px;color:#555555;margin:0 0 20px;line-height:1.6;">Hi ${data.notaryName}, a signing in your area just opened up. First to accept gets it.</p>

      <div style="background:#f8f8f8;border-radius:10px;padding:8px 20px;margin:0 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${detailRow('Your pay', `<span style="color:#16a34a;font-weight:700;">${feeStr}</span>`, { bold: true })}
          ${detailRow('Type', `${typeLabel} Signing`)}
          ${detailRow('Signer', data.signerName)}
          ${detailRow('Date', data.signingDate, { bold: true })}
          ${detailRow('Time', data.signingTime, { bold: true })}
          ${detailRow('Location', `${data.propertyAddress}, ${data.propertyCity} ${data.propertyZip}`, { last: true })}
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center">
        <a href="${data.acceptUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">Accept this signing →</a>
      </td></tr></table>

      <p style="font-size:13px;color:#999999;margin:18px 0 0;text-align:center;">⏱ First to accept wins — this offer may expire soon.</p>
    </div>
    ${FOOTER}
  </div></body></html>`

  return getResend().emails.send({
    from: 'Inksent Dispatch <orders@inksent.co>',
    to: data.notaryEmail,
    subject: `New signing — ${feeStr} · ${typeLabel} · ${data.signingDate}`,
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
          Your pay: $90<br/><br/>
          Reply YES to accept or tap:<br/>
          <span style="color:#7c3aed;font-weight:600;text-decoration:underline;">inksent.co/accept/&hellip;</span><br/><br/>
          This offer expires in 30 min.
        </div>`)}

      ${step(2, 'One tap to accept — first one wins', `We may send the same job to a few agents in your area at the same time. Tap the link or reply YES — first to respond gets the signing. If you can&rsquo;t make it, tap &ldquo;Can&rsquo;t make it&rdquo; so we know to move on quickly.`)}

      ${step(3, 'Show up, execute, confirm', `Arrive on time, complete the signing professionally, and let us know when you&rsquo;re done. We handle the client — you focus on the table.`)}

      ${step(4, 'Get paid', `Once the signing is confirmed complete, we send your payment by secure direct deposit — automatically, once the client pays.`)}

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
  id?: string
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const uploadUrl = order.id ? `${baseUrl}/upload/${order.id}` : null

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

      ${order.id ? `<a href="${baseUrl}/track/${order.id}" style="display:block;text-align:center;background:#111111;color:#ffffff;text-decoration:none;font-weight:700;padding:13px;border-radius:10px;margin:0 0 24px;font-size:14px;">📍 Track this signing live →</a>` : ''}

      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888888;font-weight:600;margin-bottom:4px;">Signing Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${detailRow('Service', `${typeLabel} Signing`, { bold: true })}
        ${detailRow('Signer / Borrower', order.signer_name)}
        ${detailRow('Date', dateStr)}
        ${detailRow('Time', timeStr)}
        ${detailRow('Location', order.property_city)}
        ${detailRow('Fee', '<span style="font-weight:700;color:#5b21b6;">$185.00</span>', { last: true })}
      </table>

      ${uploadUrl ? `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:18px 20px;margin:24px 0;">
        <div style="font-size:14px;font-weight:700;color:#5b21b6;margin-bottom:4px;">📄 Send us the documents</div>
        <div style="font-size:13px;color:#555;line-height:1.5;margin-bottom:14px;">Upload the signing package when it&rsquo;s ready — your assigned notary gets it automatically, even if coverage changes.</div>
        <a href="${uploadUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:8px;font-size:14px;">Upload Documents →</a>
      </div>` : ''}

      <div style="background:#f8f8f8;border-radius:10px;padding:16px 20px;margin:24px 0;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888888;font-weight:600;margin-bottom:10px;">What happens next</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${nextItem('<strong>Now:</strong> we&rsquo;re contacting available signing agents in the area')}
          ${nextItem('<strong>Within ~30 min:</strong> you&rsquo;ll get an email with your assigned agent&rsquo;s name (we&rsquo;ll call you if coverage is tight)')}
          ${nextItem('<strong>Before the signing:</strong> upload your documents anytime — we route them to the agent automatically')}
          ${nextItem('<strong>After completion:</strong> your $185 invoice is emailed the same day (pay by card, check, or ACH)')}
        </table>
      </div>

      <p style="font-size:13px;color:#555555;margin:0 0 18px;line-height:1.6;">Track status, view invoices, or place another order anytime in your <a href="${baseUrl}/portal" style="color:#7c3aed;text-decoration:none;font-weight:600;">client portal</a>.</p>

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

