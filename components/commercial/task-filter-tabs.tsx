import Link from "next/link";

import { TASK_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types/domain";

const STATUSES = Object.keys(TASK_STATUS_LABEL) as TaskStatus[];

function chipClass(isActive: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
  );
}

export function TaskFilterTabs({ activeStatus }: { activeStatus?: TaskStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/app/commercial/tasks" className={chipClass(!activeStatus)}>
        Todas
      </Link>
      {STATUSES.map((status) => (
        <Link key={status} href={`/app/commercial/tasks?status=${status}`} className={chipClass(activeStatus === status)}>
          {TASK_STATUS_LABEL[status]}
        </Link>
      ))}
    </div>
  );
}
