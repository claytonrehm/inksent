# Inksent — Build Log & Capabilities

A running record of what the platform does and what was added. Use this for your own reference, onboarding a future ops hire, and answering "can it do X?"

---

## Recent changes (2026-06-24) — pre-launch hardening (4 packs)
- **Money-safety:** Stripe idempotency keys on all notary transfers + referral bounties (no double-pay on webhook/cron overlap or retries); webhook event-id dedup (`stripe_events`); refunds never auto-pay a notary and auto-reverse the payout if already paid (`notary_transfer_id`); state guards on pay-client/refund; `client_paid_at`/`landed_at` give the commission tier a stable anchor. Migration `20260624120000_money_safety.sql`.
- **Reliability:** email helpers throw on Resend errors (a failed send is no longer counted as a delivered dispatch — critical while SMS/A2P is pending); dispatch alerts when it reaches zero agents; manual dispatch + blast now reach by email AND SMS and stamp `dispatched_at` so they escalate; accept re-checks credentials at claim time; new "missed signing" cron alert; dead "Reply YES" instruction removed.
- **Security:** admin session/2FA secret fails closed in prod (no `dev-secret` fallback); admin order email escapes public input (stored-XSS); honeypot on notary-apply; force RLS + revoke on every table + lock the rate-limit RPC to service_role. Migration `20260624130000_security_hardening.sql`.
- **Website honesty:** "all 50 states / nationwide" → honest "San Diego & Southern California, expanding" (homepage, order, FAQ, coverage map, hero stats); E&O optional at notary apply; sales-apply polish; cancellation/refund clause in Terms. Full review in `PRELAUNCH-AUDIT.md`.

