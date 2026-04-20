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
function getImage(attachments) {
  if (!attachments) return null;

  let parsed = attachments;

  if (typeof attachments === "string") {
    try {
      parsed = JSON.parse(attachments);
    } catch {
      return null;
    }
  }

  const img = parsed.find(
    (a) => a.type && a.type.startsWith("image")
  );

  return img?.url || null;
}

function getDescription(post) {
  const text = post.summary || post.details || "";
  return text.length > 160 ? text.slice(0, 160) + "..." : text;
}

/* ================= PAGE ================= */
export default function SinglePostPage({ post: ssrPost }) {
  const router = useRouter();
  const { deletePost } = useDeletePost();
  const { user } = useAuth();

  // 🔥 Client fetch (auth-aware)
  const { data: clientPost } = usePost(ssrPost?.id);

  // final post
  const post = clientPost ?? ssrPost;

  const [editingPost, setEditingPost] = useState(null);

  if (!post) return null;

  /* ===== OG DATA (STRICTLY SSR) ===== */
  const title = ssrPost.summary || "Citizen Action";
  const description = getDescription(ssrPost);

  const image =
    getImage(ssrPost.attachments) ||
    "https://citizenaction.in/logo.png";

  const url = `https://citizenaction.in/post/${ssrPost.id}`;

  /* ===== CAN EDIT ===== */
  const canEdit =
    post?.can_manage || post?.author_id === user?.id;

  return (
    <>
      <Head>
        <title key="title">{title}</title>

        {/* ===== Open Graph ===== */}
        <meta property="og:type" content="article" key="og:type" />
        <meta property="og:title" content={title} key="og:title" />
        <meta
          property="og:description"
          content={description}
          key="og:description"
        />
        <meta property="og:image" content={image} key="og:image" />
        <meta property="og:url" content={url} key="og:url" />

        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Head>

      {/* UI */}
      <div className="flex flex-col w-full min-h-screen mb-12">

        {/* HEADER */}
        <div className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center h-16 px-4 max-w-4xl mx-auto">
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
        <div className="flex justify-center w-full py-8">
          <div className="w-full max-w-4xl px-4">
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