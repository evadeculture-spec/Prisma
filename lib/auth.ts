import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Agency, Profile, UserRole } from "@/lib/types/domain";

export interface CurrentUser {
  authId: string;
  email: string;
  profile: Profile;
  agency: Agency;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile) return null;

  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", profile.agency_id)
    .maybeSingle();

  if (!agency) return null;

  return {
    authId: auth.user.id,
    email: auth.user.email ?? profile.email,
    profile: profile as Profile,
    agency: agency as Agency,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/onboarding");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.profile.role)) {
    redirect("/app");
  }
  return user;
}

export function isManager(role: UserRole) {
  return role === "admin" || role === "coordinator";
}
