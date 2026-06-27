"use client";

import { useActionState } from "react";
import { Building2, Loader2, Save } from "lucide-react";

import { ImageUploadButton } from "@/components/shared/image-upload-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/actions/auth";
import { updateAgencyAction, uploadAgencyLogoAction } from "@/lib/actions/settings";
import type { Agency } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};

export function AgencyForm({ agency }: { agency: Agency }) {
  const [state, formAction, isSubmitting] = useActionState(updateAgencyAction, INITIAL_STATE);

  return (
    <div className="space-y-5">
      <ImageUploadButton
        currentUrl={agency.logo_url}
        alt={agency.name}
        fallback={<Building2 className="size-6" />}
        action={uploadAgencyLogoAction}
        shape="square"
      />

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="agency_name">Nome da agência</Label>
          <Input id="agency_name" name="name" defaultValue={agency.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agency_color">Cor principal</Label>
          <div className="flex items-center gap-3">
            <Input
              id="agency_color"
              name="primary_color"
              type="color"
              defaultValue={agency.primary_color ?? "#0e3d39"}
              className="h-9 w-16 p-1"
            />
            <span className="text-sm text-muted-foreground">Usada nos materiais de marketing gerados.</span>
          </div>
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.info && <p className="text-sm text-emerald-600">{state.info}</p>}

        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar
        </Button>
      </form>
    </div>
  );
}
