import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { usePost } from "@/hooks/feed/usePost";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/feed/post/PostCard";
import EditorModal from "@/components/feed/editor/EditorModal";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import BackButton from "@/components/ui/back-button";

/* =====================================================
   SERVER
===================================================== */

export async function getServerSideProps({ params }) {
  const supabase = createServerSupabase();

  const { id } = params;

  const { data } = await supabase
    .from("feed_light_view")
    .select(
      `
        id,

        type,
        summary,
        details,

        attachments,

        created_at,
        updated_at,

        author_id,
        author_name,
        author_username,
        author_avatar,

        date,
        time,

        start_at,
        end_at,

        start_year,
        start_month,

        lifecycle_status,

        lat,
        lng,
        address,

        meeting_link,

        scope_type,
        scope_code,

        space_name,
        space_slug,
        space_logo,

        scope_name
      `,
    )
    .eq("id", id)
    .single();

  return {
    props: {
      initialPost: data || null,
      postId: id,
    },
  };
}

/* =====================================================
   HELPERS
===================================================== */

function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDescription(post) {
  const clean = cleanText(post.details);

  if (!clean) {
    return "Citizen Action";
  }

  return clean.length > 140 ? clean.slice(0, 140) + "..." : clean;
}

function getImage(attachments) {
  const fallback = "https://citizenaction.in/logo.png";

  if (!attachments) {
    return fallback;
  }

  try {
    const parsed =
      typeof attachments === "string" ? JSON.parse(attachments) : attachments;

    if (!Array.isArray(parsed)) {
      return fallback;
    }

    /* =====================================
       FIRST IMAGE
    ===================================== */

    const image = parsed.find((a) => a?.url && a?.type?.startsWith("image/"));

    if (image?.url) {
      return image.url;
    }

    /* =====================================
       PDF THUMBNAIL
    ===================================== */

    const pdf = parsed.find((a) => a?.type === "application/pdf");

    if (pdf?.thumbnail_url) {
      return pdf.thumbnail_url;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

/* =====================================================
   PAGE
===================================================== */

export default function SinglePostPage({ postId, initialPost }) {
  const router = useRouter();

  const { deletePost } = useDeletePost();

  const { user } = useAuth();

  const [editingPost, setEditingPost] = useState(null);

  /* =====================================
     POST
  ===================================== */

  const { data: post, isLoading } = usePost(postId, initialPost);

  if (isLoading || !post) {
    return null;
  }

  /* =====================================
     SEO
  ===================================== */

  const title = initialPost?.summary || "Citizen Action";

  const description = getDescription(initialPost);

  const image = getImage(initialPost?.attachments);

  const url = `https://citizenaction.in/post/${post.id}`;

  /* =====================================
     PERMISSIONS
  ===================================== */

  const canEdit = post?.can_manage || post?.author_id === user?.id;

  return (
    <>
      <Head>
        {/* =====================================
            BASIC SEO
        ===================================== */}

        <title key="title">{title}</title>

        <meta name="description" content={description} />

        <link rel="canonical" href={url} />

        {/* =====================================
            OPEN GRAPH
        ===================================== */}

        <meta property="og:type" content="article" />

        <meta property="og:site_name" content="Citizen Action" />

        <meta property="og:title" content={title} />

        <meta property="og:description" content={description} />

        <meta property="og:url" content={url} />

        <meta property="og:image" content={image} />

        <meta property="og:image:secure_url" content={image} />

        <meta property="og:image:width" content="1200" />

        <meta property="og:image:height" content="630" />

        <meta property="og:image:type" content="image/jpeg" />

        {/* =====================================
            TWITTER
        ===================================== */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={title} />

        <meta name="twitter:description" content={description} />

        <meta name="twitter:image" content={image} />

        <meta name="twitter:url" content={url} />
      </Head>

      {/* =====================================
          UI
      ===================================== */}

      <div className="flex min-h-dvh w-full flex-col">
        {/* HEADER */}

        <div className="sticky top-0 z-40 border-b bg-background">
          <div className="mx-auto flex h-14 max-w-4xl items-center px-3 sm:h-16 sm:px-4">
            <BackButton />

            <span className="ml-3 font-medium">Post</span>
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex w-full justify-center">
          <div className="w-full max-w-4xl">
            <PostCard
              post={post}
              canEdit={canEdit}
              borderless
              onEdit={() => setEditingPost(post)}
              onDelete={() => deletePost(post.id)}
              forceExpanded
            />
          </div>
        </div>

        {/* EDITOR */}

        {editingPost && (
          <EditorModal
            mode="post"
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            item={editingPost}
          />
        )}
      </div>
    </>
  );
}
