"use client";

import type { ReactNode } from "react";
import { Building2, LogOut, Menu, Settings, User } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOutAction } from "@/lib/actions/auth";
import type { CurrentUser } from "@/lib/auth";
import { initials } from "@/lib/format";

interface TopbarProps {
  user: CurrentUser;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function Topbar({ user, title, description, actions }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <div className="flex items-center gap-2.5 px-5 py-6">
              <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-5" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-sm font-semibold text-white">ImoBoost AI</p>
                <p className="text-xs text-sidebar-foreground/60">{user.agency.name}</p>
              </div>
            </div>
            <div className="px-3">
              <SidebarNav />
            </div>
          </SheetContent>
        </Sheet>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none">
              <Avatar>
                <AvatarImage src={user.profile.avatar_url ?? undefined} alt={user.profile.full_name} />
                <AvatarFallback>{initials(user.profile.full_name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium text-foreground">{user.profile.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/app/settings">
                <User /> Perfil
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/app/settings">
                <Settings /> Definições
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => signOutAction()}>
              <LogOut /> Terminar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
