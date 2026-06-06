import twilio from 'twilio'

function getClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID ?? 'ACplaceholder', process.env.TWILIO_AUTH_TOKEN ?? 'placeholder')
}

export async function sendSMS(to: string, body: string) {
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

Reply YES to accept or tap: ${acceptUrl}

This offer expires in 30 min.`
}
