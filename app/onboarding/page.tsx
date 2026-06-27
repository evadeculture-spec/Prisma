import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const user = await getCurrentUser();
  if (user) redirect("/app");

  const defaultFullName = (auth.user.user_metadata?.full_name as string | undefined) ?? undefined;

  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-1.5 text-center lg:text-left">
          <h2 className="font-display text-2xl font-semibold text-foreground">Crie a sua agência</h2>
          <p className="text-sm text-muted-foreground">Falta um último passo antes de começar a usar o ImoBoost AI.</p>
        </div>
        <OnboardingForm defaultFullName={defaultFullName} />
      </div>
    </AuthShell>
  );
}
