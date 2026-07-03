-- ImoBoost AI — demo user provisioning via RPC (no service-role key required at runtime)
--
-- Creates a SECURITY DEFINER function callable by the anon role.
-- The function runs as 'postgres' and therefore has full access to auth.* tables.
-- It creates (or repairs) the demo user so that signInWithPassword works.
--
-- Security: the function is intentionally public — it can only create/reset the
-- fixed demo account (demo@imoboost.ai) and its associated agency/profile.
-- The demo password is already public in lib/demo.ts.

create or replace function public.provision_demo_user()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_agency_id uuid := 'd2a9c32a-21d1-512b-9bdb-cb725f65c671';
  v_email     text := 'demo@imoboost.ai';
  v_password  text := 'ImoBoost2024!';
begin
  -- Look up existing auth user by email
  select id into v_user_id
  from auth.users
  where email = v_email
  limit 1;

  if v_user_id is null then
    -- Create a brand-new auth user with a deterministic UUID so that any existing
    -- profile / agency data with that id survives re-runs.
    v_user_id := 'd2a9c32a-21d1-512b-9bdb-cb725f65c670';  -- deterministic demo user UUID

    insert into auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf', 10)),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Beatriz Albi"}'::jsonb,
      false,
      now(),
      now()
    )
    on conflict (id) do update
      set encrypted_password  = crypt(v_password, gen_salt('bf', 10)),
          email_confirmed_at  = coalesce(auth.users.email_confirmed_at, now()),
          updated_at          = now();
  else
    -- User already exists — just refresh the password hash and confirm email.
    update auth.users
    set encrypted_password = crypt(v_password, gen_salt('bf', 10)),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at         = now()
    where id = v_user_id;
  end if;

  -- Ensure there is an email identity row (required for signInWithPassword).
  -- Modern GoTrue uses (provider, provider_id) as PK where provider_id = email.
  insert into auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    v_email,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  -- Ensure demo agency exists.
  insert into public.agencies (id, name, primary_color)
  values (v_agency_id, 'Albi Imobiliária', '#0e3d39')
  on conflict (id) do nothing;

  -- Ensure demo profile exists (upsert keeps any existing fields).
  insert into public.profiles (id, agency_id, full_name, email, role)
  values (v_user_id, v_agency_id, 'Beatriz Albi', v_email, 'admin')
  on conflict (id) do update
    set agency_id  = excluded.agency_id,
        full_name  = excluded.full_name,
        email      = excluded.email,
        role       = excluded.role;

  return json_build_object('ok', true, 'user_id', v_user_id);
end;
$$;

-- Allow the anonymous (unauthenticated) role to call this function.
-- This is intentional: the demo account is public by design.
grant execute on function public.provision_demo_user() to anon;
