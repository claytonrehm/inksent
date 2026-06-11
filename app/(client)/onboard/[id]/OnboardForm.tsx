'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, FileText, Camera, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/compress-image'

const schema = z.object({
  nna_number: z.string().optional(),
  nna_cert_expiry: z.string().min(1, 'Required — your NNA certification renewal date'),
  commission_state_code: z.string().min(2, 'Required'),
  commission_expiry: z.string().min(1, 'Required'),
  bgc_provider: z.string().optional(),
  bgc_date: z.string().min(1, 'Required — when your background check was completed'),
  eo_carrier: z.string().optional(),
  eo_policy: z.string().optional(),
  eo_expiry: z.string().optional(),
  has_dual_tray: z.enum(['yes', 'no'], { message: 'Please select' }),
  ic_acknowledged: z.literal(true, { message: 'Required' }),
})
type FormData = z.infer<typeof schema>

const LANGUAGES = ['Spanish', 'Mandarin', 'Vietnamese', 'Tagalog', 'Korean', 'Other']

export default function OnboardForm({ notaryId, notaryName, hasPhoto, isUpdate = false, defaults }: {
  notaryId: string
  notaryName: string
  hasPhoto: boolean
  isUpdate?: boolean
  defaults?: Record<string, unknown>
}) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [languages, setLanguages] = useState<string[]>(Array.isArray(defaults?.languages) ? (defaults!.languages as string[]) : [])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: (defaults ?? {}) as unknown as Partial<FormData>,
  })

  function toggleLang(l: string) {
    setLanguages((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l])
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const looksImage = file.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name)
    if (!looksImage) { setPhotoError('Please choose a photo (JPG, PNG, or HEIC)'); return }
    if (file.size > 25 * 1024 * 1024) { setPhotoError('That photo is very large — please choose one under 25MB'); return }
    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function onSubmit(data: FormData) {
    setError(null)

    // Photo is required here only if we don't already have one on file from the application.
    let photo_url: string | undefined
    if (!hasPhoto) {
      if (!photoFile) { setPhotoError('A clear headshot is required before your first job — it\'s who we tell the client to expect.'); return }
      try {
        const supabase = createClient()
        const blob = await compressImage(photoFile)
        const ctype = blob.type || 'image/jpeg'
        const fext = ctype === 'image/jpeg' ? 'jpg' : (ctype.split('/')[1] || 'jpg')
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fext}`
        const { error: uploadError } = await supabase.storage.from('notary-photos').upload(filename, blob, { contentType: ctype, upsert: false })
        if (uploadError) { setError('Your photo couldn\'t upload. Please tap "Complete My Profile" again, or try a different photo.'); return }
        photo_url = supabase.storage.from('notary-photos').getPublicUrl(filename).data.publicUrl
      } catch {
        setError('Your photo couldn\'t upload. Please check your connection and try again.'); return
      }
    }

    const res = await fetch(`/api/notaries/${notaryId}/onboard`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, languages, ...(photo_url ? { photo_url } : {}) }),
    })
    if (!res.ok) { setError('Something went wrong. Please try again or email support@inksent.co.'); return }
    setDone(true)
  }

  if (done && isUpdate) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="bg-green-50 rounded-full p-5"><CheckCircle className="text-green-500 w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-gray-900">Updated — thank you!</h2>
        <p className="text-gray-500 max-w-sm">
          Thanks, {notaryName.split(' ')[0]}. Your info is refreshed and you&apos;re all set to keep receiving signings. No further action needed.
        </p>
        <a href={`/agent/${notaryId}`} className="text-sm text-violet-600 font-semibold hover:underline">View your dashboard →</a>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="bg-green-50 rounded-full p-5"><CheckCircle className="text-green-500 w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-gray-900">One last step!</h2>
        <p className="text-gray-500 max-w-sm">
          Thanks, {notaryName.split(' ')[0]}. Now set up automatic payouts so your $90 lands in your bank after each signing — no waiting, no invoicing.
        </p>
        <a href={`/onboard/${notaryId}/connect`} className="w-full max-w-xs bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition-colors">
          Set Up Automatic Payouts →
        </a>
        <p className="text-xs text-gray-400 max-w-sm">Your tax details (W-9 equivalent) are collected securely by Stripe during payout setup — nothing to email.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {/* Photo — only when we don't already have one from the application */}
      {!hasPhoto && (
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-1">Your Photo <span className="text-violet-600">*</span></p>
          <p className="text-xs text-gray-400 mb-3">A clear headshot — it&apos;s who we tell the client to expect at the table.</p>
          <div className="flex items-start gap-4">
            <div onClick={() => fileRef.current?.click()}
              className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors shrink-0 overflow-hidden ${photoPreview ? 'border-violet-300' : 'border-gray-300 hover:border-violet-400 bg-gray-50'}`}>
              {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={24} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 border border-violet-200 bg-violet-50 rounded-lg px-4 py-2.5 transition-colors">
                <Upload size={14} /> {photoFile ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-2">JPG or PNG. You can take one right now on your phone.</p>
              {photoFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> Photo added</p>}
              {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
            </div>
            {photoPreview && (
              <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={16} /></button>
            )}
          </div>
        </section>
      )}

      {/* Commission / NNA */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Commission &amp; Certification</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="nna_number" label="NNA Member Number" placeholder="If you have one (optional)"
            error={errors.nna_number?.message} {...register('nna_number')} />
          <Input id="nna_cert_expiry" label="NNA Cert Renewal Date *" type="date"
            error={errors.nna_cert_expiry?.message} {...register('nna_cert_expiry')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="commission_state_code" label="Commission State *" placeholder="CA"
            error={errors.commission_state_code?.message} {...register('commission_state_code')} />
          <Input id="commission_expiry" label="Commission Expires *" type="date"
            error={errors.commission_expiry?.message} {...register('commission_expiry')} />
        </div>
      </section>

      {/* Background check */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Background Check</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="bgc_provider" label="Provider" placeholder="NNA, Sterling, etc." {...register('bgc_provider')} />
          <Input id="bgc_date" label="Date Completed *" type="date"
            error={errors.bgc_date?.message} {...register('bgc_date')} />
        </div>
      </section>

      {/* E&O Insurance */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">E&amp;O Insurance</p>
        <p className="text-xs text-gray-400 -mt-2">Have a policy? Add it here. Don&apos;t carry E&amp;O yet? Leave this blank — you can add it before your first job. It&apos;s strongly recommended and many title clients require it.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="eo_carrier" label="Carrier" placeholder="Notary Shield, NNA, etc."
            error={errors.eo_carrier?.message} {...register('eo_carrier')} />
          <Input id="eo_policy" label="Policy Number" placeholder="(optional)" {...register('eo_policy')} />
          <Input id="eo_expiry" label="Policy Expires" type="date"
            error={errors.eo_expiry?.message} {...register('eo_expiry')} />
        </div>
      </section>

      {/* Equipment */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-1">Do you have a dual-tray laser printer? *</label>
        <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          {...register('has_dual_tray')}>
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {errors.has_dual_tray && <p className="text-xs text-red-500 mt-1">{errors.has_dual_tray.message}</p>}
        <p className="text-xs text-gray-400 mt-1">Loan packages often need legal + letter paper. Not required, but it widens the jobs you can take.</p>
      </section>

      {/* Languages */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-1">Languages you speak fluently (besides English)</label>
        <p className="text-xs text-gray-400 mb-2">We&apos;ll match you to signings that need these — more jobs for you.</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button key={l} type="button" onClick={() => toggleLang(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${languages.includes(l) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-300 hover:border-violet-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section className="bg-violet-50 border border-violet-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-900">How you&apos;ll get paid</p>
        <p className="text-sm text-gray-600 mt-1">
          Payouts are sent by <b>secure direct deposit</b> — automatically, once the client pays for the signing (no chasing checks). After you submit this profile, the next step is a 2-minute bank connection through our payments partner, <b>Stripe</b>.
        </p>
      </section>

      {/* Tax note */}
      <section className="bg-violet-50 border border-violet-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-violet-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Taxes are handled for you.</strong> Stripe securely collects your tax info during payout setup (no W-9 to email), and issues your 1099-NEC if you earn $600+ in a year.
          </p>
        </div>
      </section>

      {/* Agreements */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" {...register('ic_acknowledged')} />
          <span className="text-sm text-gray-600">I confirm I work as an <strong>independent contractor</strong>, responsible for my own taxes, transportation, supplies, and insurance.</span>
        </label>
        {errors.ic_acknowledged && <p className="text-xs text-red-500 ml-7">{errors.ic_acknowledged.message}</p>}
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Complete My Profile'}
      </Button>
    </form>
  )
}
