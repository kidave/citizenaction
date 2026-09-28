"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDeletePost } from "@/hooks/post/useDeletePost";
import { usePost } from "@/hooks/feed/usePost";
import DocumentHeader from "./DocumentHeader";
import EditorRenderer from "@/components/editor/EditorRenderer";
import PostFooter from "@/components/post/PostFooter";
import PostContribution from "@/components/contribution/PostContribution";

const EditorModal = dynamic(() => import("@/components/editor/EditorModal"), { ssr: false });

export default function DocumentPage({ postId, initialPost, context }) {
  const router = useRouter();
  const { user } = useAuth();
  const { deletePost } = useDeletePost();
  const [editingPost, setEditingPost] = useState(null);
  const { data: post, isLoading, isError } = usePost(postId, initialPost);

  if (isLoading || !post) {
    return <div className="mx-auto w-full max-w-4xl px-4 py-8 text-sm text-muted-foreground">Loading document…</div>;
  }

  if (isError) {
    return <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center text-sm text-muted-foreground">Unable to load this document.</div>;
  }

  const blocks = post.content_json?.blocks || [];
  const canManage = Boolean(post.permissions?.can_manage || post.author_id === user?.id);

  return (
    <>
      <article className="mx-auto w-full max-w-4xl pb-12">
        <DocumentHeader
          post={post}
          context={context}
          canEdit={canManage}
          onEdit={() => setEditingPost(post)}
        />

        <div className="px-4 pt-8 sm:px-0 sm:pt-10">
          <EditorRenderer blocks={blocks} className="mx-auto w-full max-w-3xl space-y-4 text-lg" />
        </div>

        <div className="px-4 pt-10 sm:px-0">
          <PostFooter post={post} forceExpanded queryKey={["posts", "detail", post.id]} />
        </div>

        <PostContribution post={post} queryKey={["posts", "detail", post.id]} />
      </article>

      {editingPost && (
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
