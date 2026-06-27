import Link from "next/link";
import { Mail, MapPin, Phone, ShieldAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CONTACT_INTEREST_LABEL, CONTACT_SOURCE_LABEL, CONTACT_TYPE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/types/domain";

interface ContactCardProps {
  contact: Contact;
  href: string;
  className?: string;
}

export function ContactCard({ contact, href, className }: ContactCardProps) {
  return (
    <Link href={href} className={cn("block", className)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-semibold text-foreground">{contact.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[11px]">
                  {CONTACT_TYPE_LABEL[contact.type]}
                </Badge>
                <span>· {CONTACT_INTEREST_LABEL[contact.interest]}</span>
                <span>· {CONTACT_SOURCE_LABEL[contact.source]}</span>
              </div>
            </div>
            <StatusBadge status={contact.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {contact.phone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" /> {contact.phone}
              </span>
            )}
            {contact.email && (
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" /> {contact.email}
              </span>
            )}
          </div>

          {(contact.desired_location || contact.desired_typology || contact.budget) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {contact.desired_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {contact.desired_location}
                </span>
              )}
              {contact.desired_typology && <span>{TYPOLOGY_LABEL[contact.desired_typology]}</span>}
              {contact.budget && <span className="font-medium text-foreground">até {formatCurrency(contact.budget)}</span>}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {contact.gdpr_consent ? (
                <>
                  <ShieldCheck className="size-3.5 text-emerald-600" /> Consentimento RGPD
                </>
              ) : (
                <>
                  <ShieldAlert className="size-3.5 text-amber-600" /> Sem consentimento RGPD
                </>
              )}
            </span>
            <span>Atualizado {formatRelativeTime(contact.updated_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
