"use server";

import { randomUUID } from "crypto";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";
import type {
  CommunicationTone,
  DealType,
  ImageLabel,
  PropertyCondition,
  PropertyStatus,
  PropertyType,
} from "@/lib/types/domain";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function assertPropertyInAgency(
  supabase: SupabaseServerClient,
  propertyId: string,
  agencyId: string
): Promise<boolean> {
  const { data } = await supabase.from("properties").select("id").eq("id", propertyId).eq("agency_id", agencyId).maybeSingle();
  return Boolean(data);
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export async function createPropertyAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const price = numberOrNull(formData.get("price"));

  if (!title || !location || price === null) {
    return { error: "Indique pelo menos o título, a localização e o preço do imóvel." };
  }

  const targetAudience = formData.getAll("target_audience").map((value) => String(value));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({
      agency_id: user.agency.id,
      created_by: user.profile.id,
      title,
      location,
      price,
      property_type: String(formData.get("property_type") ?? "t2") as PropertyType,
      deal_type: String(formData.get("deal_type") ?? "sale") as DealType,
      bedrooms: numberOrNull(formData.get("bedrooms")) ?? 0,
      bathrooms: numberOrNull(formData.get("bathrooms")) ?? 0,
      useful_area: numberOrNull(formData.get("useful_area")),
      gross_area: numberOrNull(formData.get("gross_area")),
      has_garage: formData.get("has_garage") === "on",
      has_garden: formData.get("has_garden") === "on",
      has_pool: formData.get("has_pool") === "on",
      condition: String(formData.get("condition") ?? "used") as PropertyCondition,
      energy_certificate: String(formData.get("energy_certificate") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      target_audience: targetAudience,
      strengths: String(formData.get("strengths") ?? "").trim() || null,
      weaknesses: String(formData.get("weaknesses") ?? "").trim() || null,
      tone: String(formData.get("tone") ?? "premium") as CommunicationTone,
      status: "draft" satisfies PropertyStatus,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o imóvel. Tente novamente." };
  }

  revalidatePath("/app/studio");
  redirect(`/app/studio/properties/${data.id}`);
}

export async function uploadPropertyImagesAction(propertyId: string, formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!(await assertPropertyInAgency(supabase, propertyId, user.agency.id))) {
    return { error: "Imóvel não encontrado." };
  }

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return {};

  const { count: existingCount } = await supabase
    .from("property_images")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("agency_id", user.agency.id);

  let hasMain = (existingCount ?? 0) > 0;
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const path = `${user.agency.id}/${propertyId}/${randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file, {
      contentType: file.type || undefined,
    });
    if (uploadError) continue;

    const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);
    const isMain = !hasMain;
    if (isMain) hasMain = true;

    const { error: insertError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      agency_id: user.agency.id,
      url: publicUrlData.publicUrl,
      label: "other" satisfies ImageLabel,
      is_main: isMain,
      status: "original",
    });

    if (!insertError && isMain) uploadedUrls.push(publicUrlData.publicUrl);
  }

  if (uploadedUrls.length > 0) {
    await supabase.from("properties").update({ cover_image_url: uploadedUrls[0] }).eq("id", propertyId).eq("agency_id", user.agency.id);
  }

  revalidatePath(`/app/studio/properties/${propertyId}`);
  return {};
}

export async function removePropertyImageAction(imageId: string, propertyId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("*")
    .eq("id", imageId)
    .eq("property_id", propertyId)
    .eq("agency_id", user.agency.id)
    .maybeSingle();

  if (!image) return;

  await supabase.from("property_images").delete().eq("id", imageId).eq("agency_id", user.agency.id);

  const path = storagePathFromPublicUrl(image.url, "property-images");
  if (path) await supabase.storage.from("property-images").remove([path]);

  if (image.is_main) {
    const { data: remaining } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .eq("agency_id", user.agency.id)
      .order("created_at", { ascending: true })
      .limit(1);

    const nextMain = (remaining ?? [])[0] ?? null;

    if (nextMain) {
      await supabase.from("property_images").update({ is_main: true }).eq("id", nextMain.id).eq("agency_id", user.agency.id);
    }

    await supabase
      .from("properties")
      .update({ cover_image_url: nextMain?.url ?? null })
      .eq("id", propertyId)
      .eq("agency_id", user.agency.id);
  }

  revalidatePath(`/app/studio/properties/${propertyId}`);
}

export async function setPropertyImageLabelAction(imageId: string, propertyId: string, label: ImageLabel): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("property_images").update({ label }).eq("id", imageId).eq("agency_id", user.agency.id);
  revalidatePath(`/app/studio/properties/${propertyId}`);
}

export async function setMainPropertyImageAction(imageId: string, propertyId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!(await assertPropertyInAgency(supabase, propertyId, user.agency.id))) return;

  await supabase.from("property_images").update({ is_main: false }).eq("property_id", propertyId).eq("agency_id", user.agency.id);

  const { data: image } = await supabase
    .from("property_images")
    .update({ is_main: true })
    .eq("id", imageId)
    .eq("agency_id", user.agency.id)
    .select("url")
    .single();

  if (image) {
    await supabase.from("properties").update({ cover_image_url: image.url }).eq("id", propertyId).eq("agency_id", user.agency.id);
  }

  revalidatePath(`/app/studio/properties/${propertyId}`);
}

export async function updatePropertyStatusAction(propertyId: string, status: PropertyStatus): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("properties").update({ status }).eq("id", propertyId).eq("agency_id", user.agency.id);
  revalidatePath(`/app/studio/properties/${propertyId}`);
  revalidatePath("/app/studio");
}
