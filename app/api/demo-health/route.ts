import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEMO_CREDENTIALS } from "@/lib/demo";

export const dynamic = "force-dynamic";

// Diagnostic endpoint — safe to leave in production (read-only, no secrets exposed).
export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Environment
  checks.env = {
    supabase_url_set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anon_key_set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    service_role_key_set: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  // 2. Admin API — listUsers
  const admin = createAdminClient();
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 50 });

  checks.admin_list_users = listError
    ? { ok: false, error: listError.message, status: (listError as { status?: number }).status }
    : { ok: true, total_users: list?.users?.length ?? 0 };

  // 3. Demo user state
  const demoUser = list?.users?.find((u) => u.email === DEMO_CREDENTIALS.email);
  if (demoUser) {
    const emailIdentity = demoUser.identities?.find((i) => i.provider === "email");
    checks.demo_user = {
      found: true,
      id: demoUser.id,
      email_confirmed: Boolean(demoUser.email_confirmed_at),
      banned: Boolean(demoUser.banned_until),
      identity_count: demoUser.identities?.length ?? 0,
      has_email_identity: Boolean(emailIdentity),
    };
  } else {
    checks.demo_user = { found: false };
  }

  // 4. Anon client — session check (should be unauthenticated here)
  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getUser();
    checks.anon_client = { ok: true, has_session: Boolean(sessionData?.user) };
  } catch (e) {
    checks.anon_client = { ok: false, error: String(e) };
  }

  return NextResponse.json(checks, { status: 200 });
}
