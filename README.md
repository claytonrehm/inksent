# Inksent Signing Services

Notary signing-agent dispatch platform for title companies, escrow officers, and lenders. Built to run almost entirely hands-off.

---

## Why Inksent — the competitive edge

Most signing services are either **impersonal platforms** (SnapDocs, ServiceLink — you're a ticket number) or **slow, manual one-person shops** (phone tag, no visibility). Inksent is fast, personal, *and* automated. These are the concrete differentiators built into the product — use them in every pitch.

### For title companies & escrow officers

| Advantage | Why it beats the others |
|-----------|-------------------------|
| **Backup-on-cancel, automatically** | If your assigned notary cancels, the job instantly re-offers to every other covering agent — and keeps cascading through *any* number of cancellations until one sticks. You're never left scrambling at 6pm. Most services call you in a panic. |
| **Documents follow the job** | Upload your package once. Whoever is assigned auto-gets a secure download link — even a backup who takes over after a cancel. You never re-send anything. Docs stored privately (never public URLs). |
| **Live tracking** | A real-time status link (like Uber for signings): dispatched → agent confirmed (with photo) → complete. No calling to ask "is it covered?" |
| **You know who's showing up** | Every agent has a photo, verified credentials, background check, and a tracked on-time record. A vetted professional at your borrower's door, not a stranger. |
| **~30-minute confirmation** | Auto-blasts every qualified nearby agent at once; first to accept wins. Others dial agents one at a time. |
| **Borrower heads-up text** | The signer gets a text with who's coming and when — fewer no-answer doors, more professional. |
| **Bilingual matching** | Need a Spanish (or Mandarin, Vietnamese, etc.) signing? We auto-route to agents who speak it. |
| **Pay online, net-30** | One-click invoice payment (ACH/card) that auto-reconciles. Or pay by check — your call. |
| **Flat $175, no games** | No contracts, no minimums, no surprise fees. "Try us on one signing." |
| **A real person** | Small, local team — you reach an actual human, not a queue. |

### For signing agents (notaries)

| Advantage | Why it beats the others |
|-----------|-------------------------|
| **Free to join** | No membership fees, no catch. |
| **Jobs come to you by text** | We text you when a signing opens in your area. One tap to accept. No bidding, no portals to refresh. |
| **You set your coverage** | Just give a home ZIP + how far you'll drive. We match by real distance — no memorizing ZIP lists. |
| **Automatic payouts** | Connect your bank once (via Stripe). Your $90 lands automatically after each signing — no invoicing us, no chasing pay. |
| **Flexible** | Accept only what fits your schedule. No minimums, no penalty for passing. |
| **More jobs if bilingual** | Speak another language? You get matched to more signings. |

---

## Pricing & economics

| | |
|-|-|
| Charge clients | **$175 / signing** |
| Pay notaries | **$90 / signing** |
| Gross spread | **$85 / signing** |

Coverage: nationwide (all 50 states shown on the site; attorney states flagged).

---

## The hands-off operating loop

Designed so the owner touches as little as possible:

```
Notary applies (/apply)  →  admin reviews/filters/approves  →  notary onboards + connects payout bank
Client places order (/order)
   → known client? auto-blast nearby ONBOARDED notaries   (first-time client → held for 1-tap review)
   → first to accept wins
   → backup auto-reblast if anyone cancels (cascades; never re-offers a bailer)
   → borrower gets heads-up text; client gets live tracker link
Title company uploads docs (link in confirmation email)
   → auto-delivered to whoever is currently assigned
Notary completes signing (/complete) + uploads scan-backs
   → invoice auto-emails with pay-online button
   → unpaid? auto-reminders at 7 & 14 days; admin alerted only at 30 days
Client pays online
   → order auto-marked paid
   → $90 auto-paid to the notary's bank (cash-flow safe: only after client pays)
```

Human touchpoints that remain (by design): approving/vetting applicants, rating notaries, and intervening on the rare escalation alert.

---

## Key URLs

| URL | What it is |
|-----|-----------|
| `inksent.co` | Public marketing site (US coverage map, pricing) |
| `inksent.co/order` | Client order form |
| `inksent.co/apply` | Notary application (lean — photo, coverage, experience) |
| `inksent.co/onboard/[id]` | Post-approval onboarding (credentials, payment) |
| `inksent.co/onboard/[id]/connect` | Stripe Connect payout setup |
| `inksent.co/upload/[id]` | Title company uploads signing docs |
| `inksent.co/docs/[id]` | Notary's secure document download (assignment-gated) |
| `inksent.co/complete/[id]` | Notary self-marks signing complete + scan-backs |
| `inksent.co/track/[id]` | Public live status tracker |
| `inksent.co/notaries` | Admin: applicant filtering + bench performance |
| `inksent.co/notaries/[id]` | Admin: notary detail (metrics, reviews, cancellations) |
| `inksent.co/orders` · `/orders/[id]` | Admin: order management + dispatch |
| `inksent.co/dashboard` | Admin: revenue, A/R, A/P, today's signings |
| `inksent.co/faq` · `/privacy` · `/terms` | Public legal/help pages |

## Business details

| | |
|-|-|
| **Business phone** | (619) 949-3361 — Twilio, forwards to (760) 504-5984 |
| **Business email** | orders@inksent.co — Google Workspace |
| **EIN** | 42-2961534 — sole proprietor, Knox County TN |

## Infrastructure

- **Supabase** — Postgres + Storage. Tables: `orders`, `notaries`, `notary_ratings`, `notary_cancellations`. Buckets: `notary-photos` (public), `signing-docs` (private — loan docs + scan-backs).
- **Twilio** — SMS dispatch + call forwarding. Number (619) 949-3361. *A2P 10DLC pending — SMS coded and queued; activates on approval.*
- **Resend** — all outbound email (verified domain inksent.co).
- **Stripe** — invoice payment links + Connect auto-payouts.
- **Vercel** — hosting + daily cron (escalation + invoice auto-reminders). GitHub: github.com/claytonrehm/inksent.
- **Cloudflare** — DNS. **Google Workspace** — inbox.

## Environment variables (Vercel, Production)

```
NEXT_PUBLIC_SUPABASE_URL          NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         (signed URLs for private docs)
TWILIO_ACCOUNT_SID                TWILIO_AUTH_TOKEN           TWILIO_FROM_NUMBER
RESEND_API_KEY                    ADMIN_PHONE                 NEXT_PUBLIC_BASE_URL
STRIPE_SECRET_KEY                 STRIPE_WEBHOOK_SECRET       (payments + payouts)
CRON_SECRET                       (optional — protects the cron route)
```

## Run / deploy

```bash
npm run dev            # local → http://localhost:3000
vercel --prod --yes    # deploy
```

## Status / to-dos

**Built & live:** marketing site + US map, order flow w/ radius matching, applicant
filtering + vetting links, onboarding + Stripe Connect payouts, document routing,
backup-on-cancel (resilient), cancellation tracking, live tracker, borrower texts,
bilingual matching, spam gate, onboarding enforcement, self-complete + scan-backs,
escalation + invoice auto-reminder cron, Stripe invoice payment links, FAQ/privacy/terms.

**Pending (owner actions):**
- [ ] Twilio A2P approval → enables all SMS (in manual review)
- [ ] Stripe: add keys, enable Connect, set webhook (`checkout.session.completed`, `account.updated`)
- [ ] Run outstanding Supabase migrations (see `supabase/migrations/`)
- [ ] Business bank account (Mercury) · E&O insurance (Next Insurance) · LLC (CPA)
- [ ] DMARC record · Supabase auth URL
- [ ] Recruit + approve first San Diego notaries → then tell Summit Settlement
