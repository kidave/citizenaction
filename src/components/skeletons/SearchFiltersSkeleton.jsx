// components/skeletons/SearchFiltersSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchFiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 p-2 bg-muted/30 rounded-lg">
      <Skeleton className="h-10 w-64" />   {/* search input */}
      <Skeleton className="h-10 w-48" />   {/* dropdown */}
      <Skeleton className="h-10 w-48" />   {/* dropdown */}
      <Skeleton className="h-5 w-40 ml-auto" /> {/* count */}
    </div>
  );
}
