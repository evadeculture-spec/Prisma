-- ImoBoost AI — Row Level Security
-- Every table is scoped to the caller's agency via current_agency_id().
-- Writes are further scoped to the resource owner unless the caller is an
-- admin/coordinator (public.is_manager()).

alter table agencies enable row level security;
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table campaigns enable row level security;
alter table campaign_assets enable row level security;
alter table videos enable row level security;
alter table contacts enable row level security;
alter table tasks enable row level security;
alter table commissions enable row level security;
alter table schedules enable row level security;
alter table feed_posts enable row level security;
alter table feed_likes enable row level security;
alter table feed_comments enable row level security;
alter table activity_logs enable row level security;

-- agencies: readable/updatable by members; created exclusively via create_agency() RPC
create policy "agencies_select_own" on agencies
  for select using (id = public.current_agency_id());

create policy "agencies_update_admin" on agencies
  for update using (id = public.current_agency_id() and public.is_manager());

-- profiles: visible to agency members; self-updatable, admins can update anyone in agency
create policy "profiles_select_agency" on profiles
  for select using (agency_id = public.current_agency_id());

create policy "profiles_update_self_or_admin" on profiles
  for update using (
    id = auth.uid()
    or (agency_id = public.current_agency_id() and public.is_manager())
  );

-- properties
create policy "properties_select_agency" on properties
  for select using (agency_id = public.current_agency_id());

create policy "properties_insert_agency" on properties
  for insert with check (agency_id = public.current_agency_id());

create policy "properties_update_owner_or_manager" on properties
  for update using (
    agency_id = public.current_agency_id()
    and (created_by = auth.uid() or public.is_manager())
  );

create policy "properties_delete_owner_or_manager" on properties
  for delete using (
    agency_id = public.current_agency_id()
    and (created_by = auth.uid() or public.is_manager())
  );

-- property_images
create policy "property_images_select_agency" on property_images
  for select using (agency_id = public.current_agency_id());

create policy "property_images_insert_agency" on property_images
  for insert with check (agency_id = public.current_agency_id());

create policy "property_images_update_agency" on property_images
  for update using (
    agency_id = public.current_agency_id()
    and (
      public.is_manager()
      or exists (
        select 1 from properties p
        where p.id = property_images.property_id and p.created_by = auth.uid()
      )
    )
  );

create policy "property_images_delete_agency" on property_images
  for delete using (
    agency_id = public.current_agency_id()
    and (
      public.is_manager()
      or exists (
        select 1 from properties p
        where p.id = property_images.property_id and p.created_by = auth.uid()
      )
    )
  );

-- campaigns
create policy "campaigns_select_agency" on campaigns
  for select using (agency_id = public.current_agency_id());

create policy "campaigns_insert_agency" on campaigns
  for insert with check (agency_id = public.current_agency_id());

create policy "campaigns_update_owner_or_manager" on campaigns
  for update using (
    agency_id = public.current_agency_id()
    and (created_by = auth.uid() or public.is_manager())
  );

create policy "campaigns_delete_owner_or_manager" on campaigns
  for delete using (
    agency_id = public.current_agency_id()
    and (created_by = auth.uid() or public.is_manager())
  );

-- campaign_assets
create policy "campaign_assets_select_agency" on campaign_assets
  for select using (agency_id = public.current_agency_id());

create policy "campaign_assets_insert_agency" on campaign_assets
  for insert with check (agency_id = public.current_agency_id());

create policy "campaign_assets_update_agency" on campaign_assets
  for update using (agency_id = public.current_agency_id());

create policy "campaign_assets_delete_agency" on campaign_assets
  for delete using (
    agency_id = public.current_agency_id() and public.is_manager()
  );

-- videos
create policy "videos_select_agency" on videos
  for select using (agency_id = public.current_agency_id());

create policy "videos_insert_agency" on videos
  for insert with check (agency_id = public.current_agency_id());

create policy "videos_update_agency" on videos
  for update using (agency_id = public.current_agency_id());

-- contacts
create policy "contacts_select_agency" on contacts
  for select using (agency_id = public.current_agency_id());

create policy "contacts_insert_agency" on contacts
  for insert with check (agency_id = public.current_agency_id());

