"use client";

import { Users } from "lucide-react";

import { useUserSpaces } from "@/hooks/user/useUserSpaces";

import UserSpaceCard from "@/components/profile/UserSpaceCard";
import UserSpacesSkeleton from "@/components/skeletons/UserSpacesSkeleton";

export default function UserSpaces({ userId }) {
  const { data: spaces = [], isLoading, error } = useUserSpaces(userId);

  if (isLoading) {
    return <UserSpacesSkeleton />;
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm text-destructive">Unable to load spaces.</p>
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>

        <h3 className="font-semibold">No spaces yet</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Spaces this user belongs to will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 p-2 sm:grid-cols-4">
      {spaces.map((space) => (
        <UserSpaceCard key={space.id} space={space} />
      ))}
    </div>
  );
}
