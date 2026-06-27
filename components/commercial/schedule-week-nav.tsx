import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatWeekLabel(date: string): string {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`));
}

interface ScheduleWeekNavProps {
  weekStart: string;
  weekEnd: string;
  prevWeek: string;
  nextWeek: string;
}

export function ScheduleWeekNav({ weekStart, weekEnd, prevWeek, nextWeek }: ScheduleWeekNavProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-foreground">
        {formatWeekLabel(weekStart)} – {formatWeekLabel(weekEnd)}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/app/commercial/schedule?week=${prevWeek}`} aria-label="Semana anterior">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link href={`/app/commercial/schedule?week=${nextWeek}`} aria-label="Semana seguinte">
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
