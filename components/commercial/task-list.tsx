"use client";

import { TaskCard } from "@/components/commercial/task-card";
import { toggleTaskCompleteAction } from "@/lib/actions/commercial";
import type { TaskView } from "@/lib/data/commercial";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: TaskView[];
  className?: string;
}

export function TaskList({ tasks, className }: TaskListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {tasks.map(({ task, assignee }) => (
        <TaskCard
          key={task.id}
          task={task}
          assignee={assignee ? { id: assignee.id, name: assignee.full_name, avatarUrl: assignee.avatar_url } : null}
          onToggleComplete={(completed) => void toggleTaskCompleteAction(task.id, completed)}
        />
      ))}
    </div>
  );
}
