import { notFound } from "next/navigation";
import { ClipboardList, FileText, Video as VideoIcon } from "lucide-react";

import { Topbar } from "@/components/layout/topbar";
import { CampaignAssetGrid } from "@/components/studio/campaign-asset-grid";
import { ContentCalendarCard } from "@/components/studio/content-calendar-card";
import { VideoGenerationConnector } from "@/components/studio/video-generation-connector";
import { TaskCard } from "@/components/commercial/task-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getCampaignDetail } from "@/lib/data/campaigns";
import type { ContentCalendarDay } from "@/lib/ai/types";

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const detail = await getCampaignDetail(id, user.agency.id);
  if (!detail) notFound();

  const { campaign, property, assets, tasks, video } = detail;
  const calendarAsset = assets.find((asset) => asset.type === "content_calendar");
  const calendarDays = (calendarAsset?.content as ContentCalendarDay[] | undefined) ?? [];

  return (
    <>
      <Topbar
        user={user}
        title={campaign.title}
        description={property ? `${property.title} · ${property.location}` : undefined}
        actions={<StatusBadge status={campaign.status} />}
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="size-4" /> Conteúdo
            </TabsTrigger>
            <TabsTrigger value="video">
              <VideoIcon className="size-4" /> Vídeo
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardList className="size-4" /> Tarefas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 pt-4">
            {calendarDays.length > 0 && <ContentCalendarCard days={calendarDays} />}
            <CampaignAssetGrid assets={assets} campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="video" className="pt-4">
            {property ? (
              <VideoGenerationConnector propertyId={property.id} campaignId={campaign.id} initialVideo={video} />
            ) : (
              <EmptyState icon={VideoIcon} title="Imóvel não encontrado" description="Não é possível gerar vídeo sem o imóvel associado." />
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-3 pt-4">
            {tasks.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Sem tarefas" description="Esta campanha ainda não gerou tarefas comerciais." />
            ) : (
              tasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
