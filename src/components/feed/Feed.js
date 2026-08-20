"use client";

import { useState } from "react";

import { useFeed } from "@/hooks/feed/useFeed";
import { useDeletePost } from "@/hooks/post/useDeletePost";

import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

import PostCard from "@/components/feed/post/PostCard";
import EditorModal from "@/components/feed/editor/EditorModal";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import FeedFilters from "@/components/feed/FeedFilters";

import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function Feed() {
  const { deletePost } = useDeletePost();

  // --------------------------------
  // Category filter
  // --------------------------------

  const [categorySlug, setCategorySlug] = useState("");

  // --------------------------------
  // Feed
  // --------------------------------

  const { posts, categories, isLoading, isFetching } = useFeed({
    categorySlug,
  });

  // --------------------------------
  // Modals
  // --------------------------------

  const [editingPost, setEditingPost] = useState(null);

  const [createPostOpen, setCreatePostOpen] = useState(false);

  // --------------------------------
  // Initial loading
  // --------------------------------

  const initialLoading = isLoading && posts.length === 0;

  // --------------------------------
  // Render
  // --------------------------------

  return (
    <>
      <div className="mx-auto flex w-full max-w-[720px] flex-col">
        {/* ================================= */}
        {/* CREATE POST */}
        {/* ================================= */}

        <CreatePostTrigger onCreate={() => setCreatePostOpen(true)} />

        {/* ================================= */}
        {/* SEARCH + CATEGORY */}
        {/* ================================= */}

        <FeedFilters
          categorySlug={categorySlug}
          onCategoryChange={setCategorySlug}
          categories={categories}
        />

        {/* ================================= */}
        {/* BACKGROUND REFRESH */}
        {/* ================================= */}

        {isFetching && !initialLoading && <Spinner />}

        {/* ================================= */}
        {/* INITIAL SKELETON */}
        {/* ================================= */}

        {initialLoading ? (
          <>
            <PostCardSkeleton edgeToEdgeMobile />
            <PostCardSkeleton edgeToEdgeMobile />
            <PostCardSkeleton edgeToEdgeMobile />
            <PostCardSkeleton edgeToEdgeMobile />
          </>
        ) : posts.length === 0 ? (
          /* ================================= */
          /* EMPTY STATE */
          /* ================================= */

          <div className="p-8 text-center">
            {categorySlug ? (
              <>
                <p className="font-medium">No posts found</p>

                <p className="text-md mt-1 text-muted-foreground">
                  Try selecting another category.
                </p>
              </>
            ) : (
              <p>No posts yet. Be the first to share!</p>
            )}
          </div>
        ) : (
          /* ================================= */
          /* POSTS */
          /* ================================= */

          posts.map((post) => (
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
      </div>

      {/* ================================= */}
      {/* CREATE MODAL */}
      {/* ================================= */}

      <EditorModal
        mode="post"
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />

      {/* ================================= */}
      {/* EDIT MODAL */}
      {/* ================================= */}

      <EditorModal
        mode="post"
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        item={editingPost}
      />
    </>
  );
}
