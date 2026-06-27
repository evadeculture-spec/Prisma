import Image from "next/image";
import { Building2 } from "lucide-react";

import { AgencyForm } from "@/components/settings/agency-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { TeamMembersList } from "@/components/settings/team-members-list";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isManager, requireUser } from "@/lib/auth";
import { getAgencyProfiles } from "@/lib/data/commercial";

export default async function SettingsPage() {
  const user = await requireUser();
  const profiles = await getAgencyProfiles(user.agency.id);
  const canManage = isManager(user.profile.role);

  return (
    <>
      <Topbar user={user} title="Definições" description="Geria o seu perfil, a agência e a equipa." />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <ProfileForm profile={user.profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agência</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            {canManage ? (
              <AgencyForm agency={user.agency} />
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                  {user.agency.logo_url ? (
                    <Image src={user.agency.logo_url} alt={user.agency.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Building2 className="size-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.agency.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Apenas administradores e coordenadores podem editar a agência.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Equipa</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <TeamMembersList profiles={profiles} canEditRoles={canManage} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
