import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  activeProperties: number;
  newLeadsThisWeek: number;
  pendingTasks: number;
  expectedCommissions: number;
}

export async function getDashboardStats(agencyId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [properties, leads, tasks, commissions] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("agency_id", agencyId).eq("status", "active"),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("agency_id", agencyId).gte("created_at", sevenDaysAgo),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("agency_id", agencyId).neq("status", "completed"),
    supabase
      .from("commissions")
      .select("agency_commission_amount")
      .eq("agency_id", agencyId)
      .in("status", ["expected", "negotiating"]),
  ]);

  const expectedCommissions = ((commissions.data ?? []) as { agency_commission_amount: number }[]).reduce(
    (sum, row) => sum + Number(row.agency_commission_amount),
    0
  );

  return {
    activeProperties: properties.count ?? 0,
    newLeadsThisWeek: leads.count ?? 0,
    pendingTasks: tasks.count ?? 0,
    expectedCommissions,
  };
}
