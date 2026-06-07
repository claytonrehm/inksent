import twilio from 'twilio'

// Verify an inbound webhook actually came from Twilio (X-Twilio-Signature),
// so randoms can't POST fake texts/calls to our endpoints. Fails closed.
export function validateTwilioRequest(
  signature: string | null,
  path: string,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken || authToken === 'placeholder') return false
  if (!signature) return false
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://inksent.co'
  try {
    return twilio.validateRequest(authToken, signature, `${base}${path}`, params)
  } catch {
    return false
  }
}
