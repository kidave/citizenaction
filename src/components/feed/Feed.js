"use client";

import { useState } from "react";

import { useFeed } from "@/hooks/feed/useFeed";
import { useDeletePost } from "@/hooks/post/useDeletePost";

import PostSkeleton from "@/components/skeletons/PostSkeleton";
import PostCard from "@/components/feed/post/PostCard";
import EditorModal from "@/components/feed/editor/EditorModal";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import { Card } from "@/components/ui/card";

export default function Feed() {
  const { data = [], isLoading } = useFeed();
  const { deletePost } = useDeletePost();

  const [editingPost, setEditingPost] = useState(null);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-0 py-0 sm:gap-4 sm:p-4">
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          <>
            <CreatePostTrigger />

            {data.length === 0 ? (
              <Card className="p-8 text-center">
                <p>No posts yet. Be the first to share!</p>
              </Card>
            ) : (
              data.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  edgeToEdgeMobile
                  canEdit={post.can_manage}
                  onEdit={() => setEditingPost(post)}
                  onDelete={() => deletePost(post.id)}
                />
              ))
            )}
          </>
        )}
      </div>

      <EditorModal
        mode="post"
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        item={editingPost}
      />
    </>
  );
}
