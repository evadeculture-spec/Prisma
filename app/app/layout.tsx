import type { ReactNode } from "react";
import Link from "next/link";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen w-full flex-col">
      {user.isDemo && (
        <div className="sticky top-0 z-50 flex shrink-0 items-center justify-between gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white">
          <span>✨ Sessão de demonstração — os dados são eliminados automaticamente ao terminar</span>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-white/30 transition-colors"
          >
            Criar conta real →
          </Link>
        </div>
      )}
      <div className="flex flex-1 w-full">
        <AppSidebar user={user} />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
