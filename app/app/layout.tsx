import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
