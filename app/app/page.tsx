import { Briefcase, ClipboardList, TrendingUp, Users } from "lucide-react";

import { CreatePostForm } from "@/components/feed/create-post-form";
import { FeedPostListItem } from "@/components/feed/feed-post-list-item";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { isManager, requireUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getFeedPosts } from "@/lib/data/feed";
import { formatCurrency } from "@/lib/format";

export default async function HomePage() {
  const user = await requireUser();
  const canModerate = isManager(user.profile.role);

  const [stats, posts] = await Promise.all([
    getDashboardStats(user.agency.id),
    getFeedPosts(user.agency.id, user.profile.id, { limit: 8 }),
  ]);

  return (
    <>
      <Topbar
        user={user}
        title={`Olá, ${user.profile.full_name.split(" ")[0]}`}
        description="Aqui está o que se passa na agência hoje."
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Imóveis ativos" value={String(stats.activeProperties)} icon={Briefcase} accent="petrol" />
          <StatCard label="Novos leads (7 dias)" value={String(stats.newLeadsThisWeek)} icon={Users} accent="gold" />
          <StatCard label="Tarefas pendentes" value={String(stats.pendingTasks)} icon={ClipboardList} />
          <StatCard
            label="Comissões em curso"
            value={formatCurrency(stats.expectedCommissions)}
            icon={TrendingUp}
            accent="petrol"
          />
        </div>

        <div className="space-y-4">
          <CreatePostForm />

          {posts.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Ainda sem publicações"
              description="Seja o primeiro a partilhar uma notícia, conquista ou aviso com a equipa."
            />
          ) : (
            posts.map(({ post, author, comments, likeCount, liked }) => (
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
            ))
          )}
        </div>
      </main>
    </>
  );
}
