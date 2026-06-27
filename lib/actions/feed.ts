"use server";

import { revalidatePath } from "next/cache";

import { isManager, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";
import type { FeedPostType } from "@/lib/types/domain";

function revalidateFeed() {
  revalidatePath("/app");
  revalidatePath("/app/feed");
}

async function assertPostInAgency(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  agencyId: string
): Promise<boolean> {
  const { data } = await supabase.from("feed_posts").select("id").eq("id", postId).eq("agency_id", agencyId).maybeSingle();
  return Boolean(data);
}

export async function createPostAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser();

  const type = String(formData.get("type") ?? "internal_news") as FeedPostType;
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    return { error: "Indique um título e uma mensagem para a publicação." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feed_posts").insert({
    agency_id: user.agency.id,
    author_id: user.profile.id,
    type,
    title,
    content,
  });

  if (error) {
    return { error: "Não foi possível publicar. Tente novamente." };
  }

  revalidateFeed();
  return { info: "Publicação criada." };
}

export async function toggleLikeAction(postId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  if (!(await assertPostInAgency(supabase, postId, user.agency.id))) return;

  const { data: existing } = await supabase
    .from("feed_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.profile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("feed_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("feed_likes").insert({
      agency_id: user.agency.id,
      post_id: postId,
      user_id: user.profile.id,
    });
  }

  revalidateFeed();
}

export async function addCommentAction(postId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return;

  const user = await requireUser();
  const supabase = await createClient();

  if (!(await assertPostInAgency(supabase, postId, user.agency.id))) return;

  await supabase.from("feed_comments").insert({
    agency_id: user.agency.id,
    post_id: postId,
    user_id: user.profile.id,
    content: trimmed,
  });

  revalidateFeed();
}

export async function togglePinAction(postId: string, pinned: boolean) {
  const user = await requireUser();
  if (!isManager(user.profile.role)) return;

  const supabase = await createClient();
  await supabase.from("feed_posts").update({ is_pinned: pinned }).eq("id", postId).eq("agency_id", user.agency.id);
  revalidateFeed();
}

export async function toggleFeatureAction(postId: string, featured: boolean) {
  const user = await requireUser();
  if (!isManager(user.profile.role)) return;

  const supabase = await createClient();
  await supabase.from("feed_posts").update({ is_featured: featured }).eq("id", postId).eq("agency_id", user.agency.id);
  revalidateFeed();
}