create policy "contacts_update_owner_or_manager" on contacts
  for update using (
    agency_id = public.current_agency_id()
    and (owner_id = auth.uid() or public.is_manager())
  );

create policy "contacts_delete_owner_or_manager" on contacts
  for delete using (
    agency_id = public.current_agency_id()
    and (owner_id = auth.uid() or public.is_manager())
  );

-- tasks
create policy "tasks_select_agency" on tasks
  for select using (agency_id = public.current_agency_id());

create policy "tasks_insert_agency" on tasks
  for insert with check (agency_id = public.current_agency_id());

create policy "tasks_update_related_or_manager" on tasks
  for update using (
    agency_id = public.current_agency_id()
    and (
      assigned_to = auth.uid()
      or created_by = auth.uid()
      or public.is_manager()
    )
  );

create policy "tasks_delete_related_or_manager" on tasks
  for delete using (
    agency_id = public.current_agency_id()
    and (
      assigned_to = auth.uid()
      or created_by = auth.uid()
      or public.is_manager()
    )
  );

-- commissions: agents only see their own, managers see all of the agency
create policy "commissions_select_scoped" on commissions
  for select using (
    agency_id = public.current_agency_id()
    and (agent_id = auth.uid() or public.is_manager())
  );

create policy "commissions_insert_manager" on commissions
  for insert with check (
    agency_id = public.current_agency_id() and public.is_manager()
  );

create policy "commissions_update_manager" on commissions
  for update using (
    agency_id = public.current_agency_id() and public.is_manager()
  );

create policy "commissions_delete_manager" on commissions
  for delete using (
    agency_id = public.current_agency_id() and public.is_manager()
  );

-- schedules
create policy "schedules_select_agency" on schedules
  for select using (agency_id = public.current_agency_id());

create policy "schedules_insert_self_or_manager" on schedules
  for insert with check (
    agency_id = public.current_agency_id()
    and (user_id = auth.uid() or public.is_manager())
  );

create policy "schedules_update_self_or_manager" on schedules
  for update using (
    agency_id = public.current_agency_id()
    and (user_id = auth.uid() or public.is_manager())
  );

create policy "schedules_delete_self_or_manager" on schedules
  for delete using (
    agency_id = public.current_agency_id()
    and (user_id = auth.uid() or public.is_manager())
  );

-- feed_posts: visible to whole agency, anyone can author, author/manager can edit
create policy "feed_posts_select_agency" on feed_posts
  for select using (agency_id = public.current_agency_id());

create policy "feed_posts_insert_agency" on feed_posts
  for insert with check (
    agency_id = public.current_agency_id() and author_id = auth.uid()
  );

create policy "feed_posts_update_author_or_manager" on feed_posts
  for update using (
    agency_id = public.current_agency_id()
    and (author_id = auth.uid() or public.is_manager())
  );

create policy "feed_posts_delete_author_or_manager" on feed_posts
  for delete using (
    agency_id = public.current_agency_id()
    and (author_id = auth.uid() or public.is_manager())
  );

-- feed_likes: a user can like/unlike for themselves
create policy "feed_likes_select_agency" on feed_likes
  for select using (agency_id = public.current_agency_id());

create policy "feed_likes_insert_self" on feed_likes
  for insert with check (
    agency_id = public.current_agency_id() and user_id = auth.uid()
  );

create policy "feed_likes_delete_self" on feed_likes
  for delete using (
    agency_id = public.current_agency_id() and user_id = auth.uid()
  );

-- feed_comments: author or admin can delete; anyone in agency can comment
create policy "feed_comments_select_agency" on feed_comments
  for select using (agency_id = public.current_agency_id());

create policy "feed_comments_insert_self" on feed_comments
  for insert with check (
    agency_id = public.current_agency_id() and user_id = auth.uid()
  );

create policy "feed_comments_delete_author_or_manager" on feed_comments
  for delete using (
    agency_id = public.current_agency_id()
    and (user_id = auth.uid() or public.is_manager())
  );

-- activity_logs: append-only, agency-wide read
create policy "activity_logs_select_agency" on activity_logs
  for select using (agency_id = public.current_agency_id());

create policy "activity_logs_insert_agency" on activity_logs
  for insert with check (agency_id = public.current_agency_id());
