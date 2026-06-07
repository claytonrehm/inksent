-- Capture real-estate signing competence (not just raw volume).
alter table notaries add column if not exists re_experience text; -- expert | comfortable | some | new
alter table notaries add column if not exists signing_types text[] default '{}';
