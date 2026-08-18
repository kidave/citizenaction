"use client";

import Link from "next/link";

import { ArrowRight, Clock3, UserPlus } from "lucide-react";

import { useSpaceApplications } from "@/hooks/space/useSpaceApplications";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SpaceMemberApplications({ space }) {
  const { pendingApplications, pendingCount, isLoading, error } =
    useSpaceApplications(space?.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-40 items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading applications...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">Unable to load applications</p>

          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (pendingCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </div>

          <h2 className="mt-4 font-semibold">No pending applications</h2>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            New membership applications will appear here when people request to
            join {space.name}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Pending applications</CardTitle>

            <CardDescription>
              Review people who want to become members of {space.name}.
            </CardDescription>
          </div>

          <Badge variant="secondary">{pendingCount}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {pendingApplications.map((application) => {
            const applicant = application.applicant;

            const name = applicant?.name || "Unknown user";

            const initials =
              name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "U";

            return (
              <Link
                key={application.id}
                href={`/space/${space.slug}/admin/application/member/${application.id}`}
                className="block hover:bg-muted/40"
              >
                <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={applicant?.avatar_url || undefined} />

                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{name}</div>

                    {applicant?.username && (
                      <div className="truncate text-sm text-muted-foreground">
                        @{applicant.username}
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatDate(application.created_at)}
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="hidden shrink-0 sm:inline-flex"
                  >
                    Pending
                  </Badge>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
