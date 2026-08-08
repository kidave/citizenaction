// components/feed/post/PostCardSkeleton.jsx

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostCardSkeleton({
  borderless = false,
  edgeToEdgeMobile = false,
}) {
  return (
    <Card
      className={`relative overflow-hidden ${
        edgeToEdgeMobile ? "rounded-none sm:rounded-[28px]" : "rounded-[28px]"
      } ${borderless ? "border-0 shadow-none" : ""}`}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 sm:p-6">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>

        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* ATTACHMENTS */}

      {/* MOBILE */}
      <div className="px-4 py-1 md:hidden">
        <div className="flex gap-1 overflow-hidden">
          {/* First carousel item */}
          <div className="flex w-1/2 shrink-0 flex-col gap-1">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>

          {/* Second carousel item */}
          <div className="flex w-1/2 shrink-0 flex-col gap-1">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="relative hidden md:block">
        <div className="relative px-8 py-2">
          <div className="flex gap-0 overflow-hidden">
            <div className="w-[260px] shrink-0 pl-6 pr-2">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            </div>

            <div className="w-[260px] shrink-0 pl-6 pr-2">
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            </div>
          </div>

          <Skeleton className="absolute left-1 top-1/2 z-20 ml-6 hidden h-8 w-8 -translate-y-1/2 rounded-full lg:block" />

          <Skeleton className="absolute right-1 top-1/2 z-20 mr-6 hidden h-8 w-8 -translate-y-1/2 rounded-full lg:block" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="sm:p-4">
        <div className="space-y-3">
          {/* TITLE */}
          <Skeleton className="h-6 w-2/3" />

          {/* CONTENT */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* METADATA */}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* TIMELINE */}
          <div className="pt-2">
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sm:p-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </Card>
  );
}
