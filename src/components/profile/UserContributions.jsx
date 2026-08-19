"use client";

import Link from "next/link";
import { MessageSquare, ArrowUpRight } from "lucide-react";

import { useUserContributions } from "@/hooks/user/useUserContributions";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ContributionSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-3 h-12 w-full" />
      <Skeleton className="mt-3 h-3 w-32" />
    </Card>
  );
}

export default function UserContributions({ userId }) {
  const {
    data: contributions = [],
    isLoading,
    error,
  } = useUserContributions(userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <ContributionSkeleton />
        <ContributionSkeleton />
        <ContributionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-sm text-destructive">
          Unable to load contributions.
        </p>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="font-semibold">No contributions yet</h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Contributions made by this user will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-2 p-2">
      {contributions.map((contribution) => (
        <Link
          key={contribution.id}
          href={`/post/${contribution.post_slug}`}
          className="block"
        >
          <Card className="group p-4 transition-colors hover:bg-muted/50">
            {/* POST */}

            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">
                {contribution.post_title}
              </p>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </div>

            {/* CONTRIBUTION */}

            {contribution.content && (
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {contribution.content}
              </p>
            )}

            {/* SPACE */}

            {contribution.space_name && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                {contribution.space_logo && (
                  <img
                    src={contribution.space_logo}
                    alt=""
                    className="h-5 w-5 rounded-md object-cover"
                  />
                )}

                <span>{contribution.space_name}</span>
              </div>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
