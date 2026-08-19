"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function UserSpacesSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton key={index} className="aspect-[3/4] rounded-xl" />
      ))}
    </div>
  );
}
