import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Mail, MapPin, Phone, ShieldAlert, ShieldCheck } from "lucide-react";

import { ContactStatusSelect } from "@/components/commercial/contact-status-select";
import { CreateTaskDialog } from "@/components/commercial/create-task-dialog";
import { TaskList } from "@/components/commercial/task-list";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateContactNotesAction } from "@/lib/actions/commercial";
import { requireUser } from "@/lib/auth";
import { getAgencyProfiles, getContactDetail } from "@/lib/data/commercial";
import type { TaskView } from "@/lib/data/commercial";
import { formatCurrency } from "@/lib/format";
import { CONTACT_INTEREST_LABEL, CONTACT_SOURCE_LABEL, CONTACT_TYPE_LABEL, TYPOLOGY_LABEL } from "@/lib/labels";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const detail = await getContactDetail(id, user.agency.id);
  if (!detail) notFound();

  const { contact, property, owner, tasks } = detail;
  const profiles = await getAgencyProfiles(user.agency.id);
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  const taskViews: TaskView[] = tasks.map((task) => ({
    task,
    assignee: task.assigned_to ? profileById.get(task.assigned_to) ?? null : null,
    contactName: contact.name,
    propertyTitle: property?.title ?? null,
  }));

  const updateNotes = updateContactNotesAction.bind(null, contact.id);

  return (
    <>
      <Topbar user={user} title={contact.name} description={owner ? `Responsável: ${owner.full_name}` : undefined} />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Dados do contacto</CardTitle>
            <ContactStatusSelect contactId={contact.id} status={contact.status} />
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[11px]">
                {CONTACT_TYPE_LABEL[contact.type]}
              </Badge>
              <span>· {CONTACT_INTEREST_LABEL[contact.interest]}</span>
              <span>· {CONTACT_SOURCE_LABEL[contact.source]}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" /> {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" /> {contact.email}
                </span>
              )}
            </div>

            {(contact.desired_location || contact.desired_typology || contact.budget) && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {contact.desired_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" /> {contact.desired_location}
                  </span>
                )}
                {contact.desired_typology && <span>{TYPOLOGY_LABEL[contact.desired_typology]}</span>}
                {contact.budget && <span className="font-medium text-foreground">até {formatCurrency(contact.budget)}</span>}
              </div>
            )}

            <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
              {contact.gdpr_consent ? (
                <>
                  <ShieldCheck className="size-3.5 text-emerald-600" /> Consentimento RGPD obtido
                </>
              ) : (
                <>
                  <ShieldAlert className="size-3.5 text-amber-600" /> Sem consentimento RGPD
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {property && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imóvel associado</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <Link
                href={`/app/studio/properties/${property.id}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
              >
                <span className="font-medium text-foreground">{property.title}</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(property.price)}</span>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <form action={updateNotes} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas internas</Label>
                <Textarea id="notes" name="notes" rows={3} defaultValue={contact.notes ?? ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next_action">Próxima ação</Label>
                <Input id="next_action" name="next_action" defaultValue={contact.next_action ?? ""} />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Guardar notas
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Tarefas</CardTitle>
            <CreateTaskDialog assignees={profiles} currentUserId={user.profile.id} contactId={contact.id} />
          </CardHeader>
          <CardContent className="pb-5">
            {taskViews.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Sem tarefas" description="Crie uma tarefa associada a este contacto." />
            ) : (
              <TaskList tasks={taskViews} />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
