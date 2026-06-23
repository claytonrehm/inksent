import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstile } from '@/lib/turnstile'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { alertOwner } from '@/lib/alert'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  location: z.string().optional(),
  years_sales: z.string().optional(),
  b2b_experience: z.string().optional(),
  industry_experience: z.string().optional(),
  title_relationships: z.string().optional(),
  linkedin_url: z.string().optional(),
  pitch: z.string().optional(),
  heard_from: z.string().optional(),
  sms_consent: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  // Honeypot — bots fill this hidden field. Silently accept so they don't retry.
  if (body?.company_url) return NextResponse.json({ ok: true })

  const okHuman = await verifyTurnstile(body?.turnstileToken, req.headers.get('x-forwarded-for') ?? undefined)
  if (!okHuman) return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 })

  if (!(await checkRateLimit(`sales-apply:${clientIp(req)}`, 5, 3600))) {
    return NextResponse.json({ error: 'Too many applications from this connection. Please wait or email support@inksent.co.' }, { status: 429 })
  }

  if (body?.commission_ack !== true) {
    return NextResponse.json({ error: 'Please acknowledge the 100% commission, 1099 contractor terms.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  const d = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('sales_rep_applications').insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    location: d.location || null,
    years_sales: d.years_sales || null,
    b2b_experience: d.b2b_experience || null,
    industry_experience: d.industry_experience || null,
    title_relationships: d.title_relationships || null,
    linkedin_url: d.linkedin_url || null,
    pitch: d.pitch || null,
    heard_from: d.heard_from || null,
    sms_consent_at: d.sms_consent ? new Date().toISOString() : null,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'You\'ve already applied with this email — we have you on file!' }, { status: 409 })
    console.error('Sales rep apply insert failed:', error)
    alertOwner(`A sales rep application from ${d.name} FAILED to save — check the sales-apply form.`).catch(() => {})
    return NextResponse.json({ error: 'Could not save your application. Please try again or email support@inksent.co.' }, { status: 500 })
  }

  const esc = (s: unknown) => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const adminEmail = process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'
    resend.emails.send({
      from: 'Inksent Applications <orders@inksent.co>',
      to: adminEmail,
      subject: `💼 New sales rep application: ${d.name}`,
      html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f4f4f5;margin:0;padding:24px;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <div style="background:#5B4FCF;padding:16px 24px;color:#fff;font-weight:700;font-size:15px;">💼 New Sales Rep Application</div>
          <div style="padding:24px;">
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr><td style="color:#888;padding:6px 0;">Name</td><td style="text-align:right;font-weight:600;">${esc(d.name)}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Phone</td><td style="text-align:right;"><a href="tel:${esc(d.phone)}" style="color:#5B4FCF;text-decoration:none;">${esc(d.phone)}</a></td></tr>
              <tr><td style="color:#888;padding:6px 0;">Email</td><td style="text-align:right;">${esc(d.email)}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Location</td><td style="text-align:right;">${esc(d.location) || '—'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Sales experience</td><td style="text-align:right;">${esc(d.years_sales) || '—'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">B2B</td><td style="text-align:right;">${esc(d.b2b_experience) || '—'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Title/escrow/RE</td><td style="text-align:right;">${esc(d.industry_experience) || '—'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Existing relationships</td><td style="text-align:right;">${esc(d.title_relationships) || '—'}</td></tr>
              ${d.linkedin_url ? `<tr><td style="color:#888;padding:6px 0;">LinkedIn/resume</td><td style="text-align:right;"><a href="${esc(d.linkedin_url)}" style="color:#5B4FCF;">link</a></td></tr>` : ''}
              ${d.pitch ? `<tr><td style="color:#888;padding:6px 0;vertical-align:top;">Pitch</td><td style="text-align:right;">${esc(d.pitch)}</td></tr>` : ''}
            </table>
            <a href="https://inksent.co/sales/applicants" style="display:block;text-align:center;background:#5B4FCF;color:#fff;text-decoration:none;font-weight:700;padding:12px;border-radius:8px;margin-top:20px;">Review &amp; Approve →</a>
          </div>
        </div>
      </body></html>`,
    }).catch(console.error)
  }

  if (process.env.ADMIN_PHONE) {
    const { sendSMS } = await import('@/lib/sms')
    sendSMS(process.env.ADMIN_PHONE, `💼 New sales rep application: ${d.name} · ${d.phone}${d.location ? ` · ${d.location}` : ''} — inksent.co/sales/applicants`).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
