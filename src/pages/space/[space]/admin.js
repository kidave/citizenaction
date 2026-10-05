"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, Users } from "lucide-react";

import { useSpaceAdmin } from "@/hooks/space/useSpaceAdmin";
import PageHeader from "@/components/layout/PageHeader";
import AdminSettingsShell from "@/components/layout/AdminSettingsShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import SpaceMemberApplications from "@/components/space/SpaceMemberApplications";
import SpaceGeneralSettings from "@/components/space/SpaceGeneralSettings";
import SpaceMembersSettings from "@/components/space/SpaceMembersSettings";

export default function SpaceAdminPage() {
  const router = useRouter();
  const { space: slug, tab } = router.query;
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
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <h1 className="mt-4 text-xl font-semibold">Access denied</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">You do not have permission to manage this Space.</p>
              <Link href={`/space/${slug}`} className="mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Back to Space</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!space) return null;

  const requestedTab = Array.isArray(tab) ? tab[0] : tab;
  const activeTab = requestedTab === "members" || requestedTab === "applications" ? requestedTab : "profile";
  const tabs = [
    { value: "profile", label: "Profile" },
    { value: "members", label: "Members" },
    { value: "applications", label: "Applications" },
  ].filter((item) => isOwner || item.value === "applications");

  let content;
  if (activeTab === "profile" && isOwner) {
    content = <SpaceGeneralSettings spaceSlug={space.slug} />;
  } else if (activeTab === "members" && isOwner) {
    content = (
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">Manage Space membership and roles.</p>
        </div>
        <SpaceMembersSettings spaceSlug={space.slug} />
      </section>
    );
  } else {
    content = (
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Applications</h2>
          <p className="text-sm text-muted-foreground">Review people requesting to join this Space.</p>
        </div>
        <SpaceMemberApplications space={space} />
      </section>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        items={[
          { label: "Home", href: "/" },
          { label: "Spaces", href: "/space" },
          { label: space.name, href: `/space/${space.slug}` },
          { label: "Administration" },
        ]}
      />
      <AdminSettingsShell
        title="Administration"
        description={`Manage ${space.name}`}
        badge={<Badge variant="secondary">{isOwner ? "Owner" : "Admin"}</Badge>}
        tabs={tabs}
      >
        {content}
      </AdminSettingsShell>
    </div>
  );
}

function PageLoader() {
  return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
}
