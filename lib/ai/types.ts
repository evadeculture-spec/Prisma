import type { CommunicationTone, DealType, PropertyType } from "@/lib/types/domain";

export interface PropertyAIInput {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: PropertyType;
  dealType: DealType;
  bedrooms: number;
  bathrooms: number;
  usefulArea: number | null;
  grossArea: number | null;
  hasGarage: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  energyCertificate: string | null;
  targetAudience: string[];
  strengths: string | null;
  weaknesses: string | null;
  tone: CommunicationTone;
  agencyName?: string;
}

export interface InstagramCarouselSlide {
  slide: number;
  headline: string;
  body: string;
}

export interface MetaAdContent {
  headline: string;
  primaryText: string;
  description: string;
}

export interface ContentCalendarDay {
  day: number;
  label: string;
  channel: string;
  action: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  type: "call" | "visit" | "publication" | "follow_up" | "meeting" | "documentation" | "listing";
  priority: "low" | "medium" | "high" | "urgent";
  dueInDays: number;
}

export interface GeneratedCampaignContent {
  commercialTitle: string;
  instagramCaption: string;
  portalDescription: string;
  facebookCopy: string;
  whatsappMessage: string;
  reelScript: string;
  videoScript: string;
  hashtags: string[];
  ctas: string[];
  storyParts: [string, string, string];
  instagramCarousel: InstagramCarouselSlide[];
  metaAd: MetaAdContent;
  newsletter: string;
  contentCalendar: ContentCalendarDay[];
  commercialTasks: GeneratedTask[];
}
