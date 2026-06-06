'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'

export default function CompleteForm({ orderId, notaryId }: { orderId: string; notaryId: string }) {
  const [done, setDone] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [scans, setScans] = useState<{ name: string; path: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setError(null); setUploading(true)
    const supabase = createClient()
    try {
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) { setError(`${file.name} is over 50MB`); continue }
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `scan-backs/${orderId}/${Date.now()}-${safe}`
        const { error: upErr } = await supabase.storage.from('signing-docs').upload(path, file, {
          contentType: file.type || 'application/octet-stream',
        })
        if (upErr) { setError(`Couldn't upload ${file.name}`); continue }
        setScans((p) => [...p, { name: file.name, path }])
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function submit() {
    setSubmitting(true); setError(null)
    const res = await fetch(`/api/orders/${orderId}/complete`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notary_id: notaryId, scan_backs: scans }),
    })
    setSubmitting(false)
    if (!res.ok) { setError('Something went wrong. Please try again or text (619) 949-3361.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Signing complete — thank you!</h2>
        <p className="text-gray-500 text-sm">We&apos;ve got it from here. Your payment will be processed. 🎉</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Scan-backs (optional)</p>
        <p className="text-xs text-gray-400 mb-2">Upload photos or a PDF of the signed documents if required for this signing.</p>
        {scans.map((s, i) => (
          <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm mb-2">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <FileText size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-700 truncate">{s.name}</span>
          </div>
        ))}
        <input ref={fileRef} type="file" accept=".pdf,image/*" multiple onChange={handleFiles} className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 hover:border-violet-400 rounded-xl py-5 flex flex-col items-center gap-1.5 transition-colors disabled:opacity-60">
          {uploading ? <Loader2 size={22} className="text-violet-500 animate-spin" /> : <Upload size={22} className="text-gray-400" />}
          <span className="text-sm font-medium text-gray-600">{uploading ? 'Uploading...' : 'Upload scan-backs'}</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <Button onClick={submit} loading={submitting} disabled={uploading} size="lg" className="w-full">
        <CheckCircle size={16} className="mr-2" /> Mark Signing Complete
      </Button>
      <p className="text-center text-xs text-gray-400">This confirms you completed the signing and notifies our team.</p>
    </div>
  )
}
