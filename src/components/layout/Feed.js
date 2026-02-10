"use client";

import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import { useFeed } from "@/hooks/useFeed";

export default function Feed() {
  const { data, loading } = useFeed();

  if (loading) return <p>Loading…</p>;

  return (
    <div className="py-6 max-w-2xl space-y-6">
      <CreatePost />

      {data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No posts yet
        </p>
      )}

      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
