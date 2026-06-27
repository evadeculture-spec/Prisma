"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface ImageUploadButtonProps {
  currentUrl: string | null;
  alt: string;
  fallback: React.ReactNode;
  action: (formData: FormData) => Promise<{ error?: string }>;
  shape?: "circle" | "square";
  size?: number;
  className?: string;
}

export function ImageUploadButton({
  currentUrl,
  alt,
  fallback,
  action,
  shape = "circle",
  size = 64,
  className,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      setError(result.error ?? null);
    });
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        style={{ width: size, height: size }}
        className={cn(
          "group relative shrink-0 overflow-hidden border border-border bg-secondary text-sm font-semibold text-muted-foreground",
          shape === "circle" ? "rounded-full" : "rounded-lg"
        )}
      >
        {currentUrl ? (
          <Image src={currentUrl} alt={alt} fill className="object-cover" unoptimized />
        ) : (
          <span className="flex size-full items-center justify-center">{fallback}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </button>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          Alterar imagem
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={isPending} />
    </div>
  );
}
