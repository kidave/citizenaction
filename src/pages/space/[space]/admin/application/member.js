"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { ArrowRight, Clock3, Loader2, UserPlus, Users } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SpaceMemberApplicationsPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const { space: slug } = router.query;

  const [space, setSpace] = useState(null);

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [accessDenied, setAccessDenied] = useState(false);

  /* ========================================
     LOAD
  ======================================== */

  useEffect(() => {
    if (!router.isReady || !slug || authLoading || !user?.id) {
      return;
    }

    async function loadApplications() {
      setLoading(true);
      setAccessDenied(false);

      /* ======================================
         SPACE
      ====================================== */

      const { data: spaceData, error: spaceError } = await supabase
        .from("space")
        .select(
          `
          id,
          name,
          slug,
          owner_user_id,
          is_active
        `,
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (spaceError || !spaceData) {
        console.error("[MEMBER APPLICATIONS] Space error:", spaceError);

        setLoading(false);

        return;
      }

      /* ======================================
         PERMISSION
      ====================================== */

      const isOwner = user.id === spaceData.owner_user_id;

      let isAdmin = false;

      if (!isOwner) {
        const { data: membership, error: membershipError } = await supabase
          .from("space_member")
          .select("role, is_active, is_suspended")
          .eq("space_id", spaceData.id)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .eq("is_suspended", false)
          .maybeSingle();

        if (membershipError) {
          console.error(
            "[MEMBER APPLICATIONS] Membership error:",
            membershipError,
          );

          setLoading(false);

          return;
        }

        isAdmin = membership?.role === "admin";
      }

      if (!isOwner && !isAdmin) {
        setAccessDenied(true);
        setLoading(false);

        return;
      }

      setSpace(spaceData);

      /* ======================================
         PENDING APPLICATIONS
      ====================================== */

      const { data: applicationData, error: applicationError } = await supabase
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
        .eq("space_id", spaceData.id)
        .eq("status", "pending")
        .order("created_at", {
          ascending: true,
        });

      if (applicationError) {
        console.error(
          "[MEMBER APPLICATIONS] Application error:",
          applicationError,
        );

        setLoading(false);

        return;
      }

      setApplications(applicationData || []);

      setLoading(false);
    }

    loadApplications();
  }, [router.isReady, slug, user?.id, authLoading]);

  /* ========================================
     AUTH / PAGE LOADING
  ======================================== */

  if (authLoading || loading) {
    return <PageLoader />;
  }

  /* ========================================
     ACCESS DENIED
  ======================================== */

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />

            <h1 className="mt-4 text-xl font-semibold">Access denied</h1>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              You do not have permission to review membership applications for
              this Space.
            </p>

            <Link
              href={`/space/${slug}`}
              className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Back to Space
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ========================================
     SPACE NOT FOUND
  ======================================== */

  if (!space) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Space not found</h1>

        <p className="mt-2 text-muted-foreground">
          The requested Space does not exist.
        </p>
      </div>
    );
  }

  /* ========================================
     PAGE
  ======================================== */

  return (
    <div className="mx-auto max-w-3xl">
      {/* ======================================
          HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold sm:text-lg">
              Member applications
            </div>

            <div className="truncate text-xs text-muted-foreground">
              {space.name}
            </div>
          </div>

          {applications.length > 0 && (
            <Badge variant="secondary">{applications.length}</Badge>
          )}
        </div>
      </header>

      {/* ======================================
          CONTENT
      ====================================== */}

      <main className="space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Membership applications
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Review people who want to become members of {space.name}.
          </p>
        </div>

        {/* ====================================
            APPLICATIONS
        ==================================== */}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              </div>

              <h2 className="mt-4 font-semibold">No pending applications</h2>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                New membership applications will appear here when people request
                to join this Space.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pending applications</CardTitle>

              <CardDescription>
                Applications are shown from oldest to newest.
              </CardDescription>
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
                      <div className="flex items-center gap-4 px-6 py-4">
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
                          <div className="truncate font-medium">
                            {applicantName}
                          </div>

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
        )}
      </main>
    </div>
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

/* ============================================
   LOADER
============================================ */

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
