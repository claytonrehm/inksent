-- Record when a client payment was refunded (admin action)
alter table orders add column if not exists refunded_at timestamptz;
