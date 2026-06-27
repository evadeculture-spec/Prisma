import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { PropertyFilterTabs } from "@/components/studio/property-filter-tabs";
import { PropertyCard } from "@/components/studio/property-card";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { getProperties } from "@/lib/data/properties";
import type { PropertyStatus } from "@/lib/types/domain";

interface StudioPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const user = await requireUser();
  const { status } = await searchParams;
  const activeStatus = status as PropertyStatus | undefined;

  const properties = await getProperties(user.agency.id, { status: activeStatus });

  return (
    <>
      <Topbar
        user={user}
        title="Estúdio de Marketing AI"
        description="Crie imóveis e gere packs de promoção completos com IA."
        actions={
          <Button asChild>
            <Link href="/app/studio/properties/new">
              <Plus className="size-4" /> Novo imóvel
            </Link>
          </Button>
        }
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <PropertyFilterTabs activeStatus={activeStatus} />

        {properties.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Ainda sem imóveis"
            description="Crie o primeiro imóvel para gerar o seu Pack de Promoção com IA."
            action={
              <Button asChild>
                <Link href="/app/studio/properties/new">
                  <Plus className="size-4" /> Novo imóvel
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} href={`/app/studio/properties/${property.id}`} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
