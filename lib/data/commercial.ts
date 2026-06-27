import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Commission, Contact, ContactStatus, Profile, Property, Schedule, Task, TaskStatus } from "@/lib/types/domain";

export async function getAgencyProfiles(agencyId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("agency_id", agencyId).order("full_name", { ascending: true });
  return (data ?? []) as Profile[];
}

export async function getContacts(agencyId: string, options: { status?: ContactStatus } = {}): Promise<Contact[]> {
  const supabase = await createClient();
  let query = supabase.from("contacts").select("*").eq("agency_id", agencyId).order("created_at", { ascending: false });
  if (options.status) query = query.eq("status", options.status);

  const { data } = await query;
  return (data ?? []) as Contact[];
}

export async function getContactsForProperty(propertyId: string, agencyId: string): Promise<Contact[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("related_property_id", propertyId)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Contact[];
}

export interface ContactDetail {
  contact: Contact;
  property: Property | null;
  owner: Profile | null;
  tasks: Task[];
}

export async function getContactDetail(contactId: string, agencyId: string): Promise<ContactDetail | null> {
  const supabase = await createClient();

  const { data: contact } = await supabase.from("contacts").select("*").eq("id", contactId).eq("agency_id", agencyId).maybeSingle();
  if (!contact) return null;

  const [{ data: property }, { data: owner }, { data: tasks }] = await Promise.all([
    contact.related_property_id
      ? supabase.from("properties").select("*").eq("id", contact.related_property_id).eq("agency_id", agencyId).maybeSingle()
      : Promise.resolve({ data: null }),
    contact.owner_id
      ? supabase.from("profiles").select("*").eq("id", contact.owner_id).eq("agency_id", agencyId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("tasks").select("*").eq("contact_id", contactId).eq("agency_id", agencyId).order("due_date", { ascending: true }),
  ]);

  return {
    contact: contact as Contact,
    property: (property as Property | null) ?? null,
    owner: (owner as Profile | null) ?? null,
    tasks: (tasks ?? []) as Task[],
  };
}

export interface TaskView {
  task: Task;
  assignee: Profile | null;
  contactName: string | null;
  propertyTitle: string | null;
}

export async function getTasks(agencyId: string, options: { status?: TaskStatus } = {}): Promise<TaskView[]> {
  const supabase = await createClient();

  let query = supabase.from("tasks").select("*").eq("agency_id", agencyId).order("due_date", { ascending: true, nullsFirst: false });
  if (options.status) query = query.eq("status", options.status);

  const { data: tasks } = await query;
  if (!tasks || tasks.length === 0) return [];

  const assigneeIds = Array.from(new Set(tasks.map((task) => task.assigned_to).filter((id): id is string => Boolean(id))));
  const contactIds = Array.from(new Set(tasks.map((task) => task.contact_id).filter((id): id is string => Boolean(id))));
  const propertyIds = Array.from(new Set(tasks.map((task) => task.property_id).filter((id): id is string => Boolean(id))));

  const [{ data: assignees }, { data: contacts }, { data: properties }] = await Promise.all([
    assigneeIds.length ? supabase.from("profiles").select("*").in("id", assigneeIds) : Promise.resolve({ data: [] as Profile[] }),
    contactIds.length ? supabase.from("contacts").select("id,name").in("id", contactIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    propertyIds.length ? supabase.from("properties").select("id,title").in("id", propertyIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const assigneeById = new Map((assignees ?? []).map((profile) => [profile.id as string, profile as Profile]));
  const contactNameById = new Map((contacts ?? []).map((contact) => [contact.id as string, contact.name as string]));
  const propertyTitleById = new Map((properties ?? []).map((property) => [property.id as string, property.title as string]));

  return (tasks as Task[]).map((task) => ({
    task,
    assignee: task.assigned_to ? assigneeById.get(task.assigned_to) ?? null : null,
    contactName: task.contact_id ? contactNameById.get(task.contact_id) ?? null : null,
    propertyTitle: task.property_id ? propertyTitleById.get(task.property_id) ?? null : null,
  }));
}

export interface CommissionView {
  commission: Commission;
  propertyTitle: string | null;
  agentName: string | null;
}

export async function getCommissions(agencyId: string): Promise<CommissionView[]> {
  const supabase = await createClient();

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (!commissions || commissions.length === 0) return [];

  const propertyIds = Array.from(new Set(commissions.map((c) => c.property_id).filter((id): id is string => Boolean(id))));
  const agentIds = Array.from(new Set(commissions.map((c) => c.agent_id).filter((id): id is string => Boolean(id))));

  const [{ data: properties }, { data: agents }] = await Promise.all([
    propertyIds.length ? supabase.from("properties").select("id,title").in("id", propertyIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    agentIds.length ? supabase.from("profiles").select("id,full_name").in("id", agentIds) : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);

  const propertyTitleById = new Map((properties ?? []).map((property) => [property.id as string, property.title as string]));
  const agentNameById = new Map((agents ?? []).map((agent) => [agent.id as string, agent.full_name as string]));

  return (commissions as Commission[]).map((commission) => ({
    commission,
    propertyTitle: commission.property_id ? propertyTitleById.get(commission.property_id) ?? null : null,
    agentName: commission.agent_id ? agentNameById.get(commission.agent_id) ?? null : null,
  }));
}

export interface ScheduleView {
  schedule: Schedule;
  userName: string;
}

export async function getSchedulesForWeek(agencyId: string, weekStart: string, weekEnd: string): Promise<ScheduleView[]> {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("agency_id", agencyId)
    .gte("date", weekStart)
    .lte("date", weekEnd);

  if (!schedules || schedules.length === 0) return [];

  const userIds = Array.from(new Set(schedules.map((schedule) => schedule.user_id as string)));
  const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", userIds);
  const nameById = new Map((profiles ?? []).map((profile) => [profile.id as string, profile.full_name as string]));

  return (schedules as Schedule[]).map((schedule) => ({
    schedule,
    userName: nameById.get(schedule.user_id) ?? "—",
  }));
}

export interface CommercialOverview {
  contactsByStatus: Record<string, number>;
  pendingTasksToday: number;
  expectedCommissionTotal: number;
  recentContacts: Contact[];
  upcomingTasks: TaskView[];
}

export async function getCommercialOverview(agencyId: string): Promise<CommercialOverview> {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [{ data: contacts }, { data: commissions }] = await Promise.all([
    supabase.from("contacts").select("status").eq("agency_id", agencyId),
    supabase.from("commissions").select("agency_commission_amount").eq("agency_id", agencyId).in("status", ["expected", "negotiating"]),
  ]);

  const contactsByStatus: Record<string, number> = {};
  for (const row of contacts ?? []) {
    const status = row.status as string;
    contactsByStatus[status] = (contactsByStatus[status] ?? 0) + 1;
  }

  const expectedCommissionTotal = (commissions ?? []).reduce((sum, row) => sum + Number(row.agency_commission_amount), 0);

  const { count: pendingTasksToday } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .neq("status", "completed")
    .lte("due_date", todayStr);

  const [recentContacts, upcomingTasks] = await Promise.all([
    getContacts(agencyId).then((rows) => rows.slice(0, 5)),
    getTasks(agencyId, { status: "pending" }).then((rows) => rows.slice(0, 5)),
  ]);

  return {
    contactsByStatus,
    pendingTasksToday: pendingTasksToday ?? 0,
    expectedCommissionTotal,
    recentContacts,
    upcomingTasks,
  };
}
