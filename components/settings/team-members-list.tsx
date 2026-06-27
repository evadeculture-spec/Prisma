"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTeammateRoleAction } from "@/lib/actions/settings";
import { initials } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/labels";
import type { Profile, UserRole } from "@/lib/types/domain";

const ROLES = Object.keys(ROLE_LABEL) as UserRole[];

interface TeamMembersListProps {
  profiles: Profile[];
  canEditRoles: boolean;
}

export function TeamMembersList({ profiles, canEditRoles }: TeamMembersListProps) {
  return (
    <div className="divide-y divide-border">
      {profiles.map((profile) => (
        <TeamMemberRow key={profile.id} profile={profile} canEditRoles={canEditRoles} />
      ))}
    </div>
  );
}

function TeamMemberRow({ profile, canEditRoles }: { profile: Profile; canEditRoles: boolean }) {
  const [role, setRole] = useState<UserRole>(profile.role);

  function handleChange(next: string) {
    setRole(next as UserRole);
    void updateTeammateRoleAction(profile.id, next as UserRole);
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
          <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{profile.full_name}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      {canEditRoles ? (
        <Select value={role} onValueChange={handleChange}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((value) => (
              <SelectItem key={value} value={value}>
                {ROLE_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>
      )}
    </div>
  );
}
