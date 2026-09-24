// components/feed/post/PostCardSkeleton.jsx

import { Skeleton } from "@/components/ui/skeleton";

export default function PostCardSkeleton({
  borderless = false,
  edgeToEdgeMobile = false,
  forceExpanded = false,
  hasAttachments = true,
}) {
  return (
    <div
      className={`relative overflow-hidden border-b p-2 transition-all duration-300 ${
        borderless ? "border-0 shadow-none" : ""
      }`}
    >
      <div className="relative z-10 flex flex-col gap-4 p-2">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>

          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        </div>

        {/* =====================================================
            ATTACHMENTS

            Only render this when the real post has attachments.
        ===================================================== */}

        {hasAttachments && (
          <div
            className={`overflow-hidden rounded-3xl ${
              edgeToEdgeMobile ? "rounded-none sm:rounded-3xl" : ""
            }`}
          >
            {/* MOBILE */}

            <div className="md:hidden">
              <div className="flex gap-1 overflow-hidden">
                <div className="flex w-1/2 shrink-0 flex-col gap-1">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="aspect-square w-full rounded-xl" />
                </div>

                <div className="flex w-1/2 shrink-0 flex-col gap-1">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="aspect-square w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* DESKTOP */}

            <div className="relative hidden md:block">
              <div className="flex gap-0 overflow-hidden py-2">
                <div className="w-[260px] shrink-0 lg:w-[280px]">
                  <Skeleton className="h-[175px] w-full rounded-2xl" />
                </div>

                <div className="w-[260px] shrink-0 lg:w-[280px]">
                  <Skeleton className="h-[175px] w-full rounded-2xl" />
                </div>

                <div className="w-[260px] shrink-0 lg:w-[280px]">
                  <Skeleton className="h-[175px] w-full rounded-2xl" />
                </div>
              </div>

              <Skeleton className="absolute left-2 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full lg:block" />

              <Skeleton className="absolute right-2 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full lg:block" />
            </div>
          </div>
        )}

        {/* =====================================================
            CONTENT

            EXACTLY mirrors PostCard:

            <div className="sm:rounded-3xl sm:bg-muted sm:p-4">
        ===================================================== */}

        <div className="sm:rounded-3xl sm:bg-muted sm:p-4">
          <div className="space-y-4">
            {/* TITLE */}

            <div className="border-l-4 border-primary pl-4">
              <Skeleton className="h-6 w-2/3" />
            </div>

            {/* BODY */}

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* METADATA */}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>

            {/* TIMELINE */}

            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER

            In PostCard this is hidden in profileMode but visible
            on the normal single post.
        ===================================================== */}

        <div className="sm:rounded-3xl">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-8 w-24 rounded-md" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTRIBUTION

            Only exists on forceExpanded.
        ===================================================== */}

        {forceExpanded && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />

            <div className="rounded-2xl border p-4">
              <Skeleton className="h-4 w-40" />

              <div className="mt-3 space-y-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
