-- ImoBoost AI — base extensions and enumerated types
create extension if not exists "pgcrypto";

do $$ begin
  create type user_role as enum ('admin', 'coordinator', 'agent', 'marketing');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_type as enum (
    't0', 't1', 't2', 't3', 't4', 't5', 't6_plus',
    'studio', 'villa', 'land', 'store', 'office', 'warehouse', 'garage', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type deal_type as enum ('sale', 'rent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_condition as enum (
    'new', 'as_new', 'used', 'renovated', 'to_renovate', 'under_construction'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type communication_tone as enum (
    'premium', 'emotional', 'direct', 'young', 'family', 'luxury', 'investment', 'minimalist'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_status as enum (
    'draft', 'active', 'reserved', 'sold', 'rented', 'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type image_label as enum (
    'main', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'exterior', 'view', 'floor_plan', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type image_status as enum ('original', 'processing', 'enhanced', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('generating', 'draft', 'ready', 'approved', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_type as enum (
    'commercial_title', 'instagram_caption', 'portal_description', 'facebook_copy',
    'whatsapp_message', 'reel_script', 'video_script', 'hashtags', 'cta',
    'story_sequence', 'instagram_carousel', 'meta_ad', 'newsletter', 'content_calendar'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_status as enum ('draft', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type video_type as enum ('cinematic_tour', 'luxury_real_estate', 'social_reel', 'before_after', 'lifestyle');
exception when duplicate_object then null; end $$;

do $$ begin
  create type video_format as enum ('vertical_9_16', 'square_1_1', 'horizontal_16_9');
exception when duplicate_object then null; end $$;

do $$ begin
  create type video_status as enum (
    'queued', 'preparing_images', 'building_prompt', 'sending', 'processing', 'ready', 'failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_type as enum ('buyer', 'seller', 'investor', 'tenant', 'partner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_source as enum (
    'instagram', 'facebook', 'idealista', 'website', 'referral', 'phone_call', 'walk_in', 'whatsapp', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_interest as enum ('buy', 'sell', 'rent', 'invest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_status as enum (
    'new', 'contacted', 'qualified', 'visit_scheduled', 'proposal_sent', 'negotiation', 'closed', 'lost'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pending', 'in_progress', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_type as enum (
    'call', 'visit', 'publication', 'follow_up', 'meeting', 'documentation', 'listing'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type commission_status as enum ('expected', 'negotiating', 'closed', 'paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shift_type as enum ('on_duty', 'visits', 'store', 'prospecting', 'rest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feed_post_type as enum (
    'internal_news', 'partnership', 'featured_property', 'training', 'management_notice',
    'sale_achievement', 'new_agent', 'event', 'open_house', 'campaign'
  );
exception when duplicate_object then null; end $$;
