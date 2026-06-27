import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "./env";

/**
 * Service-role client. Bypasses RLS entirely — only use it for trusted
 * server-side operations (team invites, admin tooling). Never import this
 * from a Client Component or expose the key to the browser.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
