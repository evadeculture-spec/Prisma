"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function LikeButton({ liked, count, onToggle, disabled, className }: LikeButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        liked ? "text-destructive" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count > 0 ? count : "Gostar"}
    </button>
  );
}
