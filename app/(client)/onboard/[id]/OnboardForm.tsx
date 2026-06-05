'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  nna_number: z.string().min(3, 'Required'),
  commission_state_code: z.string().min(2, 'Required'),
  commission_expiry: z.string().min(1, 'Required'),
  bgc_provider: z.string().optional(),
  bgc_date: z.string().optional(),
  eo_carrier: z.string().min(2, 'Required'),
  eo_policy: z.string().optional(),
  eo_expiry: z.string().min(1, 'Required'),
  has_dual_tray: z.enum(['yes', 'no'], { message: 'Please select' }),
  payment_method: z.string().min(1, 'Please select'),
  payment_handle: z.string().min(2, 'Required'),
  w9_acknowledged: z.literal(true, { message: 'Required' }),
  ic_acknowledged: z.literal(true, { message: 'Required' }),
})
type FormData = z.infer<typeof schema>

export default function OnboardForm({ notaryId, notaryName }: { notaryId: string; notaryName: string }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const method = watch('payment_method')

  async function onSubmit(data: FormData) {
    setError(null)
    const res = await fetch(`/api/notaries/${notaryId}/onboard`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { setError('Something went wrong. Please try again or email orders@inksent.co.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="bg-green-50 rounded-full p-5"><CheckCircle className="text-green-500 w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-gray-900">Profile complete!</h2>
        <p className="text-gray-500 max-w-sm">
          Thanks, {notaryName.split(' ')[0]}. You&apos;re fully set up and ready for jobs. Don&apos;t forget to email your signed W-9 to orders@inksent.co before your first signing.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {/* Commission / NNA */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">Commission &amp; Certification</p>
        <Input id="nna_number" label="NNA Member Number *" placeholder="12345678"
          error={errors.nna_number?.message} {...register('nna_number')} />
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
          <Input id="bgc_date" label="Date Completed" type="date" {...register('bgc_date')} />
        </div>
      </section>

      {/* E&O Insurance */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">E&amp;O Insurance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="eo_carrier" label="Carrier *" placeholder="Notary Shield, NNA, etc."
            error={errors.eo_carrier?.message} {...register('eo_carrier')} />
          <Input id="eo_policy" label="Policy Number" placeholder="(optional)" {...register('eo_policy')} />
          <Input id="eo_expiry" label="Policy Expires *" type="date"
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

      {/* Payment */}
      <section className="space-y-4">
        <p className="text-sm font-semibold text-gray-700">How should we pay you?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method *</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              {...register('payment_method')}>
              <option value="">Select...</option>
              <option value="zelle">Zelle</option>
              <option value="venmo">Venmo</option>
              <option value="paypal">PayPal</option>
              <option value="check">Check (mailed)</option>
            </select>
            {errors.payment_method && <p className="text-xs text-red-500 mt-1">{errors.payment_method.message}</p>}
          </div>
          <Input id="payment_handle"
            label={method === 'check' ? 'Mailing Address *' : 'Handle / Email *'}
            placeholder={method === 'check' ? '123 Main St, San Diego CA 92101' : '@janesmith or jane@email.com'}
            error={errors.payment_handle?.message} {...register('payment_handle')} />
        </div>
      </section>

      {/* W-9 */}
      <section className="bg-violet-50 border border-violet-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">W-9 Required</p>
            <p className="text-sm text-gray-600 mt-0.5">
              Download, complete, and email your W-9 to <strong>orders@inksent.co</strong> before your first signing.{' '}
              <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline font-medium">Download W-9 (IRS)</a>
            </p>
          </div>
        </div>
      </section>

      {/* Agreements */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" {...register('w9_acknowledged')} />
          <span className="text-sm text-gray-600">I will email my completed <strong>W-9</strong> to orders@inksent.co. Earnings of $600+/year are reported on a 1099-NEC.</span>
        </label>
        {errors.w9_acknowledged && <p className="text-xs text-red-500 ml-7">{errors.w9_acknowledged.message}</p>}
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
