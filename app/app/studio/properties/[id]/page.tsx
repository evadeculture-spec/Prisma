import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, MapPin, Maximize, Sparkles } from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { GenerateCampaignButton } from "@/components/studio/generate-campaign-button";
import { PropertyImageManager } from "@/components/studio/property-image-manager";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getCampaignsForProperty } from "@/lib/data/campaigns";
import { getPropertyById, getPropertyImages } from "@/lib/data/properties";
import { formatArea, formatCurrency, formatDate } from "@/lib/format";
import { CONDITION_LABEL, DEAL_TYPE_LABEL, TARGET_AUDIENCE_LABEL, TONE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const property = await getPropertyById(id, user.agency.id);
  if (!property) notFound();

  const [images, campaigns] = await Promise.all([
    getPropertyImages(id, user.agency.id),
    getCampaignsForProperty(id, user.agency.id),
  ]);

  const area = formatArea(property.useful_area ?? property.gross_area);

  return (
    <>
      <Topbar user={user} title={property.commercial_title || property.title} description={property.location} />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">{property.title}</CardTitle>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" /> {property.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={property.status} />
              <Badge variant="outline">{DEAL_TYPE_LABEL[property.deal_type]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-display text-2xl font-semibold text-primary">{formatCurrency(property.price)}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{TYPOLOGY_LABEL[property.property_type]}</span>
              <span>{CONDITION_LABEL[property.condition]}</span>
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble className="size-4" /> {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="size-4" /> {property.bathrooms}
                </span>
              )}
              {area && (
                <span className="flex items-center gap-1">
                  <Maximize className="size-4" /> {area}
                </span>
              )}
              {property.has_garage && <Badge variant="secondary">Garagem</Badge>}
              {property.has_garden && <Badge variant="secondary">Jardim</Badge>}
              {property.has_pool && <Badge variant="secondary">Piscina</Badge>}
            </div>

            {property.description && <p className="text-sm text-foreground">{property.description}</p>}

            {property.target_audience.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {property.target_audience.map((audience) => (
                  <Badge key={audience} variant="outline" className="text-xs">
                    {TARGET_AUDIENCE_LABEL[audience] ?? audience}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">Tom de comunicação: {TONE_LABEL[property.tone]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fotografias</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyImageManager propertyId={property.id} images={images} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> Pack de Promoção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GenerateCampaignButton propertyId={property.id} hasImages={images.length > 0} />

            {campaigns.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">Campanhas geradas</p>
                <ul className="space-y-2">
                  {campaigns.map((campaign) => (
                    <li key={campaign.id}>
                      <Link
                        href={`/app/studio/campaigns/${campaign.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
                      >
                        <span className="line-clamp-1 font-medium text-foreground">{campaign.title}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {formatDate(campaign.created_at)}
                          <StatusBadge status={campaign.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
