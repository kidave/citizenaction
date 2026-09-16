import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

import { createServerSupabase } from "@/lib/supabase/server";

import { usePost } from "@/hooks/feed/usePost";
import { useDeletePost } from "@/hooks/post/useDeletePost";

import PostCard from "@/components/feed/post/PostCard";
import PageHeader from "@/components/navigation/PageHeader";

const EditorModal = dynamic(
  () => import("@/components/feed/editor/EditorModal"),
  { ssr: false },
);

export async function getServerSideProps({ params }) {
  const supabase = createServerSupabase();
  const { slug } = params;

  const { data, error } = await supabase.rpc("get_post_by_slug", {
    p_slug: slug,
  });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to load post by slug:", error);
    }
    return { notFound: true };
  }

  const post = Array.isArray(data) ? data[0] : data;
  if (!post) return { notFound: true };

  return {
    props: {
      initialPost: post,
      postId: post.id,
    },
  };
}

function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getDescription(post) {
  const clean = cleanText(post.content);
  if (!clean) return "Citizen Action";
  return clean.length > 140 ? `${clean.slice(0, 140)}...` : clean;
}

function getImage(attachments = []) {
  const fallback = "https://citizenaction.in/logo.png";
  if (!Array.isArray(attachments)) return fallback;

  const image = attachments.find(
    (attachment) =>
      attachment?.public_url && attachment?.mime_type?.startsWith("image/"),
  );

  return image?.public_url || fallback;
}

export default function SinglePostPage({ postId, initialPost }) {
  const router = useRouter();
  const { deletePost } = useDeletePost();
  const [editingPost, setEditingPost] = useState(null);
  const { data: post, isLoading, isError } = usePost(postId, initialPost);

  if (isLoading || !post) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PostCard loading borderless forceExpanded />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Unable to load this post.</p>
      </div>
    );
  }

  const title = post.title || "Citizen Action";
  const description = getDescription(post);
  const image = getImage(post.attachments);
  const url = `https://citizenaction.in/post/${post.slug}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:url" content={url} />
      </Head>

      <div className="flex min-h-dvh w-full flex-col">
        <PageHeader
          items={[
            { label: "Home", href: "/" },
            { label: "Posts", href: "/" },
            { label: title },
          ]}
          title={title}
          className="sticky top-0 z-40"
        />

        <div className="flex w-full justify-center">
          <div className="w-full max-w-4xl">
            <PostCard
              post={post}
              borderless
              forceExpanded
              onEdit={() => setEditingPost(post)}
              onDelete={async () => {
                try {
                  await deletePost(post.id);
                  router.push("/");
                } catch (error) {
                  if (process.env.NODE_ENV !== "production") {
                    console.error("Failed to delete post:", error);
                  }
                }
              }}
            />
          </div>
        </div>

        {editingPost && (
          <EditorModal
            mode="post"
            isOpen
            onClose={() => setEditingPost(null)}
            item={editingPost}
          />
        )}
      </div>
    </>
  );
}
