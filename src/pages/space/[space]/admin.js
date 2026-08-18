"use client";

import Link from "next/link";
import { useRouter } from "next/router";

import { Loader2, Settings, Users } from "lucide-react";

import { useSpaceAdmin } from "@/hooks/space/useSpaceAdmin";

import BackButton from "@/components/ui/back-button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import SpaceMemberApplications from "@/components/space/SpaceMemberApplications";

import SpaceGeneralSettings from "@/components/space/SpaceGeneralSettings";
import SpaceMembersSettings from "@/components/space/SpaceMembersSettings";

export default function SpaceAdminPage() {
  const router = useRouter();

  const { space: slug, tab } = router.query;

  const { space, isLoading, error, accessDenied, isOwner } =
    useSpaceAdmin(slug);

  const activeTab = tab || "applications";

  function changeTab(value) {
    router.push(
      {
        pathname: `/space/${slug}/admin`,
        query:
          value === "applications"
            ? {}
            : {
                tab: value,
              },
      },
      undefined,
      {
        shallow: true,
      },
    );
  }

  /* ========================================
     LOADING
  ======================================== */

  if (isLoading) {
    return <PageLoader />;
  }

  /* ========================================
     ERROR
  ======================================== */

  if (error) {
    return (
      <div className="w-full px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Space not found</h1>

        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  /* ========================================
     ACCESS DENIED
  ======================================== */

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

  if (!space) {
    return null;
  }

  return (
    <div className="w-full">
      {/* ======================================
          FULL WIDTH HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold sm:text-lg">
              {space.name}
            </div>

            <div className="text-xs text-muted-foreground">Administration</div>
          </div>

          <Badge variant="secondary">{isOwner ? "Owner" : "Admin"}</Badge>
        </div>
      </header>

      {/* ======================================
          FULL WIDTH TABS
      ====================================== */}

      <Tabs value={activeTab} onValueChange={changeTab}>
        <div className="sticky top-14 z-30 overflow-x-auto border-b bg-background p-2 sm:top-16">
          <div className="flex min-w-full justify-center">
            <TabsList className="flex w-max">
              <TabsTrigger value="applications" className="gap-2">
                Applications
              </TabsTrigger>

              {isOwner && (
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {/* ======================================
            CONTENT
        ====================================== */}

        <main className="mx-auto w-full max-w-4xl p-2">
          <TabsContent value="applications">
            <SpaceMemberApplications space={space} />
          </TabsContent>

          {isOwner && (
            <TabsContent value="settings">
              <SpaceSettingsContent spaceSlug={space.slug} />
            </TabsContent>
          )}
        </main>
      </Tabs>
    </div>
  );
}

/* ============================================
   SETTINGS
============================================ */

function SpaceSettingsContent({ spaceSlug }) {
  return (
    <Tabs defaultValue="general">
      <div className="overflow-x-auto">
        <TabsList className="flex w-max">
          <TabsTrigger value="general">General</TabsTrigger>

          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="general">
        <SpaceGeneralSettings spaceSlug={spaceSlug} />
      </TabsContent>

      <TabsContent value="members">
        <SpaceMembersSettings spaceSlug={spaceSlug} />
      </TabsContent>
    </Tabs>
  );
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
