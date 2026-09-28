"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/hooks/feed/usePost";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import EditorRenderer from "@/components/editor/EditorRenderer";
import PostFooter from "@/components/post/PostFooter";
import PostContribution from "@/components/contribution/PostContribution";
import DocumentHeader from "@/components/document/DocumentHeader";

const EditorModal = dynamic(() => import("@/components/editor/EditorModal"), { ssr: false });

export default function DocumentPage({ postId, initialPost, context }) {
  const router = useRouter();
  const { user } = useAuth();
  const { deletePost } = useDeletePost();
  const [editingPost, setEditingPost] = useState(null);
  const { data: post, isLoading, isError } = usePost(postId, initialPost);

  if (isLoading || !post) {
    return <div className="mx-auto w-full max-w-4xl px-4 py-12 text-sm text-muted-foreground">Loading document…</div>;
  }

  if (isError) {
    return <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center text-sm text-muted-foreground">Unable to load this document.</div>;
  }

  const canManage = Boolean(post.permissions?.can_manage || post.author_id === user?.id);
  const blocks = post.content_json?.blocks || [];

  return (
    <>
      <article className="mx-auto w-full max-w-4xl pb-12">
        <DocumentHeader post={post} context={context} />

        <div className="px-4 pt-10 sm:px-0 sm:pt-14">
          <EditorRenderer
            blocks={blocks}
            className="mx-auto w-full max-w-3xl space-y-5 text-lg leading-8"
          />
        </div>

        <div className="mt-12 border-t pt-4">
          <PostFooter
            post={post}
            forceExpanded
            queryKey={["posts", "detail", post.id]}
          />
        </div>

        <div className="mt-8">
          <PostContribution post={post} />
        </div>
      </article>

      {canManage && editingPost && (
        <EditorModal
          mode="post"
          isOpen
          onClose={() => setEditingPost(null)}
          item={editingPost}
        />
      )}
    </>
  );
}
