import type { SupabaseClient } from '@supabase/supabase-js'

// Default 1099 commission terms (see SALES-COMMISSION-AGREEMENT.md).
export const DEFAULT_RESIDUAL_CENTS = 1500 // $15 per collected signing
export const DEFAULT_BONUS_CENTS = 20000 // $200 producer bonus
export const DEFAULT_BONUS_THRESHOLD = 25 // collected signings to earn the bonus

// Rank a sales-rep applicant by likely fit. Existing title relationships are the
// strongest predictor of fast wins, then industry experience, then B2B chops,
// then tenure. Returns a 0–100 score, an A/B/C tier, and the standout signals.
export interface ApplicantLike {
  title_relationships?: string | null
  industry_experience?: string | null
  b2b_experience?: string | null
  years_sales?: string | null
}
export function scoreApplicant(a: ApplicantLike): { score: number; tier: 'A' | 'B' | 'C'; signals: string[] } {
  let score = 0
  const signals: string[] = []

  if (a.title_relationships === 'many') { score += 40; signals.push('Active title rolodex') }
  else if (a.title_relationships === 'some') { score += 20; signals.push('Some title contacts') }

  if (a.industry_experience === 'current') { score += 25; signals.push('In title/escrow/RE now') }
  else if (a.industry_experience === 'past') { score += 15; signals.push('Past title/escrow/RE') }

  if (a.b2b_experience === 'extensive') { score += 20; signals.push('Extensive B2B') }
  else if (a.b2b_experience === 'some') { score += 10 }

  const yrs: Record<string, number> = { '10_plus': 15, '5_10': 12, '3_5': 9, '1_3': 5, under_1: 2 }
  score += yrs[a.years_sales ?? ''] ?? 0

  const tier = score >= 70 ? 'A' : score >= 40 ? 'B' : 'C'
  return { score, tier, signals }
}

