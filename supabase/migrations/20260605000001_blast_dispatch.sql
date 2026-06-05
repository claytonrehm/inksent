-- Track which notaries were blasted for an order
alter table orders add column dispatched_to text[] not null default '{}';
