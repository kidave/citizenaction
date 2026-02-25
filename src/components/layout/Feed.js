"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useFeed } from "@/hooks/useFeed";
import PostSkeleton from "@/components/skeletons/PostSkeleton";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import { Card } from "@/components/ui/card";

export default function Feed() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useFeed();

  const [editingPost, setEditingPost] = useState(null);

  async function handleDelete(id) {
    const confirmDelete = confirm("Delete this post?");
    if (!confirmDelete) return;

    await supabase.from("feed").delete().eq("id", id);
    await refetch();
  }

  return (
    <div className="flex flex-col w-full mb-20">

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
        <div className="space-y-4">
          {data?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              canEdit={user?.id === post.author_id}
              onEdit={() => setEditingPost(post)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPost && (
        <CreatePostModal
          isOpen={!!editingPost}
          onClose={() => {
            setEditingPost(null);
            refetch();
          }}
          initialData={editingPost}
        />
      )}
    </div>
  );
}