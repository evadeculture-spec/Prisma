"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskAction } from "@/lib/actions/commercial";
import type { AuthActionState } from "@/lib/actions/auth";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/labels";
import type { Profile, TaskPriority, TaskType } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};
const PRIORITIES = Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[];
const TYPES = Object.keys(TASK_TYPE_LABEL) as TaskType[];

interface CreateTaskDialogProps {
  assignees: Profile[];
  currentUserId: string;
  contactId?: string;
  propertyId?: string;
  triggerLabel?: string;
}

export function CreateTaskDialog({ assignees, currentUserId, contactId, propertyId, triggerLabel }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isSubmitting] = useActionState(createTaskAction, INITIAL_STATE);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [type, setType] = useState<TaskType>("follow_up");
  const [assignedTo, setAssignedTo] = useState(currentUserId);

  const [lastInfo, setLastInfo] = useState(state.info);
  if (state.info !== lastInfo) {
    setLastInfo(state.info);
    if (state.info) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" /> {triggerLabel ?? "Nova tarefa"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4" key={state.info ?? "form"}>
          {contactId && <input type="hidden" name="contact_id" value={contactId} />}
          {propertyId && <input type="hidden" name="property_id" value={propertyId} />}
          <input type="hidden" name="priority" value={priority} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="assigned_to" value={assignedTo} />

          <div className="space-y-1.5">
            <Label htmlFor="task-title">Título</Label>
            <Input id="task-title" name="title" placeholder="Ex.: Ligar para agendar visita" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea id="task-description" name="description" rows={2} placeholder="Detalhes (opcional)" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as TaskType)}>
                <SelectTrigger id="task-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {TASK_TYPE_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Prioridade</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {TASK_PRIORITY_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Data limite</Label>
              <Input id="task-due-date" name="due_date" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Responsável</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id="task-assignee" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Criar tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
