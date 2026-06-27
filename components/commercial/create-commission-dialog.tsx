"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCommissionAction } from "@/lib/actions/commercial";
import type { AuthActionState } from "@/lib/actions/auth";
import { COMMISSION_STATUS_LABEL } from "@/lib/labels";
import type { CommissionStatus, Profile } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};
const STATUSES = Object.keys(COMMISSION_STATUS_LABEL) as CommissionStatus[];

interface PropertyOption {
  id: string;
  title: string;
}

interface CreateCommissionDialogProps {
  properties: PropertyOption[];
  agents: Profile[];
}

export function CreateCommissionDialog({ properties, agents }: CreateCommissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isSubmitting] = useActionState(createCommissionAction, INITIAL_STATE);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [status, setStatus] = useState<CommissionStatus>("expected");

  useEffect(() => {
    if (state.info) setOpen(false);
  }, [state.info]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={properties.length === 0}>
          <Plus className="size-4" /> Nova comissão
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova comissão</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4" key={state.info ?? "form"}>
          <input type="hidden" name="property_id" value={propertyId} />
          <input type="hidden" name="agent_id" value={agentId} />
          <input type="hidden" name="status" value={status} />

          <div className="space-y-1.5">
            <Label htmlFor="commission-property">Imóvel</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger id="commission-property" className="w-full">
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="commission-value">Valor do negócio (€)</Label>
              <Input id="commission-value" name="property_value" type="number" min={0} step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commission-agency-pct">% Agência</Label>
              <Input
                id="commission-agency-pct"
                name="agency_commission_percentage"
                type="number"
                min={0}
                max={100}
                step="0.1"
                defaultValue={5}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commission-agent-pct">% Agente</Label>
              <Input id="commission-agent-pct" name="agent_percentage" type="number" min={0} max={100} step="0.1" defaultValue={50} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="commission-agent">Agente</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger id="commission-agent" className="w-full">
                  <SelectValue placeholder="Selecione um agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commission-status">Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as CommissionStatus)}>
                <SelectTrigger id="commission-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {COMMISSION_STATUS_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commission-expected-date">Fecho previsto</Label>
            <Input id="commission-expected-date" name="expected_close_date" type="date" />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Criar comissão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
