/**
 * End-to-end lifecycle test for the notary bench — runs the REAL decision logic
 * (lib/credentials, lib/coverage) plus each route's exact field-mapping, walking a
 * notary from application → approval → self-service credential submission → coverage
 * → dispatch. No production writes, no SMS — pure logic, safe to run anytime.
 *
 *   npx tsx scripts/e2e-lifecycle.ts
 *
 * Mirrors:
 *   - app/api/notary-apply/route.ts          (insert mapping, active:false)
 *   - app/api/notaries/[id]/route.ts PATCH   (approve → active:true)
 *   - app/api/notaries/[id]/onboard/route.ts (self-service creds + flag-flip fix)
 *   - app/api/coverage/route.ts              (active + onboarded + fullyCredentialed)
 *   - lib/dispatch.ts                        (dispatch eligibility filter)
 */
import { credentialItems, fullyCredentialed, credentialsEligible } from '../lib/credentials'
import { notaryCoversZip } from '../lib/coverage'

// ── tiny test harness ──────────────────────────────────────────────────────
let passed = 0, failed = 0
function check(label: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${label}`) }
  else { failed++; console.log(`  \x1b[31m✗ FAIL\x1b[0m ${label}${detail ? `  — ${detail}` : ''}`) }
}
function section(t: string) { console.log(`\n\x1b[1m${t}\x1b[0m`) }
const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86_400_000).toISOString().slice(0, 10)

// Dates relative to "now" so the test never goes stale.
const VALID_FUTURE = iso(400)   // comfortably valid (well past the 30-day window)
const EXPIRING_SOON = iso(15)   // still valid, but inside the 30-day window
const EXPIRED = iso(-10)        // lapsed
const BGC_RECENT = iso(-30)     // bg check 30 days ago → valid for ~11 more months

type N = Record<string, unknown>

// ── route field-mappings (copied verbatim from the route handlers) ──────────

// app/api/notary-apply/route.ts — what an application inserts.
function applyIngest(input: { name: string; base_zip: string; radius: number; nna_certified: 'yes' | 'no'; background_checked: 'yes' | 'no' }): N {
  return {
    name: input.name, base_zip: input.base_zip, coverage_radius: input.radius,
    nna_certified: input.nna_certified === 'yes',
    background_checked: input.background_checked === 'yes',
    active: false, onboarded_at: null,
  }
}

// app/api/notaries/[id]/route.ts PATCH — admin approval.
function approve(n: N): N { return { ...n, active: true, approved_at: new Date().toISOString() } }

// app/api/notaries/[id]/onboard/route.ts — self-service credential submission,
// INCLUDING the flag-flip fix (providing a date attests to that credential).
function onboardSubmit(n: N, d: { nna_cert_expiry?: string; commission_expiry?: string; bgc_date?: string; eo_carrier?: string; eo_expiry?: string }): N {
  return {
    ...n,
    commission_expiry: d.commission_expiry || null,
    bgc_date: d.bgc_date || null,
    eo_carrier: d.eo_carrier || null,
    eo_expiry: d.eo_expiry || null,
    ...(d.nna_cert_expiry ? { nna_certified: true } : {}),       // ← the fix
    ...(d.bgc_date ? { background_checked: true } : {}),         // ← the fix
    nna_cert_expiry: d.nna_cert_expiry || null,
    onboarded_at: new Date().toISOString(),
  }
}

// app/api/coverage/route.ts — who counts toward advertised coverage for a ZIP.
function coveredForZip(bench: N[], zip: string): N[] {
  return bench
    .filter((n) => n.active === true && n.onboarded_at != null)
    .filter((n) => credentialsEligible(n))
    .filter((n) => notaryCoversZip(n.base_zip as string, n.coverage_radius as number, zip))
}

// lib/dispatch.ts — who an order actually blasts to.
function dispatchEligible(bench: N[], zip: string): N[] {
  return bench.filter((n) => n.active === true && n.onboarded_at && credentialsEligible(n) && notaryCoversZip(n.base_zip as string, n.coverage_radius as number, zip))
}

const SD = '92101'   // San Diego — agent base
const LA = '90012'   // Los Angeles — ~120mi, out of a 25mi radius

// ════════════════════════════════════════════════════════════════════════════
console.log('\x1b[1m\nNOTARY LIFECYCLE — END-TO-END\x1b[0m')

// ── STAGE 1: Ingest ─────────────────────────────────────────────────────────
section('1. Ingest — applicant submits (no creds yet, like a real signup)')
let agent = applyIngest({ name: 'Test Agent', base_zip: SD, radius: 25, nna_certified: 'no', background_checked: 'no' })
check('record created inactive (active:false)', agent.active === false)
check('not onboarded yet (onboarded_at null)', agent.onboarded_at == null)
check('not fully credentialed', fullyCredentialed(agent) === false)
check('does NOT count toward coverage (honest: applied ≠ staffable)', coveredForZip([agent], SD).length === 0)

// ── STAGE 2: Approve ────────────────────────────────────────────────────────
section('2. Approve — admin flips active:true')
agent = approve(agent)
check('now active', agent.active === true)
check('approved_at stamped (drives onboarding-nudge cron)', typeof agent.approved_at === 'string')
check('STILL not on coverage (approved but no creds/onboard)', coveredForZip([agent], SD).length === 0)

// ── STAGE 3: Self-service credential submission (the chase link) ─────────────
section('3. Self-service — agent provides all 4 creds via /onboard/[id]?update=1')
agent = onboardSubmit(agent, {
  nna_cert_expiry: VALID_FUTURE, commission_expiry: VALID_FUTURE, bgc_date: BGC_RECENT,
  eo_carrier: 'Biberk', eo_expiry: VALID_FUTURE,
})
const items = credentialItems(agent)
check('nna_certified auto-set true by providing NNA date (THE FIX)', agent.nna_certified === true)
check('background_checked auto-set true by providing BG date (THE FIX)', agent.background_checked === true)
check('onboarded_at now stamped', agent.onboarded_at != null)
for (const c of items) check(`badge ${c.short} = green (valid)`, c.status === 'valid', `got '${c.status}'`)
check('fullyCredentialed → TRUE', fullyCredentialed(agent) === true)

// ── STAGE 4: Coverage + dispatch ────────────────────────────────────────────
section('4. Coverage + dispatch — fully-green agent becomes staffable')
check('appears on coverage for its ZIP', coveredForZip([agent], SD).length === 1)
check('does NOT cover an out-of-radius ZIP (LA, ~120mi)', coveredForZip([agent], LA).length === 0)
check('is dispatch-eligible for its ZIP', dispatchEligible([agent], SD).length === 1)

// ── REGRESSION: the exact bug we just fixed ─────────────────────────────────
section('5. Regression — date-only (old behavior) would have stayed grey')
const oldBehavior = { ...approve(applyIngest({ name: 'X', base_zip: SD, radius: 25, nna_certified: 'no', background_checked: 'no' })),
  nna_cert_expiry: VALID_FUTURE, commission_expiry: VALID_FUTURE, bgc_date: BGC_RECENT, background_checked: true,
  eo_carrier: 'Biberk', eo_expiry: VALID_FUTURE, onboarded_at: new Date().toISOString() } // note: nna_certified NOT flipped
check('OLD: NNA date present but flag false → badge "missing" (grey)', credentialItems(oldBehavior).find((c) => c.key === 'nna')!.status === 'missing')
check('OLD: would be WRONGLY excluded from coverage', coveredForZip([oldBehavior], SD).length === 0)
check('NEW: same submit through the fix → green & covered', coveredForZip([agent], SD).length === 1)

// ── NEGATIVE / HONESTY tests ────────────────────────────────────────────────
section('6. Honesty guards — incomplete/expired agents must NOT be advertised')
const missingCommission = { ...agent, commission_expiry: null }
check('missing 1 credential (commission) → dropped from coverage', coveredForZip([missingCommission], SD).length === 0)
const expiredEO = { ...agent, eo_expiry: EXPIRED }
check('expired E&O → dropped from coverage', coveredForZip([expiredEO], SD).length === 0)
const notOnboarded = { ...agent, onboarded_at: null }
check('active + fully-green but not onboarded → not advertised', coveredForZip([notOnboarded], SD).length === 0)

// ── Expiring-window policy: keep working until actual expiry ─────────────────
section('7. Expiring window — still valid until the date → keeps working, only drops at expiry')
const expiringNNA = { ...agent, nna_cert_expiry: EXPIRING_SOON }
check('NNA expiring in 15 days reads as "expiring" (yellow badge)', credentialItems(expiringNNA).find((c) => c.key === 'nna')!.status === 'expiring')
check('expiring agent STAYS coverage-eligible (no early drop)', coveredForZip([expiringNNA], SD).length === 1)
check('expiring agent STAYS dispatch-eligible', dispatchEligible([expiringNNA], SD).length === 1)
check('but strict fullyCredentialed (all-green admin view) = false', fullyCredentialed(expiringNNA) === false)
const lapsedNNA = { ...agent, nna_cert_expiry: EXPIRED }
check('once ACTUALLY expired → drops from coverage', coveredForZip([lapsedNNA], SD).length === 0)
check('once ACTUALLY expired → drops from dispatch', dispatchEligible([lapsedNNA], SD).length === 0)

// ── summary ─────────────────────────────────────────────────────────────────
console.log(`\n\x1b[1mRESULT:\x1b[0m \x1b[32m${passed} passed\x1b[0m, ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : '0 failed'}`)
process.exit(failed > 0 ? 1 : 0)
