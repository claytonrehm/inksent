-- General availability windows for coverage planning (not a hard dispatch filter)
alter table notaries add column if not exists availability text[] default '{}';
