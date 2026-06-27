"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { AssetStatus } from "@/lib/types/domain";

interface CampaignContentCardProps {
  title: string;
  content: string | string[];
  icon?: LucideIcon;
  status?: AssetStatus;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

export function CampaignContentCard({
  title,
  content,
  icon: Icon,
  status,
  onApprove,
  onReject,
  className,
}: CampaignContentCardProps) {
  const [copied, setCopied] = useState(false);
  const textToCopy = Array.isArray(content) ? content.join(" ") : content;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Conteúdo copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar o conteúdo");
    }
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="size-4 text-primary" />}
          {title}
        </CardTitle>
        <div className="flex items-center gap-1.5">
          {status && <StatusBadge status={status} />}
          <Button variant="ghost" size="icon" className="size-7" onClick={handleCopy}>
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Array.isArray(content) ? (
          <div className="flex flex-wrap gap-1.5">
            {content.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-line text-sm text-foreground">{content}</p>
        )}
      </CardContent>
      {(onApprove || onReject) && (
        <div className="flex items-center gap-2 px-5 pb-5">
          {onApprove && (
            <Button variant="outline" size="sm" onClick={onApprove}>
              <ThumbsUp className="size-3.5" /> Aprovar
            </Button>
          )}
          {onReject && (
            <Button variant="ghost" size="sm" onClick={onReject}>
              <ThumbsDown className="size-3.5" /> Rejeitar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
