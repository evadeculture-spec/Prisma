// Domain types mirroring the Supabase schema (see supabase/migrations).
// Hand-written rather than generated so the app layer can stay decoupled
// from the exact wire format Supabase returns.

export type UserRole = "admin" | "coordinator" | "agent" | "marketing";

export type PropertyType =
  | "t0"
  | "t1"
  | "t2"
  | "t3"
  | "t4"
  | "t5"
  | "t6_plus"
  | "studio"
  | "villa"
  | "land"
  | "store"
  | "office"
  | "warehouse"
  | "garage"
  | "other";

export type DealType = "sale" | "rent";

export type PropertyCondition =
  | "new"
  | "as_new"
  | "used"
  | "renovated"
  | "to_renovate"
  | "under_construction";

export type CommunicationTone =
  | "premium"
  | "emotional"
  | "direct"
  | "young"
  | "family"
  | "luxury"
  | "investment"
  | "minimalist";

export type PropertyStatus = "draft" | "active" | "reserved" | "sold" | "rented" | "archived";

export type ImageLabel =
  | "main"
  | "living_room"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "exterior"
  | "view"
  | "floor_plan"
  | "other";

export type ImageStatus = "original" | "processing" | "enhanced" | "approved" | "rejected";

export type CampaignStatus = "generating" | "draft" | "ready" | "approved" | "published";

export type AssetType =
  | "commercial_title"
  | "instagram_caption"
  | "portal_description"
  | "facebook_copy"
  | "whatsapp_message"
  | "reel_script"
  | "video_script"
  | "hashtags"
  | "cta"
  | "story_sequence"
  | "instagram_carousel"
  | "meta_ad"
  | "newsletter"
  | "content_calendar";

export type AssetStatus = "draft" | "approved" | "rejected";

export type VideoType = "cinematic_tour" | "luxury_real_estate" | "social_reel" | "before_after" | "lifestyle";
export type VideoFormat = "vertical_9_16" | "square_1_1" | "horizontal_16_9";
export type VideoStatus =
  | "queued"
  | "preparing_images"
  | "building_prompt"
  | "sending"
  | "processing"
  | "ready"
  | "failed";

export type ContactType = "buyer" | "seller" | "investor" | "tenant" | "partner";
export type ContactSource =
  | "instagram"
  | "facebook"
  | "idealista"
  | "website"
  | "referral"
  | "phone_call"
  | "walk_in"
  | "whatsapp"
  | "other";
export type ContactInterest = "buy" | "sell" | "rent" | "invest";
export type ContactStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "visit_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "closed"
  | "lost";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskType = "call" | "visit" | "publication" | "follow_up" | "meeting" | "documentation" | "listing";

export type CommissionStatus = "expected" | "negotiating" | "closed" | "paid";

export type ShiftType = "on_duty" | "visits" | "store" | "prospecting" | "rest";

export type FeedPostType =
  | "internal_news"
  | "partnership"
  | "featured_property"
  | "training"
  | "management_notice"
  | "sale_achievement"
  | "new_agent"
  | "event"
  | "open_house"
  | "campaign";

export interface Agency {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  agency_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  agency_id: string;
  created_by: string | null;
  title: string;
  commercial_title: string | null;
  location: string;
  price: number;
  property_type: PropertyType;
  deal_type: DealType;
  bedrooms: number;
  bathrooms: number;
  useful_area: number | null;
  gross_area: number | null;
  has_garage: boolean;
  has_garden: boolean;
  has_pool: boolean;
  condition: PropertyCondition;
  energy_certificate: string | null;
  description: string | null;
  target_audience: string[];
  strengths: string | null;
  weaknesses: string | null;
  tone: CommunicationTone;
  status: PropertyStatus;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  agency_id: string;
  url: string;
  label: ImageLabel;
  is_main: boolean;
  status: ImageStatus;
  created_at: string;
}

export interface Campaign {
  id: string;
  agency_id: string;
  property_id: string;
  created_by: string | null;
  title: string;
  status: CampaignStatus;
  generated_content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CampaignAsset {
  id: string;
  agency_id: string;
  campaign_id: string;
  type: AssetType;
  title: string;
  content: unknown;
  status: AssetStatus;
  created_at: string;
}

export interface Video {
  id: string;
  agency_id: string;
  property_id: string | null;
  campaign_id: string | null;
  provider: string;
  video_type: VideoType;
  format: VideoFormat;
  duration: number;
  music_mood: string | null;
  overlay_text: string | null;
  agency_logo: boolean;
  prompt: string | null;
  provider_job_id: string | null;
  status: VideoStatus;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  agency_id: string;
  owner_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  type: ContactType;
  source: ContactSource;
  interest: ContactInterest;
  budget: number | null;
  desired_location: string | null;
  desired_typology: PropertyType | null;
  status: ContactStatus;
  notes: string | null;
  next_action: string | null;
  related_property_id: string | null;
  gdpr_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  agency_id: string;
  assigned_to: string | null;
  created_by: string | null;
  property_id: string | null;
  contact_id: string | null;
  campaign_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  type: TaskType;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  agency_id: string;
  agent_id: string | null;
  property_id: string | null;
  property_value: number;
  agency_commission_percentage: number;
  agent_percentage: number;
  agency_commission_amount: number;
  agent_commission_amount: number;
  status: CommissionStatus;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  agency_id: string;
  user_id: string;
  date: string;
  shift_type: ShiftType;
  notes: string | null;
  created_at: string;
}

export interface FeedPost {
  id: string;
  agency_id: string;
  author_id: string | null;
  type: FeedPostType;
  title: string;
  content: string;
  image_url: string | null;
  related_property_id: string | null;
  related_campaign_id: string | null;
  is_pinned: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedLike {
  id: string;
  agency_id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface FeedComment {
  id: string;
  agency_id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  agency_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
