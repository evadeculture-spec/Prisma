"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, ShieldCheck, Star, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { IMAGE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { ImageLabel, ImageStatus } from "@/lib/types/domain";

export interface UploadDropzoneImage {
  id: string;
  url: string;
  label: ImageLabel;
  status: ImageStatus;
  isMain: boolean;
}

interface UploadDropzoneProps {
  images: UploadDropzoneImage[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (id: string) => void;
  onLabelChange: (id: string, label: ImageLabel) => void;
  onSetMain: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export function UploadDropzone({
  images,
  onFilesSelected,
  onRemove,
  onLabelChange,
  onSetMain,
  disabled,
  className,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-secondary/40 hover:bg-secondary/60",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-background shadow-sm">
          <Upload className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Arraste fotos ou clique para carregar</p>
        <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP — recomendado 6 a 15 fotos por imóvel</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <p>As imagens devem representar fielmente o imóvel. Edições devem focar-se apenas em luz, enquadramento, contraste, nitidez e limpeza — nunca em alterar a realidade do espaço.</p>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          <ImageOff className="size-5" />
          Ainda sem fotos carregadas.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border border-border bg-secondary">
              <div className="relative aspect-[4/3] w-full">
                <Image src={image.url} alt="" fill className="object-cover" unoptimized />
              </div>

              <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                {image.isMain && (
                  <span className="flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-semibold text-gold-900">
                    <Star className="size-3 fill-current" /> Capa
                  </span>
                )}
                <StatusBadge status={image.status} className="text-[11px]" />
              </div>

              <button
                type="button"
                onClick={() => onRemove(image.id)}
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>

              <div className="flex flex-col gap-1.5 bg-background p-2">
                <Select value={image.label} onValueChange={(value) => onLabelChange(image.id, value as ImageLabel)}>
                  <SelectTrigger size="sm" className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(IMAGE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!image.isMain && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSetMain(image.id)}>
                    Definir como capa
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
