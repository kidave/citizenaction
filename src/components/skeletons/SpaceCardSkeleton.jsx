import { Skeleton } from "@/components/ui/skeleton";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function SpaceCardSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          {/* ======================================
                COVER
            ====================================== */}

          <div className="relative h-48 overflow-hidden">
            <Skeleton className="h-full w-full" />

            {/* Logo placeholder */}
            <Skeleton className="absolute bottom-4 left-4 h-12 w-12 rounded-md" />
          </div>

          {/* ======================================
                CONTENT
            ====================================== */}

          <CardContent className="pt-6">
            {/* Space name */}

            <Skeleton className="h-6 w-40" />

            {/* Description */}

            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />

              <Skeleton className="h-4 w-4/5" />

              <Skeleton className="h-4 w-3/5" />
            </div>
          </CardContent>

          {/* ======================================
                BUTTON
            ====================================== */}

          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
