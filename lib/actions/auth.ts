"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEMO_AGENCY_ID, DEMO_AGENCY_NAME, DEMO_CREDENTIALS } from "@/lib/demo";

export interface AuthActionState {
  error?: string;
  info?: string;
}

function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/app";
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Indique o email e a palavra-passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Credenciais inválidas. Verifique o email e a palavra-passe." };
  }

  redirect(next);
}

export async function demoSignInAction(_prevState: AuthActionState): Promise<AuthActionState> {
  const supabase = await createClient();

  // Fast path: if the demo user already exists with the correct credentials, sign in directly
  // without touching the admin API (avoids needing SUPABASE_SERVICE_ROLE_KEY when user is seeded).
  const { error: quickError } = await supabase.auth.signInWithPassword({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
  });
  if (!quickError) {
    redirect("/app");
  }

  // Slow path: user doesn't exist or needs repair — provision via admin API.
  const admin = createAdminClient();

  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 100 });
  if (listError) {
    return { error: "O modo de demonstração está indisponível de momento. Tente novamente mais tarde." };
  }

  const existing = list?.users?.find((u) => u.email === DEMO_CREDENTIALS.email);
  // GoTrue requires an "email" identity row for password sign-in.
  // Direct SQL inserts into auth.users skip that row; detect and fix it here.
  const hasEmailIdentity = existing?.identities?.some((i) => i.provider === "email") ?? false;

  if (existing && hasEmailIdentity) {
    // User exists — reset password in case it drifted.
    await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_CREDENTIALS.password,
      email_confirm: true,
    });
  } else if (existing && !hasEmailIdentity) {
    // User was SQL-inserted without an auth.identities row.
    // Delete and recreate with the same UUID so GoTrue creates the identity
    // and all existing profile-scoped data (agency, properties, contacts, …)
    // keeps its UUID references.
    await admin.auth.admin.deleteUser(existing.id);

    const { error: createError } = await admin.auth.admin.createUser(
      // "id" is accepted by GoTrue's REST API but not yet typed in the JS SDK.
      { id: existing.id, email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password,
        email_confirm: true, user_metadata: { full_name: "Beatriz Albi" } } as Parameters<
        typeof admin.auth.admin.createUser
      >[0]
    );
    if (createError) {
      return { error: "O modo de demonstração está indisponível de momento. Tente novamente mais tarde." };
    }

    // Recreate the profile that was cascade-deleted with the auth user.
    await admin.from("profiles").upsert(
      { id: existing.id, agency_id: DEMO_AGENCY_ID, full_name: "Beatriz Albi",
        email: DEMO_CREDENTIALS.email, role: "admin" },
      { onConflict: "id" }
    );
  } else {
    // No user at all — create from scratch and seed minimal agency + profile.
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      email_confirm: true,
      user_metadata: { full_name: "Beatriz Albi" },
    });
    if (createError || !created?.user) {
      return { error: "O modo de demonstração está indisponível de momento. Tente novamente mais tarde." };
    }

    await admin.from("agencies").upsert(
      { id: DEMO_AGENCY_ID, name: DEMO_AGENCY_NAME, primary_color: "#0e3d39" },
      { onConflict: "id" }
    );
    await admin.from("profiles").upsert(
      { id: created.user.id, agency_id: DEMO_AGENCY_ID, full_name: "Beatriz Albi",
        email: DEMO_CREDENTIALS.email, role: "admin" },
      { onConflict: "id" }
    );
  }

  const { error: finalError } = await supabase.auth.signInWithPassword({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
  });
  if (finalError) {
    return { error: "O modo de demonstração está indisponível de momento. Tente novamente mais tarde." };
  }

  redirect("/app");
}

export async function signUpAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 8) {
    return { error: "A palavra-passe deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: "Não foi possível criar a conta. Verifique se o email já está registado." };
  }

  if (!data.session) {
    return { info: "Conta criada. Verifique o seu email para confirmar o registo antes de continuar." };
  }

  redirect("/onboarding");
}
