# Inksent Signing Services

Notary signing agent dispatch platform for title companies, escrow officers, and lenders.

## Live URLs

| URL | What it is |
|-----|-----------|
| https://inksent.co | Public website |
| https://inksent.co/order | Client order form |
| https://inksent.co/dashboard | Admin dashboard |
| https://inksent.co/orders | All orders |
| https://inksent.co/notaries | Notary network |
| https://inksent.co/setup | Integrations setup + SMS test |
| https://inksent.co/portal | Client portal (magic link login) |
| https://inksent.vercel.app | Vercel alias (always works) |

## Business Phone & Email

| | |
|-|-|
| **Business phone** | (619) 949-3361 — Twilio, forwards calls/texts to (760) 504-5984 |
| **Business email** | orders@inksent.co — Google Workspace (pending setup) |
| **Personal cell** | (760) 504-5984 — receives forwarded calls, dispatch alerts |

## Services & Where to Find Them

### Supabase (Database)
- Dashboard: https://supabase.com/dashboard/project/ajkhzvjxvpuoxfthrkkc
- Tables: `orders`, `notaries`

### Twilio (SMS dispatch + call/text forwarding)
- Console: https://console.twilio.com
- Business number: +1 (619) 949-3361
- **Webhook URLs** — set these in Twilio Console → Phone Numbers → (619) 949-3361:
  - Voice: `https://inksent.co/api/twilio/voice`
  - SMS: `https://inksent.co/api/twilio/sms`

### Resend (Outbound invoice email)
- Dashboard: https://resend.com
- Sending domain: inksent.co (verified)
- Sends from: `invoices@inksent.co`

### Vercel (Hosting)
- Dashboard: https://vercel.com/clayton-rehm-s-projects/inksent
- Deploy: `cd ~/inksent && vercel --prod --yes`
- GitHub: https://github.com/claytonrehm/inksent

### Cloudflare (Domain + DNS)
- Domain: inksent.co
- DNS records:
  - `A` @ → `76.76.21.21` (Vercel, proxied) ✅
  - `CNAME` www → `cns.vercel-dns.com` (DNS only) ✅
  - Resend SPF + DKIM (auto-configured) ✅
  - MX records → Google Workspace ⏳ pending
  - DMARC TXT record ⏳ pending

### Google Workspace (Inbound email)
- $6/month at workspace.google.com
- Gives you orders@inksent.co inbox
- Requires MX records in Cloudflare (Google provides during setup)

## Environment Variables

Stored in `.env.local` locally and Vercel dashboard in production.
**Never commit `.env.local` to git.**

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
cd ~/inksent
npm run dev
# → http://localhost:3000
```

## Deploy to Production

```bash
cd ~/inksent
vercel --prod --yes
```

## How an Order Works (End-to-End)

1. Client submits order at `/order`
2. Order appears in admin at `/dashboard`
3. Admin opens order → picks notary → clicks **Dispatch via SMS**
4. Notary gets SMS with job details + one-tap accept link
5. Notary taps link → accepts
6. Admin gets SMS confirmation on (760) 504-5984
7. Admin marks order Completed
8. Invoice auto-emails to client
9. Invoice viewable/printable at `/invoices/[id]`

## Pricing

| | |
|-|-|
| Charge clients | $195/signing |
| Pay notaries | $100/signing |
| Your spread | **$95/signing** |

## Pre-Launch Checklist

- [x] Website live at inksent.co
- [x] Order form
- [x] Admin dashboard
- [x] Supabase database
- [x] Twilio SMS configured — number (619) 949-3361
- [x] Resend invoice email configured
- [x] Domain registered (inksent.co via Cloudflare, $26/yr)
- [x] DNS → Vercel
- [x] Resend domain verified
- [x] Twilio trial upgraded (credit card added)
- [x] inksent.co DNS propagated ✅
- [x] **Twilio voice webhook** — (619) 949-3361 forwards calls to (760) 504-5984 ✅
- [x] **Google Workspace** — orders@inksent.co working ✅
- [x] **MX records** — configured in Cloudflare ✅
- [ ] **Twilio SMS webhook** — blocked until A2P approved
- [ ] **A2P 10DLC brand** — needs EIN (irs.gov/ein, 7am ET) → resubmit → wait 24-48hrs
- [ ] **A2P Campaign** — register after brand approved
- [ ] **DMARC record** — Cloudflare DNS: TXT `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:orders@inksent.co`
- [ ] **Supabase auth URL** — set to https://inksent.co + redirect https://inksent.co/portal
- [ ] Test SMS dispatch end-to-end
- [ ] Test invoice email
- [ ] Add first real notary at inksent.co/notaries
- [ ] EIN — irs.gov/ein tomorrow 7am ET
- [ ] LLC — consult CPA (CA vs TN), no rush until revenue
- [ ] E&O insurance — Next Insurance (~$500/yr), get before marketing to title companies
