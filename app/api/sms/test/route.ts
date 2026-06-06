import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'
import { isAdminAuthed } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { to } = await req.json()

  if (!to) return NextResponse.json({ error: 'Phone number required' }, { status: 400 })

  const missing = []
  if (!process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')) missing.push('TWILIO_ACCOUNT_SID')
  if (!process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN === 'your-auth-token') missing.push('TWILIO_AUTH_TOKEN')
  if (!process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_FROM_NUMBER === '+17605045984') missing.push('TWILIO_FROM_NUMBER (needs your Twilio number, not your cell)')

  if (missing.length > 0) {
    return NextResponse.json({
      error: 'Twilio not configured',
      missing,
      instructions: 'Add these to your .env.local — see /admin/setup for steps',
    }, { status: 400 })
  }

  try {
    await sendSMS(to, `✅ Inksent SMS test successful! Your Twilio integration is working. Ready to dispatch signing agents.`)
    return NextResponse.json({ ok: true, sent_to: to })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
