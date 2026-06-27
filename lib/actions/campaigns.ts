"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generatePropertyCampaign } from "@/lib/ai/content-generator";
import { getVideoProvider } from "@/lib/video/video-provider";
import { ASSET_TYPE_LABEL } from "@/lib/labels";
import type { GeneratedCampaignContent, PropertyAIInput } from "@/lib/ai/types";
import type { AssetStatus, AssetType, Video, VideoFormat, VideoType } from "@/lib/types/domain";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function assertCampaignInAgency(
  supabase: SupabaseServerClient,
  campaignId: string,
  agencyId: string
): Promise<boolean> {
  const { data } = await supabase.from("campaigns").select("id").eq("id", campaignId).eq("agency_id", agencyId).maybeSingle();
  return Boolean(data);
}

const ASSET_TYPES = Object.keys(ASSET_TYPE_LABEL) as AssetType[];

function contentForAssetType(content: GeneratedCampaignContent, type: AssetType): unknown {
  switch (type) {
    case "commercial_title":
      return content.commercialTitle;
    case "instagram_caption":
      return content.instagramCaption;
    case "portal_description":
      return content.portalDescription;
    case "facebook_copy":
      return content.facebookCopy;
    case "whatsapp_message":
      return content.whatsappMessage;
    case "reel_script":
      return content.reelScript;
    case "video_script":
      return content.videoScript;
    case "hashtags":
      return content.hashtags;
    case "cta":
      return content.ctas;
    case "story_sequence":
      return content.storyParts;
    case "instagram_carousel":
      return content.instagramCarousel;
    case "meta_ad":
      return content.metaAd;
    case "newsletter":
      return content.newsletter;
    case "content_calendar":
      return content.contentCalendar;
  }
}

function dueDateFromDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function generateCampaignAction(propertyId: string): Promise<{ campaignId: string } | { error: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("agency_id", user.agency.id)
    .maybeSingle();

  if (!property) return { error: "Imóvel não encontrado." };

  const { count: existingCampaigns } = await supabase
    .from("campaigns")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("agency_id", user.agency.id);

  const input: PropertyAIInput = {
    id: property.id,
    title: property.title,
    location: property.location,
    price: property.price,
    propertyType: property.property_type,
    dealType: property.deal_type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    usefulArea: property.useful_area,
    grossArea: property.gross_area,
    hasGarage: property.has_garage,
    hasGarden: property.has_garden,
    hasPool: property.has_pool,
    energyCertificate: property.energy_certificate,
    targetAudience: property.target_audience,
    strengths: property.strengths,
    weaknesses: property.weaknesses,
    tone: property.tone,
    agencyName: user.agency.name,
  };

  const content = await generatePropertyCampaign(input, existingCampaigns ?? 0);

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .insert({
      agency_id: user.agency.id,
      property_id: propertyId,
      created_by: user.profile.id,
      title: content.commercialTitle || property.title,
      status: "ready",
      generated_content: content as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    return { error: "Não foi possível gerar a campanha. Tente novamente." };
  }

  const assetRows = ASSET_TYPES.map((type) => ({
    agency_id: user.agency.id,
    campaign_id: campaign.id,
    type,
    title: ASSET_TYPE_LABEL[type],
    content: contentForAssetType(content, type) as object,
    status: "draft" satisfies AssetStatus,
  }));
  await supabase.from("campaign_assets").insert(assetRows);

  const taskRows = content.commercialTasks.map((task) => ({
    agency_id: user.agency.id,
    assigned_to: user.profile.id,
    created_by: user.profile.id,
    property_id: propertyId,
    campaign_id: campaign.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    type: task.type,
    due_date: dueDateFromDays(task.dueInDays),
  }));
  if (taskRows.length > 0) await supabase.from("tasks").insert(taskRows);

  const propertyUpdate: Record<string, unknown> = { commercial_title: content.commercialTitle || null };
  if (property.status === "draft") propertyUpdate.status = "active";
  await supabase.from("properties").update(propertyUpdate).eq("id", propertyId).eq("agency_id", user.agency.id);

  revalidatePath("/app/studio");
  revalidatePath(`/app/studio/properties/${propertyId}`);

  return { campaignId: campaign.id as string };
}

export async function setAssetStatusAction(assetId: string, campaignId: string, status: AssetStatus): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("campaign_assets").update({ status }).eq("id", assetId).eq("agency_id", user.agency.id);
  revalidatePath(`/app/studio/campaigns/${campaignId}`);
}

