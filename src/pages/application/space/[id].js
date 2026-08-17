"use client";

import { useEffect, useState } from "react";

import Head from "next/head";

import Link from "next/link";

import { useRouter } from "next/router";

import { CheckCircle2, Clock3, XCircle, Building2 } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

/* ========================================
   PAGE
======================================== */

export default function SpaceApplicationPage() {
  const router = useRouter();

  const { id } = router.query;

  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  const [application, setApplication] = useState(null);

  /* ======================================
     FETCH
  ====================================== */

  useEffect(() => {
    if (!router.isReady || !user || !id) {
      return;
    }

    async function loadApplication() {
      setLoading(true);

      const { data, error } = await supabase
        .from("space_application")
        .select(
          `
          *,
          official_category:category_id (
            id,
            name,
            slug
          )
        `,
        )
        .eq("id", id)
        .eq("applicant_user_id", user.id)
        .single();

      if (error || !data) {
        router.replace("/404");

        return;
      }

      setApplication(data);

      setLoading(false);
    }

    loadApplication();
  }, [id, user, router, router.isReady]);

  /* ======================================
     AUTH LOADING
  ====================================== */

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  /* ======================================
     NOT LOGGED IN
  ====================================== */

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-[32px] border-4">
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="text-2xl">Sign in required</h1>

            <p className="text-muted-foreground">
              You need to sign in to view your application.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ======================================
     PAGE LOADING
  ====================================== */

  if (loading || !application) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  /* ======================================
     STATUS
  ====================================== */

  const status = application.status;

  /* ======================================
     PAGE
  ====================================== */

  return (
    <>
      <Head>
        <title>Space Application</title>
      </Head>

      <div className="min-h-dvh bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* ==================================
              BACK
          ================================== */}

          <BackButton label="Back" />

          {/* ==================================
              HERO
          ================================== */}

          <Card className="overflow-hidden rounded-[32px] border-4">
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl tracking-tight">
                    Application Submitted
                  </h1>

                  <p className="mt-2 text-muted-foreground">
                    {status === "approved"
                      ? "Your Space application has been approved."
                      : status === "rejected"
                        ? "Your Space application was not approved."
                        : "Your application is currently under review."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ==================================
              STATUS CARD
          ================================== */}

          <Card className="rounded-[32px] border-4">
            <CardContent className="space-y-8 p-8">
              {/* ==============================
                  STATUS
              ============================== */}

              <ApplicationStatus status={status} />

              {/* ==============================
                  APPLICATION REFERENCE
              ============================== */}

              <div>
                <div className="text-sm text-muted-foreground">
                  Application Reference
                </div>

                <div className="mt-1 text-3xl tracking-tight">
                  #{application.id.slice(0, 8).toUpperCase()}
                </div>
              </div>

              {/* ==============================
                  DETAILS
              ============================== */}

              <div className="grid gap-6 md:grid-cols-2">
                <InfoItem
                  label="Organization"
                  value={application.proposed_name}
                />

                <InfoItem
                  label="Requested URL"
                  value={`/${application.proposed_slug}`}
                />

                {application.category && (
                  <InfoItem
                    label="What you told us you stand for"
                    value={application.category}
                  />
                )}

                {application.official_category && (
                  <InfoItem
                    label="Official Citizen Action category"
                    value={application.official_category.name}
                  />
                )}

                <InfoItem
                  label="Submitted"
                  value={new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(application.created_at))}
                />
              </div>

              {/* ==============================
                  MESSAGE
              ============================== */}

              {status === "pending" && (
                <div className="rounded-3xl border bg-muted/40 p-5">
                  <div className="font-semibold">What happens next?</div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    Our team reviews applications to ensure spaces represent
                    genuine civic initiatives, organizations, or community
                    efforts.
                  </div>
                </div>
              )}

              {status === "approved" && (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/space/${application.proposed_slug}`}
                    className="shadow-xs inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Visit your Space
                  </Link>
                </div>
              )}

              {status === "rejected" && application.admin_notes && (
                <div className="rounded-3xl border bg-muted/40 p-5">
                  <div className="font-semibold">Review notes</div>

                  <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {application.admin_notes}
                  </div>
                </div>
              )}

              {/* ==============================
                  CTA
              ============================== */}

              {status !== "approved" && (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="shadow-xs inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Explore Feed
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ========================================
   APPLICATION STATUS
======================================== */

function ApplicationStatus({ status }) {
  if (status === "approved") {
    return (
      <Alert variant="success" className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

        <div className="space-y-1">
          <AlertTitle>Application approved</AlertTitle>

          <AlertDescription>
            Your Space has been approved. You can now visit your Space and start
            using it.
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (status === "rejected") {
    return (
      <Alert variant="destructive" className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

        <div className="space-y-1">
          <AlertTitle>Application rejected</AlertTitle>

          <AlertDescription>
            Your application was not approved by the Citizen Action team.
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <Alert variant="warning" className="flex items-start gap-3">
      <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />

      <div className="space-y-1">
        <AlertTitle>Pending review</AlertTitle>

        <AlertDescription>
          Your application has been submitted and is waiting for review by the
          Citizen Action team.
        </AlertDescription>
      </div>
    </Alert>
  );
}

/* ========================================
   INFO ITEM
======================================== */

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
