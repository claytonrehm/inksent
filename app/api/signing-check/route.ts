import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAuthClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { checkRateLimit } from '@/lib/rate-limit'
import { analyzeSigningPackage, hasSigningCheck } from '@/lib/signing-check'

export const maxDuration = 120 // AI analysis of a full package can take ~30–60s

const MAX_BYTES = 4.5 * 1024 * 1024

// SignCheck is gated, not public: FREE for approved Inksent agents, and available
// to title partners by arrangement (paid). Not open to anonymous use — protects AI
// cost and matches the product model.
export async function POST(req: NextRequest) {
  if (!hasSigningCheck()) {
    return NextResponse.json({ error: 'The signing checker is being set up — please check back shortly or email support@inksent.co.' }, { status: 503 })
  }

  // Must be signed in
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  const email = user?.email
  if (!email) return NextResponse.json({ error: 'Please sign in to use SignCheck.' }, { status: 401 })

  // Authorize: approved Inksent agents (free). Title-company paid access is granted
  // per-partner (no public/self-serve tier yet).
  const supabase = await createClient()
  const { data: notary } = await supabase.from('notaries').select('id, active').ilike('email', email).maybeSingle()
  // Title partners are granted access via a simple allow-list table (created when a
  // partner signs up). If the table doesn't exist yet, this is just null → no access.
  const { data: partner } = await supabase.from('signcheck_partners').select('email').ilike('email', email).maybeSingle()
  const authorized = !!notary?.active || !!partner
  if (!authorized) {
    return NextResponse.json({ error: 'SignCheck is free for approved Inksent agents. Title companies — email support@inksent.co to get your team set up.' }, { status: 403 })
  }

  // Per-user daily cap (cost guard)
  if (!(await checkRateLimit(`signcheck:${email}`, 30, 86_400))) {
    return NextResponse.json({ error: 'You\'ve hit today\'s check limit. Email support@inksent.co to raise it.' }, { status: 429 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Could not read the upload. Please try again.' }, { status: 400 })
  }

  const file = form.get('file')
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

  if (process.env.ADMIN_PHONE) {
    sendSMS(process.env.ADMIN_PHONE, `🔎 ${email} ran SignCheck — ${report.riskLevel} risk, ${report.issues.length} issue(s).`).catch(console.error)
  }

  return NextResponse.json({ ok: true, report })
}
