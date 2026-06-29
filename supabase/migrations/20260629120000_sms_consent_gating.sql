-- A2P 10DLC compliance: SMS consent is now VOLUNTARY on both opt-in pages
-- (/apply for notaries, /order for clients). To honor that consent, outbound SMS
-- is gated on a recorded opt-in. This adds the client-side opt-in record and
-- backfills existing records so nothing in flight loses its texts.

-- Client/order opt-in record (notaries already have notaries.sms_consent_at).
alter table orders add column if not exists sms_consent_at timestamptz;

-- Backfill existing orders: they consented under the previous (bundled) clickwrap,
-- so stamp their creation time as the consent time — in-flight signings keep
-- getting status/reschedule texts.
update orders
   set sms_consent_at = coalesce(sms_consent_at, created_at)
 where sms_consent_at is null;

-- Backfill the existing active notary bench: every active notary applied under the
-- previous form where the SMS-consent box was REQUIRED, so they did opt in — stamp
-- it where missing so the working bench keeps receiving job-offer texts. Going
-- forward, new applicants who leave the (now-optional) box unchecked stay null and
-- are reached by email only.
update notaries
   set sms_consent_at = coalesce(sms_consent_at, created_at)
 where active = true
   and sms_consent_at is null;
