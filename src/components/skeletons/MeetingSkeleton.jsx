"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>

      <CardContent className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>

            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}