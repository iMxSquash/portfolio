-- Storage bucket `logos`: public read, authenticated write. Holds the
-- project logos uploaded from the /admin backoffice (see TODO.md Phase 7).
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Public can read logos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');

create policy "Authenticated users can upload logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos');

create policy "Authenticated users can update logos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos')
  with check (bucket_id = 'logos');

create policy "Authenticated users can delete logos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos');
