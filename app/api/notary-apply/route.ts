import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendSMS } from '@/lib/sms'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { sendNotaryApplicationEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  zip_codes: z.string().min(3),
  years_experience: z.string().optional(),
  nna_certified: z.string(),
  nna_number: z.string().optional(),
  commission_state_code: z.string().optional(),
  commission_expiry: z.string().optional(),
  background_checked: z.string(),
  bgc_provider: z.string().optional(),
  bgc_date: z.string().optional(),
  eo_carrier: z.string().optional(),
  eo_expiry: z.string().optional(),
  linkedin_url: z.string().optional(),
  availability_notes: z.string().optional(),
  availability_days: z.array(z.string()).optional(),
  signing_types_comfort: z.array(z.string()).optional(),
  photo_url: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const d = parsed.data
  const zips = d.zip_codes.split(/[\s,]+/).map(z => z.trim()).filter(z => /^\d{5}$/.test(z))

  const availNotes = [
    d.availability_days?.length ? `Available: ${d.availability_days.join(', ')}` : null,
    d.availability_notes || null,
  ].filter(Boolean).join(' — ')

  const supabase = await createClient()
  await supabase.from('notaries').insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    zip_codes: zips,
    nna_certified: d.nna_certified === 'yes',
    nna_number: d.nna_number || null,
    commission_state: d.commission_state_code || 'CA',
    commission_state_code: d.commission_state_code || null,
    commission_expiry: d.commission_expiry || null,
    bgc_provider: d.bgc_provider || null,
    bgc_date: d.bgc_date || null,
    eo_carrier: d.eo_carrier || null,
    eo_expiry: d.eo_expiry || null,
    years_experience: d.years_experience ? parseInt(d.years_experience) : null,
    linkedin_url: d.linkedin_url || null,
    availability_notes: availNotes || null,
    signing_types_comfort: d.signing_types_comfort || [],
    photo_url: d.photo_url || null,
    active: false,
  })

  // Send onboarding email to the applicant
  sendNotaryApplicationEmail({ name: d.name, email: d.email }).catch(console.error)

  if (process.env.ADMIN_PHONE) {
    sendSMS(
      process.env.ADMIN_PHONE,
      `🖊 New notary application: ${d.name} · ${d.phone} · ${d.years_experience}yr exp · NNA: ${d.nna_certified} · ZIPs: ${d.zip_codes} — approve at inksent.co/notaries`
    ).catch(console.error)
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const adminEmail = process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'
    resend.emails.send({
      from: 'Inksent Applications <orders@inksent.co>',
      to: adminEmail,
      subject: `🖊 New notary application: ${d.name} (${d.years_experience || '?'}yr exp)`,
      html: `
        ${d.photo_url ? `<img src="${d.photo_url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:16px" />` : ''}
        <p><strong>Name:</strong> ${d.name}</p>
        <p><strong>Email:</strong> ${d.email}</p>
        <p><strong>Phone:</strong> ${d.phone}</p>
        <p><strong>Experience:</strong> ${d.years_experience || '?'} years</p>
        <p><strong>ZIP codes:</strong> ${d.zip_codes}</p>
        <p><strong>NNA Certified:</strong> ${d.nna_certified}${d.nna_number ? ` (${d.nna_number})` : ''}</p>
        <p><strong>Commission:</strong> ${d.commission_state_code || '?'} · Expires ${d.commission_expiry || '?'}</p>
        <p><strong>Background Check:</strong> ${d.background_checked}${d.bgc_provider ? ` via ${d.bgc_provider}` : ''}${d.bgc_date ? ` on ${d.bgc_date}` : ''}</p>
        <p><strong>E&O:</strong> ${d.eo_carrier || 'None listed'}</p>
        <p><strong>Available:</strong> ${d.availability_days?.join(', ') || 'Not specified'}</p>
        <p><strong>Signing types:</strong> ${d.signing_types_comfort?.join(', ') || 'Not specified'}</p>
        ${d.linkedin_url ? `<p><strong>LinkedIn:</strong> ${d.linkedin_url}</p>` : ''}
        ${d.notes ? `<p><strong>Notes:</strong> ${d.notes}</p>` : ''}
        <p><a href="https://inksent.co/notaries">Review &amp; approve →</a></p>
      `,
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
