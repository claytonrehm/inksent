-- Coverage by home base + travel radius (replaces listing individual ZIPs)
alter table notaries add column if not exists base_zip text;
alter table notaries add column if not exists coverage_radius integer default 25;
