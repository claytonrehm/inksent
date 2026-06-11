import type { SupabaseClient } from '@supabase/supabase-js'
import { credentialActionItems } from '@/lib/credentials'
import { sendSMS } from '@/lib/sms'
import { sendCredentialRenewalEmail } from '@/lib/email'

// Email + text every active notary who is missing or expiring on ANY of the four
// credentials, with a one-tap link to supply it. Shared by the daily cron
// (throttled) and the admin "send now" button (force = ignore throttle).
export async function chaseCredentials(
  supabase: SupabaseClient,
  opts: { baseUrl: string; throttleMs: number; adminPhone?: string },
): Promise<number> {
  const cutoff = new Date(Date.now() - opts.throttleMs).toISOString()
  const { data: bench } = await supabase
    .from('notaries')
    .select('id, name, phone, email, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry, cred_reminder_at')
    .eq('active', true)

  let sent = 0
  for (const n of bench ?? []) {
    const items = credentialActionItems(n)
    if (items.length === 0) continue
    if (opts.throttleMs > 0 && n.cred_reminder_at && n.cred_reminder_at >= cutoff) continue

    const updateUrl = `${opts.baseUrl}/onboard/${n.id}?update=1`
    const firstName = (n.name ?? '').split(' ')[0]
    const labels = items.map((i) => i.label).join(' & ')

    if (n.phone) {
      await sendSMS(
        n.phone,
        `Hi ${firstName}, quick note from Inksent — we need your current ${labels} on file to keep you eligible for signings. Takes ~2 min: ${updateUrl} — Clayton`,
      ).catch(() => {})
    }
    if (n.email) {
      await sendCredentialRenewalEmail({
        name: n.name, email: n.email,
        items: items.map((i) => ({ label: i.label, message: i.message })),
        updateUrl,
      }).catch(() => {})
    }
    const expired = items.filter((i) => i.status === 'expired')
    if (expired.length && opts.adminPhone) {
      await sendSMS(opts.adminPhone, `⚠️ ${n.name} has EXPIRED ${expired.map((i) => i.short).join(', ')} — renewal requested.`).catch(() => {})
    }
    await supabase.from('notaries').update({ cred_reminder_at: new Date().toISOString() }).eq('id', n.id)
      .then(({ error }) => { if (error) console.warn('cred_reminder_at stamp skipped:', error.message) })
    sent++
  }
  return sent
}
