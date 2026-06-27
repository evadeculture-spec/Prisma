import { Rss } from "lucide-react";

import { CreatePostForm } from "@/components/feed/create-post-form";
import { FeedFilterTabs } from "@/components/feed/feed-filter-tabs";
import { FeedPostListItem } from "@/components/feed/feed-post-list-item";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { isManager, requireUser } from "@/lib/auth";
import { getFeedPosts } from "@/lib/data/feed";
import type { FeedPostType } from "@/lib/types/domain";

interface FeedPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const user = await requireUser();
  const canModerate = isManager(user.profile.role);
  const { type } = await searchParams;
  const activeType = type as FeedPostType | undefined;

  const posts = await getFeedPosts(user.agency.id, user.profile.id, { type: activeType });

  return (
    <>
      <Topbar user={user} title="Feed Interno" description="Notícias, conquistas e avisos da equipa." />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <CreatePostForm />
        <FeedFilterTabs activeType={activeType} />

        {posts.length === 0 ? (
          <EmptyState
            icon={Rss}
            title="Sem publicações para este filtro"
            description="Experimente outro tipo ou crie a primeira publicação."
          />
        ) : (
          <div className="space-y-4">
            {posts.map(({ post, author, comments, likeCount, liked }) => (
              <FeedPostListItem
                key={post.id}
                post={post}
                author={author}
                comments={comments}
                likeCount={likeCount}
                liked={liked}
                canModerate={canModerate}
                relatedHref={post.related_property_id ? `/app/studio/properties/${post.related_property_id}` : null}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
