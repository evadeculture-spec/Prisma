import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { FeedPostAuthor, FeedPostCommentView } from "@/components/feed/feed-post-card";
import type { FeedComment, FeedPost, FeedPostType, Profile } from "@/lib/types/domain";

export interface FeedPostView {
  post: FeedPost;
  author: FeedPostAuthor | null;
  comments: FeedPostCommentView[];
  likeCount: number;
  liked: boolean;
}

type FeedAuthorProfile = Pick<Profile, "id" | "full_name" | "avatar_url" | "role">;

function toAuthor(profile: FeedAuthorProfile | undefined): FeedPostAuthor | null {
  if (!profile) return null;
  return { id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url, role: profile.role };
}

export async function getFeedPosts(
  agencyId: string,
  currentUserId: string,
  options: { type?: FeedPostType; limit?: number } = {}
): Promise<FeedPostView[]> {
  const supabase = await createClient();

  let query = supabase
    .from("feed_posts")
    .select("*")
    .eq("agency_id", agencyId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (options.type) query = query.eq("type", options.type);
  if (options.limit) query = query.limit(options.limit);

  const { data: posts } = await query;
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((post) => post.id as string);

  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("feed_likes").select("post_id,user_id").in("post_id", postIds),
    supabase.from("feed_comments").select("*").in("post_id", postIds).order("created_at", { ascending: true }),
  ]);

  const profileIds = Array.from(
    new Set(
      [...posts.map((post) => post.author_id), ...(comments ?? []).map((comment) => comment.user_id)].filter(
        (id): id is string => Boolean(id)
      )
    )
  );

  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id,full_name,avatar_url,role").in("id", profileIds)
    : { data: [] as FeedAuthorProfile[] };

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id as string, profile as FeedAuthorProfile]));

  const commentsByPost = new Map<string, FeedComment[]>();
  for (const comment of (comments ?? []) as FeedComment[]) {
    const list = commentsByPost.get(comment.post_id) ?? [];
    list.push(comment);
    commentsByPost.set(comment.post_id, list);
  }

  const likeRows = (likes ?? []) as { post_id: string; user_id: string }[];

  return (posts as FeedPost[]).map((post) => {
    const postLikes = likeRows.filter((like) => like.post_id === post.id);
    const postComments = commentsByPost.get(post.id) ?? [];

    return {
      post,
      author: toAuthor(profileById.get(post.author_id ?? "")),
      likeCount: postLikes.length,
      liked: postLikes.some((like) => like.user_id === currentUserId),
      comments: postComments.map((comment) => ({
        id: comment.id,
        author:
          toAuthor(profileById.get(comment.user_id)) ?? { id: comment.user_id, name: "Utilizador", avatarUrl: null, role: "agent" },
        content: comment.content,
        createdAt: comment.created_at,
      })),
    };
  });
}
