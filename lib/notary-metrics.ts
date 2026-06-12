import {
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
  format,
  differenceInCalendarDays,
} from 'date-fns'
import { zipDistance } from './coverage'

/**
 * IRS standard mileage rate, in cents per mile (business use).
 * 2026 rate = 72.5¢/mi (IRS Notice 2026-10, up 2.5¢ from 2025's 70¢).
 * This single constant drives every deduction figure — update it each January
 * when the IRS publishes the new rate.
 */
export const IRS_MILEAGE_RATE_CENTS = 72.5

export const SIGNING_TYPE_LABELS: Record<string, string> = {
  purchase: 'Purchase',
  refinance: 'Refinance',
  heloc: 'HELOC',
  reverse_mortgage: 'Reverse',
  loan_mod: 'Loan Mod',
  other: 'Other',
}

/** Stable color per signing type for charts/legends. */
export const SIGNING_TYPE_COLORS: Record<string, string> = {
  purchase: '#7c3aed', // violet-600
  refinance: '#6366f1', // indigo-500
  heloc: '#0ea5e9', // sky-500
  reverse_mortgage: '#10b981', // emerald-500
  loan_mod: '#f59e0b', // amber-500
  other: '#94a3b8', // slate-400
}

export interface NotaryOrder {
  id: string
  confirmation_number: string | null
  status: string
  signing_type: string
  signing_date: string
  signing_time: string
  signer_name: string
  property_address: string | null
  property_city: string
  property_state: string
  property_zip: string
  notary_fee: number | null
  notary_paid_at: string | null
  completed_at: string | null
  created_at: string | null
}

export interface EnrichedOrder extends NotaryOrder {
  /** Estimated round-trip miles from the notary's base ZIP (null if unknown). */
  miles: number | null
  /** Estimated mileage deduction in cents (null if miles unknown). */
  deductionCents: number | null
  /** Whether this is a completed, still-unpaid job. */
  unpaid: boolean
}

export interface HubMetrics {
  // Headline money
  lifetimeEarningsCents: number
  ytdEarningsCents: number
  mtdEarningsCents: number
  paidOutCents: number
  pendingPayoutCents: number
  // Counts
  completedCount: number
  upcomingCount: number
  jobsThisMonth: number
  avgFeeCents: number
  // Mileage / tax
  ytdMiles: number
  ytdDeductionCents: number
  lifetimeMiles: number
  lifetimeDeductionCents: number
  // Charts
  monthly: { key: string; label: string; earningsCents: number; jobs: number }[]
  typeMix: { type: string; label: string; color: string; count: number; earningsCents: number }[]
  aging: { bucket: string; cents: number; count: number }[]
  // Lists (already enriched + sorted)
  upcoming: EnrichedOrder[]
  recent: EnrichedOrder[]
  unpaid: EnrichedOrder[]
  jobs: EnrichedOrder[]
}

/** Round-trip estimated miles from base ZIP to a property ZIP. */
export function orderMiles(baseZip: string | null | undefined, propertyZip: string): number | null {
  if (!baseZip) return null
  const oneWay = zipDistance(baseZip, propertyZip)
  if (oneWay === null) return null
  return Math.round(oneWay * 2 * 10) / 10
}

/** The date we attribute an order to for reporting (completion, else signing date). */
function orderDate(o: NotaryOrder): Date {
  return parseISO(o.completed_at ?? o.signing_date)
}

export function enrichOrder(o: NotaryOrder, baseZip: string | null | undefined): EnrichedOrder {
  const miles = orderMiles(baseZip, o.property_zip)
  return {
    ...o,
    miles,
    deductionCents: miles === null ? null : Math.round(miles * IRS_MILEAGE_RATE_CENTS),
    unpaid: o.status === 'completed' && !o.notary_paid_at,
  }
}

/**
 * Compute every metric the hub needs from a notary's orders. Pure + deterministic
 * given `now`, so it's trivially testable and safe to run server-side.
 */
