-- Track how many auto-reminders we've sent for an unpaid invoice
alter table orders add column if not exists payment_reminders integer not null default 0;
