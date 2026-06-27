import Link from "next/link";

import { FEED_POST_TYPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { FeedPostType } from "@/lib/types/domain";

const TYPES = Object.keys(FEED_POST_TYPE_LABEL) as FeedPostType[];

function chipClass(isActive: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
  );
}

export function FeedFilterTabs({ activeType }: { activeType?: FeedPostType }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/app/feed" className={chipClass(!activeType)}>
        Todas
      </Link>
      {TYPES.map((type) => (
        <Link key={type} href={`/app/feed?type=${type}`} className={chipClass(activeType === type)}>
          {FEED_POST_TYPE_LABEL[type]}
        </Link>
      ))}
    </div>
  );
}
