import { ClipboardList } from "lucide-react";

import { CreateTaskDialog } from "@/components/commercial/create-task-dialog";
import { TaskFilterTabs } from "@/components/commercial/task-filter-tabs";
import { TaskList } from "@/components/commercial/task-list";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth";
import { getAgencyProfiles, getTasks } from "@/lib/data/commercial";
import type { TaskStatus } from "@/lib/types/domain";

interface TasksPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await requireUser();
  const { status } = await searchParams;
  const activeStatus = status as TaskStatus | undefined;

  const [tasks, profiles] = await Promise.all([
    getTasks(user.agency.id, { status: activeStatus }),
    getAgencyProfiles(user.agency.id),
  ]);

  return (
    <>
      <Topbar
        user={user}
        title="Tarefas"
        description="Acompanhe as tarefas da equipa comercial."
        actions={<CreateTaskDialog assignees={profiles} currentUserId={user.profile.id} />}
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <TaskFilterTabs activeStatus={activeStatus} />

        {tasks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Sem tarefas" description="Não existem tarefas para este filtro." />
        ) : (
          <TaskList tasks={tasks} />
        )}
      </main>
    </>
  );
}
