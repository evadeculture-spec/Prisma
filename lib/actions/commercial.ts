"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import type { AuthActionState } from "@/lib/actions/auth";
import type {
  CommissionStatus,
  ContactInterest,
  ContactSource,
  ContactStatus,
  ContactType,
  FeedPostType,
  PropertyType,
  ShiftType,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/lib/types/domain";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function assertRowInAgency(supabase: SupabaseServerClient, table: string, id: string, agencyId: string): Promise<boolean> {
  const { data } = await supabase.from(table).select("id").eq("id", id).eq("agency_id", agencyId).maybeSingle();
  return Boolean(data);
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

export async function createContactAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Indique o nome do contacto." };

  const relatedPropertyId = stringOrNull(formData.get("related_property_id"));
  const supabase = await createClient();

  if (relatedPropertyId && !(await assertRowInAgency(supabase, "properties", relatedPropertyId, user.agency.id))) {
    return { error: "Imóvel associado inválido." };
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      agency_id: user.agency.id,
      owner_id: user.profile.id,
      name,
      phone: stringOrNull(formData.get("phone")),
      email: stringOrNull(formData.get("email")),
      type: String(formData.get("type") ?? "buyer") as ContactType,
      source: String(formData.get("source") ?? "other") as ContactSource,
      interest: String(formData.get("interest") ?? "buy") as ContactInterest,
      budget: numberOrNull(formData.get("budget")),
      desired_location: stringOrNull(formData.get("desired_location")),
      desired_typology: (stringOrNull(formData.get("desired_typology")) as PropertyType | null) ?? null,
      status: "new" satisfies ContactStatus,
      notes: stringOrNull(formData.get("notes")),
      next_action: stringOrNull(formData.get("next_action")),
      related_property_id: relatedPropertyId,
      gdpr_consent: formData.get("gdpr_consent") === "on",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o contacto. Tente novamente." };
  }

  revalidatePath("/app/commercial/contacts");
  redirect(`/app/commercial/contacts/${data.id}`);
}

export async function updateContactStatusAction(contactId: string, status: ContactStatus): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("contacts").update({ status }).eq("id", contactId).eq("agency_id", user.agency.id);
  revalidatePath("/app/commercial/contacts");
  revalidatePath(`/app/commercial/contacts/${contactId}`);
}

export async function updateContactNotesAction(contactId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase
    .from("contacts")
    .update({
      notes: stringOrNull(formData.get("notes")),
      next_action: stringOrNull(formData.get("next_action")),
    })
    .eq("id", contactId)
    .eq("agency_id", user.agency.id);

  revalidatePath(`/app/commercial/contacts/${contactId}`);
}

export async function createTaskAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Indique o título da tarefa." };

  const supabase = await createClient();

  const contactId = stringOrNull(formData.get("contact_id"));
  const propertyId = stringOrNull(formData.get("property_id"));
  const assignedTo = stringOrNull(formData.get("assigned_to"));

  if (contactId && !(await assertRowInAgency(supabase, "contacts", contactId, user.agency.id))) {
    return { error: "Contacto inválido." };
  }
  if (propertyId && !(await assertRowInAgency(supabase, "properties", propertyId, user.agency.id))) {
    return { error: "Imóvel inválido." };
  }
  if (assignedTo && !(await assertRowInAgency(supabase, "profiles", assignedTo, user.agency.id))) {
    return { error: "Responsável inválido." };
  }

  const { error } = await supabase.from("tasks").insert({
    agency_id: user.agency.id,
    created_by: user.profile.id,
    assigned_to: assignedTo ?? user.profile.id,
    contact_id: contactId,
    property_id: propertyId,
    title,
    description: stringOrNull(formData.get("description")),
    priority: String(formData.get("priority") ?? "medium") as TaskPriority,
    type: String(formData.get("type") ?? "follow_up") as TaskType,
    due_date: stringOrNull(formData.get("due_date")),
  });

  if (error) return { error: "Não foi possível criar a tarefa. Tente novamente." };

  revalidatePath("/app/commercial/tasks");
  if (contactId) revalidatePath(`/app/commercial/contacts/${contactId}`);
  return { info: "Tarefa criada." };
}

