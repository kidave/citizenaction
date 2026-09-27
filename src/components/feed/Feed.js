import { useState } from "react";

import { useFeed } from "@/hooks/feed/useFeed";
import { useDeletePost } from "@/hooks/post/useDeletePost";

import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import PostCard from "@/components/post/PostCard";
import EditorModal from "@/components/editor/EditorModal";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import FeedFilters from "@/components/feed/FeedFilters";
import { Spinner } from "@/components/ui/spinner";

export default function Feed() {
  const { deletePost } = useDeletePost();
  const [categorySlug, setCategorySlug] = useState("");
  const { posts, categories, isLoading, isFetching } = useFeed({
    categorySlug,
  });
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const initialLoading = isLoading && posts.length === 0;

  return (
    <>
      <div className="mx-auto flex w-full max-w-[720px] flex-col">
        <CreatePostTrigger onCreate={() => setCreatePostOpen(true)} />

        <FeedFilters
          categorySlug={categorySlug}
          onCategoryChange={setCategorySlug}
          categories={categories}
        />

        {isFetching && !initialLoading && <Spinner />}

        {initialLoading ? (
          <>
            <PostCardSkeleton edgeToEdgeMobile />
            <PostCardSkeleton edgeToEdgeMobile />
            <PostCardSkeleton edgeToEdgeMobile />
            <PostCardSkeleton edgeToEdgeMobile />
          </>
        ) : posts.length === 0 ? (
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

      <EditorModal
        mode="post"
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />

      <EditorModal
        mode="post"
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        item={editingPost}
      />
    </>
  );
}
