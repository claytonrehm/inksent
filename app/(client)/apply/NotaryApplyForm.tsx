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

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  base_zip: z.string().regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP'),
  coverage_radius: z.string().min(1, 'Select how far you\'ll travel'),
  years_experience: z.string().min(1, 'Required'),
  signings_completed: z.string().min(1, 'Please select'),
  nna_certified: z.enum(['yes', 'no'], { message: 'Please select' }),
  background_checked: z.enum(['yes', 'no'], { message: 'Please select' }),
  notes: z.string().optional(),
  sms_consent: z.literal(true, { message: 'Required to receive job offers' }),
})
type FormData = z.infer<typeof schema>

export default function NotaryApplyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [cityLabel, setCityLabel] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { coverage_radius: '20' },
  })

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
    if (!photoFile) { setPhotoError('A photo is required so we know who we are dispatching'); return }
    setError(null)

    let photo_url: string
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
        setError('Your photo couldn\'t upload. Please tap "Submit" again, or try a different photo.')
        return
      }
      photo_url = supabase.storage.from('notary-photos').getPublicUrl(filename).data.publicUrl
    } catch {
      setError('Your photo couldn\'t upload. Please check your connection and tap "Submit" again.')
      return
    }

    try {
      const res = await fetch('/api/notary-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photo_url }),
      })
      if (res.status === 409) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'You\'ve already applied with this email — we have you on file!')
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Something went wrong. Please try again or email orders@inksent.co.')
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
          We review every application personally and will be in touch within 7 days. Once you&apos;re approved, you&apos;ll start receiving text messages when signings are available in your area.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* Photo */}
      <section>
        <p className="text-sm font-semibold text-gray-700 mb-1">Your Photo <span className="text-violet-600">*</span></p>
        <p className="text-xs text-gray-400 mb-3">A clear headshot so we know who&apos;s representing us at the signing table.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NNA Certified? *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('nna_certified')}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No — but working on it</option>
            </select>
            {errors.nna_certified && <p className="text-xs text-red-500 mt-1">{errors.nna_certified.message}</p>}
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
          </div>
        </div>
      </section>

      {/* Optional notes */}
      <section>
        <Textarea id="notes" label="Anything else? (optional)"
          placeholder="Other certifications, languages you speak, availability, etc."
          {...register('notes')} />
      </section>

      {/* SMS consent */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            {...register('sms_consent')} />
          <span className="text-sm text-gray-600">
            I agree to receive SMS text messages from Inksent about signing jobs and my account. Message frequency varies; message &amp; data rates may apply. Reply STOP to opt out. See our{' '}
            <a href="/privacy" target="_blank" className="text-violet-600 underline">Privacy Policy</a> and{' '}
            <a href="/terms" target="_blank" className="text-violet-600 underline">Terms</a>.
          </span>
        </label>
        {errors.sms_consent && <p className="text-xs text-red-500 mt-2 ml-7">{errors.sms_consent.message}</p>}
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Join the Network'}
      </Button>

      <p className="text-center text-xs text-gray-400">
        After you&apos;re approved, we&apos;ll collect a few more details (W-9, payment info) before your first job.
      </p>
    </form>
  )
}
