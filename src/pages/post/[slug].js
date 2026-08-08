import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { usePost } from "@/hooks/feed/usePost";

import PostCard from "@/components/feed/post/PostCard";
import EditorModal from "@/components/feed/editor/EditorModal";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import BackButton from "@/components/ui/back-button";

export async function getServerSideProps({ params }) {
  const supabase = createServerSupabase();

  const { slug } = params;

  // ---------------------------------------------------------
  // Resolve slug -> post id
  // ---------------------------------------------------------

  const { data: postRow, error: slugError } = await supabase
    .from("post")
    .select("id")
    .eq("slug", slug)
    .single();

  if (slugError || !postRow) {
    return {
      notFound: true,
    };
  }

  // ---------------------------------------------------------
  // Load full post
  // ---------------------------------------------------------

  const { data, error } = await supabase.rpc("get_post", {
    p_post_id: postRow.id,
  });

  if (error) {
    console.error(error);

    return {
      notFound: true,
    };
  }

  const post = Array.isArray(data) ? data[0] : data;

  if (!post) {
    return {
      notFound: true,
    };
  }

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

  if (!clean) {
    return "Citizen Action";
  }

  return clean.length > 140 ? clean.slice(0, 140) + "..." : clean;
}

function getImage(attachments = []) {
  const fallback = "https://citizenaction.in/logo.png";

  if (!Array.isArray(attachments)) {
    return fallback;
  }

  const image = attachments.find(
    (a) => a.public_url && a.mime_type?.startsWith("image/"),
  );

  if (image) {
    return image.public_url;
  }

  return fallback;
}

export default function SinglePostPage({ postId, initialPost }) {
  const { deletePost } = useDeletePost();

  const router = useRouter();

  const [editingPost, setEditingPost] = useState(null);

  const { data: post, isLoading } = usePost(postId, initialPost);

  if (isLoading || !post) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PostCard loading borderless forceExpanded />
      </div>
    );
  }

  const title = post.title || "Citizen Action";
  const description = getDescription(post);
  const image = getImage(post.attachments);

  const url = `https://citizenaction.in/post/${post.slug}`;

  const canEdit = post?.permissions?.can_manage ?? false;

  return (
    <>
      <Head>
        <title key="title">{title}</title>

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
        <div className="sticky top-0 z-40 border-b bg-background">
          <div className="mx-auto flex h-14 max-w-4xl items-center px-3 sm:h-16 sm:px-4">
            <BackButton />

            <span className="min-w-0 flex-1 truncate">{post.title}</span>
          </div>
        </div>

        <div className="flex w-full justify-center">
          <div className="w-full max-w-4xl">
            <PostCard
              post={post}
              canEdit={canEdit}
              borderless
              onEdit={() => setEditingPost(post)}
              onDelete={async () => {
                await deletePost(post.id);

                router.push("/");
              }}
              forceExpanded
            />
          </div>
        </div>

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
