import "server-only";

import type { VideoFormat, VideoStatus, VideoType } from "@/lib/types/domain";

export interface VideoGenerationRequest {
  propertyId: string;
  agencyId: string;
  imageUrls: string[];
  videoType: VideoType;
  format: VideoFormat;
  duration: number;
  musicMood?: string | null;
  overlayText?: string | null;
  agencyLogo?: boolean;
}

export interface VideoGenerationHandle {
  jobId: string;
  status: VideoStatus;
  prompt: string;
}

export interface VideoStatusResult {
  status: VideoStatus;
  progress: number;
}

export interface VideoResult {
  status: VideoStatus;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  prompt: string;
}

export interface VideoProvider {
  name: string;
  createVideoFromPropertyImages(request: VideoGenerationRequest): Promise<VideoGenerationHandle>;
  getVideoStatus(jobId: string): Promise<VideoStatusResult>;
  getVideoResult(jobId: string): Promise<VideoResult>;
}

const VIDEO_TYPE_LABEL: Record<VideoType, string> = {
  cinematic_tour: "tour cinematográfico",
  luxury_real_estate: "imobiliário de luxo",
  social_reel: "reel para redes sociais",
  before_after: "antes/depois",
  lifestyle: "lifestyle",
};

const FORMAT_LABEL: Record<VideoFormat, string> = {
  vertical_9_16: "vertical 9:16",
  square_1_1: "quadrado 1:1",
  horizontal_16_9: "horizontal 16:9",
};

export function buildVideoPrompt(request: VideoGenerationRequest): string {
  const imageCount = request.imageUrls.length;
  const segments = [
    `Vídeo ${VIDEO_TYPE_LABEL[request.videoType]} em formato ${FORMAT_LABEL[request.format]}, com ${request.duration}s.`,
    `Tour suave por ${imageCount} ${imageCount === 1 ? "imagem" : "imagens"} do imóvel, movimentos de câmara calmos (pan/zoom subtil), transições por corte suave.`,
    request.musicMood ? `Música de fundo: ${request.musicMood}.` : null,
    request.overlayText ? `Texto sobreposto: "${request.overlayText}".` : null,
    request.agencyLogo ? "Incluir logótipo da agência no final do vídeo." : null,
    "As imagens devem representar fielmente o imóvel — sem alterações que deturpem a realidade do espaço.",
  ];
  return segments.filter((segment): segment is string => Boolean(segment)).join(" ");
}

interface MockJobPayload {
  createdAt: number;
  thumbnailUrl: string | null;
  prompt: string;
}

const STAGE_THRESHOLDS_MS: Array<{ status: VideoStatus; at: number }> = [
  { status: "queued", at: 0 },
  { status: "preparing_images", at: 1500 },
  { status: "building_prompt", at: 4000 },
  { status: "sending", at: 7000 },
  { status: "processing", at: 10000 },
  { status: "ready", at: 16000 },
];

function encodeJobId(payload: MockJobPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeJobId(jobId: string): MockJobPayload {
  return JSON.parse(Buffer.from(jobId, "base64url").toString("utf-8")) as MockJobPayload;
}

function statusForElapsed(elapsedMs: number): VideoStatusResult {
  let current = STAGE_THRESHOLDS_MS[0];
  for (const stage of STAGE_THRESHOLDS_MS) {
    if (elapsedMs >= stage.at) current = stage;
  }
  const total = STAGE_THRESHOLDS_MS[STAGE_THRESHOLDS_MS.length - 1].at;
  const progress = current.status === "ready" ? 100 : Math.min(95, Math.round((elapsedMs / total) * 100));
  return { status: current.status, progress };
}

/**
 * Mock provider used whenever VIDEO_PROVIDER !== "higgsfield" or no API key is
 * configured. The job state is derived purely from elapsed time encoded in the
 * jobId itself (no server-side memory), so it behaves correctly across
 * serverless invocations. There is no real video file in mock mode — the first
 * property image is reused as a thumbnail so the UI can show a believable
 * "ready" preview without misrepresenting the property.
 */
export const mockVideoProvider: VideoProvider = {
  name: "mock",
  async createVideoFromPropertyImages(request) {
    const prompt = buildVideoPrompt(request);
    const payload: MockJobPayload = {
      createdAt: Date.now(),
      thumbnailUrl: request.imageUrls[0] ?? null,
      prompt,
    };
    return { jobId: encodeJobId(payload), status: "queued", prompt };
  },
  async getVideoStatus(jobId) {
    const payload = decodeJobId(jobId);
    return statusForElapsed(Date.now() - payload.createdAt);
  },
  async getVideoResult(jobId) {
    const payload = decodeJobId(jobId);
    const { status } = statusForElapsed(Date.now() - payload.createdAt);
    return {
      status,
      videoUrl: null,
      thumbnailUrl: payload.thumbnailUrl,
      prompt: payload.prompt,
    };
  },
};

function higgsfieldApiUrl(path: string): string {
  const base = process.env.HIGGSFIELD_API_URL;
  if (!base) {
    throw new Error(
      "HIGGSFIELD_API_URL não configurada — defina o endpoint da API do Higgsfield para ativar este provider."
    );
  }
  return `${base}${path}`;
}

function higgsfieldApiKey(): string {
  const apiKey = process.env.HIGGSFIELD_API_KEY;
  if (!apiKey) {
    throw new Error("HIGGSFIELD_API_KEY não configurada.");
  }
  return apiKey;
}

/**
 * Real Higgsfield integration. Prepared but intentionally not load-bearing —
 * every call site wraps providers in try/catch and falls back to
 * mockVideoProvider, so the product works end-to-end without this ever
 * succeeding. Fill in HIGGSFIELD_API_URL/HIGGSFIELD_API_KEY once the agency
 * has real Higgsfield credentials and confirmed API contract.
 */
export const higgsfieldProvider: VideoProvider = {
  name: "higgsfield",
  async createVideoFromPropertyImages(request) {
    const prompt = buildVideoPrompt(request);
    const response = await fetch(higgsfieldApiUrl("/videos"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${higgsfieldApiKey()}`,
      },
      body: JSON.stringify({
        prompt,
        images: request.imageUrls,
        format: request.format,
        duration: request.duration,
      }),
    });
    if (!response.ok) throw new Error(`Higgsfield API error: ${response.status}`);
    const data = (await response.json()) as { id: string };
    return { jobId: data.id, status: "sending", prompt };
  },
  async getVideoStatus(jobId) {
    const response = await fetch(higgsfieldApiUrl(`/videos/${jobId}`), {
      headers: { Authorization: `Bearer ${higgsfieldApiKey()}` },
    });
    if (!response.ok) throw new Error(`Higgsfield API error: ${response.status}`);
    const data = (await response.json()) as { status: VideoStatus; progress: number };
    return { status: data.status, progress: data.progress };
  },
  async getVideoResult(jobId) {
    const response = await fetch(higgsfieldApiUrl(`/videos/${jobId}`), {
      headers: { Authorization: `Bearer ${higgsfieldApiKey()}` },
    });
    if (!response.ok) throw new Error(`Higgsfield API error: ${response.status}`);
    const data = (await response.json()) as {
      status: VideoStatus;
      video_url: string | null;
      thumbnail_url: string | null;
      prompt: string | null;
    };
    return {
      status: data.status,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      prompt: data.prompt ?? "",
    };
  },
};

export function getVideoProvider(): VideoProvider {
  const configured = process.env.VIDEO_PROVIDER ?? "mock";
  if (configured === "higgsfield" && process.env.HIGGSFIELD_API_KEY) {
    return higgsfieldProvider;
  }
  return mockVideoProvider;
}
