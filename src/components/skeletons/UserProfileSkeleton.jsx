"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="px-4 pb-5 pt-6 sm:px-0 sm:pt-8">
        <div className="flex items-start gap-5 sm:gap-8">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full sm:h-28 sm:w-28" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />

            <div className="flex gap-7 pt-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>

        <Skeleton className="mt-5 h-4 w-32" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>

      <div className="h-12 border-y" />

      <div className="space-y-1 p-1">
        <Skeleton className="aspect-square w-full" />
      </div>
    </div>
  );
}