export interface GenerateVideoOptions {
  videoType: VideoType;
  format: VideoFormat;
  duration: number;
  musicMood?: string | null;
  overlayText?: string | null;
  agencyLogo?: boolean;
}

export async function generateVideoAction(
  propertyId: string,
  campaignId: string,
  options: GenerateVideoOptions
): Promise<{ video: Video } | { error: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!(await assertCampaignInAgency(supabase, campaignId, user.agency.id))) {
    return { error: "Campanha não encontrada." };
  }

  const { data: images } = await supabase
    .from("property_images")
    .select("url")
    .eq("property_id", propertyId)
    .eq("agency_id", user.agency.id)
    .order("is_main", { ascending: false });

  const imageUrls = (images ?? []).map((image) => image.url as string);
  if (imageUrls.length === 0) {
    return { error: "Adicione fotografias ao imóvel antes de gerar um vídeo." };
  }

  const provider = getVideoProvider();
  const handle = await provider.createVideoFromPropertyImages({
    propertyId,
    agencyId: user.agency.id,
    imageUrls,
    videoType: options.videoType,
    format: options.format,
    duration: options.duration,
    musicMood: options.musicMood,
    overlayText: options.overlayText,
    agencyLogo: options.agencyLogo,
  });

  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      agency_id: user.agency.id,
      property_id: propertyId,
      campaign_id: campaignId,
      provider: provider.name,
      video_type: options.videoType,
      format: options.format,
      duration: options.duration,
      music_mood: options.musicMood ?? null,
      overlay_text: options.overlayText ?? null,
      agency_logo: options.agencyLogo ?? true,
      prompt: handle.prompt,
      provider_job_id: handle.jobId,
      status: handle.status,
    })
    .select("*")
    .single();

  if (error || !video) {
    return { error: "Não foi possível iniciar a geração do vídeo." };
  }

  revalidatePath(`/app/studio/campaigns/${campaignId}`);
  return { video: video as Video };
}

export async function pollVideoAction(
  videoId: string
): Promise<{ status: string; progress: number; videoUrl: string | null; thumbnailUrl: string | null } | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: video } = await supabase.from("videos").select("*").eq("id", videoId).eq("agency_id", user.agency.id).maybeSingle();
  if (!video) return null;

  if (video.status === "ready" || video.status === "failed") {
    return { status: video.status, progress: 100, videoUrl: video.video_url, thumbnailUrl: video.thumbnail_url };
  }

  const provider = getVideoProvider();
  const jobId = video.provider_job_id as string;
  const statusResult = await provider.getVideoStatus(jobId);

  if (statusResult.status === "ready" || statusResult.status === "failed") {
    const result = await provider.getVideoResult(jobId);
    await supabase
      .from("videos")
      .update({ status: result.status, video_url: result.videoUrl, thumbnail_url: result.thumbnailUrl })
      .eq("id", videoId)
      .eq("agency_id", user.agency.id);
    return { status: result.status, progress: 100, videoUrl: result.videoUrl, thumbnailUrl: result.thumbnailUrl };
  }

  if (statusResult.status !== video.status) {
    await supabase.from("videos").update({ status: statusResult.status }).eq("id", videoId).eq("agency_id", user.agency.id);
  }

  return { status: statusResult.status, progress: statusResult.progress, videoUrl: null, thumbnailUrl: video.thumbnail_url };
}