// Orders store the title company as free text. Normalize so "ABC Title",
// " abc  title " and "ABC TITLE" all match the same account.
export function normalizeCompany(name: string): string {
  return (name ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export interface SalesRepRow {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  status: 'active' | 'inactive'
  residual_per_signing_cents: number
  producer_bonus_cents: number
  bonus_threshold: number
  notes: string | null
  // Onboarding (filled after an applicant is approved)
  application_id?: string | null
  agreement_accepted_at?: string | null
  w9_received?: boolean
  payment_method?: string | null
  payment_details?: string | null
  onboarded_at?: string | null
}
export interface SalesAccountRow {
  id: string
  created_at: string
  sales_rep_id: string
  company_name: string
  company_key: string
  status: 'active' | 'dormant'
  landed_at: string | null
  notes: string | null
}
export interface SalesPayoutRow {
  id: string
  created_at: string
  sales_rep_id: string
  amount_cents: number
  paid_at: string | null
  period_label: string | null
  note: string | null
}

// Per-company collected-signing tallies, keyed by normalized company name.
export interface CompanyTally {
  key: string
  display: string // a representative original spelling
  collectedSignings: number
  collectedRevenueCents: number
  totalOrders: number
}

export interface AccountComputed extends SalesAccountRow {
  collectedSignings: number
  collectedRevenueCents: number
  residualEarnedCents: number
  bonusEarnedCents: number
  totalEarnedCents: number
  bonusReached: boolean
}
export interface RepComputed extends SalesRepRow {
  accounts: AccountComputed[]
  payouts: SalesPayoutRow[]
  collectedSignings: number
  earnedCents: number
  paidCents: number
  owedCents: number
}
export interface SalesData {
  reps: RepComputed[]
  unattributed: CompanyTally[]
  totals: {
    reps: number
    activeReps: number
    accounts: number
    collectedSignings: number
    earnedCents: number
    paidCents: number
    owedCents: number
  }
}

// A collected signing = client actually paid AND not refunded. This is the
// commission trigger: we only ever pay a rep out of money already in the bank.
function isCollected(o: { client_paid_at?: string | null; refunded_at?: string | null }): boolean {
  return !!o.client_paid_at && !o.refunded_at
}

// Build the full sales / commission picture from the raw tables + orders.
// Resilient pre-migration: missing tables just yield empty results.
export async function computeSalesData(supabase: SupabaseClient): Promise<SalesData> {
  const [repsRes, accountsRes, payoutsRes, ordersRes] = await Promise.all([
    supabase.from('sales_reps').select('*').order('created_at', { ascending: true }),
    supabase.from('sales_accounts').select('*'),
    supabase.from('sales_payouts').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('client_company, client_fee, client_paid_at, refunded_at'),
  ])

  const reps = (repsRes.data ?? []) as SalesRepRow[]
  const accounts = (accountsRes.data ?? []) as SalesAccountRow[]
  const payouts = (payoutsRes.data ?? []) as SalesPayoutRow[]
  const orders = (ordersRes.data ?? []) as Array<{
    client_company: string | null
    client_fee: number | null
    client_paid_at: string | null
    refunded_at: string | null
  }>

  // Tally collected signings per normalized company.
  const tallies = new Map<string, CompanyTally>()
  for (const o of orders) {
    const key = normalizeCompany(o.client_company ?? '')
    if (!key) continue
    let t = tallies.get(key)
    if (!t) {
      t = { key, display: (o.client_company ?? '').trim(), collectedSignings: 0, collectedRevenueCents: 0, totalOrders: 0 }
      tallies.set(key, t)
    }
    t.totalOrders++
    if (isCollected(o)) {
      t.collectedSignings++
      t.collectedRevenueCents += o.client_fee ?? 0
    }
  }

  const accountsByRep = new Map<string, SalesAccountRow[]>()
  for (const a of accounts) {
    const list = accountsByRep.get(a.sales_rep_id) ?? []
    list.push(a)
    accountsByRep.set(a.sales_rep_id, list)
  }
  const payoutsByRep = new Map<string, SalesPayoutRow[]>()
  for (const p of payouts) {
    const list = payoutsByRep.get(p.sales_rep_id) ?? []
    list.push(p)
    payoutsByRep.set(p.sales_rep_id, list)
  }
  const attributedKeys = new Set<string>(accounts.map((a) => a.company_key))

  const repsComputed: RepComputed[] = reps.map((r) => {
    const computedAccounts: AccountComputed[] = (accountsByRep.get(r.id) ?? []).map((a) => {
      const t = tallies.get(a.company_key)
      const signings = t?.collectedSignings ?? 0
      const revenue = t?.collectedRevenueCents ?? 0
      const residual = signings * r.residual_per_signing_cents
      const bonusReached = signings >= r.bonus_threshold
      const bonus = bonusReached ? r.producer_bonus_cents : 0
      return {
        ...a,
        collectedSignings: signings,
        collectedRevenueCents: revenue,
        residualEarnedCents: residual,
        bonusEarnedCents: bonus,
        totalEarnedCents: residual + bonus,
        bonusReached,
      }
    })
    const repPayouts = payoutsByRep.get(r.id) ?? []
    const earned = computedAccounts.reduce((s, a) => s + a.totalEarnedCents, 0)
    const paid = repPayouts.reduce((s, p) => s + p.amount_cents, 0)
    const collectedSignings = computedAccounts.reduce((s, a) => s + a.collectedSignings, 0)
    return {
      ...r,
      accounts: computedAccounts,
      payouts: repPayouts,
      collectedSignings,
      earnedCents: earned,
      paidCents: paid,
      owedCents: earned - paid,
    }
  })

  const unattributed: CompanyTally[] = [...tallies.values()]
    .filter((t) => !attributedKeys.has(t.key))
    .sort((a, b) => b.collectedSignings - a.collectedSignings || b.totalOrders - a.totalOrders)

  const totals = {
    reps: repsComputed.length,
    activeReps: repsComputed.filter((r) => r.status === 'active').length,
    accounts: accounts.length,
    collectedSignings: repsComputed.reduce((s, r) => s + r.collectedSignings, 0),
    earnedCents: repsComputed.reduce((s, r) => s + r.earnedCents, 0),
    paidCents: repsComputed.reduce((s, r) => s + r.paidCents, 0),
    owedCents: repsComputed.reduce((s, r) => s + r.owedCents, 0),
  }

  return { reps: repsComputed, unattributed, totals }
}
