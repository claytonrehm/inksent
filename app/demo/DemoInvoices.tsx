'use client'

import { useState } from 'react'
import { X, FileText, CreditCard } from 'lucide-react'

export type DemoInvoice = {
  inv: string; signer: string; type: string; date: string; loc: string
  amount: string; status: 'Paid' | 'Due'
}

export default function DemoInvoices({ invoices, company }: { invoices: DemoInvoice[]; company: string }) {
  const [sel, setSel] = useState<DemoInvoice | null>(null)
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
        <div className="flex items-center gap-2 mb-3"><FileText size={16} className="text-violet-600" /><h3 className="font-bold text-gray-900">Invoices</h3></div>
        <div className="space-y-1">
          {invoices.map((iv) => (
            <button key={iv.inv} onClick={() => setSel(iv)} className="w-full flex justify-between items-center text-sm py-2 px-2 -mx-2 rounded-lg hover:bg-violet-50/60 transition-colors text-left">
              <span className="text-gray-600">{iv.inv} · {iv.signer}</span>
              <span className={`font-medium ${iv.status === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>{iv.status === 'Paid' ? 'Paid' : 'Pay now →'}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Pay by card, check, or ACH — net 30 available. Click an invoice to view it.</p>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Invoice {sel.inv}</h3>
                <p className="text-xs text-gray-400">Billed to {company}</p>
              </div>
              <button onClick={() => setSel(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Signer</p><p className="font-medium text-gray-800">{sel.signer}</p></div>
                <div><p className="text-xs text-gray-400">Type</p><p className="font-medium text-gray-800">{sel.type}</p></div>
                <div><p className="text-xs text-gray-400">Date</p><p className="font-medium text-gray-800">{sel.date}</p></div>
                <div><p className="text-xs text-gray-400">Location</p><p className="font-medium text-gray-800">{sel.loc}</p></div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600"><span>Notary signing fee</span><span>{sel.amount}</span></div>
                <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-100"><span>Total</span><span>{sel.amount}</span></div>
              </div>

              {sel.status === 'Paid' ? (
                <div className="bg-green-50 text-green-700 text-sm font-medium rounded-lg px-4 py-3 text-center">✓ Paid — thank you</div>
              ) : (
                <button className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 flex items-center justify-center gap-2">
                  <CreditCard size={16} /> Pay {sel.amount} by card or ACH
                </button>
              )}
              <p className="text-center text-xs text-gray-400">Sample invoice · in your live portal this opens a secure Stripe payment.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