## Recent changes (2026-06-24)
- **Tiered residual commission + applicant ranking/filters.** Sales-rep residual is now **$15/collected signing for the first 24 months per account, then $8/signing ongoing** (per-rep editable: `residual_months`, `residual_after_cents`; migration `20260624000000_sales_residual_tiers.sql`). Commission math is time-based per signing (window anchored at the account's landed date or first collected signing); rep detail shows the full/reduced split per account. $200 producer bonus at 25 signings is unchanged (once per account). Job post, `/sales-apply`, playbook, and `SALES-COMMISSION-AGREEMENT.md` updated to match. Applicants page (`/sales/applicants`) gained a **fit score + A/B/C tier** (weights title relationships > industry > B2B > tenure), a **metrics row**, and **filters** (status/tier/relationships/industry/B2B + search) with sort by fit/newest/name.

## Recent changes (2026-06-23)
- **Sales rep recruiting funnel.** Public application at `/sales-apply` (residual-income pitch + form: contact, location, sales/B2B/industry experience, existing title relationships, pitch; Turnstile + honeypot + rate-limited; required 100%-commission/1099 acknowledgment) → `/api/sales-apply` → `sales_rep_applications` table + admin email/SMS alert. Admin reviews at `/sales/applicants` (new vs reviewed, rolodex highlighted); **Approve creates a rep** with your standard terms and jumps to their page; Reject/Delete supported. New-applicant count shows as a badge on the **Sales** nav item and a banner on `/sales`. Reps now have an **onboarding checklist** on their detail page (agreement signed, W-9 on file, payment method/details, fully-onboarded flag) — W-9/SSN intentionally collected off-platform by email. Migration `20260623120000_sales_rep_applications.sql` (+ onboarding columns on `sales_reps`).
- **A2P 10DLC SMS compliance.** To match the Twilio campaign registration (and pass carrier review): order form now captures explicit SMS consent for the number(s) provided (folded into the order clickwrap, with frequency/rates/STOP/HELP); `/terms` gains an "SMS / text messaging program" section (program name "Inksent Signing Notifications", frequency, msg & data rates, support contact, **STOP/HELP in bold**, and a no-marketing-sharing clause); `/privacy` SMS section adds an explicit "we do not share your mobile number or SMS consent with third parties/affiliates for marketing" statement. (Notary application already had a required SMS-consent checkbox.)
- **Sales rep commission portal (admin).** New **Sales** section in the admin nav (`/sales`) to recruit and track 100%-commission reps selling Inksent to title companies. Tracks reps, the title-company **accounts** each rep landed, the **collected signings** those accounts send, and **commission earned vs. paid vs. owed** — all computed live from `orders`. Commission model: **$15 per collected signing for the life of the account** + **$200 producer bonus** once an account hits **25** collected signings (terms are per-rep editable defaults). A "collected signing" = `client_paid_at` set AND not refunded, so every dollar owed comes out of revenue already in the bank. Attribution is manual: assign a title company (matched to `orders.client_company` by a normalized key, one rep per account) — unassigned companies that have sent orders are surfaced for quick crediting. Rep detail page shows per-account signings/residual/bonus, payout history, and a record-payout ledger (logs payments made; does not move money). New migration `20260623000000_sales_reps.sql` (`sales_reps`/`sales_accounts`/`sales_payouts`, admin-only RLS; also backfills the `orders.client_paid_at` column + index). New `lib/sales.ts` (commission math), admin APIs under `/api/admin/sales/*` (all `isAdminAuthed`-gated + audit-logged). Recruiting collateral added at repo root: `SALES-REP-PLAYBOOK.md` (sell sheet, cold-call script, email templates) and `SALES-COMMISSION-AGREEMENT.md` (1099 IC contract template — attorney review pending).

## Recent changes (2026-06-12)
- **Notary Hub bench announcement.** New admin-gated `/api/admin/announce-hub` emails every approved (active) agent that the free Notary Hub is live (earnings, payouts, IRS-rate mileage, one-click tax exports) with a one-tap sign-in link. Email by default; `?sms=1` also texts (kept off by default to protect the pending-A2P number). New `sendNotaryHubAnnouncementEmail()`. Includes a soft Google-review ask **only if `GOOGLE_REVIEW_URL` is set** (never a guessed link) — so the bench can review their genuine Hub/onboarding experience.
- **Pre-launch security audit — 3 fixes.** (1) **Critical:** `/api/orders/[id]/documents` had no path scoping — anyone with an order UUID could delete/replace another order's loan package in storage via `mode:'replace'`. Every document path is now locked to that order's own `${id}/` prefix (and capped at 50). (2) Admin login + 2FA-verify routes now rate-limited (10/15min per IP) so the 6-digit code can't be brute-forced. (3) `notary-apply` photo_url is validated to our own Supabase storage before it's stored/rendered, and all user fields in the apply/partner admin emails are HTML-escaped. Verified `signing-docs` storage bucket is **private** (borrower PII not publicly readable); `notary-photos` is public by design.
- **Sales quick wins.** (a) Order confirmation screen now shows a **"Track your signing live →"** button (links to `/track/[id]`) + a note that the confirmation/upload link was emailed — previously a dead-end after ordering. (b) Three **objection-handling FAQ entries** for title companies ("why switch?", "what if something goes wrong?", "you're new — why trust you?") — also feed the FAQPage rich-snippet schema. (c) New standalone **`/about` page** (founder story, values, coverage) — shareable + rankable, linked from homepage + marketing footers + sitemap. (d) Public **"See a live demo"** CTAs on the homepage and `/partners`; the demo's default brand is now a neutral fictional sample ("Meridian Title & Escrow") instead of a real prospect's name, so a public/bare `/demo` link is safe to share (branded outbound `?co=` links still override).

## Recent changes (2026-06-11)
- **SEO round 2.** Internal links from the homepage footer to the landing pages (fixes orphaned pages). FAQ sections + FAQPage schema added to both San Diego landing pages. New `/resources` content hub with two cornerstone articles (Article schema): "How to Become a Notary Signing Agent in California" (recruit) and "How Title Companies Choose a Signing Service" (buyer). Browser favicon (`app/icon.svg`). Reusable `MarketingShell`. Canonical + tuned metadata on `/order` and `/partners/apply`. All new pages added to the sitemap.
- **Free SEO foundation.** Structured data (schema.org JSON-LD): Organization/LocalBusiness + WebSite on the homepage, FAQPage on /faq (rich snippets), and JobPosting on /join → free listing in the **Google for Jobs** widget for notary recruiting. Keyword-optimized titles/descriptions + canonical URLs on /, /join, /apply, /partners, /faq. robots.txt now also hides /orders, /invoices, /demo, /hub, /feedback-thanks. (sitemap.ts/robots.ts already existed.) Builders live in `lib/seo.ts` + `components/JsonLd.tsx`.
- **Expiring credentials keep working until actual expiry.** An agent inside the 30-day renewal window is still valid until the date, so they stay dispatch- and coverage-eligible (we chase the renewal) instead of dropping off the bench a month early. Only a truly *expired* or *missing* credential removes them. New `credentialsEligible()` predicate drives dispatch, coverage API, and the demo map; strict all-green `fullyCredentialed()` is kept for the admin "fully vetted" view + badges.
- **Self-service credential update auto-greens badges.** When an approved agent supplies a credential date through the renewal/"missing info" link (`/onboard/[id]?update=1`), the onboard API now also sets `nna_certified`/`background_checked` true — so the status badge, coverage map, and dispatch eligibility update automatically the moment they submit (previously the date saved but the NNA icon could stay grey).
- **End-to-end lifecycle test** (`npm run test:e2e`). Drives the real `credentials.ts`/`coverage.ts` logic + each route's field-mapping through ingest → approve → self-service creds → coverage → dispatch, with regression + honesty-guard assertions. 24/24 green. Safe to run anytime — no production writes or SMS.
- **OG/social-share image** subtitle spacing fixed (was loose from a flex container).

## Core money loop (automated, zero-touch)
- **Client pays → notary auto-paid.** Stripe Connect transfers the payout to the notary's bank the moment the client's payment clears. Your spread is the difference; no manual payouts.
- **Auto-invoicing.** Completing a signing generates an invoice + emails the client a payment link automatically.
- **Auto-reminders + escalation.** Unpaid invoices get reminders at 7 & 14 days, escalated to you at 30.
- **Dispatch only to payout-ready agents.** A notary must be onboarded **and** bank-connected to receive jobs — so every completed job is auto-payable.

## Money safety-net (self-healing)
- **Missed-payment recovery.** If a payment webhook is ever missed, a scheduled job reconciles directly from Stripe — marks it paid, pays the notary, and *stops* dunning a client who already paid.
- **Payout retry.** A payout that fails (e.g. card funds not settled yet) auto-retries until it clears.
- **Admin refund flow.** One-click client refund via Stripe, with a clawback alert if the notary was already paid.
- **Manual overrides.** "Mark Paid" / "Pay Notary" buttons for anything you want to force by hand.

## Dispatch & reliability
- **Broadcast dispatch.** Every covering, vetted agent is alerted at once (email now, SMS when A2P clears) — first to accept wins. Typical confirmation in ~30 min, no phone tag.
- **Atomic accept.** Two agents tapping "accept" at the same instant can never double-book — exactly one wins the row.
- **Double-booking guard.** An agent can't accept a signing within 3 hours of one they already hold.
- **No-show / overdue detection.** A signing whose time passes without completion alerts you + nudges the agent.
- **Backup re-blast.** A decline/cancel automatically re-offers the job to other covering agents.
- **Credential-expiry guard.** Agents with lapsed E&O or commission are auto-excluded from dispatch and flagged red in admin.

## Live tracking (title-facing)
- **Status milestones.** The notary taps **On my way → Arrived → Complete**; the title company watches it live on the tracking page (no GPS, no privacy issue).
- **Report-a-problem.** The notary can flag a blocked signing (signer no-show, ID issue, missing docs) instead of being forced to mark complete → you're alerted to step in.

## Documents (airtight)
- **Secure delivery.** Docs are private; only the currently-assigned agent can open them. A backup taking over instantly locks out the previous agent.
- **Airtight replacement.** When a lender sends an updated package, "Replace package" deletes the old files and re-sends the new set flagged **⚠️ Updated — discard the previous version**, so no one ever signs a stale package.
- **Compliance retention.** Loan packages auto-purge **14 days** after completion (GLBA/CCPA data-minimization + signing-industry practice), leaving the order record as the audit trail.

## Credential lifecycle (auto-monitored)
- **At-a-glance bench status.** Every notary on the active bench (and their detail page) shows color-coded NNA / Background-check / E&O / Commission badges — valid (green) / expiring ≤30d (amber) / expired (red) / not-on-file (gray). Hover for the exact status.
- **All four credentials tracked**, not just E&O + commission. Background-check expiry is derived from the completion date + 12 months (NNA annual standard); NNA certification renewal is tracked from an optional date (the NNA has no public verification API, so we monitor the recorded renewal date and confirm via the NNA directory at approval — not a live lookup).
- **Automated renewal requests.** A scheduled job finds any active notary with an expiring/expired credential and sends one friendly combined SMS + email ("quick refresh to keep your signings coming") with a one-tap update link — throttled to ~every 14 days. Expired credentials also alert the admin.
- **Self-service credential update.** The renewal link opens the onboarding form pre-filled in edit mode (`/onboard/[id]?update=1`) so a notary can refresh a date in ~2 minutes without redoing their profile. Dispatch already auto-excludes lapsed E&O/commission.
- **Dates now required at onboarding.** NNA certification renewal date + background-check completion date are mandatory to finish a profile, so every new notary is monitored automatically from day one (no missing-date gaps).
- **Admin credential editor.** Each notary detail page has an "Edit credentials & dates" panel to enter NNA/BG/E&O/commission dates directly (e.g. read from the NNA directory at signingagent.com) — instantly feeds the badges + renewal reminders. Used to backfill the existing bench. (The NNA directory is a JS app and can't be scraped programmatically; dates are entered by a human who looks them up.)

## Vetting & quality
- **Real-estate transaction vetting.** Applicants declare purchase/refi experience + signing types; scored and filterable so you never approve someone who can't handle a closing.
- **Automated applicant scoring** with pros/cons (experience, volume, NNA, background check).
- **Deny-and-retain** with reasons; restore later. **Ratings** per signing (on-time, docs complete, professional).
- **Coverage maps** per-agent and network-wide (overlapping radius view).

## Client portal & self-service (title-facing)
- **Pay invoices from the portal.** The client invoice view shows a Stripe "Pay Invoice Online" button (link minted once and cached on the order; hidden with a "paid — thank you" banner once settled). Auto-reconciled by the webhook.
- **Self-serve cancel & reschedule.** Open orders have inline Reschedule (pick a new date/time) and Cancel actions in the portal. Cancel frees the notary, auto-refunds if already paid, and alerts the agent + admin; reschedule re-notifies the agent + signer.
- **Completion visibility.** Completed rows show the completion date; the invoice page lists the notary's scan-backs as short-lived signed download links.
- **Clearer order flow.** Order form shows the "$185 / signing" summary before submit; confirmation email has a concrete now/30-min/before/after timeline + portal link; invoice badge reads "Payment Due" (not the contradictory "Paid on completion").

## Notary dashboard & self-service
- **Agent dashboard** at `/agent/[id]` (unguessable-link, no login): upcoming signings, completed history, and earnings (total / paid out / pending), with a connect-your-bank nudge if payouts aren't on. Linked from payout setup + the assignment email.
- **One-tap decline (no friction).** Passing on a job is a single tap — no "why?" prompt, no judgment, no roadblock. Keeping the notary side resistance-free is the priority over collecting decline analytics. (The API still accepts an optional reason for any future passive, frictionless capture.)

## Notary recruiting funnel (conversion)
- **Photo moved out of the way up front.** Headshot is now *optional* on the application (it was a hard wall at the top of the form, killing applicants on mobile) and *required at onboarding* instead — once they're approved and invested. Carried forward automatically if they did upload at apply.
- **E&O + NNA no longer block the profile.** The onboarding form used to require an E&O carrier/expiry + NNA number to submit — but the apply page only calls E&O "preferred," so notaries without a policy got approved then hit a dead end and stalled as "approved but undispatchable." Both are now optional at onboarding (admin gets a "⚠️ no E&O yet" flag); dispatch still enforces credentials downstream.
- **Stalled-applicant nudge.** Approved notaries who never finish their profile now get a gentle re-send of the approval SMS + email ~1 day after approval, then every ~2 days, up to 3 times (`approved_at` / `nudged_at` / `nudge_count` on `notaries`, driven by the escalate cron). Recovers the biggest mid-funnel leak.
- **Faster-feeling approval.** "We'll review within 7 days" → "within 1–2 business days" across the apply form, /join one-pager, and the application-received email (you approve same-day at current volume; the 7-day promise was killing momentum).

## Data & reporting
- **Reports tab:** revenue collected, gross margin, outstanding, paid/owed to notaries, completion rate, avg confirm time, issues, cancellations.
- **Per-title-partner** billing breakdown + CSV.
- **Per-notary earnings** (1099 / tax-ready) + CSV.
- **All-orders CSV** with every field an accountant or a dispute would need.
- Every state change is timestamped (created, dispatched, accepted, en-route, arrived, completed, paid, refunded) — a full audit trail per order.

## Security & audit trail
- **Append-only audit log** (`audit_log`) recording who-did-what: admin **login successes + failures** (with IP), refunds, notary payouts, approvals, denials, deactivations, credential edits, and **document access** (every view of a signing-doc package, authorized or not — a GLBA/PII trail). Best-effort so it never blocks an action.
- **Admin "Activity" page** — a searchable security/action log view (most recent 300 events), color-coded, kept out of search.
- Admin login attempts (good + bad password, bad 2FA code) are now logged → brute-force visibility you didn't have before.

## Team quality / reliability
- **Reliability block** on each notary's detail page: acceptance rate (accepted ÷ offered), average response time to offers, on-time %, cancellations, and **last-active date** (flags notaries idle >60 days in red) — all computed from existing dispatch/order data.
- **Priority ranking (v0).** A 0–100 priority/reliability score (Tier A/B/C) ranks the active bench — built from the vetting signal + credential validity + performance (when jobs exist) + a manual **⭐ Preferred** flag the admin can toggle. The bench list is sorted by it and each agent shows their tier/score; the detail page shows the score + Preferred toggle. **Dispatch is unchanged** — every covering agent is still blasted; this only orders the display and sets up a future staggered head-start once real job history accrues.

## Security
- Admin login + emailed 2FA; all admin pages + APIs gated.
- Row-level security on the database; server uses service-role, public uses locked anon.
- Stripe + Twilio webhooks signature-verified; cron endpoints secret-gated.
- CAPTCHA + honeypot + first-order hold on public forms. Clickwrap Terms + IC agreement.
- **Fail-closed webhooks/cron.** Stripe webhook now rejects any request without a configured secret + valid signature (no unsigned-JSON fallback — a forged "paid" event can't trigger a payout). Escalate cron rejects if `CRON_SECRET` is unset instead of running open.
- **Invoice XSS hardened.** All client-supplied order fields (names, company, address) are HTML-escaped before the invoice is rendered via `dangerouslySetInnerHTML` in the admin/client views.
- **Less PII echoed.** Dispatch API no longer returns the notary's phone number in its response.
- **Abuse rate-limiting.** Public order + notary-application POSTs are throttled per IP (atomic Postgres limiter, fails open if unavailable) so a script can't flood the database, admin SMS, and dispatch.

## Site polish & hygiene
- **Reliable job accept.** The notary accept screen now reads the API response: a "just missed it" state if another agent grabbed it first (409), a retry-able error state otherwise — it can no longer say "confirmed" when the accept actually failed.
- **Homepage shows the price** ("$185 / signing") instead of a vague "Flat Rate," matching the partners page and the "no surprises" promise.
- **Branded 404 + error pages** (`not-found.tsx`, `error.tsx`) with home + call-us actions, replacing the default Next.js screens.
- **`robots.ts` + `sitemap.ts`.** Public marketing/legal pages are indexed; every admin, account, and capability-link route (track/upload/onboard/accept/complete/docs, portal, dashboard) is kept out of search.
- Removed empty dead route directories (`(notary)/jobs`, `api/invoices`, `(client)/orders`).

## Site / UX
- Two-sided animated "How It Works" (title vs notary) with a smooth, continuous journey.
- Lenis momentum scrolling; refined violet/indigo palette; mobile-optimized; branded favicon + social cards.
