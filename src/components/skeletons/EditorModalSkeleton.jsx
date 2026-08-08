// components/skeletons/EditorModalSkeleton.jsx

import { Skeleton } from "@/components/ui/skeleton";

export default function EditorModalSkeleton() {
  return (
    <div className="flex h-full w-full max-w-none flex-col overflow-hidden bg-background sm:h-[90vh] sm:max-w-2xl sm:rounded-xl sm:border">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />

          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      {/* MAIN */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          {/* POST TYPE */}
          <div className="mb-3 shrink-0">
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>

          {/* EDITOR */}
          <div className="flex min-h-0 flex-1 flex-col space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-md" />

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>

        {/* ATTACHMENTS */}
        <div className="shrink-0 border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex shrink-0 items-center justify-between border-t px-4 py-3">
        <Skeleton className="h-9 w-20 rounded-md" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
