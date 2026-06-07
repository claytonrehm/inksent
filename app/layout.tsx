import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://inksent.co'),
  title: 'Inksent — Signing Agents, On Demand',
  description: 'Vetted, NNA-certified notary signing agents — confirmed in ~30 minutes, with automatic backup if anyone cancels.',
  openGraph: {
    title: 'Inksent — Signing Agents, On Demand',
    description: 'Vetted notary signing agents, confirmed in ~30 minutes, with automatic backup if anyone cancels.',
    url: 'https://inksent.co',
    siteName: 'Inksent',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inksent — Signing Agents, On Demand',
    description: 'Vetted notary signing agents, confirmed in ~30 minutes, with automatic backup if anyone cancels.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}
