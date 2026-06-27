import { redirect } from "next/navigation";

import { ConfigurationNotice } from "@/components/shared/configuration-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function SetupRequiredPage() {
  if (isSupabaseConfigured) redirect("/");

  return <ConfigurationNotice />;
}
