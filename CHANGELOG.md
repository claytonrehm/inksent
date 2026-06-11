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

## Vetting & quality
- **Real-estate transaction vetting.** Applicants declare purchase/refi experience + signing types; scored and filterable so you never approve someone who can't handle a closing.
- **Automated applicant scoring** with pros/cons (experience, volume, NNA, background check).
- **Deny-and-retain** with reasons; restore later. **Ratings** per signing (on-time, docs complete, professional).
- **Coverage maps** per-agent and network-wide (overlapping radius view).

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

## Site / UX
- Two-sided animated "How It Works" (title vs notary) with a smooth, continuous journey.
- Lenis momentum scrolling; refined violet/indigo palette; mobile-optimized; branded favicon + social cards.
