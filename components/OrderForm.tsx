'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { clientFeeForType, dollars } from '@/lib/pricing'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { orderSchema, type OrderSchema } from '@/lib/validations'
import { formatPhone } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Turnstile from '@/components/Turnstile'

const SIGNING_TYPES = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'refinance', label: 'Refinance' },
  { value: 'heloc', label: 'HELOC' },
  { value: 'reverse_mortgage', label: 'Reverse Mortgage' },
  { value: 'loan_mod', label: 'Loan Modification' },
  { value: 'other', label: 'Other' },
]

const STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const label = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  return { value, label }
})

interface ConfirmationState {
  id: string
  confirmation_number: string
}

export interface OrderPrefill {
  client_company?: string
  client_name?: string
  client_email?: string
  client_phone?: string
}

export default function OrderForm({ prefill }: { prefill?: OrderPrefill }) {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [coverage, setCoverage] = useState<{ covered: boolean; city?: string; state?: string; agentCount?: number; sameDay?: boolean } | null>(null)

  async function checkCoverage(zip: string) {
    if (!/^\d{5}$/.test(zip)) { setCoverage(null); return }
    try {
      const r = await fetch(`/api/coverage?zip=${zip}`)
      const d = await r.json()
      setCoverage(d.found ? d : null)
    } catch { setCoverage(null) }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: { ...(prefill ?? {}) },
  })

  const onSubmit = async (data: OrderSchema) => {
    setSubmitError(null)
    if (!agreed) {
      setSubmitError('Please accept the Terms of Service and Privacy Policy to place your order.')
      return
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken: captchaToken, terms_accepted: agreed }),
      })

      if (!res.ok) {
        setSubmitError('Something went wrong. Please try again or call us at (619) 949-3361.')
        return
      }

      const result = await res.json()
      setConfirmation(result)
    } catch {
      setSubmitError('We couldn\'t reach our servers. Please check your connection and try again, or call (619) 949-3361.')
    }
  }

  if (confirmation) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="bg-green-50 rounded-full p-4">
          <CheckCircle className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Received</h2>
        <p className="text-gray-500 max-w-sm">
          We&apos;ll assign a signing agent and confirm within 30 minutes.
        </p>
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-10 py-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Confirmation</p>
          <p className="text-2xl font-mono font-bold text-gray-900">{confirmation.confirmation_number}</p>
        </div>
        <a
          href={`/track/${confirmation.id}`}
          className="mt-2 inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
        >
          Track your signing live →
        </a>
        <p className="text-xs text-gray-400 max-w-sm">
          We&apos;ve also emailed you this confirmation and a link to upload your documents.
        </p>
        <Button variant="secondary" className="mt-1" onClick={() => setConfirmation(null)}>
          Place Another Order
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Honeypot — hidden from humans, catches bots. Do not remove. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('company_url' as never)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      {/* Signing Details */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Signing Details
        </h2>
        <div className="mb-4">
          <Input
            id="client_reference"
            label="Your file / order # (optional)"
            placeholder="e.g. ESC-24-1087 — appears in your portal + email updates so you can cross-reference"
            {...register('client_reference')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            id="signing_type"
            label="Signing Type *"
            options={SIGNING_TYPES}
            error={errors.signing_type?.message}
            {...register('signing_type')}
          />
          <Input
            id="signing_date"
            label="Signing Date *"
            type="date"
            error={errors.signing_date?.message}
            min={new Date().toISOString().split('T')[0]}
            {...register('signing_date')}
          />
          <Select
            id="signing_time"
            label="Signing Time *"
            options={TIME_SLOTS}
            error={errors.signing_time?.message}
            {...register('signing_time')}
          />
        </div>
      </section>

      {/* Property */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Property Address
        </h2>
        <div className="space-y-4">
          <Input
            id="property_address"
            label="Street Address *"
            placeholder="123 Main St"
            error={errors.property_address?.message}
            {...register('property_address')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Input
                id="property_city"
                label="City *"
                placeholder="Phoenix"
                error={errors.property_city?.message}
                {...register('property_city')}
              />
            </div>
            <Select
              id="property_state"
              label="State *"
              options={STATES}
              error={errors.property_state?.message}
              {...register('property_state')}
            />
            <Input
              id="property_zip"
              label="ZIP *"
              placeholder="85001"
              maxLength={5}
              error={errors.property_zip?.message}
              {...register('property_zip', { onChange: (e) => checkCoverage(e.target.value) })}
            />
          </div>
          {coverage && (
            coverage.covered ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✓ Covered in {coverage.city}, {coverage.state} — {coverage.agentCount} agent{coverage.agentCount === 1 ? '' : 's'} in range{coverage.sameDay ? ', same-day available' : ''}.
              </p>
            ) : (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ {coverage.city}, {coverage.state} is a newer area for us. Go ahead and submit — we&apos;ll work to staff it and tell you quickly if we can&apos;t, no charge.
              </p>
            )
          )}
        </div>
      </section>

      {/* Signer */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Signer / Borrower
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="signer_name"
            label="Full Name *"
            placeholder="Jane Doe"
            error={errors.signer_name?.message}
            {...register('signer_name')}
          />
          <Input
            id="signer_phone"
            label="Cell Phone *"
            placeholder="(555) 555-0100"
            error={errors.signer_phone?.message}
            {...register('signer_phone', {
              onChange: (e) => setValue('signer_phone', formatPhone(e.target.value)),
            })}
          />
          <Input
            id="signer_email"
            label="Email (optional)"
            type="email"
            placeholder="jane@email.com"
            error={errors.signer_email?.message}
            {...register('signer_email')}
          />
        </div>
      </section>

      {/* Client */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Your Company / Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="client_company"
            label="Company Name *"
            placeholder="First American Title"
            error={errors.client_company?.message}
            {...register('client_company')}
          />
          <Input
            id="client_name"
            label="Your Name *"
            placeholder="John Smith"
            error={errors.client_name?.message}
            {...register('client_name')}
          />
          <Input
            id="client_email"
            label="Your Email *"
            type="email"
            placeholder="john@firstam.com"
            error={errors.client_email?.message}
            {...register('client_email')}
          />
          <Input
            id="client_phone"
            label="Your Phone *"
            placeholder="(555) 555-0200"
            error={errors.client_phone?.message}
            {...register('client_phone', {
              onChange: (e) => setValue('client_phone', formatPhone(e.target.value)),
            })}
          />
        </div>
      </section>

      {/* Language + Special Instructions */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="language_needed" className="text-sm font-medium text-gray-700">Language Needed</label>
            <select
              id="language_needed"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('language_needed')}
            >
              <option value="">English (default)</option>
              <option value="Spanish">Spanish</option>
              <option value="Mandarin">Mandarin</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="Tagalog">Tagalog</option>
              <option value="Korean">Korean</option>
              <option value="Other">Other (note below)</option>
            </select>
          </div>
        </div>
        <Textarea
          id="special_instructions"
          label="Special Instructions"
          placeholder="Gate code, ID requirements, docs arriving separately, etc."
          {...register('special_instructions')}
        />
      </section>

      {/* Terms acceptance (clickwrap) */}
      <label className="flex items-start gap-3 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-4">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
        <span className="text-sm text-gray-600">
          I agree to Inksent&apos;s{' '}
          <a href="/terms" target="_blank" className="text-violet-600 underline">Terms of Service</a> and{' '}
          <a href="/privacy" target="_blank" className="text-violet-600 underline">Privacy Policy</a>, and I&apos;m authorized to place this order on behalf of my company. I consent to receive SMS updates about this signing at the number(s) provided, and confirm the signer has agreed to receive signing-related texts. Message frequency varies; message &amp; data rates may apply. Reply STOP to opt out, HELP for help.
        </span>
      </label>

      {/* Pricing summary — updates with the signing type, no surprises at submit time */}
      <div className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-5 py-4">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{dollars(clientFeeForType(watch('signing_type')))} per signing</p>
          <p className="text-xs text-gray-500 mt-0.5">Refinance $200 · Purchase $250. NNA-certified agent, background-checked, automatic backup. Invoiced after the signing is completed.</p>
        </div>
        <span className="text-2xl font-black text-violet-700 shrink-0 ml-4">{dollars(clientFeeForType(watch('signing_type')))}</span>
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {submitError}
        </p>
      )}

      <div className="flex flex-col items-end gap-3 pt-2">
        <Turnstile onToken={setCaptchaToken} />
        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? 'Placing Order...' : 'Place Signing Order'}
        </Button>
      </div>
    </form>
  )
}
