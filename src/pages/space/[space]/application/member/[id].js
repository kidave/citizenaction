"use client";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle2, Clock3, XCircle, Users } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useSpaceMemberApplication } from "@/hooks/space/useSpaceMemberApplication";
import ApplicationTopbar from "@/components/application/ApplicationTopbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SpaceMemberApplicationStatusPage() {
  const router = useRouter();
  const { space: spaceSlug, id } = router.query;
  const { user, loading: authLoading } = useAuth();

  const {
    data: application,
    isLoading: applicationLoading,
    isError,
  } = useSpaceMemberApplication({
    applicationId: id,
    userId: user?.id,
    enabled: router.isReady && !!user,
  });

  const loading = authLoading || applicationLoading;
  const space = application?.space;

  if (loading) return <PageLoader />;

  if (isError || !application) {
    toast.error("Application not found.");
    router.replace(`/space/${spaceSlug}`);
    return null;
  }

  if (!space || space.slug !== spaceSlug) {
    router.replace(`/space/${spaceSlug}`);
    return null;
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Membership Application · {space.name}</title>
      </Head>

      <ApplicationTopbar
        items={[
          { label: "Home", href: "/" },
          { label: "Spaces", href: "/space" },
          { label: space.name, href: `/space/${space.slug}` },
          { label: "Membership Application" },
        ]}
        title="Membership Application"
        backHref={`/space/${space.slug}`}
      />

      <div className="min-h-dvh bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                  {space.logo_url ? (
                    <img
                      src={space.logo_url}
                      alt={`${space.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold">{space.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Membership application
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ApplicationStatus status={application.status} />

          <Card>
            <CardHeader>
              <CardTitle>Your application</CardTitle>
              <CardDescription>
                Submitted {formatDate(application.created_at)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="mb-2 text-sm font-medium">Your message</div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {application.message}
                </p>
              </div>

              {application.status === "rejected" && application.admin_notes && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="mb-2 text-sm font-medium text-destructive">
                    Review note
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {application.admin_notes}
                  </p>
                </div>
              )}

              {application.status === "approved" && (
                <Button asChild>
                  <Link href={`/space/${space.slug}`}>Visit Space</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ApplicationStatus({ status }) {
  if (status === "approved") {
    return (
      <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
        <CheckCircle2 />
        <AlertTitle>Application approved</AlertTitle>
        <AlertDescription className="text-green-700/90 dark:text-green-400/90">
          Your membership application has been approved. You can now participate
          in this Space.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "rejected") {
    return (
      <Alert variant="destructive">
        <XCircle />
        <AlertTitle>Application rejected</AlertTitle>
        <AlertDescription>
          Your membership application was not approved by the Space administrators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
      <Clock3 />
      <AlertTitle>Application under review</AlertTitle>
      <AlertDescription className="text-amber-700/90 dark:text-amber-400/90">
        Your application has been submitted and is waiting for review by the
        Space administrators.
      </AlertDescription>
    </Alert>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
    </div>
  );
}
