"use client";

import { useActionState } from "react";
import { Building2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAgencyAction } from "@/lib/actions/onboarding";
import type { AuthActionState } from "@/lib/actions/auth";

const INITIAL_STATE: AuthActionState = {};

export function OnboardingForm({ defaultFullName }: { defaultFullName?: string }) {
  const [state, formAction, isSubmitting] = useActionState(createAgencyAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="agency_name">Nome da agência</Label>
        <Input id="agency_name" name="agency_name" placeholder="Ex.: Albi Imobiliária" autoComplete="organization" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="full_name">O seu nome</Label>
        <Input id="full_name" name="full_name" defaultValue={defaultFullName} autoComplete="name" required />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4" />}
        Criar agência e continuar
      </Button>
    </form>
  );
}
