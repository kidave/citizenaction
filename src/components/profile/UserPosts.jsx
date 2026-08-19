"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

import { useUserPosts } from "@/hooks/user/useUserPosts";

import PostCard from "@/components/feed/post/PostCard";

import { Skeleton } from "@/components/ui/skeleton";

function PostSkeleton() {
  return (
    <div className="space-y-3 border-b p-4">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export default function UserPosts({ userId }) {
  const { data: posts = [], isLoading, error } = useUserPosts(userId);

  if (isLoading) {
    return (
      <div>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm text-destructive">Unable to load posts.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="font-semibold">No posts yet</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Posts made by this user will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} edgeToEdgeMobile />
      ))}
    </div>
  );
}
