// Client price per signing, in cents, by signing type. Purchases are more complex
// (same-day funding/recording, more parties, first-time buyers, higher stakes) so
// they're priced above refinances. One source of truth for the order route, the
// order form, and invoice emails.
export const REFI_FEE_CENTS = 20000 // $200 — refinance, HELOC, reverse, loan mod, etc.
export const PURCHASE_FEE_CENTS = 25000 // $250 — purchase transactions

export function clientFeeForType(signingType?: string | null): number {
  return (signingType ?? '').toLowerCase().includes('purchase') ? PURCHASE_FEE_CENTS : REFI_FEE_CENTS
}

export function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}
