import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'

// Twilio calls this when someone texts (619) 949-3361
// Forwards the message to your cell with sender info
export async function POST(req: NextRequest) {
  const body = await req.formData()
  const from = body.get('From') as string
  const message = body.get('Body') as string

  if (process.env.ADMIN_PHONE) {
    await sendSMS(
      process.env.ADMIN_PHONE,
      `📩 Inksent text from ${from}:\n\n${message}`
    ).catch(console.error)
  }

  // Send auto-reply to the sender
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks for reaching out to Inksent Signing Services! We'll get back to you shortly. To place a signing order visit inksent.co or call (619) 949-3361.</Message>
</Response>`

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
