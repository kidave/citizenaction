"use client";

import PostSkeleton from "@/components/skeletons/PostSkeleton";
import PostCard from "@/components/feed/PostCard";
import { useFeed } from "@/hooks/useFeed";
import { Card } from "@/components/ui/card";

export default function Feed() {
  const { data, isLoading } = useFeed();

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
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}