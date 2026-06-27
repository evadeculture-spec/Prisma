import Link from "next/link";
import { Briefcase, CalendarDays, ClipboardList, TrendingUp, UserPlus, Users } from "lucide-react";

import { ContactCard } from "@/components/commercial/contact-card";
import { TaskList } from "@/components/commercial/task-list";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getCommercialOverview } from "@/lib/data/commercial";
import { formatCurrency } from "@/lib/format";

const QUICK_LINKS = [
  { href: "/app/commercial/contacts", label: "Pipeline de contactos", icon: Users },
  { href: "/app/commercial/tasks", label: "Tarefas", icon: ClipboardList },
  { href: "/app/commercial/commissions", label: "Comissões", icon: Briefcase },
  { href: "/app/commercial/schedule", label: "Escala", icon: CalendarDays },
] as const;

export default async function CommercialPage() {
  const user = await requireUser();
  const overview = await getCommercialOverview(user.agency.id);

  const totalContacts = Object.values(overview.contactsByStatus).reduce((sum, count) => sum + count, 0);
  const newContacts = overview.contactsByStatus.new ?? 0;

  return (
    <>
      <Topbar
        user={user}
        title="Área Comercial"
        description="Contactos, tarefas, comissões e escala da equipa."
        actions={
          <Button asChild>
            <Link href="/app/commercial/contacts/new">
              <UserPlus className="size-4" /> Novo contacto
            </Link>
          </Button>
        }
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Contactos" value={String(totalContacts)} icon={Users} accent="petrol" />
          <StatCard label="Novos contactos" value={String(newContacts)} icon={UserPlus} accent="gold" />
          <StatCard label="Tarefas pendentes hoje" value={String(overview.pendingTasksToday)} icon={ClipboardList} />
          <StatCard
            label="Comissões previstas"
            value={formatCurrency(overview.expectedCommissionTotal)}
            icon={TrendingUp}
            accent="petrol"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 py-4">
                  <Icon className="size-5 text-primary" />
                  <span className="font-medium text-foreground">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contactos recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {overview.recentContacts.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Ainda sem contactos"
                  description="Crie o primeiro contacto para começar o pipeline."
                />
              ) : (
                overview.recentContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} href={`/app/commercial/contacts/${contact.id}`} />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximas tarefas</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              {overview.upcomingTasks.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="Sem tarefas pendentes"
                  description="As tarefas pendentes da equipa aparecem aqui."
                />
              ) : (
                <TaskList tasks={overview.upcomingTasks} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
