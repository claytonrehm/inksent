import { z } from 'zod'

const ALL_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'] as const

export const orderSchema = z.object({
  signing_type: z.enum(['purchase', 'refinance', 'heloc', 'reverse_mortgage', 'loan_mod', 'other'], {
    error: 'Signing type is required',
  }),
  signing_date: z.string().min(1, 'Signing date is required'),
  signing_time: z.string().min(1, 'Signing time is required'),
  property_address: z.string().min(3, 'Property address is required'),
  property_city: z.string().min(2, 'City is required'),
  property_state: z.enum(ALL_STATES, { error: 'Select a state' }),
  property_zip: z.string().regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP'),
  signer_name: z.string().min(2, 'Signer name is required'),
  signer_phone: z.string().min(10, 'Enter a valid phone number'),
  signer_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  client_company: z.string().min(2, 'Company name is required'),
  client_name: z.string().min(2, 'Contact name is required'),
  client_email: z.string().email('Enter a valid email'),
  client_phone: z.string().min(10, 'Enter a valid phone number'),
  language_needed: z.string().optional(),
  special_instructions: z.string().optional(),
})

export type OrderSchema = z.infer<typeof orderSchema>
