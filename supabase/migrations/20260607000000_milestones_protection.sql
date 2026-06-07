-- Status milestones (notary progress the title company can watch live)
alter table orders add column if not exists en_route_at timestamptz;
alter table orders add column if not exists arrived_at timestamptz;

-- No-show / overdue detection (alert admin once)
alter table orders add column if not exists overdue_alerted_at timestamptz;

-- Notary "report a problem" outcome
alter table orders add column if not exists issue_reported_at timestamptz;
alter table orders add column if not exists issue_reason text;
