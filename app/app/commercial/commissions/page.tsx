import { TrendingUp } from "lucide-react";

import { CommissionCard } from "@/components/commercial/commission-card";
import { CommissionStatusSelect } from "@/components/commercial/commission-status-select";
import { CreateCommissionDialog } from "@/components/commercial/create-commission-dialog";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { getAgencyProfiles, getCommissions } from "@/lib/data/commercial";
import { getProperties } from "@/lib/data/properties";

export default async function CommissionsPage() {
  const user = await requireUser();

  const [commissions, properties, agents] = await Promise.all([
    getCommissions(user.agency.id),
    getProperties(user.agency.id),
    getAgencyProfiles(user.agency.id),
  ]);

  return (
    <>
      <Topbar
        user={user}
        title="Comissões"
        description="Acompanhe o valor das comissões previstas e fechadas."
        actions={
          <CreateCommissionDialog
            properties={properties.map((property) => ({ id: property.id, title: property.title }))}
            agents={agents}
          />
        }
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        {commissions.length === 0 ? (
          <EmptyState icon={TrendingUp} title="Ainda sem comissões" description="Crie a primeira comissão associada a um negócio." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {commissions.map(({ commission, propertyTitle, agentName }) => (
              <div key={commission.id} className="space-y-2">
                <CommissionCard commission={commission} propertyTitle={propertyTitle ?? undefined} agentName={agentName ?? undefined} />
                <CommissionStatusSelect commissionId={commission.id} status={commission.status} className="w-full" />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
