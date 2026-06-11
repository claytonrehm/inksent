import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'

type ActorType = 'admin' | 'system' | 'notary' | 'client'

export interface AuditEvent {
  action: string
  actor?: string | null
  actorType?: ActorType
  entityType?: string | null
  entityId?: string | null
  ip?: string | null
  success?: boolean
  meta?: Record<string, unknown> | null
}

// Pull the best-available client IP from request headers.
export function reqIp(req: { headers: Headers }): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() ?? null
}

// Append one row to the audit trail. ALWAYS best-effort: logging must never throw
// or block the action it's recording. No-ops cleanly if the service role / table
// isn't available yet (pre-migration).
export async function logAudit(e: AuditEvent): Promise<void> {
  try {
    if (!hasServiceRole()) return
    const admin = createAdminClient()
    await admin.from('audit_log').insert({
      action: e.action,
      actor: e.actor ?? 'system',
      actor_type: e.actorType ?? 'system',
      entity_type: e.entityType ?? null,
      entity_id: e.entityId ?? null,
      ip: e.ip ?? null,
      success: e.success ?? true,
      meta: e.meta ?? null,
    })
  } catch {
    /* never let auditing break a flow */
  }
}
