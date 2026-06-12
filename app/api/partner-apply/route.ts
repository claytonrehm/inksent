import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { Resend } from 'resend'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

const schema = z.object({
  company: z.string().min(2),
  contact_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.string().optional(),
  monthly_volume: z.string().optional(),
  billing_preference: z.string().optional(),
  message: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body?.company_url) return NextResponse.json({ ok: true }) // honeypot
  if (!(await checkRateLimit(`partner:${clientIp(req)}`, 5, 3600))) {
    return NextResponse.json({ error: 'Too many submissions — please email us directly.' }, { status: 429 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Please fill in the required fields.' }, { status: 400 })
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('partner_applications').insert({
    company: d.company, contact_name: d.contact_name, email: d.email, phone: d.phone || null,
    role: d.role || null, monthly_volume: d.monthly_volume || null,
    billing_preference: d.billing_preference || null, message: d.message || null,
  })
  if (error) return NextResponse.json({ error: 'Could not submit — please try again.' }, { status: 500 })

  // Alert admin — a partner lead is high value, surface it immediately.
  if (process.env.ADMIN_PHONE) {
    sendSMS(process.env.ADMIN_PHONE, `🏢 New title partner inquiry: ${d.company} (${d.contact_name})${d.monthly_volume ? ` · ~${d.monthly_volume}/mo` : ''} · ${d.email}`).catch(() => {})
  }
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const esc = (s: unknown) => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    resend.emails.send({
      from: 'Inksent Partners <orders@inksent.co>',
      to: process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com',
      subject: `🏢 New title partner inquiry: ${esc(d.company)}`,
      html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="font-size:17px;">New partner inquiry</h2>
        <p><strong>${esc(d.company)}</strong><br/>${esc(d.contact_name)}${d.role ? ` · ${esc(d.role)}` : ''}<br/>
        <a href="mailto:${esc(d.email)}">${esc(d.email)}</a>${d.phone ? ` · ${esc(d.phone)}` : ''}</p>
        <p>Volume: ${esc(d.monthly_volume || '—')}<br/>Billing: ${esc(d.billing_preference || '—')}</p>
        ${d.message ? `<p style="background:#f5f3ff;border-radius:8px;padding:12px;">${esc(d.message)}</p>` : ''}
      </div>`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
