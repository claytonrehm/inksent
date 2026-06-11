-- Manual "preferred" flag so the admin can float proven agents to the top of the
-- bench ranking (and, in v1, the front of the dispatch head-start).
alter table notaries add column if not exists preferred boolean not null default false;
