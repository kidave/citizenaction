// components/skeletons/CreatePostTriggerSkeleton.jsx

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CreatePostTriggerSkeleton() {
  return (
    <div className="sticky top-0 z-30">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-2 sm:px-6">
        {/* AVATAR */}
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

        {/* CREATE TRIGGER */}
        <div className="flex min-w-0 flex-1">
          <Card className="flex w-full items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3">
            {/* TEXT */}
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>

            {/* PLUS */}
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
