import { credentialItems, type CredStatus, type NotaryCreds } from '@/lib/credentials'

// Solid, saturated colors so the chips stay legible on light, dark, or
// browser-auto-darkened backgrounds (the admin renders dark for some users).
const STYLES: Record<CredStatus, string> = {
  valid: 'bg-green-600 text-white border-green-700',
  expiring: 'bg-amber-500 text-white border-amber-600',
  expired: 'bg-red-600 text-white border-red-700',
  missing: 'bg-gray-400 text-white border-gray-500',
  untracked: 'bg-sky-500 text-white border-sky-600',
}
const MARK: Record<CredStatus, string> = { valid: '✓', expiring: '!', expired: '✕', missing: '–', untracked: '?' }

// Compact at-a-glance credential status next to a notary's name (NNA / BG / E&O /
// commission). Hover any chip for the exact status. Pure server component.
export default function CredentialBadges({ notary }: { notary: NotaryCreds }) {
  const items = credentialItems(notary)
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((c) => (
        <span
          key={c.key}
          title={c.message}
          className={`inline-flex items-center gap-0.5 border rounded px-1.5 py-0.5 text-[11px] font-bold leading-none shadow-sm ${STYLES[c.status]}`}
        >
          {c.short}&nbsp;{MARK[c.status]}
        </span>
      ))}
    </div>
  )
}
