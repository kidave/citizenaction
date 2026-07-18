"use client";

import { useEffect, useState } from "react";

import Head from "next/head";

import Link from "next/link";

import { useRouter } from "next/router";

import { CheckCircle2, Clock3, XCircle, Building2 } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { useAuth } from "@/context/AuthContext";

import BackButton from "@/components/ui/back-button";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

/* ========================================
   STATUS CONFIG
======================================== */

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock3,
    className: "bg-amber-100 text-amber-900 border-amber-300",
  },

  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-900 border-green-300",
  },

  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-900 border-red-300",
  },
};

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
        .select("*")
        .eq("id", id)
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
            <h1 className="text-2xl font-black">Sign in required</h1>

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

  const status = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;

  const StatusIcon = status.icon;

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

          <Card className="overflow-hidden rounded-[32px] border-4 bg-gradient-to-br from-primary/10 via-background to-pink-100">
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border-2 bg-background px-4 py-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  Civic Space Application
                </div>

                <div>
                  <h1 className="text-4xl font-black tracking-tight">
                    Application Submitted
                  </h1>

                  <p className="mt-2 text-muted-foreground">
                    Your application is currently under review.
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
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Application Reference
                  </div>

                  <div className="mt-1 text-3xl font-black tracking-tight">
                    #{application.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                <Badge
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm ${status.className} `}
                >
                  <StatusIcon className="h-4 w-4" />

                  {status.label}
                </Badge>
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
                  <InfoItem label="Category" value={application.category} />
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

              <div className="rounded-3xl border-2 bg-muted/40 p-5">
                <div className="font-semibold">What happens next?</div>

                <div className="mt-2 text-sm text-muted-foreground">
                  Our team reviews applications to ensure spaces represent
                  genuine civic initiatives, organizations, or community
                  efforts.
                </div>
              </div>

              {/* ==============================
                  CTA
              ============================== */}

              <div className="flex flex-wrap gap-3">
                <Link href="/">
                  <div className="rounded-2xl border-2 bg-background px-5 py-3 font-medium transition hover:-translate-y-0.5">
                    Explore Feed
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
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
