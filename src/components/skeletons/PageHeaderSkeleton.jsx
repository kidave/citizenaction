// components/skeletons/PageHeaderSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";

export default function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-md" />
        <Skeleton className="h-8 w-64" />
      </div>

      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
