import Link from "next/link";

import { PROPERTY_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { PropertyStatus } from "@/lib/types/domain";

const STATUSES = Object.keys(PROPERTY_STATUS_LABEL) as PropertyStatus[];

function chipClass(isActive: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
  );
}

export function PropertyFilterTabs({ activeStatus }: { activeStatus?: PropertyStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/app/studio" className={chipClass(!activeStatus)}>
        Todos
      </Link>
      {STATUSES.map((status) => (
        <Link key={status} href={`/app/studio?status=${status}`} className={chipClass(activeStatus === status)}>
          {PROPERTY_STATUS_LABEL[status]}
        </Link>
      ))}
    </div>
  );
}
