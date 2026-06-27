"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CommentBoxProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CommentBox({ onSubmit, disabled, placeholder = "Escreva um comentário…", className }: CommentBoxProps) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9"
      />
      <Button size="icon" className="size-9 shrink-0" onClick={handleSubmit} disabled={disabled || !value.trim()}>
        <Send className="size-4" />
      </Button>
    </div>
  );
}
