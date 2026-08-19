"use client";

import { FileText } from "lucide-react";

import { useUserPosts } from "@/hooks/user/useUserPosts";

import UserPostCard from "@/components/profile/UserPostCard";
import UserPostsSkeleton from "@/components/skeletons/UserPostsSkeleton";

export default function UserPosts({ userId }) {
  const { data: posts = [], isLoading, error } = useUserPosts(userId);

  if (isLoading) {
    return <UserPostsSkeleton />;
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-destructive">Unable to load posts.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>

        <h3 className="font-semibold">No posts yet</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Posts made by this user will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
      {posts.map((post) => (
        <UserPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
