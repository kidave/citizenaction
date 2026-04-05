"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePost } from "@/hooks/feed/usePost";
import PostCard from "@/components/feed/post-card/PostCard";
import PostEditorModal from "@/components/feed/post-editor/PostEditorModal";
import { useDeletePost } from "@/hooks/feed/useDeletePost";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SinglePostPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = usePost(id);
  const { deletePost } = useDeletePost();

  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    return () => {
      const scroll = sessionStorage.getItem("feed-scroll");
      if (scroll) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scroll));
        }, 50);
      }
    };
  }, []);

  if (isLoading || !data) return null;

  return (
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
            post={data}
            canEdit={data.can_manage}
            onEdit={() => setEditingPost(data)}
            onDelete={() => deletePost(data.id)}
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
  );
}