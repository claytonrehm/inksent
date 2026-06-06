import Link from 'next/link'

function InksentIcon({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  // "Send Drop" mark: ink drop + an upward "sent" arrow (ink + sent).
  const bg = dark ? '#7c5cff' : '#5B4FCF'
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill={bg} />
      <path d="M20 6C20 6 29 17.5 29 24.5C29 29.75 24.97 34 20 34C15.03 34 11 29.75 11 24.5C11 17.5 20 6 20 6Z" fill="white" />
      <path d="M20 28.5V20.5M20 20.5L16.8 23.7M20 20.5L23.2 23.7" stroke={bg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function InksentLogo({
  size = 'md',
  href = '/',
  dark = false,
}: {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  dark?: boolean
}) {
  const iconSize = { sm: 24, md: 32, lg: 40 }[size]
  const textClass = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group">
      <InksentIcon size={iconSize} dark={dark} />
      <span className={`font-black ${textClass} tracking-tight leading-none`}>
        <span className={dark ? 'text-white' : 'text-gray-900'}>ink</span>
        <span className={dark ? 'text-violet-300' : 'text-violet-600'}>sent</span>
      </span>
    </Link>
  )
}
