// Shared labels and helpers for notary data

export const SIGNINGS_LABEL: Record<string, string> = {
  under_50: 'Under 50',
  '50_200': '50–200',
  '200_500': '200–500',
  '500_plus': '500+',
}

// Rough numeric rank for sorting/filtering by signing volume
export const SIGNINGS_RANK: Record<string, number> = {
  under_50: 1,
  '50_200': 2,
  '200_500': 3,
  '500_plus': 4,
}

export type VetTier = 'Strong' | 'Solid' | 'Review' | 'Weak'

export interface VetResult {
  score: number // 0–100
  tier: VetTier
  pros: string[]
  cons: string[]
}

/**
 * Automated first-pass vetting score from the application data alone
 * (experience, volume, NNA cert, background check, coverage breadth).
 * Deterministic triage — pair with the one-click verify links for the
 * human confirmation (NNA directory, reviews, LinkedIn).
 */
export function vetApplicant(a: {
  years_experience?: number | null
  signings_completed?: string | null
  nna_certified?: boolean | null
  background_checked?: boolean | null
  coverage_radius?: number | null
}): VetResult {
  const pros: string[] = []
  const cons: string[] = []
  let score = 0

  const yrs = a.years_experience ?? 0
  if (yrs >= 10) { score += 30; pros.push(`${yrs} yrs experience`) }
  else if (yrs >= 5) { score += 22; pros.push(`${yrs} yrs experience`) }
  else if (yrs >= 2) { score += 12; pros.push(`${yrs} yrs experience`) }
  else if (yrs >= 1) { score += 5; cons.push('Only 1 yr experience') }
  else cons.push('No experience listed')

  const volRank = SIGNINGS_RANK[a.signings_completed ?? ''] ?? 0
  if (volRank >= 4) { score += 30; pros.push('500+ signings completed') }
  else if (volRank === 3) { score += 22; pros.push('200–500 signings') }
  else if (volRank === 2) { score += 12; pros.push('50–200 signings') }
  else if (volRank === 1) { score += 4; cons.push('Under 50 signings') }
  else cons.push('No signing volume listed')

  if (a.nna_certified) { score += 20; pros.push('NNA certified') }
  else cons.push('Not NNA certified')

  if (a.background_checked) { score += 15; pros.push('Background-checked') }
  else cons.push('No background check')

  const radius = a.coverage_radius ?? 0
  if (radius >= 30) { score += 5; pros.push(`Wide ${radius}mi coverage`) }
  else if (radius >= 20) { score += 3 }

  score = Math.min(100, score)
  const tier: VetTier = score >= 75 ? 'Strong' : score >= 55 ? 'Solid' : score >= 35 ? 'Review' : 'Weak'
  return { score, tier, pros, cons }
}
