import { redirect } from 'next/navigation'

// Short referral link an agent shares: inksent.co/r/<their-id> → the apply form,
// tagged with who referred them.
export const metadata = { robots: { index: false, follow: false } }

export default async function ReferralLink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/apply?ref=${encodeURIComponent(id)}`)
}
