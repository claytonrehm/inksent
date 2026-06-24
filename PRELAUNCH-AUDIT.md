# Inksent — Pre-Launch Firm-Up Plan

A full review (security, money flow, operations, website, business model) done before integrating a real title company (Summit) or hiring a sales rep. **Overall: the product is well-built and secure at the core. The gaps are (A) money-safety edge cases, (B) reliability at real volume, (C) a few security/config items, (D) website trust/polish, and (E) the business/legal foundation.** Nothing is on fire — you're pre-launch — but these are what "doing it right" looks like.

Tags: 🔴 critical · 🟠 high · 🟡 medium · 🟢 low. Milestone: [REAL CLIENT] before any paying client · [SUMMIT] before Summit · [SALES] before hiring a rep.

---

## A. Money safety (code) — fix before any real money moves

- 🔴 [REAL CLIENT] **Add Stripe idempotency keys to notary transfers.** `lib/stripe.ts` `payoutNotary`/`payReferralBounty` call `transfers.create` with no idempotency key; webhook + cron overlap or a Stripe retry can pay a notary twice (straight loss). Fix: `{ idempotencyKey: 'payout_'+orderId }`. *Highest-ROI single fix.*
- 🔴 [REAL CLIENT] **Webhook event idempotency.** `app/api/stripe/webhook/route.ts` has no event-id dedup; replays re-stamp `client_paid_at` and can re-trigger payout. Fix: a `stripe_events(id pk)` table; insert event.id, return 200 on conflict.
- 🟠 [REAL CLIENT] **Refunds don't stop/reverse the notary payout.** `refund/route.ts` + cron payout query (`cron/escalate`) never check `refunded_at` — a client refunded before payout still auto-pays the notary; if already paid, it's a manual chase. Fix: add `.is('refunded_at', null)` to the payout query + webhook guard; store transfer id and `createReversal` when already paid.
- 🟠 [REAL CLIENT] **State guards on `pay-client` / refund.** `pay-client` re-stamps even if paid/refunded; refund has no "already refunded" check. Add guards.
- 🟡 [SALES] **Commission anchor can drift.** `lib/sales.ts` falls back to min `client_paid_at` as the 24-month anchor; webhook re-stamping moves it. Fix: always set `landed_at` on account creation (don't rely on the fallback) + fix webhook idempotency.

## B. Reliability at volume (code) — fix before a real client sends volume

- 🔴 [SUMMIT] **Email failures are counted as successful dispatch.** `lib/email.ts` never checks Resend's `{ error }`; with SMS down pre-A2P, a job can be marked "dispatched to 5" while reaching nobody. Fix: throw on `error` in each helper; alert when `blastCount===0`.
- 🔴 [REAL CLIENT] **Crons run once daily.** `vercel.json` has a single daily run — so the 30-min acceptance SLA, no-show/overdue detection, and missed-payment recovery are effectively non-functional. Fix: Vercel Pro + split fast (per-minute: stale-blast, overdue, unassigned-soon) vs. heavy (hourly: dunning, purge, payout retry).
- 🟠 [SUMMIT] **Manual dispatch routes are SMS-only + don't escalate.** `app/api/dispatch` and `dispatch/blast` send SMS only (dead pre-A2P), and blast never sets `dispatched_at` (so it never escalates). The "Reply YES to accept" instruction has no handler. Fix: route manual paths through `lib/dispatch.ts` (email+SMS), set `dispatched_at`, and remove/implement "Reply YES."
- 🟠 [SUMMIT] **Manual dispatch + accept skip credential re-check.** Manual routes trust passed ids; accept re-checks active/onboarded but not `credentialsEligible`. A lapsed-credential notary can be sent/claim a job. Fix: filter manual ids + re-check credentials at accept.
- 🟠 [REAL CLIENT] **No-show blind spot.** A job stuck in `dispatching` past its signing time isn't caught by the overdue check. Add a "time passed, still unassigned" alert.

## C. Security & config — fix before going live

- 🟠 [REAL CLIENT] **Admin secret fallback.** `lib/admin-auth.ts` falls back to literal `'dev-secret'` if `ADMIN_SESSION_SECRET`/`ADMIN_PASSWORD` unset → forgeable admin cookie. Fix: require the env var in prod, remove the fallback. Confirm it's set in Vercel.
- 🟠 [REAL CLIENT] **Stored XSS in the admin "new order" email.** `lib/email.ts sendAdminOrderAlert` interpolates raw public form input (incl. a `tel:` href). Fix: use the existing `esc()` on every field.
- 🟡 [REAL CLIENT] **Abuse protection fails open.** Turnstile + rate limiter both allow on misconfig; confirm `TURNSTILE_SECRET_KEY` + the rate-limit RPC are live in prod. Add Turnstile to partner-apply / support / signcheck-interest; add honeypot to notary-apply; make the rate-limit RPC `SECURITY DEFINER` + revoke from public.
- 🟡 [REAL CLIENT] **RLS not forced on 5 newer tables** (`hub_users`, `hub_jobs`, `audit_log`, `partner_applications`, `rate_limits`) — enabled but not FORCE+REVOKE'd. One migration to re-run force+revoke over all public tables.

(Verified solid: Stripe/Twilio webhook signatures fail-closed; admin login+2FA rate-limited; signing-docs private + signed URLs + path-scoped; 14-day NPI purge; sales tables fully locked; no secrets in NEXT_PUBLIC.)

## D. Website trust & polish — fix before Summit or candidates see it

- 🔴 [SUMMIT] **Kill the "All 50 States / nationwide" overpromise.** `app/page.tsx` (4 spots), `order/page.tsx`, `faq/page.tsx`, `USMap.tsx`, `HeroStats.tsx` claim nationwide coverage — contradicts reality (San Diego), your own `/about` page, and your structured data. This is the one thing that flatly violates your never-overpromise principle and is trivially checkable. Fix: "Headquartered in San Diego, expanding nationwide — check your ZIP"; drive the map from real coverage.
- 🟠 [SUMMIT] **Demo implies a real track record.** `demo/page.tsx` shows "98% on-time / 96% satisfaction / 47 signings / $25k+ verified." It's disclosed as sample, but a screenshot reads as fact. Soften to obviously-illustrative.
- 🟠 [REAL CLIENT] **E&O required-vs-optional contradiction.** Apply form hard-blocks without E&O; /join, onboard, and auto-approve treat it as optional → lost applicants. Make consistent (optional at apply, verify before payout).
- 🟡 [SALES] **Sales-apply polish:** duplicate "Select…" option in dropdowns; ack checkbox omits the advertised $15/$200/2-yr terms; `linkedin_url` accepts any string.
- 🟡 [REAL CLIENT] **Terms has no cancellation/refund policy;** payment-method copy inconsistent ("check" only in demo); order form swallows specific API errors; form a11y gaps (aria-required/invalid). 
- 🟢 No `/track` lookup entry; track page fragile (`split(':')`, meta-refresh); "verify credentials" overstates self-attestation.

## E. Business / legal / financial foundation — your actions (longest lead time)

- 🔴 [REAL CLIENT] **Form the LLC now.** You'd hold borrower NPI and dispatch to homes as a sole proprietor — personal assets exposed. Gates the business bank account + clean books.
- 🔴 [REAL CLIENT] **Resolve TN-vs-CA jurisdiction** (one CPA/attorney hour). Operating in CA likely triggers CA foreign registration + $800/yr franchise tax. Decide TN-LLC-foreign-registered vs CA-LLC before signing anything in CA.
- 🔴 [SUMMIT] **E&O + General Liability + Cyber insurance.** Summit will require a COI before sending a file; lenders often require cyber for NPI. Longest lead time — get quotes now (you have them), bind when Summit is real.
- 🟠 [SALES]+[REAL CLIENT] **AB5 classification opinion.** A commission-only CA salesperson is a textbook AB5 misclassification target; the non-solicit + playbook control cut against IC status. Have the attorney opine on the rep agreement (and glance at the notary IC agreement) before starting anyone.
- 🟠 [REAL CLIENT] **Confirm who files notary 1099s + collect W-9s.** Stripe Connect transfers don't automatically discharge your 1099-NEC duty; W-9 collection isn't in the onboarding flow. Confirm with Stripe + CPA; add W-9 capture if it's on you.
- 🟠 [SALES] **Make the signed-agreement a real gate (code).** `agreement_accepted_at`/`w9_received` are display-only checkboxes — `computeSalesData`/payout API don't check them. A rep could accrue/be paid without signing. Fix: block crediting/payout when agreement or W-9 is missing.
- 🟠 [SALES] **Build a true unit-economics model** with the rep cut + Stripe fees + net-30 float before committing to the 24-month residual. Margin is healthy on card-paid signings, thin on rep+net-30, negative on refund-after-payout.
- 🟡 [SALES] **Harden attribution.** `client_company` is free text — "Summit" vs "Summit Settlement" split one account, under-paying the rep and corrupting the bonus count. Add a company picker/merge + a crediting audit trail.
- 🟡 [REAL CLIENT] **Ops resilience:** Supabase paid plan + PITR backups; 2FA + password manager on all provider logins; a 1-page runbook so a backup operator could step in (you're the single point of failure).
- 🟡 [SUMMIT] **Don't build the ResWare connector on spec.** Zero ResWare code exists; it's weeks of work for one not-yet-paying account. Run Summit's first closings manually; build the multi-tenant connector only once Summit is proven and paying.
- 🟢 [SUMMIT] **A2P pending** — don't let Summit or the rep pitch the SMS features until it clears; email dispatch covers you meanwhile.
- 🟢 [SALES] **Add tests** around `lib/sales.ts` + `lib/dispatch.ts` — real money, currently untested.

---

## Recommended sequence

**Phase 0 — Foundation (do now; longest lead time):** CPA/attorney hour (jurisdiction + AB5 + 1099) → form LLC + business bank account → E&O/GL/cyber quotes in hand → Supabase PITR + provider 2FA → Vercel Pro + sub-daily cron.

**Phase 1 — Code hardening (no business dependency; pure wins):** money-safety pack (idempotency, refund guards) → reliability pack (email error check, fast cron, manual-dispatch fixes) → security pack (admin secret, XSS escape, RLS force, abuse protection) → website-honesty pack (50-states, demo stats, polish).

**Phase 2 — Prove Summit manually (the horse):** recruit SD bench → take Summit's orders by hand → clear A2P → get a reference.

**Phase 3 — Hire sales from strength (the cart):** attorney-reviewed signed agreement + W-9 (enforced in code) → unit-economics model → attribution hardening → onboard rep.

**Phase 4 — Scale-justified:** build the ResWare connector once Summit is proven and paying; add the test suite.
