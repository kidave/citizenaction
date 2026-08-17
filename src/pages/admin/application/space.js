"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, XCircle } from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SpaceApplicationAdminListPage() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (authLoading || !user) return;

    async function loadApplications() {
      setLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        window.location.href = "/404";
        return;
      }

      const { data, error } = await supabase
        .from("space_application")
        .select(
          `
          id,
          proposed_name,
          proposed_slug,
          category,
          category_id,
          status,
          created_at,
          reviewed_at,
          official_category:category_id (
            id,
            name,
            slug
          )
        `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setApplications([]);
      } else {
        setApplications(data || []);
      }

      setLoading(false);
    }

    loadApplications();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <PageLoader />;
  }

  const pendingApplications = applications.filter(
    (application) => application.status === "pending",
  );

  const reviewedApplications = applications.filter(
    (application) => application.status !== "pending",
  );

  return (
    <>
      <Head>
        <title>Space Applications</title>
      </Head>

      <div className="min-h-dvh bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* ========================================
              HEADER
          ======================================== */}

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Space Applications
            </h1>

            <p className="mt-1 text-muted-foreground">
              Review and approve applications for new Spaces.
            </p>
          </div>

          {/* ========================================
              PENDING
          ======================================== */}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Pending applications</h2>

                <p className="text-sm text-muted-foreground">
                  Applications waiting for review.
                </p>
              </div>

              <Badge variant="outline">{pendingApplications.length}</Badge>
            </div>

            {pendingApplications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No pending Space applications.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingApplications.map((application) => (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ========================================
              REVIEWED
          ======================================== */}

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Reviewed applications</h2>

              <p className="text-sm text-muted-foreground">
                Previously approved or rejected applications.
              </p>
            </div>

            {reviewedApplications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No reviewed applications yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviewedApplications.map((application) => (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

/* ========================================
   APPLICATION ROW
======================================== */

function ApplicationRow({ application }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{application.proposed_name}</h3>

            <StatusBadge status={application.status} />
          </div>

          <p className="text-sm text-muted-foreground">
            /{application.proposed_slug}
          </p>

          {application.category && (
            <p className="line-clamp-2 text-sm">
              <span className="text-muted-foreground">Applicant says:</span>{" "}
              {application.category}
            </p>
          )}

          {application.official_category && (
            <p className="text-sm">
              <span className="text-muted-foreground">Official category:</span>{" "}
              {application.official_category.name}
            </p>
          )}
        </div>

        <Button asChild className="shrink-0">
          <Link href={`/admin/application/space/${application.id}`}>
            Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* ========================================
   STATUS
======================================== */

function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </Badge>
  );
}

/* ========================================
   LOADER
======================================== */

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
