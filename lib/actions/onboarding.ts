"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";

export async function createAgencyAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const agencyName = String(formData.get("agency_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!agencyName || !fullName) {
    return { error: "Indique o nome da agência e o seu nome." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { error } = await supabase.rpc("create_agency", {
    p_name: agencyName,
    p_full_name: fullName,
  });

  if (error) {
    return { error: "Não foi possível criar a agência. Tente novamente." };
  }

  redirect("/app");
}
