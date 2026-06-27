import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Campaign, CampaignAsset, Property, Task, Video } from "@/lib/types/domain";

export interface CampaignDetail {
  campaign: Campaign;
  property: Property | null;
  assets: CampaignAsset[];
  tasks: Task[];
  video: Video | null;
}

export async function getCampaignsForProperty(propertyId: string, agencyId: string): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("property_id", propertyId)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Campaign[];
}

export async function getCampaignDetail(campaignId: string, agencyId: string): Promise<CampaignDetail | null> {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (!campaign) return null;

  const [{ data: property }, { data: assets }, { data: tasks }, { data: videos }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", campaign.property_id).eq("agency_id", agencyId).maybeSingle(),
    supabase.from("campaign_assets").select("*").eq("campaign_id", campaignId).eq("agency_id", agencyId),
    supabase.from("tasks").select("*").eq("campaign_id", campaignId).eq("agency_id", agencyId).order("due_date", { ascending: true }),
    supabase
      .from("videos")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  return {
    campaign: campaign as Campaign,
    property: (property as Property | null) ?? null,
    assets: (assets ?? []) as CampaignAsset[],
    tasks: (tasks ?? []) as Task[],
    video: ((videos ?? [])[0] as Video | undefined) ?? null,
  };
}
