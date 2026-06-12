import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { sendSMS } from '@/lib/sms'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

// Public issue/support reports from title companies, notaries, or visitors.
// Emails + texts the admin so nothing slips through. Honeypot + rate-limited.
const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.string().max(60).optional(),
  message: z.string().min(5).max(4000),
  pageUrl: z.string().max(400).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  // Honeypot — bots fill hidden fields
  if (body.company_website) return NextResponse.json({ ok: true })

  if (!(await checkRateLimit(`support:${clientIp(req)}`, 6, 3600))) {
    return NextResponse.json({ error: 'Too many reports from this connection. Please email support@inksent.co directly.' }, { status: 429 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please add your name, a valid email, and a short description.' }, { status: 400 })
  }
  const d = parsed.data
  const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const adminEmail = process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'
    await resend.emails.send({
      from: 'Inksent Support <orders@inksent.co>',
      to: adminEmail,
      replyTo: d.email,
      subject: `🛠 Issue reported: ${d.name}${d.role ? ` (${d.role})` : ''}`,
      html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f4f4f5;margin:0;padding:24px;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <div style="background:#5B4FCF;padding:16px 24px;color:#fff;font-weight:700;font-size:15px;">🛠 New Issue / Support Report</div>
          <div style="padding:24px;font-size:14px;line-height:1.6;">
            <p style="margin:0 0 4px;"><strong>${esc(d.name)}</strong>${d.role ? ` · ${esc(d.role)}` : ''}</p>
            <p style="margin:0 0 16px;"><a href="mailto:${esc(d.email)}" style="color:#5B4FCF;">${esc(d.email)}</a></p>
            <div style="background:#f8f8f8;border-radius:8px;padding:14px 16px;white-space:pre-wrap;">${esc(d.message)}</div>
            ${d.pageUrl ? `<p style="margin:14px 0 0;color:#888;font-size:12px;">Reported from: ${esc(d.pageUrl)}</p>` : ''}
          </div>
        </div>
      </body></html>`,
    }).catch(console.error)
  }

  if (process.env.ADMIN_PHONE) {
    sendSMS(process.env.ADMIN_PHONE, `🛠 Issue reported by ${d.name} (${d.email}): ${d.message.slice(0, 130)}`).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
