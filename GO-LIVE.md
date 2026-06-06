# Inksent — Go-Live Checklist

Everything left before you're fully operational, in order. Code is done; these are owner actions.

---

## PHASE 1 — Activate the code (~15 min, do first)

### 1. Run the consolidated database migration
Paste this **entire block** into Supabase → SQL Editor → Run. It's idempotent (safe to run even if you've already run parts).

```sql
-- ORDERS columns
alter table orders add column if not exists client_paid_at timestamptz;
alter table orders add column if not exists notary_paid_at timestamptz;
alter table orders add column if not exists dispatched_to text[] not null default '{}';
alter table orders add column if not exists documents jsonb not null default '[]'::jsonb;
alter table orders add column if not exists completed_at timestamptz;
alter table orders add column if not exists scan_backs jsonb not null default '[]'::jsonb;
alter table orders add column if not exists dispatched_at timestamptz;
alter table orders add column if not exists escalated_at timestamptz;
alter table orders add column if not exists hold_for_review boolean not null default false;
alter table orders add column if not exists language_needed text;
alter table orders add column if not exists borrower_notified_at timestamptz;
alter table orders add column if not exists payment_reminders integer not null default 0;
alter table orders add column if not exists declined_by text[] not null default '{}';

-- NOTARIES columns
alter table notaries add column if not exists photo_url text;
alter table notaries add column if not exists nna_number text;
alter table notaries add column if not exists commission_state_code text;
alter table notaries add column if not exists commission_expiry date;
alter table notaries add column if not exists eo_carrier text;
alter table notaries add column if not exists eo_expiry date;
alter table notaries add column if not exists eo_policy text;
alter table notaries add column if not exists bgc_provider text;
alter table notaries add column if not exists bgc_date date;
alter table notaries add column if not exists years_experience integer;
alter table notaries add column if not exists signings_completed text;
alter table notaries add column if not exists background_checked boolean default false;
alter table notaries add column if not exists notes text;
alter table notaries add column if not exists availability_notes text;
alter table notaries add column if not exists signing_types_comfort text[] default '{}';
alter table notaries add column if not exists languages text[] not null default '{}';
alter table notaries add column if not exists payment_method text;
alter table notaries add column if not exists payment_handle text;
alter table notaries add column if not exists has_dual_tray boolean;
alter table notaries add column if not exists onboarded_at timestamptz;
alter table notaries add column if not exists sms_consent_at timestamptz;
alter table notaries add column if not exists times_declined integer default 0;
alter table notaries add column if not exists times_cancelled integer default 0;
alter table notaries add column if not exists stripe_account_id text;
alter table notaries add column if not exists payouts_enabled boolean not null default false;

-- RATINGS table
create table if not exists notary_ratings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  order_id uuid references orders(id) unique,
  notary_id uuid references notaries(id),
  rating integer check (rating between 1 and 5),
  on_time boolean, docs_complete boolean, professional boolean, notes text
);

-- CANCELLATIONS table
create table if not exists notary_cancellations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  notary_id uuid references notaries(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  hours_before_signing numeric, signer_name text, confirmation_number text
);
create index if not exists notary_cancellations_notary_idx on notary_cancellations(notary_id);

-- STORAGE buckets + policies
insert into storage.buckets (id, name, public) values ('notary-photos','notary-photos',true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('signing-docs','signing-docs',false) on conflict (id) do nothing;
drop policy if exists "Public read" on storage.objects;
drop policy if exists "Anon upload" on storage.objects;
drop policy if exists "Anon upload signing docs" on storage.objects;
create policy "Public read" on storage.objects for select using (bucket_id = 'notary-photos');
create policy "Anon upload" on storage.objects for insert with check (bucket_id = 'notary-photos');
create policy "Anon upload signing docs" on storage.objects for insert with check (bucket_id = 'signing-docs');
```

### 2. Supabase auth redirect URL
Supabase → Authentication → URL Configuration → Site URL `https://inksent.co`, add redirect `https://inksent.co/portal`.

### 3. DMARC record (email deliverability)
Cloudflare DNS → add TXT record: name `_dmarc`, value `v=DMARC1; p=quarantine; rua=mailto:orders@inksent.co`

---

## PHASE 2 — Payments (when ready; optional to launch)

### 4. Stripe
- Create account at stripe.com (use your EIN)
- Copy **Secret key** → add to Vercel as `STRIPE_SECRET_KEY` (Production)
- **Enable Connect** (Dashboard → search "Connect" → Get started → Platform/Marketplace)
- **Webhook**: Developers → Webhooks → Add endpoint `https://inksent.co/api/stripe/webhook`, events: `checkout.session.completed` + `account.updated` → copy signing secret → add to Vercel as `STRIPE_WEBHOOK_SECRET`
- Enable **ACH Direct Debit** (Settings → Payment methods) for low fees
- Redeploy, then have Claude run the live money test

> Skippable for launch — invoices fall back to "net 30, pay by check" if Stripe isn't set.

---

## PHASE 3 — Waiting on others (nothing to do but follow up)

### 5. Twilio A2P 10DLC
In manual review (you emailed your DL + CP-575). Until approved, **all SMS is queued** — the business runs on email. Once approved: set the SMS webhook + register the campaign. **Don't wait on this to start recruiting notaries.**

---

## PHASE 4 — Business legitimacy (this week)

- [ ] **Business bank account** — Mercury (mercury.com), ~15 min, EIN ready
- [ ] **E&O + General Liability quote** — Next Insurance (~$500–800/yr); get before title-company orders
- [ ] **LLC** — talk to a CPA (TN vs CA); not required to start, do once revenue flows

---

## PHASE 5 — Go to market

- [ ] **Recruit notaries** — post `inksent.co/join` in SD notary Facebook/WhatsApp groups; DM contacts
- [ ] **Review & approve** at `inksent.co/notaries` — verify each via the one-click NNA/Google links
- [ ] **Get 5+ SD notaries** approved & onboarded (payout bank connected)
- [ ] **Tell Summit Settlement** you're ready; send `inksent.co/partners`
- [ ] **First real order** → watch the automated loop run

---

*Built and ready: the entire product. What's left is operational. Knock out Phase 1 today and you're live for notary recruiting immediately.*
