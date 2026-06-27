-- ImoBoost AI — storage buckets
-- Convention: object path is always "{agency_id}/...", which lets a single
-- policy enforce tenant isolation across every bucket.

insert into storage.buckets (id, name, public)
values
  ('property-images', 'property-images', true),
  ('feed-images', 'feed-images', true),
  ('avatars', 'avatars', true),
  ('agency-logos', 'agency-logos', true),
  ('video-assets', 'video-assets', true)
on conflict (id) do nothing;

create policy "storage_public_read"
  on storage.objects for select
  using (
    bucket_id in ('property-images', 'feed-images', 'avatars', 'agency-logos', 'video-assets')
  );

create policy "storage_agency_write"
  on storage.objects for insert
  with check (
    bucket_id in ('property-images', 'feed-images', 'avatars', 'agency-logos', 'video-assets')
    and (storage.foldername(name))[1] = public.current_agency_id()::text
  );

create policy "storage_agency_update"
  on storage.objects for update
  using (
    bucket_id in ('property-images', 'feed-images', 'avatars', 'agency-logos', 'video-assets')
    and (storage.foldername(name))[1] = public.current_agency_id()::text
  );

create policy "storage_agency_delete"
  on storage.objects for delete
  using (
    bucket_id in ('property-images', 'feed-images', 'avatars', 'agency-logos', 'video-assets')
    and (storage.foldername(name))[1] = public.current_agency_id()::text
  );
