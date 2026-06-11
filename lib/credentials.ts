// Central credential-lifecycle model for the notary bench.
// Covers all four credentials a signing agent must keep current: NNA certification,
// background check, E&O insurance, and notary commission. One source of truth for
// the admin status badges, the dispatch guard, and the automated renewal reminders.

export type CredStatus = 'valid' | 'expiring' | 'expired' | 'missing' | 'untracked'

export const EXPIRING_DAYS = 30
// Signing-agent background checks are renewed annually (NNA standard). We derive
// the expiry from the date the check was completed.
export const BGC_VALID_MONTHS = 12

export interface NotaryCreds {
  nna_certified?: boolean | null
  nna_cert_expiry?: string | null
  background_checked?: boolean | null
  bgc_date?: string | null
  eo_carrier?: string | null
  eo_expiry?: string | null
  commission_expiry?: string | null
}

export interface CredItem {
  key: 'nna' | 'bgc' | 'eo' | 'commission'
  label: string
  short: string
  status: CredStatus
  expiry: string | null
  message: string
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(`${dateStr}T00:00:00`)
  return Math.floor((d.getTime() - today.getTime()) / 86_400_000)
}

function statusFromExpiry(expiry: string | null | undefined): CredStatus {
  if (!expiry) return 'untracked'
  const d = daysUntil(expiry)
  if (d < 0) return 'expired'
  if (d <= EXPIRING_DAYS) return 'expiring'
  return 'valid'
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export function bgcExpiry(n: NotaryCreds): string | null {
  return n.bgc_date ? addMonths(n.bgc_date, BGC_VALID_MONTHS) : null
}

export function credentialItems(n: NotaryCreds): CredItem[] {
  // NNA certification — certified flag + an optional renewal date. (The NNA has no
  // public verification API, so we monitor the renewal date we record, not a live
  // lookup; admin confirms via the NNA directory at approval time.)
  const nnaExpiry = n.nna_cert_expiry ?? null
  const nnaStatus: CredStatus = !n.nna_certified ? 'missing' : (nnaExpiry ? statusFromExpiry(nnaExpiry) : 'untracked')
  const nna: CredItem = {
    key: 'nna', label: 'NNA Certification', short: 'NNA', status: nnaStatus, expiry: nnaExpiry,
    message: !n.nna_certified ? 'NNA certification not on file'
      : nnaStatus === 'expired' ? 'NNA certification has expired'
      : nnaStatus === 'expiring' ? `NNA certification expires ${nnaExpiry}`
      : nnaStatus === 'untracked' ? 'NNA certified (no renewal date on file)'
      : 'NNA certification current',
  }

  // Background check — annual renewal derived from the completion date.
  const bgcExp = bgcExpiry(n)
  const bgcStatus: CredStatus = (!n.background_checked && !n.bgc_date) ? 'missing' : (bgcExp ? statusFromExpiry(bgcExp) : 'untracked')
  const bgc: CredItem = {
    key: 'bgc', label: 'Background Check', short: 'BG', status: bgcStatus, expiry: bgcExp,
    message: bgcStatus === 'missing' ? 'No background check on file'
      : bgcStatus === 'expired' ? 'Background check is over a year old — renewal needed'
      : bgcStatus === 'expiring' ? `Background check due for annual renewal (${bgcExp})`
      : bgcStatus === 'untracked' ? 'Background check on file (no date)'
      : 'Background check current',
  }

  // E&O insurance.
  const eoStatus: CredStatus = (!n.eo_carrier && !n.eo_expiry) ? 'missing' : statusFromExpiry(n.eo_expiry)
  const eo: CredItem = {
    key: 'eo', label: 'E&O Insurance', short: 'E&O', status: eoStatus, expiry: n.eo_expiry ?? null,
    message: eoStatus === 'missing' ? 'No E&O insurance on file'
      : eoStatus === 'expired' ? 'E&O insurance has expired'
      : eoStatus === 'expiring' ? `E&O insurance expires ${n.eo_expiry}`
      : eoStatus === 'untracked' ? 'E&O carrier on file (no expiry)'
      : 'E&O insurance current',
  }

  // Notary commission.
  const comStatus: CredStatus = !n.commission_expiry ? 'missing' : statusFromExpiry(n.commission_expiry)
  const commission: CredItem = {
    key: 'commission', label: 'Notary Commission', short: 'COM', status: comStatus, expiry: n.commission_expiry ?? null,
    message: comStatus === 'missing' ? 'No commission expiry on file'
      : comStatus === 'expired' ? 'Notary commission has expired'
      : comStatus === 'expiring' ? `Notary commission expires ${n.commission_expiry}`
      : 'Notary commission current',
  }

  return [nna, bgc, eo, commission]
}

// Credentials that need a renewal nudge: expiring soon or already expired.
// ('missing' is excluded — that's an onboarding gap, not a renewal.)
export function actionableCredentials(n: NotaryCreds): CredItem[] {
  return credentialItems(n).filter((c) => c.status === 'expiring' || c.status === 'expired')
}

// True only when ALL FOUR credentials are on file and currently valid (green) —
// i.e. fully vetted & verified. Used to decide who counts toward the coverage we
// show title companies, so we never advertise coverage from an unverified agent.
export function fullyCredentialed(n: NotaryCreds): boolean {
  return credentialItems(n).every((c) => c.status === 'valid')
}

export interface CredAction extends CredItem { need: 'renew' | 'provide' }

// What to ASK the notary for. NNA cert + background check are required, so we chase
// both renewals AND missing dates on those (this is how the existing bench gets
// asked to supply dates we don't have). E&O + commission are only chased when an
// actual expiry is approaching/passed — we don't nag about ones never on file.
const PROVIDE_MSG: Record<string, string> = {
  nna: 'We need your NNA certification renewal date on file',
  bgc: 'We need your background-check completion date on file',
  eo: 'We need your E&O insurance details on file',
  commission: 'We need your notary commission expiry on file',
}

// All four credentials are required for an approved agent. Chase any that are
// missing OR expiring/expired — the goal is all four green for the whole bench.
export function credentialActionItems(n: NotaryCreds): CredAction[] {
  const out: CredAction[] = []
  for (const c of credentialItems(n)) {
    const expiringOrExpired = c.status === 'expiring' || c.status === 'expired'
    const missingDate = c.status === 'missing' || c.status === 'untracked'
    if (expiringOrExpired) out.push({ ...c, need: 'renew' })
    else if (missingDate) out.push({ ...c, need: 'provide', message: PROVIDE_MSG[c.key] })
  }
  return out
}
