import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendSMS } from '@/lib/sms'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { sendNotaryApplicationEmail } from '@/lib/email'
import { lookupZip } from '@/lib/coverage'
import { SIGNINGS_LABEL } from '@/lib/notary'
import { verifyTurnstile } from '@/lib/turnstile'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  base_zip: z.string().regex(/^\d{5}$/),
  coverage_radius: z.string().optional(),
  years_experience: z.string().optional(),
  signings_completed: z.string().optional(),
  nna_certified: z.string().optional(),
  background_checked: z.string().optional(),
  photo_url: z.string().optional(),
  notes: z.string().optional(),
  sms_consent: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Bot protection (no-op until Turnstile keys are configured)
  const okHuman = await verifyTurnstile(body?.turnstileToken, req.headers.get('x-forwarded-for') ?? undefined)
  if (!okHuman) return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 })

  // Must accept the Independent Contractor Agreement
  if (body?.ic_agreement !== true) {
    return NextResponse.json({ error: 'You must accept the Independent Contractor Agreement to apply.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    console.error('Notary apply validation failed:', parsed.error.flatten())
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 })
  }

  const d = parsed.data
  const base = lookupZip(d.base_zip)
  if (!base) {
    return NextResponse.json({ error: 'That ZIP code was not recognized. Please double-check it.' }, { status: 400 })
  }
  const radius = d.coverage_radius ? parseInt(d.coverage_radius) : 25

  const supabase = await createClient()
  const { error: insertError } = await supabase.from('notaries').insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    base_zip: d.base_zip,
    coverage_radius: radius,
    zip_codes: [d.base_zip],
    nna_certified: d.nna_certified === 'yes',
    background_checked: d.background_checked === 'yes',
    signings_completed: d.signings_completed || null,
    years_experience: d.years_experience ? parseInt(d.years_experience) : null,
    notes: d.notes || null,
    photo_url: d.photo_url || null,
    sms_consent_at: d.sms_consent ? new Date().toISOString() : null,
    active: false,
  })

  if (insertError) {
    // Most likely a duplicate email (unique constraint)
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'An application with this email already exists. We already have you on file!' }, { status: 409 })
    }
    console.error('Notary insert failed:', insertError)
    return NextResponse.json({ error: 'Could not save application' }, { status: 500 })
  }

  // Best-effort: save real-estate competence fields. Done as a follow-up update
  // so the application never fails if the migration hasn't been run yet.
  const reExp = body?.re_experience
  const signingTypes = Array.isArray(body?.signing_types) ? body.signing_types : []
  if (reExp || signingTypes.length) {
    await supabase.from('notaries')
      .update({ re_experience: reExp || null, signing_types: signingTypes })
      .eq('email', d.email)
      .then(({ error }) => { if (error) console.warn('re_experience save skipped:', error.message) })
  }

  // Send onboarding email to the applicant
  sendNotaryApplicationEmail({ name: d.name, email: d.email }).catch(console.error)

  // Confirmation text to the applicant — also prompts them to save our number
  // (will deliver once Twilio A2P is approved)
  sendSMS(
    d.phone,
    `Hi ${d.name.split(' ')[0]}, thanks for applying to Inksent! We got your application and will review it shortly. Please save this number as "Inksent Signing" — it's how we'll text you signing jobs once you're approved. — Clayton`
  ).catch(console.error)

  if (process.env.ADMIN_PHONE) {
    sendSMS(
      process.env.ADMIN_PHONE,
      `🖊 New notary application: ${d.name} · ${d.phone} · ${base.city}, ${base.state} (${radius}mi) — approve at inksent.co/notaries`
    ).catch(console.error)
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const adminEmail = process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'
    resend.emails.send({
      from: 'Inksent Applications <orders@inksent.co>',
      to: adminEmail,
      subject: `🖊 New notary application: ${d.name}${d.years_experience ? ` (${d.years_experience}yr exp)` : ''}`,
      html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f4f4f5;margin:0;padding:24px;">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <div style="background:#5B4FCF;padding:16px 24px;color:#fff;font-weight:700;font-size:15px;">🖊 New Notary Application</div>
          <div style="padding:24px;">
            ${d.photo_url ? `<img src="${d.photo_url}" alt="${d.name}" style="width:96px;height:96px;border-radius:12px;object-fit:cover;border:1px solid #eee;margin-bottom:16px;" />` : ''}
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr><td style="color:#888;padding:6px 0;">Name</td><td style="text-align:right;font-weight:600;">${d.name}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Phone</td><td style="text-align:right;"><a href="tel:${d.phone}" style="color:#5B4FCF;text-decoration:none;">${d.phone}</a></td></tr>
              <tr><td style="color:#888;padding:6px 0;">Email</td><td style="text-align:right;">${d.email}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Experience</td><td style="text-align:right;">${d.years_experience ? `${d.years_experience} years` : 'Not given'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Signings done</td><td style="text-align:right;">${SIGNINGS_LABEL[d.signings_completed ?? ''] || 'Not given'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">NNA Certified</td><td style="text-align:right;">${d.nna_certified === 'yes' ? 'Yes' : 'No'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;">Background check</td><td style="text-align:right;">${d.background_checked === 'yes' ? 'Yes' : 'No'}</td></tr>
              <tr><td style="color:#888;padding:6px 0;vertical-align:top;">Coverage</td><td style="text-align:right;">${base.city}, ${base.state} ${d.base_zip}<br/>within ${radius} miles</td></tr>
              ${d.notes ? `<tr><td style="color:#888;padding:6px 0;vertical-align:top;">Notes</td><td style="text-align:right;">${d.notes}</td></tr>` : ''}
            </table>
            <a href="https://inksent.co/notaries" style="display:block;text-align:center;background:#5B4FCF;color:#fff;text-decoration:none;font-weight:700;padding:12px;border-radius:8px;margin-top:20px;">Review &amp; Approve →</a>
          </div>
        </div>
      </body></html>`,
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
