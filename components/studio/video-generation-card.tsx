"use client";

import Image from "next/image";
import { AlertTriangle, Clapperboard, Loader2, Play, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { VIDEO_FORMAT_LABEL, VIDEO_TYPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Video, VideoStatus } from "@/lib/types/domain";

const STAGE_LABEL: Record<VideoStatus, string> = {
  queued: "Na fila de produção",
  preparing_images: "A preparar as fotografias",
  building_prompt: "A construir o guião visual",
  sending: "A enviar para o motor de vídeo",
  processing: "A processar o vídeo",
  ready: "Vídeo pronto",
  failed: "A geração falhou",
};

interface VideoGenerationCardProps {
  video: Video | null;
  progress?: number;
  isSubmitting?: boolean;
  onGenerate: () => void;
  className?: string;
}

export function VideoGenerationCard({ video, progress = 0, isSubmitting, onGenerate, className }: VideoGenerationCardProps) {
  if (!video) {
    return (
      <Card className={cn(className)}>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clapperboard className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="font-display font-semibold text-foreground">Vídeo promocional</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Gere um vídeo curto a partir das fotografias deste imóvel, com guião e música pensados para redes sociais.
            </p>
          </div>
          <Button onClick={onGenerate} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Clapperboard className="size-4" />}
            Gerar vídeo promocional
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isWorking = video.status !== "ready" && video.status !== "failed";

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">
          {VIDEO_TYPE_LABEL[video.video_type]} · {VIDEO_FORMAT_LABEL[video.format]}
        </CardTitle>
        <StatusBadge status={video.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        {isWorking && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              {STAGE_LABEL[video.status]}
            </div>
            <Progress value={progress} />
          </div>
        )}

        {video.status === "ready" && (
          <div className="space-y-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
              {video.thumbnail_url ? (
                <Image src={video.thumbnail_url} alt="" fill unoptimized className="object-cover" />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-foreground">
                  <Play className="size-5 fill-current" />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Pré-visualização do vídeo gerado. A reprodução integral fica disponível quando o fornecedor de vídeo real for ativado.
            </p>
          </div>
        )}

        {video.status === "failed" && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>Não foi possível gerar o vídeo. Pode tentar novamente.</p>
          </div>
        )}

        {(video.status === "failed" || video.status === "ready") && (
          <Button variant="outline" size="sm" onClick={onGenerate} disabled={isSubmitting}>
            <RefreshCw className="size-3.5" /> Gerar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
