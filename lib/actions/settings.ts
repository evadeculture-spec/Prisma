"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";

import { isManager, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";
import type { UserRole } from "@/lib/types/domain";

const ROLES: UserRole[] = ["admin", "coordinator", "agent", "marketing"];

function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

async function uploadSingleImage(
  bucket: string,
  pathPrefix: string,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "O ficheiro deve ser uma imagem." };
  }

  const supabase = await createClient();
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const path = `${pathPrefix}/${randomUUID()}${ext}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (uploadError) return { error: "Não foi possível carregar a imagem. Tente novamente." };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function updateProfileAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Indique o seu nome." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.profile.id);

  if (error) return { error: "Não foi possível guardar o perfil. Tente novamente." };

  revalidatePath("/app/settings");
  return { info: "Perfil atualizado." };
}

export async function uploadAvatarAction(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Selecione uma imagem." };

  const { url, error } = await uploadSingleImage("avatars", `${user.agency.id}/${user.profile.id}`, file);
  if (error || !url) return { error };

  const supabase = await createClient();
  await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.profile.id);

  revalidatePath("/app/settings");
  return {};
}

export async function updateAgencyAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();
  if (!isManager(user.profile.role)) return { error: "Sem permissões para editar a agência." };

  const name = String(formData.get("name") ?? "").trim();
  const primaryColor = String(formData.get("primary_color") ?? "").trim();
  if (!name) return { error: "Indique o nome da agência." };
  if (!isValidHexColor(primaryColor)) return { error: "Cor inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("agencies")
    .update({ name, primary_color: primaryColor })
    .eq("id", user.agency.id);

  if (error) return { error: "Não foi possível guardar a agência. Tente novamente." };

  revalidatePath("/app/settings");
  return { info: "Agência atualizada." };
}

export async function uploadAgencyLogoAction(formData: FormData): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!isManager(user.profile.role)) return { error: "Sem permissões para editar a agência." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Selecione uma imagem." };

  const { url, error } = await uploadSingleImage("agency-logos", user.agency.id, file);
  if (error || !url) return { error };

  const supabase = await createClient();
  await supabase.from("agencies").update({ logo_url: url }).eq("id", user.agency.id);

  revalidatePath("/app/settings");
  return {};
}

export async function updateTeammateRoleAction(profileId: string, role: UserRole): Promise<void> {
  const user = await requireUser();
  if (!isManager(user.profile.role)) return;
  if (!ROLES.includes(role)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", profileId).eq("agency_id", user.agency.id);

  revalidatePath("/app/settings");
}
