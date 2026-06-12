import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionEmail, findHubUser } from '@/lib/hub-server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const email = await getSessionEmail()
  if (!email) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  const hubUser = await findHubUser(email)
  if (!hubUser) return NextResponse.json({ error: 'no account' }, { status: 403 })

  const db = await createClient()
  // Scope the delete to this user's own jobs — can't touch anyone else's.
  const { error } = await db.from('hub_jobs').delete().eq('id', id).eq('hub_user_id', hubUser.id)
  if (error) return NextResponse.json({ error: 'could not delete' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
