import { sendSMS } from '@/lib/sms'

// Alert the owner about a high-value failure that would otherwise vanish into the
// Vercel logs a solo owner never reads — e.g. a failed order insert (a lost paying
// customer) or a failed application (a lost notary). Best-effort; never throws.
export async function alertOwner(message: string): Promise<void> {
  if (!process.env.ADMIN_PHONE) return
  await sendSMS(process.env.ADMIN_PHONE, `🚨 ${message}`).catch(() => {})
}
