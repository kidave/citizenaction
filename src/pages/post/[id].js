import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import { createServerSupabase } from "@/lib/supabase/server";
import { usePost } from "@/hooks/feed/usePost";
import { useAuth } from "@/context/AuthContext";

import PostCard from "@/components/feed/post-card/PostCard";
import PostEditorModal from "@/components/feed/post-editor/PostEditorModal";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ================= SERVER ================= */
export async function getServerSideProps({ params }) {
  const supabase = createServerSupabase();
  const { id } = params;

  const { data } = await supabase
    .from("feed_detail_view")
    .select("*")
    .eq("id", id)
    .single();

  return {
    props: {
      post: data || null,
    },
  };
}

/* ================= HELPERS ================= */

// remove links + clean
function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// description (short + clean)
function getDescription(post) {
  const clean = cleanText(post.details);

  if (!clean) return "";

  return clean.length > 140
    ? clean.slice(0, 140) + "..."
    : clean;
}

// 🔥 IMPORTANT: stable image selector
function getImage(attachments) {
  if (!attachments) return null;

  try {
    const parsed =
      typeof attachments === "string"
        ? JSON.parse(attachments)
        : attachments;

    if (!Array.isArray(parsed)) return null;

    // pick FIRST valid image (critical for OG bots)
    const img = parsed.find(
      (a) =>
        a?.url &&
        a?.type?.startsWith("image") &&
        a.url.startsWith("http")
    );

    return img?.url || null;
  } catch {
    return null;
  }
}

/* ================= PAGE ================= */

export default function SinglePostPage({ post: ssrPost }) {
  const router = useRouter();
  const { deletePost } = useDeletePost();
  const { user } = useAuth();

  const { data: clientPost } = usePost(ssrPost?.id);
  const post = clientPost ?? ssrPost;

  const [editingPost, setEditingPost] = useState(null);

  if (!post) return null;

  /* ===== OG DATA ===== */

  const title = ssrPost.summary || "Citizen Action";

  const description =
    getDescription(ssrPost) ||
    "View this post on Citizen Action";

  const image =
    getImage(ssrPost.attachments) ||
    "https://citizenaction.in/logo.png";

  const url = `https://citizenaction.in/post/${ssrPost.id}`;

  /* ===== PERMISSIONS ===== */

  const canEdit =
    post?.can_manage || post?.author_id === user?.id;

  return (
    <>
      <Head>
        <title>{title}</title>

        {/* ===== Open Graph ===== */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />

        {/* 🔥 CRITICAL */}
        <meta property="og:image" content={image} />
        <meta property="og:image:secure_url" content={image} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Citizen Action" />

        {/* ===== Twitter ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Head>

      {/* UI */}
      <div className="flex flex-col w-full min-h-screen mb-12">

        {/* HEADER */}
        <div className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center h-14 px-3 sm:h-16 sm:px-4 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <span className="ml-3 font-medium">
              Post
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex justify-center w-full sm:py-8">
          <div className="w-full max-w-4xl px-0 sm:px-4">
            <PostCard
              post={post}
              canEdit={canEdit}
              onEdit={() => setEditingPost(post)}
              onDelete={() => deletePost(post.id)}
              forceExpanded
            />
          </div>
        </div>

        {editingPost && (
          <PostEditorModal
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            post={editingPost}
          />
        )}
      </div>
    </>
  );
}