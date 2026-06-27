"use client";

import { FeedPostCard, type FeedPostAuthor, type FeedPostCommentView } from "@/components/feed/feed-post-card";
import { addCommentAction, toggleFeatureAction, toggleLikeAction, togglePinAction } from "@/lib/actions/feed";
import type { FeedPost } from "@/lib/types/domain";

interface FeedPostListItemProps {
  post: FeedPost;
  author: FeedPostAuthor | null;
  comments: FeedPostCommentView[];
  likeCount: number;
  liked: boolean;
  canModerate: boolean;
  relatedHref?: string | null;
}

export function FeedPostListItem({
  post,
  author,
  comments,
  likeCount,
  liked,
  canModerate,
  relatedHref,
}: FeedPostListItemProps) {
  return (
    <FeedPostCard
      post={post}
      author={author}
      comments={comments}
      likeCount={likeCount}
      liked={liked}
      relatedHref={relatedHref}
      canModerate={canModerate}
      onToggleLike={() => void toggleLikeAction(post.id)}
      onAddComment={(content) => void addCommentAction(post.id, content)}
      onTogglePin={canModerate ? () => void togglePinAction(post.id, !post.is_pinned) : undefined}
      onToggleFeature={canModerate ? () => void toggleFeatureAction(post.id, !post.is_featured) : undefined}
    />
  );
}
