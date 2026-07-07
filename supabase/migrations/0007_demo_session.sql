-- ImoBoost AI — per-session demo workspace
--
-- create_demo_session() is called immediately after signInAnonymously().
-- It creates a fully isolated agency + profile + seed data for the anon user
-- so they get the complete app experience without any shared state.
-- Multiple simultaneous demo sessions never see each other's data.
--
-- The function is idempotent: calling it again for a user who already has a
-- profile is a no-op, so double-clicks / retries are safe.

create or replace function public.create_demo_session()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_agency_id uuid;
  v_now       timestamptz := now();

  -- deterministic-within-session UUIDs so FK references work
  p1 uuid := gen_random_uuid();
  p2 uuid := gen_random_uuid();
  p3 uuid := gen_random_uuid();
  p4 uuid := gen_random_uuid();
  p5 uuid := gen_random_uuid();

  c1 uuid := gen_random_uuid();
  c2 uuid := gen_random_uuid();
  c3 uuid := gen_random_uuid();
  c4 uuid := gen_random_uuid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  -- Idempotent guard
  if exists (select 1 from public.profiles where id = v_user_id) then
    return;
  end if;

  -- 1. Agency
  insert into public.agencies (id, name, primary_color)
  values (gen_random_uuid(), 'Albi Imobiliária', '#0e3d39')
  returning id into v_agency_id;

  -- 2. Profile (anonymous users have no email — use a placeholder)
  insert into public.profiles (id, agency_id, full_name, email, role)
  values (
    v_user_id,
    v_agency_id,
    'Beatriz Albi',
    coalesce((select email from auth.users where id = v_user_id), 'demo@demo.local'),
    'admin'
  );

  -- 3. Properties
  insert into public.properties
    (id, agency_id, created_by, title, commercial_title, location, price,
     property_type, deal_type, bedrooms, bathrooms, useful_area, gross_area,
     has_garage, has_garden, has_pool, condition, energy_certificate,
     description, target_audience, strengths, tone, status, cover_image_url,
     created_at, updated_at)
  values
    (p1, v_agency_id, v_user_id,
     'Apartamento T3 com vista rio',
     'Vista Rio Deslumbrante no Coração de Alcântara',
     'Alcântara, Lisboa', 485000, 't3', 'sale', 3, 2, 120, 135,
     true, false, false, 'renovated', 'B',
     'Apartamento totalmente renovado com vista desafogada sobre o rio Tejo.',
     ARRAY['familia'], 'Vista rio, renovado, luminoso',
     'premium', 'active',
     'https://picsum.photos/seed/imoboost-t3-lisboa-1/1200/800',
     v_now - interval '10 days', v_now - interval '2 days'),

    (p2, v_agency_id, v_user_id,
     'Moradia V4 com piscina',
     'Refúgio de Luxo a Minutos da Praia de Cascais',
     'Cascais', 950000, 'villa', 'sale', 4, 4, 320, 380,
     true, true, true, 'as_new', 'A',
     'Moradia isolada com piscina privada e jardim maduro em Cascais.',
     ARRAY['luxo'], 'Piscina privada, jardim, garagem dupla',
     'luxury', 'active',
     'https://picsum.photos/seed/imoboost-villa-cascais-1/1200/800',
     v_now - interval '15 days', v_now - interval '1 day'),

    (p3, v_agency_id, v_user_id,
     'Apartamento T1 renovado em Cedofeita', null,
     'Cedofeita, Porto', 175000, 't1', 'sale', 1, 1, 55, 60,
     false, false, false, 'renovated', 'C',
     'T1 completamente remodelado em 2024, zona histórica do Porto.',
     ARRAY['investidor'], 'Remodelado, localização central',
     'young', 'reserved',
     'https://picsum.photos/seed/imoboost-t1-porto-1/1200/800',
     v_now - interval '20 days', v_now - interval '3 days'),

    (p4, v_agency_id, v_user_id,
     'T2 para arrendar em Braga', null,
     'Braga', 750, 't2', 'rent', 2, 1, 80, 85,
     false, false, false, 'used', 'D',
     'Apartamento T2 bem localizado, próximo do centro histórico de Braga.',
     ARRAY['familia'], 'Localização central, bons transportes',
     'family', 'active',
     'https://picsum.photos/seed/imoboost-t2-braga-1/1200/800',
     v_now - interval '5 days', v_now - interval '1 day'),

    (p5, v_agency_id, v_user_id,
     'Loft T0 moderno em Setúbal', null,
     'Setúbal', 120000, 'studio', 'sale', 0, 1, 38, 40,
     false, false, false, 'new', 'A',
     'Loft compacto e funcional, acabamentos modernos, ideal para investimento.',
     ARRAY['investidor'], 'Acabamentos modernos, novo',
     'direct', 'sold',
     'https://picsum.photos/seed/imoboost-loft-setubal-1/1200/800',
     v_now - interval '30 days', v_now - interval '7 days');

  -- 4. Contacts
  insert into public.contacts
    (id, agency_id, owner_id, name, phone, email, type, source, interest,
     budget, desired_location, desired_typology, status, notes, next_action,
     related_property_id, gdpr_consent, created_at, updated_at)
  values
    (c1, v_agency_id, v_user_id,
     'Sofia Martins', '+351 912 345 678', 'sofia.martins@example.com',
     'buyer', 'instagram', 'buy', 500000, 'Lisboa', 't3',
     'visit_scheduled',
     'Muito interessada na vista rio, quer levar o marido a uma segunda visita.',
     'Agendar 2ª visita para o fim de semana',
     p1, true, v_now - interval '5 days', v_now - interval '3 hours'),

    (c2, v_agency_id, v_user_id,
     'Tiago Ferreira', '+351 933 222 111', 'tiago.ferreira@example.com',
     'buyer', 'idealista', 'buy', 1000000, 'Cascais', 'villa',
     'negotiation',
     'Já fez proposta inicial, a negociar condições de pagamento.',
     'Confirmar resposta à contraproposta',
     p2, true, v_now - interval '8 days', v_now - interval '6 hours'),

    (c3, v_agency_id, v_user_id,
     'Ana Rodrigues', '+351 925 555 333', 'ana.rodrigues@example.com',
     'buyer', 'website', 'buy', 200000, 'Porto', 't1',
     'closed',
     'Negócio fechado, à espera da escritura.',
     'Agendar escritura',
     p3, true, v_now - interval '20 days', v_now - interval '3 days'),

    (c4, v_agency_id, v_user_id,
     'Miguel Alves', '+351 938 111 999', 'miguel.alves@example.com',
     'investor', 'facebook', 'invest', 700000, 'Sintra', 'land',
     'qualified',
     'Procura terrenos com potencial turístico.',
     'Enviar dossier da Quinta de Sintra',
     null, false, v_now - interval '3 days', v_now - interval '12 hours');

  -- 5. Tasks
  insert into public.tasks
    (agency_id, assigned_to, created_by, contact_id, property_id,
     title, description, priority, type, due_date, status, created_at, updated_at)
  values
    (v_agency_id, v_user_id, v_user_id, c1, null,
     'Ligar para Sofia Martins',
     'Confirmar detalhes da 2ª visita ao apartamento.',
     'high', 'call', current_date, 'pending',
     v_now - interval '1 day', v_now - interval '1 day'),

    (v_agency_id, v_user_id, v_user_id, c2, p2,
     'Visita — Moradia em Cascais',
     'Acompanhar o Tiago Ferreira na visita à moradia.',
     'high', 'visit', current_date + 1, 'pending',
     v_now - interval '2 days', v_now - interval '2 days'),

    (v_agency_id, v_user_id, v_user_id, null, p5,
     'Angariação — Quinta em Sintra',
     'Validar limites do terreno e regularizar documentação.',
     'urgent', 'listing', current_date, 'in_progress',
     v_now - interval '3 days', v_now - interval '4 hours'),

    (v_agency_id, v_user_id, v_user_id, null, null,
     'Reunião de equipa semanal',
     'Rever pipeline comercial e prioridades da semana.',
     'medium', 'meeting', current_date + 1, 'pending',
     v_now - interval '1 day', v_now - interval '1 day');

  -- 6. Commissions
  insert into public.commissions
    (agency_id, agent_id, property_id, property_value,
     agency_commission_percentage, agent_percentage,
     status, expected_close_date, created_at)
  values
    (v_agency_id, v_user_id, p1, 485000, 5, 50,
     'negotiating', current_date + 30, v_now - interval '10 days'),
    (v_agency_id, v_user_id, p2, 950000, 5, 60,
     'expected', current_date + 45, v_now - interval '15 days'),
    (v_agency_id, v_user_id, p5, 120000, 5, 50,
     'closed', current_date - 7, v_now - interval '30 days');

  -- 7. Feed posts
  insert into public.feed_posts
    (agency_id, author_id, type, title, content, is_pinned,
     related_property_id, created_at, updated_at)
  values
    (v_agency_id, v_user_id, 'management_notice',
     'Bem-vindos ao ImoBoost AI',
     'A partir de hoje toda a equipa passa a usar o ImoBoost AI para gerir imóveis, leads e comunicação interna. Qualquer dúvida, fala comigo!',
     true, null,
     v_now - interval '7 days', v_now - interval '7 days'),

    (v_agency_id, v_user_id, 'sale_achievement',
     'Negócio fechado: Loft T0 moderno em Setúbal',
     'Negócio fechado no valor de 120.000 €. Excelente trabalho de toda a equipa!',
     false, p5,
     v_now - interval '3 days', v_now - interval '3 days'),

    (v_agency_id, v_user_id, 'open_house',
     'Casa aberta este sábado — Quinta em Sintra',
     'Vamos receber visitas sem marcação prévia este sábado entre as 14h e as 17h. Tragam os vossos clientes investidores!',
     false, null,
     v_now - interval '18 hours', v_now - interval '18 hours'),

    (v_agency_id, v_user_id, 'training',
     'Formação: Como usar o Estúdio de Marketing AI',
     'Quinta-feira às 10h, sessão prática sobre como gerar packs de promoção completos em minutos.',
     false, null,
     v_now - interval '6 hours', v_now - interval '6 hours');

end;
$$;

-- Callable by any authenticated user (anonymous sessions are 'authenticated' in GoTrue).
grant execute on function public.create_demo_session() to authenticated;

-- Also fix create_agency() to handle anonymous users (null email in auth.users).
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
    coalesce((select email from auth.users where id = auth.uid()), p_full_name || '@demo.local'),
    'admin'
  );

  return v_agency_id;
end;
$$;

-- Cleanup: removes anonymous demo sessions older than 24 h.
-- Cascade deletes on agencies remove all scoped data automatically.
-- Schedule via pg_cron or Supabase Edge Function (or enable "Delete anonymous
-- users" in Authentication settings for automatic cleanup).
create or replace function public.cleanup_demo_sessions()
returns int
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  deleted_count int := 0;
begin
  delete from public.agencies ag
  using public.profiles pr
  join auth.users u on u.id = pr.id
  where pr.agency_id = ag.id
    and u.email is null
    and u.created_at < now() - interval '24 hours';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.cleanup_demo_sessions() to postgres;
