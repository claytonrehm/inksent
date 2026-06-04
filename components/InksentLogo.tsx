import Link from 'next/link'

function InksentIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#5B4FCF" />
      {/* Kite / diamond */}
      <path d="M20 8 L30 20 L20 27 L10 20 Z" fill="white" opacity="0.95" />
      {/* Dot */}
      <circle cx="20" cy="31" r="2" fill="white" opacity="0.65" />
    </svg>
  )
}

export default function InksentLogo({
  size = 'md',
  href = '/',
}: {
  size?: 'sm' | 'md' | 'lg'
  href?: string
}) {
  const iconSize = { sm: 24, md: 32, lg: 40 }[size]
  const textClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size]

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group">
      <InksentIcon size={iconSize} />
      <span className={`font-black ${textClass} tracking-tight leading-none`}>
        <span className="text-gray-900">ink</span>
        <span className="text-violet-600">sent</span>
      </span>
    </Link>
  )
}
