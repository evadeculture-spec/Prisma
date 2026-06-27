-- ImoBoost AI — core schema

create table if not exists agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  primary_color text default '#0e3d39',
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  agency_id uuid not null references agencies (id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'agent',
  avatar_url text,
  created_at timestamptz not null default now()
);
create index if not exists profiles_agency_idx on profiles (agency_id);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  created_by uuid references profiles (id) on delete set null,
  title text not null,
  commercial_title text,
  location text not null,
  price numeric(12, 2) not null default 0,
  property_type property_type not null default 'other',
  deal_type deal_type not null default 'sale',
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  useful_area numeric(8, 2),
  gross_area numeric(8, 2),
  has_garage boolean not null default false,
  has_garden boolean not null default false,
  has_pool boolean not null default false,
  condition property_condition not null default 'used',
  energy_certificate text,
  description text,
  target_audience text[] not null default '{}',
  strengths text,
  weaknesses text,
  tone communication_tone not null default 'premium',
  status property_status not null default 'draft',
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists properties_agency_idx on properties (agency_id);
create index if not exists properties_created_by_idx on properties (created_by);
create index if not exists properties_status_idx on properties (agency_id, status);

create table if not exists property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id) on delete cascade,
  agency_id uuid not null references agencies (id) on delete cascade,
  url text not null,
  label image_label not null default 'other',
  is_main boolean not null default false,
  status image_status not null default 'original',
  created_at timestamptz not null default now()
);
create index if not exists property_images_property_idx on property_images (property_id);
create index if not exists property_images_agency_idx on property_images (agency_id);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  created_by uuid references profiles (id) on delete set null,
  title text not null,
  status campaign_status not null default 'generating',
  generated_content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campaigns_agency_idx on campaigns (agency_id);
create index if not exists campaigns_property_idx on campaigns (property_id);

create table if not exists campaign_assets (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  campaign_id uuid not null references campaigns (id) on delete cascade,
  type asset_type not null,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status asset_status not null default 'draft',
  created_at timestamptz not null default now()
);
create index if not exists campaign_assets_campaign_idx on campaign_assets (campaign_id);
create index if not exists campaign_assets_agency_idx on campaign_assets (agency_id);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  property_id uuid references properties (id) on delete cascade,
  campaign_id uuid references campaigns (id) on delete set null,
  provider text not null default 'mock',
  video_type video_type not null default 'social_reel',
  format video_format not null default 'vertical_9_16',
  duration int not null default 15,
  music_mood text,
  overlay_text text,
  agency_logo boolean not null default true,
  prompt text,
  provider_job_id text,
  status video_status not null default 'queued',
  video_url text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);
create index if not exists videos_agency_idx on videos (agency_id);
create index if not exists videos_property_idx on videos (property_id);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  owner_id uuid references profiles (id) on delete set null,
  name text not null,
  phone text,
  email text,
  type contact_type not null default 'buyer',
  source contact_source not null default 'other',
  interest contact_interest not null default 'buy',
  budget numeric(12, 2),
  desired_location text,
  desired_typology property_type,
  status contact_status not null default 'new',
  notes text,
  next_action text,
  related_property_id uuid references properties (id) on delete set null,
  gdpr_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_agency_idx on contacts (agency_id);
create index if not exists contacts_owner_idx on contacts (owner_id);
create index if not exists contacts_status_idx on contacts (agency_id, status);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  assigned_to uuid references profiles (id) on delete set null,
  created_by uuid references profiles (id) on delete set null,
  property_id uuid references properties (id) on delete cascade,
  contact_id uuid references contacts (id) on delete cascade,
  campaign_id uuid references campaigns (id) on delete cascade,
  title text not null,
  description text,
  priority task_priority not null default 'medium',
  type task_type not null default 'follow_up',
  due_date date,
  status task_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_agency_idx on tasks (agency_id);
create index if not exists tasks_assigned_idx on tasks (assigned_to);
create index if not exists tasks_status_idx on tasks (agency_id, status);

create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  agent_id uuid references profiles (id) on delete set null,
  property_id uuid references properties (id) on delete cascade,
  property_value numeric(12, 2) not null default 0,
  agency_commission_percentage numeric(5, 2) not null default 5,
  agent_percentage numeric(5, 2) not null default 50,
  agency_commission_amount numeric(12, 2) generated always as (
    round(property_value * agency_commission_percentage / 100, 2)
  ) stored,
  agent_commission_amount numeric(12, 2) generated always as (
    round(property_value * agency_commission_percentage / 100 * agent_percentage / 100, 2)
  ) stored,
  status commission_status not null default 'expected',
  expected_close_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists commissions_agency_idx on commissions (agency_id);
create index if not exists commissions_agent_idx on commissions (agent_id);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  date date not null,
  shift_type shift_type not null default 'on_duty',
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date, shift_type)
);
create index if not exists schedules_agency_idx on schedules (agency_id);
create index if not exists schedules_date_idx on schedules (agency_id, date);

create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  author_id uuid references profiles (id) on delete set null,
  type feed_post_type not null default 'internal_news',
  title text not null,
  content text not null default '',
  image_url text,
  related_property_id uuid references properties (id) on delete set null,
  related_campaign_id uuid references campaigns (id) on delete set null,
  is_pinned boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists feed_posts_agency_idx on feed_posts (agency_id);
create index if not exists feed_posts_created_idx on feed_posts (agency_id, created_at desc);

create table if not exists feed_likes (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  post_id uuid not null references feed_posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists feed_likes_post_idx on feed_likes (post_id);

create table if not exists feed_comments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  post_id uuid not null references feed_posts (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists feed_comments_post_idx on feed_comments (post_id);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_agency_idx on activity_logs (agency_id, created_at desc);
