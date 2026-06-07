import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioRequest } from '@/lib/twilioValidate'

// Twilio calls this when someone calls (619) 949-3361
// Returns TwiML that forwards the call to your cell
export async function POST(req: NextRequest) {
  const body = await req.formData()
  const params: Record<string, string> = {}
  body.forEach((v, k) => { params[k] = String(v) })
  if (!validateTwilioRequest(req.headers.get('x-twilio-signature'), '/api/twilio/voice', params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling Inksent Signing Services. Please hold while we connect you.</Say>
  <Dial callerId="${process.env.TWILIO_FROM_NUMBER}" timeout="30">
    <Number>${process.env.ADMIN_PHONE}</Number>
  </Dial>
  <Say voice="alice">We're sorry, we missed your call. Please leave us a message or visit inksent dot com to place an order online.</Say>
</Response>`

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
