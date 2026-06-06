# Inksent — Go-Live Checklist

The entire product is built. What's left is operational. Updated to track what's done.

---

## ✅ DONE

- [x] **Full product built** — site, order flow, radius matching, applicant filtering + vetting, onboarding, document routing, backup-on-cancel, cancellation tracking, live tracker, borrower texts, bilingual matching, self-complete + scan-backs, escalation + invoice auto-reminders, Stripe payment links + Connect payout code, FAQ/privacy/terms, sell sheets
- [x] **Database migration** — consolidated migration run in Supabase
- [x] **Website** — dark redesign, founder/About section ($200M+), hero product mockup, two sell sheets (`/partners`, `/join`), ink-drop logo live
- [x] **DMARC** — live in DNS
- [x] **Resend** — verified + upgraded plan
- [x] **EIN** — 42-2961534
- [x] **Zero-touch order flow** — orders auto-dispatch, honeypot bot filter
- [x] **Twilio A2P** — submitted (in manual review — waiting on them)

---

## 🟢 DO NOW — all in parallel, none block each other

**Recruiting notaries is NOT gated by the bank account or insurance. Start it today.**

- [ ] **Recruit notaries** — post `inksent.co/join` in SD notary Facebook/WhatsApp groups; DM contacts. Applications collect with zero dependencies.
- [ ] **Finish Stripe** — secret key + enable Connect (Marketplace) + webhook (`checkout.session.completed`, `account.updated`) + ACH. *Needed before you approve/onboard notaries so their payout setup works.*
- [ ] **Open business bank account** — Mercury (mercury.com), ~15 min, EIN ready. *Stripe deposits your earnings here; needed before money actually moves.*
- [ ] **Pick the logo** — choose from `inksent.co/brand` (one-line swap to lock it).

---

## 🟡 BEFORE YOU APPROVE / ONBOARD NOTARIES

- [ ] Stripe live (above) — so onboarding → payout connect is seamless
- [ ] Approve applicants at `inksent.co/notaries` (verify each via one-click NNA/Google links)
- [ ] Notaries onboard + connect their payout bank

---

## 🟠 BEFORE YOUR FIRST TITLE-COMPANY ORDER

- [ ] **E&O + General Liability insurance** — Next Insurance (~$500–800/yr). Title companies will ask. Get it before pitching/taking orders.
- [ ] 5+ SD notaries approved & onboarded (a real bench)
- [ ] **Twilio A2P approved** — so job-dispatch texts deliver (you'll likely have this by the time you have orders)

---

## ⚪ LATER (not blocking launch)

- [ ] **LLC** — talk to a CPA (TN vs CA). Do once revenue flows.
- [ ] **Virtual business address** — for privacy (Stripe support address, future LLC filings). iPostal1 / Anytime Mailbox, ~$10–30/mo.
- [ ] **Supabase auth redirect URL** — only matters if you push clients to use the `/portal` login. Low priority.

---

## 🚀 THE SEQUENCE

1. **Today:** recruit notaries (`/join`) + finish Stripe + open Mercury account — in parallel.
2. **This week:** approve your first batch → they onboard + connect payouts. Get an E&O quote.
3. **Then:** pitch title companies (`inksent.co/partners`) once you have a bench + E&O.
4. **First real order** → the automated loop runs hands-off.

*The correct order: recruit notaries FIRST (longest lead time, no dependencies). Bank account before money moves. E&O before title orders. They're parallel tracks, not a strict line.*
