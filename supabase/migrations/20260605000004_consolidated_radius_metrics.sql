-- Coverage-by-radius model + applicant filtering fields + flake tracking
alter table notaries add column if not exists base_zip text;
alter table notaries add column if not exists coverage_radius integer default 25;
alter table notaries add column if not exists notes text;
alter table notaries add column if not exists times_declined integer default 0;
alter table notaries add column if not exists background_checked boolean default false;
alter table notaries add column if not exists signings_completed text;
