-- Accumulate every notary who declined/cancelled an order, so re-blasts never
-- re-offer to someone who already bailed (resilient through any number of cancels)
alter table orders add column if not exists declined_by text[] not null default '{}';
