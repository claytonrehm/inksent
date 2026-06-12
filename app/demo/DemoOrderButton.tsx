'use client'

import { useState } from 'react'
import { X, CheckCircle2, Truck } from 'lucide-react'

// "New Signing Order" for the demo — opens a realistic order form in a modal and
// shows a sample dispatch confirmation. Self-contained so a prospect can see the
// ordering experience WITHOUT hitting the real /order endpoint (which would create
// a live order and text real agents).
//
// Layout: flex column with a fixed header + footer and a scrollable field area, so
// the Place Order button is always visible. data-lenis-prevent stops the global
// smooth-scroll (Lenis) from hijacking the wheel inside the modal.
const TYPES = ['Purchase', 'Refinance', 'HELOC', 'Reverse Mortgage', 'Loan Modification', 'Seller Package']

function tomorrow() {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
}

export default function DemoOrderButton() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<{ conf: string; signer: string; city: string } | null>(null)

  function close() {
    setOpen(false)
    setResult(null)
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const signer = ((fd.get('signer') as string) || 'your signer').trim()
    const city = ((fd.get('city') as string) || 'the area').trim()
    const rand = Math.floor(100000 + Math.random() * 900000)
    setResult({ conf: `ND-2606${rand}`, signer, city })
  }

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
  const label = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700">
        + New Signing Order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={close}>
          <div
            data-lenis-prevent
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (fixed) */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-black text-gray-900">New Signing Order</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            {result ? (
              <div className="p-6 text-center overflow-y-auto">
                <div className="bg-green-50 rounded-full p-4 w-fit mx-auto mb-4"><CheckCircle2 className="text-green-500 w-10 h-10" /></div>
                <h4 className="text-xl font-black text-gray-900 mb-1">Order placed!</h4>
                <p className="text-sm text-gray-500 mb-4">Confirmation <span className="font-mono text-gray-700">{result.conf}</span></p>
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-left text-sm text-gray-700 flex gap-3">
                  <Truck size={18} className="text-violet-600 shrink-0 mt-0.5" />
                  <span>We&apos;re texting every covering agent in {result.city} right now — first to accept wins, usually within ~30 minutes. You&apos;ll get a live tracking link for {result.signer}&apos;s signing.</span>
                </div>
                <p className="text-xs text-gray-400 mt-4">This is a sample — in your live portal, placing an order really dispatches to your vetted, insured agents.</p>
                <button onClick={close} className="mt-5 bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-violet-700">Done</button>
              </div>
            ) : (
              <>
                {/* Scrollable fields */}
                <form id="demoOrderForm" onSubmit={submit} className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                  <p className="text-sm text-gray-500">Pre-filled with sample data — just hit <strong className="text-gray-700">Place Order</strong> to see what happens next.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={label}>Your file / order #</label><input name="ref" defaultValue="SUM-26-1092" className={input} /></div>
                    <div><label className={label}>Signing type</label><select name="type" defaultValue="Refinance" className={input}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                  </div>
                  <div><label className={label}>Signer name(s)</label><input name="signer" defaultValue="Daniel & Erin Foster" className={input} /></div>
                  <div><label className={label}>Property address</label><input name="address" defaultValue="1420 Seacoast Dr" className={input} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={label}>City</label><input name="city" defaultValue="Imperial Beach" className={input} /></div>
                    <div><label className={label}>ZIP</label><input name="zip" defaultValue="91932" className={input} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={label}>Date</label><input name="date" type="date" defaultValue={tomorrow()} className={input} /></div>
                    <div><label className={label}>Time</label><input name="time" type="time" defaultValue="14:00" className={input} /></div>
                  </div>
                  <div><label className={label}>Special instructions (optional)</label><textarea name="notes" rows={2} className={input} placeholder="Gate code, bilingual needed, etc." /></div>
                </form>

                {/* Footer (fixed, always visible) */}
                <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-100 shrink-0">
                  <span className="text-sm text-gray-500">Flat <strong className="text-gray-900">$185</strong> · ~30-min confirmation</span>
                  <button type="submit" form="demoOrderForm" className="bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-violet-700 shrink-0">Place Order</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
