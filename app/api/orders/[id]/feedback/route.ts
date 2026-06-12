import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

// One-click client satisfaction from the completion email. GET so an email link
// click works directly. Records 'up'/'down' and shows a thank-you page.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const r = req.nextUrl.searchParams.get('r')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  if (r !== 'up' && r !== 'down') {
    return NextResponse.redirect(`${baseUrl}/feedback-thanks`)
  }

  const supabase = await createClient()
  const { data: order } = await supabase.from('orders').select('client_company, confirmation_number, client_satisfaction').eq('id', id).single()
  await supabase.from('orders').update({ client_satisfaction: r, client_feedback_at: new Date().toISOString() }).eq('id', id)
    .then(({ error }) => { if (error) console.warn('feedback save skipped:', error.message) })

  // A thumbs-down is a service-recovery moment — alert the admin to reach out fast.
  if (r === 'down' && process.env.ADMIN_PHONE && order) {
    sendSMS(process.env.ADMIN_PHONE, `⚠️ ${order.client_company} left a 👎 on ${order.confirmation_number}. Reach out to make it right.`).catch(() => {})
  }

  // A thumbs-UP is the perfect moment to ask for a Google review (free local-SEO
  // gold). Send the happy client straight to the review page if it's configured.
  // Set GOOGLE_REVIEW_URL once your Business Profile is verified (its "write a
  // review" short link); until then they just see the thank-you page.
  if (r === 'up' && process.env.GOOGLE_REVIEW_URL) {
    return NextResponse.redirect(process.env.GOOGLE_REVIEW_URL)
  }

  return NextResponse.redirect(`${baseUrl}/feedback-thanks?r=${r}`)
}
