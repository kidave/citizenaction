"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function UserPostsSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton key={index} className="aspect-square rounded-none" />
      ))}
    </div>
  );
}
