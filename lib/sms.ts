import twilio from 'twilio'

function getClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID ?? 'ACplaceholder', process.env.TWILIO_AUTH_TOKEN ?? 'placeholder')
}

export async function sendSMS(to: string, body: string) {
  // ── Global SMS kill-switch ──────────────────────────────────────────────
  // SMS stays completely OFF — no Twilio API call is made, so ZERO Twilio cost
  // is incurred — until SMS_ENABLED is explicitly set to 'true' in the env.
  // This keeps every SMS code path wired and the A2P campaign registered while
  // we wait for paying title-company volume. Go live = set SMS_ENABLED=true and
  // redeploy; nothing else changes.
  //
  // We THROW (rather than silently succeed) so callers that count a notary as
  // "reached if any channel succeeds" correctly treat SMS as unavailable and
  // fall back to email. Every caller already tolerates a rejected sendSMS
  // (real Twilio calls can reject too), so this is safe.
  if (process.env.SMS_ENABLED !== 'true') {
    throw new Error('SMS disabled (set SMS_ENABLED=true to send)')
  }

  // A2P-ready: if a Messaging Service SID is set (the usual A2P setup), send
  // through it; otherwise fall back to the raw number. Lets you go live the
  // moment A2P clears by just adding TWILIO_MESSAGING_SERVICE_SID — no code change.
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  return getClient().messages.create({
    to,
    body,
    ...(messagingServiceSid ? { messagingServiceSid } : { from: process.env.TWILIO_FROM_NUMBER! }),
  })
}

export function buildDispatchMessage({
  notaryName,
  signerName,
  signingType,
  signingDate,
  signingTime,
  propertyAddress,
  propertyCity,
  propertyZip,
  fee,
  acceptUrl,
}: {
  notaryName: string
  signerName: string
  signingType: string
  signingDate: string
  signingTime: string
  propertyAddress: string
  propertyCity: string
  propertyZip: string
  fee: number
  acceptUrl: string
}) {
  const type = signingType.replace(/_/g, ' ')
  const h = parseInt(signingTime.split(':')[0])
  const m = signingTime.split(':')[1]
  const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`

  return `Hi ${notaryName}, signing opportunity from Inksent:

Type: ${type}
Signer: ${signerName}
Date: ${signingDate}
Time: ${timeStr}
Address: ${propertyAddress}, ${propertyCity} ${propertyZip}
Your pay: $${(fee / 100).toFixed(0)}

Tap to accept (first to respond wins): ${acceptUrl}

Title companies count on us confirming within ~30 min, so a quick tap keeps us reliable. Expires in 30 min.`
}
