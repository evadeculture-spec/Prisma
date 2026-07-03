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

  // Find the demo user or create them if they don't exist yet.
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 100 });
  const existing = list?.users?.find((u) => u.email === DEMO_CREDENTIALS.email);

  if (existing) {
    // Re-set the password via the admin API so GoTrue stores a hash it can verify
    // (bypasses bcrypt format issues from SQL-inserted rows).
    await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_CREDENTIALS.password,
      email_confirm: true,
    });
  } else {
    const { error: createError } = await admin.auth.admin.createUser({
      email: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      email_confirm: true,
      user_metadata: { full_name: "Beatriz Albi" },
    });
    if (createError) {
      return { error: "O modo de demonstração está indisponível de momento. Tente novamente mais tarde." };
    }
  }

  // Sign in with the password that was just set/updated by GoTrue.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
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
