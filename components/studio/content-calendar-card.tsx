import { CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentCalendarDay } from "@/lib/ai/types";

interface ContentCalendarCardProps {
  days: ContentCalendarDay[];
  className?: string;
}

export function ContentCalendarCard({ days, className }: ContentCalendarCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary" /> Calendário de publicações (7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {days.map((day) => (
            <li key={day.day} className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {day.day}
              </div>
              <div className="space-y-1 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{day.label}</p>
                  <Badge variant="outline" className="text-[11px]">
                    {day.channel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{day.action}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
