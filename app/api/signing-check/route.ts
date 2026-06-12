import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sendSMS } from '@/lib/sms'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { analyzeSigningPackage, hasSigningCheck } from '@/lib/signing-check'

export const maxDuration = 120 // AI analysis of a full package can take ~30–60s

const MAX_BYTES = 4.5 * 1024 * 1024

export async function POST(req: NextRequest) {
  if (!hasSigningCheck()) {
    return NextResponse.json({ error: 'The signing checker is being set up — please check back shortly or email support@inksent.co.' }, { status: 503 })
  }

  // Lead-gen + abuse guard: a few free checks per IP per day.
  if (!(await checkRateLimit(`signcheck:${clientIp(req)}`, 4, 86_400))) {
    return NextResponse.json({ error: 'You\'ve hit today\'s free-check limit. Email support@inksent.co to keep going.' }, { status: 429 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Could not read the upload. Please try again.' }, { status: 400 })
  }

  if (form.get('company_website')) return NextResponse.json({ ok: true }) // honeypot

  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim()
  const file = form.get('file')

  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Please add your name and a valid email.' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Please attach the signing package as a PDF.' }, { status: 400 })
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Please upload a PDF file.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That file is over 4.5MB. For very large packages, split it or email support@inksent.co.' }, { status: 413 })
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  let report
  try {
    report = await analyzeSigningPackage(base64)
  } catch (e) {
    console.error('signing-check failed:', e)
    return NextResponse.json({ error: 'We couldn\'t analyze that package. It may be scanned/image-only or too large. Try a text-based PDF.' }, { status: 502 })
  }

  // Capture the lead (notary/title prospect) — do not store the document.
  const adminEmail = process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    resend.emails.send({
      from: 'Inksent SignCheck <orders@inksent.co>',
      to: adminEmail,
      replyTo: email,
      subject: `🔎 SignCheck used: ${name} (${report.riskLevel} risk)`,
      html: `<p><strong>${name}</strong> · <a href="mailto:${email}">${email}</a> ran a signing-package check.</p>
        <p>Risk: <strong>${report.riskLevel}</strong> · ${report.totals.signatures} signatures · ${report.totals.notarizations} notarizations · ${report.issues.length} issue(s) flagged.</p>
        <p>A warm lead — they're a notary or title company doing live signings.</p>`,
    }).catch(console.error)
  }
  if (process.env.ADMIN_PHONE) {
    sendSMS(process.env.ADMIN_PHONE, `🔎 SignCheck lead: ${name} (${email}) — ${report.riskLevel} risk, ${report.issues.length} issues.`).catch(console.error)
  }

  return NextResponse.json({ ok: true, report })
}
