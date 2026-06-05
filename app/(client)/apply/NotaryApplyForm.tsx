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

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone required'),
  zip_codes: z.string().min(3, 'At least one ZIP required'),
  nna_certified: z.enum(['yes', 'no'], { message: 'Required' }),
  nna_number: z.string().optional(),
  commission_state_code: z.string().min(2, 'Required'),
  background_checked: z.enum(['yes', 'no'], { message: 'Required' }),
  years_experience: z.string().optional(),
  notes: z.string().optional(),
  w9_acknowledged: z.literal(true, { message: 'Required' }),
  ic_acknowledged: z.literal(true, { message: 'Required' }),
})
type FormData = z.infer<typeof schema>

export default function NotaryApplyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const nnaCertified = watch('nna_certified')

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setPhotoError('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Photo must be under 5MB'); return }
    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: FormData) {
    if (!photoFile) { setPhotoError('A professional photo is required'); return }
    setError(null)

    const supabase = createClient()
    const ext = photoFile.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('notary-photos')
      .upload(filename, photoFile, { contentType: photoFile.type })

    if (uploadError) {
      setError('Photo upload failed. Please try again or email us at orders@inksent.co.')
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('notary-photos').getPublicUrl(filename)

    const res = await fetch('/api/notary-apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, photo_url: publicUrl }),
    })

    if (!res.ok) {
      setError('Something went wrong. Please email us at orders@inksent.co.')
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
        <h2 className="text-2xl font-bold text-gray-900">Application Received!</h2>
        <p className="text-gray-500 max-w-sm">
          We review every application personally and will reach out within 1–2 business days. Check your email for next steps.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* Photo */}
      <section>
        <p className="text-sm font-semibold text-gray-700 mb-3">Professional Photo *</p>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className={`w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden
              ${photoPreview ? 'border-violet-300' : 'border-gray-300 hover:border-violet-400 bg-gray-50'}`}
          >
            {photoPreview
              ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              : <Camera size={22} className="text-gray-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 border border-violet-200 bg-violet-50 rounded-lg px-4 py-2 transition-colors"
            >
              <Upload size={13} /> {photoFile ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-gray-400 mt-1.5">Clear headshot or professional photo. Max 5MB.</p>
            {photoFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> {photoFile.name}</p>}
            {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
          </div>
          {photoPreview && (
            <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={15} />
            </button>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Contact Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="name" label="Full Name *" placeholder="Jane Smith"
            error={errors.name?.message} {...register('name')} />
          <Input id="phone" label="Cell Phone *" placeholder="(619) 555-0100"
            error={errors.phone?.message}
            {...register('phone', { onChange: (e) => setValue('phone', formatPhone(e.target.value)) })} />
        </div>
        <Input id="email" label="Email *" type="email" placeholder="jane@email.com"
          error={errors.email?.message} {...register('email')} />
      </section>

      {/* Credentials */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Credentials</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NNA Certified? *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('nna_certified')}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No — but working on it</option>
            </select>
            {errors.nna_certified && <p className="text-xs text-red-500 mt-1">{errors.nna_certified.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Checked? *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('background_checked')}>
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.background_checked && <p className="text-xs text-red-500 mt-1">{errors.background_checked.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nnaCertified === 'yes' && (
            <Input id="nna_number" label="NNA Member Number (optional)" placeholder="12345678"
              {...register('nna_number')} />
          )}
          <Input id="commission_state_code" label="Commission State *" placeholder="CA"
            error={errors.commission_state_code?.message} {...register('commission_state_code')} />
          <Input id="years_experience" label="Years of Experience" placeholder="3"
            type="number" min="0" max="50" {...register('years_experience')} />
        </div>
      </section>

      {/* Coverage */}
      <section>
        <Input id="zip_codes" label="ZIP Codes You Cover *"
          placeholder="92101, 92103, 92110, 92130"
          error={errors.zip_codes?.message} {...register('zip_codes')} />
        <p className="text-xs text-gray-400 mt-1.5">Separate multiple ZIPs with commas. You can always update this later.</p>
      </section>

      {/* Notes */}
      <section>
        <Textarea id="notes" label="Anything else you'd like us to know (optional)"
          placeholder="Experience with loan packages, availability, certifications, etc."
          {...register('notes')} />
      </section>

      {/* Agreements */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Before you submit</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            {...register('w9_acknowledged')} />
          <span className="text-sm text-gray-600">
            I understand Inksent requires a <strong>W-9 form</strong> before my first assignment. Earnings of $600+ per year will be reported on a 1099-NEC.
          </span>
        </label>
        {errors.w9_acknowledged && <p className="text-xs text-red-500 ml-7">{errors.w9_acknowledged.message}</p>}

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            {...register('ic_acknowledged')} />
          <span className="text-sm text-gray-600">
            I understand I will work as an <strong>independent contractor</strong>, not an employee. I am responsible for my own taxes, transportation, and equipment.
          </span>
        </label>
        {errors.ic_acknowledged && <p className="text-xs text-red-500 ml-7">{errors.ic_acknowledged.message}</p>}
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </Button>

      <p className="text-center text-xs text-gray-400">
        We review every application personally. You&apos;ll hear back within 1–2 business days.
      </p>
    </form>
  )
}
