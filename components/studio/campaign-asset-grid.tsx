"use client";

import {
  Clapperboard,
  FileText,
  GalleryHorizontal,
  Hash,
  Heading,
  Images,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Sparkles,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CampaignContentCard } from "@/components/studio/campaign-content-card";
import { setAssetStatusAction } from "@/lib/actions/campaigns";
import type { InstagramCarouselSlide, MetaAdContent } from "@/lib/ai/types";
import type { AssetType, CampaignAsset } from "@/lib/types/domain";

const ASSET_ICON: Record<Exclude<AssetType, "content_calendar">, LucideIcon> = {
  commercial_title: Heading,
  instagram_caption: Images,
  portal_description: FileText,
  facebook_copy: Megaphone,
  whatsapp_message: MessageCircle,
  reel_script: Clapperboard,
  video_script: Video,
  hashtags: Hash,
  cta: MousePointerClick,
  story_sequence: GalleryHorizontal,
  instagram_carousel: ListChecks,
  meta_ad: Sparkles,
  newsletter: Mail,
};

function renderContent(asset: CampaignAsset): string | string[] {
  switch (asset.type) {
    case "hashtags":
    case "cta":
    case "story_sequence":
      return asset.content as string[];
    case "instagram_carousel": {
      const slides = asset.content as InstagramCarouselSlide[];
      return slides.map((slide) => `Slide ${slide.slide}: ${slide.headline}\n${slide.body}`).join("\n\n");
    }
    case "meta_ad": {
      const ad = asset.content as MetaAdContent;
      return `Título: ${ad.headline}\n\nTexto principal: ${ad.primaryText}\n\nDescrição: ${ad.description}`;
    }
    default:
      return asset.content as string;
  }
}

interface CampaignAssetGridProps {
  assets: CampaignAsset[];
  campaignId: string;
  className?: string;
}

export function CampaignAssetGrid({ assets, campaignId, className }: CampaignAssetGridProps) {
  const visibleAssets = assets.filter((asset) => asset.type !== "content_calendar");

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        {visibleAssets.map((asset) => (
          <CampaignContentCard
            key={asset.id}
            title={asset.title}
            content={renderContent(asset)}
            icon={ASSET_ICON[asset.type as Exclude<AssetType, "content_calendar">]}
            status={asset.status}
            onApprove={() => void setAssetStatusAction(asset.id, campaignId, "approved")}
            onReject={() => void setAssetStatusAction(asset.id, campaignId, "rejected")}
          />
        ))}
      </div>
    </div>
  );
}
