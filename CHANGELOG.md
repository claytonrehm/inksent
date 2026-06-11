# Inksent — Build Log & Capabilities

A running record of what the platform does and what was added. Use this for your own reference, onboarding a future ops hire, and answering "can it do X?"

---

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
