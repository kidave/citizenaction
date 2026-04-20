"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import { createServerSupabase } from "@/lib/supabase/server";
import { usePost } from "@/hooks/feed/usePost";

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

  const img = attachments.find(
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

  // 🔥 CLIENT FETCH (THIS FIXES EDIT ISSUE)
  const { data: clientPost } = usePost(ssrPost?.id);

  // 🔥 FINAL POST (client overrides SSR)
  const post = clientPost ?? ssrPost;

  console.log("SSR:", ssrPost?.can_manage);
  console.log("CLIENT:", clientPost?.can_manage);


  const [editingPost, setEditingPost] = useState(null);

  if (!post) return null;

  /* ===== OG (always use SSR for safety) ===== */
  const title = ssrPost.summary || "Citizen Action";

  const description = getDescription(ssrPost);

  const image =
    getImage(ssrPost.attachments) ||
    "https://citizenaction.in/logo.png";

  const url = `https://citizenaction.in/post/${ssrPost.id}`;

  return (
    <>
      <Head>
        <title>{title}</title>

        {/* ===== Open Graph ===== */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />

        {/* WhatsApp stability */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

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
              canEdit={post.can_manage}
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