export async function toggleTaskCompleteAction(taskId: string, completed: boolean): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const status: TaskStatus = completed ? "completed" : "pending";
  await supabase.from("tasks").update({ status }).eq("id", taskId).eq("agency_id", user.agency.id);
  revalidatePath("/app/commercial/tasks");
}

export async function createCommissionAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();

  const propertyId = String(formData.get("property_id") ?? "").trim();
  const propertyValue = numberOrNull(formData.get("property_value"));
  if (!propertyId || propertyValue === null) {
    return { error: "Indique o imóvel e o valor do negócio." };
  }

  const supabase = await createClient();
  if (!(await assertRowInAgency(supabase, "properties", propertyId, user.agency.id))) {
    return { error: "Imóvel inválido." };
  }

  const agentId = stringOrNull(formData.get("agent_id"));
  if (agentId && !(await assertRowInAgency(supabase, "profiles", agentId, user.agency.id))) {
    return { error: "Agente inválido." };
  }

  const { error } = await supabase.from("commissions").insert({
    agency_id: user.agency.id,
    agent_id: agentId,
    property_id: propertyId,
    property_value: propertyValue,
    agency_commission_percentage: numberOrNull(formData.get("agency_commission_percentage")) ?? 5,
    agent_percentage: numberOrNull(formData.get("agent_percentage")) ?? 50,
    status: String(formData.get("status") ?? "expected") as CommissionStatus,
    expected_close_date: stringOrNull(formData.get("expected_close_date")),
  });

  if (error) return { error: "Não foi possível criar a comissão. Tente novamente." };

  revalidatePath("/app/commercial/commissions");
  return { info: "Comissão criada." };
}

async function createSaleAchievementPost(
  supabase: SupabaseServerClient,
  agencyId: string,
  authorId: string,
  details: { propertyId: string | null; agentId: string | null; dealValue: number }
): Promise<void> {
  const [{ data: property }, { data: agent }] = await Promise.all([
    details.propertyId
      ? supabase.from("properties").select("title").eq("id", details.propertyId).eq("agency_id", agencyId).maybeSingle()
      : Promise.resolve({ data: null as { title: string } | null }),
    details.agentId
      ? supabase.from("profiles").select("full_name").eq("id", details.agentId).eq("agency_id", agencyId).maybeSingle()
      : Promise.resolve({ data: null as { full_name: string } | null }),
  ]);

  const propertyTitle = property?.title ?? null;
  const agentName = agent?.full_name ?? null;

  const title = propertyTitle ? `Negócio fechado: ${propertyTitle}` : "Negócio fechado";
  const who = agentName ? `${agentName} fechou` : "A equipa fechou";
  const what = propertyTitle ? `o negócio "${propertyTitle}"` : "um novo negócio";
  const content = `${who} ${what}, no valor de ${formatCurrency(details.dealValue)}. Parabéns!`;

  await supabase.from("feed_posts").insert({
    agency_id: agencyId,
    author_id: authorId,
    type: "sale_achievement" satisfies FeedPostType,
    title,
    content,
    related_property_id: details.propertyId,
  });

  revalidatePath("/app");
  revalidatePath("/app/feed");
}

export async function updateCommissionStatusAction(commissionId: string, status: CommissionStatus): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("commissions")
    .select("status, property_id, agent_id, property_value")
    .eq("id", commissionId)
    .eq("agency_id", user.agency.id)
    .maybeSingle();

  if (!existing) return;

  const { error } = await supabase.from("commissions").update({ status }).eq("id", commissionId).eq("agency_id", user.agency.id);
  if (error) return;

  revalidatePath("/app/commercial/commissions");

  if (status === "paid" && existing.status !== "paid") {
    await createSaleAchievementPost(supabase, user.agency.id, user.profile.id, {
      propertyId: existing.property_id,
      agentId: existing.agent_id,
      dealValue: Number(existing.property_value),
    });
  }
}

export async function setScheduleAction(userId: string, date: string, shiftType: ShiftType | null): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  if (!(await assertRowInAgency(supabase, "profiles", userId, user.agency.id))) return;

  await supabase.from("schedules").delete().eq("user_id", userId).eq("date", date).eq("agency_id", user.agency.id);

  if (shiftType) {
    await supabase.from("schedules").insert({
      agency_id: user.agency.id,
      user_id: userId,
      date,
      shift_type: shiftType,
    });
  }

  revalidatePath("/app/commercial/schedule");
}
