-- Post-approval onboarding (step 2) fields
alter table notaries add column if not exists payment_method text;
alter table notaries add column if not exists payment_handle text;
alter table notaries add column if not exists eo_policy text;
alter table notaries add column if not exists has_dual_tray boolean;
alter table notaries add column if not exists onboarded_at timestamptz;

-- TCPA: record of SMS consent
alter table notaries add column if not exists sms_consent_at timestamptz;
