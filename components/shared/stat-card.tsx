import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" };
  accent?: "petrol" | "gold" | "default";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, accent = "default", className }: StatCardProps) {
  return (
    <Card className={cn("bg-noise-card", className)}>
      <CardContent className="flex items-start justify-between gap-3 py-1">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-destructive"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              accent === "petrol" && "bg-primary/10 text-primary",
              accent === "gold" && "bg-gold-100 text-gold-700",
              accent === "default" && "bg-secondary text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
