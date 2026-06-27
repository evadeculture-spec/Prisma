"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const DEFAULT_AI_STEPS = [
  "A analisar as características do imóvel",
  "A preparar as fotografias",
  "A escrever o título comercial e as legendas",
  "A gerar hashtags, CTAs e calendário de publicações",
  "A criar as tarefas comerciais",
];

interface AIProcessingModalProps {
  open: boolean;
  isGenerating: boolean;
  onOpenChange: (open: boolean) => void;
  steps?: string[];
  title?: string;
  description?: string;
}

/**
 * Visualizes generation progress while the parent's async action is in
 * flight. Callers should keep `isGenerating` true for at least as long as
 * the step list takes to cycle (~900ms per step) so the animation never
 * looks rushed or fake, even though mock generation itself is near-instant.
 */
export function AIProcessingModal({
  open,
  isGenerating,
  onOpenChange,
  steps = DEFAULT_AI_STEPS,
  title = "A gerar o Pack de Promoção",
  description = "A nossa IA está a preparar todo o conteúdo de marketing para este imóvel.",
}: AIProcessingModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setActiveStep(0);
  }

  useEffect(() => {
    if (!open || !isGenerating) return;
    const interval = setInterval(() => {
      setActiveStep((current) => (current < steps.length - 1 ? current + 1 : current));
    }, 900);
    return () => clearInterval(interval);
  }, [open, isGenerating, steps.length]);

  useEffect(() => {
    if (open && !isGenerating) {
      const timeout = setTimeout(() => onOpenChange(false), 900);
      return () => clearTimeout(timeout);
    }
  }, [open, isGenerating, onOpenChange]);

  const progress = Math.round(((isGenerating ? activeStep : steps.length) / steps.length) * 100);

  return (
    <Dialog open={open} onOpenChange={(next) => !isGenerating && onOpenChange(next)}>
      <DialogContent showCloseButton={!isGenerating} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <Progress value={progress} />

        <ul className="space-y-2.5 py-1">
          {steps.map((step, index) => {
            const isDone = !isGenerating || index < activeStep;
            const isActive = isGenerating && index === activeStep;
            return (
              <li
                key={step}
                className={cn(
                  "flex items-center gap-2.5 text-sm",
                  isDone ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : isActive ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-border" />
                )}
                {step}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
