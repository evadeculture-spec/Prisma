"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckSquare,
  ClipboardList,
  FileText,
  Megaphone,
  Phone,
  RotateCcw,
  Square,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/labels";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/lib/types/domain";

const TYPE_ICON: Record<Task["type"], LucideIcon> = {
  call: Phone,
  visit: Users,
  publication: Megaphone,
  follow_up: RotateCcw,
  meeting: Users,
  documentation: FileText,
  listing: ClipboardList,
};

const PRIORITY_VARIANT: Record<TaskPriority, "secondary" | "info" | "warning" | "destructive"> = {
  low: "secondary",
  medium: "info",
  high: "warning",
  urgent: "destructive",
};

interface TaskAssignee {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface TaskCardProps {
  task: Task;
  assignee?: TaskAssignee | null;
  href?: string;
  onToggleComplete?: (completed: boolean) => void;
  className?: string;
}

export function TaskCard({ task, assignee, href, onToggleComplete, className }: TaskCardProps) {
  const Icon = TYPE_ICON[task.type];
  const isCompleted = task.status === "completed";
  const isOverdue = !isCompleted && task.due_date !== null && new Date(task.due_date) < new Date();

  const content = (
    <Card className={cn(href && "transition-shadow hover:shadow-md", className)}>
      <CardContent className="flex items-start gap-3">
        {onToggleComplete && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleComplete(!isCompleted);
            }}
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
          >
            {isCompleted ? <CheckSquare className="size-5 text-emerald-600" /> : <Square className="size-5" />}
          </button>
        )}

        <div className="flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm font-medium text-foreground", isCompleted && "line-through text-muted-foreground")}>
              {task.title}
            </p>
            <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 text-[11px]">
              {TASK_PRIORITY_LABEL[task.priority]}
            </Badge>
          </div>

          {task.description && <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon className="size-3.5" /> {TASK_TYPE_LABEL[task.type]}
              </span>
              {task.due_date && (
                <span className={cn("flex items-center gap-1", isOverdue && "font-medium text-destructive")}>
                  <CalendarClock className="size-3.5" /> {formatDate(task.due_date)}
                </span>
              )}
            </div>
            {assignee && (
              <Avatar className="size-6">
                <AvatarImage src={assignee.avatarUrl ?? undefined} alt={assignee.name} />
                <AvatarFallback className="text-[10px]">{initials(assignee.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}
