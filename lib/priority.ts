import { vetApplicant } from '@/lib/notary'
import { credentialItems, type NotaryCreds } from '@/lib/credentials'

// v0 priority score: a single quality/reliability ranking used to ORDER the bench
// (and, in v1, to seed a staggered dispatch head-start). Designed to be sensible at
// ZERO job volume — it leans on the vetting signal + credentials + the manual
// preferred flag, and layers in real performance only once a notary has worked.
export interface PriorityInput extends NotaryCreds {
  preferred?: boolean | null
  years_experience?: number | null
  signings_completed?: string | null
  re_experience?: string | null
  signing_types?: string[] | null
  coverage_radius?: number | null
  jobsCompleted?: number
  onTimePct?: number | null
  acceptanceRate?: number | null
  timesCancelled?: number | null
  daysSinceActive?: number | null
}

export interface PriorityResult { score: number; tier: 'A' | 'B' | 'C'; preferred: boolean }

export function computePriority(n: PriorityInput): PriorityResult {
  // Quality base from the application vetting (experience, volume, RE competence,
  // NNA, background check). 0–100 and meaningful before any jobs exist.
  const vet = vetApplicant({
    years_experience: n.years_experience,
    signings_completed: n.signings_completed,
    re_experience: n.re_experience,
    signing_types: n.signing_types,
    nna_certified: n.nna_certified,
    background_checked: n.background_checked,
    coverage_radius: n.coverage_radius,
  })
  let score = vet.score

  // Credentials: an expired one means they're not even dispatch-eligible → sink them.
  // A fully-current set earns a small boost.
  const creds = credentialItems(n)
  if (creds.some((c) => c.status === 'expired')) score -= 40
  else if (creds.every((c) => c.status === 'valid' || c.status === 'untracked')) score += 4

  // Performance — only counts once they've actually worked (sparse/neutral early).
  const jobs = n.jobsCompleted ?? 0
  if (jobs > 0) {
    if (n.onTimePct != null) score += (n.onTimePct - 80) / 4
    if (n.acceptanceRate != null) score += (n.acceptanceRate - 50) / 5
    score += Math.min(jobs, 20) * 0.5
  }
  score -= (n.timesCancelled ?? 0) * 5
  if ((n.daysSinceActive ?? 0) > 60) score -= 15

  // Manual override: a preferred agent always floats to the top.
  if (n.preferred) score = Math.max(score, 82) + 8

  score = Math.max(0, Math.min(100, Math.round(score)))
  const tier: 'A' | 'B' | 'C' = score >= 70 ? 'A' : score >= 45 ? 'B' : 'C'
  return { score, tier, preferred: !!n.preferred }
}
