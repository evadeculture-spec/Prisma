"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { ImageUploadButton } from "@/components/shared/image-upload-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/actions/auth";
import { updateProfileAction, uploadAvatarAction } from "@/lib/actions/settings";
import { initials } from "@/lib/format";
import type { Profile } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isSubmitting] = useActionState(updateProfileAction, INITIAL_STATE);

  return (
    <div className="space-y-5">
      <ImageUploadButton
        currentUrl={profile.avatar_url}
        alt={profile.full_name}
        fallback={initials(profile.full_name)}
        action={uploadAvatarAction}
      />

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled />
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
