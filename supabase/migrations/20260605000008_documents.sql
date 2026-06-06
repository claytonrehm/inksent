-- Signing document package attached to an order: [{ name, path }]
alter table orders add column if not exists documents jsonb not null default '[]'::jsonb;

-- Private bucket for loan documents (NEVER public — contains borrower NPI/SSN)
insert into storage.buckets (id, name, public)
values ('signing-docs', 'signing-docs', false)
on conflict (id) do nothing;

-- Allow anonymous UPLOAD only (title companies upload via an unguessable order link).
-- No public read policy — downloads are served only through signed URLs generated
-- server-side with the service role after verifying the requesting notary.
drop policy if exists "Anon upload signing docs" on storage.objects;
create policy "Anon upload signing docs" on storage.objects
  for insert with check (bucket_id = 'signing-docs');
