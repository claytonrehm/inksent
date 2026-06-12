'use client'

import { useState } from 'react'
import { X, CheckCircle2, ShieldCheck, FileCheck2, MapPin } from 'lucide-react'

export type DemoOrder = {
  ref: string; conf: string; date: string; signer: string; loc: string
  agent: string; fee: string; status: string; color: string; type: string
}

const STEPS = ['Order received', 'Finding your agent', 'Agent confirmed', 'On the way', 'Signing complete']

// Which step is currently "active" for a given status (earlier steps = done).
function activeStep(status: string): number {
  switch (status) {
    case 'Finding Agent': return 1
    case 'Agent Confirmed': return 2
    case 'En Route': return 3
    case 'Completed': return 5 // all done
    default: return 1
  }
}

function agentName(agent: string): string {
  return agent.includes('—') ? agent.split('—')[1].trim() : agent
}

export default function DemoOrders({ orders }: { orders: DemoOrder[] }) {
  const [sel, setSel] = useState<DemoOrder | null>(null)
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Your Ref / Conf #</th>
              <th className="px-5 py-3 text-left">When</th>
              <th className="px-5 py-3 text-left">Signer</th>
              <th className="px-5 py-3 text-left">Location</th>
              <th className="px-5 py-3 text-left">Agent</th>
              <th className="px-5 py-3 text-left">Fee</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.conf} onClick={() => setSel(o)} className="hover:bg-violet-50/60 cursor-pointer transition-colors">
                <td className="px-5 py-3">
                  <div className="text-xs font-semibold text-gray-800">{o.ref}</div>
                  <div className="font-mono text-xs text-gray-400">{o.conf}</div>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-gray-700">{o.date}</td>
                <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">{o.signer}</td>
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{o.loc}</td>
                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{o.agent}</td>
                <td className="px-5 py-3 text-gray-900">{o.fee}</td>
                <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${o.color}`}>{o.status}</span></td>
                <td className="px-5 py-3 text-gray-300 text-right pr-5">›</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2 px-1">Tip: click any order to see its live status, agent, and documents.</p>

      {sel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div data-lenis-prevent className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-black text-gray-900">{sel.signer}</h3>
                <p className="text-xs text-gray-400">{sel.type} · {sel.ref}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sel.color}`}>{sel.status}</span>
                <button onClick={() => setSel(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">When</p><p className="font-medium text-gray-800">{sel.date}</p></div>
                <div><p className="text-xs text-gray-400">Fee</p><p className="font-medium text-gray-800">{sel.fee}</p></div>
                <div className="col-span-2 flex items-center gap-1.5"><MapPin size={13} className="text-violet-600" /><span className="text-gray-700">{sel.loc}</span></div>
                <div className="col-span-2"><p className="text-xs text-gray-400">Confirmation #</p><p className="font-mono text-xs text-gray-600">{sel.conf}</p></div>
              </div>

              {/* Agent */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned Agent</p>
                {sel.status === 'Finding Agent' ? (
                  <p className="text-sm text-amber-600 font-medium">Searching all covering agents — first to accept wins (usually ~30 min).</p>
                ) : (
                  <>
                    <p className="font-bold text-gray-900">{agentName(sel.agent)}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><ShieldCheck size={12} /> NNA-Certified · Background-checked · E&amp;O-insured</p>
                  </>
                )}
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</p>
                <div className="space-y-3">
                  {STEPS.map((label, i) => {
                    const done = i < activeStep(sel.status)
                    const active = i === activeStep(sel.status)
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? (active ? 'bg-blue-500' : 'bg-green-500') : active ? 'bg-blue-500' : 'bg-gray-200'}`}>
                          {(done || active) && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm ${active ? 'font-semibold text-blue-700' : done ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Documents */}
              <div className="flex items-center gap-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <FileCheck2 size={15} className="text-violet-600" />
                Document package uploaded &amp; delivered to the agent
                {sel.status === 'Completed' && <span className="text-green-600">· Scan-backs returned</span>}
              </div>

              {sel.status === 'Completed' && (
                <p className="text-xs text-gray-400">Invoice generated automatically and emailed on completion.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
