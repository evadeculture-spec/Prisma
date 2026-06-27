import type { VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  active: { label: "Ativo", variant: "success" },
  reserved: { label: "Reservado", variant: "warning" },
  sold: { label: "Vendido", variant: "gold" },
  rented: { label: "Arrendado", variant: "gold" },
  archived: { label: "Arquivado", variant: "outline" },

  generating: { label: "A gerar…", variant: "info" },
  ready: { label: "Pronto", variant: "success" },
  approved: { label: "Aprovado", variant: "success" },
  published: { label: "Publicado", variant: "gold" },

  new: { label: "Novo", variant: "info" },
  contacted: { label: "Contactado", variant: "secondary" },
  qualified: { label: "Qualificado", variant: "info" },
  visit_scheduled: { label: "Visita agendada", variant: "warning" },
  proposal_sent: { label: "Proposta enviada", variant: "warning" },
  negotiation: { label: "Em negociação", variant: "warning" },
  closed: { label: "Fechado", variant: "success" },
  lost: { label: "Perdido", variant: "destructive" },

  pending: { label: "Pendente", variant: "secondary" },
  in_progress: { label: "Em curso", variant: "info" },
  completed: { label: "Concluída", variant: "success" },

  expected: { label: "Prevista", variant: "secondary" },
  negotiating: { label: "Em negociação", variant: "warning" },
  paid: { label: "Paga", variant: "success" },

  queued: { label: "Na fila", variant: "secondary" },
  preparing_images: { label: "A preparar imagens", variant: "info" },
  building_prompt: { label: "A construir prompt", variant: "info" },
  sending: { label: "A enviar", variant: "info" },
  processing: { label: "A processar", variant: "info" },
  failed: { label: "Falhou", variant: "destructive" },

  original: { label: "Original", variant: "outline" },
  enhanced: { label: "Otimizada", variant: "success" },
  rejected: { label: "Rejeitada", variant: "destructive" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "outline" as BadgeVariant };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
