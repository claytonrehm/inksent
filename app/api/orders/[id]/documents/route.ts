import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { sendNotaryDocsEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { documents, mode } = await req.json()
  if (!Array.isArray(documents) || documents.length === 0) {
    return NextResponse.json({ error: 'No documents' }, { status: 400 })
  }
  const replace = mode === 'replace'

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id, documents, notary_id, signer_name, signing_date, client_company, notaries(name, email)')
    .eq('id', id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const oldDocs = (order.documents as { path?: string }[]) ?? []

  // REPLACE: delete the old files from storage so a stale package can never be
  // accessed, then set the new package. ADD: append to the existing package.
  if (replace && oldDocs.length > 0 && hasServiceRole()) {
    const paths = oldDocs.map((d) => d.path).filter(Boolean) as string[]
    if (paths.length) {
      await createAdminClient().storage.from('signing-docs').remove(paths).catch(() => {})
    }
  }
  const finalDocs = replace ? documents : [...oldDocs, ...documents]
  await supabase.from('orders').update({ documents: finalDocs }).eq('id', id)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'

  // If a notary is already assigned, deliver the (current) package to them now.
  // On replace, the email flags it as an update so they discard the old one.
  const notaryRaw = order.notaries as unknown
  const notary = (Array.isArray(notaryRaw) ? notaryRaw[0] : notaryRaw) as { name: string; email: string } | null
  if (order.notary_id && notary?.email) {
    sendNotaryDocsEmail({
      notaryName: notary.name,
      notaryEmail: notary.email,
      signerName: order.signer_name,
      docsUrl: `${baseUrl}/docs/${id}?notary=${order.notary_id}`,
      updated: replace,
    }).catch(console.error)
  }

  // Tell the admin docs arrived
  if (process.env.ADMIN_PHONE) {
    sendSMS(
      process.env.ADMIN_PHONE,
      `📄 Documents ${replace ? 'REPLACED' : 'uploaded'} for ${order.signer_name} (${order.client_company}).${order.notary_id ? ' Sent to assigned notary.' : ' Will auto-send when a notary accepts.'}`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true, count: finalDocs.length })
}
