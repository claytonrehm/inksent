'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils'
import Turnstile from '@/components/Turnstile'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  location: z.string().min(2, 'City & state help us know your market'),
  years_sales: z.string().min(1, 'Please select'),
  b2b_experience: z.string().min(1, 'Please select'),
  industry_experience: z.string().min(1, 'Please select'),
  title_relationships: z.string().min(1, 'Please select'),
  linkedin_url: z.string().optional(),
  pitch: z.string().optional(),
  heard_from: z.string().optional(),
  sms_consent: z.boolean().optional(),
  commission_ack: z.literal(true, { message: 'Please acknowledge to apply' }),
})
type FormData = z.infer<typeof schema>

const YEARS = [
  { value: '', label: 'Select...' },
  { value: 'under_1', label: 'Less than 1 year' },
  { value: '1_3', label: '1–3 years' },
  { value: '3_5', label: '3–5 years' },
  { value: '5_10', label: '5–10 years' },
  { value: '10_plus', label: '10+ years' },
]
const B2B = [
  { value: '', label: 'Select...' },
  { value: 'extensive', label: 'Yes — extensive B2B sales' },
  { value: 'some', label: 'Some B2B sales' },
  { value: 'none', label: 'Mostly B2C / none yet' },
]
const INDUSTRY = [
  { value: '', label: 'Select...' },
  { value: 'current', label: 'Yes — currently in title/escrow/real estate' },
  { value: 'past', label: 'Yes — in the past' },
  { value: 'none', label: 'No industry experience' },
]
const RELATIONSHIPS = [
  { value: '', label: 'Select...' },
  { value: 'many', label: 'Many — I have an active rolodex' },
  { value: 'some', label: 'A few contacts' },
  { value: 'none', label: 'None yet' },
]

export default function SalesApplyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState('')

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    // Honeypot value (hidden field) is read from the DOM directly below.
    const company_url = (document.getElementById('company_url') as HTMLInputElement | null)?.value || ''
    try {
      const res = await fetch('/api/sales-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, company_url, turnstileToken: captchaToken }),
      })
      if (res.status === 409) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'You\'ve already applied with this email.')
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Something went wrong. Please try again or email support@inksent.co.')
        return
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="bg-green-50 rounded-full p-5"><CheckCircle className="text-green-500 w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-gray-900">Application received!</h2>
        <p className="text-gray-500 max-w-sm">
          Thanks for applying. We review every application personally and will reach out within 1–2 business days if it&apos;s a fit.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Honeypot */}
      <input id="company_url" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="name" label="Full Name *" placeholder="Jamie Closer" error={errors.name?.message} {...register('name')} />
        <Input id="phone" label="Cell Phone *" placeholder="(619) 555-0100"
          error={errors.phone?.message}
          {...register('phone', { onChange: (e) => setValue('phone', formatPhone(e.target.value)) })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="email" label="Email *" type="email" placeholder="jamie@email.com" error={errors.email?.message} {...register('email')} />
        <Input id="location" label="City, State *" placeholder="San Diego, CA (remote is fine)" error={errors.location?.message} {...register('location')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select id="years_sales" label="Years in sales *" options={YEARS} error={errors.years_sales?.message} {...register('years_sales')} />
        <Select id="b2b_experience" label="B2B sales experience? *" options={B2B} error={errors.b2b_experience?.message} {...register('b2b_experience')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select id="industry_experience" label="Title / escrow / real estate experience? *" options={INDUSTRY} error={errors.industry_experience?.message} {...register('industry_experience')} />
        <Select id="title_relationships" label="Existing title-company relationships? *" options={RELATIONSHIPS} error={errors.title_relationships?.message} {...register('title_relationships')} />
      </div>

      <Input id="linkedin_url" label="LinkedIn or résumé link (optional)" placeholder="https://linkedin.com/in/…" {...register('linkedin_url')} />
      <Textarea id="pitch" label="Why are you a fit? (optional)" placeholder="A few sentences on your sales background and why this role fits you." {...register('pitch')} />
      <Input id="heard_from" label="How did you hear about us? (optional)" placeholder="Indeed, referral, etc." {...register('heard_from')} />

      {/* SMS consent (optional) */}
      <label className="flex items-start gap-3 cursor-pointer text-sm text-gray-600">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" {...register('sms_consent')} />
        <span>It&apos;s OK to text me about my application. Msg &amp; data rates may apply; reply STOP to opt out.</span>
      </label>

      {/* Commission acknowledgment (required) */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" {...register('commission_ack')} />
          <span className="text-sm text-gray-600">
            I understand this is a <b>100% commission</b>, <b>1099 independent contractor</b> role (no base salary), paid as residual income on the signings my accounts send.
          </span>
        </label>
        {errors.commission_ack && <p className="text-xs text-red-500 mt-2 ml-7">{errors.commission_ack.message}</p>}
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <Turnstile onToken={setCaptchaToken} />

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Apply Now'}
      </Button>
    </form>
  )
}
