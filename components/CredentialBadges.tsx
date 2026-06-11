import { credentialItems, type CredStatus, type NotaryCreds } from '@/lib/credentials'

const STYLES: Record<CredStatus, string> = {
  valid: 'bg-green-50 text-green-700 border-green-200',
  expiring: 'bg-amber-50 text-amber-700 border-amber-200',
  expired: 'bg-red-50 text-red-700 border-red-200',
  missing: 'bg-gray-50 text-gray-400 border-gray-200',
  untracked: 'bg-blue-50 text-blue-600 border-blue-200',
}
const MARK: Record<CredStatus, string> = { valid: '✓', expiring: '!', expired: '✕', missing: '–', untracked: '?' }

// Compact at-a-glance credential status next to a notary's name (NNA / BG / E&O /
// commission). Hover for the full status message. Pure server component.
export default function CredentialBadges({ notary }: { notary: NotaryCreds }) {
  const items = credentialItems(notary)
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((c) => (
        <span
          key={c.key}
          title={c.message}
          className={`inline-flex items-center gap-0.5 border rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${STYLES[c.status]}`}
        >
          {c.short} {MARK[c.status]}
        </span>
      ))}
    </div>
  )
}
