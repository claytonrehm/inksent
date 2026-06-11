import { credentialItems, type CredStatus, type NotaryCreds } from '@/lib/credentials'

// Clean traffic-light: green = good, yellow = needs attention (expiring / not on
// file), red = expired. One calm scheme that reads at a glance on any theme.
function tone(status: CredStatus): 'green' | 'yellow' | 'red' {
  if (status === 'valid') return 'green'
  if (status === 'expired') return 'red'
  return 'yellow' // expiring, missing, or untracked
}
const STYLES: Record<'green' | 'yellow' | 'red', string> = {
  green: 'bg-green-600 text-white',
  yellow: 'bg-amber-500 text-white',
  red: 'bg-red-600 text-white',
}

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
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${STYLES[tone(c.status)]}`}
        >
          {c.short}
        </span>
      ))}
    </div>
  )
}
