"use client";

import { useEffect, useState } from "react";

import { VideoGenerationCard } from "@/components/studio/video-generation-card";
import { generateVideoAction, pollVideoAction } from "@/lib/actions/campaigns";
import type { Video } from "@/lib/types/domain";

const POLL_INTERVAL_MS = 1500;

interface VideoGenerationConnectorProps {
  propertyId: string;
  campaignId: string;
  initialVideo: Video | null;
}

export function VideoGenerationConnector({ propertyId, campaignId, initialVideo }: VideoGenerationConnectorProps) {
  const [video, setVideo] = useState<Video | null>(initialVideo);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!video || video.status === "ready" || video.status === "failed") return;

    const timeout = setTimeout(async () => {
      const result = await pollVideoAction(video.id);
      if (!result) return;

      setProgress(result.progress);
      setVideo((current) =>
        current
          ? {
              ...current,
              status: result.status as Video["status"],
              video_url: result.videoUrl ?? current.video_url,
              thumbnail_url: result.thumbnailUrl ?? current.thumbnail_url,
            }
          : current
      );
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [video]);

  async function handleGenerate() {
    setIsSubmitting(true);
    const result = await generateVideoAction(propertyId, campaignId, {
      videoType: "social_reel",
      format: "vertical_9_16",
      duration: 15,
      agencyLogo: true,
    });
    setIsSubmitting(false);

    if ("error" in result) return;

    setProgress(0);
    setVideo(result.video);
  }

  return (
    <VideoGenerationCard video={video} progress={progress} isSubmitting={isSubmitting} onGenerate={() => void handleGenerate()} />
  );
}
