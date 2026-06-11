import InksentLogo from '@/components/InksentLogo'

export const metadata = { title: 'Thank you — Inksent' }

export default async function FeedbackThanks({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams
  const down = r === 'down'
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8"><InksentLogo size="md" href="/" /></div>
      <div className="text-5xl mb-4">{down ? '🙏' : '🎉'}</div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Thank you for the feedback!</h1>
      <p className="text-gray-500 max-w-sm">
        {down
          ? 'We&apos;re sorry it wasn&apos;t perfect — someone from our team will reach out to make it right.'
          : 'We&apos;re thrilled the signing went well. We&apos;d love to handle your next closing.'}
      </p>
    </main>
  )
}
