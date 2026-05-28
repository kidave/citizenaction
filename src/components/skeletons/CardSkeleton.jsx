// components/skeletons/CardSkeleton.jsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* cover */}
      <Skeleton className="h-48 w-full" />

      <CardContent className="space-y-3 pt-6">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>

        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>

      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}
