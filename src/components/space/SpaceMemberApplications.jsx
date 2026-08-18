"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { ArrowRight, Clock3, UserPlus } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SpaceMemberApplications({
  space,
  onPendingCountChange,
}) {
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!space?.id) {
      return;
    }

    async function loadApplications() {
      setLoading(true);
      setError(null);

      const { data, error: applicationError } = await supabase
        .from("space_member_application")
        .select(
          `
          id,
          space_id,
          applicant_user_id,
          message,
          status,
          created_at,
          applicant:applicant_user_id (
            user_id,
            name,
            username,
            avatar_url
          )
        `,
        )
        .eq("space_id", space.id)
        .eq("status", "pending")
        .order("created_at", {
          ascending: true,
        });

      if (applicationError) {
        console.error(
          "[MEMBER APPLICATIONS] Application error:",
          applicationError,
        );

        setError(applicationError.message || "Unable to load applications.");

        setApplications([]);

        if (onPendingCountChange) {
          onPendingCountChange(0);
        }

        setLoading(false);

        return;
      }

      const result = data || [];

      setApplications(result);

      if (onPendingCountChange) {
        onPendingCountChange(result.length);
      }

      setLoading(false);
    }

    loadApplications();
  }, [space?.id, onPendingCountChange]);

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
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

  /* ========================================
     ERROR
  ======================================== */

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

  /* ========================================
     EMPTY
  ======================================== */

  if (applications.length === 0) {
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

  /* ========================================
     APPLICATION LIST
  ======================================== */

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

          <Badge variant="secondary">{applications.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {applications.map((application) => {
            const applicant = application.applicant;

            const applicantName = applicant?.name || "Unknown user";

            const applicantUsername = applicant?.username;

            const initials = applicantName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={application.id}
                href={`/space/${space.slug}/admin/application/member/${application.id}`}
                className="block transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
                  {/* AVATAR */}

                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage
                      src={applicant?.avatar_url || undefined}
                      alt={applicantName}
                    />

                    <AvatarFallback>{initials || "U"}</AvatarFallback>
                  </Avatar>

                  {/* USER */}

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{applicantName}</div>

                    {applicantUsername && (
                      <div className="truncate text-sm text-muted-foreground">
                        @{applicantUsername}
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatDate(application.created_at)}
                    </div>
                  </div>

                  {/* STATUS */}

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

/* ============================================
   DATE
============================================ */

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
