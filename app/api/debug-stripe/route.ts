import { NextResponse } from 'next/server'
import { hasStripe, createInvoicePaymentLink } from '@/lib/stripe'

// Temporary: verifies the live Stripe key generates a payment link. Delete after.
export async function GET() {
  const url = await createInvoicePaymentLink({
    id: 'test-verify',
    confirmation_number: 'TEST-VERIFY',
    client_fee: 100,
    client_company: 'Verification',
  })
  return NextResponse.json({
    secretKeySet: hasStripe(),
    webhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
    paymentLinkWorks: !!url,
    sampleLinkPrefix: url ? url.slice(0, 30) : null,
  })
}
