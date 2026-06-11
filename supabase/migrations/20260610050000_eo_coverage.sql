-- Capture the E&O coverage amount (dollars) — title companies specify minimums
-- (commonly $25k–$100k), so we track the figure, not just carrier + expiry.
alter table notaries add column if not exists eo_coverage_amount integer;
