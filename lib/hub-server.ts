import { createAuthClient, createClient } from './supabase/server'
import type { HubUser } from './hub'

/** Lowercased email of the logged-in Supabase Auth user, or null. */
export async function getSessionEmail(): Promise<string | null> {
  const auth = await createAuthClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  return user?.email?.toLowerCase() ?? null
}

/** Is this email one of Inksent's approved (free) agents? */
export async function isRosterNotary(email: string): Promise<boolean> {
  const db = await createClient()
  const { data } = await db.from('notaries').select('id').ilike('email', email).maybeSingle()
  return !!data
}

export async function findHubUser(email: string): Promise<HubUser | null> {
  const db = await createClient()
  const { data } = await db.from('hub_users').select('*').ilike('email', email).maybeSingle()
  return (data as HubUser) ?? null
}

/** Find or create the hub_user for an email, optionally updating profile fields. */
export async function upsertHubUser(
  email: string,
  fields: Partial<Pick<HubUser, 'name' | 'base_zip'>> = {}
): Promise<HubUser> {
  const db = await createClient()
  const existing = await findHubUser(email)
  if (existing) {
    if (Object.keys(fields).length) {
      const { data } = await db.from('hub_users').update(fields).eq('id', existing.id).select('*').single()
      return data as HubUser
    }
    return existing
  }
  const { data } = await db
    .from('hub_users')
    .insert({ email: email.toLowerCase(), ...fields })
    .select('*')
    .single()
  return data as HubUser
}
