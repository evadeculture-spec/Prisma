"use client";

import { useActionState, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/lib/actions/feed";
import type { AuthActionState } from "@/lib/actions/auth";
import { FEED_POST_TYPE_LABEL } from "@/lib/labels";
import type { FeedPostType } from "@/lib/types/domain";

const INITIAL_STATE: AuthActionState = {};
const POST_TYPES = Object.keys(FEED_POST_TYPE_LABEL) as FeedPostType[];

export function CreatePostForm() {
  const [state, formAction, isSubmitting] = useActionState(createPostAction, INITIAL_STATE);
  const [type, setType] = useState<FeedPostType>("internal_news");

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-3" key={state.info ?? "form"}>
          <input type="hidden" name="type" value={type} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="post-title">Título</Label>
              <Input id="post-title" name="title" placeholder="Ex.: Vendemos a Vivenda da Rua das Flores!" required />
            </div>
            <div className="space-y-1.5 sm:w-56">
              <Label htmlFor="post-type">Tipo</Label>
              <Select value={type} onValueChange={(value) => setType(value as FeedPostType)}>
                <SelectTrigger id="post-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POST_TYPES.map((postType) => (
                    <SelectItem key={postType} value={postType}>
                      {FEED_POST_TYPE_LABEL[postType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-content">Mensagem</Label>
            <Textarea
              id="post-content"
              name="content"
              placeholder="Partilhe uma notícia, conquista ou aviso com a equipa…"
              required
              rows={3}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.info && <p className="text-sm text-emerald-600">{state.info}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Publicar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
