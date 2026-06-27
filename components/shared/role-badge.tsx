import type { VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";
import type { UserRole } from "@/lib/types/domain";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const ROLE_CONFIG: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  admin: { label: "Administrador", variant: "gold" },
  coordinator: { label: "Coordenador", variant: "info" },
  agent: { label: "Agente Imobiliário", variant: "secondary" },
  marketing: { label: "Marketing", variant: "outline" },
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  const config = ROLE_CONFIG[role];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
