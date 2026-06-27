import Link from "next/link";
import { Building2 } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { RoleBadge } from "@/components/shared/role-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import type { CurrentUser } from "@/lib/auth";

export function AppSidebar({ user }: { user: CurrentUser }) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <Link href="/app" className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-white">ImoBoost AI</p>
          <p className="text-xs text-sidebar-foreground/60">{user.agency.name}</p>
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto px-3">
        <SidebarNav />
      </div>

      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
        <Avatar>
          <AvatarImage src={user.profile.avatar_url ?? undefined} alt={user.profile.full_name} />
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
            {initials(user.profile.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.profile.full_name}</p>
          <RoleBadge role={user.profile.role} className="mt-0.5" />
        </div>
      </div>
    </aside>
  );
}
