# Inksent Signing Services

Notary signing agent dispatch platform for title companies, escrow officers, and lenders.

## Live URLs

| URL | What it is |
|-----|-----------|
| https://inksent.co | Public marketing site |
| https://inksent.co/order | Client order form |
| https://inksent.co/apply | Notary application form |
| https://inksent.co/dashboard | Admin dashboard |
| https://inksent.co/orders | All orders |
| https://inksent.co/notaries | Notary network + pending approvals |
| https://inksent.co/setup | Integrations setup + SMS test |
| https://inksent.co/portal | Client portal (magic link login) |
| https://inksent.vercel.app | Vercel alias (always works) |

## Business

| | |
|-|-|
| **Business phone** | (619) 949-3361 — Twilio, forwards calls to (760) 504-5984 |
| **Business email** | orders@inksent.co — Google Workspace |
| **Personal cell** | (760) 504-5984 — receives forwarded calls + dispatch alerts |
| **EIN** | 42-2961534 — sole proprietor, Knox County TN |

## Pricing

| | |
|-|-|
| Charge clients | **$175/signing** |
| Pay notaries | **$90/signing** |
| Your spread | **$85/signing** |

Coverage: 27 non-attorney states only.

## How an Order Works (End-to-End)

1. Client submits order at `/order`
2. System auto-blasts all nearby active notaries via SMS simultaneously
3. First notary to tap accept gets the job — others see "already claimed"
4. Admin gets SMS: new order + how many notaries were blasted
5. Notary gets full details confirmation email + SMS
6. Client gets "your agent is confirmed" email with notary name + phone
7. Admin marks order Completed → invoice auto-emails to client
8. Admin marks client paid + notary paid → notary gets payment SMS

## How Notary Onboarding Works

1. Notary applies at `/apply` — photo, credentials, ZIPs, availability, payment preference, W-9 acknowledgment
2. Saved to DB as inactive — admin gets SMS + email with full profile
3. Admin reviews at `/notaries` (amber badge shows pending count) → clicks **Approve**
4. Notary gets welcome SMS immediately upon approval
5. Notary now on active bench — auto-blasted on every matching order

## Services & Infrastructure

### Supabase (Database + Storage)
- Dashboard: https://supabase.com/dashboard/project/ajkhzvjxvpuoxfthrkkc
- Tables: `orders`, `notaries`, `notary_ratings`
- Storage bucket: `notary-photos` (public)

### Twilio (SMS dispatch + call forwarding)
- Console: https://console.twilio.com
- Business number: +1 (619) 949-3361
- Webhooks (set in Twilio Console → Phone Numbers):
  - Voice: `https://inksent.co/api/twilio/voice`
  - SMS: `https://inksent.co/api/twilio/sms`

### Resend (All outbound email)
- Dashboard: https://resend.com
- Sending domain: inksent.co (verified)
- Sends from: `orders@inksent.co` and `invoices@inksent.co`
- Emails sent: notary application ack, notary assignment confirmation, client order confirmation, client agent assignment, invoice

### Vercel (Hosting)
- Dashboard: https://vercel.com/clayton-rehm-s-projects/inksent
- Deploy: `vercel --prod --yes`
- GitHub: https://github.com/claytonrehm/inksent

### Cloudflare (Domain + DNS)
- Domain: inksent.co
- DNS records:
  - `A` @ → `76.76.21.21` (Vercel) ✅
  - `CNAME` www → `cns.vercel-dns.com` ✅
  - Resend SPF + DKIM ✅
  - MX records → Google Workspace ✅
  - DMARC ⏳ pending

### Google Workspace
- orders@inksent.co inbox — $6/month

## Environment Variables

Stored in `.env.local` locally and Vercel dashboard in production. Never commit `.env.local`.

```
NEXT_PUBLIC_SUPABASE_URL=https://ajkhzvjxvpuoxfthrkkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+16199493361
RESEND_API_KEY=...
ADMIN_PHONE=+17605045984
NEXT_PUBLIC_BASE_URL=https://inksent.co
```

## Run Locally

```bash
npm run dev
# → http://localhost:3000
```

## Deploy to Production

```bash
vercel --prod --yes
```

## Checklist

- [x] Website live at inksent.co
- [x] Order form + auto-blast dispatch
- [x] Notary apply form with photo upload
- [x] Admin dashboard with revenue, A/R, A/P, today's signings
- [x] Notary pending approval queue with Review/Approve flow
- [x] Blast dispatch (first to accept wins)
- [x] Notary decline flow
- [x] Notary payment tracking + SMS notification
- [x] Client payment tracking
- [x] Post-signing notary rating system
- [x] Full email suite (6 email types)
- [x] Supabase DB + Storage configured
- [x] Twilio voice webhook ✅
- [x] Google Workspace — orders@inksent.co ✅
- [x] EIN obtained (42-2961534)
- [x] Resend domain verified ✅
- [ ] **Twilio A2P** — manual review in progress (emailed trusthub-verify@twilio.com with CP-575)
- [ ] **Twilio SMS webhook** — set once A2P approved
- [ ] **A2P Campaign** — register after brand approved
- [ ] **DMARC record** — Cloudflare: TXT `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:orders@inksent.co`
- [ ] **Supabase auth URL** — set to https://inksent.co + redirect https://inksent.co/portal
- [ ] Business bank account — Mercury (mercury.com), EIN ready
- [ ] E&O insurance — Next Insurance (~$500/yr), get before marketing hard
- [ ] LLC — consult CPA (CA vs TN), no rush until revenue
- [ ] First notaries recruited and approved
- [ ] Test SMS dispatch end-to-end once A2P clears
- [ ] Tell Summit Settlement ready once 5+ SD notaries approved
