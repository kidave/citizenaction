"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/hooks/feed/useFeed";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import PostSkeleton from "@/components/skeletons/PostSkeleton";
import PostCard from "@/components/feed/post-card/PostCard";
import PostEditorModal from "@/components/feed/post-editor/PostEditorModal";

import { Card } from "@/components/ui/card";

export default function Feed() {

  const { user } = useAuth();
  const { data, isLoading } = useFeed();
  const { deletePost } = useDeletePost();

  const [editingPost, setEditingPost] = useState(null);

  return (
    <div className="flex flex-col w-full">

      {isLoading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : data?.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No posts yet. Be the first to share!
          </p>
        </Card>
      ) : (
        <div className="space-y-0 sm:space-y-4">

          {data?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              canEdit={post.can_manage}
              onEdit={() => setEditingPost(post)}
              onDelete={() => deletePost(post.id)}
            />
          ))}

        </div>
      )}

      {/* EDIT MODAL */}

      {editingPost && (
        <PostEditorModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
        />
      )}

    </div>
  );
}