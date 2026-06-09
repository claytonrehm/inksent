# Inksent — Architecture

A technical overview of how the application is structured, the patterns it follows, and an honest assessment of what's solid and what to watch as it scales.

---

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js (App Router)** — React server components, route handlers |
| Language | **TypeScript** (strict) |
| Data | **Supabase** (Postgres + Storage), Row-Level Security on |
| Payments | **Stripe** (Checkout/Payment Links + **Connect** payouts) |
| Messaging | **Twilio** (SMS/voice), **Resend** (transactional email) |
| Maps | **Leaflet** + OpenStreetMap (no API key); `zipcodes` for geocoding |
| Bot defense | **Cloudflare Turnstile** (CAPTCHA) + honeypot |
| UI | **Tailwind v4**, **Framer Motion**, **lucide-react** |
| Hosting | **Vercel** (serverless functions + cron) |

**Design principle:** thin HTTP routes, business logic in `lib/`, least-privilege data access, and a self-healing automation layer so the business runs hands-off.

---

## 2. High-level shape

```
Browser (4 audiences)                Serverless (Next.js)              External
┌────────────────────┐   fetch /api  ┌───────────────────────┐        ┌──────────┐
│ Public / Title /   │ ───────────▶  │ Route handlers (thin) │ ─────▶ │ Stripe   │
│ Notary / Admin UIs │               │   └─ validate (zod)   │        │ Twilio   │
│ (RSC + client cpts)│ ◀───────────  │   └─ lib/* (domain)   │ ─────▶ │ Resend   │
└────────────────────┘   HTML/JSON   │   └─ supabase (svc)   │        │ Leaflet  │
                                     └───────────┬───────────┘        └──────────┘
        Vercel Cron ──────────────────────────▶  │  (escalate: dispatch SLA,
                                                  ▼   payment reconcile, payout
                                          ┌───────────────┐   retry, doc purge)
                                          │ Supabase (PG) │
                                          │  + Storage    │
                                          │  RLS enabled  │
                                          └───────────────┘
```

---

## 3. Directory structure

```
app/
  (admin)/      Operator console — gated by layout (login + 2FA)
  (client)/     Title-company + notary self-serve (order, apply, onboard, track, portal)
  (notary)/     Tokenized job pages (accept, complete, docs)
  (legal)/      Terms, privacy, FAQ, IC agreement
  api/          Route handlers (REST-ish), grouped by resource
  page.tsx      Public marketing home
  layout.tsx    Root shell
lib/            Domain logic + integrations (the real "backend")
  supabase/     Three data clients (server/admin/browser)
components/      Presentational + interactive UI; ui/ = primitives
supabase/migrations/   Versioned, idempotent SQL (source of truth for schema)
```

**Route groups partition the app by audience**, each with its own trust boundary:
- `(admin)` — fully authenticated (session cookie + 2FA), gated in the group `layout.tsx`.
- `(client)` / `(notary)` — public or **capability-token** access (unguessable UUID in the URL).
- `(legal)` — static content.

---

## 4. Data layer

Three deliberately separate Supabase clients, by privilege (`lib/supabase/`):

| Client | Key | Used for | RLS |
|---|---|---|---|
| `server.ts → createClient()` | **service-role** | all trusted server reads/writes | bypasses |
| `server.ts → createAuthClient()` | anon + cookies | reading the logged-in portal user's session | enforced |
| `admin.ts → createAdminClient()` | **service-role** | Storage signed URLs / privileged storage ops | bypasses |
| `client.ts → createClient()` | anon (browser) | direct uploads to Storage from the browser | enforced |

**Security model:** RLS is enabled, so the public anon key can't read/write tables. Only server code holding the service-role key touches data — and that key never reaches the browser. This is the core guarantee that PII can't be dumped via the public REST endpoint.

### Schema (source of truth: `supabase/migrations/`, idempotent, versioned)
- **`notaries`** — identity, credentials (NNA, commission, E&O w/ expiries), `base_zip` + `coverage_radius`, `availability[]`, `stripe_account_id` + `payouts_enabled`, vetting fields (`re_experience`, `signing_types[]`), lifecycle (`active`, `onboarded_at`, `denied_at`), reliability counters.
- **`orders`** — the central aggregate. Status machine (`pending → dispatching → assigned → confirmed → completed | cancelled`), parties (signer/client), property, **fees in integer cents**, `notary_id` assignment, `dispatched_to[]` / `declined_by[]`, and a **rich timestamp audit trail** (`dispatched_at`, `accepted_at`, `en_route_at`, `arrived_at`, `completed_at`, `client_paid_at`, `notary_paid_at`, `refunded_at`, `issue_reported_at`, `overdue_alerted_at`).
- **`notary_cancellations`, `notary_ratings`** — quality/reliability history.

Money is **always stored in cents as integers** (no floats). Order state is a DB-level `CHECK` constraint. The timestamp trail means most reporting/audit needs are answered without a separate event log.

---

## 5. API layer

Route handlers under `app/api/` are **thin**: parse → validate (zod) → authorize → delegate to `lib/` → respond. Three authorization models, applied per route's trust boundary:

1. **Admin-gated** (`isAdminAuthed()`): dispatch, status, pay-client, pay-notary, refund, release, rate, deny, notaries CRUD, order GET. Anything that mutates broadly or exposes data.
2. **Capability-token** (UUID in URL/body): notary-facing accept/decline/complete/onboard/experience/progress/report, and client upload/track. The unguessable order/notary UUID *is* the bearer credential — the same pattern as Calendly or email-unsubscribe links. Sensitive ones (docs) add a second check (assignment + status), so a reassigned/cancelled order locks out the old holder.
3. **Public + abuse-gated** (order create, notary apply): Turnstile CAPTCHA + honeypot + first-order hold.

