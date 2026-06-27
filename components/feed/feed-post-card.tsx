"use client";

import Image from "next/image";
import {
  CalendarDays,
  DoorOpen,
  GraduationCap,
  Handshake,
  Home,
  Megaphone,
  Newspaper,
  Pin,
  Sparkles,
  Star,
  Trophy,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommentBox } from "@/components/feed/comment-box";
import { LikeButton } from "@/components/feed/like-button";
import { FEED_POST_TYPE_LABEL } from "@/lib/labels";
import { formatRelativeTime, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FeedPost, FeedPostType, UserRole } from "@/lib/types/domain";

const TYPE_ICON: Record<FeedPostType, LucideIcon> = {
  internal_news: Newspaper,
  partnership: Handshake,
  featured_property: Home,
  training: GraduationCap,
  management_notice: Megaphone,
  sale_achievement: Trophy,
  new_agent: UserPlus,
  event: CalendarDays,
  open_house: DoorOpen,
  campaign: Sparkles,
};

export interface FeedPostAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface FeedPostCommentView {
  id: string;
  author: FeedPostAuthor;
  content: string;
  createdAt: string;
}

interface FeedPostCardProps {
  post: FeedPost;
  author: FeedPostAuthor | null;
  comments?: FeedPostCommentView[];
  likeCount: number;
  liked: boolean;
  onToggleLike?: () => void;
  onAddComment?: (content: string) => void;
  onTogglePin?: () => void;
  onToggleFeature?: () => void;
  canModerate?: boolean;
  relatedHref?: string | null;
  className?: string;
}

export function FeedPostCard({
  post,
  author,
  comments = [],
  likeCount,
  liked,
  onToggleLike,
  onAddComment,
  onTogglePin,
  onToggleFeature,
  canModerate,
  relatedHref,
  className,
}: FeedPostCardProps) {
  const Icon = TYPE_ICON[post.type];

  return (
    <Card className={cn(post.is_featured && "border-gold-300 bg-gold-50/40", className)}>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Avatar>
              <AvatarImage src={author?.avatarUrl ?? undefined} alt={author?.name ?? ""} />
              <AvatarFallback>{author ? initials(author.name) : "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{author?.name ?? "Equipa ImoBoost AI"}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {post.is_pinned && (
              <span title="Fixado">
                <Pin className="size-3.5 text-primary" />
              </span>
            )}
            {post.is_featured && (
              <span title="Em destaque">
                <Star className="size-3.5 fill-current text-gold-500" />
              </span>
            )}
            <Badge variant="outline" className="flex items-center gap-1 text-[11px]">
              <Icon className="size-3" /> {FEED_POST_TYPE_LABEL[post.type]}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-display font-semibold text-foreground">{post.title}</p>
          <p className="whitespace-pre-line text-sm text-foreground">{post.content}</p>
          {relatedHref && (
            <a href={relatedHref} className="inline-block text-sm font-medium text-primary hover:underline">
              Ver detalhes →
            </a>
          )}
        </div>

        {post.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary">
            <Image src={post.image_url} alt="" fill unoptimized className="object-cover" />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-1">
            <LikeButton liked={liked} count={likeCount} onToggle={() => onToggleLike?.()} disabled={!onToggleLike} />
            <span className="text-sm text-muted-foreground">
              {comments.length > 0 && `${comments.length} comentário${comments.length === 1 ? "" : "s"}`}
            </span>
          </div>
          {canModerate && (
            <div className="flex items-center gap-1">
              {onTogglePin && (
                <Button variant="ghost" size="sm" onClick={onTogglePin}>
                  <Pin className="size-3.5" /> {post.is_pinned ? "Desafixar" : "Fixar"}
                </Button>
              )}
              {onToggleFeature && (
                <Button variant="ghost" size="sm" onClick={onToggleFeature}>
                  <Star className="size-3.5" /> {post.is_featured ? "Remover destaque" : "Destacar"}
                </Button>
              )}
            </div>
          )}
        </div>

        {comments.length > 0 && (
          <ul className="space-y-2.5 border-t border-border pt-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex items-start gap-2.5">
                <Avatar className="size-7">
                  <AvatarImage src={comment.author.avatarUrl ?? undefined} alt={comment.author.name} />
                  <AvatarFallback className="text-[10px]">{initials(comment.author.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg bg-secondary/50 px-3 py-1.5">
                  <p className="text-xs font-medium text-foreground">{comment.author.name}</p>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {onAddComment && <CommentBox onSubmit={onAddComment} />}
      </CardContent>
    </Card>
  );
}
