import { CalendarClock, Percent } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Commission } from "@/lib/types/domain";

interface CommissionCardProps {
  commission: Commission;
  propertyTitle?: string;
  agentName?: string;
  className?: string;
}

export function CommissionCard({ commission, propertyTitle, agentName, className }: CommissionCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            {propertyTitle && <p className="font-display font-semibold text-foreground">{propertyTitle}</p>}
            {agentName && <p className="text-xs text-muted-foreground">{agentName}</p>}
          </div>
          <StatusBadge status={commission.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Valor do imóvel</p>
            <p className="font-display font-semibold text-foreground">{formatCurrency(commission.property_value)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Comissão da agência</p>
            <p className="flex items-center gap-1 font-display font-semibold text-foreground">
              {formatCurrency(commission.agency_commission_amount, { decimals: true })}
              <span className="flex items-center text-xs font-normal text-muted-foreground">
                (<Percent className="size-3" />
                {commission.agency_commission_percentage})
              </span>
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Comissão do agente</p>
            <p className="flex items-center gap-1 font-display font-semibold text-primary">
              {formatCurrency(commission.agent_commission_amount, { decimals: true })}
              <span className="flex items-center text-xs font-normal text-muted-foreground">
                (<Percent className="size-3" />
                {commission.agent_percentage})
              </span>
            </p>
          </div>
          {commission.expected_close_date && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Fecho previsto</p>
              <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                <CalendarClock className="size-3.5" /> {formatDate(commission.expected_close_date)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
