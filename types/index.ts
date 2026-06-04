export type OrderStatus =
  | 'pending'
  | 'dispatching'
  | 'assigned'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type SigningType =
  | 'purchase'
  | 'refinance'
  | 'heloc'
  | 'reverse_mortgage'
  | 'loan_mod'
  | 'other'

export interface Order {
  id: string
  created_at: string
  status: OrderStatus
  signing_type: SigningType
  signing_date: string
  signing_time: string
  // Property
  property_address: string
  property_city: string
  property_state: string
  property_zip: string
  // Signer
  signer_name: string
  signer_phone: string
  signer_email: string
  // Client (title/escrow company)
  client_company: string
  client_name: string
  client_email: string
  client_phone: string
  // Notary (assigned)
  notary_id: string | null
  // Financials
  client_fee: number
  notary_fee: number
  // Notes
  special_instructions: string | null
  // Invoice
  invoice_id: string | null
}

export interface Notary {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  zip_codes: string[]
  commission_state: string
  nna_certified: boolean
  active: boolean
}

export interface OrderFormData {
  signing_type: SigningType
  signing_date: string
  signing_time: string
  property_address: string
  property_city: string
  property_state: string
  property_zip: string
  signer_name: string
  signer_phone: string
  signer_email: string
  client_company: string
  client_name: string
  client_email: string
  client_phone: string
  special_instructions: string
}
