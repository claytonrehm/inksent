import type { NotaryOrder } from './notary-metrics'

export interface HubUser {
  id: string
  email: string
  name: string | null
  base_zip: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  plan: string | null
  current_period_end: string | null
}

export interface HubJob {
  id: string
  hub_user_id: string
  signing_date: string
  signing_time: string
  signing_type: string
  signer_name: string
  company: string | null
  property_city: string
  property_state: string
  property_zip: string
  fee: number
  status: string
  completed_at: string | null
  paid_at: string | null
  created_at: string | null
}

/** Subscription states that grant access to the paid Hub. */
export function isSubscribed(status: string | null | undefined): boolean {
  return status === 'trialing' || status === 'active'
}

/** Map a manually-entered hub job onto the shared NotaryOrder metrics shape. */
export function hubJobToOrder(j: HubJob): NotaryOrder {
  return {
    id: j.id,
    confirmation_number: j.company ?? null,
    status: j.status,
    signing_type: j.signing_type,
    signing_date: j.signing_date,
    signing_time: j.signing_time,
    signer_name: j.signer_name,
    property_address: null,
    property_city: j.property_city,
    property_state: j.property_state,
    property_zip: j.property_zip,
    notary_fee: j.fee,
    notary_paid_at: j.paid_at,
    completed_at: j.completed_at ?? (j.status === 'completed' ? `${j.signing_date}T12:00:00Z` : null),
    created_at: j.created_at,
  }
}
