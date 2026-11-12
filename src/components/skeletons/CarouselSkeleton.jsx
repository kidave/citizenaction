// components/skeletons/CarouselSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CarouselSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-lg" />
      ))}
    </div>
  );
}
