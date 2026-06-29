'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Camera, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/compress-image'
import Turnstile from '@/components/Turnstile'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  base_zip: z.string().regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP'),
  coverage_radius: z.string().min(1, 'Select how far you\'ll travel'),
  years_experience: z.string().min(1, 'Required'),
  signings_completed: z.string().min(1, 'Please select'),
  re_experience: z.string().min(1, 'Please select your experience level'),
  nna_certified: z.enum(['yes', 'no'], { message: 'Please select' }),
  nna_cert_expiry: z.string().optional(),
  background_checked: z.enum(['yes', 'no'], { message: 'Please select' }),
  bgc_date: z.string().optional(),
  eo_insured: z.enum(['yes', 'no'], { message: 'Please select' }),
  eo_carrier: z.string().optional(),
  eo_coverage_amount: z.string().optional(),
  eo_expiry: z.string().optional(),
  commission_state_code: z.string().min(2, 'Required'),
  commission_expiry: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  // Carrier compliance (A2P 10DLC error 30923): SMS consent must be VOLUNTARY —
  // the application must submit whether or not this box is checked. We store the
  // opt-in (sms_consent_at) only when it's ticked, and never SMS those who didn't.
  sms_consent: z.boolean().optional(),
  ic_agreement: z.literal(true, { message: 'You must accept the Independent Contractor Agreement to join' }),
}).superRefine((d, ctx) => {
  // These are the minimum requirements to join — all required.
  if (d.nna_certified !== 'yes') ctx.addIssue({ code: 'custom', path: ['nna_certified'], message: 'NNA certification is required to join' })
  else if (!d.nna_cert_expiry) ctx.addIssue({ code: 'custom', path: ['nna_cert_expiry'], message: 'Enter your NNA cert renewal date' })

  if (d.background_checked !== 'yes') ctx.addIssue({ code: 'custom', path: ['background_checked'], message: 'A current background check is required' })
  else if (!d.bgc_date) ctx.addIssue({ code: 'custom', path: ['bgc_date'], message: 'Enter your background-check date' })

  // E&O is optional at apply — we collect/verify it before the first paid signing.
  // If they DO carry it, validate the details they entered.
  if (d.eo_insured === 'yes') {
    if (!d.eo_carrier) ctx.addIssue({ code: 'custom', path: ['eo_carrier'], message: 'Enter your E&O carrier' })
    if (!d.eo_expiry) ctx.addIssue({ code: 'custom', path: ['eo_expiry'], message: 'Enter your E&O expiry date' })
    const amt = parseInt(d.eo_coverage_amount ?? '', 10)
    if (!d.eo_coverage_amount || Number.isNaN(amt)) ctx.addIssue({ code: 'custom', path: ['eo_coverage_amount'], message: 'Enter your coverage amount' })
    else if (amt < 25000) ctx.addIssue({ code: 'custom', path: ['eo_coverage_amount'], message: 'Title companies require at least $25,000' })
  }
})
type FormData = z.infer<typeof schema>

