"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, Rss, Settings, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app", label: "Início", icon: LayoutDashboard },
  { href: "/app/feed", label: "Feed Interno", icon: Rss },
  { href: "/app/studio", label: "Estúdio AI", icon: Sparkles },
  { href: "/app/commercial", label: "Comercial", icon: Briefcase },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/app/settings"
        className={cn(
          "mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname.startsWith("/app/settings")
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )}
      >
        <Settings className="size-4 shrink-0" />
        Definições
      </Link>
    </nav>
  );
}
