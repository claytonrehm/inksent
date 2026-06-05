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
