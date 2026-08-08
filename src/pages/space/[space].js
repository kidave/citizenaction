"use client";

import { useRouter } from "next/router";
import Image from "next/image";

import BackButton from "@/components/ui/back-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import PageHeaderSkeleton from "@/components/skeletons/PageHeaderSkeleton";
import MetaCardsSkeleton from "@/components/skeletons/MetaCardsSkeleton";

import { useSpaces } from "@/hooks/space/useSpaces";

import MembersTab from "@/components/tabs/MembersTab";
import ActivityTab from "@/components/tabs/ActivityTab";
import OverviewTab from "@/components/tabs/OverviewTab";

export default function SpacePage() {
  const router = useRouter();

  const { space: slug, tab } = router.query;

  const {
    data: space,
    isLoading,
    error,
  } = useSpaces({
    slug,
    enabled: !!slug,
  });

  const activeTab = tab || "overview";

  const base = `/space/${slug}`;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        {" "}
        <PageHeaderSkeleton /> <MetaCardsSkeleton />{" "}
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center">
        {" "}
        <h2 className="text-xl font-semibold">Space not found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested space does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* =====================================================
FIXED SPACE HEADER
===================================================== */}

      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16">
          <BackButton />

          <h1 className="truncate font-semibold sm:text-lg">{space.name}</h1>
        </div>
      </div>
      {/* =====================================================
      SPACE INFORMATION
  ===================================================== */}
      <header className="p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          {space.logo_url && (
            <Image
              src={space.logo_url}
              alt={space.name}
              width={64}
              height={64}
              className="h-14 w-14 shrink-0 rounded-lg border bg-muted object-cover sm:h-16 sm:w-16"
            />
          )}

          <div className="min-w-0 flex-1">
            {space.description && (
              <p className="text-sm text-muted-foreground lg:text-base">
                {space.description}
              </p>
            )}
          </div>
        </div>
      </header>
      {/* =====================================================
      STICKY TABS
  ===================================================== */}
      <div className="sticky top-14 z-30 pt-2 sm:top-16">
        <Tabs value={activeTab}>
          <TabsList className="mx-6 flex w-auto">
            <TabsTrigger
              value="overview"
              onClick={() => router.push(base)}
              className="flex-1"
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="members"
              onClick={() => router.push(`${base}?tab=members`)}
              className="flex-1"
            >
              Members
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              onClick={() => router.push(`${base}?tab=activity`)}
              className="flex-1"
            >
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* =====================================================
      CONTENT
  ===================================================== */}
      <div className="space-y-4 px-4 py-4">
        <Tabs value={activeTab}>
          <TabsContent value="overview">
            <OverviewTab space={space} />
          </TabsContent>

          <TabsContent value="members">
            <MembersTab spaceId={space.id} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab spaceId={space.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
