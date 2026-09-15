"use client";

import Link from "next/link";
import { useRouter } from "next/router";

import { Loader2, Users } from "lucide-react";
import { useSpaceAdmin } from "@/hooks/space/useSpaceAdmin";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SpaceMemberApplications from "@/components/space/SpaceMemberApplications";
import SpaceGeneralSettings from "@/components/space/SpaceGeneralSettings";
import SpaceMembersSettings from "@/components/space/SpaceMembersSettings";

export default function SpaceAdminPage() {
  const router = useRouter();
  const { space: slug } = router.query;
  const { space, isLoading, error, accessDenied, isOwner } = useSpaceAdmin(slug);

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="w-full px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Space not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="w-full px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <h1 className="mt-4 text-xl font-semibold">Access denied</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                You do not have permission to manage this Space.
              </p>
              <Link
                href={`/space/${slug}`}
                className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Back to Space
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!space) return null;

  return (
    <div className="w-full">
      <PageHeader
        items={[
          { label: "Home", href: "/" },
          { label: space.name, href: `/space/${space.slug}` },
          { label: "Administration" },
        ]}
      />

      <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center justify-end">
          <Badge variant="secondary">{isOwner ? "Owner" : "Admin"}</Badge>
        </div>

        {isOwner && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Space settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage the identity and public information for this Space.
              </p>
            </div>
            <SpaceGeneralSettings spaceSlug={space.slug} />
          </section>
        )}

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Member applications</h2>
            <p className="text-sm text-muted-foreground">
              Review people requesting to join this Space.
            </p>
          </div>
          <SpaceMemberApplications space={space} />
        </section>

        {isOwner && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Members</h2>
              <p className="text-sm text-muted-foreground">
                Manage Space membership and roles.
              </p>
            </div>
            <SpaceMembersSettings spaceSlug={space.slug} />
          </section>
        )}
      </main>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
