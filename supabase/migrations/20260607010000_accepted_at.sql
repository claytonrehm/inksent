-- Capture how fast a job was accepted (time-to-confirm metric)
alter table orders add column if not exists accepted_at timestamptz;
