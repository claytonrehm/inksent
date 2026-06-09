# Inksent — Launch Readiness Checklist

Living checklist of everything needed for a fully operational, low-risk business. The *platform* (code) is built and hardened; what remains is mostly business/legal/infra. **Claude will remind Clayton of the open items as work continues.**

Legend: ⬜ todo · ✅ done · 🔧 Claude can do · 👤 Clayton/advisor

---

## 🔴 Before taking real (paid) orders
- ⬜ 👤 **LLC** formed (+ operating agreement). Confirm jurisdiction: formed in TN but operating in CA may require CA foreign-registration + $800/yr franchise tax — ask CPA/attorney.
- ⬜ 👤 **E&O / professional liability insurance** (platform's own, separate from notaries').
- ⬜ 👤 **General liability insurance.**
- ⬜ 👤 **Cyber / data-breach insurance** — you store borrowers' loan packages (financial NPI). Often *required* by title companies/lenders.
- ⬜ 👤 **Business bank account** (separate from personal — preserves the LLC liability shield).
- ⬜ 👤 **2FA + password manager on EVERY provider account** — Vercel, Supabase, Stripe, Twilio, Resend, Cloudflare, domain registrar. *These logins are the master keys; the app being secure doesn't matter if an account is phished.*
- ⬜ 👤 **Supabase paid plan → database backups / point-in-time recovery** on. (Free tier = no recovery if data is lost.)
- ⬜ 👤 **SPF DNS record** — add `v=spf1 include:_spf.google.com ~all` (DMARC ✅ + Resend DKIM ✅ already set; SPF was missing).

## 🟠 Important soon
- ⬜ 🔧 **Error monitoring + uptime alerts** — health endpoint added (`/api/health`); connect an uptime monitor (UptimeRobot/Better Stack) + Sentry for errors.
- ⬜ 👤 **Stripe 1099 tax reporting** enabled + W-9/TIN collection confirmed (Connect handles it).
- ⬜ 👤 **Twilio A2P 10DLC** — escalated to Twilio's team; email dispatch covers the gap meanwhile.
- ⬜ 👤 **CA worker-classification (AB5) review** of the IC agreement by a CA employment attorney before scaling notaries.
- ⬜ 🔧/👤 **B2B partner readiness** — MSA template + WISP (security program) + security-questionnaire answers drafted (`MSA-TEMPLATE.md`, `SECURITY-PROGRAM.md`); have an attorney review the MSA before signing.
- ⬜ 👤 **Vercel Pro ($20/mo)** → Claude flips cron from daily to ~1 min (faster escalation/no-show/payout-retry).
- ⬜ 👤 Decide **billing terms** (per-signing vs monthly net-30) with first partner.

## 🟡 Scale hygiene (not blocking)
- ⬜ 🔧 **Rate limiting** on public endpoints (needs Upstash/Vercel KV free tier — Claude wires it once the store exists). CAPTCHA + honeypot + first-order-hold are the current defenses.
- ⬜ 👤 **Backup operator** for escalations (bus factor).
- ⬜ 👤 **Stripe Radar** fraud rules.
- ⬜ 🔧 **Reports pagination** when order volume grows into the thousands.
- ⬜ 🔧 **Automated test suite** around dispatch / payout / reconciliation.

## ✅ Already done (platform)
Security hardening (admin 2FA, RLS, gated APIs, signed webhooks, secret-gated cron, CAPTCHA), zero-touch money loop + self-healing safety-net, doc access control + 14-day GLBA-aligned purge, credential-expiry guard, no-show detection, double-booking guard, atomic accept, refund flow, live tracking, reports + CSV (1099-ready), coverage maps (geo + time), DMARC + Resend DKIM, architecture review (`ARCHITECTURE.md`).
