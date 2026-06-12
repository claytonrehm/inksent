import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { sendSMS } from '@/lib/sms'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

// Title companies expressing interest in paid SignCheck (team QC). Captures the
// lead so Clayton can follow up + onboard manually — no billing infra yet.
const schema = z.object({
  company: z.string().min(1).max(160),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  volume: z.string().max(60).optional(),
  message: z.string().max(2000).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  if (body.company_website) return NextResponse.json({ ok: true }) // honeypot
  if (!(await checkRateLimit(`scinterest:${clientIp(req)}`, 6, 3600))) {
    return NextResponse.json({ error: 'Too many requests. Please email support@inksent.co.' }, { status: 429 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Please add your company, name, and a valid email.' }, { status: 400 })
  const d = parsed.data
  const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    resend.emails.send({
      from: 'Inksent SignCheck <orders@inksent.co>',
      to: process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com',
      replyTo: d.email,
      subject: `💼 SignCheck for team: ${d.company}`,
      html: `<p><strong>${esc(d.company)}</strong> wants SignCheck for their team.</p>
        <p>${esc(d.name)} · <a href="mailto:${esc(d.email)}">${esc(d.email)}</a>${d.volume ? ` · ~${esc(d.volume)} signings/mo` : ''}</p>
        ${d.message ? `<div style="background:#f8f8f8;border-radius:8px;padding:12px 14px;white-space:pre-wrap;">${esc(d.message)}</div>` : ''}
        <p>Follow up, set up payment, then add their email to <code>signcheck_partners</code> + turn on the Anthropic key.</p>`,
    }).catch(console.error)
  }
  if (process.env.ADMIN_PHONE) {
    sendSMS(process.env.ADMIN_PHONE, `💼 SignCheck team interest: ${d.company} — ${d.name} (${d.email}).`).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
