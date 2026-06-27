import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Property, PropertyImage, PropertyStatus } from "@/lib/types/domain";

export async function getProperties(
  agencyId: string,
  options: { status?: PropertyStatus } = {}
): Promise<Property[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (options.status) query = query.eq("status", options.status);

  const { data } = await query;
  return (data ?? []) as Property[];
}

export async function getPropertyById(propertyId: string, agencyId: string): Promise<Property | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("agency_id", agencyId)
    .maybeSingle();
  return (data as Property | null) ?? null;
}

export async function getPropertyImages(propertyId: string, agencyId: string): Promise<PropertyImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: true });
  return (data ?? []) as PropertyImage[];
}
