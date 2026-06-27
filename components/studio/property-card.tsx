import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, ImageOff, MapPin, Maximize } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { DEAL_TYPE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";
import { formatArea, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types/domain";

interface PropertyCardProps {
  property: Property;
  href: string;
  className?: string;
}

export function PropertyCard({ property, href, className }: PropertyCardProps) {
  const area = formatArea(property.useful_area ?? property.gross_area);

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-4/3 w-full bg-secondary">
        {property.cover_image_url ? (
          <Image
            src={property.cover_image_url}
            alt={property.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="size-5" />
            <span className="text-xs">Sem fotografia</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={property.status} />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-background/90">
            {DEAL_TYPE_LABEL[property.deal_type]}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <p className="line-clamp-1 font-display font-semibold text-foreground">
          {property.commercial_title || property.title}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </p>
        <p className="font-display text-lg font-semibold text-primary">{formatCurrency(property.price)}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{TYPOLOGY_LABEL[property.property_type]}</span>
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="size-3.5" /> {property.bathrooms}
            </span>
          )}
          {area && (
            <span className="flex items-center gap-1">
              <Maximize className="size-3.5" /> {area}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
