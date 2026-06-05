-- Track when notary was paid for each order
alter table orders add column notary_paid_at timestamptz;

-- Index for unpaid queries
create index orders_notary_paid_idx on orders(notary_paid_at) where notary_paid_at is null;