export default function NotaryApplyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [cityLabel, setCityLabel] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const [signingTypes, setSigningTypes] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleSigningType(t: string) {
    setSigningTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  }

  function toggleAvailability(t: string) {
    setAvailability((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  }

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { coverage_radius: '20' },
  })
  const nnaCertified = watch('nna_certified')
  const bgChecked = watch('background_checked')
  const eoInsured = watch('eo_insured')

  async function lookupCity(zip: string) {
    if (!/^\d{5}$/.test(zip)) { setCityLabel(null); return }
    try {
      const res = await fetch(`/api/zip-lookup?zip=${zip}`)
      if (!res.ok) { setCityLabel(null); return }
      const data = await res.json()
      setCityLabel(data.city ? `${data.city}, ${data.state}` : null)
    } catch { setCityLabel(null) }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Phones sometimes report an empty type for HEIC — accept by extension too.
    const looksImage = file.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name)
    if (!looksImage) { setPhotoError('Please choose a photo (JPG, PNG, or HEIC)'); return }
    if (file.size > 25 * 1024 * 1024) { setPhotoError('That photo is very large — please choose one under 25MB'); return }
    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: FormData) {
    setError(null)

    // Photo is optional at the application stage — we collect/require it at onboarding,
    // once they're approved and invested. Requiring it up front was killing applications.
    let photo_url: string | undefined
    if (photoFile) {
      try {
        const supabase = createClient()
        // Compress/normalize to JPEG before upload (fast + reliable on cellular)
        const blob = await compressImage(photoFile)
        const ctype = blob.type || 'image/jpeg'
        const fext = ctype === 'image/jpeg' ? 'jpg' : (ctype.split('/')[1] || 'jpg')
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fext}`
        const { error: uploadError } = await supabase.storage
          .from('notary-photos')
          .upload(filename, blob, { contentType: ctype, upsert: false })

        if (uploadError) {
          setError('Your photo couldn\'t upload. Please tap "Submit" again, or remove the photo — you can add it later.')
          return
        }
        photo_url = supabase.storage.from('notary-photos').getPublicUrl(filename).data.publicUrl
      } catch {
        setError('Your photo couldn\'t upload. Remove it and submit — you can add it after you\'re approved.')
        return
      }
    }

    // Referral tag — who sent them (from /r/<id> → /apply?ref=<id>)
    const ref = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null

    try {
      const res = await fetch('/api/notary-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photo_url, signing_types: signingTypes, availability, turnstileToken: captchaToken, ...(ref ? { ref } : {}) }),
      })
      if (res.status === 409) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'You\'ve already applied with this email — we have you on file!')
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Something went wrong. Please try again or email support@inksent.co.')
        return
      }
    } catch {
      setError('Network error submitting your application. Please check your connection and try again.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="bg-green-50 rounded-full p-5">
          <CheckCircle className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">You&apos;re on the list!</h2>
        <p className="text-gray-500 max-w-sm">
          We review every application personally and will be in touch within 1&ndash;2 business days. Once you&apos;re approved, you&apos;ll start receiving text messages when signings are available in your area.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* Photo */}
      <section>
        <p className="text-sm font-semibold text-gray-700 mb-1">Your Photo <span className="text-gray-400 font-normal">(optional)</span></p>
        <p className="text-xs text-gray-400 mb-3">A clear headshot helps, but it&apos;s not required to apply — you can add it after you&apos;re approved.</p>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden
              ${photoPreview ? 'border-violet-300' : 'border-gray-300 hover:border-violet-400 bg-gray-50'}`}
          >
            {photoPreview
              ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              : <Camera size={24} className="text-gray-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 border border-violet-200 bg-violet-50 rounded-lg px-4 py-2.5 transition-colors"
            >
              <Upload size={14} /> {photoFile ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-gray-400 mt-2">JPG or PNG, up to 10MB. You can take one right now on your phone.</p>
            {photoFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> Photo added</p>}
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
          </div>
          {photoPreview && (
            <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="name" label="Full Name *" placeholder="Jane Smith"
            error={errors.name?.message} {...register('name')} />
          <Input id="phone" label="Cell Phone *" placeholder="(619) 555-0100"
            error={errors.phone?.message}
            {...register('phone', { onChange: (e) => setValue('phone', formatPhone(e.target.value)) })} />
        </div>
        <Input id="email" label="Email *" type="email" placeholder="jane@email.com"
          error={errors.email?.message} {...register('email')} />
        <p className="text-xs text-gray-400 -mt-1">Job offers come by text to your cell. Make sure it&apos;s a number that receives SMS.</p>
      </section>

      {/* Coverage — the critical dispatch fields */}
      <section>
        <p className="text-sm font-semibold text-gray-700 mb-1">Your Coverage Area <span className="text-violet-600">*</span></p>
        <p className="text-xs text-gray-400 mb-3">
          This is how we match you to signings. Just give us your home base and how far you&apos;ll drive — we&apos;ll text you any job within that range.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input id="base_zip" label="Home / Office ZIP *" placeholder="92101"
              maxLength={5} inputMode="numeric"
              error={errors.base_zip?.message}
              {...register('base_zip', { onChange: (e) => lookupCity(e.target.value) })} />
            {cityLabel && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={11} /> {cityLabel}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How far will you travel? *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('coverage_radius')}>
              <option value="10">Up to 10 miles</option>
              <option value="20">Up to 20 miles</option>
              <option value="30">Up to 30 miles</option>
              <option value="50">Up to 50 miles</option>
            </select>
            {errors.coverage_radius && <p className="text-xs text-red-500 mt-1">{errors.coverage_radius.message}</p>}
          </div>
        </div>
      </section>

      {/* Experience & credentials */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Experience &amp; Credentials</p>
        <p className="text-xs text-gray-400 -mt-2">We work with title companies, so signing experience matters. More experienced agents get priority for jobs.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="years_experience" label="Years as a Signing Agent *" placeholder="3"
            type="number" min="0" max="50"
            error={errors.years_experience?.message} {...register('years_experience')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Signings Completed *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('signings_completed')}>
              <option value="">Select...</option>
              <option value="under_50">Under 50</option>
              <option value="50_200">50 – 200</option>
              <option value="200_500">200 – 500</option>
              <option value="500_plus">500+</option>
            </select>
            {errors.signings_completed && <p className="text-xs text-red-500 mt-1">{errors.signings_completed.message}</p>}
          </div>
        </div>

        {/* Real-estate competence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">How experienced are you with real-estate loan signings (purchases &amp; refinances)? *</label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            {...register('re_experience')}>
            <option value="">Select...</option>
            <option value="expert">Very experienced — I handle purchases &amp; refinances regularly</option>
            <option value="comfortable">Comfortable — I&apos;ve completed many full loan packages</option>
            <option value="some">Some experience — a handful of loan signings</option>
            <option value="new">New to loan signings</option>
          </select>
          {errors.re_experience && <p className="text-xs text-red-500 mt-1">{errors.re_experience.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Which signings are you experienced with? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[['purchase', 'Purchase'], ['refinance', 'Refinance'], ['heloc', 'HELOC'], ['reverse_mortgage', 'Reverse Mortgage'], ['loan_mod', 'Loan Modification']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => toggleSigningType(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${signingTypes.includes(val) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-300 hover:border-violet-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">When are you generally available? <span className="text-gray-400 font-normal">(select all that apply)</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[['weekday_day', 'Weekdays (daytime)'], ['weekday_evening', 'Weekday evenings'], ['weekends', 'Weekends'], ['same_day', 'Same-day / last-minute']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => toggleAvailability(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${availability.includes(val) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-300 hover:border-violet-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NNA Certified? *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('nna_certified')}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.nna_certified && <p className="text-xs text-red-500 mt-1">{errors.nna_certified.message}</p>}
            {nnaCertified === 'yes' && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">NNA cert renewal date *</label>
                <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  {...register('nna_cert_expiry')} />
                {errors.nna_cert_expiry && <p className="text-xs text-red-500 mt-1">{errors.nna_cert_expiry.message}</p>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Checked? *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('background_checked')}>
              <option value="">Select...</option>
              <option value="yes">Yes — within last 2 years</option>
              <option value="no">No / not current</option>
            </select>
            {errors.background_checked && <p className="text-xs text-red-500 mt-1">{errors.background_checked.message}</p>}
            {bgChecked === 'yes' && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Date completed *</label>
                <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  {...register('bgc_date')} />
                {errors.bgc_date && <p className="text-xs text-red-500 mt-1">{errors.bgc_date.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* E&O insurance — title companies require it */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E&amp;O Insurance?</label>
          <p className="text-xs text-gray-400 mb-1">Errors &amp; Omissions coverage. Required before your first paid signing — you can add it after you&apos;re approved.</p>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            {...register('eo_insured')}>
            <option value="">Select...</option>
            <option value="yes">Yes — I carry E&amp;O</option>
            <option value="no">No</option>
          </select>
          {errors.eo_insured && <p className="text-xs text-red-500 mt-1">{errors.eo_insured.message}</p>}
          {eoInsured === 'yes' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carrier *</label>
                <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="NNA, Notary Shield…" {...register('eo_carrier')} />
                {errors.eo_carrier && <p className="text-xs text-red-500 mt-1">{errors.eo_carrier.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Coverage amount ($) * <span className="text-gray-400 font-normal">min $25k</span></label>
                <input type="number" min="25000" step="5000" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="25000" {...register('eo_coverage_amount')} />
                {errors.eo_coverage_amount && <p className="text-xs text-red-500 mt-1">{errors.eo_coverage_amount.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expires *</label>
                <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  {...register('eo_expiry')} />
                {errors.eo_expiry && <p className="text-xs text-red-500 mt-1">{errors.eo_expiry.message}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Notary commission — required */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission state *</label>
            <input maxLength={2} placeholder="CA" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase"
              {...register('commission_state_code')} />
            {errors.commission_state_code && <p className="text-xs text-red-500 mt-1">{errors.commission_state_code.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission expires *</label>
            <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('commission_expiry')} />
            {errors.commission_expiry && <p className="text-xs text-red-500 mt-1">{errors.commission_expiry.message}</p>}
          </div>
        </div>
      </section>

      {/* Optional notes */}
      <section>
        <Textarea id="notes" label="Anything else? (optional)"
          placeholder="Other certifications, languages you speak, availability, etc."
          {...register('notes')} />
      </section>

      {/* SMS consent — OPTIONAL (A2P 10DLC compliant). You can submit this
          application without checking it; it just turns on faster job-offer texts. */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Optional — you can apply without this</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            {...register('sms_consent')} />
          <span className="text-sm text-gray-600">
            <strong>Optional:</strong> I agree to receive SMS text messages from Inksent about signing jobs and my account. Consent is not a condition of applying or working with us — leave this unchecked and we&apos;ll reach you by email instead. Message frequency varies; message &amp; data rates may apply. Reply STOP to opt out, HELP for help. See our{' '}
            <a href="/privacy" target="_blank" className="text-violet-600 underline">Privacy Policy</a> and{' '}
            <a href="/terms" target="_blank" className="text-violet-600 underline">Terms</a>.
          </span>
        </label>
      </section>

      {/* Independent Contractor Agreement */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            {...register('ic_agreement')} />
          <span className="text-sm text-gray-600">
            I have read and agree to the{' '}
            <a href="/notary-agreement" target="_blank" className="text-violet-600 underline">Independent Contractor Agreement</a>. I understand I am an independent contractor (not an employee), I set my own schedule, I&apos;m responsible for my own taxes and insurance, and I maintain a valid notary commission.
          </span>
        </label>
        {errors.ic_agreement && <p className="text-xs text-red-500 mt-2 ml-7">{errors.ic_agreement.message}</p>}
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <Turnstile onToken={setCaptchaToken} />

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Join the Network'}
      </Button>

      <p className="text-center text-xs text-gray-400">
        After you&apos;re approved, we&apos;ll collect a few more details (W-9, payment info) before your first job.
      </p>
    </form>
  )
}
