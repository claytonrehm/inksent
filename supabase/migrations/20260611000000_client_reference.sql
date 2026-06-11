-- The title company's own file / escrow / order number, so they can cross-reference
-- our signings against their internal system at a glance.
alter table orders add column if not exists client_reference text;
