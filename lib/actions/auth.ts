"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEMO_CREDENTIALS } from "@/lib/demo";

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
  const admin = createAdminClient();

  // Generate a one-time magic-link token for the demo user without sending an email.
  // This bypasses password-hash compatibility issues with direct SQL user inserts.
  const { data, error: genError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: DEMO_CREDENTIALS.email,
  });

  if (genError || !data?.properties?.hashed_token) {
    return { error: "O modo de demonstração está indisponível de momento. Tente novamente mais tarde." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });

  if (error) {
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
