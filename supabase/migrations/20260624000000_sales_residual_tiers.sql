-- Tiered residual: full rate for an initial window, reduced rate thereafter.
-- Default: $15/signing for the first 24 months per account, then $8/signing
-- ongoing (encourages reps to keep landing new accounts).
alter table sales_reps add column if not exists residual_months integer not null default 24;
alter table sales_reps add column if not exists residual_after_cents integer not null default 800;
