-- ImoBoost AI — helper functions, triggers, onboarding RPCs

-- Returns the agency_id of the currently authenticated user.
-- SECURITY DEFINER avoids RLS recursion when policies reference profiles.
create or replace function public.current_agency_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select agency_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_manager()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_role() in ('admin', 'coordinator'), false);
$$;

-- Generic updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_properties_updated_at on properties;
create trigger trg_properties_updated_at before update on properties
  for each row execute function public.set_updated_at();

drop trigger if exists trg_campaigns_updated_at on campaigns;
create trigger trg_campaigns_updated_at before update on campaigns
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contacts_updated_at on contacts;
create trigger trg_contacts_updated_at before update on contacts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at before update on tasks
  for each row execute function public.set_updated_at();

drop trigger if exists trg_commissions_updated_at on commissions;
create trigger trg_commissions_updated_at before update on commissions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_feed_posts_updated_at on feed_posts;
create trigger trg_feed_posts_updated_at before update on feed_posts
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user carries agency metadata
-- (used for team invites; self-signup users go through the onboarding RPC instead).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ->> 'agency_id' is not null then
    insert into public.profiles (id, agency_id, full_name, email, role, avatar_url)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'agency_id')::uuid,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
      new.email,
      coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'agent'),
      new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomically creates a new agency plus the founding admin profile.
-- Used by the onboarding flow; direct inserts into agencies/profiles are not
-- exposed to clients so a user can never attach themselves to an arbitrary agency.
create or replace function public.create_agency(
  p_name text,
  p_full_name text,
  p_logo_url text default null,
  p_primary_color text default '#0e3d39'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agency_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'profile already exists for this user';
  end if;

  insert into public.agencies (name, logo_url, primary_color)
  values (p_name, p_logo_url, p_primary_color)
  returning id into v_agency_id;

  insert into public.profiles (id, agency_id, full_name, email, role)
  values (
    auth.uid(),
    v_agency_id,
    p_full_name,
    (select email from auth.users where id = auth.uid()),
    'admin'
  );

  return v_agency_id;
end;
$$;