**Webhooks** (`stripe/webhook`, `twilio/*`) are **signature-verified** (Stripe signing secret; Twilio `X-Twilio-Signature`). **Cron** (`cron/escalate`) is `CRON_SECRET`-gated.

---

## 6. Authentication & authorization

- **Admin:** password → emailed 6-digit code (2FA) → **HMAC-signed httpOnly session cookie** (`lib/admin-auth.ts`). The 2FA pending token is *stateless* — an HMAC of `code+expiry`, so the code is never stored server-side. `timingSafeEqual` for comparisons. The `(admin)` group layout enforces the gate on every page.
- **Portal (title company):** Supabase Auth (magic link), read via the cookie-aware `createAuthClient()` — the one path where RLS is actually exercised on behalf of a user.
- **Notary/client actions:** capability tokens (above).

---

## 7. Domain logic (`lib/`) — the real backend

| Module | Responsibility |
|---|---|
| `dispatch.ts` | Coverage matching + broadcast to every covering, **payout-ready, credential-valid** agent (email + SMS), atomic acceptance support |
| `stripe.ts` | Connect onboarding links, payouts (transfers), payment links, refunds, payment reconciliation search |
| `email.ts` / `sms.ts` | All transactional messaging templates + send wrappers |
| `invoice.ts` | Invoice generation + payment reminders |
| `notary.ts` | Applicant vetting/scoring (tiers, pros/cons) |
| `coverage.ts` | ZIP → lat/lng + radius coverage math |
| `validations.ts` | zod schemas (single source of input-shape truth) |
| `admin-auth.ts`, `turnstile.ts`, `twilioValidate.ts` | Auth + request-authenticity helpers |

Integrations are isolated here, so routes and UI never talk to Stripe/Twilio/Resend directly — swappable and testable in principle.

---

## 8. Automation (the self-healing engine)

A single Vercel **cron** (`cron/escalate`) runs the passive operations that make the business hands-off:
1. **Dispatch SLA** — alert when an order is unaccepted/unassigned past threshold.
2. **No-show detection** — assigned signing whose time passed without completion.
3. **Money safety-net** — reconcile missed payment webhooks from Stripe; **retry stuck/deferred payouts** until funds clear.
4. **Invoice dunning** — reminders + escalation.
5. **Document retention** — purge loan packages 14 days post-completion (GLBA/CCPA + storage hygiene).

Event-driven where possible (Stripe webhook auto-pays the notary the instant a client pays); the cron is the **safety net** that catches anything the happy path missed.

---

## 9. Frontend

- **React Server Components by default** — pages fetch with the service-role client server-side and render HTML; client components (`'use client'`) only where interaction is needed (forms, maps, animations).
- **Design system:** `components/ui/` primitives (button/input/select/textarea) + composed feature components. Tailwind utility styling, Framer Motion for motion, a consistent violet/indigo dark aesthetic.
- **Maps** are dynamically imported (Leaflet is browser-only) to avoid SSR issues.

---

## 10. Architectural assessment

### ✅ Strengths
- **Clean separation of concerns** — audience-partitioned routes, thin handlers, domain logic in `lib/`, integrations isolated.
- **Least-privilege data access** — RLS on; service-role confined to the server; distinct clients per privilege level.
- **Consistent, well-chosen patterns** — capability tokens, zod validation, money-in-cents, DB-enforced state machine, idempotent migrations.
- **Defense in depth** — gated APIs, signed webhooks, secret-gated cron, CAPTCHA/honeypot, doc access control + retention.
- **Resilience built in** — atomic accept, payout retry, payment reconciliation, no-show detection — the system self-corrects.
- **Strong auditability** — per-order timestamp trail covers reporting, disputes, and tax with no extra infrastructure.

### ⚠️ Watch-items / future tech-debt (none blocking)
- **Two service-role clients** (`server.createClient` and `admin.createAdminClient`) overlap; could consolidate to one privileged factory.
- **`createClient` name is reused** across `supabase/server.ts` (service-role) and `supabase/client.ts` (browser). Import paths disambiguate, but the shared name invites mistakes — a rename (e.g., `createServiceClient` / `createBrowserClient`) would be clearer.
- **Capability tokens are bearer credentials** — a deliberate, acceptable trade-off, but anyone with the link can act. Sensitive flows already add status/assignment checks; keep that discipline for any new token route.
- **Time stored without timezone** (`date`/`time`) — fine single-region (PT); revisit before multi-timezone expansion.
- **One daily cron doing many jobs** — fine at current volume; at scale, increase frequency (Vercel Pro → ~1 min) and consider splitting into queued, per-order scheduled tasks (Inngest/QStash).
- **Reports page loads all orders** — needs pagination/date-windowing at thousands of rows.
- **No automated test suite** — the biggest maturity gap. Domain logic in `lib/` is structured to be unit-testable; adding tests around dispatch, payout, and reconciliation would lock in the resilience guarantees.
- **`notaries/[id]` PATCH accepts an arbitrary body** (admin-only) — low risk, but whitelisting updatable fields would harden it.

### Verdict
The architecture is **sound and clean** for its stage: a security-first, integration-isolated, server-rendered app with a resilient automation core. The watch-items are normal scaling/maturity concerns, not structural flaws — none require rework, and each has a clear, incremental path.