export function computeHubMetrics(
  orders: NotaryOrder[],
  baseZip: string | null | undefined,
  now: Date
): HubMetrics {
  const enriched = orders.map((o) => enrichOrder(o, baseZip))
  const completed = enriched.filter((o) => o.status === 'completed')

  const yearStart = startOfYear(now)
  const monthStart = startOfMonth(now)
  const todayKey = format(now, 'yyyy-MM-dd')

  const sum = (list: EnrichedOrder[]) => list.reduce((s, o) => s + (o.notary_fee ?? 0), 0)
  const sumMiles = (list: EnrichedOrder[]) => Math.round(list.reduce((s, o) => s + (o.miles ?? 0), 0) * 10) / 10

  const ytdCompleted = completed.filter((o) => orderDate(o) >= yearStart)
  const mtdCompleted = completed.filter((o) => orderDate(o) >= monthStart)

  const lifetimeEarningsCents = sum(completed)
  const paidOutCents = sum(completed.filter((o) => o.notary_paid_at))
  const pendingPayoutCents = lifetimeEarningsCents - paidOutCents

  // Monthly earnings — trailing 6 months including the current one.
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = startOfMonth(subMonths(now, 5 - i))
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM'), earningsCents: 0, jobs: 0 }
  })
  const monthIndex = new Map(monthly.map((m, i) => [m.key, i]))
  for (const o of completed) {
    const idx = monthIndex.get(format(orderDate(o), 'yyyy-MM'))
    if (idx !== undefined) {
      monthly[idx].earningsCents += o.notary_fee ?? 0
      monthly[idx].jobs += 1
    }
  }

  // Signing-type mix (completed jobs only).
  const typeMap = new Map<string, { count: number; earningsCents: number }>()
  for (const o of completed) {
    const cur = typeMap.get(o.signing_type) ?? { count: 0, earningsCents: 0 }
    cur.count += 1
    cur.earningsCents += o.notary_fee ?? 0
    typeMap.set(o.signing_type, cur)
  }
  const typeMix = [...typeMap.entries()]
    .map(([type, v]) => ({
      type,
      label: SIGNING_TYPE_LABELS[type] ?? type,
      color: SIGNING_TYPE_COLORS[type] ?? SIGNING_TYPE_COLORS.other,
      count: v.count,
      earningsCents: v.earningsCents,
    }))
    .sort((a, b) => b.earningsCents - a.earningsCents)

  // Accounts-receivable aging (completed but unpaid), bucketed by age.
  const unpaid = completed
    .filter((o) => o.unpaid)
    .sort((a, b) => +orderDate(b) - +orderDate(a))
  const agingBuckets = [
    { bucket: '0–7d', max: 7, cents: 0, count: 0 },
    { bucket: '8–14d', max: 14, cents: 0, count: 0 },
    { bucket: '15–30d', max: 30, cents: 0, count: 0 },
    { bucket: '30d+', max: Infinity, cents: 0, count: 0 },
  ]
  for (const o of unpaid) {
    const age = differenceInCalendarDays(now, orderDate(o))
    const b = agingBuckets.find((x) => age <= x.max) ?? agingBuckets[agingBuckets.length - 1]
    b.cents += o.notary_fee ?? 0
    b.count += 1
  }

  const upcoming = enriched
    .filter((o) => ['assigned', 'confirmed'].includes(o.status) && o.signing_date >= todayKey)
    .sort((a, b) => a.signing_date.localeCompare(b.signing_date))

  const recent = [...completed].sort((a, b) => +orderDate(b) - +orderDate(a))

  const jobs = [...enriched].sort((a, b) => b.signing_date.localeCompare(a.signing_date))

  return {
    lifetimeEarningsCents,
    ytdEarningsCents: sum(ytdCompleted),
    mtdEarningsCents: sum(mtdCompleted),
    paidOutCents,
    pendingPayoutCents,
    completedCount: completed.length,
    upcomingCount: upcoming.length,
    jobsThisMonth: mtdCompleted.length,
    avgFeeCents: completed.length ? Math.round(lifetimeEarningsCents / completed.length) : 0,
    ytdMiles: sumMiles(ytdCompleted),
    ytdDeductionCents: Math.round(sumMiles(ytdCompleted) * IRS_MILEAGE_RATE_CENTS),
    lifetimeMiles: sumMiles(completed),
    lifetimeDeductionCents: Math.round(sumMiles(completed) * IRS_MILEAGE_RATE_CENTS),
    monthly,
    typeMix,
    aging: agingBuckets.map(({ bucket, cents, count }) => ({ bucket, cents, count })),
    upcoming,
    recent,
    unpaid,
    jobs,
  }
}
