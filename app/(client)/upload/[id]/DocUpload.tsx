'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileText, CheckCircle, X, Loader2 } from 'lucide-react'

export default function DocUpload({ orderId, existing }: { orderId: string; existing: { name: string }[] }) {
  const [uploaded, setUploaded] = useState<{ name: string }[]>(existing)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const modeRef = useRef<'add' | 'replace'>('add')

  function pick(mode: 'add' | 'replace') {
    if (mode === 'replace' && !confirm('Replace the entire package? The previous documents will be permanently removed and the new ones sent to the assigned notary. Use this when the lender sends an updated package.')) return
    modeRef.current = mode
    fileRef.current?.click()
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setError(null)
    setBusy(true)
    const supabase = createClient()
    const newDocs: { name: string; path: string }[] = []

    try {
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) { setError(`${file.name} is over 50MB.`); continue }
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${orderId}/${Date.now()}-${safe}`
        const { error: upErr } = await supabase.storage.from('signing-docs').upload(path, file, {
          contentType: file.type || 'application/octet-stream', upsert: false,
        })
        if (upErr) { setError(`Couldn't upload ${file.name}. Please try again.`); continue }
        newDocs.push({ name: file.name, path })
      }

      if (newDocs.length > 0) {
        const res = await fetch(`/api/orders/${orderId}/documents`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documents: newDocs, mode: modeRef.current }),
        })
        if (!res.ok) { setError('Uploaded, but could not finalize. Please refresh and check.'); }
        else if (modeRef.current === 'replace') setUploaded(newDocs.map((d) => ({ name: d.name })))
        else setUploaded((prev) => [...prev, ...newDocs.map((d) => ({ name: d.name }))])
      }
    } catch {
      setError('Upload failed. Check your connection and try again.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
      modeRef.current = 'add'
    }
  }

  return (
    <div>
      {uploaded.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploaded.map((d, i) => (
            <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
              <CheckCircle size={15} className="text-green-500 shrink-0" />
              <FileText size={14} className="text-gray-400 shrink-0" />
              <span className="text-gray-700 truncate">{d.name}</span>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".pdf,application/pdf,image/*" multiple onChange={handleFiles} className="hidden" />
      <button
        onClick={() => pick('add')}
        disabled={busy}
        className="w-full border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50/50 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors disabled:opacity-60"
      >
        {busy ? <Loader2 size={26} className="text-violet-500 animate-spin" /> : <Upload size={26} className="text-violet-500" />}
        <span className="text-sm font-semibold text-violet-700">{busy ? 'Uploading...' : uploaded.length > 0 ? 'Add more documents' : 'Upload document package'}</span>
        <span className="text-xs text-gray-400">PDF preferred · up to 50MB each · multiple files OK</span>
      </button>

      {uploaded.length > 0 && !busy && (
        <button onClick={() => pick('replace')} className="w-full mt-2 text-center text-sm font-medium text-gray-500 hover:text-violet-700 underline">
          Lender sent an update? Replace the entire package
        </button>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-3 flex items-center gap-2"><X size={14} />{error}</p>}

      {uploaded.length > 0 && !busy && (
        <p className="text-sm text-green-700 mt-4 text-center font-medium">
          ✓ Documents received. The assigned notary gets them automatically — and any replacement instantly swaps the old set.
        </p>
      )}
    </div>
  )
}
