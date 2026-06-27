import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const user = await getCurrentUser();
  redirect(user ? "/app" : "/onboarding");
}
