"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { AIProcessingModal } from "@/components/shared/ai-processing-modal";
import { Button } from "@/components/ui/button";
import { generateCampaignAction } from "@/lib/actions/campaigns";

const MIN_ANIMATION_MS = 4500;

interface GenerateCampaignButtonProps {
  propertyId: string;
  hasImages: boolean;
}

export function GenerateCampaignButton({ propertyId, hasImages }: GenerateCampaignButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setOpen(true);
    setIsGenerating(true);

    const [result] = await Promise.all([
      generateCampaignAction(propertyId),
      new Promise((resolve) => setTimeout(resolve, MIN_ANIMATION_MS)),
    ]);

    setIsGenerating(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    router.push(`/app/studio/campaigns/${result.campaignId}`);
  }

  return (
    <>
      <div className="space-y-1.5">
        <Button onClick={() => void handleGenerate()} disabled={!hasImages || isGenerating}>
          <Sparkles className="size-4" /> Gerar Pack de Promoção
        </Button>
        {!hasImages && <p className="text-xs text-muted-foreground">Carregue pelo menos uma fotografia para gerar a campanha.</p>}
      </div>
      <AIProcessingModal open={open} isGenerating={isGenerating} onOpenChange={setOpen} />
    </>
  );
}
